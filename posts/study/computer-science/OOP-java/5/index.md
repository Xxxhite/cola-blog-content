---
title: 第 5 章 子类与继承
published: 2026-11-21 15:14:00
tags: [继承, 方法重写, super, 多态, 抽象类]
category: 面向对象程序设计
---

本章梳理继承、方法重写、类型转换与抽象类，理解如何利用共同的父类型组织不同实现。

<!-- more -->

## 继承与成员访问

用 `class Student extends People` 声明直接父类。一个类只能直接继承一个类，由此可形成多层继承。没有显式声明父类的普通类默认继承 `Object`。UML 类图中用实线加空心三角表示继承，三角指向父类。

`People → Student → UniverStudent` 可以表示多层继承。子类在父类基础上增加自己的字段和方法，并使用可访问的父类成员。父类的 `private` 成员不能被子类代码直接访问，但可以通过父类提供的可访问方法间接使用。

子类与父类声明同名字段时，两者是各自独立的字段，访问结果取决于引用的声明类型和代码位置；字段不像实例方法那样按运行时类型动态分派。避免在设计中滥用同名字段。

对于父类声明的成员，子类与父类同包时还可以使用具有包访问权限的成员。不同包的子类可使用 `public` 成员，并按第 4 章的限制访问 `protected` 成员。构造方法不会被子类继承。

```java title="同名字段"
class Goods {
    double weight; // 父类字段
    void setWeight(double value) { weight = value; }
    double getWeight() { return weight; }
}
class CheapGoods extends Goods {
    int weight; // 隐藏父类同名字段，两者各自保存值
    void setIntegerWeight(int value) { weight = value; }
}
```

在方法内：

```java
CheapGoods goods = new CheapGoods();
goods.setWeight(12.5);
goods.setIntegerWeight(8);
System.out.println(goods.weight);      // 8
System.out.println(goods.getWeight()); // 12.5
```

`goods.weight` 访问子类的整数字段；继承来的 `getWeight()` 在父类中定义，读取父类的浮点字段。两个字段名称相同，但修改其中一个不会改写另一个。

## 重写与 super

子类可以提供与父类相同签名的实例方法，调用时执行子类重写后的行为。重写与重载不同：重载关注同名方法的参数列表；重写发生在继承关系中，对应父类方法的实现。

```java title="重写实例方法"
class Animal {
    void cry() { System.out.println("动物叫声"); }
}
class Dog extends Animal {
    @Override // 让编译器检查是否正确重写父类方法
    void cry() { System.out.println("汪汪"); }
}
```

在方法内：

```java
Animal animal = new Dog(); // 向上转型，实际对象仍是 Dog
animal.cry(); // 汪汪
```

引用的声明类型是 `Animal`，但对象的实际类型是 `Dog`，因此调用重写后的 `cry()`。`@Override` 让编译器检查该方法确实重写了父类方法。

重写方法的访问范围不能比父类方法更窄，例如父类的 `protected` 方法可用 `public` 重写。父类的 `private` 方法对子类不可见，子类中的同名方法与它是独立的。静态方法属于类，子类中的同签名静态方法采用隐藏规则。

协变返回类型允许父类方法返回 `Object`、子类重写方法返回其子类型 `Integer`。使用 `super.f()` 调用父类方法、`super.n` 访问父类字段；父子类都有 `n` 时，两者是不同字段。

在子类构造方法中使用 `super(number, name)` 调用父类构造方法。按课件采用的 Java 版本，显式 `super(...)` 写在构造方法开头。

构造子类对象时，父类部分会先完成初始化，再执行子类构造方法的剩余语句。如果子类构造方法没有显式调用 `this(...)` 或 `super(...)`，编译器通常会插入无参 `super()`；若父类没有可访问的无参构造方法，则必须显式调用可用的父类构造方法。

`final` 字段在赋值后不能再次赋值，`final` 方法不能被子类重写；方法参数声明为 `final` 时，方法内不能重新给该参数赋值。

`final class` 禁止继承。对引用类型而言，`final` 固定的是引用的指向，对象内部是否还能修改取决于它自身的设计。

## 向上转型、动态分派和类型检查

子类对象可以赋给父类类型引用。通过该引用可以访问声明类型允许的成员；对于被重写的实例方法，实际调用由对象的运行时类型决定。`instanceof` 可在需要向下转型前检查对象是否属于目标类型。

```java title="父类引用与类型检查"
动物 pet = new 狗();
pet.cry();
if (pet instanceof 狗) {
    狗 dog = (狗) pet; // 已确认实际类型，可以向下转型
    dog.cry();
}
```

这里假设 `狗` 继承自 `动物`，并重写了 `cry()`。类型检查不改变对象本身。

## 抽象类与面向抽象编程

抽象类可以声明抽象方法，不能直接实例化。例如抽象 `SIM` 定义卡的共同能力，由不同运营商子类提供实现，手机只依赖 `SIM` 类型。

抽象类也可以提供字段、构造方法和带方法体的方法。抽象方法只声明签名，具体子类必须实现它，或者从其他父类实现中获得它。若子类仍有未实现的抽象方法，就需要继续声明为抽象类。

柱体 `Pillar` 可以持有 `Geometry` 类型的底面：`Circle` 和 `Rectangle` 各自实现面积计算，柱体积通过底面积乘高度得到。替换不同底面时，调用方不必将体积计算分别写一遍；访问底面前还应处理 `null`。

```java title="面向抽象计算柱体体积"
abstract class Geometry {
    abstract double getArea(); // 抽象方法，约定底面如何提供面积
}
class Circle extends Geometry {
    private final double radius;
    Circle(double radius) { this.radius = radius; }
    @Override
    double getArea() { return Math.PI * radius * radius; }
}
class Rectangle extends Geometry {
    private final double width, height;
    Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }
    @Override
    double getArea() { return width * height; }
}
class Pillar {
    private final Geometry bottom;
    private final double height;
    Pillar(Geometry bottom, double height) {
        this.bottom = bottom;
        this.height = height;
    }
    double getVolume() {
        if (bottom == null) {
            throw new IllegalStateException("底面不能为空");
        }
        return bottom.getArea() * height; // 由底面对象的实际类型决定面积算法
    }
}
```

`Pillar` 只依赖 `Geometry.getArea()` 这一共同约定。底面为圆时执行圆面积方法，为矩形时执行矩形面积方法，这就是重写与动态分派在对象组合中的应用。

### 开闭原则

开闭原则提倡通过新增实现扩展行为，减少修改已经稳定的代码。比如加入三角形底面时，可以新增一个实现 `getArea()` 的 `Triangle` 子类，原有的体积算法继续适用。手机支持新的运营商时，也可以通过新增 `SIM` 实现完成扩展。

## 自测

1. 父类引用指向子类对象时，字段访问与重写方法调用分别依据什么决定？

   答案：:spoiler[字段访问主要根据引用的声明类型和访问位置决定；被重写的实例方法通过动态分派，根据对象的实际类型决定执行哪个实现。]

2. `super(...)`、`super.f()` 和 `super.n` 各用于什么？

   答案：:spoiler[`super(...)` 在子类构造方法中调用父类构造方法；`super.f()` 调用父类方法；`super.n` 访问父类字段。]

3. 子类能直接访问父类的 `private` 字段吗？

   答案：:spoiler[不能。父类的私有字段不能被子类代码直接访问，但可以通过父类提供且对子类可访问的方法间接操作。]

4. 重写与重载有何区别？

   答案：:spoiler[重写是在继承关系中为父类实例方法提供子类实现；重载是在同一个类中使用相同方法名、不同参数列表定义方法。]

5. 为什么柱体类可以不关心底面是圆还是矩形？

   答案：:spoiler[柱体持有共同的 `Geometry` 类型，只调用底面的 `getArea()`。圆和矩形分别实现该方法，运行时由实际底面对象提供面积。]

6. 用 `instanceof` 检查后再向下转型有什么作用？

   答案：:spoiler[它先判断对象是否属于目标类型，避免对不兼容的对象强制转换而抛出 `ClassCastException`；检查本身不会改变对象。]
