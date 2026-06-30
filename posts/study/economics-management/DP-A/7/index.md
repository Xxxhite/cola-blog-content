---
title: "第 7 章 MySQL 程序设计"
published: 2026-06-30 18:06:00
tags: [存储过程, 自定义函数, 触发器, 游标控制流]
category: "数据库原理与应用"
---

本章主要介绍存储过程、自定义函数、触发器以及游标。

<!-- more -->

## 7.1 MySQL 编程基础

在编写存储过程和函数时，变量分为三类：
1.  **系统变量**：以 `@@` 开头，如 `@@datadir`、`@@sql_safe_updates`。
2.  **用户变量**：以 `@` 开头，在当前会话（Session）中一直有效，无需声明即可直接赋值使用（如 `SET @num = 1;`）。
3.  **局部变量**：必须在存储过程或函数体的 `BEGIN...END` 块中使用 `DECLARE` 声明，且声明必须位于块的最开始处。

## 7.2 存储过程 (Stored Procedure) 与自定义函数 (UDF)

*   **存储过程**：
    *   通过 `CREATE PROCEDURE` 创建，使用 `CALL` 语句调用。
    *   支持 `IN`（输入）、`OUT`（输出）、`INOUT`（输入输出）三种参数模式。
    *   可以包含 DDL、DML 操作，允许返回多个结果集。
*   **自定义函数**：
    *   通过 `CREATE FUNCTION` 创建，可以直接在 SQL 语句中调用（如 `SELECT my_func(col) FROM tbl;`）。
    *   只支持输入参数，**必须** 有 `RETURNS` 说明和 `RETURN` 返回值。
    *   函数体内部限制较多，不能包含导致数据修改的事务性 DDL 操作，且不能返回结果集。

```sql title="stored_procedure_example.sql"
-- 存储过程实例：计算商品单价中位数、方差与标准差
DROP PROCEDURE IF EXISTS sp_price_stats;
DELIMITER $$
CREATE PROCEDURE sp_price_stats()
BEGIN
  DECLARE $n INT;
  DECLARE $m, $s, $x DOUBLE;
  
  -- 获取总数、平方和与平均值
  SELECT COUNT(*), SUM(Unitprice * Unitprice), AVG(Unitprice) 
    INTO $n, $s, $x 
  FROM Products;
  
  -- 计算中位数（区分奇偶数）
  IF (MOD($n, 2) = 0) THEN
    SELECT SUM(Unitprice) / 2 INTO $m 
    FROM (
      SELECT Unitprice, ROW_NUMBER() OVER (ORDER BY Unitprice) as rowno 
      FROM Products
    ) as p 
    WHERE rowno = $n / 2 OR rowno = $n / 2 + 1;
  ELSE
    SELECT Unitprice INTO $m 
    FROM (
      SELECT Unitprice, ROW_NUMBER() OVER (ORDER BY Unitprice) as rowno 
      FROM Products
    ) as p 
    WHERE rowno = ($n + 1) / 2;
  END IF;
  
  -- 输出统计值
  SELECT 
    $m as '中位数', 
    CAST(($s - $n * $x * $x) / $n as DECIMAL(16,8)) as '方差',
    CONVERT(SQRT(($s - $n * $x * $x) / $n), DECIMAL(16,8)) as '标准差';
END $$
DELIMITER ;
```

## 7.3 触发器 (Trigger)

触发器是在表发生 `INSERT`、`UPDATE` 或 `DELETE` 操作时自动触发执行的一组 SQL 语句。
*   **行级触发器**：使用 `FOR EACH ROW` 说明，每一次受影响的行都会执行一次触发器。
*   **内置临时行**：
    *   `INSERT` 触发器：拥有 `NEW` 临时行，代表即将插入的新数据。
    *   `DELETE` 触发器：拥有 `OLD` 临时行，代表即将删除的历史数据。
    *   `UPDATE` 触发器：同时拥有 `OLD`（修改前）和 `NEW`（修改后）临时行。
*   **异常终止机制**：在触发器中如果需要终止当前操作（例如业务校验失败），可以使用 `SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '错误信息';` 抛出异常以强行回滚当前 SQL 操作。

```sql title="trigger_example.sql"
-- 触发器实例：当折扣率超出客户类型的限制上限时，使用 SIGNAL 强制抛出异常回滚操作
DROP TRIGGER IF EXISTS tr_check_discount;
DELIMITER $$
CREATE TRIGGER tr_check_discount BEFORE INSERT ON myOrderitems 
FOR EACH ROW
BEGIN
  DECLARE $limit DECIMAL(6,2);
  
  -- 根据订单号查询对应客户类别的折扣上限
  SELECT Discount_limit INTO $limit 
  FROM Orders 
  JOIN Customers USING (CustomerID)
  JOIN CustomerTypes USING (TypeID)
  WHERE OrderID = new.OrderID;
  
  -- 校验折扣是否越界
  IF (new.Discount IS NOT NULL) AND (new.Discount < 0 OR new.Discount > $limit) THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = '插入失败：销售折扣率超出该客户类别的上限约束！';
  END IF;
END $$
DELIMITER ;
```

## 7.4 游标 (Cursor)

游标用于逐行遍历 SQL 查询结果集。MySQL 的游标是 **只读、单向（不可逆向移动）且不敏感** 的。
使用步骤：`DECLARE（定义游标及 NOT FOUND 处理器）` $\to$ `OPEN（打开游标）` $\to$ `FETCH（提取数据到变量）` $\to$ `CLOSE（关闭游标）`。

```sql title="cursor_loop.sql"
-- 游标循环标准模板（使用 WHILE 循环）
DROP PROCEDURE IF EXISTS sp_cursor_demo;
DELIMITER $$
CREATE PROCEDURE sp_cursor_demo()
BEGIN
  DECLARE $done INT DEFAULT 0;
  DECLARE $pid INT;
  DECLARE $price DECIMAL(10,2);
  
  -- 1. 声明游标
  DECLARE cur_prod CURSOR FOR SELECT ProductID, Unitprice FROM Products;
  -- 2. 声明 NOT FOUND 异常句柄，游标读完后自动将 $done 置为 1
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET $done = 1;
  
  OPEN cur_prod;
  
  -- 3. 首次提取数据
  FETCH cur_prod INTO $pid, $price;
  
  -- 4. 循环遍历
  WHILE $done = 0 DO
    -- 执行业务逻辑处理
    -- ...
    
    -- 下移游标指针
    FETCH cur_prod INTO $pid, $price;
  END WHILE;
  
  CLOSE cur_prod;
END $$
DELIMITER ;
```\n

## 7.5 教材纠错：存储过程与触发器中的逻辑与语法硬伤

:::warning[教材纠错 1：中位数计算逻辑丢失分母]
在原书实例 7-6 的中位数计算中，偶数个数时的中位数求法为：
```sql
IF (MOD($n,2)=0) THEN
  SELECT sum(Unitprice) into $m FROM ...
```
**纠错解析**：当总商品数为偶数时，中位数定义应为中间两位单价的**平均值**（即 `SUM(Unitprice) / 2`）。原书代码直接求和，导致偶数情况下的中位数结果扩大了整整一倍。应更正为 `SELECT SUM(Unitprice) / 2 INTO $m`。
:::

:::warning[教材纠错 2：存储过程名称拼写不匹配]
原书在同一实例段落中创建存储过程为 `sp7`（`CREATE PROCEDURE sp7...`），但随后的运行调用指令却错写成调用 `sp1`（`CALL sp1(...)`），会导致运行报错。应将调用更正为 `CALL sp7(...)`。
:::

:::warning[教材纠错 3：变量名未声明引用错误]
在原书 `sp7` 的返回判定代码中写有：
```sql
IF ($Amount is null) then set $amt=0;
```
**纠错解析**：在过程参数定义中，对外输出变量明明声明为 `$amt`，此处却校验 `$Amount` 是否为空。由于 `$Amount` 属于未声明的未定义变量，此代码在 MySQL 中将编译失败。应更正为 `IF ($amt IS NULL) THEN SET $amt = 0; END IF;`。
:::

:::warning[教材纠错 4：触发器 Repeat 循环体中直接引用子查询 (语法死症)]
在原书触发器自动生成工号的 `REPEAT` 循环中写有：
```sql
REPEAT
  ...
UNTIL not exists(SELECT * FROM myEmployees where EmployeeID=$EmployeeID) 
END REPEAT;
```
**纠错解析**：在 MySQL 过程体控制中，`UNTIL` 后只能计算标量布尔表达式，**严禁直接挂载 NOT EXISTS 等子查询**，否则直接报语法分析错误。
**正确更正方案**：需额外声明一个标志变量，先查询再做判断：
```sql title="correct_trigger_loop.sql"
DECLARE $exists_flag INT DEFAULT 1;
REPEAT
  SELECT CONCAT($s1, RIGHT(1000 + RAND() * 999, 3), $s2) INTO $EmployeeID;
  -- 先查询结果并写入布尔标志变量
  SELECT COUNT(*) INTO $exists_flag FROM myEmployees WHERE EmployeeID = $EmployeeID;
UNTIL $exists_flag = 0 
END REPEAT;
```
:::
