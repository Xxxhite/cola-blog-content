---
title: 第 4 章 类与对象
published: 2026-11-21 15:13:00
tags: [构造方法, 引用传递, 静态成员, 方法重载, 包与封装]
category: Java 学习笔记
---

本章介绍对象创建、成员、方法、包，以及多个类之间的协作。

<!-- more -->

## 从过程到对象

机器语言直接描述处理器指令，过程式程序把任务组织为函数和执行步骤。面向对象设计还会决定由哪个对象保存数据、由谁执行操作。比如梯形对象保存上下底和高，面积计算交给它的实例方法。

类体可以声明字段、构造方法和方法。方法头包含返回类型、方法名与参数列表，`void` 表示方法不返回值。局部变量的作用范围受声明位置和代码块限制，使用前必须完成赋值。字段拥有默认值，例如整数为 0、布尔值为 `false`，引用为 `null`。当形参与字段同名时，用 `this.x = x;` 可以明确左侧为当前对象的字段。

UML 类图通常把一个类分为三栏，依次写类名、属性和操作。例如 `Point` 的属性栏可以写 `x: int`，操作栏可写 `setX(x: int): void`。

## 创建对象和构造方法

声明引用变量后，可以用 `new` 创建对象。构造方法在创建时初始化对象，例如 `Point(int a, int b)` 设置坐标。若类没有声明任何构造方法，编译器会提供默认的无参构造方法；自行声明构造方法后，不会再自动补上默认无参构造方法。

```java title="Point.java"
class Point {
    int x, y; // 实例字段，每个点各自保存坐标
    Point(int a, int b) { // 构造方法，初始化坐标
        x = a;
        y = b;
    }
}
```

在方法内部声明变量并创造对象：

```java
Point p1 = new Point(10, 10); // 调用构造方法创建对象
```

不同对象各自保存实例字段；字段有默认值，而局部变量使用前必须明确赋值。

## 引用与对象协作

在类图里，圆锥通过字段长期保存底面对象，可以用关联关系表示。某个类仅在方法参数或局部变量中临时使用另一类，可以用依赖关系表示。阅读代码时可先检查引用存放在字段还是局部变量中。

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
    Circle bottom; // 保存底面对象的引用
    double height;
    double getVolume() {
        return bottom.getArea() * height / 3;
    }
}
```

在方法内：

```java
Circle circle = new Circle();
circle.radius = 10;
Cone cone = new Cone();
cone.bottom = circle; // 两处引用指向同一个圆
cone.height = 5;
System.out.println(cone.getVolume());
circle.radius = 20;
System.out.println(cone.bottom.radius); // 20
circle = new Circle(); // 只改变局部变量的指向
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
    double upper;        // 实例字段，每个梯形各有一份
    static double lower; // 静态字段，所有梯形共享同一份
}
```

在方法内：

```java
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

不带 `static` 的实例方法有当前对象，可以用 `this`，也可以访问类的静态成员。静态方法没有当前对象，因此不能直接使用 `this` 或访问某个实例的字段。如果参数传入了一个具体对象，静态方法可以通过这个引用访问该对象允许访问的成员。例如 `Arrays.sort(values)` 是通过类名调用静态方法。

方法重载指同一个类中提供参数列表不同的同名方法，调用时根据参数选择匹配的方法；仅改变返回类型不能构成重载。`this` 指向当前对象，也可借此区分同名参数和字段。

```java title="方法重载"
double area(double radius) {
    return Math.PI * radius * radius;   // 计算圆面积
}
double area(double width, double height) {
    return width * height;              // 计算矩形面积
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

### 四种访问权限

:::important[复习重点：访问权限对照表]

类成员的访问范围从大到小依次为 `public`、`protected`、包访问权限、`private`。下表以字段和方法为例，假设声明该成员的类对访问方可见。

| 访问权限 | 声明该成员的类 | 同包的其他类 | 不同包的子类 | 不同包的非子类 |
| --- | --- | --- | --- | --- |
| `public` | 可以 | 可以 | 可以 | 可以 |
| `protected` | 可以 | 可以 | 可以，受访问方式限制 | 不可以 |
| `friendly` | 可以 | 可以 | 不可以 | 不可以 |
| `private` | 可以 | 不可以 | 不可以 | 不可以 |

:::

 `friendly` 指包访问权限，Java 中直接省略访问修饰符。比如 `int count;` 允许同包的类访问，即使它们没有继承关系。子包是不同的包，例如 `school` 和 `school.student` 不算同包。

顶层类只能用 `public` 或包访问权限。判断跨包调用能否通过编译时，先检查该类是否可见，再检查构造方法、字段或方法的权限。

跨包访问 `protected` 实例成员时，代码要写在子类中，访问对象的引用类型也有要求。假设 `Child` 在另一个包中继承 `Parent`，而 `Parent` 有一个 `protected` 字段 `value`。在 `Child` 的实例方法里，可以用 `this.value`、`super.value` 或通过 `Child` 类型的引用访问。若引用声明为 `Parent` 类型，则不能直接通过该引用访问 `value`，即使它实际指向一个 `Child` 对象。

### 使用私有字段实现封装

将年龄声明为 `private`，通过 `setAge` 检查范围，再用 `getAge` 读取。字段隐藏和方法校验使对象更容易维护有效状态；下面对非法值不做修改。

```java title="Student.java（字段和方法）"
private int age;
public void setAge(int age) {
    if (age >= 7 && age <= 28) {
        this.age = age; // 左边是对象字段，右边是方法参数
    }
}
public int getAge() {
    return age;
}
```

## 类库、局部类型推断和对象数组

### 基本类型的包装类

`java.lang` 提供 `Byte`、`Short`、`Integer`、`Long`、`Float`、`Double`、`Character` 和 `Boolean`，分别包装八种基本类型。用 `Integer.valueOf(42)` 得到包装对象，再用 `intValue()` 取得基本类型的值。Java 也支持自动装箱和拆箱，例如 `Integer boxed = 42;` 和 `int value = boxed;`。若包装引用为 `null`，拆箱时会抛出 `NullPointerException`。

`Character.isDigit` 和 `Character.isLetter` 用于判断数字字符与字母，`toUpperCase` 和 `toLowerCase` 用于大小写转换。

### 局部变量、数组和工具方法

- `Arrays.sort` 排序，`Arrays.toString` 查看数组；`binarySearch` 要求数组已按对应顺序排序。
- `Date` 表示日期时间；`Character.isLowerCase`、`isUpperCase` 可判断大小写，也可使用对应转换方法。
- `var` 声明并初始化局部变量，由编译器推断类型。推断后类型仍然固定，不能省略初始化表达式，也不能直接用 `null` 推断。
- 创建 `Student[]` 后，数组元素最初为 `null`，还需逐个创建 `Student` 对象。

```java title="对象数组"
Student[] students = new Student[3]; // 创建数组，元素初始为 null
for (int i = 0; i < students.length; i++) {
    students[i] = new Student(); // 为当前位置创建学生对象
    students[i].number = 101 + i;
}
```

这里假设 `Student` 有无参构造方法和可访问的 `number` 字段。`new Student[3]` 只创建存放三个引用的数组，不能直接对尚为 `null` 的元素访问字段。

## JAR 与 Javadoc

假设编译结果在 `out` 目录，可以用 `jar --create --file library.jar -C out .` 将其中的类按包目录打包。如果需要通过 `java -jar app.jar` 启动程序，打包时可用 `--main-class hello.nihao.Application` 指定入口类。

`javadoc` 从类和成员声明及 `/** ... */` 文档注释生成 HTML 文档。例如 `javadoc -d docs Point.java` 将结果写到 `docs`。可在方法注释中用 `@param` 描述参数、用 `@return` 描述返回值。

## 综合应用：有理数封装与评委打分

### 有理数的类封装

`Rational` 用两个私有字段保存分子和分母。构造方法保证分母非零，运算方法返回新的对象，参与运算的两个分数保持原值。

```java title="Rational.java"
class Rational {
    private final int numerator;
    private final int denominator;

    Rational(int numerator, int denominator) {
        if (denominator == 0) {
            throw new IllegalArgumentException("分母不能为 0");
        }
        this.numerator = numerator;
        this.denominator = denominator;
    }

    Rational add(Rational other) {
        // 通分：两边的分子分别乘以对方的分母。
        int sum = numerator * other.denominator + other.numerator * denominator;
        int commonDenominator = denominator * other.denominator;
        return new Rational(sum, commonDenominator);
    }
}
```

相减沿用通分方法，将新分子中的加法改为减法。相乘时分子和分母分别相乘，除法则先取除数的倒数，因此要检查除数的分子是否为 0。上面的加法只展示通分，完整实现还可以用最大公约数约分、统一分母符号，并考虑整数溢出。

### 评委打分流水线

分数评定可以分成录入分数、去掉极值、计算平均分三个步骤。每一步接收上一步的结果，分别由负责录入、筛选和计算的对象完成。下面将后两步放在一起，便于看清有效分数的下标范围。

```java title="去掉极值后计算平均分"
static double finalScore(double[] scores) {
    if (scores.length < 3) {
        throw new IllegalArgumentException("至少需要 3 个评委分数");
    }

    double[] sorted = scores.clone(); // 排序副本，保留分数的录入顺序。
    java.util.Arrays.sort(sorted);

    double sum = 0;
    // 跳过首尾各一个分数，重复的最高分或最低分仍可参与计算。
    for (int i = 1; i < sorted.length - 1; i++) {
        sum += sorted[i];
    }
    return sum / (sorted.length - 2);
}
```

例如，评委给出 92、88、95、90、85 分，去掉 85 和 95 后，剩下 88、90、92，平均分为 90。

## 自测

1. 两个变量指向同一个圆后，修改半径和让其中一个变量指向新圆，效果有何不同？

   答案：:spoiler[修改共享圆的半径时，两个引用都能观察到变化；让其中一个变量指向新圆，只改变该变量的指向，另一个引用仍指向原来的圆。]

2. 为什么创建对象数组后还需要为每个元素创建对象？

   答案：:spoiler[创建对象数组只分配存放引用的位置，元素默认是 `null`；需要分别创建对象并赋给元素，才能访问这些对象的字段或方法。]

3. 方法接收对象参数时，修改对象字段和重新给形参赋值有什么区别？

   答案：:spoiler[形参是引用值的副本。通过形参修改对象字段会影响调用方看到的同一对象；让形参指向另一个对象，只改变局部副本，不改变调用方的引用变量。]

4. 实例字段与 `static` 字段分别属于谁？

   答案：:spoiler[实例字段由各对象分别保存；静态字段属于类，同一个类的对象共享该字段。通常用类名访问静态字段。]

5. 仅改变方法的返回类型，能构成重载吗？

   答案：:spoiler[不能。方法重载需要同名方法具有不同的参数列表，例如参数个数或类型不同；仅改变返回类型不够。]

6. 为什么跨包调用一个类的方法时，除了 `import` 还要检查访问权限？

   答案：:spoiler[`import` 只允许使用简短类名，不会改变可访问性。跨包使用时，目标类和被调用的构造方法或成员仍须对调用方可访问。]

7. 为什么分数除法要检查除数的分子？

   答案：:spoiler[分数的分母有效时，如果除数的分子为 0，这个分数就表示 0。除以它会导致结果分母为 0，因此必须拒绝。]

8. 字段没有写访问修饰符时，同包的普通类和不同包的子类分别能访问吗？如果改成 `protected` 呢？

   答案：:spoiler[省略修饰符时，同包的普通类可以访问，不同包的子类不能访问。改成 `protected` 后，同包的类仍可访问，不同包的子类也能按继承规则访问。]
