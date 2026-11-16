'use strict';
/* ============================================================
   圈圈冥想 · Circle Calm
   玩家(圆)与漂浮的几何"杂念"：圆形 / 三角 / 方块 / 五边 / 六边巨核
   没有失败与终点 —— 杂念按"生命游戏"的规则自行生灭演变：
   孤独或拥挤会消散，恰好相聚会长出新的；玩家不攻击，
   只用 E 绽放播下新芽、F 归心收拢一片，其余交给世界自己。
   一切随冥想呼吸节律（吸气4s·屏息4s·呼气6s）同相起伏，
   配乐亦随呼吸涨落，引导玩的人放松。
   技能：流步Q / 绽放E / 止水空格 / 归心F
   ============================================================ */

/* ---------------- 错误捕获（供自动化测试） ---------------- */
window.__errors = [];

/* ---------------- 工具 ---------------- */
const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
function hash(n) { const s = Math.sin(n) * 43758.5453; return s - Math.floor(s); }

/* ---------------- DOM / 画布 ---------------- */
const $ = (id) => document.getElementById(id);
const cvs = $('game'), ctx = cvs.getContext('2d');
const ui = {
  hud: $('hud'), menu: $('menu'),
  vignette: $('vignette'), breathCue: $('breath-cue'), breathDot: $('breath-dot'), breathText: $('breath-text'),
  timeNum: $('time-num'), waveNum: $('wave-num'), musicVol: $('music-vol'),
  sumOv: $('summary'), sumTime: $('sum-time'), sumGen: $('sum-gen'),
  sumSeeds: $('sum-seeds'), sumKills: $('sum-kills'), sumHoles: $('sum-holes'),
  banner: $('banner'),
  skDash: $('skill-dash'), skNova: $('skill-nova'), skField: $('skill-field'), skHole: $('skill-hole'),
  btnStart: $('btn-start'),
};
let W = 0, H = 0, DPR = 1, lastDPR = -1, worldDirty = true;
// 触屏判定：决定网格密度、控件尺寸、是否需要触摸瞄准环与按钮操作
const COARSE = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
document.documentElement.classList.toggle('coarse', COARSE);

// 棋盘格边长随屏幕短边收小：窄屏（手机竖屏）也要有足够的格子演化出图案
function pickCell() {
  const m = Math.min(W, H);
  return m <= 380 ? 18 : m <= 560 ? 20 : 24;
}
function resize() {
  DPR = clamp(window.devicePixelRatio || 1, 0.75, 2);
  // 以可视视口为准：iOS 地址栏 / 桌面浏览器缩放都反映在这里
  const vv = window.visualViewport;
  const w = Math.max(240, Math.round((vv && vv.width) || window.innerWidth));
  const h = Math.max(240, Math.round((vv && vv.height) || window.innerHeight));
  if (w === W && h === H && DPR === lastDPR) return false;   // 地址栏伸缩等无实质变化时不重建棋盘
  const changed = w !== W || h !== H;
  W = w; H = h; lastDPR = DPR;
  cvs.width = Math.round(W * DPR); cvs.height = Math.round(H * DPR);
  // CSS 尺寸必须显式等于逻辑尺寸：canvas 是替换元素，inset:0 不会拉伸它，
  // 只按内在尺寸（= 位图像素）排版，高分屏上整幅画面会放大 DPR 倍。
  cvs.style.width = W + 'px'; cvs.style.height = H + 'px';
  // UI 层统一以「可视视口」为基准（body 高度 = --vh），绕开 iOS 地址栏遮挡 fixed 元素的问题
  const rs = document.documentElement.style;
  rs.setProperty('--vh', H + 'px');
  rs.setProperty('--vw', W + 'px');
  // 只标脏：syncWorld 依赖 LIFE / WORLD / enemies，脚本求值期间还不存在，
  // 由 viewportChanged（事件路径）与 frame()（rAF 路径）各自接手
  if (changed) worldDirty = true;
  return changed;
}
// 视口变化：resize / 转向 / 全屏 / 浏览器缩放 / 分屏都会走到这里
// 不依赖 rAF（页面隐藏或转向动画期间 rAF 可能被暂停），当场把画幅与棋盘对齐
function viewportChanged() { if (resize() && typeof syncWorld === 'function') { worldDirty = false; syncWorld(); } }
window.addEventListener('resize', viewportChanged);
// 转向：安卓会改写 innerWidth/Height，iOS 需要等一帧动画落定
window.addEventListener('orientationchange', () => { viewportChanged(); setTimeout(viewportChanged, 150); setTimeout(viewportChanged, 500); });
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', viewportChanged);
  window.visualViewport.addEventListener('scroll', viewportChanged);
}
if (window.matchMedia) {
  const mq = window.matchMedia('(orientation: portrait)');
  if (mq.addEventListener) mq.addEventListener('change', () => setTimeout(viewportChanged, 200));
  else if (mq.addListener) mq.addListener(() => setTimeout(viewportChanged, 200));
}
// 看门狗：rAF 在页面隐藏 / 后台 / 部分 webview 里会被暂停，resize 事件也可能不来；
// 500ms 轮询一次，无变化时 resize() 直接返回 false，几乎零成本
setInterval(viewportChanged, 500);
document.addEventListener('fullscreenchange', () => { viewportChanged(); setTimeout(viewportChanged, 120); syncTools(); });
document.addEventListener('webkitfullscreenchange', () => { viewportChanged(); setTimeout(viewportChanged, 120); });
resize();

/* ---------------- 世界常量 ---------------- */
const WORLD = { w: 1280, h: 720 };    // 棋盘 = 整个窗口（syncWorld 随窗口尺寸刷新）

/* ---------------- 音效（WebAudio 合成，无外部资源） ----------------
   iOS Safari 的坑：① AudioContext 必须在用户手势里创建/恢复，否则永远 suspended；
   ② 侧边静音键会把网页音频整条静音。这里两手都做：任何首次触摸都解锁，
   并挂一个静音的 <audio> 循环占住 iOS 音频会话，同时在检测到手势后仍未运行时给出提示。 */
const IS_IOS = /iP(hone|ad|od)/.test(navigator.platform || '') ||
               (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent || ''));
function silentWavUrl() {
  const sr = 8000, n = sr, size = 44 + n * 2;
  const b = new Uint8Array(size), dv = new DataView(b.buffer);
  const put = (o, s) => { for (let i = 0; i < s.length; i++) b[o + i] = s.charCodeAt(i); };
  put(0, 'RIFF'); dv.setUint32(4, size - 8, true); put(8, 'WAVEfmt ');
  dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
  dv.setUint32(24, sr, true); dv.setUint32(28, sr * 2, true);
  dv.setUint16(32, 2, true); dv.setUint16(34, 16, true); put(36, 'data'); dv.setUint32(40, n * 2, true);
  let s = ''; for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return 'data:audio/wav;base64,' + btoa(s);
}
const Sfx = {
  ctx: null, gain: null, nbuf: null, muted: false, el: null, unlocked: false, hintShown: false,
  // 静音循环：占住 iOS 的媒体会话，避免 WebAudio 被系统当作"未激活"而静音
  holdSession() {
    try {
      if (!this.el) {
        this.el = new Audio(silentWavUrl());
        this.el.loop = true; this.el.volume = 1; this.el.preload = 'auto';
        this.el.setAttribute('playsinline', '');
      }
      if (this.el.paused) { const p = this.el.play(); if (p && p.catch) p.catch(() => {}); }
    } catch (e) { /* 忽略 */ }
  },
  ensure() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.gain = this.ctx.createGain();
        this.gain.gain.value = 0.5;
        this.gain.connect(this.ctx.destination);
        const len = this.ctx.sampleRate;
        this.nbuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const d = this.nbuf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { /* 忽略音频不可用 */ }
    }
    if (!this.ctx) return;
    this.holdSession();
    if (this.ctx.state !== 'running') {
      try { const p = this.ctx.resume(); if (p && p.then) p.then(() => this.check(), () => this.check()); } catch (e) { /* 忽略 */ }
    }
    if (this.ctx.state === 'running') this.unlocked = true;
    else this.check();
  },
  // 手势后仍未 running：iOS 上基本只剩"侧边静音键"这一种解释，明确告诉用户
  check() {
    if (this.unlocked || this.hintShown || !this.ctx) return;
    if (this.ctx.state === 'running') { this.unlocked = true; return; }
    if (!IS_IOS) return;
    this.hintShown = true;
    showBanner('iPhone 侧边静音键会屏蔽网页声音，请关闭后点一下屏幕', '#e89aa8', true);
  },
  tone(o, dest) {
    // ctx 未 running 时不排程：否则这些音源会在恢复瞬间一起放出（iOS 上尤其明显）
    if (!this.ctx || this.muted || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime + (o.delay || 0);
    const dur = o.dur || 0.2;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(Math.max(1, o.f0 || 440), t);
    if (o.f1) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(o.vol || 0.2, t + (o.a || 0.006));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(dest || this.gain);
    osc.start(t); osc.stop(t + dur + 0.05);
  },
  noise(o) {
    // ctx 未 running 时不排程：否则这些音源会在恢复瞬间一起放出（iOS 上尤其明显）
    if (!this.ctx || this.muted || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime + (o.delay || 0);
    const dur = o.dur || 0.2;
    const src = this.ctx.createBufferSource();
    src.buffer = this.nbuf; src.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = o.ftype || 'bandpass';
    f.frequency.setValueAtTime(Math.max(10, o.f0 || 1000), t);
    if (o.f1) f.frequency.exponentialRampToValueAtTime(Math.max(10, o.f1), t + dur);
    f.Q.value = o.q || 0.8;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(o.vol || 0.2, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.gain);
    src.start(t); src.stop(t + dur + 0.05);
  },
  dash()    { this.noise({ ftype: 'highpass', f0: 2200, f1: 500, dur: 0.2, vol: 0.1 }); },
  nova()    { this.tone({ f0: 220, f1: 110, dur: 0.5, vol: 0.14 }); this.noise({ f0: 1000, f1: 300, dur: 0.4, vol: 0.08 }); },
  field()   { this.tone({ type: 'triangle', f0: 640, f1: 320, dur: 0.6, vol: 0.1 }); },
  hole()    { this.tone({ f0: 98, f1: 55, dur: 1, vol: 0.12 }); },
  holeBoom(){ this.noise({ f0: 420, f1: 90, dur: 0.6, vol: 0.2 }); this.tone({ f0: 110, f1: 45, dur: 0.6, vol: 0.18 }); },
  // fade() 已删除：0.6s 一代的消散太频繁，棋盘闪光本身就是反馈
  flip()     { this.tone({ type: 'triangle', f0: 480, f1: 720, dur: 0.1, vol: 0.045 }); },
  bell()     { this.tone({ type: 'sine', f0: 261.63, dur: 2.5, vol: 0.02, a: 0.05 }); this.tone({ type: 'sine', f0: 392.0, dur: 2.2, vol: 0.012, a: 0.05 }); },
};

/* ---------------- 冥想配乐（WebAudio 合成，随呼吸涨落） ----------------
   每 14s（=一个呼吸周期）换一次和弦的柔和 pad；音量随呼吸值涨落；
   呼气开始时点缀一声风铃。音量由左上角滑杆调节（Music.vol，记忆到本地）。
   走真实时钟，与呼吸节律严格同步。 */
const Music = {
  chords: [
    [110.0, 220.0, 261.63, 329.63],   // A2 A3 C4 E4
    [87.31, 174.61, 261.63, 329.63],  // F2 F3 C4 E4
    [98.0, 196.0, 246.94, 293.66],    // G2 G3 B3 D4
    [130.81, 196.0, 261.63, 392.0],   // C3 G3 C4 G4
  ],
  idx: 0, started: false, padGain: null, prevX: 0,
  vol: (() => { try { return clamp(+(localStorage.getItem('circle-music-vol') || 0.85), 0, 1.5); } catch (e) { return 0.85; } })(),
  start() {
    if (this.started) return;
    Sfx.ensure();
    if (!Sfx.ctx) return;
    this.started = true;
    this.padGain = this.ctx().createGain();
    this.padGain.gain.value = 0;
    this.padGain.connect(Sfx.gain);
    this.prevX = (performance.now() / 1000) % 14;
    this.playChord();
  },
  ctx() { return Sfx.ctx; },
  playChord() {
    if (!this.ctx() || !this.padGain) return;
    const t = this.ctx().currentTime;
    const dur = 14.4;
    const notes = this.chords[this.idx % this.chords.length];
    this.idx++;
    for (const f of notes) {
      for (const [type, mult, det, vol] of [['sine', 1, 0, 1], ['triangle', 2, 5, 0.32], ['sine', 3.01, -4, 0.14]]) {
        const osc = this.ctx().createOscillator();
        const g = this.ctx().createGain();
        osc.type = type;
        osc.frequency.value = f * mult;
        osc.detune.value = det;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.085 * vol, t + 2.8);         // 缓起
        g.gain.setValueAtTime(0.085 * vol, t + dur - 3.6);
        g.gain.linearRampToValueAtTime(0.0001, t + dur);              // 缓落
        osc.connect(g); g.connect(this.padGain);
        osc.start(t); osc.stop(t + dur + 0.1);
      }
    }
  },
  update(bv) {
    if (!this.padGain) return;
    const target = Sfx.muted ? 0 : this.vol * (0.55 + 0.45 * bv);   // 吸气渐强、呼气渐弱
    this.padGain.gain.setTargetAtTime(target, this.ctx().currentTime, 0.3);
  },
  chime() {
    if (!this.ctx() || Sfx.muted) return;
    const base = [1318.5, 1567.98, 1975.5, 2637.02][randInt(0, 3)];
    // 风铃挂在配乐总线：音量跟随滑杆、随呼吸涨落
    [1, 1.5, 2.76].forEach((m, i) => Sfx.tone({ f0: base * m, dur: 2.6 + i * 0.5, vol: 0.028 - i * 0.008, delay: i * 0.04 }, this.padGain));
  },
  tick() {
    if (!this.started || !this.padGain) return;
    if (Sfx.ctx && Sfx.ctx.state !== 'running') { Sfx.ensure(); return; }   // 被系统挂起：等下次手势恢复
    const x = (performance.now() / 1000) % 14;
    if (x < this.prevX) { this.playChord(); Sfx.bell(); }  // 新一轮吸气 → 换和弦 + 一声轻钟
    else if (this.prevX < 8 && x >= 8) this.chime();      // 呼气开始 → 风铃一声
    this.prevX = x;
    this.update(breath.v);
  },
};

/* ---------------- 输入（鼠标 / 触屏统一走 Pointer Events） ---------------- */
const keys = {};
const mouse = { x: W / 2, y: H / 2, wx: 0, wy: 0, aim: false };
// 触屏没有悬停：aim 表示「已经明确指过位置」，作为归心落点与流步方向的依据
function setAim(cx, cy) { mouse.x = cx; mouse.y = cy; mouse.aim = true; }
function mutateCellAt(px, py) {
  if (state !== 'playing') return;
  const wx = px - W / 2 + cam.x, wy = py - H / 2 + cam.y;
  const gx = clamp(Math.floor(wx / LIFE.cell), 0, lifeCols() - 1);
  const gy = clamp(Math.floor(wy / LIFE.cell), 0, lifeRows() - 1);
  const cx = (gx + 0.5) * LIFE.cell, cy = (gy + 0.5) * LIFE.cell;
  const occupants = enemies.filter(e => !e.dead && e.hx === cx && e.hy === cy);
  if (!occupants.length) return;
  for (const e of occupants) {
    const others = LIFE.pool.filter(t => t !== e.type);
    e.type = others[randInt(0, others.length - 1)];
    e.def = ENEMY_DEFS[e.type];
    const st = enemyStats(e.type, e.level);
    e.r = st.r; e.hp = e.maxHp = st.hp; e.xp = st.xp;
  }
  Sfx.flip();
}
// 兼容极老的 webview（无 PointerEvent）时退回 mouse/touch 事件
if (typeof window.PointerEvent === 'function') {
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse' || e.buttons) setAim(e.clientX, e.clientY);
  }, { passive: true });
  cvs.addEventListener('pointerdown', (e) => {
    Sfx.ensure();                                   // 触摸手势里解锁 WebAudio
    if (e.pointerType !== 'mouse') e.preventDefault();
    setAim(e.clientX, e.clientY);                   // 点按 = 瞄准
    if (e.isPrimary) mutateCellAt(e.clientX, e.clientY);   // 点中细胞则变形
  }, { passive: false });
} else {
  window.addEventListener('mousemove', (e) => setAim(e.clientX, e.clientY));
  cvs.addEventListener('mousedown', (e) => { Sfx.ensure(); setAim(e.clientX, e.clientY); mutateCellAt(e.clientX, e.clientY); });
  cvs.addEventListener('touchstart', (e) => {
    Sfx.ensure();
    const t = e.changedTouches[0];
    if (!t) return;
    e.preventDefault();
    setAim(t.clientX, t.clientY);
    mutateCellAt(t.clientX, t.clientY);
  }, { passive: false });
}
// iOS 上「第一次触摸」是唯一的解锁时机：用捕获阶段的全局监听兜住任何入口（含菜单按钮之外的手势）
['pointerdown', 'touchend'].forEach((t) => {
  window.addEventListener(t, () => Sfx.ensure(), { capture: true, passive: true });
});
window.addEventListener('contextmenu', (e) => e.preventDefault());
window.addEventListener('keydown', (e) => {
  Sfx.ensure();
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  keys[e.code] = true;
  if (e.repeat) return;
  switch (e.code) {
    case 'Enter':
      if (state === 'menu') startGame();
      break;
    case 'KeyP': case 'Escape':
      if (state === 'playing') toggleRest();
      break;
    case 'KeyO':
      if (state === 'playing') toggleSummary();
      break;
    case 'KeyM': toggleMute(); break;
    case 'KeyB': toggleBreath(); break;
    case 'KeyQ': case 'ShiftLeft': case 'ShiftRight': tryDash(); break;
    case 'KeyE': tryNova(); break;
    case 'Space': tryField(); break;
    case 'KeyF': tryHole(); break;
  }
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

/* ---------------- 摄像机 / 震屏 ---------------- */
const cam = { x: WORLD.w / 2, y: WORLD.h / 2, trauma: 0 };
const addShake = (v) => { cam.trauma = Math.min(1, cam.trauma + v); };

/* ---------------- 冥想呼吸节律（吸气4s · 屏息4s · 呼气6s） ----------------
   所有角色与星空按同一相位呼吸，用于引导玩家跟随节奏放松；
   走真实时钟，暂停 / 慢动作时呼吸也不停止。按 B 可开关。 */
const BREATH = { inhale: 4, hold: 4, exhale: 6 };
let breathOn = true;
let breath = { stage: '吸气', v: 0.5 };
function breathInfo() {
  const ease = (p) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(p, 0, 1));
  const x = (performance.now() / 1000) % (BREATH.inhale + BREATH.hold + BREATH.exhale);
  if (x < BREATH.inhale) return { stage: '吸气', v: ease(x / BREATH.inhale) };
  if (x < BREATH.inhale + BREATH.hold) return { stage: '屏息', v: 1 };
  const p = (x - BREATH.inhale - BREATH.hold) / BREATH.exhale;
  return { stage: '呼气', v: 1 - ease(p) };
}
function updateBreathDom() {
  if (!breathOn) {
    ui.breathCue.classList.add('hidden');
    ui.vignette.style.opacity = '';
    return;
  }
  ui.breathCue.classList.remove('hidden');
  const c = breath.stage === '吸气' ? '#ffd9a8' : breath.stage === '屏息' ? '#fff2dc' : '#b39ae0';
  const s = 0.55 + 0.85 * breath.v;
  ui.breathDot.style.transform = `scale(${s.toFixed(3)})`;
  ui.breathDot.style.background = c;
  ui.breathDot.style.boxShadow = `0 0 ${Math.round(6 + 12 * breath.v)}px ${c}`;
  if (ui.breathText.textContent !== breath.stage) ui.breathText.textContent = breath.stage;
  ui.breathText.style.color = c;
  ui.vignette.style.opacity = (0.7 + 0.3 * breath.v).toFixed(3);
}

/* ---------------- 呼吸光晕颜色 ---------------- */
// 角色光晕阶段色与顶部提示一致（吸气金 / 屏息白 / 呼气紫），阶段切换时 ~0.55s 交叉淡入
const BREATH_HEX = { '吸气': '#ffd9a8', '屏息': '#fff2dc', '呼气': '#b39ae0' };
const BREATH_RGB = { '吸气': [255, 217, 168], '屏息': [255, 242, 220], '呼气': [179, 154, 224] };
let haloFrom = '吸气', haloTo = '吸气', haloT = 1;
function updateHaloColor(dt) {
  if (breath.stage !== haloTo) { haloFrom = haloTo; haloTo = breath.stage; haloT = 0; }
  haloT = Math.min(1, haloT + dt / 0.55);
}
const rgbaA = (rgb, a) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
function haloRGB() {
  const a = BREATH_RGB[haloFrom], b = BREATH_RGB[haloTo];
  return [lerp(a[0], b[0], haloT), lerp(a[1], b[1], haloT), lerp(a[2], b[2], haloT)];
}
// 呼吸光晕（玩家 / 杂念几何共用）：颜色随阶段金→白→紫交叉淡入，大小明暗由调用方按呼吸值传入
function drawBreathGlow(x, y, r, alpha) {
  if (haloT >= 1) drawGlow(x, y, r, BREATH_HEX[haloTo], alpha);
  else {
    drawGlow(x, y, r, BREATH_HEX[haloFrom], alpha * (1 - haloT));
    drawGlow(x, y, r, BREATH_HEX[haloTo], alpha * haloT);
  }
}

/* ---------------- 辉光精灵缓存 ---------------- */
const glowCache = {};
function glowSprite(color) {
  let s = glowCache[color];
  if (!s) {
    s = document.createElement('canvas');
    s.width = s.height = 64;
    const g = s.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, hexA(color, 0.85));
    grad.addColorStop(0.35, hexA(color, 0.26));
    grad.addColorStop(1, hexA(color, 0));
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    glowCache[color] = s;
  }
  return s;
}
function drawGlow(x, y, r, color, alpha = 1) {
  const s = glowSprite(color);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = alpha;
  ctx.drawImage(s, x - r * 2, y - r * 2, r * 4, r * 4);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/* ---------------- 几何绘制 ---------------- */
function shapePath(t, x, y, r, ang) {
  ctx.beginPath();
  if (t === 'circle') { ctx.arc(x, y, r, 0, TAU); return; }
  const n = t === 'triangle' ? 3 : t === 'square' ? 4 : t === 'pentagon' ? 5 : 6;
  for (let i = 0; i < n; i++) {
    const a = ang + (i / n) * TAU - Math.PI / 2;
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
}
function drawShape(t, x, y, r, ang, fill, stroke, lw, glowCol, glowA) {
  if (glowCol) drawGlow(x, y, r * 1.7, glowCol, glowA == null ? 0.5 : glowA);
  shapePath(t, x, y, r, ang);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = lw || 2; ctx.strokeStyle = stroke; ctx.stroke(); }
}

/* ---------------- 全局状态 ---------------- */
let state = 'menu';           // menu | playing | paused
let freeze = 0;
let kills = 0, playTime = 0, seedsPlanted = 0, mapHolesSpawned = 0, lonelyDeathCount = 0;
let resting = false;                                   // 小憩：只隐去界面，世界照常演变
let boss = null;
let flashW = 0;

const enemies = [], bullets = [], parts = [], texts = [], holes = [];

/* ---------------- 玩家 ---------------- */
const player = {
  x: WORLD.w / 2, y: WORLD.h / 2, vx: 0, vy: 0,
  r: 16,
  ang: rand(0, TAU), targetAng: rand(0, TAU), wanderT: 1.5,
  dashT: 0, dashVx: 0, dashVy: 0, ghostT: 0, thrT: 0,
  fieldT: 0,
};

const skills = {
  dash:  { cd: 0.8, t: 0 },
  nova:  { cd: 2.3, t: 0 },
  field: { cd: 4.7, t: 0 },
  hole:  { cd: 6,   t: 0 },
};
/* ---------------- 粒子 / 飘字 ---------------- */
let partCap = 650;                                  // syncWorld 按设备收紧（手机端粒子开销）
function addPart(p) { if (parts.length < partCap) parts.push(p); }
function addText(x, y, txt, color, size) {
  if (texts.length > 80) texts.shift();
  texts.push({ x, y, txt, color, size: size || 14, life: 0.78, maxLife: 0.78, vy: -54, vx: rand(-14, 14) });
}
function sparks(x, y, color, n, spd) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, TAU), s = rand(0.3, 1) * (spd || 240);
    addPart({ kind: 'dot', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(0.2, 0.45), maxLife: 0.45, size: rand(1.5, 3.2), color, drag: 4 });
  }
}
function ringFx(x, y, color, vr, lw, life) {
  addPart({ kind: 'ring', x, y, r: 6, vr: vr || 480, life: life || 0.45, maxLife: life || 0.45, color, lw: lw || 3 });
}
function shards(x, y, shape, color, n) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, TAU), s = rand(90, 330);
    addPart({ kind: 'shard', shape, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, ang: rand(0, TAU), spin: rand(-9, 9), life: rand(0.4, 0.8), maxLife: 0.8, size: rand(4, 9), color, drag: 3 });
  }
}
function explosionFx(x, y, r, color, shape) {
  sparks(x, y, color, Math.min(26, 8 + r * 0.5), 320);
  shards(x, y, shape || 'circle', color, Math.min(12, 5 + r * 0.12));
  ringFx(x, y, color, 560, 3.5, 0.4);
  addPart({ kind: 'flash', x, y, life: 0.16, maxLife: 0.16, size: r * 2.4, color });
}
function ghostFx(x, y, r, ang) {
  addPart({ kind: 'ghost', shape: 'circle', x, y, r, ang, life: 0.35, maxLife: 0.35 });
}
function updateParts(dt) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.life -= dt;
    if (p.life <= 0) { parts[i] = parts[parts.length - 1]; parts.pop(); continue; }
    if (p.vx != null) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.drag) { const k = Math.exp(-p.drag * dt); p.vx *= k; p.vy *= k; }
    if (p.gr) p.vy += p.gr * dt;
    }
    if (p.vr) p.r += p.vr * dt;
    if (p.spin) p.ang += p.spin * dt;
  }
  for (let i = texts.length - 1; i >= 0; i--) {
    const t = texts[i];
    t.life -= dt;
    if (t.life <= 0) { texts[i] = texts[texts.length - 1]; texts.pop(); continue; }
    t.x += t.vx * dt; t.y += t.vy * dt;
  }
}

/* ---------------- 漂浮杂念定义（低饱和禅意色） ---------------- */
const ENEMY_DEFS = {
  chaser:  { shape: 'circle',   color: '#e89aa8' },  // 淡玫瑰
  dasher:  { shape: 'triangle', color: '#e8b28a' },  // 杏橙
  shooter: { shape: 'square',   color: '#b39ae0' },  // 薰衣草
  elite:   { shape: 'pentagon', color: '#e8d59a' },  // 淡金
  boss:    { shape: 'hexagon',  color: '#a88ae0' },  // 紫罗兰
};
function enemyStats(type, level) {
  // 体型收小到"棋盘上的细胞"：一眼读整体图案，而非单个怪物
  let r, hp, xp, dmg;
  if (type === 'chaser')  { r = 6 + level * 0.8;  hp = 22 * Math.pow(level, 1.15); xp = 10 + 6 * level;  dmg = 10 + 2 * level; }
  if (type === 'dasher')  { r = 5.5 + level * 0.7; hp = 16 * Math.pow(level, 1.10); xp = 14 + 8 * level;  dmg = 12 + 2.5 * level; }
  if (type === 'shooter') { r = 6 + level * 0.8;  hp = 26 * Math.pow(level, 1.15); xp = 18 + 10 * level; dmg = 8 + 2 * level; }
  if (type === 'elite')   { r = 8 + level * 0.6;  hp = 95 * Math.pow(level, 1.30); xp = 85 + 22 * level; dmg = 16 + 3 * level; }
  if (type === 'boss')    { r = 20;               hp = 900 + 800 * Math.floor(generation / 5); xp = 420 + 40 * generation; dmg = 26; }
  return { r, hp, xp, dmg };
}
function spawnEnemy(type, level, x, y) {
  const d = ENEMY_DEFS[type];
  if (!d) return null;   // 未知类型直接拒绝（防止测试钩子喂进脏类型污染场景）
  const { r, hp, xp, dmg } = enemyStats(type, level);
  const e = {
    type, def: d, x, y, vx: 0, vy: 0, r, level,
    hp, maxHp: hp, xp, dmg: 0,
    angle: rand(0, TAU), spin: rand(-0.5, 0.5),
    touchCd: 0, atkCd: 0, tele: 0,
    hitFlash: 0, spawnT: 0.35, dead: false,
  };
  // 细胞钉死在自己格子的中心：生灭皆在原地，图案才留得住
  const gx = clamp(Math.floor(x / LIFE.cell), 0, lifeCols() - 1);
  const gy = clamp(Math.floor(y / LIFE.cell), 0, lifeRows() - 1);
  e.hx = (gx + 0.5) * LIFE.cell;
  e.hy = (gy + 0.5) * LIFE.cell;
  e.x = e.hx; e.y = e.hy;
  // 新生儿不再自动带生根期：规则本身就是裁决（孤独不死已由存活集保证，
  // 落地即过挤的细胞下一代自然消散）。保护期只授予明确意图：点按、E 播种、求生方块。
  enemies.push(e);
  return e;
}

/* ---------------- 细胞静止（生灭皆在原地） ---------------- */
function updateEnemy(e, dt) {
  e.angle += e.spin * dt;
  e.hitFlash = Math.max(0, e.hitFlash - dt);
  if (e.spawnT > 0) e.spawnT -= dt;
  if (e.dying) { e.fadeT -= dt; if (e.fadeT <= 0) e.dead = true; }
  e.x = e.hx; e.y = e.hy;                    // 细胞钉在格心，只有生灭与呼吸
}

/* ---------------- 伤害 / 击杀 ---------------- */
function damageEnemy(e, dmg, opts) {
  if (e.dead || e.dying || e.spawnT > 0.15) return;
  const crit = !(opts && opts.noCrit) && Math.random() < 0.1;
  const val = crit ? dmg * 2.1 : dmg;
  e.hp -= val;
  e.hitFlash = 0.12;   // 唯一的受击提示：轻微白闪，无飘字无火星
  if (e.hp <= 0) killEnemy(e);
}
function killEnemy(e) {
  if (e.dead || e.dying) return;
  kills++;
  // 死亡 = 安静的渐隐（与自然消散一致），不爆散、不震屏
  e.dying = true;
  e.fadeT = 0.4;
  if (e.type === 'boss') boss = null;
}


/* ---------------- 玩家更新 ---------------- */
function updatePlayer(dt) {
  const p = player;
  p.fieldT = Math.max(0, p.fieldT - dt);

  // 自主游走：随机目标方向缓慢转向，连贯漫步；靠近棋盘边缘时缓缓回正
  p.wanderT -= dt;
  if (p.wanderT <= 0) {
    p.wanderT = rand(2.5, 6);
    p.targetAng = rand(0, TAU);
  }
  const margin = Math.min(120, WORLD.w / 3, WORLD.h / 3);   // 小窗口下边缘回正也要收小
  if (p.x < margin || p.x > WORLD.w - margin || p.y < margin || p.y > WORLD.h - margin) {
    p.targetAng = Math.atan2(WORLD.h / 2 - p.y, WORLD.w / 2 - p.x);
  }
  const da = ((p.targetAng - p.ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  p.ang += da * clamp(dt * 1.2, 0, 1);
  const speed = 130;
  if (p.dashT > 0) {
    p.dashT -= dt;
    p.vx = p.dashVx; p.vy = p.dashVy;
    if ((p.ghostT -= dt) <= 0) { p.ghostT = 0.028; ghostFx(p.x, p.y, p.r, Math.atan2(p.dashVy, p.dashVx)); }
  } else {
    const k = 1 - Math.exp(-2.5 * dt);   // 加减速像在水里
    p.vx += (Math.cos(p.ang) * speed - p.vx) * k;
    p.vy += (Math.sin(p.ang) * speed - p.vy) * k;
  }
  p.x = clamp(p.x + p.vx * dt, p.r, WORLD.w - p.r);
  p.y = clamp(p.y + p.vy * dt, p.r, WORLD.h - p.r);

  // 游动尾光
  const spd2 = Math.hypot(p.vx, p.vy);
  if (spd2 > 60 && (p.thrT -= dt) <= 0) {
    p.thrT = 0.05;
    const a = Math.atan2(-p.vy, -p.vx) + rand(-0.5, 0.5);
    addPart({ kind: 'dot', x: p.x + Math.cos(a) * p.r, y: p.y + Math.sin(a) * p.r, vx: Math.cos(a) * rand(30, 90), vy: Math.sin(a) * rand(30, 90), life: rand(0.4, 0.8), maxLife: 0.8, size: rand(1.5, 3), color: '#ffd9a8', drag: 2 });
  }
}

/* ---------------- 技能 ---------------- */
// 瞄准点：触屏尚未点按时退化为「玩家正前方」，避免归心 / 流步落在无意义的屏幕中心
// 现场换算世界坐标，不取上一帧缓存 —— 点按后立刻施法才拿得到最新落点
function aimPoint() {
  const p = player;
  if (!mouse.aim) return { x: p.x + Math.cos(p.ang) * 200, y: p.y + Math.sin(p.ang) * 200 };
  return { x: mouse.x - W / 2 + cam.x, y: mouse.y - H / 2 + cam.y };
}
function tryDash() {
  if (state !== 'playing' || skills.dash.t > 0) return;
  skills.dash.t = skills.dash.cd;
  const p = player;
  let dx = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);
  let dy = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0);
  const aim = aimPoint();
  let a = Math.hypot(dx, dy) > 0 ? Math.atan2(dy, dx) : Math.atan2(aim.y - p.y, aim.x - p.x);
  p.dashT = 0.16;
  p.dashVx = Math.cos(a) * 1400; p.dashVy = Math.sin(a) * 1400;
  ringFx(p.x, p.y, '#ffe6c2', 380, 2, 0.35);
  for (let i = 0; i < 8; i++) {
    const aa = a + Math.PI + rand(-0.5, 0.5);
    addPart({ kind: 'streak', x: p.x, y: p.y, vx: Math.cos(aa) * rand(180, 380), vy: Math.sin(aa) * rand(180, 380), life: 0.26, maxLife: 0.26, size: rand(8, 18), color: '#ffd9a8' });
  }
  Sfx.dash();
}
function tryNova() {
  if (state !== 'playing' || skills.nova.t > 0) return;
  skills.nova.t = skills.nova.cd;
  const p = player;
  // 烟花秀：三枚礼花弹从玩家升空，依次绽放出不同颜色的火星
  for (let i = 0; i < 3; i++) {
    const a = rand(0, TAU), r = rand(110, 260);
    const bx = clamp(p.x + Math.cos(a) * r, 40, WORLD.w - 40);
    const by = clamp(p.y + Math.sin(a) * r, 40, WORLD.h - 40);
    const fuse = 0.3 + i * 0.22 + rand(0, 0.08);
    const color = ['#ffe6c2', '#e89aa8', '#b39ae0', '#fff2dc'][i % 4];
    fireworks.push({ t: fuse, x: bx, y: by, color });
    // 礼花弹：带轨迹的升空光点，到达即炸
    addPart({ kind: 'streak', x: p.x, y: p.y, vx: (bx - p.x) / fuse, vy: (by - p.y) / fuse, life: fuse, maxLife: fuse, size: 18, color });
  }
  // 波缘播种：烟花落点附近随机播下一枚拼块，命运各不相同 ——
  //   O/L 稳定、T 红绿灯振荡、I/S 消散，偶尔是一枚滑翔机（G）
  {
    const names = ['O', 'I', 'T', 'L', 'S', 'G'];
    const name = names[randInt(0, names.length - 1)];
    const offsets = {
      O: [[0, 0], [1, 0], [0, 1], [1, 1]],
      I: [[0, 0], [1, 0], [2, 0], [3, 0]],
      T: [[1, 0], [0, 1], [1, 1], [2, 1]],
      L: [[0, 0], [0, 1], [0, 2], [1, 2]],
      S: [[1, 0], [2, 0], [0, 1], [1, 1]],
      G: [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]],
    }[name];
    const a = rand(0, TAU), r = rand(150, 340);
    const gx0 = clamp(Math.floor((p.x + Math.cos(a) * r) / LIFE.cell), 0, lifeCols() - 4);
    const gy0 = clamp(Math.floor((p.y + Math.sin(a) * r) / LIFE.cell), 0, lifeRows() - 3);
    const cellType = LIFE.pool[randInt(0, LIFE.pool.length - 1)];
    for (const [dx, dy] of offsets) {
      pendingSeeds.push({ t: (r + rand(-20, 20)) / 420, gx: gx0 + dx, gy: gy0 + dy, type: cellType, level: randInt(1, 2) });
    }
  }
  Sfx.nova();
}
function tryField() {
  if (state !== 'playing' || skills.field.t > 0) return;
  skills.field.t = skills.field.cd;
  player.fieldT = 4;
  ringFx(player.x, player.y, '#b39ae0', 680, 5, 0.7);
  addText(player.x, player.y - player.r - 24, '止水', '#cbb8f0', 19);
  Sfx.field();
}
function tryHole() {
  if (state !== 'playing' || skills.hole.t > 0) return;
  skills.hole.t = skills.hole.cd;
  const aim = aimPoint();
  holes.push({
    x: clamp(aim.x, 60, WORLD.w - 60), y: clamp(aim.y, 60, WORLD.h - 60),
    t: 2.6, tick: 0, spin: rand(0, TAU), dmg: 12,
  });
}
function updateHoles(dt) {
  for (let i = holes.length - 1; i >= 0; i--) {
    const h = holes[i];
    const sc = h.scale || 1;                        // 地图随机黑洞更小、更温和
    h.t -= dt; h.spin += dt * 6; h.tick -= dt;
    // 吸引
    const pullR = 480 * sc;
    for (const e of enemies) {
      if (e.dead || e.type === 'boss') continue;
      const d = dist(e.x, e.y, h.x, h.y);
      if (d < pullR && d > 1) {
        const f = (1 - d / pullR) * 1000;
        e.vx += ((h.x - e.x) / d) * f * dt;
        e.vy += ((h.y - e.y) / d) * f * dt;
      }
    }
    // 持续伤害
    if (h.tick <= 0) {
      h.tick = 0.28;
      for (const e of enemies) {
        if (!e.dead && dist(e.x, e.y, h.x, h.y) < 260 * sc) damageEnemy(e, h.dmg, { noCrit: true });
      }
    }
    // 旋涡粒子
    for (let j = 0; j < 2; j++) {
      const a = rand(0, TAU), rr = rand(180, 300) * sc;
      addPart({ kind: 'dot', x: h.x + Math.cos(a) * rr, y: h.y + Math.sin(a) * rr, vx: -Math.cos(a) * 260, vy: -Math.sin(a) * 260, life: rand(0.3, 0.6), maxLife: 0.6, size: rand(1.5, 3), color: j ? '#a88ae0' : '#ffe6c2', drag: 0 });
    }
    if (h.t <= 0) {
      holes.splice(i, 1);
      const boomR = 330 * sc;
      for (const e of enemies) {
        if (!e.dead && dist(e.x, e.y, h.x, h.y) < boomR) damageEnemy(e, h.boomDmg || 118, { noCrit: true });
      }
      ringFx(h.x, h.y, '#a88ae0', 1000 * sc, 6, 0.7);
      ringFx(h.x, h.y, '#ffffff', 720 * sc, 3, 0.45);
      Sfx.holeBoom();
      // 疤痕：黑洞过境之地留下沃土（18s），生命总会再生
      scars.push({ x: h.x, y: h.y, r: boomR + 40, until: playTime + 18 });
    }
  }
  for (let i = scars.length - 1; i >= 0; i--) if (scars[i].until <= playTime) scars.splice(i, 1);
}

/* ---------------- 波环视觉 / 光尘 ---------------- */
function updateBullets(dt) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.life -= dt;
    if (b.life <= 0) { bullets.splice(i, 1); continue; }
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.x < -80 || b.x > WORLD.w + 80 || b.y < -80 || b.y > WORLD.h + 80) { bullets.splice(i, 1); continue; }
    // 拖尾
    if (Math.random() < 0.5) {
      addPart({ kind: 'dot', x: b.x, y: b.y, vx: rand(-15, 15), vy: rand(-15, 15), life: 0.18, maxLife: 0.18, size: b.r * 0.5, color: b.color, drag: 2 });
    }
  }
}
/* ---------------- 生命游戏 · 杂念的自然演变 ----------------
   孤独易散 · 过挤消散规则：细网格 + 细胞钉死在格中生灭 ——
   · 存活：成对与小群落（8 邻域同伴数 1~4）不灭
   · 孤独：0 邻居的孤细胞每代以 lonelyP（默认 0.3）的概率消散
   · 过挤：同伴数 ≥ 5 即消散
   · 诞生：空格的 8 邻域同伴数 ∈ {3,6,7,8}
   · 地图会随机浮现小型黑洞，消灭过密处的一部分生命；
     黑洞过境之地留下沃土，生命总会再生 —— 生态由此循环。
   邻居沿棋盘边界环绕（环面拓扑）；细胞永不移动。
   玩家不攻击：E 绽放播下随机拼块（偶得滑翔机），F 归心消散一片，
   点按细胞随机变形，止水让演化变慢，其余交给世界自己。 */
const LIFE = {
  cell: 24,           // 棋盘格边长（世界 = 窗口尺寸）
  tick: 0.6,          // 每代间隔：0.6s 一代（2 倍速），演化如流水
  maxEnemies: 800,    // 世界细胞总数上限（硬顶）
  target: 300,        // 种群自稳目标：气候压力随数量反向伸缩，棋盘恒保生态活力
  birthsPerTick: 300, // 单代诞生上限（昼夜规则稠密均衡下自然诞生位很多，不可掐死）
  rescueMin: 12,      // 求生底线：低于此数放宽诞生补种（测试可关）
  mutations: 2,       // 每代随机轻拨的格子数：灰烬再点燃，稳定态不会永久持续
  noise: {            // 气候噪声层（仿 Minecraft 地形）：宜居区缓缓生长
    scale: 0.06,      // 噪声采样尺度（特征区约 17 格 ≈ 400px）
    drift: 0.02,      // 每代气候漂移步长（噪声空间）
    fertile: 0.18,    // 宜居阈值（实测 fbm 范围约 ±0.38）：高于此的空格有邻居时以 birthP 概率生长
    birthP: 0.3,
    cap: 12,          // 每代宜居诞生不超过这么多（温和压力）
  },
  pool: ['chaser', 'dasher', 'shooter', 'elite'],
  // 规则集：孤独易散 · 过挤消散 —— 成对与小群落（1~4 邻）不灭，
  // 5 邻及以上即为过挤全部消散，0 邻居的孤细胞按 lonelyP 概率散去；诞生仍看 B3678
  rule: { name: '孤独易散 · 过挤消散', b: [3, 6, 7, 8], s: [0, 1, 2, 3, 4] },
  lonelyP: 0.3,       // 孤细胞（0 邻）每代随机消散的概率；0 = 关闭（测试可改）
};
let lifeTimer = 0, generation = 0, lifeSeed = 0;
const pendingSeeds = [];   // 绽放播下的种子（随波扩散到半径后落地）
const scars = [];          // 黑洞疤痕：过境之地留下沃土，生命总会再生
let mapHoleTimer = 4;      // 地图随机黑洞的浮现计时
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Perlin 噪声（种子化）+ 三倍频 fBm —— 仿 Minecraft 地形生成的连续随机场，输出约 [-1, 1]
function makeNoise(seed) {
  const rng = mulberry32(seed);
  const perm = new Uint8Array(512), p = [];
  for (let i = 0; i < 256; i++) p.push(i);
  for (let i = 255; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const grad = (h, x, y) => {
    switch (h & 7) {
      case 0: return x + y; case 1: return -x + y; case 2: return x - y; case 3: return -x - y;
      case 4: return x; case 5: return -x; case 6: return y; default: return -y;
    }
  };
  function perlin2(x, y) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    x -= Math.floor(x); y -= Math.floor(y);
    const u = fade(x), v = fade(y);
    const aa = perm[perm[X] + Y], ab = perm[perm[X] + Y + 1];
    const ba = perm[perm[X + 1] + Y], bb = perm[perm[X + 1] + Y + 1];
    return lerp(
      lerp(grad(aa, x, y), grad(ba, x - 1, y), u),
      lerp(grad(ab, x, y - 1), grad(bb, x - 1, y - 1), u), v) * 0.7;
  }
  return (x, y) => (perlin2(x, y) + perlin2(x * 2.13 + 5.2, y * 2.13 + 1.3) * 0.5 + perlin2(x * 4.41 + 9.1, y * 4.41 + 3.7) * 0.25) / 1.75;
}
function lifeCols() { return Math.ceil(WORLD.w / LIFE.cell); }
function lifeRows() { return Math.ceil(WORLD.h / LIFE.cell); }
function lifeCellOf(e, cols, rows) {
  return { gx: clamp(Math.floor(e.x / LIFE.cell), 0, cols - 1), gy: clamp(Math.floor(e.y / LIFE.cell), 0, rows - 1) };
}
// 初始种群：随机种子 → 经典"随机汤"开局（约 11%~15% 密度），每局图案都不同
function seedWorld(rng) {
  const cols = lifeCols(), rows = lifeRows(), all = [];
  for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < cols; gx++) all.push([gx, gy]);
  // 噪声地形开局：宜居带成片生长、严酷带留白，图案如大陆般有机
  const fbm = makeNoise(Math.floor(rng() * 1e9));
  for (const [gx, gy] of all) {
    const v = fbm((gx - climate.dx) * LIFE.noise.scale, (gy - climate.dy) * LIFE.noise.scale);
    if (v > 0.12 - (rng() - 0.5) * 0.24 && enemies.length < LIFE.maxEnemies) {   // 宜居带为主，边缘带随机
      spawnEnemy(LIFE.pool[Math.floor(rng() * LIFE.pool.length)], 1 + Math.floor(rng() * 2),
        (gx + 0.5) * LIFE.cell, (gy + 0.5) * LIFE.cell);
    }
  }
}
let climate = null;                                          // 当前世界气候场（噪声 + 漂移）
function initClimate(seed) {
  climate = { fbm: makeNoise(seed ^ 0x9E37), dx: rand(0, 100), dy: rand(0, 100), dir: rand(0, TAU), cycle: -1 };
}
function lifeStep() {
  const cols = lifeCols(), rows = lifeRows();
  // 气候：噪声场缓慢漂移；每个呼吸周期"换季"——随机改变漂移方向并跳进一步，图案随之重刷
  const cyc = Math.floor(playTime / 14);
  if (cyc !== climate.cycle) {
    climate.cycle = cyc;
    climate.dir = rand(0, TAU);
    climate.dx += rand(-0.35, 0.35); climate.dy += rand(-0.35, 0.35);
  }
  climate.dx += Math.cos(climate.dir) * LIFE.noise.drift;
  climate.dy += Math.sin(climate.dir) * LIFE.noise.drift;
  // 每格气候采样（宜居 + / 严酷 -），一遍算好全程复用
  const noiseV = new Float32Array(cols * rows);
  for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < cols; gx++) {
    noiseV[gy * cols + gx] = climate.fbm((gx - climate.dx) * LIFE.noise.scale, (gy - climate.dy) * LIFE.noise.scale);
  }
  const counts = new Uint8Array(cols * rows);
  const cells = new Map();                                   // 格子 → 该格杂念列表
  let liveTotal = 0;
  for (const e of enemies) {
    if (e.dead || e.dying) continue;                         // 渐隐中的细胞不再参与规则
    liveTotal++;
    const { gx, gy } = lifeCellOf(e, cols, rows);
    counts[gy * cols + gx]++;
    const key = gy * cols + gx;
    if (!cells.has(key)) cells.set(key, []);
    cells.get(key).push(e);
  }
  // 环面拓扑：邻居跨边界环绕（生命游戏标准做法），边缘格不再天然稀少
  const n8 = (gx, gy) => {
    let s = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const x = (gx + dx + cols) % cols, y = (gy + dy + rows) % rows;
      s += counts[y * cols + x];
    }
    return s;
  };
  // 规则集驱动：存活看 rule.s、诞生看 rule.b（环面拓扑），对所有细胞一视同仁
  const bset = new Set(LIFE.rule.b), sset = new Set(LIFE.rule.s);
  let changes = 0;
  for (const e of enemies) {
    if (e.dead || e.dying) continue;
    const { gx, gy } = lifeCellOf(e, cols, rows);
    const n = counts[gy * cols + gx] - 1 + n8(gx, gy);
    // 孤细胞（0 邻居）每次演化按概率消散 —— 落单的杂念留不住；成对及以上仍不受此规则约束
    if (n === 0 && LIFE.lonelyP > 0 && Math.random() < LIFE.lonelyP) {
      e.dying = true; e.fadeT = 0.4; changes++; lonelyDeathCount++; continue;
    }
    if (!sset.has(n)) { e.dying = true; e.fadeT = 0.4; changes++; }   // 安静渐隐，不闪光
  }
  // 气候不再直接杀生 —— 死亡只来自过挤（恰 5 邻）、黑洞与归心
  // 诞生 —— 空格邻居数命中诞生集；形状随邻居多数，等级随邻居平均
  // 种群自稳：高于目标 → 气候诞生率降低；低于目标 → 风调雨顺
  // 目标种群随棋盘大小缩放：窄屏（手机）不会为凑够 300 个而把格子塞到满盘过挤
  const popTarget = Math.min(LIFE.target, Math.max(24, Math.round(cols * rows * 0.19)));
  const pressure = clamp(liveTotal / popTarget, 0.4, 2.2);
  let births = 0;
  for (let gy = 0; gy < rows && births < LIFE.birthsPerTick && enemies.length < LIFE.maxEnemies; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      if (births >= LIFE.birthsPerTick || enemies.length >= LIFE.maxEnemies) break;
      if (counts[gy * cols + gx] > 0) continue;
      if (!bset.has(n8(gx, gy))) continue;
      const near = [];
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const list = cells.get(((gy + dy + rows) % rows) * cols + ((gx + dx + cols) % cols));
        if (list) near.push(...list);
      }
      if (!near.length) continue;
      const tally = {};
      let lv = 0;
      for (const e of near) { tally[e.type] = (tally[e.type] || 0) + 1; lv += e.level; }
      let shape = LIFE.pool[0], best = 0;
      for (const t of LIFE.pool) if ((tally[t] || 0) > best) { best = tally[t]; shape = t; }
      spawnEnemy(shape, clamp(Math.round(lv / near.length) + randInt(-1, 1), 1, 14),
        (gx + 0.5) * LIFE.cell + rand(-LIFE.cell * 0.2, LIFE.cell * 0.2),
        (gy + 0.5) * LIFE.cell + rand(-LIFE.cell * 0.2, LIFE.cell * 0.2));
      births++; changes++;
    }
  }
  // 气候压力：宜居区的空格（有邻居即可）缓缓长出新细胞
  let climateBirths = 0, scarBirths = 0, auraBirths = 0;
  for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < cols; gx++) {
    if (counts[gy * cols + gx] > 0) continue;
    const sx = (gx + 0.5) * LIFE.cell, sy = (gy + 0.5) * LIFE.cell;
    const inScar = scars.some(sc => dist(sx, sy, sc.x, sc.y) < sc.r);
    // 疤痕沃土：不受总数上限与气候限制，生命总会再生（独立配额 10/代）
    if (inScar) {
      if (scarBirths < 10 && Math.random() < 0.45) {
        spawnEnemy(LIFE.pool[randInt(0, LIFE.pool.length - 1)], 1,
          sx + rand(-LIFE.cell * 0.2, LIFE.cell * 0.2), sy + rand(-LIFE.cell * 0.2, LIFE.cell * 0.2));
        scarBirths++; changes++;
      }
      continue;
    }
    // 玩家沃土光环：你的所在之处是一片沃土 —— 生命无需邻居也会向你周围生长
    const dp = dist(sx, sy, player.x, player.y);
    if (dp < 200) {
      if (auraBirths < 8 && Math.random() < 0.45) {
        spawnEnemy(LIFE.pool[randInt(0, LIFE.pool.length - 1)], 1,
          sx + rand(-LIFE.cell * 0.2, LIFE.cell * 0.2), sy + rand(-LIFE.cell * 0.2, LIFE.cell * 0.2));
        auraBirths++; changes++;
      }
      continue;
    }
    // 宜居生长：受总数上限与种群压力调节
    if (climateBirths >= LIFE.noise.cap || enemies.length >= LIFE.maxEnemies) continue;
    if (noiseV[gy * cols + gx] > LIFE.noise.fertile && n8(gx, gy) >= 1 && Math.random() < LIFE.noise.birthP * clamp(2.2 - pressure, 0.4, 2.2)) {
      spawnEnemy(LIFE.pool[randInt(0, LIFE.pool.length - 1)], 1,
        sx + rand(-LIFE.cell * 0.2, LIFE.cell * 0.2), sy + rand(-LIFE.cell * 0.2, LIFE.cell * 0.2));
      climateBirths++; changes++;
    }
  }
  if (changes) generation++;
  // 求生底线：种群过低时种下 2×2 方块（各规则下皆稳定）—— 生命自会找到出路，棋盘不会走向空寂
  if (enemies.length < LIFE.rescueMin) {
    let rescue = 0;
    for (let gy = 0; gy < rows - 1 && rescue < 2; gy++) for (let gx = 0; gx < cols - 1; gx++) {
      if (rescue >= 2) break;
      const quad = [[gx, gy], [gx + 1, gy], [gx, gy + 1], [gx + 1, gy + 1]];
      if (quad.some(([qx, qy]) => counts[qy * cols + qx] > 0)) continue;
      if (n8(gx, gy) < 1) continue;
      const shape = LIFE.pool[randInt(0, LIFE.pool.length - 1)];
      for (const [qx, qy] of quad) {
        spawnEnemy(shape, 1, (qx + 0.5) * LIFE.cell, (qy + 0.5) * LIFE.cell);
      }
      rescue++; changes++;
    }
  }
  // 变异：每代轻拨几个格子 —— 经典规则的宿命是落定成"灰烬"（全是稳定子），
  // 一点点随机扰动会重新点燃灰烬、引发新的级联，棋盘因此永不冷却
  for (let m = 0; m < LIFE.mutations; m++) {
    const gx = randInt(0, cols - 1), gy = randInt(0, rows - 1);
    const occupants = (cells.get(gy * cols + gx) || []).filter(e => !e.dead && !e.dying);
    if (occupants.length) {
      for (const e of occupants) { e.dying = true; e.fadeT = 0.4; }
    } else if (enemies.length < LIFE.maxEnemies) {
      spawnEnemy(LIFE.pool[randInt(0, LIFE.pool.length - 1)], 1,
        (gx + 0.5) * LIFE.cell, (gy + 0.5) * LIFE.cell);
    }
    changes++;
  }
  for (let i = enemies.length - 1; i >= 0; i--) if (enemies[i].dead) enemies.splice(i, 1);
}

/* ---------------- 烟花 ---------------- */
const fireworks = [];   // 礼花弹引信队列 {t, x, y, color}
function updateFireworks(dt) {
  for (let i = fireworks.length - 1; i >= 0; i--) {
    const f = fireworks[i];
    f.t -= dt;
    if (f.t > 0) continue;
    fireworks.splice(i, 1);
    fireworkBurst(f.x, f.y, f.color);
  }
}
function fireworkBurst(x, y, color) {
  addPart({ kind: 'flash', x, y, life: 0.22, maxLife: 0.22, size: 26, color: '#fff2dc' });
  ringFx(x, y, color, 190, 2, 0.4);
  const n = 26;
  for (let i = 0; i < n; i++) {                     // 主层：放射火星
    const a = (i / n) * TAU + rand(-0.08, 0.08);
    const spd = rand(110, 260);
    addPart({ kind: 'dot', x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, life: rand(0.55, 0.95), maxLife: 0.95, size: rand(1.5, 3), color, drag: 1.5 });
  }
  for (let i = 0; i < 9; i++) {                     // 金色余烬：缓缓飘落
    const a = rand(0, TAU), spd = rand(30, 110);
    addPart({ kind: 'dot', x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, life: rand(0.9, 1.5), maxLife: 1.5, size: rand(1, 2), color: '#ffe6c2', drag: 0.6, gr: 130 });
  }
}

/* ---------------- 播种落地 / 清理消散 ---------------- */
function updateSeeds(dt) {
  for (let i = pendingSeeds.length - 1; i >= 0; i--) {
    const s = pendingSeeds[i];
    s.t -= dt;
    if (s.t > 0) continue;
    pendingSeeds.splice(i, 1);
    if (state !== 'playing') continue;   // 播种不受总数上限约束：玩家主动行为优先落地
    const cx = (s.gx + 0.5) * LIFE.cell, cy = (s.gy + 0.5) * LIFE.cell;
    // 已被占用的格子跳过：同格堆叠会把稳定图案挤成拥挤死
    if (enemies.some(e => !e.dead && e.hx === cx && e.hy === cy)) continue;
    spawnEnemy(s.type, s.level, cx, cy);
    seedsPlanted++;
  }
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].dead) enemies.splice(i, 1);
  }
}

/* ---------------- 开始 / 小憩 ---------------- */
function startGame() {
  enemies.length = 0; bullets.length = 0; parts.length = 0; texts.length = 0; holes.length = 0;
  pendingSeeds.length = 0; scars.length = 0; mapHoleTimer = 4;
  const p = player;
  p.x = WORLD.w / 2; p.y = WORLD.h / 2; p.vx = p.vy = 0;
  p.r = 16;
  p.dashT = 0; p.fieldT = 0; p.ghostT = 0; p.thrT = 0;
  for (const k in skills) skills[k].t = 0;
  kills = 0; playTime = 0; seedsPlanted = 0; mapHolesSpawned = 0;
  generation = 0; lifeTimer = 2.5;
  boss = null; freeze = 0; flashW = 0;
  resting = false;
  ui.menu.classList.add('hidden');
  ui.hud.classList.remove('hidden');
  cam.x = p.x; cam.y = p.y; cam.trauma = 0;
  state = 'playing';
  syncTools();                                   // 按钮层进入对局态（须在 state 之后）
  // 本局世界：随机种子长出初始种群，之后全交给生命规则
  lifeSeed = 10000 + Math.floor(Math.random() * 89999);
  initClimate(lifeSeed);
  seedWorld(mulberry32(lifeSeed));
  showBanner('世界 #' + lifeSeed, '#9db4d0');
  Music.start();   // 冥想配乐随呼吸响起
}
// 静坐总结：一张安静的卡片，痕迹一览（游戏不暂停）
function toggleSummary() {
  ui.sumOv.classList.toggle('hidden');
  updateSummary();
}
function updateSummary() {
  if (ui.sumOv.classList.contains('hidden')) return;
  const t = Math.floor(playTime);
  ui.sumTime.textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
  ui.sumGen.textContent = generation;
  ui.sumSeeds.textContent = seedsPlanted;
  ui.sumKills.textContent = kills;
  ui.sumHoles.textContent = mapHolesSpawned;
}

// 小憩：不暂停世界 —— 只隐去界面，杂念按生命规则继续演变
function toggleRest() {
  resting = !resting;
  ui.hud.classList.toggle('hidden', resting);
  showBanner(resting ? '小憩 · 世界继续演变' : '回来 · 一切照常呼吸', '#9db4d0', true);
  syncTools();
}

/* ---------------- 开关类操作（键盘与触屏按钮共用） ---------------- */
function toggleMute() {
  Sfx.muted = !Sfx.muted;
  showBanner(Sfx.muted ? '静音' : '声音开启', '#9db4d4', true);
  syncTools();
}
function toggleBreath() {
  breathOn = !breathOn;
  showBanner(breathOn ? '呼吸引导 开' : '呼吸引导 关', '#ffd9a8', true);
  syncTools();
}

/* ---------------- 全屏（手机 / 桌面通用，失败时给出可读提示） ---------------- */
function isFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
}
function toggleFullscreen() {
  const de = document.documentElement;
  if (isFullscreen()) {
    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if (exit) { try { exit.call(document); } catch (e) { /* 忽略 */ } }
    return;
  }
  const req = de.requestFullscreen || de.webkitRequestFullscreen || de.msRequestFullscreen;
  if (!req) {
    // iOS Safari 不支持元素级全屏：引导用「添加到主屏幕」获得同样效果
    showBanner('此浏览器不支持全屏 · 可在菜单里选「添加到主屏幕」', '#9db4d4', true);
    return;
  }
  try {
    const p = req.call(de, { navigationUI: 'hide' });
    if (p && typeof p.catch === 'function') {
      p.catch(() => showBanner('进入全屏被浏览器拒绝 · 请再点一次', '#9db4d4', true));
    }
  } catch (e) {
    showBanner('进入全屏被浏览器拒绝 · 请再点一次', '#9db4d4', true);
  }
  viewportChanged();
  setTimeout(viewportChanged, 150);
}
function syncTools() {
  const playing = state === 'playing';
  document.documentElement.classList.toggle('in-menu', !playing);   // 菜单态：工具按钮让开面板
  document.querySelectorAll('.tool-play').forEach((el) => el.classList.toggle('hidden', !playing));
  const fs = document.querySelector('[data-tool="fs"]');
  if (fs) { const on = isFullscreen(); fs.classList.toggle('on', on); fs.textContent = on ? '退出全屏' : '全屏'; }
  const br = document.querySelector('[data-tool="breath"]');
  if (br) br.classList.toggle('on', breathOn);
  const mu = document.querySelector('[data-tool="mute"]');
  if (mu) mu.classList.toggle('on', !Sfx.muted);
  const rt = document.querySelector('[data-tool="rest"]');
  if (rt) rt.textContent = resting ? '回来' : '小憩';
}

/* ---------------- 横幅 ---------------- */
function showBanner(txt, color, small) {
  ui.banner.textContent = txt;
  ui.banner.style.color = color || '#fff';
  ui.banner.classList.toggle('small', !!small);   // 字号交给 CSS clamp，窄屏才不会溢出
  ui.banner.classList.remove('show');
  void ui.banner.offsetWidth;
  ui.banner.classList.add('show');
}

/* ---------------- 主更新 ---------------- */
function update(dt, realDt) {
  playTime += realDt;
  cam.trauma = Math.max(0, cam.trauma - 1.7 * realDt);
  flashW = Math.max(0, flashW - realDt * 2.6);
  // 技能冷却倒数（另有开局重置与光尘拾取缩短）
  for (const k in skills) skills[k].t = Math.max(0, skills[k].t - dt);

  // 鼠标世界坐标
  mouse.wx = mouse.x - W / 2 + cam.x;
  mouse.wy = mouse.y - H / 2 + cam.y;

  if (state === 'playing') {
    updatePlayer(dt);
    // 生命演化：每代间隔走游戏时钟，小憩时世界照常运转；止水让演化变慢
    lifeTimer -= dt * (player.fieldT > 0 ? 0.2 : 1);
    if (lifeTimer <= 0) { lifeTimer += LIFE.tick; lifeStep(); }
  }
  for (const e of enemies) if (!e.dead) updateEnemy(e, dt);
  updateBullets(dt);
  updateFireworks(dt);
  updateSeeds(dt);
  // 地图黑洞：随机浮现的小型归心 —— 消灭过密处的一部分生命，过境留下沃土
  mapHoleTimer -= dt;
  if (mapHoleTimer <= 0) {
    mapHoleTimer = rand(6, 10);
    holes.push({ x: rand(80, WORLD.w - 80), y: rand(80, WORLD.h - 80), t: 2.0, tick: 0, spin: rand(0, TAU), dmg: 8, boomDmg: 60, scale: 0.6, map: true });
    mapHolesSpawned++;
  }
  updateHoles(dt);
  updateParts(dt);

  // 摄像机跟随：触屏不做鼠标视差（没有悬停语义），桌面仍轻微朝瞄准点偏移
  const k = 1 - Math.exp(-6 * dt);
  const par = (COARSE || !mouse.aim) ? 0 : 0.12;
  cam.x = lerp(cam.x, player.x + (mouse.x - W / 2) * par, k);
  cam.y = lerp(cam.y, player.y + (mouse.y - H / 2) * par, k);
  cam.x = WORLD.w < W ? WORLD.w / 2 : clamp(cam.x, W / 2, WORLD.w - W / 2);
  cam.y = WORLD.h < H ? WORLD.h / 2 : clamp(cam.y, H / 2, WORLD.h - H / 2);
}

/* ---------------- 渲染 ---------------- */
function render() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  // 背景
  ctx.fillStyle = '#131022';
  ctx.fillRect(0, 0, W, H);

  // 星空（两层视差，屏幕空间）—— 亮度随呼吸起伏
  const dim = breathOn ? 0.72 + 0.28 * breath.v : 1;
  drawStars(0.25, 170, 1.4, 0.3 * dim);
  drawStars(0.5, 120, 2, 0.45 * dim);

  // 世界坐标
  const sh = cam.trauma * cam.trauma * 16;
  const sx = rand(-1, 1) * sh, sy = rand(-1, 1) * sh;
  ctx.save();
  ctx.translate(W / 2 - cam.x + sx, H / 2 - cam.y + sy);

  drawGrid();
  // 世界边界
  const ga = breathOn ? 0.24 * (0.7 + 0.3 * breath.v) : 0.24;
  ctx.lineWidth = 3;
  ctx.strokeStyle = `rgba(255,217,168,${ga.toFixed(3)})`;
  ctx.strokeRect(0, 0, WORLD.w, WORLD.h);
  ctx.lineWidth = 10;
  ctx.strokeStyle = `rgba(255,217,168,${(ga * 0.22).toFixed(3)})`;
  ctx.strokeRect(0, 0, WORLD.w, WORLD.h);

  drawHoles();
  for (const e of enemies) drawEnemy(e);
  drawBullets();
  if (state === 'playing') drawPlayer();
  drawParts();
  drawTexts();
  // 触屏瞄准标记：手机没有悬停，把归心 / 流步的落点亮出来，点按才更新
  if (state === 'playing' && COARSE && mouse.aim) drawAim();

  ctx.restore();

  // 屏幕空间特效
  if (player.fieldT > 0 && state !== 'menu') {
    ctx.fillStyle = 'rgba(70,150,255,0.06)';
    ctx.fillRect(0, 0, W, H);
  }
  if (flashW > 0) { ctx.fillStyle = `rgba(255,242,220,${(flashW * 0.55).toFixed(3)})`; ctx.fillRect(0, 0, W, H); }
  drawIndicators();
  updateBreathDom();
}
function drawStars(f, spacing, size, alpha) {
  const ox = cam.x * f, oy = cam.y * f;
  const x0 = Math.floor((ox - W / 2) / spacing) - 1, x1 = Math.ceil((ox + W / 2) / spacing) + 1;
  const y0 = Math.floor((oy - H / 2) / spacing) - 1, y1 = Math.ceil((oy + H / 2) / spacing) + 1;
  ctx.fillStyle = `rgba(235,220,255,${alpha})`;
  for (let gx = x0; gx <= x1; gx++) {
    for (let gy = y0; gy <= y1; gy++) {
      const h = hash(gx * 374761 + gy * 668265);
      if (h > 0.4) continue;
      const px = gx * spacing + hash(gx * 127 + gy) * spacing - ox + W / 2;
      const py = gy * spacing + hash(gx - gy * 311) * spacing - oy + H / 2;
      ctx.fillRect(px, py, size, size);
    }
  }
}
function drawGrid() {
  const step = LIFE.cell;   // 可见网格 = 生命棋盘本身（24px 细格）
  const x0 = Math.max(0, Math.floor((cam.x - W / 2) / step) * step);
  const x1 = Math.min(WORLD.w, cam.x + W / 2);
  const y0 = Math.max(0, Math.floor((cam.y - H / 2) / step) * step);
  const y1 = Math.min(WORLD.h, cam.y + H / 2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(180,160,230,0.075)';
  ctx.beginPath();
  for (let x = x0; x <= x1; x += step) { ctx.moveTo(x, Math.max(0, cam.y - H / 2)); ctx.lineTo(x, Math.min(WORLD.h, cam.y + H / 2)); }
  for (let y = y0; y <= y1; y += step) { ctx.moveTo(Math.max(0, cam.x - W / 2), y); ctx.lineTo(Math.min(WORLD.w, cam.x + W / 2), y); }
  ctx.stroke();
}
function drawHoles() {
  for (const h of holes) {
    const sc = h.scale || 1;
    drawGlow(h.x, h.y, 90 * sc * (1 + Math.sin(h.spin * 2) * 0.05), '#a88ae0', 0.4);
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.rotate(h.spin);
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, (34 + i * 16) * sc, i * 2.1, i * 2.1 + 3.6);
      ctx.lineWidth = (2.5 - i * 0.5);
      ctx.strokeStyle = hexA(i ? '#a88ae0' : '#ffe6c2', 0.5);
      ctx.stroke();
    }
    ctx.restore();
    shapePath('circle', h.x, h.y, 26 * sc, 0);
    ctx.fillStyle = '#0c0918';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#a88ae0';
    ctx.stroke();
  }
}
function drawEnemy(e) {
  const sc = e.spawnT > 0 ? 0.25 + 0.75 * (1 - e.spawnT / 0.35) : 1;
  const bv = breathOn ? breath.v : 0.5;
  const fade = e.dying ? clamp(e.fadeT / 0.4, 0, 1) : 1;     // 消散：安静地缩小、渐隐
  const r = e.r * sc * (1 + 0.08 * (bv - 0.5)) * (0.4 + 0.6 * fade);
  // 生物节点不加光晕：只靠形状描边与淡淡填充读形，棋盘更干净（呼吸仍体现在半径起伏上）
  ctx.globalAlpha = fade;
  drawShape(e.def.shape, e.x, e.y, r, e.angle,
    hexA(e.def.color, 0.14), e.hitFlash > 0 ? '#ffffff' : e.def.color, e.type === 'boss' ? 4 : 2.5);
  ctx.globalAlpha = 1;

  // 巨核外环
  if (e.type === 'boss') {
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(e.angle * 0.7);
    ctx.setLineDash([18, 12]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = hexA('#a88ae0', 0.4);
    ctx.beginPath();
    ctx.arc(0, 0, r + 14, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
  // 细胞受伤不画血条：只保留 hitFlash 的轻微白闪 —— 棋盘上几百枚细胞挂条会毁掉整体图案
}
function drawBullets() {
  ctx.globalCompositeOperation = 'lighter';
  for (const b of bullets) {
    drawGlow(b.x, b.y, b.r * 2.1, b.color, 0.6);
    ctx.strokeStyle = b.color;
    ctx.lineWidth = b.r * 0.9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(b.x - b.vx * 0.018, b.y - b.vy * 0.018);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r * 0.45, 0, TAU);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineCap = 'butt';
}
function drawPlayer() {
  const p = player;
  // 冥想呼吸：吸气变大变亮、呼气收缩变暗（仅视觉缩放，碰撞半径不变）
  const bv = breathOn ? breath.v : 0.5;
  const rr = p.r * (1 + 0.16 * (bv - 0.5));
  // 主辉光：颜色随阶段金→白→紫、明暗大小随呼吸值 —— 瞥一眼角色即可读出节律
  if (breathOn) drawBreathGlow(p.x, p.y, rr * (2.0 + 1.1 * bv), 0.2 + 0.5 * bv);
  else drawGlow(p.x, p.y, rr * (1.8 + 0.9 * bv), '#ffc98a', 0.15 + 0.45 * bv);
  shapePath('circle', p.x, p.y, rr, 0);
  ctx.fillStyle = 'rgba(255,217,168,0.14)';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffd9a8';
  ctx.stroke();
  shapePath('circle', p.x, p.y, rr * 0.45, 0);
  ctx.fillStyle = hexA('#fff2dc', 0.5 + 0.5 * bv);
  ctx.fill();
  // 止水力场圈
  if (p.fieldT > 0) {
    ctx.save();
    ctx.setLineDash([14, 10]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = hexA('#b39ae0', 0.3 + 0.25 * Math.sin(performance.now() / 180));
    ctx.beginPath();
    ctx.arc(p.x, p.y, 360, performance.now() / 900, performance.now() / 900 + TAU);
    ctx.stroke();
    ctx.restore();
  }
  // 呼吸光环：吸气外扩变亮、屏息最大最亮停住、呼气收拢淡出；颜色随阶段金→白→紫平滑过渡
  if (breathOn) {
    const col = haloRGB();
    const a = 0.14 + 0.42 * bv;
    const ringR = rr + 12 + 30 * bv;
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = rgbaA(col, a);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, ringR, 0, TAU);
    ctx.stroke();
    // 柔光外晕：余光也能扫到节律
    ctx.strokeStyle = rgbaA(col, a * 0.4);
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(p.x, p.y, ringR + 8 + 5 * bv, 0, TAU);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }
}
function drawParts() {
  ctx.globalCompositeOperation = 'lighter';
  for (const p of parts) {
    const t = clamp(p.life / p.maxLife, 0, 1);
    if (p.kind === 'dot') {
      ctx.globalAlpha = t;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.5 + t * 0.5), 0, TAU);
      ctx.fill();
    } else if (p.kind === 'shard') {
      ctx.globalAlpha = t;
      shapePath(p.shape, p.x, p.y, p.size, p.ang);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    } else if (p.kind === 'ring') {
      ctx.globalAlpha = t * 0.9;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, TAU);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.lw * t;
      ctx.stroke();
    } else if (p.kind === 'streak') {
      ctx.globalAlpha = t;
      const a = Math.atan2(p.vy, p.vx);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - Math.cos(a) * p.size, p.y - Math.sin(a) * p.size);
      ctx.stroke();
    } else if (p.kind === 'flash') {
      ctx.globalAlpha = t * 0.8;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1.4 - t * 0.4), 0, TAU);
      ctx.fill();
    } else if (p.kind === 'ghost') {
      ctx.globalAlpha = t * 0.5;
      shapePath(p.shape, p.x, p.y, p.r, p.ang);
      ctx.strokeStyle = '#ffd9a8';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}
function drawTexts() {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const t of texts) {
    const a = clamp(t.life / t.maxLife, 0, 1);
    ctx.globalAlpha = a;
    ctx.font = `800 ${t.size}px "PingFang SC","Microsoft YaHei",sans-serif`;
    ctx.fillStyle = t.color;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 3;
    ctx.strokeText(t.txt, t.x, t.y);
    ctx.fillText(t.txt, t.x, t.y);
  }
  ctx.globalAlpha = 1;
}
// 触屏瞄准环：手机没有鼠标悬停，用这圈虚线告诉玩家归心 / 流步会落在哪儿
function drawAim() {
  const x = mouse.wx, y = mouse.wy;
  const t = performance.now() / 600;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.setLineDash([6, 10]);
  ctx.lineDashOffset = -t * 24;
  ctx.strokeStyle = 'rgba(255,217,168,0.34)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x, y, 26 + Math.sin(t) * 2, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(255,217,168,0.5)';
  ctx.beginPath();
  ctx.moveTo(x - 8, y); ctx.lineTo(x + 8, y);
  ctx.moveTo(x, y - 8); ctx.lineTo(x, y + 8);
  ctx.stroke();
  ctx.restore();
}

function drawIndicators() {
  if (state !== 'playing') return;
  for (const e of enemies) {
    if (e.type !== 'elite' && e.type !== 'boss') continue;
    const sx = e.x - cam.x + W / 2, sy = e.y - cam.y + H / 2;
    if (sx > 40 && sx < W - 40 && sy > 40 && sy < H - 40) continue;
    const cx = clamp(sx, 48, W - 48), cy = clamp(sy, 48, H - 48);
    const a = Math.atan2(sy - cy, sx - cx);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(a);
    ctx.fillStyle = e.def.color;
    ctx.globalAlpha = 0.75 + 0.25 * Math.sin(performance.now() / 150);
    ctx.beginPath();
    ctx.moveTo(12, 0); ctx.lineTo(-7, 7); ctx.lineTo(-7, -7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

/* ---------------- HUD 同步 ---------------- */
function setCool(el, skill) {
  const el2 = el.querySelector('.cool');
  const pct = skill.t > 0 ? (skill.t / skill.cd) * 100 : 0;
  el2.style.background = `conic-gradient(rgba(5,8,16,.82) ${pct}%, transparent ${pct}%)`;
  el.classList.toggle('ready', skill.t <= 0);
}
function syncHud() {
  const t = Math.floor(playTime);
  ui.timeNum.textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
  ui.waveNum.textContent = generation;
  setCool(ui.skDash, skills.dash);
  setCool(ui.skNova, skills.nova);
  setCool(ui.skField, skills.field);
  setCool(ui.skHole, skills.hole);
}

/* ---------------- 主循环 ---------------- */
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const realDt = Math.min((now - last) / 1000, 1 / 30);
  last = now;
  // 每帧校对视口尺寸：全屏、缩放、转向、手机地址栏收起都能立刻收敛到新画幅
  resize();
  if (worldDirty) { worldDirty = false; syncWorld(); }
  breath = breathInfo();   // 冥想呼吸节拍（真实时钟）
  updateHaloColor(realDt); // 角色光晕颜色平滑跟随呼吸阶段
  if (freeze > 0) { freeze -= realDt; render(); return; }

  if (state === 'playing') {
    update(realDt, realDt);
  }
  Music.tick();            // 配乐调度（和弦轮换 / 呼吸涨落 / 风铃）
  render();
  if (state === 'playing' && !resting) syncHud();
  updateSummary();
}
requestAnimationFrame(frame);

/* ---------------- 测试钩子 ---------------- */
window.__game = {
  start: startGame,
  get state() { return state; },
  get wave() { return generation; },          // 兼容旧钩子名：现返回演化世代
  get generation() { return generation; },
  get seed() { return lifeSeed; },
  get kills() { return kills; },
  get stats() { return { time: playTime, gen: generation, seeds: seedsPlanted, kills, holes: mapHolesSpawned }; },
  player, enemies, bullets, holes, scars, texts, parts,
  cam, mouse, keys: () => ({ ...keys }), Music, skills,
  spawnEnemyAt: (type, lvl, x, y) => spawnEnemy(type, lvl, x, y),
  lifeStepNow: () => lifeStep(),              // 手动演化一代（测试用）
  setLifeTimer: (v) => { lifeTimer = v; },    // 冻结/推进自动演化（测试用）
  setRescue: (n) => { LIFE.rescueMin = n; },  // 开关求生底线（测试用）
  setRule: (b, s, name) => { LIFE.rule = { b, s, name: name || 'custom' }; },   // 换生命规则（测试用）
  setLonelyDeath: (p) => { LIFE.lonelyP = clamp(p, 0, 1); },  // 孤细胞随机死亡率（测试用）
  get lonelyP() { return LIFE.lonelyP; },
  get LIFE() { return LIFE; },                                // 直读常量表（测试用）
  get lonelyDeaths() { return lonelyDeathCount; },            // 累计孤独消散数
  noiseAt: (gx, gy) => climate.fbm((gx - climate.dx) * LIFE.noise.scale, (gy - climate.dy) * LIFE.noise.scale),   // 采样气候场
};

function syncWorld() {
  LIFE.cell = pickCell();                          // 窄屏收小格子，手机竖屏也留够演化空间
  // 世界尺寸对齐到整格且不超过视口：环面拓扑与 drawGrid 严格一致，
  // 棋盘边框完整可见，最后一行细胞也不会被切在视口外
  const cols = Math.max(8, Math.floor(W / LIFE.cell)), rows = Math.max(8, Math.floor(H / LIFE.cell));
  WORLD.w = cols * LIFE.cell; WORLD.h = rows * LIFE.cell;
  LIFE.maxEnemies = COARSE ? 420 : 800;            // 手机端算力有限，粒子上限收紧
  partCap = COARSE ? 380 : 650;                    // 同上：移动端粒子上限收紧
  for (const e of enemies) {
    const gx = clamp(Math.floor(e.hx / LIFE.cell), 0, cols - 1);
    const gy = clamp(Math.floor(e.hy / LIFE.cell), 0, rows - 1);
    e.hx = (gx + 0.5) * LIFE.cell;
    e.hy = (gy + 0.5) * LIFE.cell;
    e.x = e.hx; e.y = e.hy;
  }
  player.x = clamp(player.x, player.r, WORLD.w - player.r);
  player.y = clamp(player.y, player.r, WORLD.h - player.r);
  cam.x = WORLD.w / 2; cam.y = WORLD.h / 2;
  cam.trauma = 0;
  mouse.x = clamp(mouse.x, 0, W); mouse.y = clamp(mouse.y, 0, H);
  syncTools();
}
syncWorld();

/* ---------------- 按钮绑定（触屏 / 鼠标 / 键盘等价） ---------------- */
ui.btnStart.addEventListener('click', (e) => { e.preventDefault(); Sfx.ensure(); startGame(); });

const SKILL_ACT = { dash: tryDash, nova: tryNova, field: tryField, hole: tryHole };
document.querySelectorAll('[data-skill]').forEach((el) => {
  const act = SKILL_ACT[el.getAttribute('data-skill')];
  if (!act) return;
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); Sfx.ensure(); act(); });
  // 键盘可达：回车施放，空格仍交给全局（止水）避免重复施法
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); act(); } });
});

const TOOL_ACT = {
  fs: toggleFullscreen,
  breath: toggleBreath,
  mute: toggleMute,
  rest: () => { if (state === 'playing') toggleRest(); },
  summary: () => { if (state === 'playing') toggleSummary(); },
};
document.querySelectorAll('[data-tool]').forEach((el) => {
  const act = TOOL_ACT[el.getAttribute('data-tool')];
  if (!act) return;
  el.addEventListener('click', (e) => { e.preventDefault(); Sfx.ensure(); act(); });
});

/* ---------------- 呼吸配乐音量滑杆 ---------------- */
ui.musicVol.value = Math.round(Music.vol * 100);
ui.musicVol.addEventListener('input', () => {
  Music.vol = clamp(ui.musicVol.value / 100, 0, 1.5);
  try { localStorage.setItem('circle-music-vol', String(Music.vol)); } catch (e) { /* 沙箱忽略 */ }
});

/* ---------------- 移动端页面行为兜底 ---------------- */
// 禁止 iOS 双指缩放页面 / 拖动橡皮筋，视口尺寸完全交给 viewportChanged 处理
['gesturestart', 'gesturechange', 'gestureend'].forEach((t) => {
  document.addEventListener(t, (e) => e.preventDefault(), { passive: false });
});
document.addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
// 回到前台：恢复被系统挂起的音频上下文，避免配乐哑火
document.addEventListener('visibilitychange', () => {
  if (document.hidden || !Sfx.ctx || Sfx.ctx.state !== 'suspended') return;
  try {
    Sfx.ctx.resume().then(() => { Music.prevX = (performance.now() / 1000) % 14; }, () => {});
  } catch (e) { /* 忽略 */ }
});
