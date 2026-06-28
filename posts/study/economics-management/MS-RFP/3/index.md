---
title: R语言数据导入导出与基础绘图
published: 2026-06-29 03:22:00
description: 数据分析的第一步是把数据“搬”进 R 里，分析结束后再输出结果。同时，利用 R 的基础图形系统，我们可以快速生成散点图并进行探索性分析。
tags: [数据导入, 导出操作, 基础绘图]
category: 管理统计与R实训
draft: false
---

<!-- more -->

## 数据的导入与导出
常用的文件格式是 `.csv` 和 `.xlsx`，R 提供了非常简便的接口。
```r title="code.R"
# 导入 CSV 格式
baby <- read.csv("../data/baby.csv", header = TRUE, sep = ",")

# 导入 Excel 格式需要额外包
library(readxl)
baby_xlsx <- read_excel("../data/baby.xlsx")

# 导出数据
write.csv(baby, "data_export.csv", row.names = FALSE)
```

## 基础绘图：plot() 核心法则
`plot()` 是一把瑞士军刀，用来快速查看数据分布和趋势。
```r title="code.R"
x <- sample(1:100, 80)
y <- 2 * x + rnorm(80, 0, 10)

# 绘制散点图并设置属性
plot(x, y, 
     type = "p", pch = 19,        # type 为点，pch 为点形状
     col = "#1e90ff",             # 颜色
     xlab = "X 轴", ylab = "Y 轴", 
     main = "散点图示例", 
     xlim = c(1, 80), ylim = c(0, 200))
```

## 双坐标轴作图
```r title="code.R"
# 第一张图
plot(stock$year, stock$SP, type = "l", col = "blue")
# 覆盖并画第二张图
par(new = TRUE)
plot(stock$year, stock$SQ, type = "l", col = "red", axes = FALSE)
axis(side = 4)   # 添加右侧坐标轴
```

## 进阶补充：海量数据 I/O 与底层图形参数
*   **极速读取方案**：面对 GB 级别的数据文件，原生的 `read.csv()` 性能极差。推荐使用 `data.table::fread()`（C 语言多线程底层实现，速度极快）或 `vroom::vroom()`（利用内存映射技术延迟加载）。
*   **底层图形参数 (par)**：R 的基础图形系统由底层的 `graphics` 包控制。在进行专业排版时，常需要精确控制边缘空白：`mar` 参数控制图形内部边界（默认 `c(5, 4, 4, 2) + 0.1`），`oma` 控制外部边界，常用于在多图组合（`mfrow`）时留出总标题空间。
