#!/bin/bash

# 构建脚本 - 用于GitHub Actions环境
set -e  # 遇到错误立即退出

echo "开始构建过程..."

# 检查Node.js版本
echo "Node.js版本: $(node --version)"
echo "npm版本: $(npm --version)"

# 安装依赖
echo "安装依赖..."
npm install

# 检查vitepress是否正确安装
echo "检查vitepress..."
if ! command -v vitepress &> /dev/null; then
    echo "vitepress未找到，尝试全局安装..."
    npm install -g vitepress
fi

# 执行构建
echo "执行构建..."
npm run docs:build

echo "构建完成!"