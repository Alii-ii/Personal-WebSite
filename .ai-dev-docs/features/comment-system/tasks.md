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
    - [x] 1.8 为 `site_profiles.nickname` 添加 UNIQUE 约束
    - [x] 1.9 在 Supabase Dashboard 创建站长邮箱账号（alii.wong@foxmail.com）
    - [x] 1.10 为站长账号预置 profile（nickname: 'Alii'）

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

---

## 迭代 2 任务 - 2026-08-05

### L3 Frame 评论抽屉 Tasks

- [x] 9. 按 Figma 实现嵌入式评论抽屉
    - [x] 9.1 主页面与 360px 评论区使用横向 flex 同级布局
    - [x] 9.2 主页面圆角、投影和点阵背景边界
    - [x] 9.3 舞台、Frame、轨道和 Footer 按实际容器宽度响应
- [x] 10. Frame 级评论与两级回复
    - [x] 10.1 根评论按 Project slug + Frame ID 存储和查询
    - [x] 10.2 通过 target_path 编码 parentId/replyToId
    - [x] 10.3 二次回复保持在第二级，不递归生成第三级
    - [x] 10.4 Frame 切换时刷新数据并清理旧回复目标
- [x] 11. 评论输入与身份
    - [x] 11.1 新增与 AI Chat 隔离的 CommentComposer
    - [x] 11.2 未登录输入框原位昵称模式，无遮罩弹窗
    - [x] 11.3 IME、Enter 发送、Shift+Enter 换行
    - [x] 11.4 textarea 单行起始、自动增高、最大 50vh
    - [x] 11.5 Composer 正常流末尾 + 内容溢出时 sticky bottom
- [x] 12. 评论项交互
    - [x] 12.1 相对时间与操作按钮原位替换且不占位
    - [x] 12.2 回复数、真实点赞总量、当前用户点赞状态、昵称快捷回复
    - [x] 12.3 User ID 与回复目标 ID token 色和 hover 动效
    - [x] 12.4 评论作者删除按钮、RLS 鉴权与孤儿回复兜底
- [x] 13. 导航状态与国际化
    - [x] 13.1 Frame/Tab/Project 切换保持评论区收展状态
    - [x] 13.2 评论静态文本、错误和 aria-label 中英文
    - [x] 13.3 评论数为 0 时隐藏数字且不展示空态文案
    - [x] 13.4 评论区隐藏滚动条并保留滚动能力
- [x] 14. 验证与交付
    - [x] 14.1 用户本地 happy path 验证通过 ✅ 2026-08-05
    - [x] 14.2 Agent lint diagnostics 与 `git diff --check` 通过 ✅ 2026-08-05
    - [x] 14.3 `npx next build` 静态导出通过 ✅ 2026-08-05
    - [x] 14.4 工程兜底 review 并修复 DOM 嵌套与删除一致性问题 ✅ 2026-08-05
    - [x] 14.5 创建并部署 `site_comment_likes`、索引与 RLS，接入乐观更新和失败回滚 ✅ 2026-08-05
