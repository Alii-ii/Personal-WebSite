# 需求 - Portfolio（作品集）

## 初始需求 - 2026-07-28

## 背景与动机

个站原有 `/gallery`（画作）与 `/resume`（简历）两个二级页，但「作品集」入口一直指向 Figma 外链 —— 访客被带离站点，且 Figma 的浏览体验与个站视觉割裂，也无法承载评论互动。

需要把作品集收归站内，并解决一个结构性问题：**作品集的最小展示单位不是「项目」而是「画面」**。一个项目里既有设计稿、也有代码原型、还有图文论述，用「一个项目一张卡」的传统列表会把这些差异全部压平。

## 项目约束

- 静态站点（Next.js `output: 'export'`），无服务端运行时
- 明暗双主题 + 中英双语，均已有全站机制
- 已有 Masonry 瀑布流组件服务于 `/gallery`，不应为新页面重写
- 评论系统的数据层与 Hook 已完成，UI 层待建
- 设计稿为唯一交互与视觉依据（Figma `UjphPk6xcxCBiscaQDMP0n`，node `11200-2247` / `11171-948`）

---

### Requirement 1：作品墙（L2）

WHEN 访客进入 `/portfolio`，THE SYSTEM SHALL 以 feed 流形式平铺展示所有项目内的画面（frame），而非按项目聚合成单卡。

#### Scenario 1.1：异构内容同墙展示
- **GIVEN** 项目内含图片、代码原型、图文混排三类 frame
- **WHEN** 作品墙渲染
- **THEN** 三类内容以统一的卡片语言呈现
- **AND** 每类有可辨识的类型标识

#### Scenario 1.2：下钻定位
- **GIVEN** 访客在作品墙上看到某个 frame
- **WHEN** 点击该卡片
- **THEN** 进入其所属项目的详情页
- **AND** 定位到该 frame 而非项目首页

#### Scenario 1.3：分类筛选
- **GIVEN** 左栏展示产品项目 / 文章随笔 / Side Project 三个分类
- **WHEN** 点击某个分类
- **THEN** 作品墙仅展示该分类的 frame
- **AND** 再次点击同一分类时取消筛选

---

### Requirement 2：项目详情（L3）

WHEN 访客进入 `/portfolio/{slug}`，THE SYSTEM SHALL 以横向滚动的类 PPT 形式展示该项目的 frame。

#### Scenario 2.1：焦点式浏览
- **GIVEN** 项目含多个 frame
- **WHEN** 页面渲染
- **THEN** 当前页居中放大且不透明
- **AND** 相邻页缩小half透明，提示可继续浏览

#### Scenario 2.2：内容类型通用性
- **GIVEN** frame 可能是图片、代码原型或图文混排
- **WHEN** 渲染任一 frame
- **THEN** 按其类型选择对应渲染方式
- **AND** 新增内容类型时不需改动既有类型的渲染逻辑

#### Scenario 2.3：多维度导航
- **GIVEN** 访客正在浏览某个项目
- **WHEN** 使用键盘、鼠标点击或拖拽
- **THEN** 可在页面之间、项目之间、tab 之间切换
- **AND** 三种输入方式的可达范围一致

---

### Requirement 3：分类 schema 一致性

WHEN L2 左栏与 L3 菜单同时展示项目分组，THE SYSTEM SHALL 使用同一份分类定义。

#### Scenario 3.1
- **GIVEN** 分类定义发生变更
- **WHEN** 两个页面重新渲染
- **THEN** 两处分组结果一致，无需分别维护

---

### Requirement 4：评论

WHEN 访客在项目详情页，THE SYSTEM SHALL 提供针对该项目的评论能力。

#### Scenario 4.1：稳定锚定
- **GIVEN** 作品集内容会增删重排
- **WHEN** 评论与页面关联
- **THEN** 使用稳定标识（slug / frameId）而非数组下标
- **AND** 内容顺序变化后评论不错位

#### Scenario 4.2：不打断浏览
- **GIVEN** 访客正在看某一页
- **WHEN** 唤起评论
- **THEN** 评论区不遮挡当前页主体内容

---

### Requirement 5：不回归

WHEN 为作品集扩展公共组件，THE SYSTEM SHALL 保证既有页面行为不变。

#### Scenario 5.1
- **GIVEN** Masonry 被 `/gallery` 使用中
- **WHEN** 为作品集扩展其能力
- **THEN** `/gallery` 的布局、放大、键盘导航行为完全不变

---

## 约束与边界

- 不做作品集内搜索
- 不做评论回复 / 点赞（沿用既有评论系统能力边界）
- frame 内容为静态数据，不接 CMS
- 移动端优先保证可读可浏览，交互丰富度可低于桌面端

## 置信度评估

| 需求 | 置信度 | 说明 |
|------|--------|------|
| R1 作品墙 | 高 | 设计稿明确，复用既有 feed 布局 |
| R2 项目详情 | 高 | 设计稿明确；frame 类型的扩展性为主动设计 |
| R3 分类一致 | 高 | 设计稿已注明「mock 文案未严格对齐但数据意图一致」 |
| R4 评论 | 中 | 数据层已就绪；target_path 前缀与既有文档存在差异，已在 design 中说明 |
| R5 不回归 | 高 | 通过可选 prop 实现，默认路径不变 |

---

## 交互补充需求 - 2026-07-29（第三轮）

### Requirement 6：L3 移动端适配

WHEN 访客在移动端访问 `/portfolio/{slug}`，THE SYSTEM SHALL 以纵向排列展示 frame。

#### Scenario 6.1：纵向滚动降级
- **GIVEN** 屏幕宽度 < 768px
- **WHEN** 页面渲染
- **THEN** 帧以纵向排列展示，无横向滚动、无居中放大、无虚化效果
- **AND** 每帧 `min-height: 45vh`，尽可能填满屏幕

### Requirement 7：页数轴定位

WHEN 访客在 L3 查看帧列表，THE SYSTEM SHALL 将页数轴始终居中于 footer。

#### Scenario 7.1
- **GIVEN** footer 包含快捷键区和控制开关
- **WHEN** 页面渲染
- **THEN** 页数轴以 absolute 定位居中，不受两侧内容宽度影响

### Requirement 8：图片填充策略

WHEN 访客查看图片类 frame，THE SYSTEM SHALL 以定高填充策略展示图片。

#### Scenario 8.1
- **GIVEN** 图片尺寸与容器比例不一致
- **WHEN** 图片加载完成
- **THEN** 图片填满容器并居中裁剪，保证展示比例一致
- **AND** 不留白边

---

## 迭代 4 - 2026-08-03

### 修改的需求

#### Requirement 6：L3 移动端 frame 旋转展示

WHEN 访客在移动端访问 `/portfolio/{slug}`，THE SYSTEM SHALL 将 L3 的每个 frame 顺时针旋转 90 度展示，并保持其他页面、桌面端布局与既有交互不变。

#### Scenario 6.2：移动端自动旋转
- **GIVEN** 浏览器视口宽度 < 768px
- **WHEN** L3 frame 渲染
- **THEN** frame 的视觉内容与外框整体顺时针旋转 90 度
- **AND** 旋转后的占位尺寸按宽高互换计算，内容不应被页面裁切或引入横向滚动

#### Scenario 6.3：非移动端与非 L3 页面不回归
- **GIVEN** 浏览器视口宽度 ≥ 768px，或访客正在浏览 L3 以外的页面
- **WHEN** 页面渲染
- **THEN** frame 的方向、尺寸、布局与交互保持现状

**← 变更说明**：原 Requirement 6 的“移动端纵向排列”继续保留；本轮仅增加移动端 L3 frame 的 90 度旋转展示，不改变断点、导航、评论、主题和语言行为。

### 约束与边界

- 移动端沿用现有 `max-width: 767px` 判定，不新增设备类型或横竖屏检测。
- “旋转 90 度”暂按 CSS 正角度，即顺时针方向定义。
- 仅修改 L3 移动端 frame 容器及其尺寸计算，不修改 frame 数据和 `FrameRenderer` 的类型分发逻辑。

### 置信度评估

| 需求 | 置信度 | 说明 |
|------|--------|------|
| R6 移动端旋转 | 85% | 页面范围、断点和“不影响其他部分”明确；旋转方向暂按顺时针解释 |
