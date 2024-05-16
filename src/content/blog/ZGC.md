---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: ZGC
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
### 分代收集理论
#### 分代假说
- 弱分代假说：绝大数对象都是朝生夕灭
- 强分代假说：熬过月多次垃圾收集过程的对象就越难以消亡
- 跨代引用假说：跨代引用相对于同代引用占小数 **Remembered Set**记录哪一块内存存在跨代引用
#### 回收类型
- PartialGc 部分收集
- Minor Gc 新生代收集
- MajorGc 老年代收集 目前只有CMS有单独收集老年代行为
- Full GC
- Mixed GC 目标是新生代和部分老年代的垃圾收集

**染色指针**

#### [[垃圾回收算法]]