---
title: 相关分析与线性回归
published: 2026-06-29 03:28:00
description: 当我们要研究两个连续变量（如身高与体重、投入与产出）之间的数量关系时，相关分析和回归分析是最犀利的武器。
tags: [相关分析, 线性回归, 模型拟合]
category: 管理统计与R实训
draft: false
---

## 相关分析
通过散点图和相关系数可以判断变量是否线性相关。
```r
# 计算 Pearson 相关系数及 P 值矩阵
library(psych)
corr.test(df[, 1:6], method = "pearson")
```

## 多元线性回归与逐步回归
建立多个自变量去预测因变量的线性模型：
```r
# 拟合模型
model_1 <- lm(每股收益 ~ 每股净资产 + 净资产收益率 + 总股本, data = regression_data)
summary(model_1)

# 逐步回归筛选变量 (AIC)
model_2 <- step(model_1)
```

## 模型预测与诊断
建立模型后，不仅可以用来预测新数据，还需要对残差进行诊断检查。
```r
# 预测与置信区间
predict(model_2, newdata = new_df, interval = "prediction")

# 共线性检验 (VIF < 10 一般认为共线性在可控范围内)
library(car)
vif(model_1)

# 自相关检验
durbinWatsonTest(model_1)
```

## 进阶补充：矩阵代数视角下的回归与异方差稳健标准误
*   **普通最小二乘法 (OLS) 的矩阵解**：多元线性回归的最优解为 $$\hat{eta} = (X^TX)^{-1}X^TY$$。R 底层的 `lm.fit()` 利用了 QR 分解来高效、数值稳定地求逆矩阵，而不是直接计算 $$(X^TX)^{-1}$$。
*   **异方差稳健标准误（Sandwich Estimator）**：经典 OLS 假设残差项同方差。如果存在异方差（通过 White 检验或 Breusch-Pagan 检验发现），虽然 $$\hat{eta}$$ 仍然无偏，但标准误会被低估，导致虚假的显著性。解决方案是使用 `sandwich` 包和 `lmtest` 包的 `coeftest(model, vcov = vcovHC)` 来计算稳健标准误。
*   **正则化与高维困境**：当自变量数量 $$p$$ 大于样本量 $$n$$ 或存在严重多重共线性时，$$X^TX$$ 不可逆。此时必须引入惩罚项（L1 或 L2），使用 `glmnet` 包进行 Ridge (岭回归) 或 Lasso 回归。
