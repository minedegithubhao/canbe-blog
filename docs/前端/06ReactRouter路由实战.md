# React Router 路由实战

很多 React 初学者一学到路由，就容易把事情想复杂。

其实路由最本质的作用就一句话：

**让不同 URL 对应不同页面内容。**

难点不在“会不会写”，而在于：

- 路由参数怎么传
- 编程式跳转怎么做
- `BrowserRouter` 和 `HashRouter` 怎么选
- 刷新页面为什么有时会出问题

这篇就把这些一次理顺。

## 最小路由先跑起来

先看一个最小例子：

```jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

function Home() {
  return <h2>首页</h2>
}

function About() {
  return <h2>关于页</h2>
}

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}
```

这里最关键的角色就几个：

- `BrowserRouter`：路由容器
- `Link`：页面跳转链接
- `Routes`：路由匹配区
- `Route`：具体路由规则

先把这个跑通，比一上来写复杂嵌套路由更重要。

## 路由参数常见三种传法

这里这部分是实战价值很高的一块，因为项目里真的会反复用。

### 1. params 传参

路径长这样：

```text
/detail/1/张三
```

特点：

- 参数直接写进路径
- 语义清楚
- 适合资源定位

### 2. search 传参

路径长这样：

```text
/detail?id=1&name=张三
```

特点：

- 更像传统 URL 查询参数
- 适合可选条件较多的场景

### 3. state 传参

路径不一定显式带参数，但跳转时把状态塞进去。

这个方式也常用，不过要注意：在不同路由模式下，刷新后的表现会不完全一样。

## 编程式导航在项目里更常见

很多跳转不是点 `<Link>` 触发的，而是：

- 登录成功后自动跳转
- 提交成功后回列表
- 点击按钮后回退

这时就要用编程式导航。

这里保留的几个动作很典型：

```jsx
this.props.history.push('/home')
this.props.history.replace('/home')
this.props.history.goBack()
this.props.history.goForward()
this.props.history.go(-2)
```

可以这样理解：

- `push`：压一条新记录进去
- `replace`：用新记录替换当前记录
- `goBack`：后退
- `goForward`：前进
- `go(n)`：按历史栈移动

如果是“登录成功跳首页”，通常更适合 `replace`，因为用户没必要再点后退回登录页。

## `withRouter` 是给普通组件补路由能力

不是所有组件天生都有路由相关 API。

有些普通组件，比如头部组件、侧边栏组件，也想调用路由能力，这时老版本 React Router 里常见的做法就是 `withRouter`。

```jsx
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'

class Header extends Component {
  back = () => {
    this.props.history.goBack()
  }

  forward = () => {
    this.props.history.goForward()
  }

  go = () => {
    this.props.history.go(-2)
  }

  render() {
    return (
      <div className="page-header">
        <h2>React Router Demo</h2>
        <button onClick={this.back}>回退</button>
        <button onClick={this.forward}>前进</button>
        <button onClick={this.go}>go</button>
      </div>
    )
  }
}

export default withRouter(Header)
```

它本质上是在做一件事：

把普通组件“加工”成能接触路由上下文的组件。

## `BrowserRouter` 和 `HashRouter` 到底怎么选

这组对比一定要会，因为它不是死概念，真的会影响部署。

| 维度 | BrowserRouter | HashRouter |
| --- | --- | --- |
| 底层原理 | H5 History API | URL hash |
| URL 形式 | `/demo/test` | `/#/demo/test` |
| 地址观感 | 更干净 | 会带 `#` |
| 部署要求 | 服务器要支持路由回退 | 对静态托管更省心 |

这里还有一个很关键的点：

- `BrowserRouter` 刷新时，对某些 state 参数更友好
- `HashRouter` 在静态托管环境里更容易少踩路径坑

这也是为什么很多纯前端托管项目，会优先考虑 `HashRouter`。

## 刷新页面样式丢失，很多时候不是 React 自己的锅

这也是实战里很常见的坑。

如果用了多级路径，刷新后样式丢失，常见原因是静态资源路径写法不对。

这里给了三种思路：

1. `public/index.html` 里引用样式时不要乱写相对路径
2. 可以用 `%PUBLIC_URL%`
3. 某些场景直接改用 `HashRouter`

真正排查时，不要一上来怀疑“路由坏了”，先看：

- 样式资源请求地址对不对
- 服务器是否支持 history 回退
- 当前部署是不是更适合 hash 模式

## 路由懒加载，是项目变大后的常规动作

页面一多，不做拆包，首屏压力就会明显上来。

这里这段代码很适合直接保留：

```jsx
const Login = lazy(() => import('@/pages/Login'))

<Suspense fallback={<h1>loading...</h1>}>
  <Switch>
    <Route path="/xxx" component={Xxxx} />
    <Redirect to="/login" />
  </Switch>
</Suspense>
```

这套思路的重点是：

- 用 `lazy` 动态加载组件
- 用 `Suspense` 给加载过程一个兜底界面

换句话说，不是所有页面都要在第一次打开站点时一起打包进来。

## 最后

React Router 这块如果只记住最重要的几件事，可以记下面这组：

- 先把最小路由跑通
- 参数传递分清 `params`、`search`、`state`
- 自动跳转场景优先考虑编程式导航
- 静态托管环境经常更适合 `HashRouter`
- 页面变多后记得做懒加载

路由本身不复杂，复杂的是项目环境和跳转场景。把这层想清楚，后面写多页面应用会轻松很多。

