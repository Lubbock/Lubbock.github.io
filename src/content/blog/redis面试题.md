---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: redis面试题
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
## redis
### 缓存一致性
1. 更新数据库先更新在删除缓存
		1. 直接插入缓存，或者更新缓存 容易引发并发问题
1. 查找数据，先查缓存 缓存没有在查数据库
### 缓存击穿
大量请求访问同一热点key，如果数据恰好此时过期。会直接打到数据库
1. 热点数据永不过期
2. 使用互斥锁

### 缓存穿透
查找缓存和数据库中都不存在的数据
### 缓存雪崩
多个热点key同一时间失效，直接打到数据库
1. 失效时间加随机数
2. 设置缓存不过期
