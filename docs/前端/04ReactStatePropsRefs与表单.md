# React state、props、refs 与表单

React 真正开始“动起来”，就是从这几个概念开始：

- `state` 管自己
- `props` 接别人传进来的东西
- `ref` 拿到某个 DOM 或实例

再往前一步，就是表单。

很多新手觉得自己 JSX 也会写、组件也会拆了，但一到交互就乱，原因通常就卡在这一层。

## 先分清：谁的数据归谁管

可以先用一句很实用的话记住：

- `state` 是组件自己的数据
- `props` 是外面传进来的数据

如果把组件比作一个店铺：

- `state` 像店里自己记的库存
- `props` 像总部发下来的配置

这个边界一乱，后面组件通信就容易乱。

## `state` 最常见的入门写法

老教程里很多是类组件状态，这段代码就是最典型的例子：

```jsx
class Weather extends React.Component {
  state = { isHot: true, wind: '微风' }

  render() {
    const { isHot, wind } = this.state
    return <h1>今天天气很{isHot ? '炎热' : '凉爽'}，{wind}</h1>
  }
}
```

这里最重要的不是语法，而是理解：

- 状态变了，视图会重新渲染
- 视图不是手改的，是状态驱动的

这就是 React 最核心的思路之一。

## 事件绑定别只背写法，要知道 `this` 为什么会丢

这里这部分写得很细，很适合放进博客。

```jsx
class Weather extends React.Component {
  a = 100

  render() {
    return (
      <>
        <button onClick={() => console.log('click1', this.a)}>写法一</button>
        <button onClick={this.handleClick2.bind(this)}>写法二</button>
        <button onClick={this.handleClick3}>写法三</button>
      </>
    )
  }

  handleClick2() {
    console.log('click2', this.a)
  }

  handleClick3 = () => {
    console.log('click3', this.a)
  }
}
```

为什么会这样？

- 普通方法里的 `this`，取决于谁调用它
- 箭头函数不会重新绑定自己的 `this`

所以在 React 里，箭头函数经常更省心。

## `props` 是组件之间最基本的通信方式

父组件往子组件传数据，最基础的方式就是 `props`。

```jsx
function Welcome(props) {
  return <h2>你好，{props.name}</h2>
}

export default function App() {
  return <Welcome name="React" />
}
```

这部分很多人看起来都会，但真到项目里容易犯两个错：

- 子组件偷偷改 `props`
- 本该父组件管的数据，硬塞到子组件自己 state 里

更稳的原则是：

- 谁拥有数据，谁负责改
- 谁只是展示数据，谁就老老实实接 `props`

## `ref` 用来拿 DOM，但别什么都靠它

这里既讲了字符串 ref，也讲了回调 ref 和 `createRef`。真正开发里，优先记住最常用的写法就够了。

```jsx
class Demo extends React.Component {
  myRef = React.createRef()

  show = () => {
    alert(this.myRef.current.value)
  }

  render() {
    return (
      <div>
        <input ref={this.myRef} type="text" />
        <button onClick={this.show}>点我提示输入内容</button>
      </div>
    )
  }
}
```

`ref` 最常见的场景就两个：

- 拿输入框、滚动容器这类 DOM
- 某些必须直接操作真实节点的场景

如果一个需求完全可以靠状态驱动完成，就不要先想到 `ref`。

## 表单这块最容易混：受控和非受控

这是 React 表单最经典的一组对比。

### 受控组件

受控组件的意思是：输入框的值，由 React 状态接管。

```jsx
class Login extends React.Component {
  state = {
    username: '',
    password: '',
  }

  saveFormData = (fieldName) => {
    return (event) => {
      this.setState({ [fieldName]: event.target.value })
    }
  }

  handleSubmit = (event) => {
    event.preventDefault()
    console.log(this.state)
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        用户名：
        <input onChange={this.saveFormData('username')} type="text" />
        密码：
        <input onChange={this.saveFormData('password')} type="password" />
        <button>登录</button>
      </form>
    )
  }
}
```

优点是：

- 数据统一
- 好校验
- 好联动
- 好提交

这也是项目里更常见的方式。

### 非受控组件

非受控组件的思路是：值主要还在 DOM 里，要取的时候再通过 `ref` 取。

```jsx
class Login extends React.Component {
  usernameRef = React.createRef()
  passwordRef = React.createRef()

  handleSubmit = (event) => {
    event.preventDefault()
    console.log(this.usernameRef.current.value, this.passwordRef.current.value)
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        用户名：
        <input ref={this.usernameRef} type="text" />
        密码：
        <input ref={this.passwordRef} type="password" />
        <button>登录</button>
      </form>
    )
  }
}
```

这不是不能用，但如果表单复杂、要联动校验，受控组件通常更稳。

## 这个“高阶函数 + 柯里化”写法，项目里很常见

这里把 `saveFormData` 拆得很明白，这个值得保留。

```jsx
saveFormData = (fieldName) => {
  return (event) => {
    this.setState({ [fieldName]: event.target.value })
  }
}
```

第一次看会有点绕，但本质很简单：

- 外层先确定“我要改哪个字段”
- 内层再接收真正的事件对象

它的好处是，不用给每个输入框都单独写一套处理函数。

## `props`、`state`、`ref` 怎么选

这几个东西不怕多，怕混。

| 场景 | 更适合用什么 |
| --- | --- |
| 组件自己的可变数据 | `state` |
| 父传子的数据 | `props` |
| 直接拿 DOM | `ref` |
| 复杂表单值管理 | 优先 `state` |

## 最后

如果把 React 组件想成一个能交互的页面单元，那这篇其实就在解决四件事：

- 数据放哪里
- 事件怎么触发
- 数据怎么往下传
- 表单怎么管理

这四件事一旦理顺，后面的 Hooks、路由、Redux 才不会全堆在一起打架。

