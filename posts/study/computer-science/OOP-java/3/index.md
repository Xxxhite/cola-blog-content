---
title: 第 3 章 运算符、表达式与语句
published: 2026-11-21 15:12:00
tags: [位运算, 条件分支, 循环, 数组遍历]
category: 面向对象程序设计
---

本章复习算术、关系、逻辑与位运算，并用分支和循环控制程序流程。

<!-- more -->

## 运算符与表达式

### 算术运算、类型提升与自增

`+`、`-`、`*`、`/`、`%` 分别用于加减乘除和求余。两个整数相除时，结果向零截断。例如 `7 / 2` 得到 3，`-7 / 2` 得到 -3。`7 / 2.0` 使用浮点除法，得到 3.5。整数除以零会抛出 `ArithmeticException`。

二元算术运算中，只要有 `double` 就按 `double` 计算，否则依次考虑 `float`、`long` 和 `int`。即使两边都是 `byte`、`short` 或 `char`，运算也至少按 `int` 进行。如果表达式在编译时就能求出且结果在范围内，可以直接把这个 `int` 常量结果赋给这些较小类型。

`i++` 先取旧值再加 1，`++i` 先加 1 再取新值。前置和后置 `--` 同理。如果只用作独立语句，两种递增写法更新后的值相同。

```java title="前置和后置递增"
int i = 2;
int oldValue = i++; // oldValue 为 2，i 为 3
int newValue = ++i; // newValue 为 4，i 为 4
```

### 比较、逻辑与赋值

- `<`、`<=`、`>`、`>=` 比较数值，结果为 `boolean`。`==` 和 `!=` 可比较基本类型的值，也可判断两个兼容类型的引用是否指向同一个对象。
- `&&`、`||` 会短路。左侧已经为假时，`&&` 不计算右侧。左侧已经为真时，`||` 不计算右侧。`!` 对布尔值取反。比如 `a != null && a.length > 0` 会先排除空引用。
- `=` 更新变量，`==` 判断相等。连写 `a = b = 0` 时，先给 `b` 赋值，再给 `a` 赋值。
- `obj instanceof String` 检查引用是否指向与 `String` 类型兼容的对象，引用为 `null` 时结果为 `false`。

优先级决定表达式如何分组，例如 `2 + 3 * 4` 中乘法先与两个操作数结合。同级运算符按结合性分组，例如 `a - b - c` 等价于 `(a - b) - c`。表达式不易看懂时，直接用括号表明分组。

## 语句与代码块

`x = 23;` 和 `System.out.println(x);` 都可以作为语句执行。大括号将一组语句组织为一个代码块，块内声明的局部变量作用范围限于该块。单独的分号是空语句，因此误写 `if (ready);` 会让条件只控制这一条空语句。

## 异或运算

按位与 `&` 在两位都为 1 时得 1，按位或 `|` 在至少有一位为 1 时得 1，按位非 `~` 将各位的 0 和 1 互换。按位异或 `^` 在两位不同时得 1。

`^` 可以对整数或字符按位异或。将字符与密钥异或，再异或同一个密钥即可恢复原值，因为同一位连续异或同一值两次会回到原值。

```java title="字符异或"
char a = '十';           // 码点 U+5341
char secret = 'A';       // 码点 U+0041
a = (char) (a ^ secret); // 第一次异或：0x5341 ^ 0x41 = 0x5300，a 变成 '匀'
a = (char) (a ^ secret); // 再异或同一密钥：0x5300 ^ 0x41 = 0x5341，恢复为 '十'
```

## 条件分支

`if` 的条件必须为布尔值。用 `else if` 连接多项条件时，按书写顺序判断，只执行首个成立的分支。如果全部不成立，有 `else` 时执行 `else`。

通过多次 `if` 比较和交换三个变量，可以得到从小到大的次序。`if...else` 可按成绩选择输出：条件 `math > 60` 不包含 60，如果 60 分也算通过，应使用 `math >= 60`。

`switch` 可以匹配奖号。多个 `case` 连在一起可共享处理代码；执行到 `break` 后退出 `switch`，没有匹配项时执行 `default`。传统 `switch` 中没有 `break` 时会继续执行后续分支。

```java title="奖号分支"
switch (number) {
    case 9: // 与 case 12 共用后面的处理语句
    case 12:
        System.out.println("三等奖");
        break;
    case 27:
        System.out.println("二等奖");
        break;
    default:
        System.out.println("未中奖");
}
```

当 `number` 为 9 或 12 时，两者进入相同的输出语句；其他没有列出的号码进入 `default`。

在课件使用的传统写法中，`switch` 可用 `byte`、`short`、`char`、`int` 或其包装类型，也可用 `String` 和枚举。`long` 不能用于本章这种写法。每个 `case` 对应唯一的常量值。

### Java 14 起：箭头形式的 `switch`

值得注意的是，Java 14 起 `case` 支持箭头标签 `->`。

箭头分支不会贯穿：执行完所匹配的分支就结束。因此不再需要 `break`，也就不会因漏写 `break` 而误执行后续分支。

```java title="箭头 switch 语句"
switch (number) {
    case 9, 12 -> System.out.println("三等奖"); // 多个标签共用一个分支
    case 27    -> System.out.println("二等奖");
    default    -> System.out.println("未中奖");
}
```

箭头右侧若写成代码块，用 `yield` 提供该分支的值：

```java title="箭头 switch 表达式"
String prize = switch (number) {
    case 9, 12 -> "三等奖";
    case 27 -> "二等奖";
    default -> {
        String text = "未中奖";
        yield text; // 将代码块的结果交给 switch 表达式
    }
};
```

作为表达式使用时，每个分支都必须覆盖所有可能取值（或提供 `default`），结果类型由各分支共同决定。箭头形式同样适用于本章列出的 `byte`、`short`、`char`、`int`、`String` 和枚举；`long` 仍不能用于 `switch`。

## 循环、`break` 和 `continue`

### 三种循环

| 写法 | 执行顺序 | 常见用途 |
| --- | --- | --- |
| `for` | 初始化一次，每轮先判断条件，执行循环体后更新 | 按次数或下标遍历 |
| `while` | 每轮先判断条件，成立才执行循环体 | 满足条件时持续处理 |
| `do...while` | 每轮先执行循环体，再判断是否继续 | 至少执行一次 |

`for` 和 `while` 的条件一开始就不成立时，循环体不会执行。`do...while` 的条件后需要分号，例如 `do { count++; } while (count < 3);`。

### 退出循环和跳过本轮

- `break` 结束当前循环，程序从循环后继续执行。在嵌套循环中，不带标签的 `break` 只退出最内层循环。
- `continue` 跳过本轮剩余语句。普通 `for` 会先执行更新表达式再检查条件，`while` 和 `do...while` 则直接检查条件。

例如，要累加奇数，可以在遇到偶数时用 `continue` 跳过累加语句。试除判断素数时，找到一个因子就可以用 `break` 停止试除。

### 用增强 `for` 遍历数组

需要元素下标时用普通 `for`，只需逐个读取元素时可以用增强 `for`。

```java title="数组遍历"
int[] a = {1, 2, 3, 4};
for (int i : a) { // i 依次取得元素值
    System.out.println(i);
}
```

增强 `for` 中的基本类型循环变量是元素值的副本；给 `i` 重新赋值不会修改数组元素。

### 用 `for` 逐项生成并累加

以 `8 + 88 + 888` 为例，下一项可以由上一项乘以 10 后在个位加 8。循环每轮先将当前项加入总和，再准备下一项。

```java title="重复数字求和"
long sum = 0;
long item = 8;
for (int i = 1; i <= 3; i++) {
    sum += item;
    item = item * 10 + 8; // 在末尾拼上一个 8，得到下一项
}
System.out.println(sum); // 984
```

这种写法也要考虑整数溢出：项数增加时，`item` 和 `sum` 都可能超出 `long` 的表示范围。

### 用 `while` 递推计算阶乘倒数

计算 `1 + 1/2! + 1/3! + …` 时，相邻两项可以复用：如果当前项为 `1/n!`，下一项就是当前项除以 `n + 1`。

```java title="阶乘倒数求和"
double sum = 0;
double item = 1;
int i = 1;
while (i <= 20) {
    sum += item;
    i++;
    item *= 1.0 / i; // i 已加 1，此处递推到下一项
}
System.out.println(sum);
```

第一轮加上 `1/1!`，更新后 `item` 为 `1/2!`。`1.0 / i` 使用浮点除法；若写成 `1 / i`，当 `i` 大于 1 时会发生整数除法，结果为 0。

### 用 `break` 提前结束试除

素数是大于 1 且正因子只有 1 和本身的整数。判断一个数时，可从 2 开始尝试除数；一旦发现余数为 0，就不必再检查后续除数。

```java title="试除法"
boolean prime = number >= 2;
for (int divisor = 2; divisor <= number / 2; divisor++) {
    if (number % divisor == 0) {
        prime = false;
        break; // 找到因子后结束试除
    }
}
System.out.println(prime);
```

这里 `number` 是待判断的整数。找到任意一个因子后，`prime` 变为 `false`，剩余的除数无需再检查。

## 根据输入计算平均值

`hasNextDouble()` 判断下一项能否解析为数字，`nextDouble()` 读取该项。每读到一个数字就累加并计数，遇到非数字或输入结束时停止。

```java title="读取数字并计算平均值"
Scanner input = new Scanner(System.in);
double sum = 0;
int count = 0;

while (input.hasNextDouble()) {
    sum += input.nextDouble();
    count++;
}

Double average = count > 0 ? sum / count : null; // 没有读到数字时跳过除法
```

平均值等于总和除以数字个数。计数为 0 时跳过除法，用 `null` 表示没有平均值。

## 自测

1. `break` 与 `continue` 分别影响当前循环的哪个部分？

   答案：:spoiler[`break` 结束它所在的最内层循环；`continue` 跳过当前轮次剩余语句，进入下一轮。]

2. 如何通过乘法和加法将 `88` 变成 `888`？

   答案：:spoiler[先乘 10 得到 880，再加 8，即 `88 * 10 + 8`。]

3. 计算阶乘倒数时，为什么使用 `1.0 / i` 而不是 `1 / i`？

   答案：:spoiler[`1.0 / i` 使用浮点除法，能保留小数；`1 / i` 是整数除法，当整数 `i` 大于 1 时结果为 0。]

4. 在增强 `for` 中给基本类型循环变量重新赋值，会修改数组元素吗？

   答案：:spoiler[不会。循环变量接收的是当前元素值的副本；若要修改数组，需要通过下标给数组元素赋值。]

5. 若 `a` 为 `null`，执行 `a != null && a.length > 0` 会访问数组长度吗？

   答案：:spoiler[不会。`&&` 左侧为假时会短路，右侧不会执行。]
