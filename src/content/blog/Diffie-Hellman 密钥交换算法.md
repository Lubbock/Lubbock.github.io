---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: Diffie-Hellman 密钥交换算法
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
>Diffie-Hellman(简称 DH) [密钥](https://baike.baidu.com/item/%20%E5%AF%86%E9%92%A5/101144?fromModule=lemma_inlink)交换是最早的密钥交换[算法](https://baike.baidu.com/item/%E7%AE%97%E6%B3%95/209025?fromModule=lemma_inlink)之一，它使得通信的双方能在非安全的信道中安全的交换密钥，用于加密后续的通信消息。 Whitfield Diffie 和 Martin Hellman 于 1976 提出该算法，之后被应用于安全领域，比如 Https 协议的 TLS(Transport Layer Security) 和 IPsec 协议的 IKE(Internet Key Exchange) 均以 DH 算法作为密钥交换算法

>这里得a^b 指得是a得多少次方得意思

设 A, B 两方进行通信前需要交换密钥，首先 A, B 共同选取 p 和 a 两个素数，其中 p 和 a 均公开。之后 A 选择一个自然数 Xa，计算出 Ya，Xa 保密，Ya 公开；同理，B 选择 Xb 并计算出 Yb，其中 Xb 保密，Yb 公开。之后 A 用 Yb 和 Xa 计算出密钥 K，而 B 用 Ya 和 Xb 计算密钥 K，流程如下：

+-------------------------------------------------------------------+

Global Pulic Elements

p prime number

a prime number, a < p

+-------------------------------------------------------------------+

User A Key Generation

Select private Xa Xa < p

Calculate public Ya Ya = a^Xa mod p

+-------------------------------------------------------------------+

User B Key Generation

Select private Xb Xb < p

Calculate public Yb Yb = a^Xb mod p

+-------------------------------------------------------------------+

Calculation of Secret Key by User A

Secret Key K K = Yb^Xa mod p

+-------------------------------------------------------------------+

Calculation of Secret Key by User B

Secret Key K K = Ya^Xb mod p

+-------------------------------------------------------------------+


![Diffie-Hellmab.png](Diffie-Hellmab.png)
下面证明，A 和 B 计算出来的密钥 K 相同。


K = Yb^Xa mod p = (a^Xb mod p)^Xa mod p = a^(Xa * Xb) mod p

根据上述求模公式 = (a^Xa mod p)^Xb mod p = Ya^Xb mod p

上面一共出现了 a, p, Xa, Ya, Xb, Yb, K 共 7 个数，其中：

-   公开的数：a, p, Ya, Yb
    
-   非公开数：Xa, Xb, K

![求模公式](./求模公式.png)

## 应用
**DH在TLS中的应用**

DH算法作为一种密钥协商机制，可以用于[TLS协议](https://baike.baidu.com/item/TLS%E5%8D%8F%E8%AE%AE?fromModule=lemma_inlink)当中。

如果在DH交互过程中Alice和Bob始终使用相同的私钥，就会导致后续产生的共享密钥是一样的，如果有嗅探者截获通信双方的所有数据，由于都是同一个密钥加密所得，一旦被破解，后续的通信将全部暴露。

为了保证安全性，必须引入前向保密，即Forward Secrecy。其基本实现思路就是在Alice和Bob在选择各自的私钥是引入**随机性**，也印证了那句话：要用发展的眼光看问题，不能一成不变  。

事实上FS在诸多加密协议中应用广泛，比如IKEv2和802.11i密钥分发中的4-way握手，无一不引入此方法。

那么问题来了，TLS中哪一个才是最安全的cipher呢？最安全的三个候选者如下：

-   TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384_P521
    
-   TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384_P384
    
-   TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384_P256