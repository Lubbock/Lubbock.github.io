---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: java-io
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---

#java #io
这篇文章会涵盖java io,nio,aio相关使用知识

[TOC]

## IO包范围
java.io 没有涵盖所有输入输出类型，如不包含*GUI*或者网页上的输入输出。java.io主要涉及`文件`,`网络数据流`,`内存缓存`的输入输出。

### 更多的IO工具提示

[Java How to and Utilities](./JavaHowToAndUtilities.md)包含了一些java IO工具如，替换流数据中的字符串，使用缓冲来反复处理流数据。

## JAVA-IO概述

### JAVA IO Class Overview Table

Here is a table listing most (if not all) Java IO classes divided by input, output, being byte based or character based, and any more specific purpose they may be addressing, like buffering, parsing etc.

|a|Byte Based input|Output|Character Based Input|Output|
| ---- | ------------------|------------ | ----------------- | --|
|Basic|	InputStream	OutputStream|	Reader|InputStreamReader	Writer|OutputStreamWriter|
|Arrays	|ByteArrayInputStream|	ByteArrayOutputStream|CharArrayReader|	CharArrayWriter|
|Files|	FileInputStream RandomAccessFile	|FileOutputStream RandomAccessFile|	FileReader|	FileWriter|
|Pipes|	PipedInputStream|	PipedOutputStream|	PipedReader	|PipedWriter|
|Buffering|	BufferedInputStream	|BufferedOutputStream|	BufferedReader|	BufferedWriter|
|Filtering|	FilterInputStream|	FilterOutputStream	|FilterReader|	FilterWriter|
|Parsing	|PushbackInputStream
StreamTokenizer	| |	PushbackReader LineNumberReader||	 
|Strings||	 	 	|StringReader|	StringWriter|
|Data	|DataInputStream|	DataOutputStream|||	 	
|Data - Formatted||	 	PrintStream||	 	PrintWriter|
|Objects|	ObjectInputStream|	ObjectOutputStream|||	 	 
|Utilities|	SequenceInputStream||||
 	 	 

The most typical sources and destinations of data are these:
- Files
- Pipes
- Network Connections
- In-memory Buffers (e.g.arrays)
- System.in,System.out,System.error

## JAVA NIO
Java提供了一个叫作NIO(New I/O)的第二个I/O系统，NIO提供了与标准I/O API不同的I/O处理方式。它是Java用来替代传统I/O API(自Java 1.4以来)。
它支持面向缓冲的，基于通道的I/O操作方法。 随着JDK 7的推出，NIO系统得到了扩展，为文件系统功能和文件处理提供了增强的支持。 由于NIO文件类支持的这些新的功能，NIO被广泛应用于文件处理。

基本组件
- channels and Buffers
    - 在NIO种使用通道和缓冲区。数据从缓冲区写入通道，并从通道读取到缓冲区。
- Selectors
    - NIO提供**选择器**概念，可以用于监视多个通道对象如，`数据通道`.`链接打开` etc.因此可以单线程监视多个通道数据
- Non-blocking I/O
    - 提供非阻塞I/O功能，应用程序立即返回任何可用得数据，应用程序应该有池化机制，用来判断是否有更多数据准备就绪

<!-- ![No block Io](../img/nio-block.drawio.svg) -->

### Channel
NIO种主要使用得channel
- DatagramChannel
> UDP
- SocketChannel
> TCP
- FileChannel
> 文件
- ServerSocketChannel
> TCP

### Buffer
核心缓冲区如下
- CharBuffer
- DoubleBuffer
- IntBuffer
- LongBuffer
- ByteBuffer
- ShortBuffer
- FloatBuffer

### Selector
 NIO提供选择器概念，可以用于监视多个通道得对象。如应用程序有多通道打开，每个连接流量很低可以使用
 <!-- ![selector](../img/nio-selector.drawio.svg) -->
 
## NIO类
<!-- ![nio class](../img/nio-class.png) -->

- java.nio
> 它是NIO系统的顶级包，NIO系统封装了各种类型的缓冲区。
- java.nio.charset
> 它封装了字符集，并且还支持分别将字符转换为字节和字节到编码器和解码器的操作。
- java.nio.charset.spi
> 它支持字符集服务提供者
- java.nio.channels
> 它支持通道，这些通道本质上是打开I/O连接。
- java.nio.channels.spi
> 它支持频道的服务提供者
- java.nio.file
> 它提供对文件的支持
- java.nio.file.spi
> 它支持文件系统的服务提供者
- java.nio.file.attribute

### 面向缓冲

NIO是面向缓存得I/O，将数据读入缓冲器，使用channel进行进一步数据处理。通道和流主要区别是
- 流可以用于单向数据传输
- 通道提供双向数据传输

#### Channels

---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: JAVA IO
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
BIO、NIO、AIO：

- Java BIO ： 同步并阻塞，服务器实现模式为一个连接一个线程，即客户端有连接请求时服务器端就需要启动一个线程进行处理，如果这个连接不做任何事情会造成不必要的线程开销，当然可以通过线程池机制改善。

- Java NIO ： 同步非阻塞，服务器实现模式为一个请求一个线程，即客户端发送的连接请求都会注册到多路复用器上，多路复用器轮询到连接有I/O请求时才启动一个线程进行处理。

- Java AIO(NIO.2) ： 异步非阻塞，服务器实现模式为一个有效请求一个线程，客户端的I/O请求都是由OS先完成了再通知服务器应用去启动线程进行处理。

  

BIO、NIO、AIO适用场景分析:

- BIO方式适用于连接数目比较小且固定的架构，这种方式对服务器资源要求比较高，并发局限于应用中，JDK1.4以前的唯一选择，但程序直观简单易理解。

- NIO方式适用于连接数目多且连接比较短（轻操作）的架构，比如聊天服务器，并发局限于应用中，编程比较复杂，JDK1.4开始支持。

- AIO方式使用于连接数目多且连接比较长（重操作）的架构，比如相册服务器，充分调用OS参与并发操作，编程比较复杂，JDK7开始支持。Netty!
```java
public static void copy(String fp,String cpFp) {  
    try (  
            FileInputStream fis = new FileInputStream(fp);  
            FileChannel fc = fis.getChannel();  
            FileOutputStream fos = new FileOutputStream(cpFp);  
            FileChannel foc = fos.getChannel()  
    ) {  
  
        ByteBuffer buffer = ByteBuffer.allocate(1024);  
        fc.read(buffer);  
        buffer.flip();  
        foc.write(buffer);  
  
    } catch (IOException e) {  
        throw new RuntimeException(e);  
    }  
}
```