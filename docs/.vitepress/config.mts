import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/canbe-blog/', // 根据GitHub Pages URL设置基础路径
  title: "canbe-blog",
  description: "canbe的个人博客",
  cleanUrls: true, // 清理URL，移除.html后缀
  ignoreDeadLinks: true, // 忽略死链接警告
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
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  },
  
  // 构建配置
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js'
      }
    }
  }
})