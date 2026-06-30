---
title: "第 5 章 数据库与表的管理及索引"
published: 2026-06-30 18:04:00
tags: [数据库, MySQL, SQL, 数据库原理]
category: "数据库原理与应用"
---

本章介绍数据库管理和数据表定义、维护，以及约束与索引的原理。

<!-- more -->

## 5.1 数据库操作与表的物理管理

MySQL 8.0 中我们可以进行数据库的定义，同时支持在建表时定义 **计算列 (Generated Column)**，其值通过表中其他列的表达式计算自动得出，无需手动插入：
```sql title="calculated_column.sql"
CREATE TABLE triangle (
  sidea DOUBLE,
  sideb DOUBLE,
  sidec DOUBLE GENERATED ALWAYS AS (SQRT(sidea * sidea + sideb * sideb)) STORED
);
```
*   `VIRTUAL` (默认)：每次读取表时实时计算，不占用物理磁盘空间。
*   `STORED`：在插入或修改数据时计算并物理存储在磁盘上，可以像普通列一样创建索引。

## 5.2 数据完整性约束

MySQL 提供了以下完整性约束，可以直接在列级定义或在表级定义：
*   `PRIMARY KEY`：主键约束，自动非空且唯一。
*   `FOREIGN KEY`：外键约束。支持级联操作：
    *   `ON DELETE CASCADE`：父表删除，子表对应行自动级联删除。
    *   `ON DELETE SET NULL`：父表删除，子表对应外键值自动置为 NULL。
*   `UNIQUE`：唯一性约束，允许有多个 NULL 值。
*   `CHECK`：检查约束，用于限定列的取值范围。

## 5.3 索引原理与 B+ 树

索引是加速检索的数据结构，MySQL InnoDB 引擎主要采用 **B+ 树索引**。
*   **聚簇索引 (Clustered Index)**：将数据行与主键索引树存储在一起，叶子结点直接存储整行数据。一张表有且仅有一个聚簇索引（默认是主键）。
*   **非聚簇索引 (Secondary Index)**：也称二级索引，叶子结点存储的是主键值而非实际物理行。检索非主键索引列时，需要先获取主键值，再通过主键索引“**回表**”获取整行数据。

```sql title="index_operations.sql"
-- 创建索引
CREATE INDEX idx_product_price ON Products (UnitPrice);

-- 删除索引
DROP INDEX idx_product_price ON Products;
```\n

:::warning[教材纠错：DECIMAL 数据类型定义拷贝错误]
原书中在介绍常用数据类型时，将 `Decimal(M, D)` 的特征描述写成了：“*D 是精度，如果 D<=24 则为默认的 FLOAT，如果 D>24 则会自动被转换为 DOUBLE 型。*”

**纠错解析**：这是直接从 `Float(M, D)` 描述中复制粘贴遗留的排版硬伤。在 MySQL 中，`DECIMAL` 属于高精度的**定点数类型**，绝对不会在存储时退化或隐式转换为浮点数。其正确定义应当为：
> `Decimal(M, D)`：固定精度和小数位的数字数据。M 是最大有效位数（精度，取值范围 $1 \sim 65$），D 是小数点右侧的位数（标度，取值范围 $0 \sim 30$）。常用在对数值精度要求极高（不允许浮点误差）的金融、财务报表等场景中。
:::
