---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: openssl生成证书
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
#https
#!/bin/bash
openssl.conf
keyUsage = keyAgreement, keyEncipherment, dataEncipherment
# 根密钥和根证书
//生成私钥
./gmssl ecparam -genkey -name sm2p256v1 -out kcsp-ca-sm2.key
// 生成对应证书请求文件
./gmssl req -new -x509 -sm3 -days 3650 \
    -key kcsp-ca-sm2.key -out kcsp-ca-sm2.crt \
    -subj "/C=CN/ST=Shanghai/L=Shanghai/O=com/OU=koal/CN=kcsp-ca"
# 加密密钥和加密证书

//生成私钥
./gmssl ecparam -genkey -name sm2p256v1 -out kcsp-enc-sm2.key

// 生成对应证书请求文件
./gmssl req -new -sm3 -key kcsp-enc-sm2.key -out kcsp-enc-sm2.csr \
    -subj "/C=CN/ST=Shanghai/L=Shanghai/O=com/OU=koal/CN=kcsp.enc"

// 生成证书
./gmssl x509 -req -sm3 -days 3650 \
    -extfile ../ssl/openssl.cnf -extensions v3enc_req -CA kcsp-ca-sm2.crt -CAkey kcsp-ca-sm2.key -CAcreateserial \
    -in kcsp-enc-sm2.csr -out kcsp-enc-sm2.crt
# 签名密钥和签名证书
./gmssl ecparam -genkey -name sm2p256v1 -out kcsp-sig-sm2.key
./gmssl req -new -sm3 -key kcsp-sig-sm2.key -out kcsp-sig-sm2.csr \
    -subj "/C=CN/ST=Shanghai/L=Shanghai/O=com/OU=koal/CN=kcsp.sig"
./gmssl x509 -req -sm3 -days 3650 \
    -extfile ../ssl/openssl.cnf -extensions v3_req -CA kcsp-ca-sm2.crt -CAkey kcsp-ca-sm2.key -CAcreateserial \
    -in kcsp-sig-sm2.csr -out kcsp-sig-sm2.crt

rea
# 产生私钥 
openssl genrsa -out ca.key 2048 
# 产生 CSR请求证书文件 
openssl req -new -key ca.key -out ca.csr 
# 产生自我签署的的证书文件 
openssl x509 -req -days 365 -in ca.csr -signkey ca.key -out ca.crt 


证书转换
pkcs12转jks 
keytool -importkeystore -srckeystore keystore.p12 -srcstoretype PKCS12 -deststoretype JKS -destkeystore keystore.jks 
 
jks转pkcs12 
keytool -importkeystore -srckeystore /root/.keystore -destkeystore /root/.keystore -deststoretype pkcs12 
 
生成pkcs12文件，但不包含CA证书： 
openssl pkcs12 -export -inkey server.key -in server.crt  -out server12.pfx 
 
生成pcs12文件，包含CA证书： 
openssl pkcs12 -export -inkey server.key -in server.crt -CAfile ca.crt -chain -out server12.pfx 
 
将pcks12中的信息分离出来，写入文件 
openssl pkcs12 -in office.pfx -out office.pem 
导出私钥 
openssl rsa -in AS.pem -out as.key 
导出公钥 
openssl rsa -in AS.pem -pubout -out as.crt 

## 查询证书支持加密套件
```sh
/usr/local/gmssl/bin/gmssl ciphers -v
```
