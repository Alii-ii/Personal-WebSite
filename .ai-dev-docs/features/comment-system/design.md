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
│  │  Supabase Auth (Anonymous)     │                      │
│  │  + localStorage (nickname)     │                      │
│  └──────────────┬────────────────┘                      │
│                 │                                        │
│  ┌──────────────▼────────────────┐                      │
│  │      useComments Hook          │                      │
│  │  CRUD via Supabase Client      │                      │
│  └──────────────┬────────────────┘                      │
│                 │                                        │
└─────────────────┼───────────────────────────────────────┘
                  │ anon key (RLS enforced)
                  ▼
┌─────────────────────────────────────────────────────────┐
│  Supabase                                               │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐  │
│  │  Auth        │  │site_profiles │  │ site_comments  │  │
│  │ (anonymous)  │  │  (nickname,  │  │  (content,     │  │
│  │              │  │   avatar)    │  │   target_type, │  │
│  │  auth.uid()  │──│   user_id    │──│   user_id)     │  │
│  └─────────────┘  └─────────────┘  └────────────────┘  │
│                                                         │
│  RLS: auth.uid() = user_id                              │
└─────────────────────────────────────────────────────────┘
```

**核心决策**：用 Supabase Auth 的 `signInAnonymously()` 替代自建 visitor 身份系统。这意味着每个访客在首次互动时获得一个 Supabase Auth session（存在 localStorage 中），RLS 直接用 `auth.uid()` 鉴权，安全模型清晰。昵称和头像作为 `profiles` 表的 profile 层叠加在 Auth 之上。

### 多项目隔离策略

此 Supabase 项目（`iebesloxnjjrbrwkyhpu`）同时服务个站和 VibeWriting。两个产品共享 `auth.users` 表但各自维护独立的业务表，互不干扰。

```
┌────────────────────────────────────────────────┐
│  Supabase Auth (auth.users)                    │
│  ┌──────────────────┐ ┌──────────────────────┐ │
│  │ is_anonymous=true │ │ is_anonymous=false   │ │
│  │ 个站匿名访客      │ │ VibeWriting 邮箱用户 │ │
│  └────────┬─────────┘ └──────────┬───────────┘ │
│           │                      │              │
│  ┌────────▼─────────┐ ┌─────────▼───────────┐  │
│  │ site_profiles     │ │ vw_users (未来)     │  │
│  │ site_comments     │ │ vw_documents (未来) │  │
│  │ (个站专属表)       │ │ (VW 专属表)         │  │
│  └──────────────────┘ └─────────────────────┘  │
└────────────────────────────────────────────────┘
```

隔离原则：个站的业务表统一加 `site_` 前缀，VibeWriting 的业务表加 `vw_` 前缀。RLS 策略各自约束，不存在跨产品的数据访问。Auth 层面两种用户天然隔离——个站的匿名用户不会出现在 VibeWriting 的用户列表中，因为 VibeWriting 只查 `is_anonymous = false` 的记录。

### 数据模型

#### site_profiles 表

存储个站匿名访客的昵称和头像信息，与 Supabase Auth 的 `auth.users` 表通过 `id` 关联。表名加 `site_` 前缀以区分 VibeWriting 的用户表。

```sql
CREATE TABLE site_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL CHECK (char_length(nickname) >= 1 AND char_length(nickname) <= 20),
  avatar_seed TEXT NOT NULL,  -- 用于生成确定性头像的种子（基于 auth.uid）
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

评论不再用 `target_type` + `target_id` 两个字段，而是用单一的 `target_path`（路径式字符串）标识评论挂载位置。规则如下：

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

**为什么用路径式 slug 而非序号/索引：**

- **增删稳定**：在 Gallery 中间插入新作品、删除旧作品，不影响已有评论的 target_path
- **内容更新稳定**：Figma 原型、代码演示通过 iframe 嵌入，URL 不变，slug 不变
- **Slides 页稳定**：每页用语义 slug（`slides-intro`、`slides-arch`）而非页码编号，中间插页不错位
- **层级可扩展**：未来加新类型只需新增路径前缀，无需改表结构

#### RLS 策略

```sql
-- site_profiles 表
ALTER TABLE site_profiles ENABLE ROW LEVEL SECURITY;

-- 所有人可读（评论需要显示昵称和头像）
CREATE POLICY "site_profiles_select" ON site_profiles
  FOR SELECT USING (true);

-- 只能插入自己的 profile
CREATE POLICY "site_profiles_insert" ON site_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 只能更新自己的 profile
CREATE POLICY "site_profiles_update" ON site_profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- site_comments 表
ALTER TABLE site_comments ENABLE ROW LEVEL SECURITY;

-- 所有人可读
CREATE POLICY "site_comments_select" ON site_comments
  FOR SELECT USING (true);

-- 已认证用户可插入（user_id 必须等于自己）
CREATE POLICY "site_comments_insert" ON site_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 只能删除自己的评论
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
    user,           // Supabase Auth user 对象 | null
    profile,        // { nickname, avatar_seed } | null
    isLoading,      // boolean - 初始化中
    isAuthenticated,// boolean - 已有 Auth session
    hasProfile,     // boolean - 已设置昵称
    signIn,         // (nickname: string) => Promise<void> - 匿名登录 + 创建 profile
    updateNickname, // (nickname: string) => Promise<void> - 更新昵称
    signOut,        // () => Promise<void> - 登出（清除 session）
  }
}
```

**signIn 流程**：
1. `supabase.auth.signInAnonymously()` → 获得 session
2. 以 `auth.uid()` 为 seed 生成 `avatar_seed`
3. 向 `site_profiles` 表插入 `{ id: user.id, nickname, avatar_seed }`

**自动恢复**：
- Supabase Client 会自动从 localStorage 恢复 session（内置行为）
- Hook 初始化时检查 `supabase.auth.getUser()`，有 session 则自动查询 profile

#### useComments Hook

```javascript
// src/hooks/useComments.js
export function useComments(targetPath) {
  return {
    comments,       // Comment[] - 评论列表（含 profile join）
    count,          // number - 评论总数
    isLoading,      // boolean
    addComment,     // (content: string) => Promise<void>
    deleteComment,  // (commentId: string) => Promise<void>
  }
}
```

**查询**：
```javascript
supabase
  .from('site_comments')
  .select('*, site_profiles(nickname, avatar_seed)')
  .eq('target_path', targetPath)
  .order('created_at', { ascending: true })
```

### 数据流

```
用户输入昵称
    │
    ▼
signInAnonymously() ──→ Supabase Auth ──→ session (localStorage)
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
│   ├── useAuth.js              # 匿名登录 + profile 管理
│   └── useComments.js          # 评论 CRUD
├── contexts/
│   └── AuthContext.js          # Auth 状态全局 Provider
├── components/
│   └── comments/
│       ├── CommentSection.jsx  # 评论区容器（包含列表 + 输入框）
│       ├── CommentList.jsx     # 评论列表
│       ├── CommentItem.jsx     # 单条评论
│       ├── CommentForm.jsx     # 评论输入框 + 提交
│       ├── NicknameDialog.jsx  # 昵称输入弹窗
│       └── Avatar.jsx          # 确定性头像生成组件
├── lib/
│   └── supabase.js             # 已有，无需修改
```

### 组件设计细节

#### CommentSection（评论区容器）

接收 `targetPath` 作为 prop（如 `"gallery"` 或 `"gallery/20250910-180822"`），内部调用 `useComments(targetPath)` 获取数据。根据 Auth 状态决定展示输入框还是登录引导。

#### NicknameDialog（昵称输入弹窗）

轻量弹窗，居中显示。包含一个文本输入框和确认按钮。输入验证：1-20 字符，不能为空白。确认后触发 `signIn(nickname)`。

视觉风格：使用个站已有的色系（`bg-card`、`border-stroke`、`text-main`），圆角 `rounded-[8px]`，阴影 `shadow-lg`。

#### Avatar（确定性头像）

不依赖外部服务（DiceBear CDN 可能被墙）。使用纯前端方案：基于 `avatar_seed` 生成简单的几何色块头像。方案选择 CSS 渐变 + 哈希映射颜色，零依赖。

#### Gallery 页面评论入口

在 Gallery 页面的 Masonry 瀑布流下方、Footer 之前，增加一个评论区块。评论区宽度与内容区一致（`px-6 md:px-16`），视觉上作为页面内容的自然延伸。

#### 单作品评论入口

在 Masonry 组件的图片放大 overlay 中，放大图的右侧或下方增加评论面板。移动端不支持（移动端无放大功能，与现有行为一致）。

### 错误处理策略

| 场景 | 处理方式 |
|------|---------|
| 匿名登录失败（网络错误） | Toast 提示"网络异常，请重试"，不阻塞页面浏览 |
| 评论提交失败 | 输入框保留内容，Toast 提示错误，可重试 |
| 评论加载失败 | 显示"暂时无法加载评论"占位，提供重试按钮 |
| 限流触发（1分钟5条） | 客户端计数器限流，提示"评论太频繁，请稍后再试" |
| 昵称校验失败 | 输入框下方显示红色提示文案 |

### 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/hooks/useAuth.js` | 新增 | 匿名登录 + profile 管理 Hook |
| `src/hooks/useComments.js` | 新增 | 评论 CRUD Hook |
| `src/contexts/AuthContext.js` | 新增 | Auth 状态全局 Provider |
| `src/components/comments/CommentSection.jsx` | 新增 | 评论区容器组件 |
| `src/components/comments/CommentList.jsx` | 新增 | 评论列表组件 |
| `src/components/comments/CommentItem.jsx` | 新增 | 单条评论组件 |
| `src/components/comments/CommentForm.jsx` | 新增 | 评论输入表单组件 |
| `src/components/comments/NicknameDialog.jsx` | 新增 | 昵称输入弹窗组件 |
| `src/components/comments/Avatar.jsx` | 新增 | 确定性头像生成组件 |
| `src/app/layout.js` | 修改 | 包裹 AuthProvider |
| `src/app/gallery/page.jsx` | 修改 | 在 Masonry 下方集成 CommentSection |
| `src/effects/Masonry.jsx` | 修改 | 放大视图中集成单作品评论面板 |
| `src/lib/supabase.js` | 已更新 | Supabase URL 和 anon key 已更新为新项目 |
| Supabase Dashboard | 操作 | 创建 site_profiles 和 site_comments 表、RLS 策略、开启 Anonymous Sign-In |
