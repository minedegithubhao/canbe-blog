# React 项目起步

很多人第一次学 React，最容易卡住的不是组件，而是环境。

- 到底该用 `create-react-app` 还是 `Vite`
- 项目跑起来了，`public`、`src`、`main.tsx` 到底各管什么
- 明明只是起个项目，为什么依赖装半天、项目还起不来

这篇先不讲太多概念，只解决一件事：把 React 项目稳稳跑起来，并知道这套骨架为什么这么搭。

## 现在起 React 项目，默认优先 Vite

老教程里最常见的是 `create-react-app`。它不是不能用，但今天再新起项目，`Vite` 更顺手。

原因很简单：

- 启动快
- 热更新快
- 配置更贴近现在的前端工程习惯

直接创建项目：

```bash
npm create vite@latest
```

如果想一步到位指定项目名和模板：

```bash
npm create vite@latest hello-react -- --template react-ts
```

然后安装依赖并启动：

```bash
cd hello-react
npm install
npm run dev
```

如果只是想了解历史，当然也可以知道 `create-react-app` 是怎么起项目的：

```bash
npm i -g create-react-app
create-react-app hello-react
```

但站在今天的读者视角，先把 `Vite` 当默认答案更实用。

## 样式初始化最好一开始就做

很多人项目一跑起来就开始写页面，后面越写越觉得间距别扭、字体别扭、列表也别扭。

原因通常不是代码有问题，而是浏览器默认样式没清。

安装：

```bash
npm install reset-css
```

在入口文件里引入：

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'reset-css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

这一步看起来小，实际很值。它相当于先把画布擦干净，后面写组件时不容易被浏览器默认样式偷袭。

## 先看懂项目结构，再写页面

一个最常见的 React 项目，通常长这样：

```text
hello-react
├── public
├── src
│   ├── App.tsx
│   ├── main.tsx
│   └── assets
├── index.html
├── package.json
└── vite.config.ts
```

这里最重要的不是背下来，而是知道职责：

- `public`：不需要打包处理的静态资源
- `src`：业务代码主战场
- `main.tsx`：真正的前端入口
- `App.tsx`：应用根组件
- `index.html`：宿主页，React 最后会挂到这里

## `index.html` 到底在干什么

很多新手看到 `index.html` 会以为这就是普通 HTML 页面，后面 React 代码只是“往里加点东西”。

其实不完全是。

React 项目里，它更像一个宿主容器。最关键的通常就是这两行：

```html
<div id="root"></div>
<script type="module" src="/src/main.tsx"></script>
```

可以这样理解：

- `#root` 是 React 的挂载点
- `main.tsx` 会把组件树整体挂进去

这和早期 jQuery 那种“先找 DOM，再手动一块块改”不一样。React 更像先声明一棵组件树，再统一交给渲染器处理。

## 最小可运行版本，先别写复杂

项目刚起来时，最稳的做法不是马上接路由、接状态管理、接接口，而是先确认最小页面能稳定跑通。

`App.tsx` 可以先写成这样：

```tsx
export default function App() {
  return (
    <main>
      <h1>Hello React</h1>
      <p>项目已经成功跑起来了。</p>
    </main>
  )
}
```

这一步的意义很实际：

- 确认脚手架没问题
- 确认入口文件没问题
- 确认渲染链路没问题

如果这里都还没跑通，后面加再多东西，只会把排查难度越堆越高。

## 一个最早期的 React Demo 长什么样

如果从“先看最原始的运行方式”来理解 React，这里这个例子很有代表性：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>hello_react</title>
</head>
<body>
  <div id="test"></div>

  <script type="text/javascript" src="../js/react.development.js"></script>
  <script type="text/javascript" src="../js/react-dom.development.js"></script>
  <script type="text/javascript" src="../js/babel.min.js"></script>

  <script type="text/babel">
    const VDOM = <h1>Hello, React</h1>
    ReactDOM.render(VDOM, document.getElementById('test'))
  </script>
</body>
</html>
```

这个例子今天不会拿来正式做项目，但它特别适合建立第一层直觉：

- `React` 负责描述视图
- `ReactDOM` 负责把视图渲染到页面
- JSX 需要被编译后才能跑

## npm 装依赖慢，先检查镜像源

很多人以为 React 项目起不来，是 React 的问题。其实更常见的是：

- 镜像源不对
- 依赖缓存脏了
- `node_modules` 已经乱了

如果需要切换 npm 源，可以用 `nrm`：

```bash
npm i -g nrm
nrm -V
nrm ls
nrm use npm
```

如果在国内开发，也可以根据实际情况切到更快的镜像。

## React 项目起不来时，排查顺序别反了

很多人一报错就开始怀疑框架，其实排查顺序应该先从环境走。

第一步，删依赖重装：

```bash
rm -rf node_modules package-lock.json
npm install
```

如果还不行，再清缓存：

```bash
npm cache clean --force
npm install
```

这个顺序背后的逻辑很简单：

- `node_modules` 像当前项目的依赖快照
- `package-lock.json` 像安装决议记录
- 缓存错、锁文件乱、镜像异常，都会让你误以为是 React 报错

## 这篇先记住这条起步顺序

真正更像生产环境的 React 起步顺序，通常是这样：

1. 用 `Vite` 创建项目
2. 先跑通最小页面
3. 清理默认样式
4. 看懂入口文件和目录结构
5. 确认镜像源和依赖安装正常
6. 再进入 JSX、组件、状态和路由

## 最后

React 项目起步，不是执行一条命令就结束了。

更关键的是三件事：

- 工程骨架是不是清楚
- 环境是不是稳定
- 出问题时知不知道先查哪里

把这三件事处理好，后面再学 JSX、组件、Hooks、路由，心里会稳很多。

