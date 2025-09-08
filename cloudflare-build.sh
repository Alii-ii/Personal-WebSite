#!/bin/bash

# Cloudflare Pages 构建脚本
echo "开始Cloudflare Pages构建..."

# 设置环境变量
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# 安装依赖
echo "安装依赖..."
npm ci --only=production

# 构建项目
echo "构建Next.js项目..."
npm run build

# 检查构建结果
if [ -d "out" ]; then
    echo "构建成功！输出目录: out/"
    ls -la out/
else
    echo "构建失败！未找到输出目录"
    exit 1
fi

echo "Cloudflare Pages构建完成！"
