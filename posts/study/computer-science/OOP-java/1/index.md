---
title: 第 1 章 Java 入门
published: 2026-11-21 15:10:00
tags: [Java 程序入口, 类与对象, 方法调用]
category: 面向对象程序设计
---

本章介绍 Java 的运行方式、JDK 工具、程序入口，以及类与对象的基本用法。

<!-- more -->

## Java 的特点与平台无关性

Java 由 Sun 的团队开发，于 1995 年发布。它以类和对象组织代码，支持多线程，也可以在运行时按需加载类。Java 常用于服务端和网络应用，本课程使用提供核心语言与标准库的 Java SE。课件还提到面向企业应用的 Java EE 和面向部分嵌入式场景的 Java ME。

操作系统和处理器构成运行平台。针对某个目标平台生成的机器指令，通常需要在兼容的平台上运行。Java 的开发流程是先用 `javac` 把 `.java` 编译成 `.class` 字节码，再由目标平台上的 JVM 加载和执行。只要 JVM 支持相应的字节码版本，且程序所需的依赖和平台功能都可用，同一份字节码就能在不同平台运行。

## JDK 与开发流程

JDK 提供 `javac`、`java`、`javap` 等工具。Windows 上可让 `JAVA_HOME` 指向 JDK 根目录，并将 `%JAVA_HOME%\bin` 加入 `Path`。重新打开终端后，用 `java -version` 和 `javac -version` 检查运行和编译工具。

将下节完整程序保存为 `Hello.java`，在同一目录里执行：

```powershell title="编译、运行与查看字节码"
javac -encoding UTF-8 Hello.java  # 编译源文件
java Hello                       # 运行主类
javap -c Hello                   # 查看字节码指令
```

保存为 UTF-8 时使用上面的编译命令。文件如果采用 GBK，则改用 `-encoding GBK`。编译后可得到 `Hello.class` 和 `Student.class`，启动时传类名 `Hello`。课件将 `javap` 归在反编译一节，它可以显示类的成员，带 `-c` 时还会反汇编字节码指令。

## 从入口方法开始

运行 `Hello` 类时，程序从 `main` 方法开始，先输出文字，再创建 `Student` 对象并调用 `speak`。

```java title="Hello.java"
public class Hello {
    public static void main(String[] args) { // 程序入口
        System.out.println("大家好!");
        System.out.println("Nice to meet you");
        Student stu = new Student();
        stu.speak("We are students"); // 调用实例方法，传入要输出的内容
    }
}

class Student {
    public void speak(String s) {
        System.out.println(s);
    }
}
```

`String[] args` 用来接收启动程序时传入的字符串参数；`System.out.println` 输出内容并换行。`speak` 的形参 `s` 接收调用时传入的字符串，方法中的输出使用该参数。

## 类、对象与成员

`People` 类可以用身高 `height`、耳朵 `ear` 描述数据，用 `speak` 描述行为。类描述对象所具有的成员；`new People()` 创建对象，变量 `zhubajie` 保存指向该对象的引用。

```java title="People.java（摘录）"
People zhubajie;         // 声明引用变量
zhubajie = new People(); // 创建对象并保存引用
zhubajie.height = 170;
zhubajie.ear = "两只大耳朵";
zhubajie.speak("师傅,咱们别去西天了,改去月宫吧");
```

通过点号访问对象的字段和方法。先声明引用变量，再创建对象并赋值，之后才能通过该引用访问对象成员。

## 编程风格与注释

Allman 风格把左大括号单独放一行。课件称为 Kernighan 的行尾风格把左大括号写在声明或控制语句的行末，本系列示例采用这种写法。无论使用哪一种，同一份代码应保持一致的括号和缩进风格。用 `//` 写单行注释，用 `/* ... */` 写块注释。适合用注释记录原因、约束或不易看出的边界条件。

## 自测

1. `People` 中哪些成员表示数据，哪个成员表示行为？

   答案：:spoiler[`height` 和 `ear` 是保存数据的字段；`speak` 是描述行为的方法。]

2. `new People()`、字段赋值和 `speak` 调用分别做了什么？

   答案：:spoiler[`new People()` 创建对象；字段赋值设置该对象的数据；调用 `speak` 将实参传给方法并执行方法体。]

3. `javac`、`java` 和 `javap -c` 分别用于什么？

   答案：:spoiler[`javac` 编译源文件生成字节码，`java` 启动 Java 程序，`javap -c` 查看反汇编后的字节码指令。]
