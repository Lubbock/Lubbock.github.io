---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: kahan
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
#算法 #浮点数
kahan算法，作为减少计算浮点数的总和误差的算法为人所知。
> 通过把实施假发运算后丢失的后面几位数字转入下一次运算来补偿误差。

```sh
function kahanSum(input)
    var sum = 0.0
    var c = 0.0 #补偿用的变量，值为处理过程中丢失的后面几位数字
    for i=1 to input.length do
        y=input[i]-c #没问题 c为 0
        c=(t-sum)-y #t-sum 相当于y的前面几位数字，减去y就可以得到y的后面几位数字 符号相反
        sum=t # 数学上c应该永远是0
    next i
    return sum
```