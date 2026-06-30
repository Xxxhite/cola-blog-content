---
title: "第 4 章 关系数据库设计实例"
published: 2026-06-30 18:03:00
tags: [销售管理系统, 数据库设计实例, 物理实现, SQL建表]
category: "数据库原理与应用"
---

本章以企业销售管理数据库设计为例，分别采用 E-R 图和规范化理论两种不同途径，描述一个数据库设计的完整过程。

<!-- more -->

## 4.1 销售管理数据库 (mySales) 实例设计

在销售管理系统中，需要管理的核心数据实体包括：客户 (Customers)、员工 (Employees)、商品 (Products)、订单 (Orders) 和订单明细 (OrderItems)。

### 4.1.1 E-R 概念结构设计

通过需求分析，可以绘制出全局 E-R 图。
*   一个客户可以下多个订单 ($1:n$)。
*   一个员工可以处理多个订单 ($1:n$)。
*   一个订单可以包含多种商品，一种商品也可以在多个订单中出现 ($m:n$)。

### 4.1.2 逻辑设计规范化过程

设计的关系模式规范化过程如下：
*   **初始结构**：包含一张大表，订单数据与明细混杂，商品信息存在大量重复。
*   **2NF 阶段**：将订单主体信息 (订单号、订购日期、客户号等) 与订单商品明细 (订单号、商品号、单价、数量、折扣) 分离，消除明细中对 `(OrderID, ProductID)` 组合键的部分函数依赖（如订单日期只依赖于 `OrderID`）。
*   **3NF 阶段**：从订单表中分离出客户表和员工表，消除“订单号 $\to$ 客户号 $\to$ 客户姓名”这一传递函数依赖。

## 4.2 数据库物理实现

设计完成后，我们可以通过编写 SQL DDL 语句在 MySQL 8.0 中创建数据表结构。

```sql title="schema_creation.sql"
-- 创建客户表
CREATE TABLE Customers (
  CustomerID CHAR(6) PRIMARY KEY,
  CompanyName VARCHAR(100) NOT NULL,
  ContactName VARCHAR(50),
  Phone VARCHAR(20)
);

-- 创建商品表
CREATE TABLE Products (
  ProductID INT AUTO_INCREMENT PRIMARY KEY,
  ProductName VARCHAR(100) NOT NULL,
  UnitPrice DECIMAL(10,2) NOT NULL
);

-- 创建订单表
CREATE TABLE Orders (
  OrderID INT AUTO_INCREMENT PRIMARY KEY,
  CustomerID CHAR(6) NOT NULL,
  OrderDate DATE NOT NULL,
  CONSTRAINT fk_orders_customers FOREIGN KEY (CustomerID) REFERENCES Customers (CustomerID)
);
```\n