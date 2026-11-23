---
title: 第 12 章 Java 多线程机制
published: 2026-11-23 13:03:00
tags: [Thread, Runnable, 线程同步, wait, Swing Timer]
category: 面向对象程序设计
---

进程拥有运行资源，线程是进程内的一条执行路径。同一进程中的线程可以共享对象，但共享数据的访问顺序必须由程序明确协调。

<!-- more -->

## 创建与启动线程

可以继承 `Thread` 并重写 `run()`，也可以把任务写成 `Runnable` 再交给 `Thread`。后者把任务与启动方式分开。`start()` 安排新线程执行任务，直接调用 `run()` 则由当前线程执行。同一个 `Thread` 对象只能启动一次。主线程从 `main` 开始，`Thread.currentThread()` 可取得当前线程。

```java title="启动任务并等待结束"
Runnable task = () -> System.out.println(Thread.currentThread().getName());
Thread worker = new Thread(task, "worker");
worker.start(); // 安排 worker 执行 run()
worker.join();  // 当前线程等待 worker 结束
```

共享一个 `Runnable` 的线程会共享该实例的字段。每次执行 `run()` 时创建的局部变量则属于各自的调用，局部变量指向的同一个对象仍可能被共享。

### 继承 Thread 的写法

课件也用两个 `Thread` 子类交替输出内容，观察主线程与子线程的执行顺序。需要重写的是 `run()`。

```java title="继承 Thread 并定义任务"
class SpeakThread extends Thread {
    @Override
    public void run() { // 线程启动后执行的任务
        System.out.println("子线程执行");
    }
}
```

在方法内：

```java
Thread speaker = new SpeakThread();
speaker.start();
System.out.println("主线程继续"); // 两行输出的先后顺序不固定
```

## 线程状态与常用操作

课件用生命周期示意图帮助理解新建、运行、暂停和结束。排查程序时，可用 `getState()` 查看 Java 定义的六种状态：

| 状态 | 含义 |
| --- | --- |
| `NEW` | 对象已创建，还未启动 |
| `RUNNABLE` | 可以运行或正在运行 |
| `BLOCKED` | 等待进入受监视器锁保护的区域 |
| `WAITING` | 等待其他线程完成特定动作 |
| `TIMED_WAITING` | 等待带时限，例如 `sleep` 或带超时的 `join` |
| `TERMINATED` | 执行结束 |

`Thread.sleep` 暂停当前线程，已经持有的监视器锁仍由它持有。`interrupt()` 是中断请求。线程在 `sleep`、`wait` 或 `join` 中收到请求时可抛出 `InterruptedException`，其他代码也可检查中断状态并协作退出。如果当前层无法处理且不能向上抛出中断异常，可用 `Thread.currentThread().interrupt()` 恢复中断状态。

线程的启动顺序和优先级不能保证执行顺序。用 `join()` 等待某线程结束时，等待的是调用方。`setDaemon(true)` 应在启动前调用。当 JVM 中只剩守护线程时，它们不能阻止 JVM 退出。

## 同步和线程间协调

`count++` 需要读取、计算和写回。多个线程同时修改共享计数时，可能读到同一个旧值并覆盖彼此的结果。实例 `synchronized` 方法锁住当前对象，静态同步方法锁住类对象。参与同一共享状态的操作应使用同一把锁。

以共享售票为例，假设只剩一张票，两个线程可能先后读到余票为 1，各自认为可以买票。应把「检查余票」与「扣减余票」放在同一个同步区域，并保证两个线程操作的是同一个售票对象。

```java title="用等待条件协调生产者和消费者"
class Mailbox {
    private String message; // null 表示槽位为空

    synchronized void put(String value) throws InterruptedException {
        while (message != null) {
            wait(); // 槽位已满，等待时释放当前对象的监视器锁
        }
        message = value;
        notifyAll(); // 通知等待同一对象的线程重新检查条件
    }

    synchronized String take() throws InterruptedException {
        while (message == null) {
            wait(); // 被唤醒并重新获得锁后，继续检查是否有消息
        }
        String value = message;
        message = null;
        notifyAll();
        return value;
    }
}
```

在方法内：

```java
Mailbox mailbox = new Mailbox();
mailbox.put("第一条消息");
String message = mailbox.take(); // 返回第一条消息，同时清空槽位
```

上例约定传入的消息非空。调用 `wait` 或 `notifyAll` 必须持有同一对象的监视器锁。收到通知的线程要等到重新拿到锁后才能继续，而条件可能已被其他线程改变，因此用 `while` 复查。

## GUI 与计时器

Swing 界面更新在 EDT 上完成。耗时任务可以在线程或 `SwingWorker` 中执行，再把结果发回 EDT。如果任务只是按固定间隔更新倒计时标签，可以使用 `javax.swing.Timer`，它的动作监听器在 EDT 上运行。

```java title="定时更新界面时间"
javax.swing.Timer timer = new javax.swing.Timer(1000, event -> {
    // 回调在 EDT 上执行，只做轻量的界面更新。
    clockLabel.setText(java.time.LocalTime.now().withNano(0).toString());
});
timer.start();
```

限时答题可以用计时器刷新剩余时间，用按钮监听器提交答案，并在答题结束时停止计时器。计时器回调可能因 EDT 忙碌而推迟，严格计时应比较当前时间与截止时间。

## 自测

1. 为什么直接调用 `run()` 不会开启新线程？

   答案：:spoiler[run 是普通方法调用，由当前线程执行。start 才安排新线程运行任务。]

2. `sleep()` 与 `wait()` 对监视器锁的作用有什么区别？

   答案：:spoiler[sleep 不释放已持有的锁。wait 会释放所等待对象的监视器锁，并在返回前重新获取它。]

3. 为什么 `wait()` 外面通常使用 `while`？

   答案：:spoiler[醒来时条件可能还不成立，例如另一线程抢先改变了状态，因此重新获得锁后要再次检查。]

4. 在 A 中调用 `b.join()`，谁在等谁？

   答案：:spoiler[A 等待线程 b 结束。]

5. 两个线程各自创建一个售票对象，再调用同步方法，会相互等待吗？

   答案：:spoiler[实例同步方法分别锁住各自的对象，两把锁互不影响。要保护同一份余票，应共享售票状态和保护它的锁。]
