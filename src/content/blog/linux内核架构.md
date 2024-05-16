---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: linux内核架构
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
# linux内核架构
Linux对进程采用了一种层次系统，每个进程都依赖于一个父进程。内核
启动init 程序作为第一个进程，该进程负责进一步的系统初始化操
作，并显示登录提示符或图形登录界面（现在使用比较广泛）。因此
init 是进程树的根，所有进程都直接或间接起源自该进程，如下面的
pstree 程序的输出所示。其中init 是一个树型结构的顶端，而树的分
支不断向下扩展。

该树型结构的扩展方式与新进程的创建方式密切相关。UNIX操作系统中
有两种创建新进程的机制，分别是fork 和exec 。

1. fork 可以创建当前进程的一个副本，父进程和子进程只有PID（进
程ID）不同。在该系统调用执行之后，系统中有两个进程，都执行同样
的操作。父进程内存的内容将被复制，至少从程序的角度来看是这样。
Linux使用了一种众所周知的技术来使fork 操作更高效，该技术称为写
时复制 （copy on write）