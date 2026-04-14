# Vagrant 虚拟机起步

很多人学云原生、学分布式、学中间件部署，最容易卡住的第一步不是命令，而是环境。

比如：

- 手动点虚拟机太慢
- 多台机器配置起来很容易乱
- 重装一次环境成本很高

这时候，`Vagrant` 的价值就出来了。

一句话理解：

**Vagrant 是用代码管理虚拟机环境。**

## 先确认它装好了

安装入口：

[Vagrant Downloads](https://www.vagrantup.com/downloads.html)

装完以后，先在终端里敲：

```bash
vagrant
```

如果能看到一串命令帮助，说明装成功了。这里保留的常见命令包括：

- `vagrant up`
- `vagrant halt`
- `vagrant reload`
- `vagrant destroy`
- `vagrant ssh`
- `vagrant status`

这几个基本够覆盖日常起停和排查。

## 为什么很多人会用它

它最适合这些场景：

- 想快速起一台或多台 Linux 虚拟机
- 想把环境配置写进文件，方便复现
- 想做本地集群实验，比如 K8s、K3s、分布式中间件

说直白点，它特别适合“反复搭、反复拆、还想保持一致”的环境。

## 这里的多机 Vagrantfile 很有代表性

这段配置可以直接看出它为什么适合做本地集群：

```ruby
Vagrant.configure("2") do |config|
  config.vm.box = "centos/stream9"

  nodes = {
    "k8s-master" => { :ip => "192.168.56.10", :cpus => 2, :mem => 4096 },
    "k8s-node1"  => { :ip => "192.168.56.11", :cpus => 2, :mem => 4096 },
    "k8s-node2"  => { :ip => "192.168.56.12", :cpus => 2, :mem => 4096 }
  }

  nodes.each do |name, info|
    config.vm.define name do |node|
      node.vm.hostname = name
      node.vm.network "private_network", ip: info[:ip]
      node.disksize.size = "50GB"

      node.vm.provider "virtualbox" do |vb|
        vb.name = name
        vb.memory = info[:mem]
        vb.cpus = info[:cpus]
      end
    end
  end
end
```

这个文件里最关键的点有三个：

- 一次定义多台节点
- 每台机器都有固定 IP
- CPU、内存、磁盘都能写死

这就是“环境也代码化”最直观的价值。

## 最常用的命令，先记这几条

启动：

```bash
vagrant up
```

重载配置：

```bash
vagrant reload
```

进入虚拟机：

```bash
vagrant ssh
```

停止：

```bash
vagrant halt
```

彻底销毁：

```bash
vagrant destroy -f
```

`destroy -f` 很常用，因为本地实验环境很多时候不是修，而是直接重建更快。

## 这类环境最容易踩的坑

### 1. 同步目录拖慢体验

这里专门提到 Windows 下禁用同步文件夹：

```ruby
node.vm.synced_folder ".", "/vagrant", disabled: true
```

这不是多余配置，是真能减少很多奇怪问题。

### 2. 资源给少了

如果你本地机器配置不高，却给每台虚拟机都开很大内存，最后常见结果不是“跑得更快”，而是本机先卡死。

### 3. 环境脏了还硬修

本地实验环境一旦乱了，优先考虑：

```bash
vagrant destroy -f
vagrant up
```

很多时候比一条条补救更省时间。

## 最后

Vagrant 最值钱的地方，不是“它能起虚拟机”，而是：

你可以把虚拟机环境写成一份能重复执行的配置。

这对本地实验、学习云原生、搭多机环境，非常省心。

