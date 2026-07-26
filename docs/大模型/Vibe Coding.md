# Vibe Codeing

## Vibe Coding VS 古法编程 

| 维度     | 传统编程               | VibeCoding               |
| -------- | ---------------------- | ------------------------ |
| 入门门槛 | 需系统学习语言、框架   | 能清晰表达需求即可       |
| 开发速度 | 小时/天级              | 分钟级                   |
| 修改成本 | 需要定位代码、重构     | 修改自然语言描述重新生成 |
| 思维焦点 | “怎么做”               | “要什么效果”             |
| 错误类型 | 语法、逻辑、运行时错误 | 意图传达不清导致效果偏差 |
| 适用阶段 | 生产级系统、性能调优   | 创意验证、原型、小工具   |

## 附录

### 修复 PowerShell 脚本运行禁止问题

遇到如下问题：

```sh
PS C:\Users\caoyu> npm -v
npm : 无法加载文件 D:\dev\sdk\nodejs\npm.ps1, 因为在此系统上禁止运行脚本。有关详细信息, 请参阅 https://go.microsoft.com/fwlink/?LinkID=135170 中的 about_Execution_Policies。
所在位置 行:1 字符: 1
+ npm -v
+ ~~~
    + CategoryInfo          : SecurityError: (:) [], PSSecurityException
    + FullyQualifiedErrorId : UnauthorizedAccess
```

打开PowerShell 执行

```sh
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

