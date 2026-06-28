---
title: R语言方差分析 (ANOVA)
published: 2026-06-29 03:27:00
description: T检验只能对比两组差异，如果要看 3 组及以上的分类变量对连续变量的影响，就需要用到方差分析（ANOVA）。
tags: [方差分析, ANOVA, 差异性分析]
category: 管理统计与R实训
draft: false
---

## 单因素方差分析
检验一个因素（如：不同品种）对指标的影响。
```r
# 拟合模型
model_1w <- aov(产量 ~ 品种, data = df)
summary(model_1w)

# 事后多重比较 (Tukey 法)：看看具体哪两个品种之间有差异
library(agricolae)
HSD.test(model_1w, "品种", group = TRUE, console = TRUE)
```

## 双因素方差分析及交互作用
如果存在两个因素，我们还要关心它们之间会不会相互影响（交互作用）。
```r
# 带交互作用的模型
model_2wi <- aov(产量 ~ 品种 * 施肥方式, data = df)
summary(model_2wi)
```

## ANOVA 的前提假设检验
方差分析要求数据服从**正态分布**并且各组**方差齐性**。
```r
# 正态性检验 (Shapiro-Wilk)
shapiro.test(x)  # p > 0.05 说明符合正态

# 方差齐性检验 (Levene's test)
library(car)
leveneTest(产量 ~ 品种, data = df) # p > 0.05 说明方差齐
```

## 进阶补充：ANOVA的线性模型本质与平方和类型
*   **ANOVA 即一般线性模型 (GLM)**：在数学上，方差分析与线性回归是等价的，其本质是通过引入虚拟变量（Dummy Variables）来拟合分类自变量的线性模型（$$Y = Xeta + \epsilon$$）。在R中，`aov()` 实际上就是 `lm()` 的包装器。
*   **I类、II类与III类平方和的深层陷阱**：
    *   R 的默认 ANOVA（使用 `summary(aov())`）计算的是**Type I (Sequential) Sum of Squares**。这意味着变量进入模型的顺序会直接改变计算结果！如果你的设计是非平衡的（各组样本量不同），这会导致错误的结论。
    *   为了得到顺序无关的结果（如 SAS 和 SPSS 的默认输出），必须使用 `car::Anova(model, type=3)` 来计算 Type III 平方和，并且必须将因子的正交对比属性（contrasts）修改为 `contr.sum` 而非默认的 `contr.treatment`。
