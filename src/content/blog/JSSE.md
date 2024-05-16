---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: JSSE
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
#java #https
JSSE是一个SSL和TLS的纯java实现，可以透明地提供数据加密、服务器认证、信息完整性 等功能，可以使我们像使用普通的套接字一样使用JSSE建立的安全套接字。JSSE是一个开放的标准，不只是Sun公司才能实现一个JSSE，事实上其他 公司有自己实现的JSSE。HTTPS即安全的超文本传输协议，采用了SSL技术，被广泛使用以保证Web应用系统的安全性。访问Web应用的编程接口大多封装了`SSL`，使得 访问HTTPS和访问HTTP一样简单。

## java安全概念

### TrueStore
客户端的TrueStore文件 保存着被客户端所新人的服务器的证书信息。
JSSE中，有一个信任管理器类负责决定是否信任远端的证书，这个类有如下的处理规则：

- 如果系统属性javax.net.sll.trustStore指定了TrustStore文件，那么信任管理器就去jre安装路径下的lib/security/目录中寻找并使用这个文件来检查证书。
- 如果该系统属性没有指定TrustStore文件，它就会去jre安装路径下寻找默认的TrustStore文件，这个文件的相对路径为：lib/security/jssecacerts。
- 如果 jssecacerts不存在，但是cacerts存在(它随J2SDK一起发行，含有数量有限的可信任的基本证书)，那么这个默认的TrustStore文件就是cacerts。

**将证书导入到TrustStore文件**
　Java提供了命令行工具keytool用于创建证书或者把证书从其它文件中导入到Java自己的TrustStore文件中。把证书从其它文件导入到TrustStore文件中的命令行格式为：

```sh
　　keytool -import -file src_cer_file –keystore dest_cer_store
```
　　其中，src_cer_file为存有证书信息的源文件名，dest_cer_store为目标TrustStore文件。在使用keytool之前，首先要取得源证书文件，这个源文件可使用IE浏览器获得，IE浏览器会把访问过的HTTPS站点的证书保存到本地。从IE 浏览器导出证书的方法是打开“Internet 选项”，选择“内容”选项卡，点击“证书…”按钮，在打开的证书对话框中，选中一个证书，然后点击“导出…”按钮，按提示一步步将该证书保存到一文件中。 最后就可利用keytool把该证书导入到Java的TrustStore文件中。为了能使Java程序找到该文件，应该把这个文件复制到jre安装路径 下的lib/security/目录中。

　　这样，只需在程序中设置系统属性javax.net.sll.trustStore指向文件dest_cer_store，就能使JSSE信任该证书，从而使程序可以访问使用未经验证的证书的HTTPS站点。

使用这种方法，编程非常简单，但需要手工导出服务器的证书。当服务器证书经常变化时，就需要经常进行手工导出证书的操作。下面介绍的实现X509证书信任管理器类的方法将避免手工导出证书的问题。
X509证书信任管理器类的实现及应用
　　在JSSE中，证书信任管理器类就是实现了接口X509TrustManager的类。我们可以自己实现该接口，让它信任我们指定的证书。

　　接口X509TrustManager有下述三个公有的方法需要我们实现：

- oid checkClientTrusted(X509Certificate[] chain, String authType)
throws CertificateException
　　该方法检查客户端的证书，若不信任该证书则抛出异常。由于我们不需要对客户端进行认证，因此我们只需要执行默认的信任管理器的这个方法。JSSE中，默认的信任管理器类为TrustManager。
-  oid checkServerTrusted(X509Certificate[] chain, String authType)
throws CertificateException
　　该方法检查服务器的证书，若不信任该证书同样抛出异常。通过自己实现该方法，可以使之信任我们指定的任何证书。在实现该方法时，也可以简单的不做任何处理，即一个空的函数体，由于不会抛出异常，它就会信任任何证书。
-  X509Certificate[] getAcceptedIssuers()
　　返回受信任的X509证书数组。

自己实现了信任管理器类，如何使用呢？类HttpsURLConnection似乎并没有提供方法设置信任管理器。其 实，HttpsURLConnection通过SSLSocket来建立与HTTPS的安全连接，SSLSocket对象是由 SSLSocketFactory生成的。HttpsURLConnection提供了方法 setSSLSocketFactory(SSLSocketFactory)设置它使用的SSLSocketFactory对象。 SSLSocketFactory通过SSLContext对象来获得，在初始化SSLContext对象时，可指定信任管理器对象。下面用一个图简单表 示这几个JSSE类的关系：
<!-- ![JSEE](./JSSE%E7%B1%BB%E5%9B%BE1.svg) -->
图1 部分JSSE类的关系图
　　假设自己实现的X509TrustManager类的类名为：MyX509TrustManager，下面的代码片断说明了如何使用MyX509TrustManager

```java
//创建SSLContext对象，并使用我们指定的信任管理器初始化
TrustManager[] tm = {new MyX509TrustManager ()};
SSLContext sslContext = SSLContext.getInstance("SSL","SunJSSE");
sslContext.init(null, tm, new java.security.SecureRandom());

//从上述SSLContext对象中得到SSLSocketFactory对象
SSLSocketFactory ssf = sslContext.getSocketFactory();

//创建HttpsURLConnection对象，并设置其SSLSocketFactory对象
HttpsURLConnection httpsConn = (HttpsURLConnection)myURL.openConnection();
httpsConn.setSSLSocketFactory(ssf);
```

# SSL简介
SSL (Secure Socket Layer)为Netscape所研发，用以保障在Internet上数据传输之安全，利用数据加密(Encryption)技术，可确保数据在网络上之传输过程中不会被截取及窃听。它已被广泛地用于Web浏览器与服务器之间的身份认证和加密数据传输。SSL协议位于TCP/IP协议与各种应用层协议之间，为数据通讯提供安全支持。

## SSL提供的服务
1. 认证用户和服务器确保数据发送到正确的客户机和服务器
2. 加密数据以防止数据中途被窃取
3. 维护数据的完整性，确保数据在传输过程中不被改变

## SSL协议的握手过程
SSL协议既用到了公钥加密技术又用到了对称加密技术，对称加密技术虽然比公钥加密技术的速度快，可是公钥加密技术提供了更好的身份认证技术。SSL的握手协议非常有效的让客户和服务器之间完成相互之间的身份认证，气主要过程如下：
1. 客户端的浏览器向服务器传送客户端ssl协议的版本号，加密算法的种类，产生的随机数以及其他服务器和客户端之间通讯所需要的各种信息。
2. 服务器向客户端传送ssl协议的版本号，加密算法的种类，随机数以及其他相关信息，同时服务器还将向客户端传送自己的证书
3. 客户利用服务器传过来的信息验证服务器的合法性，服务器的合法性包括：证书是否过期，发行服务器证书的CA是否可靠，发行者证书的公钥能否正确接开服务器证书的发行者的数字签名，服务器证书上的域名是否和服务器的实际域名相匹配。如果合法性验证没有通过，通讯将断开；如果合法性验证通过，将继续进行第四步。
4. 用户端随机产生一个用于后面通讯的“对称密码”，然后用服务器的公钥（服务器的公钥从步骤②中的服务器的证书中获得）对其加密，然后传给服务器。
5. 服务器用私钥解密“对称密码”(此处的公钥和私钥是相互关联的，公钥加密的数据只能用私钥解密，私钥只在服务器端保留。详细请参看： http://zh.wikipedia.org/wiki/RSA%E7%AE%97%E6%B3%95)，然后用其作为服务器和客户端的“通话密码”加解密通讯。同时在SSL 通讯过程中还要完成数据通讯的完整性，防止数据通讯中的任何变化。
6. 客户端向服务器端发出信息，指明后面的数据通讯将使用的步骤⑤中的主密码为对称密钥，同时通知服务器客户端的握手过程结束。
7. 服务器向客户端发出信息，指明后面的数据通讯将使用的步骤⑤中的主密码为对称密钥，同时通知客户端服务器端的握手过程结束。
8. SSL 的握手部分结束，SSL 安全通道的数据通讯开始，客户和服务器开始使用相同的对称密钥进行数据通讯，同时进行通讯完整性的检验


## 附录
1. [JSSE Reference](http://java.sun.com/j2se/1.5.0/docs/guide/security/jsse/JSSERefGuide.html)
2. [Java Security Guide](http://java.sun.com/j2se/1.5.0/docs/guide/security/)
## 标签
[[编程/java/Java]],[[https]]