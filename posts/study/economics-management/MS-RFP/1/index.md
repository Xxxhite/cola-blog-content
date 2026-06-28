---
title: R语言基础数据结构
published: 2026-06-29 03:20:00
description: 本文将带你了解 R 语言中最基础也是最重要的数据结构：向量、矩阵、数组、数据框、因子和列表。掌握它们是处理任何复杂数据的第一步。
tags: [数据结构, 基础语法, 向量矩阵]
category: 管理统计与R实训
draft: false
---

<!-- more -->

## 向量 (Vector)
向量是 R 中最基本的数据结构。
```r title="code.R"
# 产生等差序列
seq(from = 2, to = 10, by = 2) # [1] 2 4 6 8 10 

# 重复对象
rep(1:3, times = 3)        # 整体重复3次: 1 2 3 1 2 3 1 2 3
rep(1:3, each = 3)         # 每个元素重复3次: 1 1 1 2 2 2 3 3 3

# 随机产生正态分布向量
rnorm(n = 50, mean = 0, sd = 1)
```
:::tip[向量引用与排序]
可以通过下标取值，负数表示排除。`sort()` 用于排序，`order()` 返回排序后的索引。
:::

## 矩阵 (Matrix) 与数组 (Array)
矩阵是二维的数字集合，数组可以有更多维度。
```r title="code.R"
# 创建矩阵
m <- matrix(1:20, nrow = 5, ncol = 4, byrow = TRUE)

# 创建多维数组
b <- array(rep(1:3, each = 9), dim = c(3, 3, 3))
```

## 数据框 (Data Frame)
数据框是最常用的表格数据结构，类似于 Excel 表格。
```r title="code.R"
df <- data.frame(
  Name = c("Alice", "Bob"),
  Age = c(25, 30)
)
# 也可以使用 as.data.frame() 转换其他结构
```

## 因子 (Factor) 与列表 (List)
因子用于表示分类变量；列表是 R 中最灵活的数据结构，可以包含不同类型的元素。
```r title="code.R"
# 因子
Grade <- factor(c("A", "B", "C"), levels = c("C", "B", "A"), ordered = TRUE)

# 列表
listOne <- list(title = "Results", scores = df)
```

## 进阶补充：R 的内存管理与对象机制
*   **Copy-on-Modify（写时复制）机制**：在 R 中，将一个向量赋值给另一个变量（如 `y <- x`）不会立即复制内存数据，它们会共享同一个内存地址。只有当 `y` 被修改时，R 才会分配新的内存并复制数据。可以通过 `lobstr::obj_addr()` 来观察内存地址的变化。
*   **环境与作用域**：R 采用词法作用域（Lexical Scoping）。函数内的变量查找首先在当前环境中进行，然后向父环境逐级查找，直到全局环境。
*   **S3 与 S4 对象系统**：R 的基础数据结构大多基于 S3 泛型函数分发（如 `print()`、`summary()`），通过 `class()` 属性来决定调用哪个方法。S4 则提供了更严格的面向对象体系（包含槽位 `slots`），用于复杂的统计模型开发。
