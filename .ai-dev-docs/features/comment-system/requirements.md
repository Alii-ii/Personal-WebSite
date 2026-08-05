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

---

## 迭代 2 - 2026-08-05

### 新增需求：L3 Frame 级嵌入式评论抽屉

WHEN 用户在作品 L3 详情页打开评论区, THE SYSTEM SHALL 在原 L3 主页面右侧以固定 360px 的同级 flex 抽屉展示评论，并让主舞台依据剩余容器宽度自适应。

#### Scenario 2.1: 评论按 Frame 隔离
- GIVEN 当前 Project 包含多个 Frame
- WHEN 用户切换 Frame 或跨 Project 导航
- THEN 评论查询与发送目标更新为 `project/{projectSlug}/frames/{frameId}`
- AND 不混用 Project 级或其他 Frame 的评论
- AND 评论区当前开启或关闭状态不因 Frame、Tab、Project 切换而改变

#### Scenario 2.2: 两级回复
- GIVEN 当前 Frame 已有一级评论
- WHEN 用户回复一级或二级评论
- THEN 回复统一展示在对应一级评论下的第二级
- AND 二次回复只记录目标二级评论，不递归生成第三级

#### Scenario 2.3: 输入与身份
- GIVEN 用户尚未创建匿名身份
- WHEN 用户点击评论输入框
- THEN 输入框直接进入昵称模式，不展示遮罩弹窗
- AND 昵称建立成功后切换为评论模式
- AND 评论发送与 AI Chat 完全隔离
- AND textarea 初始一行、随内容增高、最大高度为 50vh

#### Scenario 2.4: 列表与输入框布局
- GIVEN 评论内容未超过可视高度
- WHEN 评论区渲染
- THEN 输入框处于评论列表正常流末尾
- AND 零评论时不展示空态文案
- WHEN 评论内容超过可视高度
- THEN 输入框 sticky 在评论区底边
- AND 评论区可滚动但不展示滚动条

#### Scenario 2.5: 评论操作
- GIVEN 评论项未 hover
- THEN 右上角仅展示相对时间，操作按钮不占位
- WHEN 评论项 hover 或 focus-within
- THEN 时间被删除、回复、喜欢操作替换
- AND 仅评论作者可见删除按钮，删除按钮位于操作区最左侧
- AND 根评论存在其他用户回复时禁止删除，避免孤儿回复

#### Scenario 2.6: 视觉与国际化
- GIVEN 评论抽屉展开
- THEN 点阵背景仅覆盖原 L3 主页面
- AND 主页面右侧使用 24px 圆角和投影形成抽屉层次
- AND User ID 默认使用 `text-quaternary`，hover/focus 使用 `text-main`
- AND 回复正文中的“回复/Reply to”与正文同色，被回复 ID 使用 `text-quaternary`
- AND 所有静态文本、错误和无障碍标签支持中英文

### 修改的需求

原“评论只做平铺、不做嵌套回复”变更为“只允许一级与二级回复”；原“空评论状态展示引导文案”变更为零评论不展示空态文案；原“未登录输入框不可用或弹窗”变更为输入框原位昵称模式。

### 约束与边界

- 喜欢状态当前仅为客户端会话态，不写入数据库。
- 删除仍由 Supabase RLS 的 `auth.uid() = user_id` 做最终鉴权。
- 根评论如包含其他用户回复，当前拒绝删除；根评论与回复均属于本人时可一并清理。
- 本轮不新增数据库字段，二级关系编码在 `target_path` 中。
