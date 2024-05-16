---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: EveryThing
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
[[NTFS]] 
----

# EveryThing
everyting针对**NFS**文件系统，靠遍历`USN journal`+同时创建索引。
> 创建索引快是因为遍历`USN journal`，搜索快是因为建立了索引

## NTFS
在[[NTFS]]文件系统中，有一个特殊的表，称为MTF表。所有文件夹和文件的名称都被存储在该表中，访问该表的速度非常快，使应用程序可以不遍历文件系统就能获取当前卷（磁盘）中的所有文件的名称和路径
**USN journal**
NTFS还有一个日志功能。所有对文件系统有修改的操作都被记录在了一个journal[日志文件](https://www.zhihu.com/search?q=%E6%97%A5%E5%BF%97%E6%96%87%E4%BB%B6&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A23020795%7D)中。