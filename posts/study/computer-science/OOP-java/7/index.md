---
title: 第 7 章 内部类与异常处理
published: 2026-11-21 15:16:00
tags: [成员内部类, 匿名类, 异常处理, 自定义异常, 断言]
category: Java 学习笔记
---

本章介绍成员内部类、匿名类与 Lambda，以及异常、断言和 `finally`。

<!-- more -->

## 成员内部类

成员内部类声明在另一个类的内部。例如，农场类可以包含牛类；农场创建牛对象并调用它的方法，牛的方法也可以访问外部农场的名称。非静态成员内部类实例关联一个外部类实例。

```java title="农场与成员内部类"
class Farm {
    private final String name;
    Farm(String name) { this.name = name; }

    class Cow {
        void speak() {
            System.out.println("我生活在" + name);
        }
    }
}

// 以下代码位于方法内
Farm farm = new Farm("红牛农场");
Farm.Cow cow = farm.new Cow();
cow.speak(); // 我生活在红牛农场
```

在外部创建非静态成员内部类对象时，需要一个外部类实例，写作 `farm.new Cow()`。内部类可以访问关联外部对象的成员，包括私有成员；当名字发生冲突时，可用 `Farm.this.name` 明确引用外部对象的字段。

## 匿名类与 Lambda

匿名类在创建对象时同时定义一个没有名字的子类，例如通过 `new Bank(...) { ... }` 实现抽象的 `output` 方法；括号中的参数传给父类构造方法。匿名类也可以实现接口。对于只有一个抽象方法的函数式接口，还可以用 Lambda 表达行为：

```java title="问候行为"
machine.turnOn(() -> {
    System.out.println("你好，欢迎光临!");
});
```

假设 `turnOn` 接收包含 `speak()` 抽象方法的接口参数，上面的 Lambda 就提供该方法的实现。匿名类和 Lambda 都能传入问候行为；Lambda 需要有相应的函数式接口目标类型。

```java title="匿名接口实现与 Lambda"
interface SpeakHello {
    void speak();
}
class HelloMachine {
    void turnOn(SpeakHello hello) { hello.speak(); }
}

// 以下代码位于方法内
HelloMachine machine = new HelloMachine();
machine.turnOn(new SpeakHello() {
    @Override
    public void speak() { System.out.println("你好！"); }
});
machine.turnOn(() -> System.out.println("Hello!"));
```

两次调用均通过参数 `hello` 执行 `speak`；第一次创建匿名实现类对象，第二次使用 Lambda 提供函数式接口的实现。匿名类还可以继承抽象类并调用其构造方法，Lambda 则不能用来替代抽象类。

## try、catch 与 throw

`Integer.parseInt("ab89")` 抛出 `NumberFormatException` 时，`try` 中该语句之后的赋值不会执行，控制流转入匹配的 `catch`，随后继续执行异常处理之后的代码。

```java title="异常发生后的控制流"
int n = 0, m = 0, t = 1000;
try {
    m = Integer.parseInt("8888");
    n = Integer.parseInt("ab89");
    t = 7777;
} catch (NumberFormatException e) {
    System.out.println(e.getMessage());
}
// 此处 m 为 8888，n 为 0，t 为 1000。
```

可以用 `throw new IOException(...)` 主动抛出异常。`throw` 抛出异常对象；方法声明中的 `throws` 则说明方法可能向调用方抛出相应异常。

## 自定义异常和 finally

可以定义继承 `Exception` 的 `BankException`，在银行计算发现不符合规则的收支时抛出，再由调用方捕获并提示。异常发生后，当前 `try` 中后续语句不会继续执行，已完成的操作也不会自动回滚。

```java title="自定义异常"
class BankException extends Exception {
    BankException(String message) {
        super(message);
    }
}

class Bank {
    void income(int value) throws BankException {
        if (value < 0) {
            throw new BankException("收入不能为负数");
        }
        System.out.println("收入：" + value);
    }
}
```

`BankException` 是受检异常，调用 `income` 的方法需要捕获它，或在自己的声明中继续使用 `throws`。自定义异常可以携带错误信息，让调用方知道失败的原因。

货船超载时也可以抛出异常，由调用方处理。`finally` 通常在离开 `try`／`catch` 时执行，适合放清理逻辑；若 JVM 直接终止，例如调用 `System.exit`，不能保证执行。

在装载货船的处理过程中，可以先依次装载货物；某一次超出容量时抛出异常，之后的装载语句不再执行。`catch` 中可报告未装载的货物或尝试卸货，`finally` 中再汇报最终状态。异常不会自动恢复已经成功装载的货物，因此状态变更与恢复策略需要程序显式设计。

## 断言

使用 `assert number > 0 : "负数不能是成绩"` 可以检查假定条件。断言通常默认关闭，可通过启动参数 `-ea` 启用；条件为假时抛出 `AssertionError`。不要依赖断言完成必须执行的输入校验。

## 自测

1. 一个 `try` 中第二条语句抛出异常后，第三条语句还会执行吗？之前完成的修改会自动撤销吗？

   答案：:spoiler[第三条语句不会继续执行，控制流转向匹配的 catch；之前已经完成的修改不会因为异常自动撤销。]

2. 怎样分别用匿名类和 Lambda 向方法传入问候行为？

   答案：:spoiler[匿名类可以在创建接口实现对象时重写问候方法；若该接口是函数式接口，也可以直接传入 Lambda，由目标方法的参数类型确定其含义。]

3. 非静态成员内部类对象与外部类对象是什么关系？

   答案：:spoiler[非静态成员内部类对象关联一个外部类实例。可以通过已有外部对象创建它，并访问该外部对象的成员。]

4. `throw` 和 `throws` 分别做什么？

   答案：:spoiler[throw 在方法体中抛出一个异常对象；throws 写在方法声明中，说明该方法可能向调用方抛出哪些异常。]

5. `finally` 是否一定会执行？

   答案：:spoiler[通常在离开 try 或 catch 时执行，但不能保证绝对执行。例如 JVM 通过 System.exit 终止时，可能不会执行。]

6. 为什么不能只依靠 `assert` 检查用户输入？

   答案：:spoiler[断言通常默认关闭，只有启用后才会检查。用户输入校验是必须执行的业务逻辑，应使用普通条件判断和错误处理。]
