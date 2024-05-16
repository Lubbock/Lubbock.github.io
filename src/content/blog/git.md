---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: git
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---

查看文件修改记录
## log
```sh
git log --filename
git log --pretty=tformat: --since="2023-04-19" --until="2023-08-11" --nu
mstat|gawk '{ add += $1 ; subs += $2 ; loc += $1 + $2} END { printf "add lines: %s remove lines: %s total line
s %s\n",add,subs,loc }'
```

## stash
临时存储未提交文件
```sh
git stash list #查看存储记录
```
存储文件，标记此次储藏
```sh
git stash save [stashMessage]
```

取出最后一次储藏
```sh
git stash pop
```

取出指定储藏
```sh
git stash apply stash@{index}

删除指定记录
git stash drop stash@{index}
```
