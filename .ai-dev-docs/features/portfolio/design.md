# 设计 - Portfolio（作品集）

## 初始设计 - 2026-07-28

## 一、目标与范围

新增两级页面，数据与交互均以 Figma 设计稿为准（file `UjphPk6xcxCBiscaQDMP0n`）：

| 层级 | 路由 | Figma node | 说明 |
|------|------|-----------|------|
| L2 作品墙 | `/portfolio` | `11200-2247` | 复用 gallery 的 feed 布局，但卡片不是「一个项目一张卡」，而是把项目内的图 / 代码原型 frame **平铺**出来 |
| L3 项目详情 | `/portfolio/[slug]` | `11171-948` | 横向滚动的类 PPT 展示，frame 可为图片 / 代码原型 / 图文混排 |

L2 任意卡片点击 → 下钻到其所属项目的 L3，并定位到对应 frame。

---

## 二、Figma 提取的关键规格

### L2（1440×952 画板）

```
content (HORIZONTAL)
├── name    352w  padding 64/80  gap 16      ← 左侧固定栏
│   ├── 「黄奕礼」   DingTalk JinBuTi 64/64  fg .95
│   ├── 「Alii / 阿礼」 DingTalk 24/24        fg .95
│   ├── divider 192w
│   ├── icons  gap 6, item 24×24 r6, 中间夹一个 16×24 分割线
│   ├── divider
│   └── 分类项 ×3  (link 26h + icon/arrow 20×20)  ← 产品项目/文章随笔/Side Project
└── content 1088w (HORIZONTAL) gap 12, paddingRight 12
    └── col ×2   532w each, VERTICAL gap 12
        └── menu/asset.image  532×{340,426,344,252,254,315,262,320,334}  r12
            fill rgba(17,25,37,0.03) + IMAGE(scaleMode=FILL)
            └── content: icon/image 28×28（hover 浮标）
```

要点：卡片**宽度固定 532、高度随内容变化** → 与 gallery「按图片宽高比算高」同构，可复用 Masonry 列布局；但卡片内容需支持非图片类型。

### L3（1440×900 画板，r20, clipsContent）

```
slides (HORIZONTAL, gap 24)
├── Page  1100×619  r12  opacity 0.5  shadow(40)          ← 非激活
├── Page  1332×749  r12  shadow(36) + BACKGROUND_BLUR(24) ← 激活（居中）
│   ├── Frame744 (HORI, 两端对齐)
│   │   ├── title: [目录按钮 32×32 r8] +「NoCode for Pro」DingTalk 24 +「2025.H2」16 fg.45
│   │   └── tabs: tab/title 87×32, gap 4, 分隔符「/」   ← 设计策略/代码实现/页面原稿
│   └── menu/project 320×388 r12 fill rgba(25,29,37,0.90) pad 8 gap 2  ← 浮层，默认收起
│       ├── menu/item.time 304×28  分组标题 fg.45（产品项目 / 文章随笔）
│       └── scrolling_area (VERT gap2)
│           └── menu/item 304×32 r8  pad 10/4
│               [icon 16×16] [分割线] [title fg.95] [slot: 时间 fg.45]
│               激活态 fill rgba(255,255,255,0.15)
└── Page  1100×619  r12  opacity 0.5  shadow(40)

footer (1440×70, pad 64/36)
├── 快捷键区 gap4: [ESC]返回 | [←][→]切换页面 | [↑][↓]切换项目 | [C]评论
│   shortCut 单元 20×20（ESC 32×20）r4，文字 SF Pro 12 fg.45
├── catalog 进度条: bar 16h（当前项 32h）
└── 右: ThemeToggle + LanguageToggle（Switch.icon 57×30 r8）
```

**核心洞察**：L3 菜单的分组（产品项目 / 文章随笔 / Side Project）= L2 左栏分类。两者共用同一份分类 schema，mock 文案未严格对齐但设计意图一致。

### 字体与色彩映射

| Figma | 站内 token |
|-------|-----------|
| DingTalk JinBuTi | `font-Ding` |
| Alibaba PuHuiTi 2.0 400 | `font-alibaba-regular` |
| fg .95 | `text-main` |
| fg .65 | `text-secondary` |
| fg .45 | `text-tertiary` |
| fill rgba(17,25,37,0.03) | `bg-press` |
| 菜单浮层 rgba(25,29,37,0.90) | `bg-card/90` + `backdrop-blur` |
| 激活项 rgba(255,255,255,0.15) | `bg-hover` |

设计稿为暗色，但站点明暗双主题 → **一律走 token，不硬编码颜色，不写 `dark:` 变体**。

---

## 三、架构决策

### 决策 1：数据模型 —— 项目 = 分类 + frames

L2 平铺的是 frame，L3 展示的也是 frame，二者是**同一份数据的两种投影**。

```js
// src/data/portfolio.json
{
  "categories": [
    { "key": "product", "label": { "zh": "产品项目", "en": "Products" } },
    { "key": "writing", "label": { "zh": "文章随笔", "en": "Writing"  } },
    { "key": "side",    "label": { "zh": "Side Project", "en": "Side Project" } }
  ],
  "projects": [
    {
      "slug": "nocode-for-pro",          // 稳定标识：路由 + 评论 target_path
      "category": "product",
      "title": { "zh": "NoCode for Pro", "en": "NoCode for Pro" },
      "period": "2025.H2",
      "tabs": [
        { "key": "strategy", "label": { "zh": "设计策略", "en": "Strategy" } },
        { "key": "code",     "label": { "zh": "代码实现", "en": "Code" } },
        { "key": "design",   "label": { "zh": "页面原稿", "en": "Design" } }
      ],
      "frames": [
        {
          "id": "strategy-01",           // 项目内唯一 → L2 卡片 key、L3 锚点
          "tab": "strategy",
          "type": "image",               // image | prototype | rich
          "feed": { "w": 532, "h": 340 },// L2 卡片尺寸（决定瀑布流高度）
          "src": "/images/portfolio/xxx.webp",
          "alt": "…"
        }
      ]
    }
  ]
}
```

`feed.w/h` 显式声明，使 L2 **无需预加载图片测量原始尺寸**即可布局 —— 避免 prototype/rich 类型无 `naturalWidth` 的问题，同时消除首屏抖动。

### 决策 2：frame 三种类型的通用渲染

L3 的 frame「可能展示图片、代码原型、图文混排」，用 `FrameRenderer` 按 `type` 分发，新增类型只加一个分支：

| type | 数据字段 | 渲染 |
|------|---------|------|
| `image` | `src`, `alt` | `<img>`，`object-contain` |
| `prototype` | `url` 或 `html` | `<iframe>` 沙箱内嵌代码原型 |
| `rich` | `blocks[]` | 图文混排，block 再分 `text`/`image`/`code`/`grid` |

`rich.blocks` 保持递归结构，排版自由度由 `layout` 字段（`row`/`column`/`grid`）表达，不写死版式。

### 决策 3：Masonry 最小侵入式泛化

不新写瀑布流，给现有 `Masonry.jsx` 加**可选** prop，gallery 调用方零改动：

```js
renderItem?:     (item, { w, h, isExpanded }) => ReactNode
getItemHeight?:  (item, columnWidth) => number   // 跳过图片测量，直接给高
expandable?:     boolean (default true)          // false 时点击不放大
onItemClick?:    (item) => void
maxColumnWidth?: number (default 360)            // L2 需要 532
```

改动点：
1. `grid` useMemo 中，有 `getItemHeight` 则用之，否则走原 aspectRatio 逻辑；
2. 图片预加载 effect 增加守卫：无 `item.img` 时直接标记 ready；
3. 渲染分支：`renderItem ? renderItem(...) : <原 img 分支>`；
4. `handleImageClick` 开头：`if (!expandable) { onItemClick?.(item); return; }`；
5. 顺带清理渲染体内每帧执行的 `console.log`。

### 决策 4：静态导出下的动态路由

`output: 'export'` 要求动态段必须有 `generateStaticParams`，而该函数不能出现在 `"use client"` 文件里 → 拆分：

```
src/app/portfolio/[slug]/page.jsx           Server Component，导出 generateStaticParams
src/components/portfolio/ProjectDetail.jsx  "use client"，承载横向滚动与快捷键
```

Next 15 中 `params` 是 Promise，需 `const { slug } = await params`。

### 决策 5：快捷键冲突规避

已存在的全局监听：`ThemeToggle`(Shift+C)、`LanguageToggle`(Shift+L)、`AuthContext`(连按 3×Cmd / 3×Shift)、`Masonry`(方向键切图)。

L3 的 `←→ ↑↓ ESC C` 监听规则：
- L3 不挂载 Masonry，方向键不冲突；
- `C` 与 `Shift+C` 区分：仅当 `!e.shiftKey && !e.metaKey && !e.ctrlKey` 才触发评论；
- 输入框内 `e.stopPropagation()`，且 handler 内判断 `e.target` 为 input/textarea 时直接 return。

### 决策 6：评论接入

沿用既有 `useComments(targetPath)`：

| 维度 | target_path |
|------|-------------|
| 项目整体 | `portfolio/{slug}` |
| 单 frame（预留） | `portfolio/{slug}/{frameId}` |

> 与 comment-system/design.md 的差异：该文档预留的是 `project/{slug}`。此处改用 `portfolio/` 前缀以与路由 `/portfolio/[slug]` 对齐，避免两套心智。

`slug` / `frameId` 均为数据中的稳定字段，**不使用数组索引**，满足既有约定（内容增删不错位）。评论面板由 `C` 键唤起，做成右侧抽屉，不遮挡 slide 主体。

---

## 四、组件结构

```
src/
├── data/portfolio.json                       新增
├── contexts/ProjectContext.js                新增 getProjects/getProjectBySlug/getFeedFrames
├── effects/Masonry.jsx                       改造（向后兼容）
├── app/portfolio/
│   ├── page.jsx                              L2（client）
│   └── [slug]/page.jsx                       L3 壳（server + generateStaticParams）
└── components/portfolio/
    ├── PortfolioSidebar.jsx   L2 左栏：姓名 / icons / 分类
    ├── FeedCard.jsx           L2 卡片（供 Masonry renderItem 使用）
    ├── ProjectDetail.jsx      L3 主容器：横向滚动 + tabs + 快捷键 + 拖拽
    ├── FrameRenderer.jsx      type 分发：image / prototype / rich
    ├── ProjectMenu.jsx        320w 浮层菜单（默认收起）
    ├── ShortcutBar.jsx        底部快捷键提示（可点击）
    └── SlideProgress.jsx      底部 catalog 进度条
```

> 实现时 slide 外壳与顶部 tabs 未单独拆文件：二者都强依赖 `ProjectDetail` 的 activeIndex / activeTab 状态与轨道测量，单独抽出只会增加 prop 透传成本，故内联在 `ProjectDetail.jsx` 中。最终 `components/portfolio/` 为 7 个文件。

---

## 五、错误处理

| 场景 | 处理 |
|------|------|
| slug 不存在 | `generateStaticParams` 只产出已知 slug；客户端兜底 `notFound()` |
| frame 图片加载失败 | 占位 SVG + alt 文案，不阻塞其他 frame |
| prototype iframe 失败/超时 | 显示「原型加载失败」+ 原链接跳转 |
| 评论 targetPath 未就绪 | slug 拿到前不渲染 CommentPanel（避免 `useComments` 卡在 isLoading） |
| 窄屏（<768px） | L3 降级为纵向滚动，隐藏快捷键条 |

---

## 六、文件变更清单

| 文件 | 操作 | 状态 |
|------|------|------|
| `src/data/portfolio.json` | 新增 | ✅ |
| `src/contexts/ProjectContext.js` | 新增 | ✅ |
| `src/effects/Masonry.jsx` | 改造 | ✅ |
| `src/app/portfolio/page.jsx` | 新增 | ✅ |
| `src/app/portfolio/[slug]/page.jsx` | 新增 | ✅ |
| `src/components/portfolio/*` | 新增 ×7 | ✅ |
| `src/components/comments/*` | 新增 ×6 | ✅ |
| `src/contexts/LanguageContext.js` | 补 portfolio 文案 | ⏳ 组件内就地双语，未收敛 |

---

## 设计更新 - 2026-08-03（移动端 L3 frame 旋转）

### 修改的架构

**之前**：`MobileSlides` 直接以图片原始宽高比设置 section 的 `aspect-ratio`，frame 内容保持原方向。

**现在**：仅在 `MobileSlides` 中增加两层容器。外层 section 负责旋转后的文档流占位，内层负责承载既有 frame 外观并执行 `rotate(90deg)`。桌面端 `DesktopSlides`、`FrameRenderer`、frame 数据结构和移动端断点均不变。

```text
MobileSlides
└── section（旋转后的占位框：宽 = 可用宽度，高 = 可用宽度 ÷ 原始宽高比的倒数）
    └── div（原始 frame 尺寸，absolute 居中，rotate(90deg)）
        └── FrameRenderer（保持不变）
```

### 尺寸与变换策略

设移动端容器可用宽度为 `W`，frame 原始宽高比为 `R = width / height`。旋转 90° 后的视觉宽高比为 `1 / R`，因此外层 section 使用 `aspect-ratio: 1 / R`。内层在旋转前交换占位框宽高，即 `width = section height`、`height = section width`，以中心点执行 `transform: translate(-50%, -50%) rotate(90deg)`，旋转后恰好填满外层 section。

无可用比例的 frame 沿用原有最小高度降级逻辑，并以容器尺寸作为旋转前尺寸；不修改 iframe、rich content 或图片渲染行为。

### 响应式边界

| 场景 | 行为 |
|------|------|
| `< 768px` 的 L3 | 外框与内容整体顺时针旋转 90°，纵向列表保留 |
| `≥ 768px` 的 L3 | 沿用桌面横向幻灯片，不旋转 |
| L2、Gallery、Resume、首页 | 不经过 `MobileSlides`，完全不变 |

### 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/portfolio/ProjectDetail/components/ProjectSlides.jsx` | 修改 | 增加移动端旋转占位与变换，桌面分支不动 |
| `.ai-dev-docs/features/portfolio/{requirements,design,tasks,qa}.md` | 追加 | 记录需求、设计、任务及验收结果 |

### 风险与处理

| 风险 | 处理 |
|------|------|
| 旋转后宽高仍按原比例导致裁切 | 外层使用倒数比例，内层交换宽高 |
| `overflow-hidden` 提前裁掉旋转内容 | 旋转在内层完成，外层只裁切最终视觉边界 |
| prototype / rich frame 的滚动和点击坐标异常 | 旋转容器与内容一同变换，浏览器自动映射命中区域；人工验证交互 |
| SSR 初次渲染误判设备 | 沿用 CSS `md:hidden` 分支控制可见性，不依赖 JS 才决定旋转 |

---

## 交互补充设计 - 2026-07-28（第二轮）

第一轮实现后的交互细化，共 9 项。均以设计稿与实际手感为准，不改动数据模型与路由结构。

### 一、导航与入口

#### 决策 7：作品集入口收归站内

首页 footer 的「作品集」原先指向 Figma 外链，现改为站内 `/portfolio` + `target="_self"`。

同时给 `Footer` 增加 `backHref` prop（默认 `/`）。原先 gallery 模式的返回按钮硬编码回首页，作品集 L2 与后续二级页若要改返回目标，不必再改组件内部。

### 二、L2 布局调整

#### 决策 8：二级页 footer 收敛到左侧

| 项 | 调整前 | 调整后 |
|----|--------|--------|
| 返回箭头 | 左侧，48/56px | 左侧，28px（容器 30px） |
| 主题 / 语言开关 | 右侧独立区块 | 与箭头同排左置，gap 12 |
| 右侧区块 | `footer__right-gallery` | 渲染 `null` |

箭头字号对齐 switch 高度（实测 30 / 29 / 29px），三者视觉成组。

#### 决策 9：左栏 sticky 与视觉减负

- **sticky**：`md:sticky md:top-0 md:self-start md:max-h-screen`。
  - 关键约束：L2 内容区原有的 `overflow-y-auto` 会形成独立滚动容器导致 sticky 失效，必须去掉，交由文档流（实际滚动容器是 `body`，因 globals.css 有 `html, body { height: 100% }`）滚动。
- **分割线**：保留 `w-[192px] h-px` 占位但去掉背景色，维持原有间距节奏而不显示横线。
- **社交图标**：默认 `grayscale`，hover `grayscale-0` 还原品牌色（与首页 footer 图标行为一致）。
- **「全部」入口移除**：其复位职责下沉到分类标题本身 —— 点击已激活的分类可取消筛选，避免多一个入口。

### 三、L3 交互增强

#### 决策 10：快捷键的鼠标点击路径分级

快捷键提示条不再是纯提示，而是可操作控件，但**按语义分两级**：

| 快捷键 | 可点范围 | 理由 |
|--------|---------|------|
| ESC 返回 | 符号 + 文字整体 | 单一动作，整块点击容错高 |
| C 评论 | 符号 + 文字整体 | 同上 |
| ←→ 切换页面 | **仅符号** | 一个文字标签对应两个方向，整块点击语义不明 |
| ↑↓ 切换项目 | **仅符号** | 同上 |

实现上：整块可点的用 `<button>` 包住符号+文字并用 `group-hover` 联动；仅符号可点的把符号做成独立 `<button>`、文字保持 `<span>`。

#### 决策 11：拖拽切页

pointer 事件实现，阈值 60px，向左拖看下一页、向右拖看上一页。

两个必要处理：
1. **拖拽中禁用 transition**，轨道跟手；松手后恢复动画补间到目标位。
2. **抵消尾随 click**：拖拽结束浏览器会补发一次 click，会被 slide 的 `onClick` 当成点选卡片。位移超过 6px 时置 `suppressClickRef`，在下一个 tick 清除。

> 已知边界：拖拽挂在整个 `<main>` 上。若后续 frame 内出现需要横向滚动的内容（宽表格、可拖动原型），需在该容器上 `stopPropagation`。当前三种 frame 类型均不冲突。

#### 决策 12：tabs 的显示条件与快捷键绑定

- **显示条件**：`tabs.length > 1` 才渲染，单 tab 或无 tab 项目自动隐藏。
- **快捷键绑定顺位而非固定 tab**：从键盘的 `0` 开始，对应**从右往左**数的 tab。

  | 按键 | 对应 | 换算 |
  |------|------|------|
  | Alt+0 | 倒数第 1 个（最右） | `fromRight = 1` |
  | Alt+9 | 倒数第 2 个 | `fromRight = 11 - 9 = 2` |
  | Alt+8 | 倒数第 3 个 | `fromRight = 11 - 8 = 3` |

  索引：`index = tabs.length - fromRight`，越界不响应。

  **两个实现陷阱**（均已踩过并修正）：
  - macOS 上 `Alt+数字` 会产生特殊字符（Alt+8 → `•`），`event.key` 取不到数字，必须用 `event.code` 匹配 `Digit[0-9]`。
  - 换算式若写成 `10 - digit`，Alt+9 会算出 `fromRight = 1` 与 Alt+0 冲突，正确式为 `11 - digit`。

- tab 按钮 `title` 展示 `Alt + N` 提示，与 handler 共用同一套换算。

#### 决策 13：快捷键小块去描边

`unit/shortCut` 去掉 `border-stroke`，仅保留 `bg-press` + `r4`，与设计稿一致。

#### 决策 14：菜单项去掉隐藏图层

设计稿 `menu/item` 里的 `icon/send`（`>`）与其后的竖分割线是组件自带的隐藏图层，此场景用不上，渲染时移除。菜单项最终只有标题 + 时间两个元素。

---

## 交互补充设计 - 2026-07-29（第三轮）

第三轮 UI 优化，共 4 项。

### 四、L3 布局与样式优化

#### 决策 15：移动端纵向布局

L3 在移动端（<768px）降级为纵向排列，**不保留**横向滚动、居中放大、虚化等桌面端特性：

- **隐藏横向滚动**：PC 端横向布局用 `hidden md:flex`，移动端独立 `flex md:hidden flex-col`
- **无虚化无大小变化**：所有帧统一 `w-full`，活跃帧 `opacity-100`，非活跃帧 `opacity-40`
- **最小高度**：每帧 `min-height: 45vh`，尽可能填满屏幕高度

#### 决策 16：页数轴 absolute 居中

`SlideProgress` 不再作为 footer flex 布局的一员，改为 `absolute` 定位：

```jsx
<footer className="relative ...">
  {/* absolute 居中 */}
  <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
    <SlideProgress ... />
  </div>
  {/* 两侧内容正常分布 */}
  <div className="flex items-center justify-between">
    <ShortcutBar ... />
    <div className="flex ...">
      <ThemeToggle />
      <LanguageToggle />
    </div>
  </div>
</footer>
```

#### 决策 17：图片 frame 定高填充策略

为未来可能展示尺寸各异的图片做准备，图片类 frame 改为 `object-cover` 定高填充：

- 容器固定尺寸（继承父元素高度）
- 图片填满容器并居中裁剪，保证比例一致
- 不同于 `object-contain`（完整显示但留白），`object-cover` 始终填满

---

### 第三轮文件变更清单

| 文件 | 操作 | 涉及决策 |
|------|------|---------|
| `src/components/portfolio/ProjectDetail.jsx` | PC/Mobile 断点分离布局、footer absolute 页数轴 | 15、16 |
| `src/components/portfolio/FrameRenderer.jsx` | 图片 frame 改 `object-cover` | 17 |
