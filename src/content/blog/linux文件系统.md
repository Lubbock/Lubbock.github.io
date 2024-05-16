---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: linux文件系统
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
## Linux

**/proc**文件系统

![image-20211009152504581](image-20211009152504581.png)

![image-20211009152522664](image-20211009152522664.png)

### /proc/pid

| x       | y                                            |
| ------- | -------------------------------------------- |
| cmdline | 以\0分隔的命令行参数                         |
| cwd     | 只想当前工作目录的符号链接                   |
| Environ |                                              |
| fd      | 文件目录，包含了指向由进程打开文件的符号链接 |
| maps    | 内存映射                                     |
| mem     | 进程虚拟内存                                 |
| mounts  | 进程的安装点                                 |
| status  | 各种信息 进程ID,凭证，内存使用量，信号       |
| task    |                                              |

i 节点表：文件系统中文件和目录在i节点表中都对应着唯一一条记录，这条记录登记了文件各种信息.**i-list**

- 北海风力

[openssl自定义加密套件](https://strawberrytree.top/blog/2020/09/28/%E4%BD%BF%E7%94%A8openssl%E5%86%85%E7%BD%AE%E7%9A%84%E5%AF%86%E7%A0%81%E7%AE%97%E6%B3%95%E5%AE%9A%E4%B9%89%E6%96%B0%E7%9A%84%E5%8A%A0%E5%AF%86%E5%A5%97%E4%BB%B6-tls1-3/)

测试代码提交