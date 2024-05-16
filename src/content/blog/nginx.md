---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: nginx
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
# Openssl生成 SM2公钥私钥

openssl 1.1.1+ 版本增加了对SM2 的支持，所以我们就能直接使用这些版本的opsnssl 生成 SM2的公私钥对。

首先我们得在Linux 或者Windows服务器中安装对应版本的openssl库，具体过程略。软件包请到官网下载:[https://www.openssl.org/](https://www.cnblogs.com/toolsMan/p/14045404.html)

安装完成后，使用下列命令查看该版本的openssl 是否支持SM2参数：

```sh
openssl ecparam -list_curves | grep SM2
```

如果查询结果有内容，则说明该版本支持SM2参数，也就可以生成SM2的公私钥对。

在安装了正确版本的openssl之后，下面就是利用openssl自带的命令生成SM2公私钥对了：

1. 创建EC参数和原始私钥文件：
```sh
openssl ecparam -out ec_param.pem -name SM2 -param_enc explicit -genkey
```

注：生成完成后可以查看一下EC私钥信息:
```sh
openssl ecparam -in ec_param.pem -text
```

然后验证一下参数：
```sh
openssl ecparam -in ec_param.pem -check
```

2. 将原始的私钥文件，转换为pkcs8格式：
```sh
openssl pkcs8 -topk8 -inform PEM -in ec_param.pem -outform pem -nocrypt -out pri_key_pkcs8.pem
```

3. 利用原始的私钥，生成对应的公钥：
```sh
openssl ec -in ec_param.pem -pubout -out pub_key.pem
```

至此SM2的秘钥对已经生成结束，**pri_key_pkcs8.pem**是SM2私钥，而**pub_key.pem**是公钥。

使用CA证书及密钥对客户端证书进行签名
```sh
x509 -req -days 365 -in client.csr -CA ca.crt -CAkey ca_rsa_private.pem -passin pass:123456 -CAcreateserial -out client.crt
```

## openSSL生成SM2证书
1. 生成自签CA
生成CA密钥
```sh
ecparam -genkey -name SM2 -out ca.key
```

自签名证书
```sh
req -new -x509 -days 3650 -key ca.key -out ca.crt
```

这里ecdsa with sha256可能需要换成sm3,不过在RFC 5349中规定为ecdsa SHA做digest,所以需要做二次开发,这次暂时用这个.
2. 生成服务端证书

生成服务端密钥
```sh
ecparam -genkey -name SM2 -out server_sm2_private.pem
```

3. 生成服务端代签名证书
```sh
req -new -key server_sm2_private.pem -out server.csr
```
4. 使用CA证书及密钥对服务器证书进行签名
```sh
x509 -req -days 3650 -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt
```

5. 生成客户端证书

生成客户端密钥
```sh
ecparam -genkey -name SM2 -out client_sm2_private.pem
```

生成客户端代签名证书
```sh
req -new -key client_sm2_private.pem -out client.csr
```

6. 使用CA证书及密钥对客户端证书进行签名
```sh
x509 -req -days 3650 -in client.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out client.crt
```


7. 生成ECC证书
> 和SM2大同小异，SM2也是ECC改造的国密算法。

1. 生成自签CA
生成CA密钥
```sh
ecparam -genkey -name prime256v1 -out ca.key
```

2. 自签名证书
```sh
req -new -x509 -days 3650 -key ca.key -out ca.crt
```

3. 生成服务端证书

生成服务端密钥
```sh
ecparam -genkey -name prime256v1 -out server_ecc_private.pem
```

生成服务端代签名证书
```sh
req -new -key server_ecc_private.pem -out server.csr
```

4. 使用CA证书及密钥对服务器证书进行签名
```sh
x509 -req -days 3650 -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt
```

5. 生成客户端证书

生成客户端密钥
```sh
ecparam -genkey -name prime256v1 -out client_ecc_private.pem
```

生成客户端代签名证书
```sh
req -new -key client_ecc_private.pem -out client.csr
```

使用CA证书及密钥对客户端证书进行签名
```sh
x509 -req -days 3650 -in client.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out client.crt
```

## 关联文档
- [CNBLOG](https://www.cnblogs.com/eaglexmw/p/11346492.html)



# Gmssl编译安装

## 关联文档
- [Gmssl编译安装](https://www.cnblogs.com/freedreamnight/p/14688138.html)
- [Gmssl证书校验 与生成](https://blog.csdn.net/SkyChaserYu/article/details/109157266)
- [Gmssl证书校验 与生成2](https://www.cnblogs.com/leehm/p/12264351.html)
- [相关文档](https://www.cnblogs.com/zjz20/p/13624082.html)

## openssl 介绍

1. ca.key ca密钥文件

```sh
gmssl ecparam -genkey -name sm2p256v1 -out /data/ssl/ca/ca.key
```

2. ca.csr 证书签名申请文件

```sh
gmssl req -new -key /data/ssl/ca/ca.key -out /data/ssl/ca/ca.csr
```

3. 生成 CA 自签【根证书】，即对签名申请进行自签生成证书

输入 CA 秘钥文件、CA 根证书签名申请，输出 CA 自签根证书文件。

```sh
gmssl x509 -req -days 3650 -sm3 -signkey /data/ssl/ca/ca.key -in /data/ssl/ca/ca.csr -out /data/ssl/ca/ca.pem
```

4. 导出 CA【 PKCS12 证书】

输入 CA 自签的 CA 证书文件、CA 秘钥，输出 CA PKCS12 证书。

```sh
gmssl pkcs12 -export -in /data/ssl/ca/ca.pem -inkey /data/ssl/ca/ca.key -out /data/ssl/ca/ca.p12 -name ca
```

说明：

- 【openssl pkcs12】表示制作 PKCS12 证书。
- 【-export 】表示导出 PKCS12 证书；
- 【-in】表示签名证书的输入文件；
- 【-inkey】表示秘钥的输入文件；
- 【-name】表示 PKCS12 证书的别名；
- 【-out】表示 PKCS12 证书的输出文件。

查看 CA PKCS12 证书文件（需要输入 CA PKCS12 证书口令）：

```sh
$ gmssl pkcs12 -in /data/ssl/ca/ca.p12 -info
``Enter Import Password:``......` `Enter PEM pass phrase:``Verifying - Enter PEM pass phrase:``......
```



# openssl生成证书
```sh
#!/bin/bash
openssl.conf
keyUsage = keyAgreement, keyEncipherment, dataEncipherment
```

1.  根密钥和根证书
```sh
//生成私钥
./gmssl ecparam -genkey -name sm2p256v1 -out kcsp-ca-sm2.key
// 生成对应证书请求文件
./gmssl req -new -x509 -sm3 -days 3650 \
    -key kcsp-ca-sm2.key -out kcsp-ca-sm2.crt \
    -subj "/C=CN/ST=Shanghai/L=Shanghai/O=com/OU=koal/CN=kcsp-ca"
```

2. 加密密钥和加密证书

```sh
//生成私钥
./gmssl ecparam -genkey -name sm2p256v1 -out kcsp-enc-sm2.key

// 生成对应证书请求文件
./gmssl req -new -sm3 -key kcsp-enc-sm2.key -out kcsp-enc-sm2.csr \
    -subj "/C=CN/ST=Shanghai/L=Shanghai/O=com/OU=koal/CN=kcsp.enc"

// 生成证书
./gmssl x509 -req -sm3 -days 3650 \
    -extfile ../ssl/openssl.cnf -extensions v3enc_req -CA kcsp-ca-sm2.crt -CAkey kcsp-ca-sm2.key -CAcreateserial \
    -in kcsp-enc-sm2.csr -out kcsp-enc-sm2.crt
```

3. 签名密钥和签名证书
```sh
./gmssl ecparam -genkey -name sm2p256v1 -out kcsp-sig-sm2.key
./gmssl req -new -sm3 -key kcsp-sig-sm2.key -out kcsp-sig-sm2.csr \
    -subj "/C=CN/ST=Shanghai/L=Shanghai/O=com/OU=koal/CN=kcsp.sig"
./gmssl x509 -req -sm3 -days 3650 \
    -extfile ../ssl/openssl.cnf -extensions v3_req -CA kcsp-ca-sm2.crt -CAkey kcsp-ca-sm2.key -CAcreateserial \
    -in kcsp-sig-sm2.csr -out kcsp-sig-sm2.crt
```

5.  产生私钥 
```sh
openssl genrsa -out ca.key 2048
```
 
6. 产生 CSR请求证书文件
```sh
openssl req -new -key ca.key -out ca.csr 
```

7. 产生自我签署的的证书文件 
```sh
openssl x509 -req -days 365 -in ca.csr -signkey ca.key -out ca.crt 
```



## 证书转换
1. pkcs12转jks 
```sh
keytool -importkeystore -srckeystore keystore.p12 -srcstoretype PKCS12 -deststoretype JKS -destkeystore keystore.jks 
```

 2. jks转pkcs12 
```sh
keytool -importkeystore -srckeystore /root/.keystore -destkeystore /root/.keystore -deststoretype pkcs12 
```

 3. 生成pkcs12文件，但不包含CA证书
```sh
openssl pkcs12 -export -inkey server.key -in server.crt  -out server12.pfx 
```

 4. 生成pcs12文件，包含CA证书： 
```sh
openssl pkcs12 -export -inkey server.key -in server.crt -CAfile ca.crt -chain -out server12.pfx 
```

5. 将pcks12中的信息分离出来，写入文件 
```sh
openssl pkcs12 -in office.pfx -out office.pem 
导出私钥 
openssl rsa -in AS.pem -out as.key 
导出公钥 
openssl rsa -in AS.pem -pubout -out as.crt 
```


## 查询证书支持加密套件
```sh
/usr/local/gmssl/bin/gmssl ciphers -v
```

# Nginx RSA双向认证配置

Nginx RSA双向认证与国密双向认证不同，国密双向认证还不清楚nginx怎么开启。RSA双向认证
1. 开启ssl_client_certificate 指定证书链
2. ssl_verify_client on 客户端认证打开

成功开启后，浏览器会弹出一个端口 让用户选择证书
![nginx](nginx.rsa.verify.jpg)