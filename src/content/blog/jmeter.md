---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: jmeter
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
#jmeter #教程

jmeter，一个测试工具。支持协议:
1. web：HTTP，HTTPS站点的Web1.0的Web 2.0 (ajax, flex and flex-ws-amf)
2. Web Services: SOAP / XML-RPC
3. 通过JDBC驱动程序的数据库
4. 目录: LDAP
5. 面向消息的服务通过JMS
6. Service: POP3, IMAP, SMTP
7. FTP 服务

## 结构
- 测试计划 #测试计划
- - http信息头管理
- - 用户定义得变量 # 通过${xx}引用
- - http请求默认值，设置请求默认值
- - threadGroup #线程组
- - - Transaction Controller #测试接口组
- - - - 响应断言 #检查响应是否匹配
- - - - JsonPath #抽取json得请求变量

jmeter基础用法如下
![img49](@assets/images/img49.svg)