---
title: 第 11 章 JDBC 数据库操作
published: 2026-11-23 13:02:00
tags: [JDBC, ResultSet, PreparedStatement, 事务, 批处理]
category: 面向对象程序设计
---

JDBC 为 Java 程序提供连接数据库、执行 SQL 和读取结果的接口。复习时可以把一次操作拆成连接、绑定参数、执行语句和处理结果四步。

<!-- more -->

## 数据库服务与 JDBC 连接

MySQL 服务端管理数据库和表。JDBC 驱动把 Java API 的调用转换为对应的数据库协议。`jdbc:mysql://localhost:3306/school` 指向本机 3306 端口上的示例数据库 `school`。课件演示了把账号写入 URL 和单独传参两种形式。下面使用 `DriverManager.getConnection(url, user, password)`，将地址与认证信息分开。

课件用 `Class.forName("com.mysql.cj.jdbc.Driver")` 显式加载 MySQL 驱动。语句中的类名来自 MySQL Connector/J，应用运行时需要能找到驱动。支持 JDBC 驱动自动发现的环境可以省略显式加载。考试按课件流程写时可保留这一步。

### 从连接到读取学生记录

:::important[考试重点：JDBC 查询的基本步骤]
加载驱动 → 获取 `Connection` → 创建 `Statement` → 调用 `executeQuery` → 用 `next()` 逐行读取 `ResultSet` → 关闭资源。
:::

```java title="连接 school 并查询学生"
try {
    Class.forName("com.mysql.cj.jdbc.Driver"); // 加载 MySQL 驱动
    String url = "jdbc:mysql://localhost:3306/school";
    String query = "SELECT studentID, studentName FROM student";

    // user 和 password 由练习环境提供。
    try (Connection connection = DriverManager.getConnection(url, user, password);
         Statement statement = connection.createStatement();
         ResultSet result = statement.executeQuery(query)) {
        while (result.next()) { // 游标先移到当前行，再读字段
            String studentID = result.getString("studentID");
            String studentName = result.getString("studentName");
            System.out.printf("%s\t%s%n", studentID, studentName);
        }
    }
} catch (ClassNotFoundException e) {
    System.out.println("找不到 MySQL JDBC 驱动");
} catch (SQLException e) {
    System.out.println("数据库操作失败：" + e.getMessage());
}
```

驱动加载或连接失败后，这次查询会直接结束。try-with-resources 按声明的逆序关闭 `ResultSet`、`Statement` 和 `Connection`，执行中发生异常也会释放已成功创建的资源。若试题要求手动关闭，也应按这个顺序，并在异常路径上释放资源。

SQL Server、Derby 和 Access 案例的驱动和 URL 不同，连接后仍使用同一套 JDBC 接口。中文乱码则需要同时核对字段字符集和连接编码设置。

## 查询与结果集

| 对象 | 职责 |
| --- | --- |
| `Connection` | 表示数据库连接，创建语句并控制事务 |
| `Statement` | 由调用方在执行方法中传入 SQL |
| `PreparedStatement` | 执行带参数的 SQL 模板 |
| `ResultSet` | 按游标读取查询结果 |

`executeQuery()` 用于返回结果集的查询。结果集的游标最初在第一行之前，先调用 `next()` 才能读取当前行。列序号从 1 开始，也可以用列名或别名。对于可能是 SQL NULL 的列，用 `getInt` 等基本类型方法读取后应及时用 `wasNull()` 区分空值与 0。结果集应在连接和对应的语句仍可用时读完。

```java title="用 PreparedStatement 查询指定姓氏"
String sql = "SELECT studentID, studentName FROM student WHERE studentName LIKE ?";
try (PreparedStatement statement = connection.prepareStatement(sql)) {
    statement.setString(1, "张%"); // 第一个占位符从 1 编号，% 属于 LIKE 参数值
    try (ResultSet rows = statement.executeQuery()) {
        while (rows.next()) { // 返回 true 时才有可读的当前行
            System.out.println(rows.getString("studentName"));
        }
    }
}
```

`Statement.executeQuery(sql)` 执行时传入 SQL，`PreparedStatement.executeQuery()` 执行的是创建时指定的模板，调用时不再传 SQL 字符串。`LIKE ?` 的占位符不要加引号，匹配符号 `%` 放在绑定值里。这里和后续片段的 `connection` 都是已建立的连接。

默认结果集通常只能向前移动。需要 `previous()` 或 `absolute(n)` 时，应在创建语句时请求滚动类型并确认驱动支持。用于通用查询界面时，可以通过 `ResultSetMetaData` 取得列数和列标签，再逐行读取并传给表格模型。

### 顺序查询、条件查询与滚动查询

顺序查询按 `next()` 逐行移动。条件查询用 SQL 的 `WHERE` 选择满足条件的行，再用 `ORDER BY` 指定顺序。课件用 `name LIKE ? AND height >= ?` 演示组合条件，两个占位符依次绑定姓名前缀和身高下限。

```java title="请求可滚动的只读结果集"
try (Statement statement = connection.createStatement(
        ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
     ResultSet rows = statement.executeQuery(
             "SELECT studentName FROM student ORDER BY studentID")) {
    if (rows.absolute(3)) { // 第三行存在时才读取
        String name = rows.getString(1);
    }
}
```

游标移动可能无法定位到目标行，应检查返回值。课件示例先用 `last()` 移到末行，在成功后用 `getRow()` 得到总行数，再用 `absolute(n)` 读取指定行。SQL 给出 `ORDER BY` 后，第三行才有确定的业务含义。只需顺序遍历时，默认结果集已经够用。

### 通用查询怎样得到表格

当表格界面事先不知道会返回哪些列时，从 `ResultSetMetaData` 取得列数和列标签。每次 `next()` 成功后，按从 1 开始的列序号调用 `getObject(i)`，将该行的值保存到表格模型中。释放查询资源后，表格仍可使用已经取出的数据。

## 更新、参数与批处理

`INSERT`、`UPDATE` 和 `DELETE` 通常通过 `executeUpdate()` 执行，返回受影响的行数。`UPDATE` 和 `DELETE` 的 `WHERE` 条件决定影响范围，更新零行也可能是正常结果。绑定参数时，`?` 代表数据值。动态表名、列名或排序方向应从程序允许的选项中选择。

重复执行同一种更新时，可以在一个 `PreparedStatement` 上逐组绑定参数并调用 `addBatch()`，最后用 `executeBatch()` 发出。批处理减少逐条执行的开销，整批是否一起提交取决于事务边界。

| 操作 | SQL 结构 | 执行后的检查 |
| --- | --- | --- |
| 新增 | `INSERT INTO student (studentID, studentName) VALUES (?, ?)` | 是否插入了预期行数，以及表的其他必填列是否已有默认值 |
| 修改 | `UPDATE student SET studentName = ? WHERE studentID = ?` | 是否只更新了指定学号的记录 |
| 删除 | `DELETE FROM student WHERE studentID = ?` | 条件是否足够精确 |

```java title="按学号更新学生姓名"
String sql = "UPDATE student SET studentName = ? WHERE studentID = ?";
try (PreparedStatement statement = connection.prepareStatement(sql)) {
    statement.setString(1, newName);   // 对应 SET 后的姓名
    statement.setString(2, studentID); // 对应 WHERE 后的学号
    int affectedRows = statement.executeUpdate();
}
```

占位符按 SQL 中从左到右的顺序编号，跟表中字段的排列无关。上例按字符型学号绑定，数据库字段为整数时应相应使用 `setInt` 等方法。考试写 `Statement` 时对应 `executeUpdate(sql)`。如果调用的是 `execute()`，其布尔返回值表示第一个结果是否为结果集，不能把 `false` 当作执行失败。

## 事务

默认自动提交时，语句完成后会独立提交。课件用两条更新演示事务：给一条记录扣减一个数值，再给另一条记录增加同样的数值。两条语句用同一个连接执行，全部成功后 `commit()`，任意一步失败就 `rollback()`。如果业务要求精确修改一行，更新行数不符合预期也应当视为失败。

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

## 自测

1. 调用 `executeQuery()` 后，为何要先调用 `next()`？

   答案：:spoiler[游标初始在第一行之前。`next()` 返回 `true` 后才定位到可读取的一行。]

2. `PreparedStatement` 中第一个占位符的编号是什么？

   答案：:spoiler[第一个 `?` 的编号是 `1`。占位符用来绑定数据值。]

3. `executeBatch()` 执行一半失败，会自动撤销前几条吗？

   答案：:spoiler[不能依赖批处理自动撤销。应在同一事务中执行，并在失败时调用 `rollback()`。]

4. 为什么关闭连接前要先读取完结果？

   答案：:spoiler[结果集通常依赖语句与连接，关闭这些资源后便不能继续读取。]

5. 如何为一条列名未知的查询构造表头？

   答案：:spoiler[从 `ResultSetMetaData` 取得列数，再按从 1 开始的列序号调用 `getColumnLabel(i)`，依次收集表头。]

6. 写出从加载 MySQL 驱动到读完查询结果的主要步骤。

   答案：:spoiler[用 `Class.forName` 加载驱动，获取 `Connection`，创建 `Statement`，调用 `executeQuery(sql)` 得到 `ResultSet`，用 `next()` 逐行移动并读取列值，最后按逆序关闭资源。]

7. 查询学生姓名和修改学生姓名，分别使用哪个执行方法？返回什么？

   答案：:spoiler[查询用 `executeQuery()`，返回 `ResultSet`。修改用 `executeUpdate()`，返回受影响的行数。`PreparedStatement` 已保存 SQL 模板，执行时无需再次传入 SQL。]
