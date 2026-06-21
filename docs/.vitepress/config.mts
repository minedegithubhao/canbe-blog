import { defineConfig } from "vitepress";

export default defineConfig({
  title: "乘风个人博客",
  base: "/canbe-blog/",
  cleanUrls: true,
  ignoreDeadLinks: true,

  vite: {
    build: {
      rollupOptions: {
        external: [],
        output: {
          assetFileNames: (assetInfo) => {
            if (
              assetInfo.name &&
              /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(assetInfo.name)
            ) {
              return "assets/[name].[ext]";
            }
            return "assets/[name].[hash].[ext]";
          },
        },
      },
    },
  },

  themeConfig: {
    nav: [
      { text: "首页", link: "/" },
      { text: "AI 专栏", link: "/大模型/01大模型应用开发的起点" },
      { text: "后端", link: "/后端/" },
      { text: "前端", link: "/前端/" },
      { text: "工程实践", link: "/工程实践/" },
      { text: "面试专栏", link: "/面试专栏/从五大角度完成对项目的理解" },
      { text: "个人简历", link: "/个人简历/个人简历" },
    ],

    sidebar: {
      "/个人简历/": [
        {
          text: "简历",
          items: [{ text: "个人简历", link: "/个人简历/个人简历" }],
        },
      ],
      "/后端/": [
        {
          text: "后端",
          items: [{ text: "栏目导读", link: "/后端/" }],
        },
        {
          text: "Spring",
          items: [
            {
              text: "01 Spring Boot 配置与 Bean 管理",
              link: "/后端/01SpringBoot配置与Bean管理",
            },
          ],
        },
        {
          text: "SQL",
          items: [
            {
              text: "02 SQL 优化与执行计划",
              link: "/后端/02SQL优化与执行计划",
            },
          ],
        },
        {
          text: "其它",
          items: [
            { text: "栏目导读", link: "/后端/" },
            {
              text: "03 JWT 权限系统最小闭环",
              link: "/后端/03JWT权限系统最小闭环",
            },
          ],
        },
      ],
      "/前端/": [
        {
          text: "前端",
          items: [{ text: "栏目导读", link: "/前端/" }],
        },
        {
          text: "React",
          items: [
            {
              text: "02 React 项目起步",
              link: "/前端/02React项目怎么起步",
            },
            {
              text: "03 React JSX 与组件",
              link: "/前端/03ReactJSX与组件",
            },
            {
              text: "04 React state、props、refs 与表单",
              link: "/前端/04ReactStatePropsRefs与表单",
            },
            {
              text: "05 React Hooks 与组件进阶",
              link: "/前端/05ReactHooks与组件进阶",
            },
            {
              text: "06 React Router 路由实战",
              link: "/前端/06ReactRouter路由实战",
            },
            {
              text: "07 React Redux 入门",
              link: "/前端/07ReactRedux入门",
            },
          ],
        },
        {
          text: "Vue",
          items: [
            {
              text: "01 Vue3基础",
              link: "/前端/01Vue3基础",
            },
            {
              text: "08 Vue3后台项目实战",
              link: "/前端/08Vue3后台项目实战",
            },
          ],
        },
      ],
      "/工程实践/": [
        {
          text: "工程实践",
          items: [
            { text: "栏目导读", link: "/工程实践/" },
            {
              text: "01 Linux 常用命令",
              link: "/工程实践/01Linux常用命令",
            },
            {
              text: "02 开发环境安装与版本管理：SDKMAN、NVM、pnpm 一次讲清",
              link: "/工程实践/02开发环境安装与版本管理",
            },
            {
              text: "03 IDEA 修改项目名称",
              link: "/工程实践/03IDEA修改项目名称",
            },
            {
              text: "04 开发环境高频报错排查",
              link: "/工程实践/04开发环境高频报错排查",
            },
            {
              text: "05 nrm 切换 npm 源",
              link: "/工程实践/05nrm切换npm源",
            },
            {
              text: "06 Vagrant 虚拟机起步",
              link: "/工程实践/06Vagrant虚拟机起步",
            },
            {
              text: "07 Docker 安装 MySQL 与 Redis",
              link: "/工程实践/07Docker安装MySQL与Redis",
            },
            {
              text: "08 K3s 本地集群搭建",
              link: "/工程实践/08K3s本地集群搭建",
            },
          ],
        },
      ],
      "/面试专栏/": [
        {
          text: "面试专栏",
          items: [
            {
              text: "从五大角度完成对项目的理解",
              link: "/面试专栏/从五大角度完成对项目的理解.md",
            },
            {
              text: "五大面试答题提示词",
              link: "/面试专栏/五大面试答题提示词.md",
            },
            {
              text: "项目自述 面试官深挖提问侧重点+高频考题",
              link: "/面试专栏/项目自述 面试官深挖提问侧重点+高频考题.md",
            }
          ]
        }
      ],
      "/大模型/": [
        {
          text: "AI 专栏",
          items: [
            {
              text: "01 大模型应用开发的起点",
              link: "/大模型/01大模型应用开发的起点",
            },
            { text: "02 提示词工程", link: "/大模型/02提示词工程" },
            {
              text: "03 提升文本生成质量的方法论",
              link: "/大模型/03提升文本生成质量的方法论",
            },
            { text: "04 语义搜索与 RAG", link: "/大模型/04语义搜索与RAG" },
            { text: "05 多模态 LLM", link: "/大模型/05多模态LLM" },
            { text: "06 训练和微调", link: "/大模型/06训练和微调" },
            { text: "07 吴恩达谈 Agent", link: "/大模型/07吴恩达谈Agent" },
          ],
        },
        {
          text: "RAG核心技术",
          items: [
            // {
            //   text: "栏目导读",
            //   link: "/大模型/langchain/index.md",
            // },
            {
              text: "API_KEY配置",
              link: "/大模型/langchain/API_KEY环境变量配置.md",
            },
            {
              text: "langchain生态系统",
              link: "/大模型/langchain/langchain生态系统.md",
            },
            {
              text: "Milvus向量数据库",
              link: "/大模型/langchain/Milvus向量数据库.md",
            },
          ],
        },
        {
          text: "FastAPI",
          items: [
            
            {
              text: "FastAPI基础",
              link: "/大模型/FastAPI/FastAPI基础.md",
            },
            {
              text: "企业级FastAPI项目",
              link: "/大模型/FastAPI/企业级FastAPI项目.md",
            },
          ],
        },
      ],
    },

    outline: {
      level: "deep",
      label: "目录",
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/minedegithubhao" },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2018-present 曹晓东",
    },

    search: {
      provider: "local",
    },
  },
});
