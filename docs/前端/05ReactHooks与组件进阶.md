# React Hooks 与组件进阶

很多人学 React，到这里会有一种明显感觉：

基础会了，但项目一复杂，脑子就开始乱。

比如：

- 生命周期到底怎么理解
- `useState`、`useEffect`、`useRef` 各管什么
- 为什么有 `Fragment`、`Context`
- 为什么组件会反复渲染
- 什么叫错误边界

这篇把这些放在一起讲，因为它们本质上都在回答同一个问题：

**组件一旦进入真实项目，除了“能显示”，还要怎么更稳、更清楚地工作。**

## 先从生命周期说起

老 React 教程里，生命周期是绕不过去的。

最经典的几个名字是：

- `componentDidMount`
- `componentDidUpdate`
- `componentWillUnmount`

如果用大白话解释：

- 挂载：组件第一次出现在页面上
- 更新：组件数据变了，重新渲染
- 卸载：组件从页面消失

类组件时代，很多逻辑都塞在这几个生命周期里。后来 Hooks 出来之后，这些能力没有消失，而是换了一种表达方式。

## 三个最常用的 Hook，先吃透

这里最核心的就是这三个：

- `useState`
- `useEffect`
- `useRef`

### `useState`

让函数组件也能拥有状态。

```jsx
const [count, setCount] = React.useState(0)
```

常见两种更新方式：

```jsx
setCount(count + 1)
setCount((value) => value + 1)
```

如果新值依赖旧值，第二种更稳。

### `useEffect`

处理副作用。

副作用可以理解成“除了渲染本身之外的额外动作”，比如：

- 发请求
- 开定时器
- 订阅事件
- 手动操作 DOM

```jsx
React.useEffect(() => {
  const timer = setInterval(() => {
    console.log('tick')
  }, 1000)

  return () => {
    clearInterval(timer)
  }
}, [])
```

这里的 `return` 不是多余代码，而是在组件卸载前做收尾。

### `useRef`

既可以拿 DOM，也可以保存某个跨渲染周期不想丢的值。

```jsx
const myRef = React.useRef()
```

## 一个把三个 Hook 放到一起的例子

这里这段例子很好，直接保留到博客里最合适：

```jsx
import React from 'react'
import ReactDOM from 'react-dom'

function Demo() {
  const [count, setCount] = React.useState(0)
  const myRef = React.useRef()

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCount((value) => value + 1)
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  function add() {
    setCount((value) => value + 1)
  }

  function show() {
    alert(myRef.current.value)
  }

  function unmount() {
    ReactDOM.unmountComponentAtNode(document.getElementById('root'))
  }

  return (
    <div>
      <input type="text" ref={myRef} />
      <h2>当前求和为：{count}</h2>
      <button onClick={add}>点我 +1</button>
      <button onClick={unmount}>卸载组件</button>
      <button onClick={show}>点我提示数据</button>
    </div>
  )
}

export default Demo
```

它刚好对应三种能力：

- `useState` 管状态
- `useEffect` 管副作用
- `useRef` 管引用

## `Fragment` 解决的不是功能问题，而是结构问题

早期 React 一个常见抱怨是：组件返回内容必须有一个根节点。

于是很多人会写很多没必要的 `div`。

`Fragment` 就是为这个问题准备的。

```jsx
<>
  <h1>标题</h1>
  <p>内容</p>
</>
```

或者：

```jsx
<React.Fragment>
  <h1>标题</h1>
  <p>内容</p>
</React.Fragment>
```

它的价值很朴素：减少没必要的 DOM 嵌套。

## `Context` 是跨层组件通信的通道

如果父组件和子组件挨得很近，用 `props` 就够了。

但如果中间隔了很多层，再一层一层传，就容易变成“钻 props”。

这时可以用 `Context`：

```jsx
const ThemeContext = React.createContext()

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  )
}
```

类组件里可以这么取：

```jsx
static contextType = ThemeContext
```

函数组件里更常见的是：

```jsx
<ThemeContext.Consumer>
  {(value) => <span>{value}</span>}
</ThemeContext.Consumer>
```

或者直接配合 `useContext`。

要注意一点：`Context` 很有用，但不是所有共享数据都要用它。大型项目里，很多时候会被更完整的状态管理方案接管。

## 组件为什么会反复渲染

这里提到一个很实际的问题：

> 只要执行 `setState()`，哪怕数据没变，组件也可能重新 render。

这会带来两个常见现象：

- 当前组件重复渲染
- 子组件跟着一起渲染

优化思路一般有两种：

### 1. 手写 `shouldComponentUpdate`

类组件里可以自己判断：

```jsx
shouldComponentUpdate(nextProps, nextState) {
  return nextState.count !== this.state.count
}
```

### 2. 用 `PureComponent`

```jsx
class Demo extends React.PureComponent {}
```

它会做浅比较。

但也正因为只是浅比较，所以不要直接改原对象，否则很容易看起来“改了”，实际上渲染没触发。

## `render props` 是一种很经典的复用思路

如果一个组件内部有逻辑，但想把“长成什么样”交给外面决定，就可以用 `render props`。

```jsx
<A render={(data) => <C data={data} />} />
```

组件 A 内部：

```jsx
this.props.render(this.state)
```

可以把它理解成：

- 逻辑在 A
- 展示交给 C

这在组件抽象里很常见，也能帮人更早理解“逻辑复用”和“UI 复用”不是一回事。

## 错误边界不是万能兜底，但很有价值

错误边界最适合用来捕获后代组件渲染阶段的错误，然后渲染一个备用界面。

```js
static getDerivedStateFromError(error) {
  return {
    hasError: true,
  }
}

componentDidCatch(error, info) {
  console.log(error, info)
}
```

它很有用，但要注意边界：

- 能抓住很多渲染阶段错误
- 抓不住所有异步回调、事件处理里的错误
- 也抓不住它自己组件内部所有类型的问题

## 最后

这篇如果只记一句话，可以记这个：

React 进入真实开发后，重点不再只是“页面能不能显示”，而是：

- 状态怎么管
- 副作用怎么收
- 组件怎么复用
- 渲染怎么优化
- 出错时怎么兜底

把这几层想清楚，组件才算真的进阶。

