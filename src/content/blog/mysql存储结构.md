---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: mysql存储结构
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
# Mysql 存储结构

表存储结构 
![img22](@assets/images/img22.svg)

在数据库中， 不论读一行，还是读多行，都是将这些行所在的页进行加载。也就是说存储空间的基本单位是页。

一个页就是一棵树B+树的节点，数据库I/O操作的最小单位是页，与数据库相关的内容都会存储在页的结构里。

B+树索引结构
![img23](@assets/images/img23.svg)
1. 在一颗B+树种，每个节点都是一个页，每次新建节点的时候就会申请一个页空间
2. 在同一层的节点之间通过页的结构构成了一个双向链表
3. 在非叶节点包含多个索引行，每个索引行里存储索引键和指向下一层页面的指针
4. 叶子节点为，存储了关键字和行记录，在节点内部（也就是页结构的内部）记录之间是单向的链表

B+树页节点结构
![img24](@assets/images/img24.svg)

1. 将所有的记录分成几个组，每组会存储多条记录
2. 页目录存储的是slot,槽相当于分组记录的索引，每个槽指针指向了不同组的最后一个记录
3. 我们通过槽定位到组，在查看组中的记录

页的主要作用是存储记录，在页中记录以单链表的形式进行存储
单链表有点是插入删除方便，缺点是检索效率不搞，最坏的情况要遍历链表所有的节点，因此页目录种提供了二分查找的方式，来提高记录的检索效率。

## B+树的检索过程

1. 从B+树根节点，逐层找到叶子节点
2. 找到叶子节点为对应的数据页，将数据页加载到内存中，通过页目录的槽采用二分查找的方式先找到一个粗略的记录分组
3. 在分组中通过链表遍历的方式进行记录的查找

## 为什么要用B+树索引 
[[B树]]

数据库访问数据要通过页，一个页就是一个B+树节点，访问一个节点相当于一次I/O操作，所以越快找到节点，查找性能越好。B+树特点够矮够胖，有效减少访问节点次数从而提高性能。[[B+树]]特点，矮胖，三级，层级不深，可扩展。

### 索引
聚簇索引和二级索引区别，在于聚簇索引叶子节点存的数据。二级索引存的的引用。聚簇索引和二级索引都是B树结构。

#### 聚簇索引
>All InnoDB indexes are B-trees where the index records are stored in the leaf pages of the tree. The default size of an index page is 16KB. The page size is determined by the innodb_page_size setting when the MySQL instance is initialized. See Section 14.8.1, “InnoDB Startup Configuration”.

>When new records are inserted into an InnoDB clustered index, InnoDB tries to leave 1/16 of the page free for future insertions and updates of the index records. If index records are inserted in a sequential order (ascending or descending), the resulting index pages are about 15/16 full. If records are inserted in a random order, the pages are from 1/2 to 15/16 full. If the fill factor of an index page drops below 1/2, InnoDB tries to contract the index tree to free the page.

随机插入，会涉及到大量叶子节点拆分合并问题（一方面也取决于factor）

**优点**

 ![聚簇索引](./Btree-clusterIndex.webp)

 1. 将相关的数据放在一起，可以通过获取几页数据来获取相关记录。
 2. 不必扫描整棵树范围查询，扫到最小值就可以以此获取


 **缺点**
 有序记录，随机键插入会遇到性能问题。比如添加key 为13，mysql在第8页保存，添加key为9会导致第7页进行拆分。

 **聚簇索引选取规则**
 1. 有主键时，主键作为聚簇键
 2. 没有主键时，使用第一个**not null unique**作为聚簇键。
 3. 以上都不是，InnoDb生成一个隐藏列(RowId)作为聚集键

#### 二级索引

![二级索引](./Btree-secondIndexwebp.webp)

由结构图很容易看出，聚簇索引相比二级索引少了一层查找。
**1、一级索引** 索引和数据存储在一起，都存储在同一个B+tree中的叶子节点。一般主键索引都是一级索引。

**2、二级索引** 二级索引树的叶子节点存储的是主键而不是数据。也就是说，在找到索引后，得到对应的主键，再回到一级索引中找主键对应的数据记录。