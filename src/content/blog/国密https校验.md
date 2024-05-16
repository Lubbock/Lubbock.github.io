---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: 国密https校验
featured: false
draft: false
tags:
 - https
 - java
 - 国密
description: java调用国密接口，https免校验
---
## 信任证书

跟证书用了sm2算法，普通校验过不去，注入的trustmanager换成X509ExtendedTrustManager 可以绕过去

```kotlin
internal class TruestX509Extend constructor() : X509ExtendedTrustManager(), X509TrustManager {
    @Throws(CertificateException::class)
    override fun checkClientTrusted(var1: Array<X509Certificate>, var2: String) {

    }

    @Throws(CertificateException::class)
    override fun checkServerTrusted(var1: Array<X509Certificate>, var2: String) {

    }

    override fun getAcceptedIssuers(): Array<X509Certificate?> {
        return arrayOfNulls(0)
    }

    @Throws(CertificateException::class)
    override fun checkClientTrusted(var1: Array<X509Certificate>, var2: String, var3: Socket) {

    }

    @Throws(CertificateException::class)
    override fun checkServerTrusted(var1: Array<X509Certificate>, var2: String, var3: Socket) {

    }

    @Throws(CertificateException::class)
    override fun checkClientTrusted(var1: Array<X509Certificate>, var2: String, var3: SSLEngine) {

    }

    @Throws(CertificateException::class)
    override fun checkServerTrusted(var1: Array<X509Certificate>, var2: String, var3: SSLEngine) {

    }

}
        val tm = TruestX509Extend()
        val custom = SSLContexts.custom()
        custom.loadTrustMaterial(null, TrustStrategy { x509Certificates, s -> true })
        val ctx = custom.build()
        ctx.init(null, arrayOf(tm), null)
        return HttpClients.custom()
            .setSSLContext(ctx)
            .setSSLHostnameVerifier(NoopHostnameVerifier())
            .build()
```

这是不能使用普通的写法
```kotlin
        // Create a trust manager that does not validate certificate chains
        var sslContext: SSLContext? = null
        try {
            val custom = SSLContexts.custom()
            custom.loadTrustMaterial(null, TrustStrategy { x509Certificates, s -> true })
            sslContext = custom.build()
        } catch (e: Exception) {
            e.printStackTrace()
        }

//                LayeredConnectionSocketFactory sslSocketFactory = new SSLConnectionSocketFactory(ctx);
        return HttpClients.custom()
            .setSSLContext(sslContext)
            .setSSLHostnameVerifier(NoopHostnameVerifier())
            .build()
```
