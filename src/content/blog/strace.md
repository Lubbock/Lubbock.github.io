---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: strace
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
#linux #跟踪调试
在调试的时候，strace能帮助你追踪到一个程序所执行的系统调用。当你想知道程序和操作系统如何交互的时候，这是极其方便的，比如你想知道执行了哪些系统调用，并且以何种顺序执行。

这个简单而又强大的工具几乎在所有的Linux操作系统上可用，并且可被用来调试大量的程序。
最简单的形式，strace后面可以跟任何命令。它将列出许许多多的系统调用。一开始，我们并不能理解所有的输出，但是如果你正在寻找一些特殊的东西，那么你应该能从输出中发现它。

让我们来看看简单命令ls的系统调用跟踪情况
```sh
strace ls
```

1. 寻找被程序读取得配置文件
```sh
strace php 2>&1 | grep php.ini
```
2. strace命令的-e选项仅仅被用来展示特定的系统调用（例如，open，write等等）
```sh
strace -e open cat dead.letter
```

3. 跟踪进程
```sh
strace -p 1846
```

4. 整洁方式展示
```sh
strace -c ls
```

5. 保存输出结果
```sh
strace -o process_strace -p 3229
```

6. 添加时间戳
```sh
strace -t ls
```
7. -r展示系统调用之间得相对时间戳
```sh
strace -r ls
```