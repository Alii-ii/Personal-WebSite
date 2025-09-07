# 部署指南

## 🚀 Vercel 自动部署配置

### 1. 连接 GitHub 仓库

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 选择 "Import Git Repository"
4. 选择 `Alii-ii/Personal-WebSite` 仓库
5. 点击 "Import"

### 2. 项目配置

Vercel 会自动检测到这是一个 Next.js 项目，配置如下：

- **Framework Preset**: Next.js
- **Root Directory**: `./` (默认)
- **Build Command**: `npm run build` (自动检测)
- **Output Directory**: `.next` (自动检测)
- **Install Command**: `npm install` (自动检测)

### 3. 环境变量配置

如果需要环境变量，在 Vercel Dashboard 中设置：

1. 进入项目设置
2. 点击 "Environment Variables"
3. 添加所需的环境变量

### 4. 自动部署

配置完成后：

- ✅ **主分支部署**: 每次推送到 `main` 分支时自动部署到生产环境
- ✅ **预览部署**: 每次创建 Pull Request 时自动创建预览部署
- ✅ **分支部署**: 推送到其他分支时创建预览部署

### 5. 自定义域名

1. 在 Vercel Dashboard 中进入项目设置
2. 点击 "Domains"
3. 添加您的自定义域名
4. 按照提示配置 DNS 记录

## 🔧 GitHub Actions 配置（可选）

项目包含 GitHub Actions 工作流，用于：

- 代码质量检查
- 自动构建测试
- 与 Vercel 集成部署

### 设置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

1. 进入仓库 Settings -> Secrets and variables -> Actions
2. 添加以下 secrets：

```
VERCEL_TOKEN=your_vercel_token_here
ORG_ID=your_org_id_here
PROJECT_ID=your_project_id_here
```

### 获取 Vercel 凭据

1. **VERCEL_TOKEN**: 
   - 访问 Vercel Dashboard -> Settings -> Tokens
   - 创建新的 Token

2. **ORG_ID**:
   - 访问 Vercel Dashboard -> Settings -> General
   - 复制 Organization ID

3. **PROJECT_ID**:
   - 访问项目设置 -> General
   - 复制 Project ID

## 📊 部署状态

部署状态会在以下位置显示：

- **GitHub**: 仓库的 Actions 标签页
- **Vercel**: Vercel Dashboard 的 Deployments 页面
- **Pull Request**: 自动添加部署状态检查

## 🐛 故障排除

### 常见问题

1. **构建失败**
   - 检查 `package.json` 中的脚本配置
   - 确保所有依赖都已正确安装
   - 查看 Vercel 构建日志

2. **环境变量问题**
   - 确保在 Vercel Dashboard 中正确设置了环境变量
   - 检查环境变量名称是否正确

3. **域名配置问题**
   - 确保 DNS 记录正确配置
   - 等待 DNS 传播（可能需要 24-48 小时）

### 获取帮助

- [Vercel 文档](https://vercel.com/docs)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

---

**注意**: 首次部署可能需要几分钟时间，后续部署会更快。
