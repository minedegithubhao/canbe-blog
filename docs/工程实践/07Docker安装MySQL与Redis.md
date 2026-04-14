# Docker 安装 MySQL 与 Redis

很多人第一次用 Docker 装数据库，会觉得特别简单：

“不就是 `docker run` 一下吗？”

真正的坑，通常出在第二步：

- 容器起了又退出
- 配置目录挂载不对
- 数据没持久化
- 重启后配置丢了

所以这篇不讲太虚的，只讲最常见的两件事：

- 用 Docker 起 MySQL
- 用 Docker 起 Redis

## 先说 MySQL

### 1. 拉镜像

这里用的是指定版本：

```bash
sudo docker pull mysql:8.0.43
```

指定版本的好处很直接：

- 可复现
- 少踩“最新版本突然行为变化”的坑

### 2. 启动容器

```bash
sudo docker run -p 3306:3306 --name mysql \
-v /mydata/mysql/log:/var/log/mysql \
-v /mydata/mysql/data:/var/lib/mysql \
-v /mydata/mysql/conf:/etc/mysql \
-e MYSQL_ROOT_PASSWORD=root \
-d mysql:8.0.43 --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
```

这里最重要的参数要看懂：

- `-p 3306:3306`：把容器端口映射到宿主机
- `-v`：挂载日志、数据、配置目录
- `-e MYSQL_ROOT_PASSWORD=root`：设置 root 初始密码
- `--character-set-server=utf8mb4`：避免字符集问题

### 3. 如果启动失败，先看状态和日志

先看容器状态：

```bash
sudo docker ps -a
```

如果状态是 `Exited`，别猜，直接看日志：

```bash
sudo docker logs mysql
```

这里给过一个非常典型的报错：

```text
mysqld: Can't read dir of '/etc/mysql/conf.d/' (OS errno 2 - No such file or directory)
```

这个报错的本质是：

挂载了 `/etc/mysql`，但容器内部需要的 `conf.d` 子目录不存在。

### 4. 这个坑怎么补

这里的处理顺序很实用：

```bash
mkdir -p /mydata/mysql/conf/conf.d
chmod -R 755 /mydata/mysql/conf
```

处理完再重启容器，通常就顺了。

## 再说 Redis

### 1. 先准备配置文件

这里是很多人会漏掉的一步。

这里特别提醒：

如果不先创建 `redis.conf`，Docker 很可能会把它当目录处理。

所以先做这两步：

```bash
mkdir -p /mydata/redis/conf
touch /mydata/redis/conf/redis.conf
```

### 2. 启动 Redis

```bash
docker run -p 6379:6379 --name redis \
-v /mydata/redis/data:/data \
-v /mydata/redis/conf/redis.conf:/etc/redis/redis.conf \
-d redis redis-server /etc/redis/redis.conf
```

这条命令的重点是：

- 数据目录单独挂出来
- 配置文件单独挂出来
- 启动时显式指定配置文件

### 3. 进入容器测试

```bash
docker exec -it redis redis-cli
```

如果能正常进入并执行命令，说明基本启动成功了。

### 4. 开启持久化

这里给的配置也很直接：

```conf
appendonly yes
```

改完之后重启 Redis。

### 5. 设置开机自动重启

```bash
sudo docker update redis --restart=always
```

这一步很适合本地长期跑的环境，不然主机一重启，服务就得手动再拉。

## 这两类容器最容易踩的坑

### 1. 配置文件路径挂错

这个是最常见的。尤其是 MySQL 和 Redis 都很依赖挂载路径的准确性。

### 2. 只启动，不看日志

容器退出时，日志才是第一现场。不要只看“没起来”，要看“为什么没起来”。

### 3. 数据没挂出来

如果没做数据卷挂载，容器一删，数据也跟着没了。

## 最后

Docker 装 MySQL 和 Redis，真正的重点不是那条 `run` 命令，而是三件事：

- 目录挂载对不对
- 配置文件在不在
- 容器失败时会不会先看日志

把这三件事抓住，Docker 跑数据库就没那么玄了。

