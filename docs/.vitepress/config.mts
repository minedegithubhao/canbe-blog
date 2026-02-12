import { defineConfig } from "vitepress";

export default defineConfig({
  title: "曹晓东个人博客", // 网站标题
  base: "/canbe-blog/", // 根据GitHub Pages URL设置基础路径
  cleanUrls: true, // 清理URL，移除.html后缀
  ignoreDeadLinks: true, // 忽略死链接警告
  
  // 添加Vite配置来处理资源路径
  vite: {
    resolve: {
      // 配置别名来处理特殊字符路径
      alias: {
        // 为包含特殊字符的路径创建别名
      }
    },
    build: {
      rollupOptions: {
        external: [], // 确保所有本地资源都被处理
        output: {
          // 保持资源文件名不变，避免编码问题
          assetFileNames: (assetInfo) => {
            // 对于图片资源，保持原始文件名
            if (assetInfo.name && /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(assetInfo.name)) {
              return 'assets/[name].[ext]';
            }
            return 'assets/[name].[hash].[ext]';
          }
        }
      }
    }
  },

  themeConfig: {
    // 顶部导航栏
    nav: [
      { text: "首页", link: "/" },
      { text: "个人简历", link: "/个人简历/个人简历" },
      { text: "大模型", link: "/大模型/01大模型-应用开发体系" }, // 大模型导航 及 对应连接
    ],

    // 侧边栏
    sidebar: {
      '/个人简历/': [
        {
          text: "简历",
          items: [
            { text: "个人简历", link: "/个人简历/个人简历" }
          ]
        }
      ],
      '/大模型/': [ // 点击大模型进入该目录
        {
          text: "大模型学习笔记", // 知识块名称
          items: [
            { text: "01 大模型-应用开发体系", link: "/大模型/01大模型-应用开发体系" }, // text：子项名称(侧边栏展示)，link：文件路径
            { text: "02 提示词工程", link: "/大模型/02提示词工程" },
            { text: "03 提升文本生成质量的方法论", link: "/大模型/03提升文本生成质量的方法论" },
            { text: "04 语义搜索与RAG", link: "/大模型/04语义搜索与RAG" },
            { text: "05 多模态LLM", link: "/大模型/05多模态LLM" },
            { text: "06 训练和微调", link: "/大模型/06训练和微调" }
          ]
        }
      ]
    },

    // 大纲配置 - 显示所有级别的标题
    outline: {
      level: 'deep', // 显示所有级别的标题(h2, h3, h4, h5, h6)
      label: '目录'   // 大纲标题文本
    },

    // 社交链接
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