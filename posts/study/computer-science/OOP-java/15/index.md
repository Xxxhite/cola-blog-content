---
title: 第 15 章 泛型与集合框架
published: 2026-11-23 13:06:00
tags: [泛型, LinkedList, HashMap, TreeSet, TreeMap, HashSet]
category: 面向对象程序设计
---

泛型让编译器检查集合中元素的类型。复习集合时，先区分按位置访问、按键查找和元素去重，再看是否需要排序。

<!-- more -->

## 泛型类与泛型接口

在类名后声明 `<T>`，字段、参数和返回类型就可以使用该类型参数。实例化时用实际类型替换它，构造器右侧的 `<>` 可由编译器推断类型。类型参数应是引用类型，例如 `List<Integer>`。

```java title="泛型类"
class Box<T> {
    private final T value; // 字段类型由创建对象时的类型参数决定

    Box(T value) {
        this.value = value;
    }

    T get() {
        return value;
    }
}
```

在方法内：

```java
Box<String> box = new Box<>("Java");
String text = box.get(); // 返回 String，无需强制转换
```

实现 `Comparable<Goods>` 的类通过 `compareTo(Goods other)` 提供自然顺序。也可以传入 `Comparator` 指定某次排序的规则，例如按价格比较。比较整数可以用 `Integer.compare`，直接相减可能溢出。

### 自然顺序与指定顺序

同一组成绩可以用自然顺序升序排列，也可以指定降序。查找时要沿用排序的规则，否则二分查找对区间的判断会失效。

```java title="按同一规则排序和二分查找"
List<Integer> scores = new LinkedList<>(List.of(90, 60, 75));
Comparator<Integer> descending = Comparator.reverseOrder();
Collections.sort(scores, descending); // 排序为 90、75、60
int index = Collections.binarySearch(scores, 75, descending); // 下标为 1
```

## LinkedList、迭代与栈

`LinkedList` 同时实现 `List` 和 `Deque`。它可以在两端增删元素，也支持按下标访问。反复用下标遍历可能从链表多次定位，宜使用增强 `for` 或迭代器。用 `contains` 或 `indexOf` 查找对象时，对象的 `equals` 会影响匹配结果。

```java title="用迭代器移除空条目"
Iterator<String> iterator = words.iterator();
while (iterator.hasNext()) {
    if (iterator.next().isEmpty()) {
        iterator.remove(); // 删除刚返回的元素
    }
}
```

`words` 是可修改的字符串链表。遍历期间如果要删除当前元素，用支持删除的迭代器操作，避免直接修改原集合的结构。

`Collections.sort` 可按自然顺序或给定的比较器排序。`binarySearch` 要求列表已经按同一个规则排序，未找到时返回 `-(插入位置) - 1`。`shuffle` 打乱元素，`rotate(list, 1)` 将末尾元素移到开头。

栈采用后进先出顺序。`push` 入栈，`pop` 出栈，`peek` 查看栈顶而不删除。课件用 `Stack` 演示这三个操作，用 `Deque` 与 `ArrayDeque` 也能表达同样的栈行为。空栈时 `ArrayDeque.peek()` 返回 `null`，而 `pop()` 抛出异常。

## 散列表、树结构与集合

| 类型 | 存储内容 | 遍历与判重方式 |
| --- | --- | --- |
| `HashMap<K, V>` | 键和值 | 不保证遍历顺序，键按 `hashCode` 与 `equals` 判断 |
| `TreeMap<K, V>` | 键和值 | 按键排序，比较结果为 0 时视为同一个键 |
| `HashSet<E>` | 不重复元素 | 不保证遍历顺序，按 `hashCode` 与 `equals` 判重 |
| `TreeSet<E>` | 不重复元素 | 按元素排序，比较结果为 0 时视为重复 |

向 `Map` 执行 `put` 时，已有键对应的值会被替换。用 `get` 查值，用 `containsKey` 区分键不存在与键存在但值为 `null` 的情形。需要同时访问键和值时，可遍历 `entrySet()`。`keySet()` 和 `values()` 分别提供键和值的视图。词表查询可把单词当作键、释义当作值。

查找学号对应的学生时，可以把学号作为键。若要求按学号顺序浏览，`TreeMap` 会在维护映射的同时维护键顺序。若只需按键查询，`HashMap` 不要求键之间有可比较大小的顺序。 `TreeSet` 中的 `first()`、`last()` 取得排序后的首尾元素，而 `HashSet` 没有这样的顺序含义。

```java title="用映射统计出现次数"
Map<String, Integer> counts = new HashMap<>();
for (String word : words) {
    counts.merge(word, 1, Integer::sum); // 首次出现记 1，否则将旧值加 1
}
```

用散列表保存自定义对象时，相等对象必须给出相同哈希值。对象作为键期间，不应改变参与比较与哈希计算的字段。使用有序集合时，如果不想让同价的两件商品被视为同一个元素，应在比较价格后再按商品编号比较。

## 集合运算与数据保存

对可变集合调用 `addAll` 得到并集，调用 `retainAll` 保留交集，调用 `removeAll` 去掉另一集合包含的元素。这些操作会修改调用者。需要保留原集合时，可先复制，例如 `new HashSet<>(first)`。

例如 A 包含甲和乙，B 包含乙和丙。对 A 的三个独立副本分别做并、交、差运算，结果依次为甲乙丙、乙、甲。若对同一个 A 连续调用这三个方法，后一次操作使用的是前一次修改后的 A。

配套商品管理应用用链表保存商品条目，再通过对象流在关闭后恢复数据。商品的身份、展示顺序和文件保存是三个独立问题。使用对象流保存时，集合中的商品对象也要满足序列化条件。

## 自测

1. 泛型类型参数有什么作用？

   答案：:spoiler[让编译器检查传入和取出的类型，减少强制转换并尽早发现类型错误。]

2. 为什么链表遍历时宜使用迭代器？

   答案：:spoiler[迭代器可沿节点前进，避免反复从链表上按下标定位。]

3. 两个商品价格一样，为什么放进按价格比较的 `TreeSet` 可能只剩一个？

   答案：:spoiler[如果比较器只比较价格，同价时返回 0，树集会把第二个商品视为重复。]

4. 哈希映射中同一个键再次执行 `put` 会怎样？

   答案：:spoiler[新值替换旧值，键的数量不增加。]

5. 使用 `retainAll` 求交集，原集合会变化吗？

   答案：:spoiler[会。它在调用者内部只保留两个集合都有的元素。需要保留原集合时先复制。]

6. 列表是降序排列的，调用二分查找时要注意什么？

   答案：:spoiler[要传入与排序一致的降序比较器，否则二分查找无法可靠定位目标。]
