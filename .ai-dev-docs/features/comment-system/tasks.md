# 任务清单 - Comment System（评论系统）

## 初始任务 - 2025-07-27

### 数据层 Tasks

- [ ] 1. Supabase 数据库建表与安全策略
    - [ ] 1.1 在 Supabase Dashboard 创建 `site_profiles` 表（id, nickname, avatar_seed, created_at, updated_at）
    - [ ] 1.2 在 Supabase Dashboard 创建 `site_comments` 表（id, user_id, target_path, content, created_at）
    - [ ] 1.3 创建 `update_updated_at` 触发器函数
    - [ ] 1.4 为 `site_comments` 表创建索引（target, user, created_at）
    - [ ] 1.5 为 `site_profiles` 表配置 RLS 策略（公开可读、仅自己可写）
    - [ ] 1.6 为 `site_comments` 表配置 RLS 策略（公开可读、已认证可写、仅自己可删）
    - [ ] 1.7 在 Supabase Dashboard 开启 Anonymous Sign-In（Auth > Settings > Anonymous Sign-Ins）

### Hook 层 Tasks

- [ ] 2. Auth Hook 与 Context
    - [ ] 2.1 创建 `src/hooks/useAuth.js`（signInAnonymously + profile CRUD）
    - [ ] 2.2 创建 `src/contexts/AuthContext.js`（全局 Provider + 自动恢复 session）
    - [ ] 2.3 修改 `src/app/layout.js`（包裹 AuthProvider）

- [ ] 3. Comments Hook
    - [ ] 3.1 创建 `src/hooks/useComments.js`（查询评论列表、新增、删除）
    - [ ] 3.2 评论查询 JOIN profiles 表获取昵称和头像信息
    - [ ] 3.3 客户端限流逻辑（同一用户 1 分钟内最多 5 条）

### 组件层 Tasks

- [ ] 4. 基础评论组件
    - [ ] 4.1 创建 `src/components/comments/Avatar.jsx`（基于 seed 的确定性头像）
    - [ ] 4.2 创建 `src/components/comments/NicknameDialog.jsx`（昵称输入弹窗）
    - [ ] 4.3 创建 `src/components/comments/CommentItem.jsx`（单条评论展示）
    - [ ] 4.4 创建 `src/components/comments/CommentForm.jsx`（评论输入框 + 提交）
    - [ ] 4.5 创建 `src/components/comments/CommentList.jsx`（评论列表 + 空态）
    - [ ] 4.6 创建 `src/components/comments/CommentSection.jsx`（评论区容器）

### 页面集成 Tasks

- [ ] 5. Gallery 页面集成（作品集维度评论）
    - [ ] 5.1 修改 `src/app/gallery/page.jsx`，在 Masonry 下方、Footer 之前插入 CommentSection
    - [ ] 5.2 传入 `targetPath="gallery"`
    - [ ] 5.3 调整页面布局，评论区与瀑布流内容区宽度一致

- [ ] 6. 单作品评论集成（放大视图维度评论）
    - [ ] 6.1 修改 `src/effects/Masonry.jsx`，在图片放大 overlay 中增加评论面板
    - [ ] 6.2 传入 `targetPath={`gallery/${slug}`}`（slug 为文件名不含扩展名）
    - [ ] 6.3 评论面板布局：放大图右侧或底部，不遮挡作品主体
    - [ ] 6.4 仅 Web 端（`isWebDevice`）展示，移动端不渲染

### 验证 Tasks

- [ ] 7. 功能验证与收尾
    - [ ] 7.1 本地 `npm run build` 静态导出验证（确认无 SSR 依赖报错）
    - [ ] 7.2 端到端流程验证：首次访问 → 输入昵称 → 发评论 → 刷新恢复身份 → 看到评论
    - [ ] 7.3 RLS 安全验证：尝试用 Supabase Client 删除他人评论（应被拒绝）
    - [ ] 7.4 暗色主题下评论区视觉检查
