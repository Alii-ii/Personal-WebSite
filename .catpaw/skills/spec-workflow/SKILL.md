---
name: spec-workflow
description: |
  Specification-Driven Development Workflow — 用结构化文档驱动 AI Coding 全流程。
  自动生成并维护 requirements.md / design.md / tasks.md / qa.md 四份核心文档，
  通过 8 阶段循环（Analyze → Design → Implement → Gap Analysis → Validate → Reflect → Handoff）
  和强制暂停点确保人机对齐。支持 feature 开发、bug 修复、重构三种场景。
  Use when: "spec workflow", "开始开发", "新功能", "新需求", "帮我做这个功能",
  "初始化 spec-workflow", "安装 spec-workflow", "按流程开发", "spec driven",
  "需求分析", "技术设计", "任务拆分", "gap 分析", "验收", "交付".
---

# Spec-Driven Workflow

用结构化文档驱动 AI Coding：在需求与实现之间建立可追溯、可验收、可复用的文档链路。

---

## 两种使用模式

根据用户意图和项目状态自动判断：

### 模式 A：初始化（首次接入项目）

当用户说"初始化 spec-workflow"、"安装 spec-workflow"，或当前项目没有 `.ai-dev-docs/` 目录时，进入初始化流程。

### 模式 B：执行开发流程

当项目已有 `.ai-dev-docs/` 目录，且用户描述了具体需求时，直接进入 8-Phase 开发流程。

---

## 模式 A：项目初始化

### Step 1：环境探测

自动检测以下信息，不逐项询问用户：

**读取文件系统推断**：
- 包管理器：`package-lock.json`（npm）/ `pnpm-lock.yaml`（pnpm）/ `yarn.lock`（yarn）/ `Cargo.toml`（rust）/ `go.mod`（go）/ `pyproject.toml`（python）等
- 技术栈：从依赖声明、框架配置文件推断
- 代码结构：扫描顶层和 `src/` 目录，识别组件、页面、工具等目录
- 验证命令：从 `package.json` scripts 或等效配置中提取 lint / test / build 命令
- 已有 AI 工具配置：检查 `.catpaw/`、`.codex/`、`.cursor/`、`.claude/` 目录是否存在

**向用户确认**：
- 探测结果是否准确
- 任务拆分策略偏好（前后端分离 / 按模块 / 按功能点）
- 是否有额外项目约定需要补充

### Step 2：生成 rules 文件

根据探测结果，读取 `templates/rules-template.md` 了解 rules 应包含的章节结构，然后生成项目专属的 rules 文件。

**rules 落地位置**（自动识别）：

| 已有目录 | 落地路径 |
|---------|---------|
| `.catpaw/rules/` | → 写入该目录（CatDesk / CatPaw） |
| `.codex/rules/` | → 写入该目录（Codex） |
| `.cursor/rules/` | → 写入该目录（Cursor） |
| `.claude/` | → 写入 `CLAUDE.md` 或 `.claude/rules/`（Claude Code） |
| 多个共存 | → 每个目录都生成一份 |
| 都没有 | → 询问用户使用哪个 AI 工具，创建对应目录 |

**rules 文件的职责**：只包含项目特定配置（技术栈、目录结构、验证命令、任务拆分策略），不重复流程定义。这样 agent 在没有 skill 触发时也能遵循基本约定。

### Step 3：创建 .ai-dev-docs 目录

```bash
mkdir -p .ai-dev-docs/features
mkdir -p .ai-dev-docs/temp
# bugs/ 和 refactoring/ 按需创建，不预创建空目录
```

### Step 4：确认完成

向用户展示：生成了哪些文件、探测到的项目信息、后续如何使用。

---

## 模式 B：执行开发流程（8-Phase Loop）

### 流程概览

```
Phase 0: INITIALIZE → 清理环境 → 确定 Feature → 准备文档结构
    ↓
Phase 1: ANALYZE ⭐ → 理解需求 → 生成 requirements.md
    ↓ [🛑 暂停 - 等待用户确认需求]
Phase 2: DESIGN ⭐ → 技术设计 → 生成 design.md + tasks.md + qa.md
    ↓ [🛑 暂停 - 展示人工 P0 验收项 - 等待用户确认设计]
Phase 3: IMPLEMENT ⭐ → 编写代码 → 实时更新 tasks.md
    ↓ [🛑 暂停 - 等待用户确认实现]
Phase 4: GAP ANALYSIS → Subagent 对比需求与实现 → 补完缺失
    ↓
Phase 5: VALIDATE → 运行验证 → 更新 qa.md 自动化项 → 提醒人工验收项
    ↓
Phase 6: REFLECT → 重构 → 更新文档 → 确认 qa.md 完整
    ↓
Phase 7: HANDOFF → 生成摘要 → 清理 temp → 验证文档位置
    ↓ [🎉 完成]

⭐ = 强制暂停点，必须等待用户确认
```

### 执行前：按需读取详细定义

进入任何 Phase 前，读取 `references/phases.md` 获取该 Phase 的完整 checklist 和约束。

生成或更新核心文档时，读取 `references/document-formats.md` 获取格式规范。

### 核心原则

**文档即资产** — requirements.md / design.md / tasks.md / qa.md 跟代码一起提交，跨迭代可追溯、可复用。

**暂停即对齐** — Phase 1 / 2 / 3 完成后强制暂停，确保人机在同一认知基础上继续。Phase 4-7 是机械执行，不涉及方向性决策。

**增量不覆盖** — UPDATE 模式下用 `---` 分隔符追加新内容，保留历史记录。

**temp 是临时的** — gap 分析、devdoc、validation 报告等过程文档放 `.ai-dev-docs/temp/`，Phase 7 结束时清理。feature 目录只放核心文档和参考文件。

**参考文件可共存** — `.ai-dev-docs` 中除了 .md 核心文档，也允许 .json / .yaml 等参考文件（API schema、DOM 结构快照等），放在对应 feature 目录下为 agent 提供上下文。

### 暂停时的用户响应

| 输入 | 缩写 | 行为 |
|------|------|------|
| `continue` | `c` | 确认当前阶段，继续下一阶段 |
| `modify` | `m` | 根据反馈修改当前阶段输出 |
| `abort` | `a` | 终止工作流，保存当前进度 |
| 具体反馈 | - | 调整后重新输出检查点 |

### 文档目录结构

```
.ai-dev-docs/
├── features/                           # 功能特性（资产沉淀）
│   └── <feature-name>/                 # kebab-case 命名
│       ├── requirements.md             # 需求规范（EARS 格式）
│       ├── design.md                   # 技术设计
│       ├── tasks.md                    # 任务清单
│       ├── qa.md                       # 验收项清单
│       ├── *.json / *.yaml             # 参考文件（可选）
│       └── history/                    # 历史快照（可选）
│
├── bugs/                               # Bug 修复（可选，复杂 bug 使用）
│   └── <bug-name>/
│       ├── requirements.md             # Bug 描述 + 复现步骤
│       ├── design.md                   # 修复方案
│       └── tasks.md                    # 修复任务
│
├── refactoring/                        # 重构（可选，大规模重构使用）
│   └── <refactor-name>/
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
│
└── temp/                               # 临时文件（Phase 7 清理）
    ├── gap-*.md
    ├── devdoc-*.md
    ├── validation-*.md
    └── handoff-*.md
```

---

## 快速参考

### 何时读取 references

| 时机 | 读取文件 |
|------|---------|
| 进入任意 Phase | `references/phases.md` 对应章节 |
| 生成/更新核心文档 | `references/document-formats.md` |
| 初始化项目 rules | `templates/rules-template.md` |

### 严格执行检查清单

**Phase 0 前**：清理 temp、确定 feature 名称、确定 CREATE/UPDATE 模式

**Phase 1-6 中**：临时文档只放 temp/、feature 目录只放核心文档 + 参考文件、UPDATE 模式追加不覆盖

**Phase 7 后**：清理 temp、验证文档位置、核心文档齐全
