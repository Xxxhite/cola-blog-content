---
title: 第 11 章 JDBC 数据库操作
published: 2026-11-23 13:02:00
tags: [JDBC, ResultSet, PreparedStatement, 事务, 批处理]
category: 面向对象程序设计
---

JDBC 为 Java 程序提供连接数据库、执行 SQL 和读取结果的接口。复习时可以把一次操作拆成连接、绑定参数、执行语句和处理结果四步。

<!-- more -->

## 数据库服务与 JDBC 连接

MySQL 服务端管理数据库和表。图形客户端和 Java 程序都需要指定地址、端口、数据库名和账号，并受数据库账号权限限制。JDBC 驱动负责把 Java API 的调用转换为对应数据库协议。 `jdbc:mysql://localhost:3306/students` 指向本机的 `students` 数据库，用户名和密码可单独传给 `DriverManager.getConnection`。

课件用 `Class.forName("com.mysql.cj.jdbc.Driver")` 显式加载 MySQL 驱动。支持 JDBC 驱动自动发现的环境通常只需让驱动对应用可见。SQL Server、Derby 和 Access 案例的驱动与连接 URL 不同，建立连接后仍遵循 JDBC 的基本操作流程。中文乱码需要同时核对字段字符集和连接编码设置。

## 查询与结果集

| 对象 | 职责 |
| --- | --- |
| `Connection` | 表示数据库连接，创建语句并控制事务 |
| `Statement` | 执行固定的 SQL |
| `PreparedStatement` | 执行带参数的 SQL 模板 |
| `ResultSet` | 按游标读取查询结果 |

`executeQuery()` 用于返回结果集的查询。结果集的游标最初在第一行之前，先调用 `next()` 才能读取当前行。列序号从 1 开始，也可以用列名或别名。对于可能是 SQL NULL 的列，用 `getInt` 等基本类型方法读取后应及时用 `wasNull()` 区分空值与 0。结果集应在连接和对应的语句仍可用时读完。

```java title="绑定条件并读取结果"
String sql = "SELECT name, height FROM mess WHERE height >= ? ORDER BY height";
try (PreparedStatement statement = connection.prepareStatement(sql)) {
    statement.setDouble(1, 1.65); // 第一个占位符的下标是 1
    try (ResultSet rows = statement.executeQuery()) {
        while (rows.next()) { // 返回 true 时才有可读的当前行
            System.out.println(rows.getString("name"));
        }
    }
}
```

默认结果集通常只能向前移动。需要 `previous()` 或 `absolute(n)` 时，应在创建语句时请求滚动类型并确认驱动支持。用于通用查询界面时，可以通过 `ResultSetMetaData` 取得列数和列标签，再逐行读取并传给表格模型。

### 顺序查询、条件查询与滚动查询

顺序查询按 `next()` 逐行移动。条件查询用 SQL 的 `WHERE` 选择符合条件的行，再用 `ORDER BY` 指定结果次序。常见条件包括相等比较、数值区间和 `LIKE` 的前缀匹配。例如，要查某个姓氏且身高达到条件的记录，可以用 `WHERE name LIKE ? AND height >= ?`，分别绑定带 `%` 的前缀和身高下限。

```java title="请求可滚动的只读结果集"
try (Statement statement = connection.createStatement(
        ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
     ResultSet rows = statement.executeQuery("SELECT name FROM mess ORDER BY name")) {
    if (rows.absolute(3)) { // 第三行存在时才读取
        String name = rows.getString(1);
    }
}
```

游标移动可能无法定位到目标行，应检查返回值。顺序遍历已经够用时，直接使用默认结果集即可。

## 更新、参数与批处理

`INSERT`、`UPDATE` 和 `DELETE` 通常通过 `executeUpdate()` 执行，返回受影响的行数。`UPDATE` 和 `DELETE` 的 `WHERE` 条件决定影响范围，更新零行也可能是正常结果。绑定参数时，`?` 代表数据值。动态表名、列名或排序方向应从程序允许的选项中选择。

重复执行同一种更新时，可以在一个 `PreparedStatement` 上逐组绑定参数并调用 `addBatch()`，最后用 `executeBatch()` 发出。批处理减少逐条执行的开销，整批是否一起提交取决于事务边界。

| 操作 | SQL 结构 | 执行后的检查 |
| --- | --- | --- |
| 新增 | `INSERT INTO mess (name, height) VALUES (?, ?)` | 是否插入了预期行数 |
| 修改 | `UPDATE mess SET height = ? WHERE name = ?` | 条件命中的行数是否符合预期 |
| 删除 | `DELETE FROM mess WHERE name = ?` | 条件是否足够精确 |

## 事务

默认自动提交时，每条语句独立提交。需要让多条更新共同成功时，关闭自动提交，在全部成功后 `commit()`，失败时 `rollback()`。例如库存扣减和订单状态变更应该放在同一事务中。

```java title="两步更新使用同一事务"
connection.setAutoCommit(false);
try {
    // 两条语句由同一个 connection 创建。
    firstUpdate.executeUpdate();
    secondUpdate.executeUpdate();
    connection.commit();
} catch (SQLException failure) {
    try {
        connection.rollback();
    } catch (SQLException rollbackFailure) {
        failure.addSuppressed(rollbackFailure); // 保留原始错误
    }
    throw failure;
}
```

这段示例由当前操作独占连接生命周期。使用连接池时应遵守事务管理规则，把连接以正确状态归还。课件用注册、登录和游戏入口展示分层思路：界面收集输入，业务代码校验，数据库访问层负责查询与保存。

### 通用查询怎样得到表格

当表格界面事先不知道查询会返回哪些列时，先从 `ResultSetMetaData` 取得列数和列标签，再在每次 `next()` 成功后按列调用 `getObject(i)`。把取出的值保存到表格模型中，查询资源关闭后，表格仍可使用这些已取出的数据。

## 自测

1. 调用 `executeQuery()` 后，为何要先调用 `next()`？

   答案：:spoiler[游标初始在第一行之前。next 返回 true 后才定位到可读取的一行。]

2. `PreparedStatement` 中第一个占位符的编号是什么？

   答案：:spoiler[编号是 1。占位符用来绑定数据值。]

3. `executeBatch()` 执行一半失败，会自动撤销前几条吗？

   答案：:spoiler[不能依赖批处理自动撤销。应在同一事务中执行，并在失败时回滚。]

4. 为什么关闭连接前要先读取完结果？

   答案：:spoiler[结果集通常依赖语句与连接，关闭这些资源后便不能继续读取。]

5. 如何为一条列名未知的查询构造表头？

   答案：:spoiler[从 ResultSetMetaData 取得列数，再按从 1 开始的列序号调用 getColumnLabel，依次收集表头。]
