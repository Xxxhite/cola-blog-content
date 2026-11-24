---
title: 第 14 章 图形图像与音频
published: 2026-11-23 13:05:00
tags: [Graphics2D, 图形变换, BufferedImage, ImageIO, Java Sound]
category: 面向对象程序设计
---

Java 可以把线段和曲线绘制到组件或内存图像中，也能读取图像文件与播放采样音频。界面绘图继续遵循 Swing 的事件派发规则。

<!-- more -->

## Graphics2D 与组件重绘

课件重写组件的 `paint` 演示绘制。对于 Swing 的 `JPanel`，自定义内容通常放在 `paintComponent`，先调用父类实现以绘制背景，再使用 `Graphics2D` 绘图。组件坐标原点通常在左上角，向右和向下是正方向。

```java title="在面板上绘制线段与圆"
class DrawingPanel extends JPanel {
    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g); // 先按面板规则绘制背景
        Graphics2D pen = (Graphics2D) g.create();
        try {
            pen.drawLine(10, 20, 120, 20);
            pen.drawOval(40, 40, 60, 60); // 参数是外接矩形的位置和尺寸
        } finally {
            pen.dispose(); // 释放自己创建的绘图上下文
        }
    }
}
```

在方法内：

```java
DrawingPanel drawing = new DrawingPanel();
window.add(drawing); // 将绘图区放入窗口
```

`draw` 绘制轮廓，`fill` 填充区域。线段、矩形、椭圆和曲线也可以用 `Line2D`、`Rectangle2D`、`Ellipse2D`、`QuadCurve2D` 等形状对象描述。绘制状态改变后调用 `repaint()` 请求 Swing 安排重画，绘制方法根据当前状态重新生成画面。

## 变换、布尔运算和时钟

`AffineTransform` 支持平移、旋转与缩放。变换顺序会影响结果，例如先旋转后平移与先平移后旋转一般不同。旋转参数用弧度，可用 `Math.toRadians` 转换角度。可变换形状本身，也可变换绘图上下文。

将 `Shape` 包装为 `Area` 后可以运算。 `add` 求并集，`intersect` 求交集，`subtract` 扣除重叠部分，`exclusiveOr` 保留只属于其中一个区域的部分。这些方法修改调用者，想保留原区域时先建立副本。

```java title="用图形差集挖出空心圆"
Area ring = new Area(new Ellipse2D.Double(0, 0, 100, 100));
Area hole = new Area(new Ellipse2D.Double(20, 20, 60, 60));
ring.subtract(hole); // 修改 ring，去掉与内圆重叠的区域
pen.fill(ring); // pen 是当前的 Graphics2D 绘图上下文
```

绘制钟表时，若角度从 12 点方向顺时针增加，指针末端可用 `x = cx + length * Math.sin(angle)`、`y = cy - length * Math.cos(angle)` 求出。秒针每秒前进 6 度，分针和时针也可以计入更小单位的进度。Swing 计时器负责更新状态并请求重绘。

## 加载、绘制与保存图像

`ImageIO.read` 把图像文件解码为 `BufferedImage`。 `drawImage` 把图像画到界面上，可给出位置和缩放尺寸。要输出绘制结果，可以直接在内存图像上绘制，再交给 `ImageIO.write` 编码。

```java title="绘制并保存内存图像"
BufferedImage image = new BufferedImage(160, 100, BufferedImage.TYPE_INT_RGB);
Graphics2D pen = image.createGraphics();
try {
    pen.setColor(Color.WHITE);
    pen.fillRect(0, 0, 160, 100); // 先铺满背景
    pen.setColor(Color.BLACK);
    pen.drawString("Java", 20, 40); // y 坐标表示文字基线
} finally {
    pen.dispose();
}
boolean written = ImageIO.write(image, "png", new File("drawing.png"));
```

`write` 返回 `false` 表示找不到相应的图像编码器。内存图像的绘图上下文由应用创建，因此要释放它。界面重绘时收到的原始 `Graphics` 则由框架管理。

课件还通过 `Toolkit.getImage` 演示加载图像。这类图像可能异步准备，绘制到组件时可把组件本身作为 `ImageObserver`。需要先读完整图像、修改像素或保存为文件时，使用 `ImageIO.read` 得到的 `BufferedImage` 更便于处理。

## 采样音频与按键发声

配套音频示例通过 `AudioSystem.getAudioInputStream` 读取音频，通过 `AudioSystem.getClip` 取得可预加载的 `Clip`。适合短提示音的流程是 `open`、`start`、`stop` 与 `close`。暂停后从头播放可先 `setFramePosition(0)`，需要循环时可调用 `loop`。音频是否可播放取决于数据格式和运行环境提供的解码能力。MIDI 通常交给 `javax.sound.midi` 处理。

用按钮模拟音阶时，可以让鼠标动作和键绑定调用同一个播放行为。加载音频资源可能耗时，避免在每次按键时现场读取。

音频对话框使用的 `Clip` 可以先加载一段声音，后续按钮只控制播放。 `stop()` 会停在当前位置。若按键每次都要从头开始，应把位置归零再播放。窗口不再使用这段声音后，应关闭 `Clip` 释放音频资源。

## 自测

1. 自定义 Swing 面板绘制时，为什么先调用父类的 `paintComponent`？

   答案：:spoiler[让父类先按组件规则绘制背景，避免新画面与上一次留下的内容叠在一起。]

2. `Area.subtract` 对原区域有什么影响？

   答案：:spoiler[它会修改调用者，去掉和另一片区域重叠的部分。]

3. 怎样把绘制结果保存为 PNG？

   答案：:spoiler[在 `BufferedImage` 上完成绘制，再调用 `ImageIO.write` 并指定 `"png"` 格式。]

4. 怎样让停止后的短音频从开头播放？

   答案：:spoiler[对 `Clip` 调用 `setFramePosition(0)`，再调用 `start()`。]
