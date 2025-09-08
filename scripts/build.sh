#!/bin/bash

# 构建脚本 - 用于Vercel部署
echo "开始构建..."

# 检查Git是否可用
if command -v git &> /dev/null; then
    echo "Git可用，更新日期..."
    node scripts/get-last-commit-date.js
else
    echo "Git不可用，跳过日期更新"
fi

# 执行构建
echo "执行Next.js构建..."
npm run build

echo "构建完成"
