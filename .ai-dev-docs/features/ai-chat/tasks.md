# 任务清单 - AI Chat（硅基分身对话）

## 初始任务 - 2025-07-30

### 基础设施 Tasks

- [ ] 1. Supabase 建表与配置
    - [ ] 1.1 创建 `site_chat_conversations` 表（含索引、updated_at trigger）
    - [ ] 1.2 创建 `site_chat_messages` 表（含索引、每日限额复合索引）
    - [ ] 1.3 配置 RLS 策略（conversations 四策略 + messages 两策略）
    - [ ] 1.4 测试 RLS：验证用户只能读写自己的数据

- [x] 2. Cloudflare Pages Function
    - [x] 2.1 创建 `functions/api/chat.js` 基础骨架（请求解析、错误处理框架）
    - [x] 2.2 实现 JWT 验证（从 Authorization header 提取并验证 Supabase JWT）
    - [x] 2.3 实现每日限额检查（查询 Supabase 当日 user 消息计数）
    - [x] 2.4 实现 DeepSeek API 调用（拼装 messages、streaming 请求）
    - [x] 2.5 实现 SSE 流式响应转发（逐 chunk 转发给前端）
    - [x] 2.6 实现流结束后 AI 回复写入 Supabase（service key）
    - [x] 2.7 环境变量配置约定（DEEPSEEK_API_KEY、SUPABASE_SERVICE_KEY、SUPABASE_URL；仅服务端）

- [ ] 3. 部署配置调整
    - [ ] 3.1 调整 GitHub Actions deploy.yml（deploy job 增加 checkout 步骤）
    - [ ] 3.2 在 Cloudflare Dashboard 配置环境变量
    - [ ] 3.3 本地验证 functions 目录被正确识别（`npx wrangler pages dev out`）

### 数据层 Tasks

- [ ] 4. System Prompt
    - [x] 4.1 创建 `src/data/system-prompt.js`（分层结构骨架 + 占位内容）
    - [ ] 4.2 填充站长个人信息（身份、背景、风格、知识 — 需站长配合）

- [x] 5. useChat Hook
    - [x] 5.1 会话 CRUD：加载会话列表、创建新会话、删除会话
    - [x] 5.2 消息加载：根据 conversation_id 加载消息列表，并恢复最近会话
    - [x] 5.3 发送消息：写入 DB → 调用 /api/chat → SSE 流式接收
    - [x] 5.4 流式状态管理：isStreaming、streamingContent 状态控制
    - [x] 5.5 限额管理：本地乐观标记 + 服务端 429 响应处理
    - [x] 5.6 自动创建首次会话：用户首次使用时自动创建一个新会话
    - [x] 5.7 会话标题自动生成：首条消息发送后用消息内容前 20 字作为标题

### UI 组件 Tasks

> 2026-07-31 范围调整：前端首版以 Figma ChatInput 为准，仅挂载在 `/portfolio` 页。实现收起/输入/展开三种尺寸状态与模型链路；用户消息、历史会话等完整聊天 UI 后续再细化。

- [x] 6. Portfolio ChatInput 入口
    - [x] 6.1 严格参照 Figma 节点实现 360×51 默认态、480×129 聚焦态、560×420 展开态
    - [x] 6.2 实现默认收起、hover 展开、空输入移出收起、有输入/聚焦不收起
    - [x] 6.3 实现右上角展开/缩小 toggle
    - [x] 6.4 回复仅展示在顶部 title 区，暂不展示用户消息
    - [x] 6.5 仅在 `/portfolio` 挂载，桌面端显示，距视口底部 48px 居中

- [ ] 6B. 原通用悬浮入口（后续范围）
    - [ ] 6.1 创建 `ChatBubble.jsx`（固定定位、hover/click 展开对话框）
    - [ ] 6.2 在 `layout.js` 中全局挂载 ChatBubble

- [ ] 7. 对话窗口
    - [ ] 7.1 创建 `ChatDialog.jsx`（对话窗口容器，含展开/收起动画）
    - [ ] 7.2 创建 `ChatHeader.jsx`（标题 + 新对话按钮 + 会话列表入口）
    - [ ] 7.3 创建 `MessageList.jsx`（消息列表，自动滚动到底部）
    - [ ] 7.4 创建 `MessageItem.jsx`（消息气泡，区分 user/assistant 样式）
    - [ ] 7.5 创建 `ChatInput.jsx`（输入框 + 发送按钮 + 限额禁用状态）
    - [ ] 7.6 创建 `ConversationList.jsx`（历史对话列表面板）

- [ ] 8. 登录引导
    - [ ] 8.1 对话框内未登录状态处理（展示登录引导，复用 NicknameDialog 逻辑）

- [ ] 9. 流式渲染
    - [ ] 9.1 实现打字机效果（逐字渲染 streamingContent）
    - [ ] 9.2 流式过程中的 loading 指示器（AI 正在思考...）

- [ ] 10. 移动端适配
    - [ ] 10.1 对话框移动端布局（接近全屏或较大区域）
    - [ ] 10.2 触控交互适配

### 集成 Tasks

- [ ] 11. 全局集成与联调
    - [ ] 11.1 ChatBubble + ChatDialog + useChat 串联
    - [ ] 11.2 Auth 状态集成（未登录 → 登录引导 → 对话）
    - [ ] 11.3 端到端联调（前端 → CF Function → DeepSeek → 流式回复 → DB 持久化）
    - [ ] 11.4 限额流程联调（正常使用 → 达到限额 → 友好提示 → 次日重置）

---

## 迭代 2 任务 - 2026-07-31

- [x] 12. Portfolio-only 三态 ChatInput
    - [x] 12.1 实现 360×51、480×129、560×420 三种尺寸
    - [x] 12.2 使用 Portal 保证 fixed 定位，距视口底部 48px
    - [x] 12.3 实现 hover、focus、有输入、streaming 与手动展开状态
    - [x] 12.4 使用明确的外框与内框高度动画消除回弹
    - [x] 12.5 回复仅显示在 title 区域

- [x] 13. 昵称内联录入
    - [x] 13.1 根据 auth/profile 状态切换昵称模式
    - [x] 13.2 复用 textarea 提交 1～20 字昵称
    - [x] 13.3 在 title 展示提交态和错误态，不再弹出 NicknameDialog

- [x] 14. 控件、Tooltip 与 i18n
    - [x] 14.1 复用 IconTextButton 和 Radix Tooltip
    - [x] 14.2 展开/收起按钮使用 24×24 热区与 16×16 token 图标
    - [x] 14.3 增加聊天控件与昵称引导的中英文文案

- [x] 15. 本地 Cloudflare 联调
    - [x] 15.1 Wrangler Pages dev 在 8788 加载 `/api/chat`
    - [x] 15.2 开发模式默认请求 `http://localhost:8788/api/chat`
    - [x] 15.3 生产模式保持同源 `/api/chat`
    - [x] 15.4 支持 `NEXT_PUBLIC_CHAT_API_URL` 显式覆盖
    - [x] 15.5 支持前后端本地限额关闭开关

- [x] 16. 数据与错误处理
    - [x] 16.1 修复 history 重复携带当前消息
    - [x] 16.2 恢复最近会话和历史消息
    - [x] 16.3 移除关键 PostgREST `.single()`，避免空结果触发 406
    - [x] 16.4 统一 DeepSeek 失败文案为“Alii 走神了，晚点再来试试吧…”

- [ ] 17. 部署与数据验收
    - [ ] 17.1 执行并验证 `setup.sql`、RLS 与索引
    - [ ] 17.2 配置线上 Cloudflare secrets
    - [ ] 17.3 端到端验证 SSE 与 assistant 消息持久化
