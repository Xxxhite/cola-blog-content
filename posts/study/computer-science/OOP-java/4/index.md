---
title: 第 4 章 类、对象与程序组织
published: 2026-11-21 15:13:00
tags: [构造方法, 引用传递, 静态成员, 方法重载, 包与封装]
category: Java 学习笔记
---

本章介绍对象创建、成员、方法、包，以及多个类之间的协作。

<!-- more -->

## 创建对象和构造方法

声明引用变量后，可以用 `new` 创建对象。构造方法在创建时初始化对象，例如 `Point(int a, int b)` 设置坐标。若类没有声明任何构造方法，编译器会提供默认的无参构造方法；自行声明构造方法后，不会再自动补上默认无参构造方法。

```java title="Point.java（构造与创建）"
class Point {
    int x, y;
    Point(int a, int b) {
        x = a;
        y = b;
    }
}
Point p1 = new Point(10, 10);
```

最后一行应写在方法内部。不同对象各自保存实例字段；字段有默认值，而局部变量使用前必须明确赋值。

## 引用与对象协作

`p1 = p2` 复制的是引用值，不会创建对象。之后两者指向同一对象。一个对象也可以持有另一个对象：例如收音机使用电池，圆锥保存圆作为底面。通过任一引用修改共享对象，其他引用会观察到变化；但让原变量重新指向新对象，不会同时改变已保存的旧引用。

手机保存 SIM 卡对象、通过卡的方法获取号码，也是对象组合。将职责分配给不同对象后，可以调用各自的方法完成面积、体积等计算。

### 对象作为字段：圆锥与底面

圆锥可以保存一个 `Circle` 类型的字段，计算体积时调用底面的面积方法。以下代码省略了输入检查，用来观察引用的变化：

```java title="圆锥与圆"
class Circle {
    double radius;
    double getArea() {
        return Math.PI * radius * radius;
    }
}
class Cone {
    Circle bottom;
    double height;
    double getVolume() {
        return bottom.getArea() * height / 3;
    }
}

// 以下代码位于方法内
Circle circle = new Circle();
circle.radius = 10;
Cone cone = new Cone();
cone.bottom = circle;
cone.height = 5;
System.out.println(cone.getVolume());
circle.radius = 20;
System.out.println(cone.bottom.radius); // 20
circle = new Circle();
System.out.println(cone.bottom.radius); // 仍为 20
```

第一次赋值后，`circle` 和 `cone.bottom` 指向同一个圆；修改半径，因此通过两个引用看到的结果一致。重新给 `circle` 赋值只改变这个变量的指向，`cone.bottom` 仍指向旧圆。正式代码在调用 `bottom.getArea()` 前应保证底面不为 `null`。

### 对象作为方法参数

将电池传给收音机的方法时，方法可以通过接收到的引用读取或修改同一电池对象的电量。实际传递的是引用值的副本：若方法内部只是让形参指向新电池，不会让调用方的变量自动指向新对象。基本类型参数也是按值传递；方法内修改形参不会改变调用方的基本类型变量。

:::tip[参数传递]
Java 方法参数按值传递。引用类型参数传递的是引用的副本：方法可以通过该副本修改同一对象，但在方法内重新给形参赋引用，不会改变调用方的引用变量。
:::

## 实例成员、类成员和方法重载

将梯形的上底和高放在实例字段中、下底声明为 `static` 字段，可以观察到：不同对象各自有实例字段，却共同访问同一类的静态字段；建议用类名访问静态字段。

```java title="实例字段与静态字段"
class Ladder {
    double upper;
    static double lower;
}

// 以下代码位于方法内
Ladder.lower = 100;
Ladder first = new Ladder();
Ladder second = new Ladder();
first.upper = 28;
second.upper = 66;
Ladder.lower = 80;
System.out.println(first.upper);  // 28
System.out.println(second.upper); // 66
System.out.println(Ladder.lower); // 80
```

实例字段随对象分别保存；静态字段属于类，共享同一份值。把某个属性设为静态前，应确认它确实需要被所有实例共享。

方法重载指同一个类中提供参数列表不同的同名方法，调用时根据参数选择匹配的方法；仅改变返回类型不能构成重载。`this` 指向当前对象，也可借此区分同名参数和字段。

```java title="方法重载"
double area(double radius) {
    return Math.PI * radius * radius;
}
double area(double width, double height) {
    return width * height;
}
```

这两个方法的参数个数不同，因此可以共存：一个计算圆面积，另一个计算矩形面积。

## 包、导入与访问控制

使用 `package` 声明包、`import` 引入其他包的类。源文件目录与包名对应有助于编译与运行。多个类可以组织为 JAR 供其他程序使用；引用 JAR 时需要将其加入编译和运行的类路径。

```java title="包声明与导入"
package hello.nihao;

import sohu.com.Triangle;

public class Application {
    public static void main(String[] args) {
        Triangle triangle = new Triangle();
        triangle.setSides(30, 40, 50);
        System.out.println(triangle.getArea());
    }
}
```

这段程序需要另有 `sohu.com.Triangle` 类，并提供公开的构造方法与相关方法。包名用于区分不同来源的同名类；`import` 让当前文件可以使用简单类名，它不会复制该类。跨包访问时，还需要检查类和成员的访问权限。

JAR 文件可以包含已编译的类及其包目录。编译依赖这些类的程序、以及运行该程序时，都需要让类路径包含对应 JAR；Windows 中多个类路径项通常用分号分隔。若编译时找不到导入的类，应先核对包名、JAR 内容和类路径。

将年龄声明为 `private`，通过 `setAge` 检查范围，再用 `getAge` 读取。字段隐藏和方法校验使对象更容易维护有效状态；下面对非法值不做修改。

```java title="Student.java（字段和方法）"
private int age;
public void setAge(int age) {
    if (age >= 7 && age <= 28) {
        this.age = age;
    }
}
public int getAge() {
    return age;
}
```

## 类库、局部类型推断和对象数组

- `Arrays.sort` 排序，`Arrays.toString` 查看数组；`binarySearch` 要求数组已按对应顺序排序。
- `Date` 表示日期时间；`Character.isLowerCase`、`isUpperCase` 可判断大小写，也可使用对应转换方法。
- `var` 声明并初始化局部变量，由编译器推断类型。推断后类型仍然固定，不能省略初始化表达式，也不能直接用 `null` 推断。
- 创建 `Student[]` 后，数组元素最初为 `null`，还需逐个创建 `Student` 对象。

```java title="对象数组"
Student[] students = new Student[3];
for (int i = 0; i < students.length; i++) {
    students[i] = new Student();
    students[i].number = 101 + i;
}
```

这里假设 `Student` 有无参构造方法和可访问的 `number` 字段。`new Student[3]` 只创建存放三个引用的数组，不能直接对尚为 `null` 的元素访问字段。

## 综合应用：分数与成绩处理

设计 `Rational` 类时，可以用分子和非零分母表示分数，并提供加、减、乘、除方法；运算后可用最大公约数约分，除法还需检查除数是否为零。成绩处理也可以拆分为输入、去除最高最低分和计算平均分三个职责。排序后去掉两端元素即可计算剩余成绩的平均值，前提是成绩数量足够。

两个分数相加时先通分：`a/b + c/d = (a*d + b*c)/(b*d)`；相减只需把分子中的加号改为减号。相乘为 `(a*c)/(b*d)`；除以 `c/d` 相当于乘以 `d/c`，因此 `c` 不能为零。分子、分母还可能发生整数溢出；结果可用最大公约数约分，并统一分母符号。

成绩处理的数据流可以理解为：读取评委人数与成绩 → 排序 → 排除一个最低分与一个最高分 → 累加其余成绩 → 除以剩余人数。使用 `Arrays.sort` 会直接修改传入的数组；如果后续还要保留原始顺序，应先复制数组。

## 自测

1. 两个变量指向同一个圆后，修改半径和让其中一个变量指向新圆，效果有何不同？

   答案：:spoiler[修改共享圆的半径时，两个引用都能观察到变化；让其中一个变量指向新圆，只改变该变量的指向，另一个引用仍指向原来的圆。]

2. 为什么创建对象数组后还需要为每个元素创建对象？

   答案：:spoiler[创建对象数组只分配存放引用的位置，元素默认是 null；需要分别创建对象并赋给元素，才能访问这些对象的字段或方法。]

3. 方法接收对象参数时，修改对象字段和重新给形参赋值有什么区别？

   答案：:spoiler[形参是引用值的副本。通过形参修改对象字段会影响调用方看到的同一对象；让形参指向另一个对象，只改变局部副本，不改变调用方的引用变量。]

4. 实例字段与 `static` 字段分别属于谁？

   答案：:spoiler[实例字段由各对象分别保存；静态字段属于类，同一个类的对象共享该字段。通常用类名访问静态字段。]

5. 仅改变方法的返回类型，能构成重载吗？

   答案：:spoiler[不能。方法重载需要同名方法具有不同的参数列表，例如参数个数或类型不同；仅改变返回类型不够。]

6. 为什么跨包调用一个类的方法时，除了 `import` 还要检查访问权限？

   答案：:spoiler[import 只允许使用简短类名，不会改变可访问性。跨包使用时，目标类和被调用的构造方法或成员仍须对调用方可访问。]

7. 为什么分数除法要检查除数的分子？

   答案：:spoiler[分数的分母有效时，如果除数的分子为 0，这个分数就表示 0。除以它会导致结果分母为 0，因此必须拒绝。]
