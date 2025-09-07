# Alii's Personal Website

一个基于 Next.js + Tailwind CSS 构建的个人网站，支持多语言切换和主题切换功能。

## ✨ 功能特性

- 🌍 **多语言支持**：支持中文/英文切换，智能检测用户浏览器语言偏好
- 🎨 **主题切换**：支持明暗主题切换
- 📱 **响应式设计**：适配各种设备尺寸
- ⚡ **现代化技术栈**：Next.js 14 + Tailwind CSS + React
- 🚀 **自动部署**：GitHub + Vercel 自动部署

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **语言**: JavaScript/JSX
- **部署**: Vercel
- **版本控制**: Git + GitHub

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 或者使用其他包管理器
yarn dev
pnpm dev
bun dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看效果。

### 构建生产版本

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 🌍 多语言功能

项目支持中英文切换：

- **自动检测**：首次访问时自动检测用户浏览器语言偏好
- **手动切换**：点击语言切换按钮或使用快捷键 `Shift + L`
- **持久化存储**：用户的语言选择会保存到本地存储

## 🎨 主题功能

- **明暗主题**：支持明暗主题切换
- **系统偏好**：自动检测系统主题偏好
- **平滑过渡**：主题切换带有平滑的过渡动画

## 📁 项目结构

```
src/
├── app/                 # Next.js App Router 页面
├── components/          # React 组件
│   ├── footer.jsx      # 页脚组件（多语言支持）
│   ├── LanguageToggle.jsx  # 语言切换组件
│   └── ThemeToggle.jsx     # 主题切换组件
├── contexts/           # React Context
│   └── LanguageContext.js  # 语言上下文
├── hooks/              # 自定义 Hooks
└── lib/                # 工具函数
```

## 🚀 部署

### Vercel 自动部署

项目已配置 Vercel 自动部署：

1. **连接 GitHub**：在 [Vercel Dashboard](https://vercel.com/dashboard) 中导入 GitHub 仓库
2. **自动部署**：每次推送到 `main` 分支时自动触发部署
3. **预览部署**：Pull Request 会自动创建预览部署

### 部署配置

项目包含以下部署配置文件：

- `vercel.json` - Vercel 部署配置
- `.gitignore` - Git 忽略文件配置

## 📝 开发说明

### 添加新语言

1. 在 `src/contexts/LanguageContext.js` 中添加新的翻译数据
2. 更新语言检测逻辑
3. 在 `LanguageToggle.jsx` 中添加新的语言选项

### 添加新组件

1. 在 `src/components/` 目录下创建新组件
2. 使用 `useLanguage` Hook 获取翻译函数
3. 使用 `t('key')` 函数获取翻译文本

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**Alii.Wong** - 2025
