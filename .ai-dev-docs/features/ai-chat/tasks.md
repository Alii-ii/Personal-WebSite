# 任务清单 - AI Chat（硅基分身对话）

## 初始任务 - 2025-07-30

### 基础设施 Tasks

- [ ] 1. Supabase 建表与配置
    - [ ] 1.1 创建 `site_chat_conversations` 表（含索引、updated_at trigger）
    - [ ] 1.2 创建 `site_chat_messages` 表（含索引、每日限额复合索引）
    - [ ] 1.3 配置 RLS 策略（conversations 四策略 + messages 两策略）
    - [ ] 1.4 测试 RLS：验证用户只能读写自己的数据

- [ ] 2. Cloudflare Pages Function
    - [ ] 2.1 创建 `functions/api/chat.js` 基础骨架（请求解析、错误处理框架）
    - [ ] 2.2 实现 JWT 验证（从 Authorization header 提取并验证 Supabase JWT）
    - [ ] 2.3 实现每日限额检查（查询 Supabase 当日 user 消息计数）
    - [ ] 2.4 实现 DeepSeek API 调用（拼装 messages、streaming 请求）
    - [ ] 2.5 实现 SSE 流式响应转发（逐 chunk 转发给前端）
    - [ ] 2.6 实现流结束后 AI 回复写入 Supabase（service key）
    - [ ] 2.7 环境变量配置文档（DEEPSEEK_API_KEY、SUPABASE_SERVICE_KEY、SUPABASE_URL）

- [ ] 3. 部署配置调整
    - [ ] 3.1 调整 GitHub Actions deploy.yml（deploy job 增加 checkout 步骤）
    - [ ] 3.2 在 Cloudflare Dashboard 配置环境变量
    - [ ] 3.3 本地验证 functions 目录被正确识别（`npx wrangler pages dev out`）

### 数据层 Tasks

- [ ] 4. System Prompt
    - [ ] 4.1 创建 `src/data/system-prompt.js`（分层结构骨架 + 占位内容）
    - [ ] 4.2 填充站长个人信息（身份、背景、风格、知识 — 需站长配合）

- [ ] 5. useChat Hook
    - [ ] 5.1 会话 CRUD：加载会话列表、创建新会话、删除会话
    - [ ] 5.2 消息加载：根据 conversation_id 加载消息列表
    - [ ] 5.3 发送消息：写入 DB → 调用 /api/chat → SSE 流式接收
    - [ ] 5.4 流式状态管理：isStreaming、streamingContent 状态控制
    - [ ] 5.5 限额管理：本地乐观标记 + 服务端 429 响应处理
    - [ ] 5.6 自动创建首次会话：用户首次使用时自动创建一个新会话
    - [ ] 5.7 会话标题自动生成：首条消息发送后用消息内容前 20 字作为标题

### UI 组件 Tasks

- [ ] 6. 悬浮入口
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
