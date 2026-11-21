---
title: 第 3 章 运算与流程控制
published: 2026-11-21 15:12:00
tags: [位运算, 条件分支, 循环, 数组遍历]
category: Java 学习笔记
---

本章复习异或、条件分支、循环、跳转和输入累加。

<!-- more -->

## 异或运算

`^` 可以对整数或字符按位异或。将字符与密钥异或，再异或同一个密钥即可恢复原值，因为同一位连续异或同一值两次会回到原值。

```java title="字符异或"
char a = '十';
char secret = 'A';
a = (char) (a ^ secret);
a = (char) (a ^ secret); // 恢复为 '十'
```

这是运算演示，不应将此简单方案当作安全加密。

## 条件分支

通过多次 `if` 比较和交换三个变量，可以得到从小到大的次序。`if...else` 可按成绩选择输出：条件 `math > 60` 不包含 60，如果 60 分也算通过，应使用 `math >= 60`。

`switch` 可以匹配奖号。多个 `case` 连在一起可共享处理代码；执行到 `break` 后退出 `switch`，没有匹配项时执行 `default`。传统 `switch` 中没有 `break` 时会继续执行后续分支。

```java title="奖号分支"
switch (number) {
    case 9:
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

## 循环、break 和 continue

- 用 `for` 累加 `8 + 88 + 888 + …`，通过 `item = item * 10 + 8` 生成下一项。
- 用 `while` 逐项计算阶乘倒数之和，`1.0 / i` 使用浮点除法。
- `continue` 可跳过偶数，只累加奇数；内层循环的 `break` 可在找到因子时停止试除，用于判断素数。
- 下标循环可以直接使用下标，增强 `for` 则依次读取数组元素。

```java title="数组遍历"
int[] a = {1, 2, 3, 4};
for (int i : a) {
    System.out.println(i);
}
```

增强 `for` 中的基本类型循环变量是元素值的副本；给 `i` 重新赋值不会修改数组元素。

### 逐项生成与累加

以 `8 + 88 + 888` 为例，下一项可以由上一项乘以 10 后在个位加 8。循环每轮先将当前项加入总和，再准备下一项。

```java title="重复数字求和"
long sum = 0;
long item = 8;
for (int i = 1; i <= 3; i++) {
    sum += item;
    item = item * 10 + 8;
}
System.out.println(sum); // 984
```

这种写法也要考虑整数溢出：项数增加时，`item` 和 `sum` 都可能超出 `long` 的表示范围。

### 递推计算阶乘倒数

计算 `1 + 1/2! + 1/3! + …` 时，相邻两项可以复用：如果当前项为 `1/n!`，下一项就是当前项除以 `n + 1`。

```java title="阶乘倒数求和"
double sum = 0;
double item = 1;
int i = 1;
while (i <= 20) {
    sum += item;
    i++;
    item *= 1.0 / i;
}
System.out.println(sum);
```

第一轮加上 `1/1!`，更新后 `item` 为 `1/2!`。`1.0 / i` 使用浮点除法；若写成 `1 / i`，当 `i` 大于 1 时会发生整数除法，结果为 0。

### 利用循环判断素数

素数是大于 1 且正因子只有 1 和本身的整数。判断一个数时，可从 2 开始尝试除数；一旦发现余数为 0，就不必再检查后续除数。

```java title="试除法"
boolean prime = number >= 2;
for (int divisor = 2; divisor <= number / 2; divisor++) {
    if (number % divisor == 0) {
        prime = false;
        break;
    }
}
System.out.println(prime);
```

这里 `number` 是待判断的整数。`break` 只退出它所在的最内层循环；如果把该逻辑放在遍历多个数字的外层循环里，外层仍会继续。

## 根据输入计算平均值

`hasNextDouble()` 判断下一个输入是否可解析为 `double`，再用 `nextDouble()` 读取并累计数量和总和。遇到不能解析的输入或输入结束时循环停止。若没有读取到任何数字，`sum / m` 不代表有效平均值，需要先检查 `m` 是否为 0。

## 自测

1. `break` 与 `continue` 分别影响当前循环的哪个部分？

   答案：:spoiler[`break` 结束它所在的最内层循环；`continue` 跳过当前轮次剩余语句，进入下一轮。]

2. 如何通过乘法和加法将 `88` 变成 `888`？

   答案：:spoiler[先乘 10 得到 880，再加 8，即 `88 * 10 + 8`。]

3. 计算阶乘倒数时，为什么使用 `1.0 / i` 而不是 `1 / i`？

   答案：:spoiler[`1.0 / i` 使用浮点除法，能保留小数；`1 / i` 是整数除法，当整数 `i` 大于 1 时结果为 0。]

4. 在增强 `for` 中给基本类型循环变量重新赋值，会修改数组元素吗？

   答案：:spoiler[不会。循环变量接收的是当前元素值的副本；若要修改数组，需要通过下标给数组元素赋值。]
