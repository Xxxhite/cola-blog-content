---
title: ggplot2 与高级数据可视化
published: 2026-06-29 03:23:00
description: 除了自带的 plot()，R 语言的绘图天花板是 ggplot2 和其生态系统。本文讲解如何绘制条形图、直方图、箱线图、气泡图以及雷达图等专业图表。
tags: [ggplot2, 数据可视化, 高级图表]
category: 管理统计与R实训
draft: false
---

<!-- more -->

## 基础图形生态系统
原生 R 提供了很多好用的专有函数：
* **条形图：**`barplot()` 可设置 `horiz=TRUE` 绘制水平条形图，结合 `RColorBrewer` 设置色板非常好看。
* **直方图与密度曲线：** 
```r title="code.R"
hist(turnover, breaks = 20, prob = TRUE, col = "lightblue")
lines(density(turnover), col = "red", lwd = 2) # 叠加密度曲线
```
* **箱线图：**`boxplot()` 能直观展示中位数和离群点。
* **气泡图：**使用 `symbols(circles = ...)` 将第三个维度映射为圆圈大小。

## 引入 ggplot2 进阶
使用 `ggplot2` 遵循“图层”叠加的思想（`+`）。
```r title="code.R"
library(ggplot2)
library(reshape2)

# 面积图/折线图示例
df <- melt(expenditure_data, id.vars = "year", variable.name = "Type", value.name = "Expenditure")

ggplot(df, aes(x = year, y = Expenditure, color = Type, group = Type)) +
  geom_line() + 
  geom_point() +
  labs(title = "历年支出变化", x = "年份", y = "支出 (元)") +
  theme_minimal()
```

## 特殊图表：雷达图
借助第三方包可以轻松绘制雷达图，用于多维度数据对比。
```r title="code.R"
library(ggiraphExtra)
ggRadar(data = regional_data, aes(group = Regional), alpha = 0, size = 2)
```

## 进阶补充：ggplot2 的底层哲学与扩展机制
*   **图形语法（Grammar of Graphics）的严格映射**：`ggplot2` 的核心在于数据空间到图形属性空间（Aesthetic Attributes）的映射。标度（Scale）负责将数据的实际单位转换为屏幕上的像素或颜色 RGB 值。
*   **Scale 限制与坐标轴限制的本质区别**：使用 `scale_y_continuous(limits = c(0, 10))` 会在绘图前**直接删除**超出范围的数据（这可能改变箱线图的中位数或平滑曲线的拟合）；而使用 `coord_cartesian(ylim = c(0, 10))` 则是在绘图完成后进行**视窗缩放**，不会影响底层统计计算。
*   **自定义 Geom 与 ggproto**：当内置的几何对象无法满足要求时，可以通过面向对象的 `ggproto` 机制继承现有的 `Geom`，重写 `draw_panel()` 方法直接调用底层的 `grid` 包图形原语（grob）来绘制任何自定义形状。
