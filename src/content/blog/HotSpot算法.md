---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: HotSpot算法
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
#### 根节点枚举
- 目前所有实现，必须暂停用户线程
#### 安全点
- 安全点的设定，决定了用户程序执行时并非在代码指令流任意位置都能够停留下来做垃圾收集
- 必须到达安全点后才能暂停
#### 安全区域
#### 记忆集和卡表
- 解决对象跨代引用带来的问题，在新生代建立remembered set,避免把老年代加入GC Roots扫描范围
#### 写屏障
#### 并发的可达性分析