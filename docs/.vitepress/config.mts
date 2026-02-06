import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "canbe-blog",
  description: "canbe的个人博客",
  base: '/', // 部署基础路径
  outDir: '.vitepress/dist', // 输出目录
  cleanUrls: true, // 清理URL
  ignoreDeadLinks: true, // 忽略死链接
  
  themeConfig: {
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '示例', link: '/markdown-examples' }
    ],

    // 侧边栏
    sidebar: [
      {
        text: '示例', // 一级菜单
        items: [  // 二级菜单
          { text: 'Markdown示例', link: '/markdown-examples' },
          { text: 'API示例', link: '/api-examples' },
          { text: '学习', link: '/学习' }
        ]
      }
    ],

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/minedegithubhao/canbe-blog' }
    ]
  },
  
  // 构建配置
  build: {
    rollupOptions: {
      external: []
    }
  }
})