---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: kotlin
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
#java #kotlin

## 类型别名
类型别名为现有类型提供替代名称。 如果类型名称太长，你可以另外引入较短的名称，并使用新的名称替代原类型名。

它有助于缩短较长的泛型类型。 例如，通常缩减集合类型是很有吸引力的
```kotlin
typealias NodeSet = Set<Network.Node>

typealias FileTable<K> = MutableMap<K, MutableList<File>>
```
```kotlin
typealias MyHandler = (Int, String, Any) -> Unit

typealias Predicate<T> = (T) -> Boolean
```

## 委托
[委托模式](https://zh.wikipedia.org/wiki/%E5%A7%94%E6%89%98%E6%A8%A1%E5%BC%8F)已经证明是实现继承的一个很好的替代方式， 而 Kotlin 可以零样板代码地原生支持它。

`Derived` 类可以通过将其所有公有成员都委托给指定对象来实现一个接口 `Base`

```kotlin
interface Base {
    fun print()
}

class BaseImpl(val x: Int) : Base {
    override fun print() { print(x) }
}

class Derived(b: Base) : Base by b

fun main() {
    val b = BaseImpl(10)
    Derived(b).print()
}
```
`Derived` 的超类型列表中的 `by`-子句表示 `b` 将会在 `Derived` 中内部存储， 并且编译器将生成转发给 `b` 的所有 `Base` 的方法
### 覆盖由委托实现的接口成员

[覆盖](https://book.kotlincn.net/text/inheritance.html#%E8%A6%86%E7%9B%96%E6%96%B9%E6%B3%95)符合预期：编译器会使用 `override` 覆盖的实现而不是委托对象中的。如果将 `override fun printMessage() { print("abc") }` 添加到 `Derived`，那么当调用 `printMessage` 时程序会输出 _abc_ 而不是
```kotlin
interface Base {
    fun printMessage()
    fun printMessageLine()
}

class BaseImpl(val x: Int) : Base {
    override fun printMessage() { print(x) }
    override fun printMessageLine() { println(x) }
}

class Derived(b: Base) : Base by b {
    override fun printMessage() { print("abc") }
}

fun main() {
    val b = BaseImpl(10)
    Derived(b).printMessage()
    Derived(b).printMessageLine()
}
```


## 文档
[kotlin官方文档](https://book.kotlincn.net/text/type-aliases.html)