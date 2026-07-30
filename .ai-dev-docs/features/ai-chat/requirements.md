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
