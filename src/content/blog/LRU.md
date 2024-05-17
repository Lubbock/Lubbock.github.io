---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: LRU
featured: false
draft: false
tags:
 - 算法
description: this is auto generate
---


 LRU 是 Least Recently Used 的缩写，即最近最少使用，是内存管理的一种页面置换算法。算法的核心是：如果一个数据在最近一段时间内没有被访问到，那么它在将来被访问的可能性也很小。换言之，当内存达到极限时，应该把内存中最久没有被访问的数据淘汰掉。
         那么，如何表示这个最久呢？Redis 在实现上引入了一个 LRU 时钟来代替 unix 时间戳，每个对象的每次被访问都会记录下当前服务器的 LRU 时钟，然后用服务器的 LRU 时钟减去对象本身的时钟，得到的就是这个对象没有被访问的时间间隔（也称空闲时间），空闲时间最大的就是需要淘汰的对象。
