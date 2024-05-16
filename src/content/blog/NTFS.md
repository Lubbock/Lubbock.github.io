---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: NTFS
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
# NTFS

NTFS（New Technology File System）是微软1993年推出的用于Windows系统的文件系统，用于代替原来的FAT文件系统，从而提高性能。NTFS自推出以来经历了多个版本的更新，更新历史
一个NTFS分区的结构如下图所示
![ntfs分区结构](ntfs数据结构.webp)
整个分区主要分为三大区域：

1. VBR（Volume Boot Record）：非常重要，存储跟引导相关的数据，大小为16个扇区；

2. 文件区域：在NTFS的概念里，一切皆为文件，包括元数据文件、常规文件、目录、一切的一切都是文件；

3. BBS（Backup Boot Sector）：分区的第一个扇区是分区引导记录，是能否引导系统的关键，所以NTFS用分区的最后一个扇区备份第一个扇区，用于修复损坏的第一个扇区。

**文件**

文件可分为三种类型：元数据文件、常规文件和目录。

**元数据文件**

任何文件系统都会有元数据用于描述文件信息，信息有如名称、大小、修改时间、存放位置等等，注意的是NTFS元数据也用文件表示，总有16个元数据文件，这些文件的名称都是以$开头，属于隐藏文件。
![ntfs属性.webp](ntfs属性.webp)
## USN

>**USN Journal**相当于NTFS的秘书，记录改动的一切，并存储为USN_RECORD的格式。

usn是update service number journal or change journal的英文缩写，直译为“更新序列号”，是对NTFS卷里所修改过的信息进行相关记录的功能。当年微软发布Windows 2000时，建立NTFS 5.0的同时，加入了一些新功能和改进了旧版本的文件系统，为它请来了一位可靠的秘书，它可以在分区中设置监视更改的文件和目录的数量，记录下监视对象修改时间和修改内容。没错，它就是USN日志。当这个功能启用时，对于每一个NTFS卷，当发生有关添加、删除和修改文件的信息时，NTFS都使用USN日志记录下来

NTFS秘书——USN日志的工作方式，相对来说很简单，所以非常的高效。它开始的时候是一个空文件，包括NTFS每个卷的信息。每当NTFS卷有改变的时候，所改变的信息会马上被添加到这个文件里。这其中，每条修改的记录都使用特定符号来标识为日志形式，也就是USN日志。每条日志，记录了包括文件名、文件信息做出的改变。怎样在系统中让秘书开始干活儿呢？如图2所示，在NTFS分区的图标上右击选择“属性”，勾选圈中部分即可。

USN日志会记录下来何时做了修改，并使用特定序列号来标识，但它并不会记录里面具体修改了什么东西

## 相关文档
[Keeping an Eye on Your NTFS Drives: the Windows 2000 Change Journal Explained](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-2000-server/bb742450(v=technet.10)?redirectedfrom=MSDN)
