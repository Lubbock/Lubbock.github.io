---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: code
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
# golang基础API

## golang文件操作

文件操作大多数api包含在`os`中

| 命令                                    | 描述                     |
| --------------------------------------- | ------------------------ |
| Mkdir(name string,perm FileModel) error | os.Mkdir("./x",0777)     |
| MkdirAll(path string,Perm FileModel)    | 创建多级目录             |
| Remove(name string)                     |                          |
| RemoveAll(name string)                  | 有文件或者其他目录会报错 |
|                                         |                          |

```go
import (
"fmt"
"os"
)
func main() {
os.Mkdir("astaxie", 0777)
os.MkdirAll("astaxie/test1/test2", 0777)
err := os.Remove("astaxie")
if err != nil {
fmt.Println(err)
}
os.RemoveAll("astaxie")
}
```

### 创建打开文件

- Create
- NewFile
- Open
- OpenFile

### 写入文件

- Write
- WiteAt
- WiteString

```go
func main() {
userFile := "astaxie.txt"
fout, err := os.Create(userFile)
defer fout.Close()
if err != nil {
fmt.Println(userFile, err)
return
}
for i := 0; i < 10; i++ {
fout.WriteString("Just a test!\r\n")
fout.Write([]byte("Just a test!\r\n"))
}
}
```

### 读取文件

- Read(b []byte)(n int,err Error)
- ReadAt(b []byte,off int64)(n int,err Error)

### 删除文件

Go删除文件和删除文件夹是同一个函数

```go
func Remove(name string) Error
```

## 字符串转换

> 字符串转化的函数在strconv中

```golang
func main() {
 str := make([]byte, 0, 100)
 str = strconv.AppendInt(str, 4567, 10)
 str = strconv.AppendBool(str, false)
 str = strconv.AppendQuote(str, "abcdefg")
 str = strconv.AppendQuoteRune(str, '单')
 fmt.Println(string(str))
 }
```

其他转换成字符串

```go
func main() {
 a := strconv.FormatBool(false)
 b := strconv.FormatFloat(123.23, 'g', 12, 64)
 c := strconv.FormatInt(1234, 10)
 d := strconv.FormatUint(12345, 10)
 e := strconv.Itoa(1023)
 fmt.Println(a, b, c, d, e)
 }
```

字符串转换成其他类型

```go
func main(){
    b, err := strconv.ParseFloat("123.23", 64)
 if err != nil {

fmt.Println(err)
 }
 c, err := strconv.ParseInt("1234", 10, 64)
 if err != nil {

fmt.Println(err)
 }
 d, err := strconv.ParseUint("12345", 10, 64)
 if err != nil {

fmt.Println(err)
 }
 e, err := strconv.Itoa("1023")
 if err != nil {

fmt.Println(err)
 }
}
```



# kotlin

`kotlin`while语句的使用

```
        while (it.readLine().also { li-> line = li } != null) {

        }
```

核心在`also`的使用，also 可用于不更改对象的其他操作，例如记录或打印调试信息。通常，您可以在不破坏程序逻辑的情况下从调用链中删除也是调用。通过这个关键字在原本不允许赋值的while中加入了赋值语句。

与`also`经常出现的一个关键字是`apply`。`apply`主要用于对象赋值操作.`apply`自带了应用上下文

```kotlin
val numbers = mutableListOf("one", "two", "three")
numbers.also { println("The list elements before adding new one: $it") }
    .add("four")
val adam = Person("Adam").apply {
    age = 32
    city = "London"        
}
```

# Python

## prompt_toolkit

` prompt_toolkit`用于在**Python**中构建功能强大的交互式命令行和终端应用程序的库，它可以是**GNU readline**的高级替代品.

- 键入时语法高亮显示输入。（例如，使用Pygments词法分析器。）
- 多行输入编辑。
- 高级代码自动完成。
- 选择要复制/粘贴的文本。（Emacs和Vi风格。）
- 鼠标支持光标定位和滚动。
- 自动建议。（像[fish shell](http://fishshell.com/)。）
- 没有global状态。

# Dullib

网易 Duilib 框架提供了更加完整和丰富的功能，以满足不同真实业务场景的需求：

1. 丰富的控件、简易的布局
2. 灵活的控件组合、事件处理方式
3. 模块化支持
4. 优化渲染效率
5. 异形窗体支持
6. DPI 适配支持
7. 多国语言支持
8. 通用样式支持
9. 虚表控件支持
10. 虚拟键盘支持
11. 实用的多线程支持
12. CEF webview 支持
13. 控件动画、GIF 动画支持
14. 触控设备支持（Surface、Wacom）
15. 抽象渲染接口（为其他渲染引擎提供支持）

### 3.2 灵活的布局与组合

网易 Duilib 中，增加了控件与容器的尺寸自适应功能，免去繁琐的手写尺寸。同时增强了布局能力，搭配控件的一些定位属性，可以使用少量 xml 代码来完成更加强大的布局效果。