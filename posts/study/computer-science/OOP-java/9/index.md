---
title: 第 9 章 组件及事件处理
published: 2026-11-23 13:00:00
tags: [Swing, 布局管理器, 事件监听器, MVC, 键绑定]
category: 面向对象程序设计
---

Swing 界面由组件和容器组成。布局管理器决定组件摆放的位置，监听器决定用户操作发生后程序怎样响应。

<!-- more -->

## 窗口、组件与容器

`JFrame` 是顶层窗口，内容区可放置组件或中间容器。`setTitle` 设置标题，`pack()` 根据组件的首选大小调整窗口，`setVisible(true)` 显示窗口。关闭策略由 `setDefaultCloseOperation` 设置，`DISPOSE_ON_CLOSE` 释放当前窗口的资源，`EXIT_ON_CLOSE` 退出整个应用。菜单结构为 `JMenuBar` → `JMenu` → `JMenuItem`，用 `setJMenuBar` 把菜单栏装到窗口。

| 组件 | 作用与用法 |
| --- | --- |
| `JLabel`、`JButton` | 显示文本或图标，或触发动作 |
| `JTextField`、`JTextArea` | 单行和多行文字。多行内容通常放进 `JScrollPane` |
| `JCheckBox`、`JRadioButton` | 独立勾选或单项选择。单选按钮需加入同一个 `ButtonGroup` 才互斥 |
| `JComboBox`、`JPasswordField` | 下拉选项和密码输入。用 `getPassword()` 取得字符数组 |
| `JPanel`、`JTabbedPane` | 分组摆放组件或使用标签切换内容 |
| `JSplitPane`、`JLayeredPane` | 分成可调整的两个区域，或让组件分层重叠 |

容器可用 `add`、`remove` 和 `removeAll` 增删组件。运行期间改动布局后，通常用 `revalidate()` 重新计算布局，再用 `repaint()` 请求重绘。滚动区域的内容用 `setViewportView` 设置。

### 容器怎样组织组件

一个窗口可以由多个面板组成，每个面板各自设置布局。例如，窗口采用 `BorderLayout`，把工具栏面板放在北区，把含有文本区的滚动窗格放在中心。工具栏面板内部再用 `FlowLayout` 摆放按钮。窗口缩放时，外层布局分配面板空间，内层布局再安排各自的组件。

```java title="组合面板与滚动窗格"
JPanel content = new JPanel(new java.awt.BorderLayout());
JPanel toolbar = new JPanel(); // JPanel 默认使用 FlowLayout
toolbar.add(new JButton("清空"));

JTextArea editor = new JTextArea(10, 30);
content.add(toolbar, java.awt.BorderLayout.NORTH);
content.add(new JScrollPane(editor), java.awt.BorderLayout.CENTER);
```

菜单项同样可以注册 `ActionListener`，所以菜单项和工具栏按钮可以复用动作。 `setBounds(x, y, width, height)` 适合明确设定窗口位置与尺寸。如果子组件由布局管理器管理，布局重新计算时可能覆盖手动设置的位置。

## 常用布局

| 布局 | 排列方式 |
| --- | --- |
| `FlowLayout` | 从左到右排列，空间不够时换行 |
| `BorderLayout` | 分成东、南、西、北、中五区，中心使用剩余空间 |
| `GridLayout` | 将容器划分为大小相同的格子 |
| `CardLayout` | 同一区域一次显示一张卡片，可按名字切换 |
| `BoxLayout` | 沿一条轴排列。可用 `Box` 创建横向或纵向容器 |
| 空布局 | 用 `setBounds` 手动定位，窗口尺寸或字体变化后要自行处理 |

网格布局的格子尺寸一致，适合数字键盘。 `CardLayout.show(container, name)` 根据名称切换卡片，适合多个页面共用一处显示区域。 `Box.createHorizontalStrut` 可放入固定间距，`Box.createHorizontalGlue` 吸收多余空间。布局题应先找容器，再看它直接管理的是哪些组件。

## 事件源、事件对象与监听器

点击按钮时，按钮是事件源，`ActionEvent` 携带本次事件的信息，`ActionListener` 是登记好等待回调的监听器。`getSource()` 可区分共享监听器接收到的不同来源。文本框按回车也能触发动作事件。

```java title="注册动作监听器"
JButton button = new JButton("更新");
JLabel status = new JLabel("等待操作");

button.addActionListener(event -> {
    // 点击后由 Swing 回调，更新视图状态。
    status.setText("已更新");
});
```

| 事件 | 监听器与关注点 |
| --- | --- |
| `ItemEvent` | `ItemListener` 处理选择状态，可判断 `SELECTED` 或 `DESELECTED` |
| `DocumentEvent` | 给文本组件的 `Document` 注册 `DocumentListener`，响应文字增删 |
| `MouseEvent` | `MouseListener` 接收点击等动作，`MouseMotionListener` 接收移动和拖动 |
| `FocusEvent`、`KeyEvent` | 焦点得失用 `FocusListener`，按键监听通常依赖组件拥有焦点 |
| `WindowEvent` | `WindowListener` 可处理打开、关闭和激活等窗口事件 |

### 监听器回调与事件的区别

- 一个文本框可以同时监听回车和文字变化。 `ActionListener` 接收提交动作。 `DocumentListener` 的 `insertUpdate` 和 `removeUpdate` 分别响应插入和删除。 `changedUpdate` 用于属性变化，普通文本组件不靠它报告输入内容的增删。
- `ItemEvent.getStateChange()` 可区分选中与取消选中。下拉选择从 A 切换到 B 时，可能收到 A 取消和 B 选中两条通知。只需要处理新值时，判断状态是否为 `SELECTED`。
- 鼠标事件的 `getX()` 和 `getY()` 是相对事件源的坐标。拖动用 `mouseDragged`，无需拖动的移动用 `mouseMoved`。
- 用 `KeyListener` 时，`keyPressed` 适合识别方向键等按键，`keyTyped` 适合读取产生的字符。组件需要焦点。要为窗口内的菜单或按钮补快捷操作，通常使用键绑定。
- `windowClosing` 发生在用户请求关闭窗口时。若要先确认再关闭，可设 `DO_NOTHING_ON_CLOSE`，在回调中根据确认结果调用 `dispose()`。

只关心某个事件方法时，可以继承对应适配器，例如 `MouseAdapter` 或 `WindowAdapter`，仅重写需要的方法。按钮的键盘快捷操作可用 `InputMap` 把按键映射为动作名，再用 `ActionMap` 绑定 `Action`。鼠标和键盘可共用同一动作。

```java title="让快捷键复用按钮动作"
KeyStroke shortcut = KeyStroke.getKeyStroke("ctrl ENTER");
button.getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW)
        .put(shortcut, "update"); // 窗口获得焦点时可触发
button.getActionMap().put("update", new AbstractAction() {
    @Override
    public void actionPerformed(java.awt.event.ActionEvent event) {
        button.doClick(); // 复用按钮已经登记的动作监听器
    }
});
```

:::important[Swing 事件派发线程]
界面创建和更新通常交给事件派发线程（EDT），可用 `SwingUtilities.invokeLater` 安排更新。监听器应尽快返回。耗时查询放到后台，再把结果交回 EDT。
:::

## MVC、对话框与复杂组件

| 职责 | 三角形界面的分工 |
| --- | --- |
| Model | 保存三条边，验证能否构成三角形并计算面积 |
| View | 提供三边输入框，显示结果或错误信息 |
| Controller | 监听计算动作，读取输入，调用模型，再更新视图 |

`JOptionPane` 可显示消息、读取输入或请求确认。取消输入时 `showInputDialog` 返回 `null`。`JColorChooser.showDialog` 取消时也可能返回 `null`。`JDialog` 用于自定义对话框，模态对话框会限制用户与其适用范围内其他窗口的交互。

`JTree` 用节点表现层级，常用 `DefaultMutableTreeNode` 建立节点关系。`JTable` 将表格行列和数据模型分开，数据变化可以通过表模型通知视图。发布桌面应用时应把入口类与所需图像等资源一起打包。更换广告牌内容时可复用接口，让界面通过同一动作调用不同实现。

### 对话框的返回值与表格模型

`showMessageDialog` 只显示信息。 `showInputDialog` 得到的是字符串，即使提示用户输入数字，也应先判断是否取消，再解析并校验。 `showConfirmDialog` 应根据 `YES_OPTION`、`NO_OPTION`、`CANCEL_OPTION` 或 `CLOSED_OPTION` 区分结果，关闭窗口也要有明确处理。自定义 `JDialog` 通常会指定拥有者，便于管理前后关系和居中位置。

课件的成绩单使用 `JTable` 编辑单元格，再遍历各行取出成绩。可以通过 `getValueAt(row, column)` 读取单元格。单元格的值可能是空值、数字或待解析的字符串，计算平均分前要先区分这些情况。

## 自测

1. 文本内容变化与文本框按回车应分别监听什么？

   答案：:spoiler[内容变化监听 `DocumentListener`，回车动作可用 `ActionListener`。]

2. 两个单选按钮互不排斥，通常漏了什么？

   答案：:spoiler[把两个按钮加入同一个 `ButtonGroup`。]

3. 为什么耗时任务不能直接放在按钮监听器里？

   答案：:spoiler[监听器占住 EDT 时，重绘和其他界面事件会等待，窗口看起来会卡住。]

4. MVC 中谁验证三条边，谁处理按钮动作？

   答案：:spoiler[模型验证边长和三角形条件，控制器处理按钮动作并更新视图。]

5. 下拉框从 A 切到 B，如何只对 B 执行一次处理？

   答案：:spoiler[在 ItemListener 中检查状态，只处理 SELECTED。]

6. 输入对话框用于接收分数，用户取消时应如何处理？

   答案：:spoiler[先检查返回值是否为 null。取消时结束本次输入处理，避免把空值传给数字解析。]
