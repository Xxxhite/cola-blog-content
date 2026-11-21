---
title: 第 8 章 常用实用类
published: 2026-11-21 15:17:00
tags: [String, 正则表达式, 日期时间, 随机数, 反射]
category: Java 学习笔记
---

本章整理字符串、正则表达式、日期时间、数学与随机数、反射和综合应用。

<!-- more -->

## 字符串、引用与比较

`==` 对引用类型比较是否指向同一对象；`equals` 对 `String` 比较内容。字面量和编译期常量拼接可能共享字符串池中的对象，运行时拼接不应依赖与字面量引用相同。

```java title="比较字符串"
String first = "Java";
String second = new String("Java");
System.out.println(first == second);      // false：两个引用指向不同对象
System.out.println(first.equals(second)); // true：字符串内容相同
```

两个变量引用不同对象，但文本内容相同。字符串不可变：拼接或截取产生新的结果，不会修改原字符串。

### String 常用方法

| 目的 | 方法 | 示例或结果 |
| --- | --- | --- |
| 获取长度与字符 | `length()`、`charAt(index)` | `"Java".length()` 为 4，`"Java".charAt(0)` 为 `'J'` |
| 检查前缀、后缀和子串 | `startsWith`、`endsWith`、`contains` | `"notes.md".endsWith(".md")` 为 `true` |
| 比较字符串 | `equals`、`equalsIgnoreCase`、`compareTo`、`compareToIgnoreCase` | `"JAVA".equalsIgnoreCase("Java")` 为 `true` |
| 搜索与截取 | `indexOf`、`lastIndexOf`、`substring` | `"a-b-c".lastIndexOf('-')` 为 3 |
| 去除首尾的空格和低位控制字符 | `trim()` | `"  Java ".trim()` 得到 `"Java"` |

`length()` 和 `charAt()` 按 UTF-16 代码单元工作。数字文本可以用 `Integer.parseInt`、`Long.parseLong` 或 `Double.parseDouble` 转为基本类型，反向转换可用 `String.valueOf`。

`compareTo` 可以比较字符串的字典序，也可以用 `Arrays.sort` 排列字符串数组。`Integer.toBinaryString` 表示整数的二进制，`Double.parseDouble` 解析数字文本；`indexOf` 查找位置，`substring` 截取文本。`substring` 的结束下标不包含在结果内；固定按小数点拆分需要考虑科学计数法等表示形式。

```java title="字符串查找与截取"
String number = String.valueOf(123.45);
int dot = number.indexOf('.');
String integerPart = number.substring(0, dot);
String decimalPart = number.substring(dot + 1);
System.out.println(integerPart); // 123
System.out.println(decimalPart); // 45
```

`indexOf` 未找到字符时返回 `-1`，不能未经检查就把该值当作截取边界。上面的处理假定文本包含小数点，不能直接用于所有数字的字符串形式。`compareTo` 返回负数、零或正数，分别表示当前字符串在参数之前、相等或之后；比较结果不应当被当作固定的 `-1` 或 `1`。

`Integer.toBinaryString(7)` 得到 `111`；对负整数，它显示该 `int` 值的二进制补码表示。解析命令行数字时，可以遍历 `main` 的 `args`，逐项调用 `Double.parseDouble`；如果参数不是合法数字，会抛出 `NumberFormatException`，应决定是跳过、提示还是停止计算。

对象可以重写 `toString`，提供更有意义的文本表示。`String` 的 `getChars` 和 `toCharArray` 能取出字符；其中 `getChars` 的源范围同样是左闭右开。

`Object` 默认的 `toString()` 把类名、`@` 和十六进制的哈希值拼在一起。若希望打印时直接显示价格、面积等有意义的属性，可以重写这个方法。

```java title="复制字符串中的字符"
String text = "Java语言";
char[] chars = new char[4];
text.getChars(0, 4, chars, 0); // 复制源下标 0 到 3，从目标下标 0 开始写入
System.out.println(chars); // Java
char[] all = text.toCharArray();
```

`getChars(0, 4, chars, 0)` 从源字符串下标 0 开始，复制到下标 4 之前，写入目标数组下标 0 开始的位置；目标空间不足会出错。`toCharArray()` 则复制整个字符串。两者得到的数组可以修改，但不会改变原字符串。

## 字符编码与字符数组

字符串与字节数组互相转换时，应明确字符集。中文字符所占字节数随编码变化，不能假定它始终为两个字节；按任意字节偏移截取还可能截断字符。

```java title="明确字符编码"
byte[] bytes = "Java你好".getBytes(java.nio.charset.Charset.forName("GBK"));
String text = new String(bytes, java.nio.charset.Charset.forName("GBK")); // 使用相同字符集解码
System.out.println(text);
```

字符串也可以转为字符数组逐个处理。例如按密码字符循环加减可演示可逆变换，但这种简单运算不适合作为实际安全加密；循环使用密码时还需检查密码不为空，以免取模除零。

## 正则表达式、分词与提取

`matches` 判断整个字符串是否匹配；`replaceAll` 可替换匹配的邮件文本或金额符号；`split` 可按空白、数字和标点分割。Java 字符串中的反斜杠需要转义，例如正则中的 `\d` 写作 `"\\d"`。

:::warning[字符类中的竖线]
`[a-zA-Z|0-9|_]+` 中竖线位于方括号内，会被当作允许的字符，而不是单纯的“或”分隔符。若只允许字母、数字和下划线，可写成 `[a-zA-Z0-9_]+`。
:::

处理购物清单时，可先用 `replaceAll` 将非数字部分替换为分隔符，再用 `StringTokenizer` 逐项读取数字；也可给 `Scanner` 设置分隔符并解析数字，或使用 `Pattern`、`Matcher.find()` 查找匹配项。把各项转成数字后可以求总价、商品数量与平均价。表达式应根据实际数据格式设计，简单模式不能保证覆盖所有合法金额或邮件地址。

```java title="从文本中查找数字"
Pattern pattern = Pattern.compile("\\d+(?:\\.\\d+)?");
Matcher matcher = pattern.matcher("市话 76.8 元，短信 12.68 元");
while (matcher.find()) { // 查找下一个匹配片段
    System.out.println(matcher.group()); // 读取本次匹配的完整内容
}
```

需导入 `java.util.regex.Pattern` 和 `Matcher`。`find()` 每次查找下一个匹配项，`group()` 返回当前匹配文本；该模式只演示非负整数和小数的提取。

`matches()` 与 `find()` 的范围不同：前者要求整个输入符合模式，后者在输入中寻找满足模式的片段。`split()` 以匹配内容作为分隔符；`replaceAll()` 则将每个匹配片段替换为指定文本。提取账单时若也可能出现编号、日期或负数，不能把所有数字都直接当作价格。

```java title="匹配、替换与分割"
String username = "student_01";
System.out.println(username.matches("[a-zA-Z0-9_]+")); // true
String amount = "89,235,678元".replaceAll("[,\\p{Sc}元]", "");
long value = Long.parseLong(amount);
String[] words = "Java, SQL! Web".split("[\\s\\p{Punct}]+");
System.out.println(value); // 89235678
System.out.println(Arrays.toString(words)); // [Java, SQL, Web]
```

`\p{Sc}` 匹配 Unicode 货币符号，而“元”是文字，需要在模式中单独处理。`\s` 表示空白字符，`\p{Punct}` 表示标点字符类；代码中的双反斜杠是 Java 字符串字面量所需的写法。

量词 `+` 表示一次或多次，`?` 表示零次或一次，`{4}` 表示恰好四次。用正则检查日期外形可以筛掉缺少字段的输入，但月份天数和闰年仍应交给日期类型校验。`split` 遇到开头的非零宽度匹配时可能产生空的首元素，例如 `"-a-b".split("-")` 的首元素为空字符串。

### StringTokenizer 和 Scanner

`StringTokenizer` 的分隔参数是一组字符，例如 `",;"` 表示逗号和分号都可以分隔。它的 `hasMoreTokens()` 检查是否还有标记，`countTokens()` 返回当前剩余数量，`nextToken()` 取出下一项。如果需要正则分隔符或直接读取数字，可用 `Scanner`。

```java title="从字符串读取数值"
try (java.util.Scanner scanner = new java.util.Scanner("12#25#39.87")) {
    scanner.useLocale(java.util.Locale.ROOT);
    scanner.useDelimiter("#");
    double total = 0;
    while (scanner.hasNext()) {
        if (scanner.hasNextDouble()) {
            total += scanner.nextDouble();
        } else {
            scanner.next(); // 跳过非数字项，让扫描继续向前
        }
    }
    System.out.printf(java.util.Locale.ROOT, "%.2f%n", total); // 76.87
}
```

`hasNextDouble()` 只检查下一项。`nextDouble()` 成功读取时才消费该项。如果下一项不是数字且还要继续处理，就必须消费或跳过它，否则循环会一直检查同一项。

## 可变字符串

`StringBuffer` 可使用 `append`、`setCharAt`、`insert`、`replace` 和 `delete` 修改内容。`length()` 是当前字符数量，`capacity()` 是当前缓冲区容量；清空内容后容量不一定归零。

```java title="修改字符串缓冲区"
StringBuffer text = new StringBuffer("Java");
text.append(" 语言");
text.insert(0, "学习 ");
text.replace(0, 2, "了解"); // 替换下标 0 和 1 的字符
System.out.println(text); // 了解 Java 语言
text.delete(0, text.length());
```

## 日期与时间

`LocalDate` 表示日期，`LocalTime` 表示一天中的时间，`LocalDateTime` 同时保存日期和时间。这三种类型都不携带时区。可以用 `now()` 获取当前本地值，用 `of(...)` 按字段创建指定值。日期之间可用 `isBefore`、`isAfter` 和 `isEqual` 比较。

`LocalDate`、`LocalTime` 可比较和计算日期时间；日期对象的加减方法返回新对象。`ChronoUnit` 可以分别计算两个日期时间之间的完整年、月、日等；随后逐次加上已计算的年和月，可以得到年、月、日的组合差值。单独按月计算的总月数与组合差值中的剩余月数口径不同。

```java title="日期计算"
LocalDate start = LocalDate.of(2024, 1, 1);
LocalDate end = start.plusMonths(2).plusDays(3);
long days = ChronoUnit.DAYS.between(start, end);
System.out.println(end);  // 2024-03-04
System.out.println(days); // 63
```

需要导入 `java.time.LocalDate` 和 `java.time.temporal.ChronoUnit`。`plusMonths` 不会改变 `start`，而是返回新的日期。

生成月历时可先取得当月第一天和当月天数，再根据第一天是星期几安排空格，依次输出每天并按周换行。`Locale` 和格式化字符串可控制日期的地区化展示。日期、时间和地区格式与时区含义不同：`LocalDate` 本身不含时区。

```java title="当月日历所需的信息"
LocalDate date = LocalDate.of(2024, 2, 15);
LocalDate first = date.withDayOfMonth(1);
int daysInMonth = date.lengthOfMonth(); // 2024 年是闰年，2 月有 29 天
for (int i = 0; i < daysInMonth; i++) {
    LocalDate current = first.plusDays(i);
    System.out.println(current + " " + current.getDayOfWeek());
}
```

`withDayOfMonth(1)` 得到当月第一天；`lengthOfMonth()` 考虑闰年，因此这里的二月有 29 天。输出成表格时还需要根据星期几计算开头的空白，并在一周结束时换行。

如果同一个日期要填到多处格式说明符，可以使用参数索引。例如 `String.format(Locale.US, "%1$tF %1$tA", date)` 将日期写成年月日并附上英文星期。 `%1$` 表示使用第一个格式参数，`tF` 生成日期，`tA` 生成完整星期名称。

## 数学、随机数与金额

`Math.sqrt`、`ceil`、`floor`、`round` 分别用于平方根、向上取整、向下取整和取最接近整数。`sqrt` 对负实数返回 `NaN`；`BigInteger` 使用 `add`、`multiply` 等方法进行大整数运算，返回新值。

```java title="数学方法和大整数"
System.out.println(Math.ceil(5.2));    // 6.0
System.out.println(Math.floor(-5.2));  // -6.0
System.out.println(Math.round(-12.6)); // -13
BigInteger a = new BigInteger("123456789");
BigInteger b = new BigInteger("987654321");
System.out.println(a.add(b));      // 1111111110
System.out.println(a.multiply(b)); // 121932631112635269
```

需要导入 `java.math.BigInteger`。`ceil` 和 `floor` 的方向是正无穷和负无穷，因此负数的结果容易与“去掉小数部分”混淆；`BigInteger` 不会因执行 `add` 而改变变量 `a` 指向的对象。

`Math.abs`、`Math.max` 和 `Math.min` 分别计算绝对值、最大值和最小值。`Math.random()` 返回大于等于 0 且小于 1 的 `double`。 `Random.nextInt()` 可以返回任意 `int`，而 `nextInt(bound)` 把结果限制在 0 到 `bound - 1`，且上界参数必须为正。

`BigInteger.subtract` 用于减法，`divide` 用于整数除法。例如 7 除以 2 得 3。需要格式化输出时，`String.format("%.2f", amount)` 生成两位小数的文本，原数值保持不变。

生成指定范围内的不重复整数时，要求数量合理且不能超过可选数字数量。重复采样可以统计各数出现的次数。相同种子的两个 `Random` 对象，在调用序列相同时得到相同结果；`System.nanoTime()` 可用于计算操作前后的耗时差值。

```java title="随机数与频数"
Random random = new Random(2022);
int[] frequency = new int[7];
for (int i = 0; i < 10000; i++) {
    int number = random.nextInt(7) + 1; // 1 到 7
    frequency[number - 1]++; // 编号从 1 开始，数组下标从 0 开始
}
System.out.println(Arrays.toString(frequency));
```

这里需导入 `java.util.Random` 和 `java.util.Arrays`。`nextInt(7)` 产生 0 到 6 的整数，数组对应记录 1 到 7 各出现多少次。

随机分配红包时，每次分配都应为其余参与者预留最低金额，最后一人获得剩余金额。金额计算应统一使用整数分或适当的十进制定点方式，避免混淆元与分，并避免用浮点近似值处理精确金额。

不重复抽取可以使用数组记录已经选出的数，再对每个新随机数检查是否重复；如果重复就重新抽取。如果要求从 1 到 100 中选 6 个数，那么每次候选值可写成 `random.nextInt(100) + 1`。数量超过 100 时永远不可能完成，因此循环前必须检查输入范围。

红包分配的状态至少包括剩余总金额和剩余人数。假设当前有 `remainingCents` 分、`remainingPeople` 人，每人至少 1 分，那么当前最多可以分配 `remainingCents - (remainingPeople - 1)` 分；分配后同时更新金额和人数，直到最后一人取走余数。开始前还要检查总金额至少等于人数，否则无法满足每人最低金额。

## 反射与控制台

通过 `getClass()` 可获得 `Class`，读取声明的构造方法、字段和方法。`Class.forName` 可以按类名获取类，再取得无参构造方法并创建对象。反射可能遇到类不存在、访问受限或构造失败，需要处理相应异常。

```java title="查看类的信息"
Class<?> type = String.class;
System.out.println(type.getName());
System.out.println(Arrays.toString(type.getDeclaredConstructors()));
System.out.println(Arrays.toString(type.getDeclaredFields()));
System.out.println(Arrays.toString(type.getDeclaredMethods())); // 此类声明的方法，不含仅从父类继承的方法
```

`getDeclared...` 返回该类声明的对应成员，不等同于只查询公开成员；查看成员信息也不意味着可以绕过访问控制。

```java title="通过类名调用无参构造方法"
try {
    Class<?> type = Class.forName("tom.data.Circle");
    Object object = type.getDeclaredConstructor().newInstance(); // 查找并调用无参构造方法
    System.out.println(object.getClass().getName());
} catch (ReflectiveOperationException e) {
    System.out.println("创建对象失败：" + e.getMessage());
}
```

这里要求类路径中存在 `tom.data.Circle`，且无参构造方法可访问。`Class.forName` 使用包含包名的完整类名；`newInstance` 在运行时调用构造方法，返回对象的引用。若之后要调用圆的专有方法，还需保证对象类型正确并进行适当转换。

### Arrays、System 和 Console

`Arrays.equals(a, b)` 比较一维数组的元素内容与顺序。`Arrays.copyOf(a, length)` 可以复制出指定长度的数组，较短时截取，较长时用该元素类型的默认值补齐。 `Arrays.sort(a)` 会修改传入数组，`Arrays.binarySearch(a, key)` 要求数组预先排序。

测量排序耗时时，在排序前记录 `System.nanoTime()`，结束后用新值减去起始值。这个差值用于测量经过的时间，不能拿起始值当作日期或时间戳。

`System.console().readPassword()` 可从控制台读取不回显的输入，结果为 `char[]`。某些 IDE 或重定向环境下，`System.console()` 可能为 `null`，使用前应检查。处理结束后可用 `Arrays.fill` 清空字符数组，输入内容不应写入日志。

## 自测

1. 比较两个字符串内容为什么通常使用 `equals`？

   答案：:spoiler[`String.equals` 比较字符串内容；`==` 比较两个引用是否指向同一个对象，内容相同的不同字符串对象用 `==` 比较可能为 `false`。]

2. 为什么按固定字节下标截取中文文本会随字符集改变结果？

   答案：:spoiler[同一个字符在不同编码中可能占用不同字节数，固定偏移可能指到错误位置或截断字符。转换时应明确字符集，处理文本时应注意字符边界。]

3. 相同随机种子要满足什么条件才会产生相同序列？

   答案：:spoiler[两个 `Random` 对象使用相同种子，并按相同顺序调用相同的随机方法及参数时，会产生对应的相同结果。]

4. `substring` 的结束下标包含在结果中吗？`indexOf` 找不到内容时返回什么？

   答案：:spoiler[结束下标不包含在结果中；`indexOf` 找不到时返回 -1，应检查结果后再用于截取。]

5. `matches` 与 `Matcher.find()` 有什么区别？

   答案：:spoiler[`matches` 检查整个输入是否匹配；`find()` 在输入中查找下一个匹配的片段，可以循环查找多次。]

6. 正则字符类 `[a-zA-Z|0-9|_]+` 中的竖线有什么作用？

   答案：:spoiler[竖线在此字符类中表示允许出现的竖线字符，而不是分隔选项。只允许字母、数字和下划线时，可去掉竖线。]

7. 修改 `StringBuffer` 后，原来的字符串对象会随之改变吗？清空缓冲区一定会使容量归零吗？

   答案：:spoiler[不会改变原来的 `String` 对象；`StringBuffer` 自己的内容可以改变。清空后长度为 0，但容量不一定归零。]

8. 日期加减方法会修改原有的 `LocalDate` 吗？总月数与年月日组合差值中的月数相同吗？

   答案：:spoiler[日期加减返回新对象，不修改原日期。总月数是按完整月份计算的整体差值；组合差值中的月数是先扣除整年后剩余的月份，口径不同。]

9. 如果要从 1 至 100 中抽取 101 个不重复整数，会发生什么？

   答案：:spoiler[可选数字只有 100 个，无法满足要求。若使用重复抽取直到数量足够的循环，又未检查数量上限，循环将无法正常完成。]

10. `Class.forName` 取得类之后，调用无参构造方法创建对象需要注意什么？

    答案：:spoiler[需要类路径中存在该类，并有可访问的无参构造方法；加载类或创建对象可能失败，须处理反射相关异常。]

11. 为什么使用 `System.console()` 之前要检查返回值？

    答案：:spoiler[某些运行环境没有关联控制台，`System.console()` 会返回 `null`；直接调用 `readPassword()` 会引发空指针异常。]
