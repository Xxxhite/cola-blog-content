---
title: 第 10 章 输入流与输出流
published: 2026-11-23 13:01:00
tags: [Java IO, 文件流, 字符编码, 序列化, 文件锁]
category: 面向对象程序设计
---

输入流负责从数据源读取，输出流负责把数据写到目标。选择流时先明确读写单位和数据格式，再考虑是否需要缓冲、定位或解析。

<!-- more -->

## File 与文件路径

`File` 表示一个路径，创建对象并不会在磁盘上创建文件。相对路径按进程的工作目录解释。`exists()` 检查路径是否存在，`isFile()` 和 `isDirectory()` 区分文件和目录。`mkdir()` 只建一层，`mkdirs()` 可以连同缺失的父目录一起创建。`listFiles()` 可能返回 `null`，例如目标不是目录或发生 I/O 错误。按名称筛选可传入 `FilenameFilter`。

## 字节流、字符流与缓冲

| 流 | 适用场景 | 注意点 |
| --- | --- | --- |
| `InputStream`、`OutputStream` | 图片和其他二进制数据 | 按实际读取的字节数写出 |
| `Reader`、`Writer` | 文本 | 字节与字符转换要明确字符集 |
| `BufferedInputStream`、`BufferedOutputStream` | 合并小块字节读写 | 输出可能还留在缓冲区 |
| `BufferedReader`、`BufferedWriter` | 按行读取或写文本 | `readLine()` 不包含行结束符，返回 `null` 表示读完 |

`FileInputStream` 和 `FileOutputStream` 对应普通文件字节流。文件输出流默认从头写入并截断已有内容，使用追加模式时保留原内容。`InputStreamReader` 和 `OutputStreamWriter` 用指定字符集连接字符流与字节流，也可用带字符集参数的 `Files.newBufferedReader`。课件配套源码的 GBK 编码是这些文件的属性，读取其他文本仍需按实际编码选择。

```java title="按实际读取长度复制文件"
try (InputStream in = new FileInputStream(source);
     OutputStream out = new FileOutputStream(target)) {
    byte[] buffer = new byte[4096];
    int count;
    while ((count = in.read(buffer)) != -1) {
        out.write(buffer, 0, count); // 最后一块可能不足 4096 字节
    }
}
```

上面的 `source`、`target` 是不同的文件路径。单字节 `read()` 返回 0～255 或 `-1`，因此先用 `int` 接收。缓冲输出的 `flush()` 将缓冲内容向下游推送，流仍可继续使用。用 try-with-resources 可以在正常结束或抛异常时关闭流。

### 按行读取和写入

`Reader.read(char[])` 读入一批字符，返回本次实际字符数。 `BufferedReader.readLine()` 按文本行读取，其中空行返回空字符串，读到末尾才返回 `null`。因为返回值不带换行符，用 `BufferedWriter` 输出时要自行补上换行。

```java title="给每行文本加上单词数"
String line;
while ((line = reader.readLine()) != null) {
    String text = line.trim();
    int words = text.isEmpty() ? 0 : text.split("\\s+").length;
    writer.write(line + " (" + words + ")");
    writer.newLine(); // readLine 已去掉原有行结束符
}
```

这里的 `reader` 和 `writer` 是已打开的缓冲字符流。空行也会参与输出，计数为 0。这个例子按空白划分英文单词。

## 随机访问与内存流

`RandomAccessFile` 可以使用 `r` 只读模式或 `rw` 读写模式。`seek(offset)` 移动文件指针，`getFilePointer()` 查询当前位置，偏移量按字节计算。如果文件只有连续写入的 `int`，从 0 开始的第 `index` 项位于 `4L * index`，可以定位后直接 `readInt()`。文本记录的字节长度可能不同，不能按字符数直接套用固定偏移。

```java title="定位并读取第三个整数"
try (RandomAccessFile file = new RandomAccessFile(path, "r")) {
    file.seek(2L * Integer.BYTES); // 下标 2 对应第三个整数
    int third = file.readInt();
}
```

读取第三项要求文件中至少已有三个整数。每次读取或写入都会推进当前位置。在已有记录处写入会覆盖对应字节。要追加，先定位到 `file.length()`。

`ByteArrayInputStream` 和 `ByteArrayOutputStream` 在内存中处理字节，输出流可通过 `toByteArray()` 取得结果。`CharArrayReader` 和 `CharArrayWriter` 对应字符数组。

## 数据流、对象流与克隆

- 数据流用 `writeInt`、`writeDouble`、`writeUTF` 等方法写值，读取方须按相同类型和顺序调用对应的 `readXxx`。 `writeUTF` 使用带长度的修改版 UTF-8 格式。
- `ObjectOutputStream.writeObject` 保存实现 `Serializable` 的对象，`ObjectInputStream.readObject` 恢复对象图。被保存的非静态、非 `transient` 字段也必须满足序列化条件。不要反序列化来源未知的对象流。
- 普通的浅克隆会共享引用字段指向的对象。序列化再读回可复制参与序列化的对象图，但 `transient` 状态不随之复制。

对象流保存的是对象状态。假设一个商品列表包含多个商品对象，读取后可以重建列表及其中参与序列化的对象。普通的引用赋值则只复制引用，两个变量仍指向同一个对象。课件把序列化后的读回与克隆一起讲，复习时可以比较**引用赋值、浅克隆、序列化后重新读取**各自会不会复制被引用的对象。

```java title="数据流按约定顺序读写"
ByteArrayOutputStream bytes = new ByteArrayOutputStream();
try (DataOutputStream out = new DataOutputStream(bytes)) {
    out.writeInt(42);
    out.writeUTF("Java"); // 先写整数，再写字符串
}
try (DataInputStream in = new DataInputStream(
        new ByteArrayInputStream(bytes.toByteArray()))) {
    int number = in.readInt(); // 42
    String name = in.readUTF(); // Java
}
```

## 文件解析、图像与文件锁

`Scanner` 可从文件读取文本，默认以空白分隔。`useDelimiter` 可指定正则，适合结构简单的记录。通讯录需要修改固定位置时可用随机访问，试题按行组织时可用缓冲字符流。 `ImageIO.read` 解码为 `BufferedImage`，`ImageIO.write` 按指定格式编码，读不到匹配的解码器时 `read` 可能返回 `null`。

`JFileChooser` 在用户确认后才使用所选文件，`ProgressMonitorInputStream` 可给读取过程附加进度提示。文件锁由 `FileChannel` 获取，`lock` 可等待，`tryLock` 可尝试立即取得锁。锁应在写入结束时释放，跨进程协作时各方要遵守同一锁约定。界面调用编译工具的案例还涉及外部进程的标准输出、错误输出和退出状态。

## 自测

1. 为什么复制文件时不用 `out.write(buffer)`？

   答案：:spoiler[缓冲区最后可能只读满一部分，写整块会把未读入本次数据的字节也写出去。]

2. 文件按顺序写入一个整数、一个浮点数，读取时能颠倒顺序吗？

   答案：:spoiler[不能。数据流的读取类型和读取顺序都须与写入一致。]

3. `flush()` 与 `close()` 有什么区别？

   答案：:spoiler[`flush()` 推送缓冲数据后仍能继续写入，`close()` 结束流的使用并释放资源。]

4. 包装在对象里的字段标记为 `transient` 后会发生什么？

   答案：:spoiler[默认序列化会跳过它，读回时原字段值不会随对象流恢复。]

5. `readLine()` 返回空字符串与返回 `null` 分别说明什么？

   答案：:spoiler[空字符串表示读到一行空行。null 表示没有剩余行。]
