---
title: 第 6 章 接口与 Lambda
published: 2026-11-21 15:15:00
tags: [接口实现, 默认方法, 函数式接口, Lambda, 接口回调]
category: Java 学习笔记
---

本章介绍接口、实现类、回调和 Lambda，理解如何让调用方依赖共同的行为约定。

<!-- more -->

## 声明与实现接口

接口 `Com` 声明常量 `MAX`、抽象方法 `on` 和 `sum`，也有默认方法、静态方法和供接口内部调用的私有方法。实现类使用 `implements Com` 并实现抽象方法。接口字段隐含 `public static final`，普通抽象方法隐含 `public abstract`；实现类重写这些方法时需要保持 `public` 可访问性。

```java title="Com.java"
public interface Com {
    int MAX = 100;
    void on();
    float sum(float x, float y);
    default int max(int a, int b) {
        outPutJava();
        return a > b ? a : b;
    }
    static void f() { System.out.println("Java"); }
    private void outPutJava() { System.out.println("Java"); }
}
```

默认方法可由实现对象调用，静态方法通过接口名调用。接口私有方法需要 Java 9 或更高版本。

## 接口引用与多态

电视和电脑可以分别实现 `ShowMessage`。同一个接口类型变量可以先后引用不同实现对象，调用相同接口方法时执行各自实现。相同的平均值接口也可以分别计算算术平均值和几何平均值；几何平均值在实数范围内需关注乘积的取值。

公交、出租车和电影院可以实现收费或温控接口；出租车还可以继承交通工具抽象类。一个类可以继承一个直接父类并实现多个接口，从而组合不同能力。

## Lambda 与回调

`ShowMessage` 若只有一个抽象方法，可作为函数式接口的目标类型；Lambda 的参数和方法体对应这个抽象方法。默认方法不计入函数式接口的抽象方法数量。

```java title="接口与 Lambda"
interface ShowMessage {
    void 显示商标(String s);
}

// 以下代码位于方法内部
ShowMessage sm = (s) -> {
    System.out.println("tvtvtvtv");
    System.out.println(s);
    System.out.println("tvtvtvtv");
};
sm.显示商标("长城牌电视机");
```

把接口类型作为方法参数，可传入实现类对象，也可传入符合目标类型的 Lambda；方法内部通过接口调用行为。广告牌可以持有 `Advertisement` 接口，由不同公司提供广告内容；未设置广告时显示招商提示。调用方与具体实现因此可以分别变化。

### 实现接口并通过接口调用

```java title="平均值策略"
interface ComputeAverage {
    double average(double a, double b);
}
class ArithmeticAverage implements ComputeAverage {
    public double average(double a, double b) {
        return (a + b) / 2;
    }
}
class GeometricAverage implements ComputeAverage {
    public double average(double a, double b) {
        return Math.sqrt(a * b);
    }
}

// 以下代码位于方法内
ComputeAverage calculator = new ArithmeticAverage();
System.out.println(calculator.average(4, 9)); // 6.5
calculator = new GeometricAverage();
System.out.println(calculator.average(4, 9)); // 6.0
```

同一个引用变量可以保存不同实现类的对象。`average` 的调用形式不变，结果取决于实际对象。若 `a * b` 为负数，`Math.sqrt` 的结果是 `NaN`；实际业务还应按需求校验输入。

### 把行为传给方法

```java title="接口参数与回调"
interface SpeakHello {
    void speak();
}
class Greeter {
    void greet(SpeakHello hello) {
        hello.speak();
    }
}

// 以下代码位于方法内
Greeter greeter = new Greeter();
greeter.greet(() -> System.out.println("你好！"));
greeter.greet(() -> System.out.println("Hello!"));
```

`greet` 不必知道问候语来自哪个具体类，只需要知道可以调用 `speak()`。Lambda 的目标类型来自 `greet` 的参数类型，空括号对应不接收参数的 `speak()`。

## 自测

1. 为什么 Lambda 需要能够确定唯一抽象方法的目标类型？

   答案：:spoiler[编译器需要知道 Lambda 对应哪个方法，以及该方法的参数和返回类型。函数式接口提供唯一的抽象方法作为目标，默认方法不计入这一数量。]

2. 广告牌依赖接口后，更换广告内容需要修改哪些对象？

   答案：:spoiler[只需提供另一个实现广告接口的对象，并将它设置给广告牌；广告牌仍通过同一接口调用广告行为，不需要为每家公司重写展示流程。]

3. 接口的常量和抽象方法默认具有什么访问特性？实现类实现方法时需要注意什么？

   答案：:spoiler[接口字段隐含 `public static final`，普通抽象方法隐含 `public abstract`；实现类的方法必须具有 `public` 访问权限。]

4. 一个类能同时继承父类并实现多个接口吗？

   答案：:spoiler[可以。Java 类可以有一个直接父类，同时通过 `implements` 实现多个接口，并提供它们要求的实现。]

5. 默认方法和静态方法分别怎样调用？

   答案：:spoiler[默认方法通常通过实现接口的对象调用；接口静态方法通过接口名调用，例如 `Com.f()`。]
