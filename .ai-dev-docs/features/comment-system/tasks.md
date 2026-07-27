# 任务清单 - Comment System（评论系统）

## 初始任务 - 2025-07-27

### 数据层 Tasks

- [x] 1. Supabase 数据库建表与安全策略
    - [x] 1.1 创建 `site_profiles` 表（id, nickname, avatar_seed, created_at, updated_at）
    - [x] 1.2 创建 `site_comments` 表（id, user_id, target_path, content, created_at）
    - [x] 1.3 创建 `update_updated_at` 触发器函数
    - [x] 1.4 为 `site_comments` 表创建索引（target, user, created_at）
    - [x] 1.5 为 `site_profiles` 表配置 RLS 策略（公开可读、仅自己可写）
    - [x] 1.6 为 `site_comments` 表配置 RLS 策略（公开可读、已认证可写、仅自己可删）
    - [x] 1.7 在 Supabase Dashboard 开启 Anonymous Sign-In
    - [ ] 1.8 为 `site_profiles.nickname` 添加 UNIQUE 约束
    - [ ] 1.9 在 Supabase Dashboard 创建站长邮箱账号（alii.wong@foxmail.com）
    - [ ] 1.10 为站长账号预置 profile（nickname: 'Alii'）

### Hook 层 Tasks

- [x] 2. Auth Hook 与 Context
    - [x] 2.1 创建 `src/hooks/useAuth.js`（signInAnonymously + profile CRUD）
    - [x] 2.2 创建 `src/contexts/AuthContext.js`（全局 Provider + 隐藏快捷键）
    - [x] 2.3 创建 `src/components/ClientProviders.jsx`（Server→Client 桥接）
    - [x] 2.4 修改 `src/app/layout.js`（包裹 ClientProviders）
    - [x] 2.5 增加邮箱登录方法 `signInWithEmail()`（站长专用）
    - [x] 2.6 增加昵称唯一性校验（signIn + updateNickname）
    - [x] 2.7 隐藏快捷键：3×Cmd 登录 + 3×Shift 登出

- [x] 3. Comments Hook
    - [x] 3.1 创建 `src/hooks/useComments.js`（查询评论列表、新增、删除）
    - [x] 3.2 评论查询 JOIN profiles 表获取昵称信息
    - [x] 3.3 客户端限流逻辑（同一用户 1 分钟内最多 5 条）
    - [x] 3.4 乐观更新（新增/删除即时反映到列表）

### 组件层 Tasks（等 Figma 设计稿）

- [ ] 4. 评论 UI 组件
    - [ ] 4.1 创建 `src/components/comments/NicknameDialog.jsx`（昵称输入弹窗）
    - [ ] 4.2 创建 `src/components/comments/CommentItem.jsx`（单条评论展示）
    - [ ] 4.3 创建 `src/components/comments/CommentForm.jsx`（评论输入框 + 提交）
    - [ ] 4.4 创建 `src/components/comments/CommentList.jsx`（评论列表 + 空态）
    - [ ] 4.5 创建 `src/components/comments/CommentSection.jsx`（评论区容器）

### 页面集成 Tasks（等 Figma 设计稿）

- [ ] 5. Gallery 页面集成（作品集维度评论）
    - [ ] 5.1 修改 `src/app/gallery/page.jsx`，在 Masonry 下方插入 CommentSection
    - [ ] 5.2 传入 `targetPath="gallery"`
    - [ ] 5.3 调整页面布局，评论区与瀑布流内容区宽度一致

- [ ] 6. 单作品评论集成（放大视图维度评论）
    - [ ] 6.1 修改 `src/effects/Masonry.jsx`，在图片放大 overlay 中增加评论面板
    - [ ] 6.2 传入 `targetPath={`gallery/${slug}`}`（slug 为文件名不含扩展名）
    - [ ] 6.3 评论面板布局：放大图右侧或底部，不遮挡作品主体
    - [ ] 6.4 仅 Web 端（`isWebDevice`）展示，移动端不渲染

### 验证 Tasks

- [x] 7. 逻辑层验证
    - [x] 7.1 本地 `npm run build` 静态导出验证（确认无 SSR 依赖报错）
    - [x] 7.2 E2E 自测：匿名登录 → 创建 profile → 发评论 → 读评论 → 删评论
    - [x] 7.3 RLS 安全验证：确认 auth.uid() 鉴权生效
- [ ] 8. UI 验证（等组件实现后）
    - [ ] 8.1 端到端流程验证：首次访问 → 输入昵称 → 发评论 → 刷新恢复身份
    - [ ] 8.2 昵称查重验证：输入已存在昵称应提示"该昵称已被使用"
    - [ ] 8.3 暗色主题下评论区视觉检查
    - [ ] 8.4 移动端 Gallery 评论区布局检查
