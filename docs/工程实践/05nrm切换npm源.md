# nrm 切换 npm 源

很多人装前端依赖慢、装不上、偶发超时，第一反应是：

“npm 又抽风了。”

其实很多时候不是 npm 自己坏了，而是当前镜像源不合适。这种场景下，`nrm` 很实用。

它的作用很简单：

**快速切换 npm 源。**

## 先装上

```bash
npm i -g nrm
```

装完先验证：

```bash
nrm -V
```

这里这里特别提醒了一点：

- `-V` 这里是大写，不是小写

## 看看现在有哪些源

```bash
nrm ls
```

这里实际列出来的是这些常见源：

```text
  npm ---------- https://registry.npmjs.org/
  yarn --------- https://registry.yarnpkg.com/
  tencent ------ https://mirrors.tencent.com/npm/
  cnpm --------- https://r.cnpmjs.org/
* taobao ------- https://registry.npmmirror.com/
  npmMirror ---- https://skimdb.npmjs.com/registry/
  huawei ------- https://repo.huaweicloud.com/repository/
```

看懂这个输出就行：

- 带 `*` 的是当前正在使用的源
- 其他的是可切换候选项

## 切换源怎么做

比如切到官方 npm：

```bash
nrm use npm
```

切完如果出现类似下面的提示，说明已经生效：

```text
SUCCESS  The registry has been changed to 'npm'.
```

## 什么时候该切源

这几个场景最常见：

- `npm install` 特别慢
- 某些包死活拉不下来
- 当前网络对某个源不稳定

但有一点要注意：

切源能解决很多“下载层”的问题，解决不了所有依赖问题。比如锁文件冲突、缓存脏了、Node 版本不对，这些还得另外排查。

## 最后

如果只记一句话，可以记这个：

依赖装不动，先别急着骂框架，先看当前 npm 源对不对。

而 `nrm`，就是那个最适合拿来快速切换和验证的小工具。

