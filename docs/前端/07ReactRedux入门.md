# React Redux 入门

很多人学 React 学到 Redux，第一反应都是：

“这玩意为什么这么绕？”

这个感觉很正常。因为 Redux 从来不是为了让代码更短，它是为了让状态变化更可控。

所以学 Redux，别先问“它语法怎么写”，先问：

**什么时候真的需要它。**

## 别一上来就上 Redux

这点这里的判断很务实，应该保留。

如果只是一个简单页面，组件自己管状态通常就够了。只有当下面这些问题开始出现时，再考虑 Redux 这类集中式状态管理工具：

- 多个页面或多个组件要共享状态
- 状态更新链路越来越复杂
- 需要追踪“到底是谁改了状态”
- 异步流程开始变长

换句话说，Redux 解决的不是“页面怎么显示”，而是：

**多组件之间，怎样以可预测的方式共享和更新状态。**

## 先看最小 Redux 闭环

这段最小代码就够把核心链路说明白：

```js
import { createStore } from 'redux'

const initialState = { count: 0 }

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + 1 }
    default:
      return state
  }
}

const store = createStore(reducer)

store.dispatch({ type: 'increment' })
console.log(store.getState())
```

这里最关键的链路就是：

`action -> reducer -> new state`

这也是 Redux 的核心味道：状态不是随手改，而是通过固定通道改。

## `store` 和 `reducer` 各自负责什么

这里对目录拆分讲得很清楚，这里直接顺着用。

通常会这样拆：

```text
src
└── redux
    ├── store.js
    └── count_reducer.js
```

### `store.js`

负责创建和暴露全局 store。

### `count_reducer.js`

负责接收旧状态和 action，再返回新状态。

可以把它理解成：

- `store` 是总仓库
- `reducer` 是仓库管理员
- `action` 是变更单

## 完整一点的写法，会把 action 单独拆出来

当项目稍微大一点，就不该把所有 action 都手写在组件里。

这里的做法是：

- `count_action.js`：专门创建 action 对象
- `constant.js`：集中管理 type 常量，避免手写字符串拼错

这套结构的意义不是“显得正规”，而是项目一大之后更好维护。

## 异步 action 什么时候需要

这里这部分也很重要。

有时候数据不是立刻就有，而是要等接口、定时器或别的异步任务返回。这个时候就会需要异步 action。

常见做法是接 `redux-thunk`：

```bash
yarn add redux-thunk
```

然后让 action 不再直接返回对象，而是返回函数。

它的思路可以概括成一句话：

- 异步任务先跑
- 真拿到结果后，再分发同步 action 改状态

这比把所有异步逻辑都堆在组件里，后期更容易管。

## `react-redux` 解决的是“怎么接进 React”

Redux 自己只管状态，不直接帮你把页面更新好。

真正把 React 和 Redux 接起来，通常要用 `react-redux`。

这里最关键的概念有两个：

- UI 组件
- 容器组件

### UI 组件

只负责展示和交互，不直接碰 Redux API。

### 容器组件

负责和 Redux 通信，再把数据和方法交给 UI 组件。

经典写法：

```jsx
connect(
  state => ({ key: value }),
  { key: actionCreator }
)(UI组件)
```

这里的 `connect` 就是在做映射：

- 把 state 映射成 props
- 把 dispatch 行为映射成 props

## 项目再往后，会继续做这些优化

这里还保留了几步非常典型的优化动作：

### 1. 用 `Provider` 包住应用

这样就不用层层手传 store。

### 2. `mapDispatchToProps` 可以直接写对象

代码会更短。

### 3. 多个 reducer 用 `combineReducers`

当 `count`、`person` 这种状态模块变多时，这一步基本是标配。

### 4. 接开发者工具

这里的配置是：

```bash
yarn add redux-devtools-extension
```

然后：

```js
import { composeWithDevTools } from 'redux-devtools-extension'
const store = createStore(allReducer, composeWithDevTools(applyMiddleware(thunk)))
```

这一步特别有实战价值，因为 Redux 最大的优势之一，就是状态变化链路可追踪。

## Redux 和消息订阅发布怎么理解

这里还提到了消息订阅发布、集中式管理、Context 这些通信方式。

如果简单区分：

- 父子组件：优先 `props`
- 兄弟组件：可以考虑消息订阅发布或集中式状态管理
- 跨层组件：`Context` 或状态管理方案

Redux 的优势不只是“能共享数据”，而是它把共享数据这件事做得更可推导、更可调试。

## 最后

Redux 不是 React 项目的起手式，它更像项目复杂到一定阶段后的秩序工具。

所以更实用的结论是：

- 小项目先别急着上
- 状态共享复杂起来再考虑
- 一旦上了，就把 `action -> reducer -> state` 这条链路吃透

这样学 Redux，不会只剩一堆 API，而是真的知道它为什么存在。

