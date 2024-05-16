---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: flyway
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
# flyway
flyway.cleanDisabled=true 一定要配置这个参数，因为这个参数默认是false，默认允许clean schema ,最彻底的方法是屏蔽flyway所有drop代码

## flyway使用方法
流程

项目启动时拉起Flyway，先检查数据库里面有没有Flyway元数据表，没有则创建，会在数据库表中默认新建一个数据表用于存储flyway的运行信息，默认的数据库名：flyway_schema_history；
检查Flyway元数据表中的记录，哪些脚本已经执行过，当前版本是什么；
可以看到执行数据库表后在checksum中储存一个数值，用于在之后运行过程中对比sql文件执行是否有变化，查找代码中的(名称满足规则的)数据库升级脚本，找出版本号大于(Flyway元数据)当前版本的脚本，逐个执行并记录执行结果到Flyway元数据表。


## 命名规范
sql 脚本存放目录:src/main/resources/db/migration
Flyway 将 SQL 文件分为 Versioned 、Repeatable 和 Undo 三种：

Versioned 用于版本升级, 每个版本有唯一的版本号并只能执行一次.
Repeatable 可重复执行, 当 Flyway检测到 Repeatable 类型的 SQL 脚本的 checksum 有变动, Flyway 就会重新应用该脚本. 它并不用于版本更新, 这类的 migration 总是在 Versioned 执行之后才被执行。
Undo 用于撤销具有相同版本的版本化迁移带来的影响。但是该回滚过于粗暴，过于机械化，一般不对应一个程序版本的多个脚本，从1开始，比如1.0.9版本，有多个任务：张三负责a任务（tapd号为1111111），李四负责b任务（tapd号为222222），他们的任务都涉及到db更新他们会分别创建两个脚本：

- V1.0.9.0.1__1111111.sql
- V1.0.9.0.2__222222.sql

> 说明：V大写，中间是两个下划线（__）

当验证开启时（默认validate-on-migrate: true），修改已经提交的sql文件报错，正确的提交升级sql的
    a. 已经提交的 flyway 脚本不可删除；
    b. 已经提交的 flyway 脚本不可修改；
    c. 已经提交的 flyway 脚本可重复执行；

mvn flyway:baseline
基准（该命令创建的版本号未V1,所以开发的第一个版本不要叫V1.0或者V1.0.0等）
mvn flyway:migrate
迁移
mvn flyway:info
信息
mvn flyway:validate
校验
mvn flyway:clean
清除所有表
mvn flyway:undo
撤销（免费版不支持）
mvn flyway:repair
修复，只能撤销对应的sql执行记录，不能回滚整个sql脚本