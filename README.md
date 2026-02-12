# 文档管理指南

**创建新文档**

1. 在 `/docs` 目录下创建文件夹和文档文件
   - 示例：创建 `/docs/test/test1.md`

2. **顶部导航栏配置**：编辑 [config.mts](docs%2F.vitepress%2Fconfig.mts)
   
3. **首页展示配置**：在 [docs/index.md](docs/index.md) 中添加文档链接
   
   - 示例链接格式：`/test/test.md`
     ```text
      - theme: alt
        text: test
        link: /test/test1 # 文件路径
   
4. **未发布文件路径**
    未发布文件放在`编辑中`目录，防止本地全文搜索引擎搜索到。
5. 个人博客访问地址 https://minedegithubhao.github.io/canbe-blog/