# 交接 Prompt - Comment System UI 实现

> 用途：把这份文档整体贴给新会话的 AI，即可接手评论系统的前端 UI 实现。
> 逻辑层与数据层已 100% 完成并测试通过，**本次任务只做 UI**。

---

## 一、任务目标

在个站（Next.js 静态导出）的 **作品集页面 `/gallery`** 落地评论功能的 UI 层。
后端、数据库、认证、CRUD Hook 全部就绪，你只需要按 Figma 设计稿实现组件并接线。

两个评论维度：

1. **作品集维度** — Gallery 页面级评论，`target_path = "gallery"`
2. **单作品维度** — 作品放大视图内的评论，`target_path = "gallery/{slug}"`（仅 Web 端）

---

## 二、项目上下文（必读）

### 技术栈与硬约束

| 项 | 说明 |
|----|------|
| 框架 | Next.js 15.3.3 App Router |
| 导出模式 | `output: 'export'` **静态导出，没有任何 API 路由**，禁止用 `getServerSideProps` / Route Handler / server action |
| 部署 | Cloudflare Pages |
| 样式 | Tailwind + 自定义 HSL token（见下方） |
| 动效 | GSAP（Masonry）、framer-motion（部分组件） |
| 后端 | Supabase，浏览器端直连，靠 RLS 保证安全 |
| 包管理 | pnpm |

**所有数据操作都在浏览器端完成**，不要试图加服务端中间层。

### 设计 token（必须使用，不要写死颜色）

定义在 `src/app/globals.css`，light/dark 自动切换：

```
背景：bg-bg / bg-card / bg-hover / bg-press / bg-others
文字：text-main / text-secondary / text-tertiary / text-quaternary / text-disabled
描边：border-stroke / border-divider
分割：bg-divider / bg-stroke
```

暗色主题通过 CSS 变量切换，**用了上述 class 就自动适配**，不要手写 `dark:` 变体去覆盖颜色。

字体：`font-alibaba-regular`（已在 layout 里全局设置）。

---

## 三、已完成的部分（不要重写）

### 1. 数据库（Supabase 已建好，无需任何操作）

```sql
site_profiles (
  id UUID PK → auth.users(id),
  nickname TEXT NOT NULL UNIQUE CHECK(1..20),
  avatar_seed TEXT NOT NULL,   -- 保留字段，UI 不使用
  created_at, updated_at
)

site_comments (
  id UUID PK,
  user_id UUID NOT NULL → auth.users(id),
  target_path TEXT NOT NULL,   -- 'gallery' | 'gallery/{slug}'
  content TEXT NOT NULL CHECK(1..500),
  created_at
)
```

RLS 已配置：评论公开可读，写入/删除限 `auth.uid() = user_id`。
匿名登录已开启，站长邮箱账号已创建，`nickname` UNIQUE 约束已生效。

### 2. `src/hooks/useAuth.js` — 认证 Hook

```javascript
const {
  user,            // Supabase Auth user | null
  profile,         // { nickname, avatar_seed } | null
  isLoading,       // 初始化中
  isAuthenticated, // 已有 session
  hasProfile,      // 已设昵称
  signIn,          // (nickname) => Promise<{error?}>  访客匿名登录，内含昵称查重
  signInWithEmail, // (email, password) => Promise<{error?, profile?}>  站长专用
  updateNickname,  // (nickname) => Promise<{error?}>  内含查重（排除自己）
  signOut,         // () => Promise<void>
} = useAuth();
```

错误信息已是中文，可直接展示：`'昵称需要 1-20 个字符'`、`'该昵称已被使用'`、`'登录失败，请重试'`。

### 3. `src/hooks/useComments.js` — 评论 CRUD Hook

```javascript
const {
  comments,      // Array，已按 created_at 正序（最早在上）
  count,         // 评论总数
  isLoading,
  error,         // string | null
  addComment,    // (content) => Promise<{error?}>  乐观更新
  deleteComment, // (commentId) => Promise<{error?}>  乐观更新
  refresh,
} = useComments(targetPath);
```

单条 comment 的结构（已 JOIN profiles）：

```javascript
{
  id: 'uuid',
  user_id: 'uuid',
  content: '评论内容',
  created_at: '2026-07-28T10:30:00Z',
  site_profiles: { nickname: 'Alii', avatar_seed: 'uuid' }
}
```

> 注意：昵称在嵌套的 `site_profiles` 对象里，不是顶层字段。
> 该对象理论上不会为 null（有外键约束），但渲染时建议用可选链兜底。

已内置：500 字符校验、客户端限流（1 分钟 5 条）、乐观更新。
错误信息中文，可直接展示：`'评论内容不能为空'`、`'评论最多 500 字符'`、`'评论太频繁，请稍后再试'`、`'请先登录'`、`'发送失败，请重试'`。

### 4. `src/contexts/AuthContext.js` + `src/components/ClientProviders.jsx`

已挂在 `src/app/layout.js`。组件内直接用 `useAuthContext()` 取全局状态，**不要在组件里重复调 `useAuth()`**（会产生多份独立 state）。

```javascript
import { useAuthContext } from '@/contexts/AuthContext';
```

同时内置了站长隐藏入口（连按 3 次 Cmd 登录 / 3 次 Shift 登出，走 console 输出）。
**这部分不要改动，也不要在 UI 上暴露任何登录入口。**

---

## 四、本次要做的事

### Task 1：评论 UI 组件

在 `src/components/comments/` 下新建，全部标 `"use client"`：

| 组件 | 职责 |
|------|------|
| `CommentSection.jsx` | 容器。接收 `targetPath` prop，调 `useComments(targetPath)`，组合列表 + 输入框，处理未登录态 |
| `CommentList.jsx` | 列表渲染 + 空态 + loading 态 + 错误态 |
| `CommentItem.jsx` | 单条评论：昵称、内容、相对时间；自己的评论显示删除按钮 |
| `CommentForm.jsx` | 输入框 + 提交；字数计数；提交中禁用 |
| `NicknameDialog.jsx` | 昵称输入弹窗：1-20 字符校验，展示查重错误 |

关键交互约定：

- **不展示头像**。`avatar_seed` 字段存在但 UI 不用，也不要生成默认头像。
- **删除按钮仅在 `comment.user_id === user?.id` 时显示**。
- **相对时间**（如"3 小时前"）自行实现轻量函数即可，不要为此引入 dayjs / date-fns。
- 未登录时点击输入框 → 弹 `NicknameDialog`；`signIn()` 成功后自动继续发送用户刚输入的内容（体验更顺，可选）。

### Task 2：Gallery 页面集成（作品集维度）

改 `src/app/gallery/page.jsx`：在 `<Masonry />` 所在区块之后、`<Footer />` 之前插入：

```jsx
<CommentSection targetPath="gallery" />
```

注意当前页面结构：Masonry 外层是 `overflow-y-auto` 的 flex 容器，且整页有 `pb-32 md:pb-40`。
插入评论区后需确认滚动行为正常、评论区宽度与内容区对齐（`px-6 md:px-16`）。

### Task 3：单作品评论集成（放大视图维度）

改 `src/effects/Masonry.jsx`，在图片放大 overlay 中加入评论面板。

**target_path 推导规则（重要，不要用数组索引）：**

```javascript
// item.img = "/images/gallery/webp/20250910-180822.webp"
const slug = item.img.split('/').pop().replace(/\.[^.]+$/, '');
// slug = "20250910-180822"
const targetPath = `gallery/${slug}`;
```

必须用文件名 stem，**不能用 `item.id` 或数组下标**——作品集会经 seed 洗牌重排，且后续会增删图片，用序号会导致评论错位。

其他约束：

- 仅 `isWebDevice === true` 时渲染，移动端不渲染（移动端没有放大功能）
- 面板放在放大图侧边或下方，不遮挡作品主体
- 关闭放大视图时评论区一并卸载

> ⚠️ **集成风险提示**：`Masonry.jsx` 用 GSAP 做绝对定位布局，放大态由 `expandedImageId` / `expandedImagePosition` 驱动，还有键盘左右切换逻辑。插入评论面板时注意：
> 1. 不要破坏既有 GSAP 动画和定位计算
> 2. 评论面板内的输入框要 `stopPropagation`，避免左右方向键被切图逻辑捕获
> 3. 切换作品时 `targetPath` 变化会触发 `useComments` 重新拉取，确认无闪烁

---

## 五、验收标准

功能：

- [ ] Gallery 页面可发表、展示、删除评论
- [ ] 首次评论弹昵称框，输入后成功创建身份
- [ ] 昵称重复时提示"该昵称已被使用"
- [ ] 刷新页面身份自动恢复，不再弹昵称框
- [ ] 只能删自己的评论，他人评论无删除按钮
- [ ] 评论按时间正序（最早在上）
- [ ] 空态、loading 态、错误态都有对应展示
- [ ] 单作品放大视图（Web 端）可评论，移动端不渲染该面板
- [ ] 切换作品时评论正确切换（验证 target_path 跟随）

视觉与构建：

- [ ] 严格使用设计 token，明暗主题均正确
- [ ] 移动端 Gallery 评论区布局不溢出
- [ ] `pnpm build` 静态导出成功，无 SSR 相关报错

---

## 六、参考文档

同目录下：

- `requirements.md` — 完整需求（EARS 格式场景）
- `design.md` — 架构、数据模型、RLS、组件设计
- `tasks.md` — 任务清单与完成状态
- `qa.md` — 验收项清单

---

## 七、开始前请确认

1. 先读 `design.md` 的「组件设计细节」和「错误处理策略」
2. 先读 `src/hooks/useComments.js` 和 `src/hooks/useAuth.js` 的实际实现（以代码为准）
3. 参照 `src/components/` 下已有组件的代码风格
4. 拿到 Figma 设计稿后，优先对齐间距、圆角、字号，颜色一律走 token
