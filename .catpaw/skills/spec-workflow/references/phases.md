# Phase 详细定义

本文件包含 8-Phase Loop 每个阶段的完整 checklist、输出文件和约束条件。agent 在进入某个 Phase 时按需读取对应章节。

---

## Phase 0: INITIALIZE

**目标**：确定 feature 名称、创建或定位 feature 目录、准备文档结构。

**Checklist**：

- [ ] **清理 temp 目录**（必须第一步执行）：
    ```bash
    rm -rf .ai-dev-docs/temp/*
    mkdir -p .ai-dev-docs/temp
    ```

- [ ] **分析用户需求，判断类型**：

    | 判断标准 | 模式 | 示例 |
    |---------|------|------|
    | 用户要求新增功能、涉及全新业务模块 | CREATE | "实现用户认证系统"、"添加支付功能" |
    | 用户要求优化/修改/调整现有功能 | UPDATE | "优化 PR 评论功能"、"修改登录流程" |
    | 不确定 | 询问用户或分析代码 | - |

- [ ] **确定 feature 名称**：kebab-case，描述性且唯一，与业务功能对应。UPDATE 模式使用现有 feature 名称。

- [ ] **检查 feature 是否已存在**：
    ```bash
    FEATURE_NAME="[feature-name]"
    if [ -d ".ai-dev-docs/features/$FEATURE_NAME" ]; then
        echo "Feature exists - UPDATE mode"
        ls -la .ai-dev-docs/features/$FEATURE_NAME/
    else
        echo "New feature - CREATE mode"
    fi
    ```

- [ ] **创建或定位目录**：
    ```bash
    mkdir -p .ai-dev-docs/features/$FEATURE_NAME
    ```

- [ ] **准备文档**：
    - CREATE 模式：创建新文档
    - UPDATE 模式：读取现有文档，准备在末尾追加（用 `---` 分隔），不覆盖、不创建新文件

**Phase 0 完成后自动进入 Phase 1（无需用户确认）**

---

## Phase 1: ANALYZE ⭐ 必须暂停

**目标**：理解需求、分析现有系统、生成或更新需求规范。

**Checklist**：

- [ ] 读取用户需求描述
- [ ] 分析现有代码和文档
- [ ] **生成或更新 requirements.md**（格式见 `document-formats.md`）：
    - CREATE 模式：创建完整需求文档
    - UPDATE 模式：在末尾追加新迭代需求
- [ ] 使用 EARS 格式（WHEN...THE SYSTEM SHALL + GIVEN-WHEN-THEN 场景）
- [ ] 识别依赖和约束
- [ ] 评估置信度（0-100%）

**输出文件**：`.ai-dev-docs/features/$FEATURE_NAME/requirements.md`

**约束**：需求不清晰时不得继续。

**🛑 Checkpoint**：

```
┌─────────────────────────────────────────────────────────────┐
│  🛑 PHASE 1 CHECKPOINT - ANALYZE                            │
├─────────────────────────────────────────────────────────────┤
│  📄 输出文档: requirements.md                               │
│  📊 需求数量: [X] 个需求已定义                               │
│  🎯 置信度: [0-100%]                                        │
│  ⚠️ 注意事项: [依赖/约束/风险]                               │
├─────────────────────────────────────────────────────────────┤
│  📋 需求摘要:                                               │
│  1. [需求1简述]                                             │
│  2. [需求2简述]                                             │
├─────────────────────────────────────────────────────────────┤
│  🤔 等待确认:                                               │
│  - "c" 继续 → Phase 2: DESIGN                               │
│  - "m" 修改需求定义                                         │
│  - 提供具体反馈                                             │
│  - "a" 终止工作流                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 2: DESIGN ⭐ 必须暂停

**目标**：创建技术设计、拆分任务、定义验收项。

**Checklist**：

- [ ] **生成或更新 design.md**（格式见 `document-formats.md`）：
    - 架构概览
    - 数据流图
    - 接口定义（API contracts）
    - 数据模型
    - 错误处理策略

- [ ] **生成或更新 tasks.md**（格式见 `document-formats.md`）：
    - 任务拆分策略遵循项目 rules 中的约定（前后端分离 / 按模块 / 按功能点）
    - 第一层：大类分离
    - 第二层：功能点细化（含子任务编号）
    - UPDATE 模式：追加新任务，不修改已完成任务

- [ ] **生成或更新 qa.md**（格式见 `document-formats.md`）：
    - 为每个可验证的行为定义验收项
    - 标注验收类型（自动化 / 人工-交互 / 人工-视觉 / 人工-逻辑）
    - 标注阻塞级别（P0 / P1 / P2）
    - 验收结果列初始为 `-`

- [ ] 定义验证策略

**输出文件**：
- `.ai-dev-docs/features/$FEATURE_NAME/design.md`
- `.ai-dev-docs/features/$FEATURE_NAME/tasks.md`
- `.ai-dev-docs/features/$FEATURE_NAME/qa.md`

**约束**：设计和任务拆分未确认前不得进入实现。

**🛑 Checkpoint**：

```
┌─────────────────────────────────────────────────────────────┐
│  🛑 PHASE 2 CHECKPOINT - DESIGN                             │
├─────────────────────────────────────────────────────────────┤
│  📄 输出文档: design.md, tasks.md, qa.md                    │
│  📊 任务数量: [X] 个任务已规划                               │
│  🏗️ 架构: [架构简述]                                         │
├─────────────────────────────────────────────────────────────┤
│  🧪 需人工验收的 P0 项:                                      │
│  - [ ] [验收项描述] [人工-交互/人工-视觉/人工-逻辑]          │
│  - [ ] [验收项描述] [人工-交互/人工-视觉/人工-逻辑]          │
│  （完整验收项见 qa.md）                                      │
├─────────────────────────────────────────────────────────────┤
│  🤔 等待确认:                                               │
│  - "c" 继续 → Phase 3: IMPLEMENT                            │
│  - "m" 修改设计方案或任务拆分                               │
│  - 提供具体反馈                                             │
│  - "a" 终止工作流                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 3: IMPLEMENT ⭐ 必须暂停

**目标**：按任务清单实现代码，实时更新进度。必须完成所有代码实现后才能进入 Phase 4。

**Checklist**：

- [ ] 按任务顺序实现（从依赖向上）
- [ ] 遵循项目 rules 中的编码约定
- [ ] 添加有意义的注释
- [ ] **实时更新 tasks.md**：
    ```markdown
    - [x] 1.1.1 Create users table ✅ 2025-12-18
    - [x] 1.1.2 Create sessions table ✅ 2025-12-18
    - [ ] 1.1.3 Add indexes (in progress)
    ```

- [ ] **维护 devdoc**（大型任务 >5 子任务或 >2 天时使用）：
    - 保存到 `.ai-dev-docs/temp/devdoc-[feature-name].md`
    - 记录当前进度、已完成任务、关键决策

- [ ] **确认所有任务已完成**：
    - 检查 tasks.md 中所有任务是否标记为 ✅
    - 如果有未完成的任务，继续实现
    - 不要因为 token 限制而跳过代码实现
    - 遇到 token 限制时：完成当前模块 → 更新 devdoc → 告知用户需要继续

**输出文件**：
- `.ai-dev-docs/features/$FEATURE_NAME/tasks.md`（实时更新）
- `.ai-dev-docs/temp/devdoc-[feature-name].md`（可选）

**约束**：必须完成所有任务代码实现后才能进入 Phase 4。代码未完成不要进入 Gap 分析。

**🛑 Checkpoint**：

```
┌─────────────────────────────────────────────────────────────┐
│  🛑 PHASE 3 CHECKPOINT - IMPLEMENT                          │
├─────────────────────────────────────────────────────────────┤
│  📊 完成度: [X/Y] 任务完成                                   │
│  📁 修改文件: [文件数量]                                     │
├─────────────────────────────────────────────────────────────┤
│  📋 实现摘要:                                               │
│  - [分类1]: [完成情况]                                       │
│  - [分类2]: [完成情况]                                       │
│  - 新增文件: [列表]                                         │
│  - 修改文件: [列表]                                         │
├─────────────────────────────────────────────────────────────┤
│  🤔 等待确认:                                               │
│  - "c" 继续 → Phase 4: GAP ANALYSIS                         │
│  - "m" 修改实现                                             │
│  - 提供具体反馈                                             │
│  - "a" 终止工作流                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 4: GAP ANALYSIS

> 由 subagent 执行，主 agent 负责触发和接收结果。

**目标**：对比需求与实现，识别缺失，补完后重新验证。

**主 Agent Checklist（触发前）**：

- [ ] 确认 Phase 3 所有任务已完成
- [ ] 准备 subagent 上下文：feature 名称、目录路径、用户原始需求文档位置、实现代码路径

**Subagent Checklist**：

- [ ] **读取用户提供的原始需求文档**（不是生成的 requirements.md）
- [ ] 分析实现代码，提取已实现的功能点
- [ ] 对比原始需求，生成 gap 分析报告
- [ ] 分类 Gap：
    - ✅ 已完全实现
    - ⚠️ 部分实现（列出缺失部分）
    - ❌ 未实现（说明原因）
    - 🤔 需求不清晰（需要用户澄清）
- [ ] 生成行动建议（按优先级排序）

**主 Agent Checklist（接收后）**：

- [ ] 根据 gap 报告补完缺失功能：
    - ⚠️ 部分实现 → 优先完成缺失部分
    - ❌ 未实现 → 按优先级处理（高优立即实现，低优记录待办）
    - 🤔 不清晰 → 标注疑问，不猜测实现
- [ ] 补完后重新触发 subagent 生成新的 gap 报告
- [ ] 目标：达到 90%+ 覆盖率（排除需要澄清的需求）
- [ ] 更新 tasks.md

**输出文件**：
- `.ai-dev-docs/temp/gap-[feature-name].md`
- `.ai-dev-docs/features/$FEATURE_NAME/tasks.md`（更新）

**约束**：
- Subagent 必须对比用户原始需求，不是生成的 requirements.md
- Gap 分析必须客观详细，不隐藏问题
- 不清晰的需求标注疑问但不阻塞其他功能实现

**Phase 4 完成后自动进入 Phase 5（无需用户确认）**

---

## Phase 5: VALIDATE

**目标**：运行项目级验证命令，更新验收状态。

**Checklist**：

- [ ] **执行项目 rules 中定义的验证命令**（如 lint / test / build）
- [ ] **记录验证结果**
- [ ] **更新 qa.md 中自动化验收项的结果**：
    - 将 lint / build / test 等自动化项的「验收结果」列更新为 `✅ pass` 或 `❌ fail`
    - 失败项注明原因
- [ ] **输出未完成的人工验收项提醒**：
    ```markdown
    ## ⚠️ 待人工验收项

    ### P0（交付前必须通过）
    - [ ] [验收项描述] [人工-交互/人工-视觉/人工-逻辑]

    ### P1（建议通过）
    - [ ] [验收项描述] [人工-交互/人工-视觉/人工-逻辑]

    完成后请在 qa.md 对应行的「验收结果」列填写结果。
    ```
- [ ] 测试边界情况和错误处理
- [ ] 验证性能指标

**输出文件**：
- `.ai-dev-docs/temp/validation-[timestamp].md`（可选）

**约束**：项目级验证命令必须全部通过。

**Phase 5 完成后自动进入 Phase 6（无需用户确认）**

---

## Phase 6: REFLECT

**目标**：代码重构、更新文档、分析改进点。

**Checklist**：

- [ ] 重构代码以提高可维护性
- [ ] **更新所有 feature 文档**：
    - requirements.md 反映最终实现
    - design.md 包含所有设计决策
    - tasks.md 所有任务标记为完成
    - qa.md 自动化项结果已更新，人工项已提醒
- [ ] 识别潜在改进点
- [ ] 验证成功标准
- [ ] 记录技术债务
- [ ] 生成改进建议文档（可选，保存到 `.ai-dev-docs/temp/improvements-[timestamp].md`）

**Phase 6 完成后自动进入 Phase 7（无需用户确认）**

---

## Phase 7: HANDOFF

**目标**：打包交付、归档文档、清理环境。

**Checklist**：

- [ ] **生成执行摘要**（保存到 `.ai-dev-docs/temp/handoff-[feature-name]-[timestamp].md`）：
    ```markdown
    # 功能交付摘要 - [功能名称]

    ## 概览
    - 功能名称: [名称]
    - 完成日期: [YYYY-MM-DD]
    - 实现覆盖率: [X%]

    ## 交付物
    - ✅ requirements.md
    - ✅ design.md
    - ✅ tasks.md
    - ✅ qa.md
    - ✅ 代码实现
    - ✅ 验证通过

    ## 已知差距（详见 gap.md）
    - [列出未完成项]

    ## 后续步骤
    - [列出待办]
    ```

- [ ] **可选：创建历史快照**：
    ```bash
    mkdir -p .ai-dev-docs/features/$FEATURE_NAME/history/v1-$(date +%Y-%m-%d)
    cp requirements.md design.md tasks.md qa.md \
       .ai-dev-docs/features/$FEATURE_NAME/history/v1-$(date +%Y-%m-%d)/
    ```

- [ ] **清理临时文件**（必须执行）：
    ```bash
    rm -rf .ai-dev-docs/temp/*
    ```

- [ ] **验证文档位置**（必须执行）：
    ```bash
    FEATURE_DIR=".ai-dev-docs/features/$FEATURE_NAME"
    ALLOWED_FILES="requirements.md design.md tasks.md qa.md"

    for file in $FEATURE_DIR/*.md; do
        filename=$(basename "$file")
        if [[ ! " $ALLOWED_FILES " =~ " $filename " ]]; then
            echo "❌ ERROR: $filename should be in temp directory, not feature directory"
        fi
    done
    ```

**🎉 完成**：

```
┌─────────────────────────────────────────────────────────────┐
│  🎉 HANDOFF COMPLETED                                       │
├─────────────────────────────────────────────────────────────┤
│  📋 功能: [feature-name]                                     │
│  📊 覆盖率: [X%]                                             │
│  📄 文档: ✅ 齐全                                            │
│  🧹 temp: ✅ 已清理                                          │
├─────────────────────────────────────────────────────────────┤
│  🎉 工作流完成！                                             │
│  - 输入 "next" 开始下一个任务                               │
│  - 输入具体反馈进行补充                                     │
└─────────────────────────────────────────────────────────────┘
```
