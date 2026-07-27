# Rules 模板结构参考

本文件不是填空模板，而是告诉 agent "项目级 rules 应该包含哪些章节"的结构参考。agent 在初始化时读取项目实际信息后，参照此结构生成内容。

---

## Rules 文件应包含的章节

### 1. 文件头（frontmatter）

根据目标 AI 工具的 rules 格式生成。示例：

**CatPaw / Codex 格式**：
```yaml
---
description: 开发工作流
globs: *
ruleType: Always
---
```

**Cursor 格式**：按 Cursor rules 规范生成。

**Claude Code 格式**：纯 markdown，无 frontmatter。

### 2. 标题和简介

```markdown
# Spec Driven Workflow

**Specification-Driven Workflow:**
Bridge the gap between requirements and implementation with automated review and validation.
```

### 3. 本仓库约定（项目特定，必须包含）

这是 rules 的核心价值——记录项目特定信息，让 agent 在没有 skill 触发时也能遵循。

需要包含的信息（全部从环境探测中获取）：

- **项目类型**：前端应用 / 后端服务 / 全栈 / CLI 工具 / 库 等
- **技术栈**：框架、语言版本、关键依赖
- **代码结构**：主要目录及其职责
- **包管理**：包管理器 + 常用脚本命令
- **任务拆分策略**：前后端分离 / 按模块 / 按功能点
- **规格文档根目录**：`.ai-dev-docs/`

示例：

```markdown
## 本仓库约定

- **项目类型**：前端应用（React + Vite），数据与鉴权通过 Supabase 集成。
- **规格文档根目录**：`.ai-dev-docs/`
- **代码结构**：
  - `src/components/`：UI 组件
  - `src/pages/`：页面级组件
  - `src/hooks/`：React Hooks
  - `src/utils/`：工具函数
- **技术栈**：React 18、Vite、Tailwind CSS、Supabase。
- **包管理**：npm；常用脚本：`npm run dev`、`npm run build`、`npm run lint`。
- **任务拆分**：以「前端任务」为主；涉及数据时拆为「前端 + 数据/接口」子任务。
```

### 4. 文档目录结构（通用，精简版）

从 SKILL.md 中的目录结构精简而来，让 agent 知道文档放在哪里：

```markdown
## 文档目录结构

.ai-dev-docs/
├── features/          # 功能特性（资产沉淀）
│   └── <name>/
│       ├── requirements.md
│       ├── design.md
│       ├── tasks.md
│       └── qa.md
├── bugs/              # Bug 修复（可选）
├── refactoring/       # 重构（可选）
└── temp/              # 临时文件（交付时清理）
```

### 5. 核心文档说明（通用，精简版）

```markdown
## 核心文档

- **requirements.md**：需求规范（EARS 格式，增量更新）
- **design.md**：技术设计（架构、接口、数据模型，增量更新）
- **tasks.md**：任务清单（分层拆分，实时更新进度，增量更新）
- **qa.md**：验收项清单（验证类型、阻塞级别、验收结果，增量更新）
```

### 6. 流程概览（通用，精简版）

8-Phase 的一句话概览，不需要完整 checklist（那些在 skill 的 references 里）：

```markdown
## 执行工作流（8-Phase Loop）

Phase 0: INITIALIZE → 清理环境、确定 Feature、准备文档
Phase 1: ANALYZE ⭐ → 生成 requirements.md → 暂停确认
Phase 2: DESIGN ⭐ → 生成 design.md + tasks.md + qa.md → 暂停确认
Phase 3: IMPLEMENT ⭐ → 编写代码、更新 tasks.md → 暂停确认
Phase 4: GAP ANALYSIS → Subagent 对比需求与实现
Phase 5: VALIDATE → 运行验证、更新 qa.md
Phase 6: REFLECT → 重构、更新文档
Phase 7: HANDOFF → 生成摘要、清理 temp

⭐ = 强制暂停点
```

### 7. 验证命令（项目特定，必须包含）

从项目配置中提取的实际验证命令：

```markdown
## 验证命令

​```bash
# 项目根目录执行
npm install
npm run lint
npm run build
# npm test（如有）
​```
```

### 8. 常见错误提醒（通用）

```markdown
## 常见错误

| 错误 | 正确做法 |
|------|---------|
| 将临时文档放在 feature 目录 | 放在 .ai-dev-docs/temp/ |
| UPDATE 模式覆盖现有文档 | 用 --- 分隔符追加新内容 |
| Phase 7 不清理 temp | 必须执行 rm -rf .ai-dev-docs/temp/* |
```

---

## 生成原则

- rules 文件应尽量精简（目标 200-400 行），只包含 agent 日常需要的信息
- 完整的 Phase checklist 和文档格式规范由 skill 的 references 提供，rules 不重复
- 项目特定章节（3、7）是 rules 的核心价值，必须准确
- 通用章节（4、5、6、8）提供降级保障——即使 skill 未触发，agent 也能遵循基本流程
