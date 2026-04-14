# React JSX 与组件

很多人第一次看 React，第一反应都是一句话：

“这不就是 HTML 写进 JavaScript 里吗？”

这句话不能说全错，但不够准。JSX 看起来像 HTML，本质上是在描述一棵组件树。也正因为这样，React 才能把页面拆成一个个可组合的组件。

这篇只讲两件事：

- JSX 到底该怎么写
- 组件到底该怎么理解

## JSX 先记住这几个硬规则

这里最值钱的部分，不是长篇概念，而是这些一上手就会踩的规则。

```jsx
const myId = 'aTgUiGu'
const myData = 'HeLlo,rEaCt'

const view = (
  <div>
    <h2 className="title" id={myId.toLowerCase()}>
      <span style={{ color: 'white', fontSize: '29px' }}>
        {myData.toLowerCase()}
      </span>
    </h2>
    <input type="text" />
  </div>
)
```

从这个例子里，至少要记住下面几条：

- JSX 里写 JavaScript 表达式要用 `{}` 包起来
- `class` 要写成 `className`
- 行内样式要写成对象
- 组件返回内容时，必须有一个根节点
- 组件名通常大写，原生标签通常小写

很多初学者一上来不是不会写逻辑，而是会被这些语法细节绊住。

## 什么叫“表达式”，什么不叫

这一点很多新手会混。

在 JSX 里能放进 `{}` 的，是 JavaScript 表达式，不是普通语句。

比如这些是表达式：

- `a`
- `a + b`
- `demo(1)`
- `arr.map(...)`

像 `if`、`for`、`switch` 这种语句，不能直接塞进 JSX。

最常见写法是配合数组方法：

```jsx
const data = ['Angular', 'React', 'Vue']

const view = (
  <div>
    <h1>前端框架列表</h1>
    <ul>
      {data.map((item, index) => {
        return <li key={index}>{item}</li>
      })}
    </ul>
  </div>
)
```

这里的 `map` 特别像“把一组数据翻译成一组视图”。

## React 组件，本质上是在复用视图逻辑

可以先把组件理解成“可复用的页面零件”。

如果一个页面里，某块 UI 和逻辑会重复出现，那它就很适合被抽成组件。

### 函数组件

今天学 React，默认先学函数组件：

```jsx
function MyComponent() {
  return <h2>我是函数组件</h2>
}
```

它的优点很直接：

- 写法轻
- 心智负担低
- 和 Hooks 配合最好

### 类组件

老教程里还会大量出现类组件：

```jsx
class MyComponent extends React.Component {
  render() {
    return <h2>我是类组件</h2>
  }
}
```

类组件现在不是主流默认答案，但仍然值得看懂。因为很多历史项目、很多旧文章、很多面试题还会提到它。

可以这样类比：

- 类组件像老一代工具箱，功能全，但使用成本高
- 函数组件像新一代轻量工具，配合 Hooks 基本够用

## 为什么还要懂一点 ES6 class

这里专门补了类、继承、`super`、解构赋值，这个安排其实很合理。

因为类组件不是凭空来的，它就是建立在 ES6 class 语法上的。

比如：

```js
class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }

  speak() {
    console.log(`我叫 ${this.name}，我今年 ${this.age} 岁`)
  }
}

class Student extends Person {
  constructor(name, age, grade) {
    super(name, age)
    this.grade = grade
  }
}
```

如果连 `constructor`、`super`、实例方法这些都不熟，看类组件时就很容易糊。

## 组件渲染时，React 到底做了什么

这部分不用背底层源码，但要建立一个最基本的直觉。

当写下：

```jsx
ReactDOM.render(<MyComponent />, document.getElementById('test'))
```

React 干的事情大致是：

1. 发现 `MyComponent` 是一个组件
2. 调用它，拿到 JSX 结果
3. 把 JSX 转成可渲染的结构
4. 最后挂到页面上

也就是说，组件不是“神秘对象”，它最终还是在返回一段视图描述。

## JSX 和组件最容易混的点

这里顺手帮读者踩几个常见坑。

### 1. 原生标签和组件标签混了

```jsx
<div />
<MyComponent />
```

一个是浏览器原生标签，一个是 React 组件。首字母大小写非常重要。

### 2. 以为 JSX 是字符串

不是。JSX 不是模板字符串，也不是 HTML 文本。它更接近“可被编译的视图表达式”。

### 3. 组件一上来就写太大

这是很多人早期最大的问题。一个页面里，头部、列表、卡片、表单、弹窗全写在一个组件里，后面很快就会失控。

更稳的做法是：

- 页面组件负责组织
- 业务组件负责复用
- 展示组件负责局部 UI

## 最后

React 的第一步，不是死记 JSX 语法，而是建立两个核心直觉：

- JSX 是视图表达式
- 组件是可复用的视图单元

这两个点一旦想明白，后面的事件、状态、props、Hooks，都会顺很多。

