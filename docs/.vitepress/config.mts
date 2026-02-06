import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/canbe-blog/", // 根据GitHub Pages URL设置基础路径
  // title: "canbe",
  description: "canbe的个人博客",
  cleanUrls: true, // 清理URL，移除.html后缀
  ignoreDeadLinks: true, // 忽略死链接警告
  themeConfig: {
    // 导航栏
    nav: [
      { text: "首页", link: "/" },
      { text: "大模型", link: "/大模型-应用开发体系" },
    ],

    // 侧边栏
    sidebar: [
      {
        text: "大模型", // 一级菜单
        items: [
          // 二级菜单
          { text: "应用开发体系", link: "/大模型-应用开发体系" },
        ],
      },
    ],

    // 社交链接
    socialLinks: [
      { icon: "github", link: "https://github.com/minedegithubhao" },
    ],
  },
});
