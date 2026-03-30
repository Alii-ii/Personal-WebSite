---
description: 开发工作流
globs: *
ruleType: Always
---

# Spec Driven Workflow

**Specification-Driven Workflow:**
Bridge the gap between requirements and implementation with automated review and validation.

## 文档目录结构

### 标准目录结构

```
.ai-dev-docs/
├── features/                           # 功能特性目录（资产沉淀）
│   ├── user-authentication/            # Feature 1: 用户认证
│   │   ├── requirements.md             # 需求规范（增量更新）
│   │   ├── design.md                   # 技术设计（增量更新）
│   │   ├── tasks.md                    # 任务清单（增量更新）
│   │   └── history/                    # 历史版本（可选）
│   │       ├── v1-2025-12-18/
│   │       └── v2-2025-12-20/
│   └── payment-processing/             # Feature 2: 支付处理
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
│
├── bugs/                               # Bug 修复目录（可选）
│   ├── payment-null-pointer/           # Bug 1: 支付空指针异常
│   │   ├── requirements.md             # Bug 描述和复现步骤
│   │   ├── design.md                   # 修复方案设计
│   │   └── tasks.md                    # 修复任务清单
│   └── login-timeout/                  # Bug 2: 登录超时问题
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
│
├── refactoring/                        # 重构目录（可选）
│   ├── database-optimization/          # 重构 1: 数据库优化
│   │   ├── requirements.md             # 重构目标和范围
│   │   ├── design.md                   # 重构设计
│   │   └── tasks.md                    # 重构任务清单
│   └── code-cleanup/                   # 重构 2: 代码清理
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
│
└── temp/                               # 临时工作文件（不纳入资产）
    ├── gap-*.md                        # Gap 分析报告（按 feature 命名）
    ├── devdoc-*.md                     # 开发进度文档（按 feature 命名）
    ├── validation-*.md                 # 验证报告
    ├── improvements-*.md               # 改进建议
    ├── handoff-*.md                    # 交付摘要
    ├── analysis-*.md                   # 分析笔记
    ├── research-*.md                   # 研究文档
    ├── debug-*.md                      # 调试日志
    ├── summary-*.md                    # AI 总结文档
    ├── changes.md                      # 修改摘要
    ├── SUMMARY.md                      # 总结文档
    └── [任何其他临时 .md 文件]         # 除了核心文档外的所有 .md 文件
```

### 目录说明

#### 1. **功能特性目录（.ai-dev-docs/features/）**

- **用途**：存放功能开发的所有资产文档
- **命名规范**：使用 kebab-case，如 `user-authentication`、`pr-comment-optimization`
- **核心文档**（必须放在 feature 目录，用于资产沉淀）：
    - `requirements.md` - 需求规范
    - `design.md` - 技术设计
    - `tasks.md` - 任务清单
- **过程文档**（放在 temp 目录，不纳入资产）：
    - `gap-[feature-name].md` - Gap 分析
    - `devdoc-[feature-name].md` - 开发进度（可选，大型任务使用）
- **更新方式**：支持增量更新，新需求追加到现有文档，不覆盖
- **历史版本**：可选，保存重大变更的快照

#### 2. **Bug 修复目录（.ai-dev-docs/bugs/）**

- **用途**：存放 Bug 修复的文档（可选目录）
- **命名规范**：使用 kebab-case，描述 Bug 类型，如 `payment-null-pointer`、`login-timeout`
- **核心文档**：
    - `requirements.md` - Bug 描述、复现步骤、影响范围
    - `design.md` - 修复方案设计
    - `tasks.md` - 修复任务清单
- **何时使用**：
    - ✅ 复杂的 Bug，需要详细设计和多步骤修复
    - ❌ 简单的 Bug 修复，可以直接在代码中处理

#### 3. **重构目录（.ai-dev-docs/refactoring/）**

- **用途**：存放代码重构的文档（可选目录）
- **命名规范**：使用 kebab-case，描述重构内容，如 `database-optimization`、`code-cleanup`
- **核心文档**：
    - `requirements.md` - 重构目标、范围、原因
    - `design.md` - 重构设计、迁移策略
    - `tasks.md` - 重构任务清单
- **何时使用**：
    - ✅ 大规模重构，涉及多个模块
    - ✅ 需要详细规划和分步执行的重构
    - ❌ 小范围代码优化，可以直接在代码中处理

#### 4. **临时目录（.ai-dev-docs/temp/）**

- 存放过程中的临时文件
- **⚠️ 必须放在 temp 目录的文件（严格执行）**：
    - `gap-*.md` - Gap 分析报告
    - `devdoc-*.md` - 开发进度文档
    - `validation-*.md` - 验证报告
    - `improvements-*.md` - 改进建议
    - `handoff-*.md` - 交付摘要
    - `analysis-*.md` - 分析笔记
    - `research-*.md` - 研究文档
    - `debug-*.md` - 调试日志
    - `summary-*.md` - AI 总结文档
    - `changes.md` - 修改摘要
    - `SUMMARY.md` - 总结文档
    - **任何不是 requirements/design/tasks 的 .md 文件**
- 不纳入资产管理
- ⚠️ **严格禁止将临时文档放在 feature 目录**
- ⚠️ **每次开始新任务时必须清理 temp 目录**

---

## 维护核心文档

**必须沉淀的文档（放在 feature 目录）：**

- **`requirements.md`**: 需求规范（EARS 格式，增量更新）
- **`design.md`**: 技术设计（架构、接口、数据模型，增量更新）
- **`tasks.md`**: 任务清单（功能点细化，增量更新）

**过程文档（放在 temp 目录，不沉淀）：**

- **`gap-[feature-name].md`**: Gap 分析（每次实现后自动生成）
- **`devdoc-[feature-name].md`**: 开发进度（大型任务使用）

---

## 执行工作流（8-Phase Loop）

### 工作流概览

```
Phase 0: INITIALIZE
    ↓
    清理环境 → 确定 Feature → 准备文档结构
    ↓
Phase 1: ANALYZE ⭐ 必须暂停
    ↓
    理解需求 → 生成/更新 requirements.md
    ↓ [🛑 必须暂停 - 等待用户确认需求理解]
Phase 2: DESIGN ⭐ 必须暂停
    ↓
    技术设计 → 生成/更新 design.md + tasks.md
    ↓ [🛑 必须暂停 - 等待用户确认设计方案]
Phase 3: IMPLEMENT ⭐ 必须暂停
    ↓
    编写代码 → 实时更新 tasks.md（devdoc 放 temp）
    ↓ [🛑 必须暂停 - 等待用户确认实现结果]
Phase 4: GAP ANALYSIS (Subagent)
    ↓
    主 agent 触发 → Subagent 执行分析 → 生成 gap.md → 主 agent 接收结果
    ↓
    主 agent 完成缺失功能 → 重新触发 subagent → 重新生成 gap.md
    ↓
Phase 5: VALIDATE
    ↓
    运行测试 → 验证构建 → 确保质量
    ↓
Phase 6: REFLECT
    ↓
    代码重构 → 更新文档 → 记录改进点
    ↓
Phase 7: HANDOFF
    ↓
    生成摘要 → 清理 temp → 验证文档位置 → 完成交付
    ↓ [🎉 工作流完成]

⭐ = 关键阶段，必须暂停等待用户确认后才能继续
🛑 = 强制暂停点，不可跳过
```

---

## 阶段暂停机制

### 强制暂停规则

**⚠️ 核心原则：ANALYZE、DESIGN、IMPLEMENT 三个关键阶段完成后必须暂停，等待用户确认后才能继续。**

这三个阶段是开发流程中最关键的决策点：

| 阶段 | 暂停原因 | 用户需要确认的内容 |
|------|----------|--------------------|
| **ANALYZE** | 需求理解是核心基础 | 需求是否理解正确、是否有遗漏 |
| **DESIGN** | 设计决策影响全局 | 架构方案、任务拆分是否合理 |
| **IMPLEMENT** | 代码实现需要审查 | 实现是否符合预期、是否需要调整 |

### 用户响应选项

在关键阶段暂停时，用户可以选择：

| 用户输入 | 缩写 | 行为 |
|---------|------|------|
| `continue` | `c` | 确认当前阶段，继续执行下一阶段 |
| `modify` | `m` | 根据用户反馈修改当前阶段输出 |
| `abort` | `a` | 终止整个工作流，保存当前进度 |
| 具体反馈 | - | 根据反馈调整当前阶段，然后重新输出检查点 |

### 暂停状态记录

暂停状态会记录在 `devdoc` 中：

```markdown
## Workflow Status

- **Current Phase**: DESIGN
- **Checkpoints Passed**:
  - [x] Phase 0: INITIALIZE ✅ 2025-01-14 10:00
  - [x] Phase 1: ANALYZE ✅ 2025-01-14 10:15 (用户确认)
  - [ ] Phase 2: DESIGN (当前，等待用户确认)
- **User Decisions**:
  - ANALYZE → DESIGN: "确认需求理解正确，继续设计"
```

---

### **Phase 0: INITIALIZE**

**Objective:**

- 确定 feature 名称
- 创建或定位 feature 目录
- 准备文档结构

**Checklist:**

- [ ] **清理 temp 目录**（必须第一步执行）：

    ```bash
    # 清理上次遗留的临时文件
    rm -rf .ai-dev-docs/temp/*
    mkdir -p .ai-dev-docs/temp
    echo "✅ Temp directory cleaned"
    ```

- [ ] **分析用户需求，判断 feature 类型**：

  **判断标准**：
    1. **新功能（CREATE 模式）**：
        - 用户明确要求"新增功能"
        - 需求涉及全新的业务模块
        - 示例："实现用户认证系统"、"添加支付功能"

    2. **优化/修改现有功能（UPDATE 模式）**：
        - 用户明确要求"优化"、"修改"、"调整"现有功能
        - 需求基于现有代码进行改进
        - 示例："优化 PR 评论功能"、"修改登录流程"、"调整订单状态"

    3. **如何判断 feature 名称**：
        - **UPDATE 模式**：通过代码分析或用户描述，找到对应的现有 feature
        - **CREATE 模式**：根据需求创建新的 feature 名称

- [ ] **确定 feature 名称**：
    - 使用 kebab-case：`user-authentication`、`payment-processing`、`pr-comment-optimization`
    - 描述性且唯一
    - 与业务功能对应
    - **UPDATE 模式**：使用现有 feature 名称（如果不确定，询问用户）

- [ ] **检查 feature 是否已存在**：

    ```bash
    FEATURE_NAME="[从需求中提取的 feature 名称]"

    if [ -d ".ai-dev-docs/features/$FEATURE_NAME" ]; then
        echo "✅ Feature exists - UPDATE mode"
        MODE="UPDATE"

        # 列出现有文档
        echo "Existing documents:"
        ls -la .ai-dev-docs/features/$FEATURE_NAME/

    else
        echo "✅ New feature - CREATE mode"
        MODE="CREATE"
    fi
    ```

- [ ] **创建或定位目录**：

    ```bash
    mkdir -p .ai-dev-docs/features/$FEATURE_NAME
    cd .ai-dev-docs/features/$FEATURE_NAME
    ```

- [ ] **准备文档**：
    - **CREATE 模式**：创建新的空文档
    - **UPDATE 模式**：
        - ✅ 读取现有的 `requirements.md`、`design.md`、`tasks.md`
        - ✅ 准备在文档末尾追加新内容（使用 `---` 分隔符）
        - ❌ **不要创建新的文档文件**
        - ❌ **不要覆盖现有内容**

- [ ] **创建 temp 目录**（如果不存在）：

    ```bash
    mkdir -p .ai-dev-docs/temp
    ```

**Critical Constraint:**

- **⚠️ 必须先清理 temp 目录**
- **⚠️ UPDATE 模式下，必须更新现有文档，不要创建新文档**
- **⚠️ 如果不确定 feature 名称，必须询问用户或通过代码分析确定**
- **确保 feature 名称准确，避免创建重复目录**

**Phase 0 完成后自动进入 Phase 1（无需用户确认）**

**判断流程图**：

```
用户需求
    ↓
是否包含"优化"、"修改"、"调整"等关键词？
    ↓
  是 → 搜索现有 feature 目录 → 找到 → UPDATE 模式
    ↓                          ↓
  否                        未找到 → 询问用户或分析代码
    ↓
是否涉及全新业务模块？
    ↓
  是 → CREATE 模式
    ↓
  否 → 询问用户确认
```

---

### **Phase 1: ANALYZE**

**Objective:**

- 理解需求
- 分析现有系统
- 生成或更新需求规范

**Checklist:**

- [ ] 读取用户需求文档
- [ ] 分析现有代码和文档
- [ ] **生成或更新 requirements.md**：
    - **CREATE 模式**：创建完整的需求文档
    - **UPDATE 模式**：在现有文档末尾追加新需求

        ```markdown
        ---

        ## Iteration 2 - [YYYY-MM-DD]

        ### New Requirements

        [新增的需求]

        ### Modified Requirements

        [修改的需求，保留原文并标注变更]
        ```

- [ ] 使用 **EARS 格式**：

    ```
    ### Requirement: [Name]
    WHEN [condition], THE SYSTEM SHALL [behavior]

    #### Scenario: [Description]
    - GIVEN [initial state]
    - WHEN [trigger]
    - THEN [expected outcome]
    - AND [additional outcomes]
    ```

- [ ] 识别依赖和约束
- [ ] 评估置信度（0-100%）

**输出文件：**

- `.ai-dev-docs/features/$FEATURE_NAME/requirements.md`（创建或增量更新）

**Critical Constraint:**

- **Do not proceed until all requirements are clear and documented.**

**🛑 Phase Checkpoint（强制暂停）- 关键阶段：**

```
┌─────────────────────────────────────────────────────────────┐
│  🛑 PHASE 1 CHECKPOINT - ANALYZE ⭐ 必须暂停                  │
├─────────────────────────────────────────────────────────────┤
│  ✅ 阶段状态: COMPLETED                                     │
│  📄 输出文档: requirements.md                               │
│  📊 需求数量: [X] 个需求已定义                               │
│  🎯 置信度: [0-100%]                                        │
│  ⚠️ 注意事项: [依赖/约束/风险]                               │
├─────────────────────────────────────────────────────────────┤
│  📋 需求摘要:                                               │
│  1. [需求1简述]                                             │
│  2. [需求2简述]                                             │
│  ...                                                        │
├─────────────────────────────────────────────────────────────┤
│  🤔 等待用户确认（必须回复后才能继续）:                       │
│  - "c" 继续 → Phase 2: DESIGN                               │
│  - "m" 修改需求定义                                         │
│  - 提供具体反馈调整需求                                     │
│  - "a" 终止工作流                                           │
└─────────────────────────────────────────────────────────────┘
```

---

### **Phase 2: DESIGN**

**Objective:**

- 创建技术设计
- 拆分任务（功能点细化）

**Checklist:**

- [ ] **生成或更新 design.md**：
    - **CREATE 模式**：创建完整设计文档
    - **UPDATE 模式**：追加新的设计决策

        ```markdown
        ---

        ## Design Update - [YYYY-MM-DD]

        ### New Components

        [新增的组件设计]

        ### Modified Architecture

        [架构变更]
        ```

- [ ] 设计内容：
    - 架构概览
    - 数据流图
    - 接口定义（API contracts）
    - 数据模型
    - 错误处理策略

- [ ] **智能任务拆分（生成或更新 tasks.md）**：

  **拆分策略**：
    1. **第一层：模块分离**

        ```markdown
        ## Tasks

        - [ ]   1. Feature Implementation
            - [ ] 1.1 UI Components
            - [ ] 1.2 State Management
            - [ ] 1.3 API Integration
            - [ ] 1.4 Unit Tests
        ```

    2. **第二层：功能点细化**

        ```markdown
        ## Tasks

        - [ ]   1. User Authentication
            - [ ] 1.1 UI Components
                - [ ] 1.1.1 LoginForm component
                - [ ] 1.1.2 AuthGuard component
                - [ ] 1.1.3 UserProfile component
            - [ ] 1.2 State Management
                - [ ] 1.2.1 Auth store setup
                - [ ] 1.2.2 Login action
                - [ ] 1.2.3 Logout action
            - [ ] 1.3 API Integration
                - [ ] 1.3.1 Auth API client
                - [ ] 1.3.2 Token interceptor
                - [ ] 1.3.3 Error handling
            - [ ] 1.4 Tests
                - [ ] 1.4.1 Test login flow
                - [ ] 1.4.2 Test protected routes
                - [ ] 1.4.3 Test logout flow
        ```

    3. **UPDATE 模式**：追加新任务

        ```markdown
        ---

        ## Iteration 2 Tasks - [YYYY-MM-DD]

        ### New Tasks

        - [ ]   2. Two-Factor Authentication
            - [ ] 2.1 OTP input component
            - [ ] 2.2 OTP verification flow
            - [ ] 2.3 Tests
        ```

- [ ] 定义验证策略

**输出文件：**

- `.ai-dev-docs/features/$FEATURE_NAME/design.md`（创建或增量更新）
- `.ai-dev-docs/features/$FEATURE_NAME/tasks.md`（创建或增量更新）

**Critical Constraint:**

- **Do not proceed to implementation until design and plan are complete and validated.**

**🛑 Phase Checkpoint（强制暂停）- 关键阶段：**

```
┌─────────────────────────────────────────────────────────────┐
│  🛑 PHASE 2 CHECKPOINT - DESIGN ⭐ 必须暂停                    │
├─────────────────────────────────────────────────────────────┤
│  ✅ 阶段状态: COMPLETED                                     │
│  📄 输出文档: design.md, tasks.md                           │
│  📊 任务数量: [X] 个任务已规划                               │
│  🏗️ 架构: [架构简述]                                         │
├─────────────────────────────────────────────────────────────┤
│  📋 任务摘要:                                               │
│  任务数: [X] 个任务                                         │
│  预计工作量: [估算]                                         │
├─────────────────────────────────────────────────────────────┤
│  🤔 等待用户确认（必须回复后才能继续）:                       │
│  - "c" 继续 → Phase 3: IMPLEMENT                            │
│  - "m" 修改设计方案或任务拆分                               │
│  - 提供具体反馈调整设计                                     │
│  - "a" 终止工作流                                           │
└─────────────────────────────────────────────────────────────┘
```

---

### **Phase 3: IMPLEMENT**

**Objective:**

- 按任务清单实现代码
- 实时更新进度
- **必须完成所有代码实现后才能进入 Phase 4 (GAP ANALYSIS)**

**Checklist:**

- [ ] 按任务顺序实现（从依赖向上）
- [ ] 遵循项目约定
- [ ] 添加有意义的注释
- [ ] **实时更新 tasks.md**：

    ```markdown
    - [x] 1.1.1 LoginForm component ✅ 2025-12-18
    - [x] 1.1.2 AuthGuard component ✅ 2025-12-18
    - [ ] 1.1.3 UserProfile component (in progress)
    ```

- [ ] **维护 devdoc**（大型任务 >5 子任务或 >2 天）：
    - 保存到 `.ai-dev-docs/temp/devdoc-[feature-name].md`
    - 记录当前进度、已完成任务、关键决策

        ```markdown
        # 开发进度 - [功能名称]

        ## Current Status - [YYYY-MM-DD]

        - Phase: IMPLEMENT
        - Progress: 3/8 tasks completed

        ## Completed Tasks

        - [Task]: [Description] - [Timestamp]
        ```

- [ ] **确认所有任务已完成**：
    - 检查 tasks.md 中所有任务是否标记为 ✅
    - 如果有未完成的任务，继续实现
    - **不要因为 token 限制而跳过代码实现**
    - 如果遇到 token 限制，应该：
        1. 先完成当前正在实现的模块
        2. 更新 temp/devdoc-[feature-name].md 记录当前进度
        3. 在下一轮对话中继续实现剩余代码
        4. **明确告知用户："代码未完成，需要继续实现"**

**输出文件：**

- `.ai-dev-docs/features/$FEATURE_NAME/tasks.md`（实时更新）
- `.ai-dev-docs/temp/devdoc-[feature-name].md`（可选，过程文档）

**Critical Constraint:**

- **⚠️ 关键约束：必须完成所有任务代码实现后才能进入 Phase 4 (GAP ANALYSIS)**
- **如果代码未完成，不要进入 Gap 分析阶段，应该继续实现代码**

**🛑 Phase Checkpoint（强制暂停）- 关键阶段：**

```
┌─────────────────────────────────────────────────────────────┐
│  🛑 PHASE 3 CHECKPOINT - IMPLEMENT ⭐ 必须暂停                 │
├─────────────────────────────────────────────────────────────┤
│  ✅ 阶段状态: COMPLETED                                     │
│  📄 更新文档: tasks.md                                      │
│  📊 完成度: [X/Y] 任务完成                                   │
│  📁 修改文件: [文件数量]                                     │
├─────────────────────────────────────────────────────────────┤
│  📋 实现摘要:                                               │
│  - 新增文件: [列表]                                         │
│  - 修改文件: [列表]                                         │
├─────────────────────────────────────────────────────────────┤
│  🤔 等待用户确认（必须回复后才能继续）:                       │
│  - "c" 继续 → Phase 4: GAP ANALYSIS                         │
│  - "m" 修改实现                                             │
│  - 提供具体反馈调整代码                                     │
│  - "a" 终止工作流                                           │
└─────────────────────────────────────────────────────────────┘
```

---

### **Phase 4: GAP ANALYSIS**

> Gap 分析是质量保证的核心环节，必须严格执行，不可跳过或简化。
>
> **执行方式：此阶段由 subagent 执行，主 agent 负责触发和接收结果。**

**Objective:**

- 自动对比需求与实现
- 生成 Gap 分析报告
- 识别未实现、偏差、不清晰的需求
- **根据 Gap 分析完成缺失功能**

**执行模式：**

- **主 agent 职责**：
    - 确认 Phase 3 (IMPLEMENT) 已完成所有任务代码实现
    - 触发 subagent 执行 Gap 分析
    - 接收 subagent 返回的 gap.md 报告
    - 根据 gap.md 中的建议行动，继续实现缺失功能

- **Subagent 职责**：
    - 执行完整的 Gap 分析流程
    - 生成详细的 gap.md 报告
    - 返回分析结果给主 agent

**前置条件：**

- ⚠️ **主 agent 必须确认 Phase 3 (IMPLEMENT) 已完成所有任务代码实现**
- ⚠️ **如果代码未完成，不要进入此阶段，应该返回 Phase 3 继续实现**
- ⚠️ **主 agent 准备好以下信息供 subagent 使用**：
    - Feature 名称和路径
    - 用户原始需求文档位置
    - 实现代码的位置
    - 相关文档位置（requirements.md, design.md, tasks.md）

**主 Agent Checklist（触发前）：**

- [ ] **确认代码实现完成**：
    - 检查 tasks.md 中所有任务是否标记为 ✅
    - 确认所有代码文件已创建/修改
    - 验证没有未完成的任务

- [ ] **准备 subagent 上下文**：
    - 确定 feature 名称：`$FEATURE_NAME`
    - 确定 feature 目录：`.ai-dev-docs/features/$FEATURE_NAME`
    - 确定用户原始需求文档位置（用户提供的文件或对话内容）
    - 确定实现代码的相关文件路径

- [ ] **触发 subagent 执行 Gap 分析**：
    - 向 subagent 提供必要的上下文信息
    - 明确 subagent 需要完成的任务
    - 等待 subagent 完成并返回结果

**Subagent Checklist（执行中）：**

- [ ] **接收主 agent 提供的上下文信息**：
    - Feature 名称和目录路径
    - 用户原始需求文档位置
    - 实现代码的相关文件路径
    - 相关文档位置

- [ ] **读取用户提供的原始需求文档**：
    - ⚠️ **关键：必须读取用户一开始指定的需求文档**
    - ⚠️ **不要对比生成的 requirements.md**
    - 用户需求文档通常是：
        - 用户在对话中提供的 Markdown 文件
        - 用户在对话中直接描述的需求
        - 用户提供的 PRD、技术文档等
    - 示例：

        ```markdown
        # 正确做法 ✅

        读取用户提供的文件

        # 错误做法 ❌

        读取生成的文件：.ai-dev-docs/features/xxx/requirements.md
        ```

- [ ] **分析实现代码**：
    - 扫描所有相关代码文件
    - 提取实现的功能点
    - **对比用户原始需求文档（不是 requirements.md）**

- [ ] **生成 gap 分析报告**（保存到 `.ai-dev-docs/temp/gap-[feature-name].md`）:

    ```markdown
    # Gap 分析报告 - [功能名称]

    **生成时间**: [YYYY-MM-DD HH:MM:SS]
    **实现覆盖率**: 75% (15/20 需求)

    ---

    ## ✅ 已完全实现 (15 个需求)

    ### 需求：用户登录

    - **状态**: ✅ 已完全实现
    - **实现位置**: `src/components/LoginForm.tsx`
    - **测试覆盖率**: 95%
    - **备注**: 所有场景已覆盖

    ### 需求：会话管理

    - **状态**: ✅ 已完全实现
    - **实现位置**: `src/stores/auth.store.ts`
    - **测试覆盖率**: 90%

    ---

    ## ⚠️ 部分实现 (3 个需求)

    ### 需求：密码重置

    - **状态**: ⚠️ 部分实现 (60%)
    - **已实现**:
        - ✅ 密码重置请求 API
        - ✅ 邮件发送功能
    - **缺失**:
        - ❌ Token 过期处理
        - ❌ 前端重置表单
    - **实现位置**: `src/components/ResetPassword.tsx` (部分)
    - **需要行动**: 完成缺失的组件

    ### 需求：双因素认证

    - **状态**: ⚠️ 部分实现 (40%)
    - **已实现**:
        - ✅ OTP 输入组件
    - **缺失**:
        - ❌ OTP 验证流程
        - ❌ 错误处理
    - **实现位置**: `src/components/OTPInput.tsx` (部分)
    - **需要行动**: 完成 OTP 验证流程

    ---

    ## ❌ 未实现 (2 个需求)

    ### 需求：社交登录 (Google/GitHub)

    - **状态**: ❌ 未实现
    - **原因**: 当前迭代中优先级降低
    - **需要行动**: 在下次迭代中实现或确认是否需要

    ### 需求：登录失败后账户锁定

    - **状态**: ❌ 未实现
    - **原因**: 安全需求未处理
    - **需要行动**: **关键** - 为了安全合规必须实现

    ---

    ## 🤔 需求不清晰 (1 个需求)

    ### 需求："用户应该能够管理他们的个人资料"

    - **状态**: 🤔 需求不清晰
    - **问题**: 需求描述过于模糊
    - **疑问**:
        - 哪些个人资料字段可以编辑？
        - 是否允许修改邮箱？
        - 是否包含密码修改？
        - 有什么验证规则？
    - **需要行动**: **需要用户澄清** - 没有详细信息无法实现

    ---

    ## 📊 统计摘要

    | 类别          | 数量   | 百分比   |
    | ------------- | ------ | -------- |
    | ✅ 已完全实现 | 15     | 75%      |
    | ⚠️ 部分实现   | 3      | 15%      |
    | ❌ 未实现     | 2      | 10%      |
    | 🤔 需求不清晰 | 1      | -        |
    | **需求总数**  | **20** | **100%** |

    ---

    ## 🎯 建议行动

    ### 高优先级（必须修复）

    1. ❌ **实现账户锁定功能** - 安全关键
    2. ⚠️ **完成密码重置功能** - 核心功能

    ### 中优先级（应该修复）

    3. ⚠️ **完成双因素认证** - 安全增强
    4. 🤔 **澄清个人资料管理需求** - 需要用户输入

    ### 低优先级（可延后）

    5. ❌ **社交登录** - 锦上添花，可以放到下次迭代

    ---

    ## 📝 备注

    - 整体实现质量良好
    - 测试覆盖率充足（已实现功能 >90%）
    - 主要差距在安全功能和未完成的流程
    - 有一个需求需要用户澄清后才能实现
    ```

- [ ] **分类 Gap**：
    - ✅ **已完全实现**: 完全实现
    - ⚠️ **部分实现**: 部分实现（列出缺失部分）
    - ❌ **未实现**: 未实现（说明原因）
    - 🤔 **需求不清晰**: 需求不清晰（需要用户澄清）

- [ ] **生成行动建议**：
    - 按优先级排序（高/中/低）
    - 标注关键问题（关键）
    - 标注需要用户输入的问题

- [ ] **根据 Gap 分析完成缺失功能** ⭐ 关键步骤：

  **处理策略**：
    1. **⚠️ 部分实现的功能**（优先处理）：
        - 读取 gap.md 中标记为"部分实现"的需求
        - 识别缺失的组件/功能
        - 逐个完成缺失部分
        - 更新 tasks.md 标记完成状态
        - 示例：

            ```markdown
            ### 需求：密码重置

            - 缺失：❌ Token 过期处理
            - 缺失：❌ 前端重置表单

            → 行动：

            1. 实现 Token 过期处理逻辑
            2. 创建前端密码重置表单组件
            3. 集成并测试完整流程
            ```

    2. **❌ 未实现的功能**（根据优先级处理）：
        - 读取 gap.md 中标记为"未实现"的需求
        - 评估优先级（高/中/低）
        - **高优先级**：立即实现（如安全关键功能）
        - **中优先级**：本次实现（如核心功能）
        - **低优先级**：记录到 tasks.md 待办，下次迭代处理
        - 示例：

            ```markdown
            ### 需求：登录失败后账户锁定

            - 优先级：高（安全关键）

            → 行动：

            1. 实现失败次数记录
            2. 实现账户锁定逻辑
            3. 实现解锁机制
            4. 添加相关测试
            ```

    3. **🤔 需求不清晰**（暂停并请求澄清）：
        - 在 gap.md 中明确标注疑问
        - **不要猜测实现**
        - 将疑问记录到 gap.md 的"需要用户澄清"部分
        - 继续处理其他明确的需求
        - 示例：

            ```markdown
            ### 需求："用户应该能够管理他们的个人资料"

            - 状态：🤔 需求不清晰
            - 疑问：
                1. 哪些字段可编辑？
                2. 是否允许修改邮箱？
                3. 验证规则是什么？

            → 行动：
            暂停实现，等待用户澄清
            ```

    4. **实现完成后重新生成 gap.md**：
        - 完成所有可实现的功能后
        - 重新运行 Gap 分析
        - 生成新的 gap.md
        - 验证实现覆盖率是否提升
        - 目标：达到 90%+ 覆盖率（排除需要澄清的需求）

- [ ] **更新 tasks.md**：
    - 标记所有完成的任务为 ✅
    - 添加新完成的任务记录
    - 更新进度百分比

- [ ] **更新 devdoc**（如果有）：
    - 记录 Gap 修复过程
    - 记录新增的文件和决策
    - 保存到 `.ai-dev-docs/temp/devdoc-[feature-name].md`

**输出文件：**

- `.ai-dev-docs/temp/gap-[feature-name].md`（subagent 生成，初次生成 + 修复后重新生成）
- `.ai-dev-docs/features/$FEATURE_NAME/tasks.md`（主 agent 更新）
- `.ai-dev-docs/temp/devdoc-[feature-name].md`（可选，过程文档）

**Critical Constraint:**

- **⚠️ 主 agent 必须确认 Phase 3 完成后再触发 subagent**
- **⚠️ Subagent 必须对比用户提供的原始需求文档，不是生成的 requirements.md**
- **⚠️ Gap 分析必须客观、详细，不隐藏问题**
- **⚠️ 对于不清晰的需求，subagent 必须明确标注并请求用户澄清，不要猜测实现**
- **⚠️ 主 agent 必须完成所有"部分实现"和"未实现"的功能后才能进入 Phase 5**
- **⚠️ 如果有需要用户澄清的需求，在 gap 报告中明确标注，但不阻塞其他功能的实现**

**Phase 4 完成后自动进入 Phase 5（无需用户确认）**

---

### **Phase 5: VALIDATE**

**Objective:**

- 运行项目级验证命令
- 验证实现符合需求

**Checklist:**

- [ ] **项目级验证命令** ：

    ```bash
    # 1. 安装依赖
    pnpm install

    # 2. 代码检查
    pnpm run lint

    # 3. 类型检查
    pnpm run type-check

    # 4. 运行测试
    pnpm test

    # 5. 构建验证
    pnpm run build
    ```

- [ ] **记录验证结果**：

    ```markdown
    ## Validation Results - [YYYY-MM-DD HH:MM:SS]

    - ✅ Dependencies installed
    - ✅ Lint passed (0 errors, 0 warnings)
    - ✅ Type check passed
    - ✅ Tests passed (XX/XX)
    - ✅ Build successful

    ### Overall Status: ✅ PASSED
    ```

- [ ] 测试边界情况和错误处理
- [ ] 验证性能指标

**输出文件：**

- 验证日志（可选，保存到 `.ai-dev-docs/temp/validation-[timestamp].md`）
- ⚠️ **验证报告必须保存到 `.ai-dev-docs/temp/` 目录，不要放在 feature 目录**

**Critical Constraint:**

- **Do not proceed until all validation steps are complete and all issues are resolved.**
- **项目级验证命令必须全部通过**

**Phase 5 完成后自动进入 Phase 6（无需用户确认）**

---

### **Phase 6: REFLECT**

**Objective:**

- 代码重构
- 更新文档
- 分析改进点

**Checklist:**

- [ ] 重构代码以提高可维护性
- [ ] **更新所有 feature 文档**：
    - 确保 requirements.md 反映最终实现
    - 确保 design.md 包含所有设计决策
    - 确保 tasks.md 所有任务标记为完成
    - 确保 gap 分析中未实现和部分实现内容已完成

- [ ] 识别潜在改进点
- [ ] 验证成功标准
- [ ] 执行元分析（效率、工具使用）
- [ ] 记录技术债务
- [ ] **生成改进建议文档**（可选）：
    - 保存到 `.ai-dev-docs/temp/improvements-[timestamp].md`
    - ⚠️ **必须保存到 temp 目录，不要放在 feature 目录**

**Critical Constraint:**

- **Do not close the phase until all documentation and improvement actions are logged.**

**Phase 6 完成后自动进入 Phase 7（无需用户确认）**

---

### **Phase 7: HANDOFF**

**Objective:**

- 打包交付
- 归档文档
- 准备下一个任务

**Checklist:**

- [ ] **生成执行摘要**（中文版）：
    - ⚠️ **必须保存到 `.ai-dev-docs/temp/handoff-[feature-name]-[timestamp].md`**
    - ⚠️ **严格禁止放在 feature 目录**
    - 内容模板：

    ```markdown
    # 功能交付摘要 - [功能名称]

    ## 概览

    - 功能名称: [名称]
    - 完成日期: [YYYY-MM-DD]
    - 实现覆盖率: 85% (17/20 需求)
    - 测试覆盖率: 92%

    ## 交付物

    - ✅ 需求文档已完成
    - ✅ 设计文档已完成
    - ✅ 代码已实现
    - ✅ 测试已编写
    - ✅ 验证已通过
    - ✅ Gap 分析已完成

    ## 主要成果

    - 实现了用户认证系统
    - 添加了会话管理功能
    - 集成了现有用户数据库

    ## 已知差距（详见 gap.md）

    - ⚠️ 密码重置流程未完成 (60%)
    - ❌ 社交登录未实现（已延期）
    - 🤔 个人资料管理需要澄清

    ## 后续步骤

    1. 完成密码重置流程
    2. 澄清个人资料管理需求
    3. 考虑在下次迭代中实现社交登录

    ## 文档位置

    - 需求文档: .ai-dev-docs/features/user-authentication/requirements.md
    - 设计文档: .ai-dev-docs/features/user-authentication/design.md
    - 任务清单: .ai-dev-docs/features/user-authentication/tasks.md
    - Gap 分析: .ai-dev-docs/temp/gap-user-authentication.md（过程文档）
    ```

- [ ] **可选：创建历史快照**：

    ```bash
    # 如果是重大变更，保存历史版本
    mkdir -p .ai-dev-docs/features/$FEATURE_NAME/history/v1-$(date +%Y-%m-%d)
    cp requirements.md design.md tasks.md \
       .ai-dev-docs/features/$FEATURE_NAME/history/v1-$(date +%Y-%m-%d)/
    ```

- [ ] **清理临时文件**（⚠️ 必须执行）：

    ```bash
    # 清理 temp 目录（必须执行，不是可选）
    echo "🧹 Cleaning temp directory..."
    rm -rf .ai-dev-docs/temp/*
    echo "✅ Temp directory cleaned"
    ```

- [ ] **验证文档位置**（⚠️ 必须执行）：

    ```bash
    # 验证所有文档都在正确的位置
    echo "📋 Verifying document locations..."

    # 检查 feature 目录只包含核心文档
    FEATURE_DIR=".ai-dev-docs/features/$FEATURE_NAME"
    ALLOWED_FILES="requirements.md design.md tasks.md"

    for file in $FEATURE_DIR/*.md; do
        filename=$(basename "$file")
        if [[ ! " $ALLOWED_FILES " =~ " $filename " ]]; then
            echo "❌ ERROR: $filename should be in temp directory, not feature directory"
            exit 1
        fi
    done

    echo "✅ All documents in correct locations"
    ```

- [ ] 继续下一个任务或完成

**Critical Constraint:**

- **⚠️ 必须清理 temp 目录，不是可选步骤**
- **⚠️ 必须验证文档位置，确保临时文档不在 feature 目录**
- **Do not consider the task complete until all handoff steps are finished and documented.**

**🎉 Phase 7 完成 - 工作流结束：**

```
┌─────────────────────────────────────────────────────────────┐
│  🎉 PHASE 7 COMPLETED - HANDOFF ✅ 工作流完成                  │
├─────────────────────────────────────────────────────────────┤
│  ✅ 阶段状态: COMPLETED                                     │
│  📄 交付摘要: handoff-[feature-name]-[timestamp].md         │
├─────────────────────────────────────────────────────────────┤
│  📋 交付摘要:                                               │
│  - 功能名称: [feature-name]                                 │
│  - 实现覆盖率: [X%]                                         │
│  - 文档状态: ✅ 完成                                         │
│  - temp 清理: ✅ 完成                                        │
├─────────────────────────────────────────────────────────────┤
│  📁 文档位置:                                               │
│  - requirements.md: ✅                                      │
│  - design.md: ✅                                            │
│  - tasks.md: ✅                                             │
├─────────────────────────────────────────────────────────────┤
│  🎉 工作流完成！                                             │
│  - 输入 "next" 开始下一个任务                               │
│  - 输入具体反馈进行补充                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 文档增量更新规范

### 增量更新原则

**核心原则**：保留历史，追加新内容，不覆盖旧内容

### 更新格式

**requirements.md 增量更新**（中文版）：

```markdown
# 需求文档 - [功能名称]

## 初始需求 - 2025-12-18

### 需求：用户登录

当用户提供有效凭证时，系统应该对用户进行身份验证。

#### 场景：登录成功

- 前提条件：已注册用户
- 当：用户提供正确的凭证
- 那么：系统对用户进行身份验证

---

## 迭代 2 - 2025-12-20

### 新增需求

### 需求：双因素认证

当用户完成主要身份验证后，系统应该要求第二因素验证。

#### 场景：需要 OTP 验证

- 前提条件：启用了 2FA 的用户
- 当：用户提供正确的凭证
- 那么：系统发送 OTP 验证码

### 修改的需求

### 需求：用户登录（已更新）

当用户提供有效凭证时，系统应该对用户进行身份验证并检查 2FA 状态。
**← 变更说明**：之前是直接验证，不检查 2FA

#### 场景：启用 2FA 的登录成功

- 前提条件：启用了 2FA 的已注册用户
- 当：用户提供正确的凭证
- 那么：系统对用户进行身份验证
- 并且：启动 2FA 验证流程

### 删除的需求

### 需求：记住我 Cookie

**状态**：❌ 已删除
**原因**：安全问题 - 长期有效的 Cookie 存在安全隐患
**迁移方案**：用户必须在会话过期后重新进行身份验证
```

**design.md 增量更新**（中文版）：

```markdown
# 设计文档 - [功能名称]

## 初始设计 - 2025-12-18

### 架构

[初始架构描述]

### 数据模型

[初始数据模型]

---

## 设计更新 - 2025-12-20

### 新增组件

#### OTP 服务

- 生成基于时间的 OTP 验证码
- 验证 OTP，5 分钟过期
- 集成邮件服务

### 修改的架构

#### 认证流程（已更新）

**之前**：直接登录 → 创建会话
**现在**：登录 → 2FA 检查 → OTP 验证 → 创建会话

### API 变更

#### 新增接口

- POST /api/auth/otp/send
- POST /api/auth/otp/verify

#### 修改的接口

- POST /api/auth/login
    - **新增**：返回 `requires2FA: boolean`
    - **新增**：如果需要 2FA，返回 `otpSent: boolean`
```

**tasks.md 增量更新**（中文版）：

```markdown
# 任务清单 - [功能名称]

## 初始任务 - 2025-12-18

### 任务

- [x]   1. 用户认证 ✅ 2025-12-18
    - [x] 1.1 UI 组件 ✅
    - [x] 1.2 状态管理 ✅
    - [x] 1.3 API 集成 ✅
    - [x] 1.4 测试 ✅

---

## 迭代 2 任务 - 2025-12-20

### 新增任务

- [ ]   2. 双因素认证
    - [ ] 2.1 UI 组件
        - [ ] 2.1.1 OTPInput 组件
        - [ ] 2.1.2 OTPVerification 页面
    - [ ] 2.2 状态管理
        - [ ] 2.2.1 OTP 验证 action
        - [ ] 2.2.2 OTP 重发 action
    - [ ] 2.3 API 集成
        - [ ] 2.3.1 OTP API 客户端
    - [ ] 2.4 测试
        - [ ] 2.4.1 测试 OTP 流程
        - [ ] 2.4.2 测试 OTP 过期
```

---

## 快速参考

### Feature 生命周期

```
1. 新 Feature
   └─> Phase 0: INITIALIZE (CREATE 模式)
       └─> Phase 1-7: 执行完整流程
           └─> 生成所有文档

2. 迭代 Feature
   └─> Phase 0: INITIALIZE (UPDATE 模式)
       └─> Phase 1-7: 执行完整流程
           └─> 增量更新所有文档
```

### 文档检查清单

**每个 feature 必须有（沉淀在 feature 目录）**：

- ✅ requirements.md（需求规范）
- ✅ design.md（技术设计）
- ✅ tasks.md（任务清单）

**过程文档（放在 temp 目录，不沉淀）**：

- ⚠️ gap-[feature-name].md（Gap 分析）
- ⚠️ devdoc-[feature-name].md（可选，大型任务）

**文档更新规则**：

- ✅ 追加新内容（使用分隔符 `---`）
- ✅ 标注日期和迭代版本
- ✅ 保留历史内容
- ❌ 不覆盖旧内容

### ⚠️ 严格执行检查清单

**Phase 0 开始前必须检查**：

- [ ] 已清理 temp 目录（`rm -rf .ai-dev-docs/temp/*`）
- [ ] 已确定 feature 名称
- [ ] 已确定 CREATE 或 UPDATE 模式
- [ ] UPDATE 模式：已读取现有文档

**Phase 1-6 过程中必须检查**：

- [ ] 所有临时文档都保存在 `.ai-dev-docs/temp/` 目录
- [ ] feature 目录只包含核心文档（requirements/design/tasks）
- [ ] UPDATE 模式：使用追加方式更新文档，不覆盖

**Phase 7 结束前必须检查**：

- [ ] 已生成 handoff 摘要到 temp 目录
- [ ] 已清理 temp 目录
- [ ] 已验证文档位置（feature 目录无临时文档）
- [ ] 所有核心文档已更新完成

### 常见错误及修正

| 错误                                          | 正确做法                                 |
| --------------------------------------------- | ---------------------------------------- |
| ❌ 优化需求时创建新的 feature 目录            | ✅ 使用 UPDATE 模式更新现有 feature      |
| ❌ 将 `changes.md` 放在 feature 目录          | ✅ 放在 `.ai-dev-docs/temp/` 目录        |
| ❌ 将 `SUMMARY.md` 放在 feature 目录          | ✅ 放在 `.ai-dev-docs/temp/` 目录        |
| ❌ Phase 7 不清理 temp 目录                   | ✅ 必须执行 `rm -rf .ai-dev-docs/temp/*` |
| ❌ UPDATE 模式覆盖现有文档                    | ✅ 使用 `---` 分隔符追加新内容           |

### 命令速查

```bash
# 创建新 feature
mkdir -p .ai-dev-docs/features/[feature-name]

# 检查 feature 是否存在
ls .ai-dev-docs/features/

# 运行验证
./.ai-dev-docs/scripts/validate-project.sh

# 查看 Gap 分析
cat .ai-dev-docs/temp/gap-[feature-name].md

# 创建历史快照（可选）
mkdir -p .ai-dev-docs/features/[feature-name]/history/v1-$(date +%Y-%m-%d)
```

---