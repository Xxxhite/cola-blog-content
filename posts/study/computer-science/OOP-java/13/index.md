---
title: 第 13 章 Java 网络编程
published: 2026-11-23 13:04:00
tags: [URL, TCP, UDP, 多播, RMI]
category: 面向对象程序设计
---

Java 可以通过 URL 访问资源，通过 TCP 或 UDP 与另一端交换数据，也可以通过 RMI 调用远程对象的方法。选择方式时，先判断应用需要连续的字节流、独立的数据报，还是远程方法接口。

<!-- more -->

## URL 与主机地址

URL 描述资源的位置，包括协议、主机、可选端口及路径，后面还可以有查询串与片段。`URI` 可用于解析和构造地址，转成 URL 后可以通过 `openConnection()` 获取连接，设置连接和读取超时，再读取响应。文本响应的字符集应按协议或响应声明确定。

`InetAddress.getByName` 根据主机名或地址字符串取得地址，`getHostAddress()` 返回地址的文本表示。`getLocalHost()` 根据本机配置取得一个地址，多网卡机器可能还有其他地址。IP 与端口共同标识通信端点。传给 `Socket` 的主机名只写主机部分，例如 `localhost`，不附带协议或资源路径。

课件用 `URL.openStream()` 读取远程资源。读到的是网络响应字节，可按资源类型保存为文件或交给字符流解析。需要显式设置超时时，可以先用 `openConnection()` 拿到连接对象，再取输入流。

## TCP 套接字和消息格式

服务端用 `ServerSocket` 监听端口，`accept()` 等待连接并返回专门和该客户端交换数据的 `Socket`。客户端用 `Socket` 连接服务端。两端各有输入流和输出流，一端的输出对应另一端的输入。

TCP 提供可靠、有序的字节流。一次写入的数据可能被分多次读到，多次写入也可能一起到达。双方需要约定消息边界，可以用固定长度、长度前缀或换行分隔。配套示例用 `DataOutputStream.writeUTF` 和 `DataInputStream.readUTF` 配对读写字符串。

```java title="在本机通过 TCP 发送一条有边界的消息"
try (Socket socket = new Socket("localhost", 2010);
     DataOutputStream out = new DataOutputStream(socket.getOutputStream());
     DataInputStream in = new DataInputStream(socket.getInputStream())) {
    socket.setSoTimeout(3000); // 只限制读取等待时间
    out.writeUTF("hello");
    out.flush();
    String reply = in.readUTF(); // 对端也须用 writeUTF 编码回复
}
```

上例假定本机服务端先读取请求再回复。如果双方都先读，就可能互相等待。多个客户端同时连接时，可以让接待循环继续 `accept()`，再把分别得到的套接字交给独立任务。每个任务负责关闭自己的连接。

### 服务端读取与回复

```java title="在本机接收请求并回送"
try (Socket client = listener.accept();
     DataInputStream in = new DataInputStream(client.getInputStream());
     DataOutputStream out = new DataOutputStream(client.getOutputStream())) {
    String request = in.readUTF(); // 先读取客户端用 writeUTF 发来的请求
    out.writeUTF(request);
    out.flush();
}
```

`listener` 是已经开始监听的 `ServerSocket`。这个代码片段处理一个连接。关闭 `client` 之后，`listener` 可以继续接待下一次连接。

## UDP 数据报与多播

UDP 以数据报为单位收发，无需先建立 TCP 式连接。数据报可能丢失、重复或乱序。 `DatagramPacket` 封装数据及地址，`DatagramSocket.send()` 和 `receive()` 负责收发。接收时要按数据包的偏移量和实际长度解码。

```java title="按数据报实际长度解码"
byte[] buffer = new byte[1024];
DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
socket.receive(packet);
String text = new String(
        packet.getData(), packet.getOffset(), packet.getLength(),
        java.nio.charset.StandardCharsets.UTF_8); // 与发送端使用相同字符集
```

这里的 `socket` 是已绑定端口的 UDP 套接字。缓冲区比数据报小时，内容可能被截断。课件中加入同一个 D 类地址的示例属于 IPv4 **多播**，接收者需要加入多播组并监听相应端口。广播则面向广播域，概念和接收范围不同。

发送方把目标地址、端口和消息字节一起放入发送用的 `DatagramPacket`。多播用组地址识别接收者范围，接收方加入的组和监听的端口都应与发送方指定的目标一致。

| 比较项 | TCP | UDP |
| --- | --- | --- |
| 数据单位 | 字节流 | 数据报 |
| 数据到达与顺序 | 连接内提供可靠、有序传输 | 应用自行处理丢失、重复或乱序 |
| 消息边界 | 由应用协议约定 | 保留数据报边界 |

## RMI 与服务端查询

RMI 的远程接口继承 `Remote`，远程方法需声明 `RemoteException` 或其父异常类型。服务端提供实现并向注册表绑定名称，客户端查询该名称取得远程引用再调用。远程调用还需要处理网络失败和参数传递方式，例如普通可序列化对象通常按值传递。

配套的数据库查询案例把用户交互交给客户端，服务端接收查询条件后调用 JDBC，再把结果按双方约定的格式返回。数据库连接由服务端管理，客户端只需理解查询协议。

## 自测

1. `accept()` 返回的对象和监听端口的对象有什么区别？

   答案：:spoiler[`ServerSocket` 继续监听端口。accept 返回的 Socket 用于和一个已连接客户端交换数据。]

2. TCP 一次 `read()` 是否一定对应对端一次 `write()`？

   答案：:spoiler[不一定。TCP 提供字节流，应用应按双方约定的长度或分隔符还原消息。]

3. UDP 接收后为什么要看数据包长度？

   答案：:spoiler[缓冲区容量可能大于实际内容长度，解码时应只读取本次接收的数据。]

4. RMI 客户端怎样取得远程对象？

   答案：:spoiler[使用注册表中的绑定名称查询远程引用，再通过远程接口调用方法。]

5. 客户端和服务端都先调用阻塞读取，可能发生什么？

   答案：:spoiler[两端会互相等待。应用协议应明确哪一端先写，必要时设置读取超时。]
