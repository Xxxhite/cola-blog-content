---
title: 假设检验完全指南 (Z检验与T检验)
published: 2026-06-29 03:26:00
description: 我们经常需要判断两组数据到底有没有“本质差异”，还是仅仅因为抽样误差。这时候就要用到假设检验了。
tags: [假设检验, Z检验, T检验]
category: 管理统计与R实训
draft: false
---

<!-- more -->

## 单样本与双样本 T 检验
如果总体标准差未知，均值检验通常使用 T 检验。
```r title="code.R"
# 单样本检验（例如判断重量是否等于 25）
t.test(weight, mu = 25, alternative = "two.sided")

# 独立双样本 T 检验
t.test(A, B, var.equal = TRUE)   # 假定方差相等
t.test(A, B, var.equal = FALSE)  # 假定方差不等（Welch t-test）

# 配对样本 T 检验（例如测试前与测试后）
t.test(before, after, paired = TRUE)
```

## 方差齐性检验与效应量
在做独立双样本 T 检验前，通常要检验两个方差是否齐平。检验后，我们还需要用**效应量**说明差异的“大小”。
```r title="code.R"
# 方差齐性检验（F-test）
var.test(A, B)

# 效应量（Cohen's d）
library(lsr)
cohensD(A, B, method = "unequal")
```

## 进阶补充：假设检验的数理本质与功效分析
*   **Satterthwaite 近似法（Welch t 检验）**：在两组方差不齐时，经典的学生 t 检验会产生严重的 Type I Error 膨胀。R 默认使用的 Welch t-test 并不预设方差齐性，而是通过 Satterthwaite 公式估算一个调整后的非整数自由度。
*   **统计功效（Statistical Power）与样本量估算**：P 值仅仅告诉你“是否有差异”，而不告诉你“如果真有差异，你能发现它的概率是多少”。使用 `pwr` 包可以进行功效分析：在给定效应量（Effect Size，如 Cohen's d）和显著性水平（$\alpha$）的前提下，计算要达到 80% 功效所需的最小样本量。
*   **多重比较的 $\alpha$ 膨胀**：如果在同一数据集上进行多次独立的假设检验，至少犯一次第一类错误的概率会急剧增加（$1 - (1 - \alpha)^n$）。必须使用 Bonferroni 或 FDR（False Discovery Rate）进行 P 值校正（`p.adjust()`）。
