---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: Linux文件
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---

给文件设置属性变量

```sh
setfattr -n user.foo -v bar test #设置 
getfattr -n user.foo test # 读取 
setfattr -x user.foo test  # 删除 
attr -lq test # 列举属性，不包含命名空间 
getfattr -d -m ".*"  test # 列举所有属性，包含命名空间 
```