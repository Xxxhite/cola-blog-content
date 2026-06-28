---
title: 概率分布与参数估计
published: 2026-06-29 03:25:00
description: 正态分布和 t 分布是统计学中最重要的两种分布。在 R 中，这类分布都有标准的函数前缀（p, q, d, r）用于计算概率、分位数和生成随机数。
tags: [概率分布, 参数估计, 随机数生成]
category: 管理统计与R实训
draft: false
---

<!-- more -->

## 计算分布概率与分位数
在函数前加 `p` 计算累计概率，加 `q` 计算分位数。
```r title="code.R"
# 正态分布 N(50, 10^2)
pnorm(80, mean = 50, sd = 10)         # P(X < 80)
qnorm(0.95, mean = 0, sd = 1)         # 标准正态分布，累计概率 0.95 的分位数

# t 分布
pt(-2, df = 10)                       # P(t < -2)
qt(0.975, df = 20)                    # 自由度 20 的双尾分位数
```

## 区间估计：z.test() 实践
当我们知道样本情况，需要估计总体均值的置信区间时：
```r title="code.R"
library(BSDA)

# 总体标准差已知，求 95% 置信区间
z.test(x, mu = 0, sigma.x = 5, conf.level = 0.95)$conf.int

# 总体标准差未知，用样本标准差代替
z.test(x, mu = 0, sigma.x = sd(x), conf.level = 0.95)$conf.int
```

## 进阶补充：极大似然估计 (MLE) 与经验分布函数
*   **极大似然估计的数值求解**：在不知道总体分布参数时，可以构建对数似然函数，然后利用 R 中的通用优化函数 `optim()` 或一维优化 `optimize()` 进行数值寻优，从而求得 MLE 估计值。
    ```r title="code.R"
    # 使用 optim 求解正态分布 MLE 的简易示例
    neg_log_lik <- function(theta, x) {
      -sum(dnorm(x, mean = theta[1], sd = theta[2], log = TRUE))
    }
    optim(c(0, 1), neg_log_lik, x = sample_data)
    ```
*   **经验累积分布函数 (ECDF)**：在不预设任何参数分布假设时，可以通过 `ecdf()` 函数生成阶跃函数，利用 Kolmogorov-Smirnov 检验（`ks.test`）来量化样本分布与理论分布之间的最大距离（`D_n`）。
