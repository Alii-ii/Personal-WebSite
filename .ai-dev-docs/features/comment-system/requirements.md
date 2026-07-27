# 需求文档 - Comment System（评论系统）

## 初始需求 - 2025-07-27

### 背景与动机

个站（alii.work）目前是纯展示型站点，访客无法留下任何反馈。希望在不破坏现有极简体验的前提下，增加轻量评论能力，让访客能在作品集维度和单个作品维度留下文字评论。

参照 Ryo.lu 初期的登录策略：不做强登录（无 OAuth / 邮箱注册），访客输入昵称后，通过 Supabase Auth 匿名登录自动生成身份，下次访问同一设备时自动恢复身份。

### 项目约束

- **静态导出**：Next.js `output: 'export'`，部署在 Cloudflare Pages，无服务端 API 路由
- **数据交互**：所有读写直接从浏览器端走 Supabase Client（publishable key）
- **安全边界**：通过 Supabase RLS（Row Level Security）控制权限，而非服务端中间层
- **已有基础设施**：Supabase 项目（`iebesloxnjjrbrwkyhpu.supabase.co`），与 VibeWriting 共享，业务表通过 `site_` 前缀隔离
- **不展示头像**：UI 上不展示用户头像，不需要默认头像生成逻辑
- **双登录通路**：访客走匿名登录，站长走邮箱登录（隐藏入口）

---

### Requirement 1: 弱登录身份系统

WHEN 访客首次尝试评论且无已有 Auth session, THE SYSTEM SHALL 通过 Supabase Auth 匿名登录创建身份，引导用户输入昵称后写入 `site_profiles` 表。

#### Scenario 1.1: 首次评论 - 创建身份（访客）
- GIVEN 访客未有 Supabase Auth session
- WHEN 访客输入昵称并确认
- THEN 系统检查昵称唯一性（查询 `site_profiles` 是否已存在）
- AND 若昵称可用，调用 `signInAnonymously()` 获得 Auth session
- AND 向 `site_profiles` 表插入 `{ id, nickname, avatar_seed }`
- AND Supabase Client 自动将 session 存入 localStorage

#### Scenario 1.2: 首次评论 - 昵称已被占用
- GIVEN 访客输入的昵称已被其他用户使用
- WHEN 访客确认昵称
- THEN 系统提示"该昵称已被使用"，不创建 Auth session

#### Scenario 1.3: 回访 - 自动恢复身份
- GIVEN 访客 localStorage 中有有效的 Supabase Auth session
- WHEN 访客再次访问个站
- THEN Supabase Client 自动恢复 session（内置行为）
- AND Hook 初始化时自动查询 `site_profiles` 获取昵称
- AND 跳过昵称输入，直接恢复评论能力

#### Scenario 1.4: 回访 - session 过期
- GIVEN 访客 localStorage 中的 Auth session 已过期或被清除
- WHEN 访客再次尝试评论
- THEN 系统重新弹出昵称输入，走首次评论流程（创建新的匿名身份）

#### Scenario 1.5: 昵称修改
- GIVEN 访客已有身份
- WHEN 访客主动点击修改昵称
- THEN 系统检查新昵称唯一性（排除自己）
- AND 若可用，更新 `site_profiles` 中对应记录的 nickname 字段
- AND 本地状态同步更新

#### Scenario 1.6: 站长登录
- GIVEN 站长在页面上连按 3 次 Cmd（Mac）或 Ctrl（Windows）
- WHEN 触发隐藏登录
- THEN 系统自动以预置邮箱密码调用 `signInWithPassword()` 登录
- AND 查询 `site_profiles` 获取站长 profile（昵称 "Alii"）
- AND Console 输出登录状态

#### Scenario 1.7: 站长登出
- GIVEN 站长已登录
- WHEN 连按 3 次 Shift
- THEN 系统调用 `signOut()` 清除 session
- AND Console 输出登出状态

---

### Requirement 2: 评论数据模型与读写

WHEN 已认证访客在评论区提交评论, THE SYSTEM SHALL 将评论写入 Supabase `site_comments` 表，通过 `target_path`（路径式 slug）锚定评论位置，与数组序号完全解耦。

#### Scenario 2.1: 在 Gallery 页面（作品集维度）留评论
- GIVEN 访客已有身份，当前在 `/gallery` 页面
- WHEN 访客在页面底部评论区输入内容并提交
- THEN 系统将评论写入 `site_comments` 表，target_path = 'gallery'
- AND 评论列表实时更新，新评论出现在列表中
- AND 评论显示昵称、内容、时间戳

#### Scenario 2.2: 在单个作品维度留评论
- GIVEN 访客已有身份，当前查看某个作品的放大视图
- WHEN 访客在该作品的评论区输入内容并提交
- THEN 系统将评论写入 `site_comments` 表，target_path = 'gallery/{slug}'（slug 为文件名不含扩展名，如 '20250910-180822'）
- AND 评论列表实时更新

#### Scenario 2.3: 评论展示与排序
- GIVEN 评论区已有评论
- WHEN 访客浏览评论区
- THEN 评论按时间正序排列（最早在上）
- AND 每条评论显示：昵称、内容、相对时间（如"3 小时前"）
- AND 空评论状态展示友好的引导文案

#### Scenario 2.4: 删除自己的评论
- GIVEN 访客已有身份且有自己发的评论
- WHEN 访客点击自己评论的删除按钮
- THEN 系统从 `site_comments` 表硬删除该条评论
- AND 评论列表即时更新

---

### Requirement 3: Supabase RLS 安全策略

WHEN 浏览器端直接操作 Supabase, THE SYSTEM SHALL 通过 RLS 策略限制数据访问范围，防止匿名用户越权操作。

#### Scenario 3.1: 评论读取 - 公开
- GIVEN 任何访客（含未认证）
- WHEN 请求读取 `site_comments` 表
- THEN RLS 允许 SELECT 所有评论（公开可读）

#### Scenario 3.2: 评论写入 - 需身份
- GIVEN 请求携带有效 Auth session
- WHEN 向 `site_comments` 表 INSERT 一条评论
- THEN RLS 允许插入（验证 `auth.uid() = user_id`）

#### Scenario 3.3: 评论删除 - 仅自己
- GIVEN 请求携带有效 Auth session
- WHEN 向 `site_comments` 表 DELETE 一条评论
- THEN RLS 仅允许删除 `auth.uid() = user_id` 的记录

#### Scenario 3.4: Profile 操作 - 仅自己
- GIVEN 任何请求
- WHEN 操作 `site_profiles` 表
- THEN RLS 允许 SELECT（公开可读，评论 JOIN 需要）、INSERT 和 UPDATE 仅限 `auth.uid() = id`

---

### Requirement 4: 评论 UI 交互

WHEN 访客在评论相关界面操作, THE SYSTEM SHALL 提供流畅的交互体验，与现有个站视觉风格一致。

> **状态**：UI 设计待 Figma 设计稿完成后实现，逻辑层已就绪。

#### Scenario 4.1: Gallery 评论入口
- GIVEN 访客在 `/gallery` 页面
- WHEN 滚动到底部或点击评论入口
- THEN 显示评论区面板，包含评论列表和输入框
- AND 评论区视觉风格与现有个站一致（使用 tokens 色系、圆角、阴影等）

#### Scenario 4.2: 单作品评论入口
- GIVEN 访客在 Web 端点击作品放大查看
- WHEN 作品处于放大状态
- THEN 在放大视图侧边或底部展示该作品的评论区
- AND 评论区不遮挡作品主体

#### Scenario 4.3: 未登录态引导
- GIVEN 访客未创建身份
- WHEN 访客尝试输入评论
- THEN 评论输入框显示为不可用状态（或点击后弹出昵称输入）
- AND 友好提示"输入昵称即可评论"

#### Scenario 4.4: 评论数量指示
- GIVEN 某个目标（gallery 或 artwork）有评论
- WHEN 访客浏览时
- THEN 在对应入口处显示评论数量气泡/角标

---

### 约束与边界

- **反垃圾（初期简化）**：同一用户每分钟最多 5 条评论，客户端限流
- **评论长度**：单条评论最多 500 字符
- **昵称唯一**：nickname 字段有 UNIQUE 约束，应用层查重 + 数据库兜底
- **不做嵌套回复**：初期只做平铺评论，不做 @回复 或线程嵌套
- **不做评论编辑**：初期只支持删除，不支持编辑已发评论
- **不展示头像**：UI 上不展示用户头像
- **站长入口隐藏**：邮箱登录/登出通过隐藏快捷键触发，无任何可见 UI
- **移动端评论**：Gallery 维度的评论在移动端可用，单作品评论暂不在移动端支持
- **管理后台**：初期不做管理后台，如需删除不当评论通过 Supabase Dashboard 手动操作

### 置信度评估

| 需求 | 置信度 | 说明 |
|------|--------|------|
| 弱登录身份系统 | 95% | 已实现并测试通过：匿名登录 + 邮箱登录双通路 + 昵称查重 |
| 评论数据模型与读写 | 98% | 已实现并测试通过：CRUD + JOIN + 乐观更新 + 客户端限流 |
| RLS 安全策略 | 98% | 已配置并测试通过：公开可读、auth.uid() 鉴权写入/删除 |
| 评论 UI 交互 | 待定 | 等 Figma 设计稿完成后实现 |
