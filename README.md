# 文档管理指南

**创建新文档**

1. 在 `/docs` 目录下创建文件夹和文档文件
   - 示例：创建 `/docs/test/test1.md`

2. **顶部导航栏配置**：编辑 [docs/.vitepress/const.js](docs/.vitepress/const.js)
   - 示例：
      ```json
      {
         text: "test", // 导航栏标题
         path: "test", // 文件夹名称
      }

3. **首页展示配置**：在 [docs/index.md](docs/index.md) 中添加文档链接
   
   - 示例链接格式：`/test/test.md`
     ```text
      - theme: alt
        text: test
        link: /test/test1 # 文件路径
   
4. **未发布文件路径**
    未发布文件放在`/编辑中`目录，防止本地全文搜索引擎搜索到。