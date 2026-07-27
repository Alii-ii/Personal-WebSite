# 设计文档 - Comment System（评论系统）

## 初始设计 - 2025-07-27

### 架构概览

```
┌─────────────────────────────────────────────────────────┐
│  Browser (Static Site - Cloudflare Pages)                │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Gallery Page │  │ Masonry Item │  │  Home Page   │  │
│  │  (评论区)     │  │ (作品评论)    │  │  (无评论)    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘  │
│         │                 │                              │
│  ┌──────▼─────────────────▼──────┐                      │
│  │      CommentSection 组件       │                      │
│  │  ┌────────────┐ ┌───────────┐ │                      │
│  │  │CommentList │ │CommentForm│ │                      │
│  │  └────────────┘ └───────────┘ │                      │
│  └──────────────┬────────────────┘                      │
│                 │                                        │
│  ┌──────────────▼────────────────┐                      │
│  │      useAuth Hook              │                      │
│  │  Anonymous + Email (owner)     │                      │
│  │  + nickname uniqueness check   │                      │
│  └──────────────┬────────────────┘                      │
│                 │                                        │
│  ┌──────────────▼────────────────┐                      │
│  │      useComments Hook          │                      │
│  │  CRUD via Supabase Client      │                      │
│  └──────────────┬────────────────┘                      │
│                 │                                        │
│  ┌──────────────▼────────────────┐                      │
│  │  AuthContext (ClientProviders)  │                      │
│  │  隐藏快捷键: 3×Cmd=登录        │                      │
│  │              3×Shift=登出      │                      │
│  └────────────────────────────────┘                      │
│                 │                                        │
└─────────────────┼───────────────────────────────────────┘
                  │ publishable key (RLS enforced)
                  ▼
┌─────────────────────────────────────────────────────────┐
│  Supabase                                               │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐  │
│  │  Auth        │  │site_profiles │  │ site_comments  │  │
│  │ (anon +     │  │  (nickname,  │  │  (content,     │  │
│  │  email)     │  │  avatar_seed)│  │  target_path,  │  │
│  │  auth.uid() │──│   UNIQUE(nn) │──│   user_id)     │  │
│  └─────────────┘  └─────────────┘  └────────────────┘  │
│                                                         │
│  RLS: auth.uid() = user_id                              │
└─────────────────────────────────────────────────────────┘
```

**核心决策**：

- 访客用 `signInAnonymously()`，站长用 `signInWithPassword()`（邮箱登录），共享同一套 `site_profiles` 表和评论系统
- 站长登录入口完全隐藏，通过连按 3 次 Cmd 触发，零 UI 暴露
- 昵称有 UNIQUE 约束，站长昵称 "Alii" 被独占
- 不展示头像，`avatar_seed` 字段保留但 UI 不使用

### 多项目隔离策略

此 Supabase 项目（`iebesloxnjjrbrwkyhpu`）同时服务个站和 VibeWriting。两个产品共享 `auth.users` 表但各自维护独立的业务表，互不干扰。

```
┌────────────────────────────────────────────────┐
│  Supabase Auth (auth.users)                    │
│  ┌──────────────────┐ ┌──────────────────────┐ │
│  │ is_anonymous=true │ │ is_anonymous=false   │ │
│  │ 个站匿名访客      │ │ 站长 + VW 邮箱用户   │ │
│  └────────┬─────────┘ └──────────┬───────────┘ │
│           │                      │              │
│  ┌────────▼─────────┐ ┌─────────▼───────────┐  │
│  │ site_profiles     │ │ vw_users (未来)     │  │
│  │ site_comments     │ │ vw_documents (未来) │  │
│  │ (个站专属表)       │ │ (VW 专属表)         │  │
│  └──────────────────┘ └─────────────────────┘  │
└────────────────────────────────────────────────┘
```

隔离原则：个站的业务表统一加 `site_` 前缀，VibeWriting 的业务表加 `vw_` 前缀。RLS 策略各自约束，不存在跨产品的数据访问。站长的邮箱账号（`is_anonymous=false`）同时用于个站评论和未来 VibeWriting，通过 `site_profiles` 表关联个站身份。

### 数据模型

#### site_profiles 表

存储个站用户的昵称信息，与 Supabase Auth 的 `auth.users` 表通过 `id` 关联。nickname 有 UNIQUE 约束防止重名。

```sql
CREATE TABLE site_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL UNIQUE CHECK (char_length(nickname) >= 1 AND char_length(nickname) <= 20),
  avatar_seed TEXT NOT NULL,  -- 保留字段，UI 不使用
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER site_profiles_updated_at
  BEFORE UPDATE ON site_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

#### site_comments 表

统一存储个站所有维度的评论。评论锚定在 `target_path` 上，这是一个路径式的稳定标识符，与数组顺序/序号完全解耦，内容增删不影响已有评论的指向。

```sql
CREATE TABLE site_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_path TEXT NOT NULL,  -- 路径式标识，见下方约定
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 500),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 查询索引
CREATE INDEX idx_site_comments_target ON site_comments(target_path);
CREATE INDEX idx_site_comments_user ON site_comments(user_id);
CREATE INDEX idx_site_comments_created ON site_comments(created_at);
```

#### target_path 约定

用单一的 `target_path`（路径式字符串）标识评论挂载位置：

```
层级            target_path 示例                     说明
─────────────────────────────────────────────────────────────
Gallery 整体    gallery                              Gallery 页面级评论
Gallery 单作品  gallery/20250910-180822              用文件名（不含扩展名）作为 slug
项目整体        project/vibewriting                  项目维度评论
项目子页面      project/vibewriting/slides-intro     项目内某个 slides 页
                project/vibewriting/figma-prototype  项目内 Figma 原型页
                project/vibewriting/code-demo        项目内代码演示页
```

#### RLS 策略

```sql
-- site_profiles 表
ALTER TABLE site_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_profiles_select" ON site_profiles
  FOR SELECT USING (true);

CREATE POLICY "site_profiles_insert" ON site_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "site_profiles_update" ON site_profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- site_comments 表
ALTER TABLE site_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_comments_select" ON site_comments
  FOR SELECT USING (true);

CREATE POLICY "site_comments_insert" ON site_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "site_comments_delete" ON site_comments
  FOR DELETE USING (auth.uid() = user_id);
```

### 接口定义

不使用 API 路由（静态导出），所有操作通过 Supabase Client 直接完成。核心接口封装在两个 Hook 中。

#### useAuth Hook

```javascript
// src/hooks/useAuth.js
export function useAuth() {
  return {
    user,            // Supabase Auth user 对象 | null
    profile,         // { nickname, avatar_seed } | null
    isLoading,       // boolean - 初始化中
    isAuthenticated, // boolean - 已有 Auth session
    hasProfile,      // boolean - 已设置昵称
    signIn,          // (nickname: string) => Promise<{error?, profile?}> - 匿名登录 + 昵称查重
    signInWithEmail, // (email, password) => Promise<{error?, profile?}> - 邮箱登录（站长）
    updateNickname,  // (nickname: string) => Promise<{error?}> - 更新昵称（含查重）
    signOut,         // () => Promise<void> - 登出
  }
}
```

**signIn 流程**（访客）：
1. 检查昵称唯一性（SELECT 查重）
2. `supabase.auth.signInAnonymously()` → 获得 session
3. 向 `site_profiles` 表插入 `{ id: user.id, nickname, avatar_seed }`
4. 若 UNIQUE 约束冲突（并发），返回友好错误

**signInWithEmail 流程**（站长）：
1. `supabase.auth.signInWithPassword({ email, password })`
2. 查询已有 profile，若存在直接返回
3. 若无 profile（首次），自动创建

**自动恢复**：Supabase Client 从 localStorage 恢复 session，Hook 初始化时查询 profile。

#### useComments Hook

```javascript
// src/hooks/useComments.js
export function useComments(targetPath) {
  return {
    comments,       // Comment[] - 评论列表（含 profile join）
    count,          // number - 评论总数
    isLoading,      // boolean
    error,          // string | null
    addComment,     // (content: string) => Promise<void>
    deleteComment,  // (commentId: string) => Promise<void>
    refresh,        // () => Promise<void>
  }
}
```

**查询**（JOIN 获取昵称）：
```javascript
supabase
  .from('site_comments')
  .select('id, user_id, content, created_at, site_profiles(nickname, avatar_seed)')
  .eq('target_path', targetPath)
  .order('created_at', { ascending: true })
```

### 数据流

```
访客输入昵称 ──→ 昵称查重 ──→ signInAnonymously() ──→ Auth session
站长 3×Cmd  ──→ signInWithPassword() ─────────────→ Auth session
    │
    ▼
INSERT site_profiles ──→ Supabase DB (RLS: auth.uid() = id) ──→ ✅
    │
    ▼
用户输入评论
    │
    ▼
INSERT site_comments ──→ Supabase DB (RLS: auth.uid() = user_id) ──→ ✅
    │
    ▼
SELECT site_comments + JOIN site_profiles ──→ 评论列表渲染
```

### 组件结构

```
src/
├── hooks/
│   ├── useAuth.js              # 认证 Hook（匿名 + 邮箱双通路 + 昵称查重）  ✅ 已实现
│   └── useComments.js          # 评论 CRUD Hook                            ✅ 已实现
├── contexts/
│   └── AuthContext.js          # Auth Provider + 隐藏快捷键监听             ✅ 已实现
├── components/
│   ├── ClientProviders.jsx     # Server→Client 桥接组件                    ✅ 已实现
│   └── comments/
│       ├── CommentSection.jsx  # 评论区容器（包含列表 + 输入框）             ⏳ 等 Figma
│       ├── CommentList.jsx     # 评论列表                                  ⏳ 等 Figma
│       ├── CommentItem.jsx     # 单条评论                                  ⏳ 等 Figma
│       ├── CommentForm.jsx     # 评论输入框 + 提交                          ⏳ 等 Figma
│       └── NicknameDialog.jsx  # 昵称输入弹窗                              ⏳ 等 Figma
├── lib/
│   └── supabase.js             # Supabase Client（已更新连接信息）           ✅ 已更新
└── app/
    └── layout.js               # 包裹 ClientProviders                      ✅ 已集成
```

### 组件设计细节

> **状态**：UI 组件设计待 Figma 设计稿完成后实现。

#### CommentSection（评论区容器）

接收 `targetPath` 作为 prop（如 `"gallery"` 或 `"gallery/20250910-180822"`），内部调用 `useComments(targetPath)` 获取数据。根据 Auth 状态决定展示输入框还是登录引导。

#### NicknameDialog（昵称输入弹窗）

轻量弹窗，居中显示。包含一个文本输入框和确认按钮。输入验证：1-20 字符，不能为空白，昵称不可重复。确认后触发 `signIn(nickname)`。

视觉风格：使用个站已有的色系（`bg-card`、`border-stroke`、`text-main`），圆角 `rounded-[8px]`，阴影 `shadow-lg`。

### 错误处理策略

| 场景 | 处理方式 |
|------|---------|
| 匿名登录失败（网络错误） | Toast 提示"网络异常，请重试"，不阻塞页面浏览 |
| 昵称已被占用 | 提示"该昵称已被使用"，应用层查重 + DB UNIQUE 约束双重保障 |
| 评论提交失败 | 输入框保留内容，Toast 提示错误，可重试 |
| 评论加载失败 | 显示"暂时无法加载评论"占位，提供重试按钮 |
| 限流触发（1分钟5条） | 客户端计数器限流，提示"评论太频繁，请稍后再试" |
| 站长登录失败 | Console 输出错误，不弹 UI |

### 文件变更清单

| 文件 | 操作 | 状态 |
|------|------|------|
| `src/hooks/useAuth.js` | 新增 | ✅ 已实现（匿名+邮箱登录+昵称查重） |
| `src/hooks/useComments.js` | 新增 | ✅ 已实现（CRUD+JOIN+限流+乐观更新） |
| `src/contexts/AuthContext.js` | 新增 | ✅ 已实现（Provider+3×Cmd登录+3×Shift登出） |
| `src/components/ClientProviders.jsx` | 新增 | ✅ 已实现（Server→Client 桥接） |
| `src/app/layout.js` | 修改 | ✅ 已集成 ClientProviders |
| `src/lib/supabase.js` | 修改 | ✅ 已更新连接信息 |
| `src/components/comments/*.jsx` | 新增 | ⏳ 等 Figma 设计稿 |
| `src/app/gallery/page.jsx` | 修改 | ⏳ 等 Figma 设计稿 |
| `src/effects/Masonry.jsx` | 修改 | ⏳ 等 Figma 设计稿 |
| Supabase Dashboard | 操作 | ✅ 建表+RLS+匿名登录已完成 |
| Supabase Dashboard | 操作 | ⏳ 站长邮箱账号创建+profile预置+UNIQUE约束 |
