---
title: 第 2 章 数据类型、输入与数组
published: 2026-11-21 15:11:00
tags: [字符编码, 类型转换, 数组引用, 二分查找]
category: Java 学习笔记
---

本章整理字符与数值、类型转换、键盘输入、数组引用和数组查找。

<!-- more -->

## 字符和数值类型

`char` 保存一个 UTF-16 代码单元，可以用字符字面量或 Unicode 转义序列 `\u4F60` 表示“你”。将 `char` 转为 `int` 可查看其数值；反向强制转换则从整数得到相应的 `char` 值。一个 Unicode 字符不一定只需一个 `char`。

`byte`、`int`、`float` 和 `double` 表示不同类型的数值。窄化转换要显式写出目标类型，而且可能改变数值：

```java title="类型转换"
int n = 129;
byte b = (byte) n;       // b 为 -127
double d = 123456789.123456789;
float f = (float) d;     // 精度可能降低
```

浮点数近似表示实数，输出的位数增加并不等于增加了实际精度。

`byte` 的范围是 -128 到 127，`int` 的范围更大。`float` 字面量通常使用 `f` 后缀，例如 `123.5f`；没有后缀的小数默认为 `double`。整数转成范围更大的类型通常可以直接赋值，而从范围更大或精度更高的类型转回较窄类型时，需要强制转换并考虑信息损失。

## 用 Scanner 输入和累加

`Scanner.nextDouble()` 读取输入，默认以空白字符分隔数值；以下循环以 `0` 作为结束标记，计算此前数值之和。使用前需导入 `java.util.Scanner`。

```java title="输入与累加"
Scanner reader = new Scanner(System.in);
double sum = 0;
double x = reader.nextDouble();
while (x != 0) {
    sum = sum + x;
    x = reader.nextDouble();
}
System.out.printf("sum=%10.5f\n", sum);
```

`%10.5f` 表示浮点数至少占 10 个字符宽，小数保留 5 位。输入不能解析为数字时需要额外处理异常，原示例没有处理这一情况。

## 数组与引用

`length` 返回数组长度。`a = b` 之后，两个变量引用同一个数组；此时通过任一变量修改元素，另一个变量访问到的也是修改后的元素。赋值没有复制元素。

```java title="数组引用"
int[] a = {1, 2, 3, 4};
int[] b = {100, 200, 300};
a = b;
System.out.println(a == b); // true
System.out.println(a.length); // 3
```

示例打印的 `System.identityHashCode` 是身份哈希值，不能当作对象的内存地址，也不能单凭哈希相同断定是同一对象。

## 排序与查找

选择排序每轮寻找未排序范围内的最小元素，并把它交换到该范围的开头。二分查找要求数组有序：每次比较中间值后缩小剩余区间，直到找到或区间为空。

```java title="选择排序"
int[] values = {12, 45, 67, 89, 123, -45, 67};
for (int i = 0; i < values.length - 1; i++) {
    int minIndex = i;
    for (int j = i + 1; j < values.length; j++) {
        if (values[j] < values[minIndex]) {
            minIndex = j;
        }
    }
    int temp = values[i];
    values[i] = values[minIndex];
    values[minIndex] = temp;
}
System.out.println(java.util.Arrays.toString(values));
```

外层循环确定本轮待放置最小值的位置，内层循环寻找剩余部分的最小值。排序结果为 `[-45, 12, 45, 67, 67, 89, 123]`；重复元素也会保留。

```java title="二分查找"
int left = 0, right = values.length - 1;
int index = -1;
while (left <= right) {
    int mid = left + (right - left) / 2;
    if (values[mid] == target) {
        index = mid;
        break;
    } else if (values[mid] < target) {
        left = mid + 1;
    } else {
        right = mid - 1;
    }
}
```

其中 `values` 是有序整数数组，`target` 是目标值；`index` 为 `-1` 表示未找到。每轮都排除已经比较的中点。也可以使用 `Arrays.sort` 排序后调用 `Arrays.binarySearch`。

## 自测

1. `a = b` 后再给 `b` 赋一个新数组，`a` 会自动指向新数组吗？

   答案：:spoiler[不会。赋值时 `a` 获得的是 `b` 当时保存的引用；之后改变 `b` 的指向不会改变 `a`，它仍指向原来的数组。]

2. 为什么将 `129` 强制转换成 `byte` 不再得到 `129`？

   答案：:spoiler[`byte` 是 8 位有符号整数，范围为 -128 到 127。转换保留低 8 位，129 的低 8 位按补码解释为 -127。]

3. 选择排序每一轮做什么？二分查找又有什么前提？

   答案：:spoiler[选择排序从未排序的部分找出最小元素，放到该部分开头。二分查找要求数组有序，并在每次比较后排除已经检查过的中点及不可能包含目标的一半区间。]
