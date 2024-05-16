---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: snowfake
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
# 雪花算法

分布式Id特点

|特点|描述|
|-------|-------|
|全局唯一性|不能出现重复id标识|
|递增性|确保生成ID对于用户或业务是递增|
|高可用性|确保任何时候都能生成正确的ID|
|高性能性|在高并发的环境下依然表现良好|

> Twitter开源的由64位整数组成分布式ID，性能较高，并且在单机上递增

组成部分


1. 占用1bit，其值始终是0，没有实际作用
2. 时间戳占用41bit，精确到毫秒，总共可以容纳约69年的时间
3. 工作机器id,占用10bit，其中高位5bit是数据中心ID，低位5bit是工作节点ID，做多可以容纳1024个节点
4. 序列号 占用12bit，每个节点每毫秒0开始不断累加，最多可以累加到4095，一共可以产生4096个ID

<!-- ![snowfake](./snowfake64bit.jfif) -->
