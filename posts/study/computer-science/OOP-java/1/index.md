---
title: 第 1 章 Java 程序与对象初识
published: 2026-11-21 15:10:00
tags: [Java 程序入口, 类与对象, 方法调用]
category: Java 学习笔记
---

本章介绍 Java 程序入口、类、对象和方法调用。

<!-- more -->

## 从入口方法开始

运行 `Hello` 类时，程序从 `main` 方法开始，先输出文字，再创建 `Student` 对象并调用 `speak`。

```java title="Hello.java"
public class Hello {
    public static void main(String[] args) {
        System.out.println("大家好!");
        System.out.println("Nice to meet you");
        Student stu = new Student();
        stu.speak("We are students");
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
People zhubajie;
zhubajie = new People();
zhubajie.height = 170;
zhubajie.ear = "两只大耳朵";
zhubajie.speak("师傅,咱们别去西天了,改去月宫吧");
```

通过点号访问对象的字段和方法。先声明引用变量，再创建对象并赋值，之后才能通过该引用访问对象成员。

## 自测

1. `People` 中哪些成员表示数据，哪个成员表示行为？

   答案：:spoiler[`height` 和 `ear` 是保存数据的字段；`speak` 是描述行为的方法。]

2. `new People()`、字段赋值和 `speak` 调用分别做了什么？

   答案：:spoiler[`new People()` 创建对象；字段赋值设置该对象的数据；调用 `speak` 将实参传给方法并执行方法体。]
