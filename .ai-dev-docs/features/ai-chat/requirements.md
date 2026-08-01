# 需求文档 - AI Chat（硅基分身对话）

## 初始需求 - 2025-07-30

### 产品定位

"硅基的我"——在个人网站上接入 DeepSeek API，为访客提供一个能近似代替站长本人交流的 AI 对话体验。核心目标不是做一个通用聊天机器人，而是让访客感受到与站长本人直接对话的临场感：坦率、真诚、大方。

### 调研摘要

#### ryokun6/ryos 参考方案

ryos 的 AI 人格实现采用**分层 System Prompt 架构**，核心由以下模块组合而成：

- **CORE_PRIORITY_INSTRUCTIONS**：最高优先级指令，定义记忆覆盖规则（用户记忆 > 人格设定）
- **RYO_PERSONA_INSTRUCTIONS**：人格定义，包括身份信息（名字、职位、所在地、性格类型）、背景（出生地、成长经历、教育）、职业经历（按时间线列出关键公司和角色）、哲学观、兴趣爱好、联系方式
- **ANSWER_STYLE_INSTRUCTIONS**：说话风格指令，包括语言习惯（小写、口头禅）、情绪强度控制（被攻击时如何回应）、身份防护（不承认自己是 AI）、中文规则（繁体中文、标点规范）
- **CHAT_INSTRUCTIONS**：对话行为规则，包括记忆管理、回复长度控制、引用格式等

ryos 的速率限制策略为：**认证用户 5 小时 15 条，匿名用户 24 小时 3 条**，使用 Redis 计数。

#### 关键借鉴

1. **人格 prompt 的结构化分层**：身份 → 背景 → 风格 → 行为规则，各层独立维护
2. **说话风格的具体化**：不只说"坦率真诚"，要给出具体的口头禅、语言习惯、情绪反应模式
3. **身份防护**：对于"你是 AI 吗"这类问题的应对策略
4. **回复长度控制**：默认简短（1-2 句），被明确要求时才展开
5. **语言跟随**：用用户的语言回复

### Requirement: 悬浮入口与对话窗口

WHEN 用户在任意页面浏览时, THE SYSTEM SHALL 在页面右下角展示一个悬浮按钮作为 AI 对话入口。

#### Scenario: 悬浮按钮展开对话框
- GIVEN 用户在任意页面
- WHEN 用户 hover 悬浮按钮
- THEN 展开一个对话框窗口
- AND 对话框中展示当前对话或欢迎语
- AND 聊天记录跟随对话框的收展状态（展开时可见，收起时隐藏）

#### Scenario: 移动端适配
- GIVEN 用户在移动设备上访问
- WHEN 用户点击悬浮按钮
- THEN 对话框以适配移动端尺寸的形式展开（可能是更大区域或近全屏）
- AND 交互模式适配触控操作

### Requirement: 用户登录与身份识别

WHEN 用户首次使用 AI 对话功能, THE SYSTEM SHALL 要求用户登录（复用现有匿名登录体系：输入昵称即完成登录）。

#### Scenario: 已登录用户直接使用
- GIVEN 用户已通过现有登录体系完成登录（有 Supabase Auth session）
- WHEN 用户打开对话框
- THEN 直接进入对话界面，无需重复登录
- AND 加载该用户的历史对话列表

#### Scenario: 未登录用户引导登录
- GIVEN 用户未登录
- WHEN 用户打开对话框
- THEN 展示登录引导（输入昵称）
- AND 登录成功后进入对话界面

### Requirement: 对话持久化与多会话管理

WHEN 用户进行 AI 对话, THE SYSTEM SHALL 将所有对话记录持久化存储到 Supabase，并支持多会话管理。

#### Scenario: 对话自动保存
- GIVEN 用户正在进行对话
- WHEN 每发送/接收一条消息
- THEN 消息实时保存到数据库
- AND 刷新页面后对话记录不丢失

#### Scenario: 创建新对话
- GIVEN 用户已有至少一个对话
- WHEN 用户点击"新对话"按钮
- THEN 创建一个新的空对话
- AND 旧对话保留在历史列表中

#### Scenario: 切换历史对话
- GIVEN 用户有多个历史对话
- WHEN 用户在对话列表中选择某个历史对话
- THEN 加载该对话的完整消息记录
- AND 用户可以在该对话中继续发送消息

### Requirement: AI 人格与 System Prompt

WHEN AI 收到用户消息, THE SYSTEM SHALL 以预置的站长人格进行回复，让访客感受到近似与站长本人交流的体验。

#### Scenario: 人格一致性
- GIVEN AI 收到任何用户消息
- WHEN 生成回复
- THEN 回复风格保持坦率、真诚、大方的基调
- AND 回复中体现站长的性格特点、阅历和知识背景
- AND 默认使用简短回复（1-3 句），被明确要求时才展开

#### Scenario: 不了解的话题
- GIVEN 用户问到 AI 不了解或不合适的话题
- WHEN 生成回复
- THEN 坦率回应"这个我不太了解"或"这个不太适合聊"
- AND 不编造信息，不装作知道

#### Scenario: 语言跟随
- GIVEN 用户使用某种语言发消息
- WHEN 生成回复
- THEN 使用与用户相同的语言回复

#### System Prompt 结构（参考 ryos 分层设计）
硬编码在功能代码中，与代码一起维护。结构如下：

1. **身份层**：名字、职业、所在地、性格类型等基本信息
2. **背景层**：教育经历、工作经历、重要人生节点
3. **风格层**：说话习惯、口头禅、情绪表达方式、回复长度偏好
4. **行为层**：对话规则（语言跟随、不编造、坦率回应）、边界处理
5. **知识层**：技术栈、作品集简介、专业领域知识

具体内容需站长本人填充，格式为结构化文本，总长度控制在 1500-2000 tokens 以内（预留足够的对话上下文空间）。

### Requirement: 流式响应

WHEN AI 生成回复, THE SYSTEM SHALL 以流式（SSE）方式逐步输出内容，实现打字机效果。

#### Scenario: 流式输出
- GIVEN 用户发送了一条消息
- WHEN 服务端开始生成 AI 回复
- THEN 前端以流式方式逐步渲染回复内容（打字机效果）
- AND 用户可以在流式输出过程中看到内容逐步出现

### Requirement: 每日对话限制

WHEN 用户在一天内发送消息, THE SYSTEM SHALL 对每位用户实施每日消息数量上限。

#### Scenario: 正常使用
- GIVEN 用户今日消息数量未达上限（25 条/天）
- WHEN 用户发送消息
- THEN 正常处理并返回 AI 回复

#### Scenario: 达到限制
- GIVEN 用户今日消息数量已达上限
- WHEN 用户尝试发送消息
- THEN 展示友好提示："今天聊得够多啦，明天再来吧"
- AND 输入框禁用，不允许发送

#### Scenario: 无感限额
- GIVEN 用户正在使用对话功能
- WHEN 对话进行中
- THEN 不展示剩余额度数字，避免造成焦虑
- AND 仅在达到上限时展示友好提示

### Requirement: 服务端 API 代理

WHEN 前端发起 AI 对话请求, THE SYSTEM SHALL 通过 Cloudflare Pages Functions 代理调用 DeepSeek API，确保 API Key 不暴露在前端。

#### Scenario: API 代理调用
- GIVEN 用户发送一条消息
- WHEN 前端发起请求到 `/api/chat`
- THEN Cloudflare Function 附上 DS API Key 转发给 DeepSeek API
- AND 以 SSE 流式返回 AI 回复

#### Scenario: API Key 安全
- GIVEN 任何浏览器端操作
- WHEN 检查网络请求
- THEN DeepSeek API Key 不出现在任何前端可见的位置
- AND API Key 仅存储在 Cloudflare Pages 的环境变量中

### Requirement: 部署架构调整

WHEN 项目构建和部署, THE SYSTEM SHALL 在现有 Cloudflare Pages 静态部署基础上，新增 Functions 能力以支持服务端 API 代理。

#### Scenario: 部署变更
- GIVEN 项目使用 GitHub Actions + `wrangler pages deploy out`
- WHEN 部署到 Cloudflare Pages
- THEN `functions/` 目录中的函数文件被自动识别并部署为 Cloudflare Workers
- AND 静态导出的 `out/` 目录和 `functions/` 目录一起部署
- AND 现有的静态站点功能不受影响

### 约束与边界

- **技术约束**：站点为 Next.js 15 静态导出（`output: 'export'`），部署在 Cloudflare Pages，不可改为 SSR 模式
- **后端约束**：除 Cloudflare Functions 外无独立服务端，数据存储依赖 Supabase
- **成本约束**：DeepSeek API 费用由站长个人承担，需通过每日消息限制控制成本
- **设计约束**：有设计稿（尚未提供），UI 实现需等设计稿确认
- **体验约束**：以 PC 端为主，移动端做基本适配
- **模型选择**：使用 DeepSeek API（具体模型待定，优先 deepseek-chat）
- **人格内容**：System Prompt 中的个人信息内容需站长本人后续填充

### 置信度评估

| 需求 | 置信度 | 说明 |
|------|--------|------|
| 悬浮入口与对话窗口 | 80% | 交互形态已口述确认，但设计稿未提供，细节可能调整 |
| 用户登录与身份识别 | 95% | 复用现有体系，代码已实现 |
| 对话持久化与多会话 | 95% | Supabase 方案明确，类似评论系统的实现模式 |
| AI 人格与 System Prompt | 70% | 结构已确定（参考 ryos），但具体内容需站长填充 |
| 流式响应 | 95% | 技术方案明确（SSE + Cloudflare Functions） |
| 每日对话限制 | 90% | 数字（25条/天）已确认，具体限流机制待设计 |
| 服务端 API 代理 | 95% | Cloudflare Functions 方案明确 |
| 部署架构调整 | 85% | 需验证 `wrangler pages deploy` 对 functions 目录的支持方式 |

---

## 迭代 2 - 2026-07-31

### Requirement: Portfolio-only MVP

WHEN 用户访问 `/portfolio`, THE SYSTEM SHALL 仅在桌面端展示固定于浏览器窗口底部的 AI ChatInput；其他页面和移动端暂不展示。

#### Scenario: 三态布局
- GIVEN 用户位于 `/portfolio` 桌面端
- WHEN ChatInput 无输入、未聚焦且鼠标移出
- THEN 展示 360×51 收起态
- WHEN 用户 hover、聚焦、有输入或 AI 正在回复
- THEN 展示 480×129 输入态
- WHEN 用户点击展开按钮
- THEN 展示 560×420 展开态
- AND ChatInput 水平居中、距视口底部 48px

#### Scenario: 内容呈现范围
- GIVEN 用户正在进行首版对话
- WHEN 用户发送消息或 AI 流式回复
- THEN 暂不展示用户消息气泡和完整消息列表
- AND AI 回复仅显示在顶部 title 区域

### Requirement: 昵称内联录入

WHEN 用户未认证或尚未创建 profile, THE SYSTEM SHALL 复用 ChatInput 的 textarea 录入昵称，不打开独立弹窗。

#### Scenario: 输入昵称
- GIVEN 用户未完成身份识别
- WHEN ChatInput 处于收起态
- THEN placeholder 仍展示默认文案 `Ask me anything…`
- WHEN ChatInput 展开
- THEN title 展示“取个昵称再开始聊天吧”
- AND placeholder 展示“1~20个字符内, 账号基于访问设备记录哦…”
- WHEN 用户按 Enter 或点击发送按钮
- THEN 提交 1～20 个字符昵称
- AND 成功后进入正常聊天模式
- AND 失败原因展示在 title 区域

#### Scenario: 设备自动登录
- GIVEN 当前浏览器设备已完成过匿名注册且本地 session 未被清除
- WHEN 用户后续再次访问站点
- THEN Supabase 自动恢复同一个匿名 Auth user
- AND 系统加载该 user 对应的 profile 与聊天数据
- AND 不再次调用匿名注册或创建新的 user id

#### Scenario: 输入法确认不误提交昵称
- GIVEN 用户正在使用中文等输入法组合昵称
- WHEN 用户按 Enter 确认候选文字
- THEN 仅完成输入法 composition，不提交昵称
- AND composition 结束后的短暂窗口内忽略同一次 Enter
- AND 用户可再次明确按 Enter 或点击发送按钮提交昵称
- AND 昵称自身仍允许包含空格

### Requirement: 键盘、Tooltip 与国际化

WHEN 页面当前焦点不在可编辑控件内且用户按 Enter, THE SYSTEM SHALL 展开 ChatInput 并聚焦 textarea。

WHEN 用户 hover 展开或收起控件, THE SYSTEM SHALL 使用项目已有的 Radix Tooltip 展示提示，并通过 LanguageContext 提供中英文文案及 aria-label。

### Requirement: 本地 API 联调

WHEN 应用运行于 Next.js 开发模式, THE SYSTEM SHALL 默认将聊天请求发送至 `http://localhost:8788/api/chat`，避免请求落到不加载 Pages Functions 的 Next dev 端口。

WHEN 本地只启动 Next.js 前端且 `localhost:8788` 无法连接, THE SYSTEM SHALL 自动重试线上 `https://alii.work/api/chat`，保证聊天能力可用。

WHEN 本地 Wrangler 已启动但返回业务错误响应, THE SYSTEM SHALL 保留该响应而不切换线上服务，避免掩盖本地 Function 问题。

WHEN 应用部署到 Cloudflare Pages, THE SYSTEM SHALL 使用同源 `/api/chat`。

THE SYSTEM SHALL 允许通过 `NEXT_PUBLIC_CHAT_API_URL` 显式覆盖聊天 API 地址；显式配置后不启用自动兜底。

WHEN 开发者需要完整本地联调, THE SYSTEM SHALL 启动 Next dev 与 Wrangler Pages dev，并确保 Wrangler 命中 `functions/api/chat.js`。

### Requirement: 开发限额开关

WHEN 本地联调需要关闭每日 25 条限制, THE SYSTEM SHALL 同时支持：前端 `NEXT_PUBLIC_CHAT_DISABLE_RATE_LIMIT=true` 与 Function `DISABLE_CHAT_RATE_LIMIT=true`。

生产环境未显式配置上述开关时，THE SYSTEM SHALL 保持每日限额。

### Requirement: MVP 错误文案

WHEN DeepSeek API 请求失败或前端无法解析服务端错误响应, THE SYSTEM SHALL 展示“Alii 走神了，晚点再来试试吧…”。

### Requirement: MVP 会话创建与延续

WHEN 已登录用户直接发送消息, THE SYSTEM SHALL 默认复用当前会话，并持续追加消息，不自动拆分新的对话。

#### Scenario: 显式创建新对话
- GIVEN 用户已登录且当前没有正在生成的回复
- WHEN 用户点击底部操作区左一按钮
- THEN 创建新的空会话并将其设为当前会话
- AND 清空当前展示的消息与输入内容
- AND 后续消息写入新会话

#### Scenario: 默认连续对话
- GIVEN 当前已有会话
- WHEN 用户继续发送消息且未点击左一按钮
- THEN 复用同一 conversation_id
- AND 携带该会话最近消息作为上下文

### Requirement: 展开态消息列表

WHEN ChatInput 处于 480×129 输入态且用户已完成昵称登录, THE SYSTEM SHALL 在输入框上方的 title 区域展示当前会话的用户消息与 AI 消息。

#### Scenario: 消息视觉层级
- GIVEN 当前会话存在消息
- WHEN 展开 ChatInput
- THEN 消息区限制在 480×129 外框顶部预留的 30px title 行内
- AND 用户消息右对齐，左侧预留 48px，使用 8px 圆角气泡
- AND AI 消息左对齐，右侧预留 48px，以无气泡正文形式展示
- AND 消息文本使用 14px 字号和 24px 行高

#### Scenario: 消息滚动
- GIVEN 消息内容超过可视范围
- WHEN 展开 ChatInput 或收到新的流式内容
- THEN 消息区允许纵向滚动且隐藏可见滚动条，不得越出 ChatInput 外框
- AND 视图自动跟随至最新消息

#### Scenario: AI 消息跨收展保留
- GIVEN 当前回复已经收到完整或部分 AI 文本
- WHEN SSE 发送完成标记、直接关闭、超时或连接中断
- THEN 已收到的 AI 文本固化到当前会话的前端消息状态且只追加一次
- AND 用户折叠 ChatInput 后再次打开时，用户消息与 AI 消息按原顺序继续展示

#### Scenario: 流式回复
- GIVEN 用户提交了一条有效消息
- WHEN 请求正在进行或收到 SSE 内容片段
- THEN ChatInput 立即进入 480×129 输入态并展开 title 消息列表，展示“Alii 正在想…”
- AND 收到片段后将其作为末尾 AI 消息持续更新
- AND 思考提示与流式 AI 消息使用高频、高对比 token 的 ShinyText 动效，完成后恢复普通文本

#### Scenario: 回复期间预先输入
- GIVEN AI 正在生成上一条消息的回复
- WHEN 用户继续在 textarea 中输入下一条消息
- THEN textarea 保持可编辑并保存当前输入内容
- AND 发送按钮保持禁用，Enter 不触发重复发送
- AND 当前回复完成后发送按钮根据输入内容恢复可用

#### Scenario: 聚焦态消息展示分支
- GIVEN 输入框已聚焦且用户已登录
- WHEN 输入框处于 480×129 非放大态
- THEN title 区在外框 flex 文档流中展开完整消息列表，不使用 absolute
- AND title 区使用 h-fit、最大高度 50vh 和 overflow hidden
- AND 输入框区域保持 99px，外框包裹 title 与输入框区域的合计高度
- AND 超过最大高度时裁切较早消息，底部最新消息保持可见
- WHEN 输入框处于 560×420 放大态
- THEN title 区保持 30px 单行高度
- AND 只显示当前最新一条消息的行首文本
- AND 超出可用宽度的文本使用单行 truncate

#### Scenario: 展开开关 hover 独立
- GIVEN ChatInput 处于输入态或展开态
- WHEN 指针 hover 展开/收起开关
- THEN 开关仅使用自身按钮的 hover 状态
- AND 不通过 group hover 继承输入框容器的 hover 样式
- AND ChatInput 收起时隐藏该开关，仅保留角标式展开控件

### Requirement: 跨页面同步、操作提示与常驻状态

WHEN 用户位于 `/portfolio` 或 `/resume`, THE SYSTEM SHALL 展示同一 ChatInput 实例，并在两个页面之间共享输入、收展、会话、消息和流式状态。

#### Scenario: 跨页面保持状态
- GIVEN 用户已在 `/portfolio` 或 `/resume` 打开 ChatInput、输入文本或发起回复
- WHEN 用户在这两个页面之间导航
- THEN ChatInput 保持相同位置和视觉状态
- AND 当前输入、会话、消息、流式回复与常驻状态不重置
- AND 路径判断兼容静态导出的末尾斜杠，并在客户端 hydration 后使用浏览器 pathname 兜底
- AND 其他路由不展示 ChatInput

#### Scenario: 操作按钮提示
- GIVEN ChatInput 处于输入态
- WHEN 用户 hover 新对话或历史对话按钮
- THEN 使用项目 Radix Tooltip 分别展示本地化的“开始新对话”和“历史对话”
- AND disabled 的历史对话按钮仍可触发 Tooltip

#### Scenario: 常驻展开
- GIVEN ChatInput 处于输入态
- WHEN 用户点击底部操作区最左侧 Pin 按钮
- THEN ChatInput 保持输入态，不因失焦或鼠标移出而收起
- AND Pin 按钮使用 24×24 热区与 16×16 图标，与同组操作按钮尺寸一致
- AND Pin 按钮展示选中状态及本地化 Tooltip
- WHEN 用户再次点击 Pin 按钮
- THEN 取消常驻，并恢复原有自动收起规则

#### Scenario: Chat 静态文案国际化
- GIVEN 用户切换中英文语言
- WHEN ChatInput 展示 placeholder、思考态、昵称校验、限额或错误反馈
- THEN 所有用户可见静态文案均通过 LanguageContext 输出对应语言

### 范围说明

本迭代不实现全站入口、移动端适配、完整历史会话面板和多会话切换 UI；ChatInput 当前仅在 `/portfolio` 与 `/resume` 桌面端展示。
