# AGENTS.md · Lubbock.github.io

## 这个仓库是什么

- 这是 GitHub Pages 站点根目录，也是「圈圈冥想 · Circle Calm」网页游戏的发布位置。
- 站点是纯静态文件：`index.html`、`style.css`、`game.js`。没有构建步骤。
- 推送到 `master` 会触发 `.github/workflows` 里的 Deploy to GitHub Pages，直接上线。

## 改动完成后自动推送（用户已授权）

改完本仓库的文件并通过校验后，直接提交并推送，不必再次征求确认。按顺序执行：

1. 校验：`node --check game.js`；CSS 括号必须平衡；HTML 里引用的文件名保持 `style.css`、`game.js`。
2. 检查改动范围：`git status --porcelain`。只允许出现本次任务相关的站点文件。
3. 提交：`git add <改动的文件>` + `git commit -m "<一句话中文说明>"`。
4. 推送：`git push origin master`。
5. 回报结果：把 commit 短哈希与推送结论写进回复。

## 边界

- 不要 `git push --force`，不要改写历史，不要改分支名。
- 不要提交临时文件、调试脚本、截图、`node_modules`、测试脚手架。
- 不要修改 `.github/` 下的部署配置，除非用户明确要求。
- 不要提交密钥、token、私密地址。
- 校验失败或推送失败时：停下并说明原因，不要为了「让检查通过」删掉功能或断言。
- 保留与本次任务无关的已有改动。发现意外的未提交改动时先说明，再决定是否处理。

## 这个游戏的技术要点

- 画面尺寸的唯一真值来自 `game.js` 里的 `resize()`：它写入画布位图尺寸与 CSS 尺寸，并把可视视口尺寸写进 `--vh` / `--vw`。
- `canvas` 是替换元素。只写 `position: fixed; inset: 0` 不会把它拉伸到视口，高分屏上画面会被放大 `devicePixelRatio` 倍。CSS 与 `resize()` 里的显式尺寸就是这个 bug 的防线，不要删除。
- 所有 UI 层（`#hud`、`.overlay`、`#tools`、`#vignette`、`canvas`）用绝对定位挂在 `body` 上，`body` 尺寸等于可视视口。这样 iOS 地址栏不会遮住底部控件。
- 需要同时支持三种环境：手机触摸、桌面鼠标键盘、浏览器窗口缩放与全屏。改动布局后，至少在这三种尺寸自测：390×844、844×390、1600×900。
- 棋盘尺寸等于视口尺寸，并对齐到整格（`syncWorld()`）。窄屏格子会更小，种群目标随格子数量缩放。
- 触摸与鼠标共用 Pointer Events 入口；`data-skill` 与 `data-tool` 属性是按钮与游戏逻辑的唯一绑定点。
