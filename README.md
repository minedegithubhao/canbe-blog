# VitePress 静态网站搭建指南
## 环境准备与项目初始化
### 系统要求
- Node.js v22.0.0 或更高版本
- 包管理器：npm、yarn 或 pnpm
### 创建项目
```sh
# 创建项目目录
mkdir my-vitepress-site &&cd my-vitepress-site

# 初始化项目并安装 VitePress
npmadd -D vitepress@next

# 初始化 VitePress 配置
npx vitepress init
```
### VitePress 初始化配置详解
```sh
┌  Welcome to VitePress!
│
◇  Where should VitePress initialize the config?  # 配置目录 配置文件所在目录
│  ./docs
│
◇  Where should VitePress look for your markdown files? # 文档目录 markdown 文件所在目录
│  ./docs
│
◇  Site title: # 站点标题
│  My Awesome Project
│
◇  Site description: # 站点描述
│  A VitePress Site
│
◇  Theme: # 主题
│  Default Theme
│
◇  Use TypeScript for config and theme files? # 是否使用 TypeScript
│  Yes
│
◇  Add VitePress npm scripts to package.json? # 是否添加npm脚本 在 package.json 中添加命令脚本
│  Yes
│
◇  Add a prefix for VitePress npm scripts? # 是否添加前缀
│  Yes
│
◇  Prefix for VitePress npm scripts: # 前缀
│  docs
│
└  Done! Now run pnpm run docs:dev and start writing.
```
### 初始化后的项目结构
```text
.
├─ docs
│  ├─ .vitepress
│  │  └─ config.mts     # 核心配置文件 (TypeScript格式)
│  ├─ api-examples.md
│  ├─ markdown-examples.md
│  └─ index.md          # 首页内容
└─ package.json         # 包含 VitePress 相关脚本
```
