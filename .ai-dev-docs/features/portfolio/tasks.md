# 任务 - Portfolio（作品集）

## 初始任务 - 2026-07-28

## 数据层

- [x] 1. 建立作品集数据源
  - [x] 1.1 `src/data/portfolio.json`：categories + projects + frames 三段式 schema
  - [x] 1.2 frame 支持 `image` / `prototype` / `rich` 三种类型
  - [x] 1.3 `feed.w/h` 显式声明，L2 免图片测量
  - [x] 1.4 title / label / content 全部为 `{ zh, en }` 双语结构
- [x] 2. `src/contexts/ProjectContext.js` 数据访问层
  - [x] 2.1 `getCategories` / `getProjects` / `getProjectsByCategory`
  - [x] 2.2 `getProjectBySlug` / `getAllProjectSlugs`（供 generateStaticParams）
  - [x] 2.3 `getFeedFrames`：把所有项目的 frame 平铺为作品墙，固定 seed 洗牌
  - [x] 2.4 `getProjectFrames` / `getProjectNeighbors`（↑↓ 切换项目）
  - [x] 2.5 `getCommentTargetPath`：`portfolio/{slug}[/{frameId}]`
  - [x] 2.6 `pickLocale` 多语言取值helper

## 组件层

- [x] 3. Masonry 通用化改造（向后兼容，gallery 零改动）
  - [x] 3.1 新增 `renderItem` / `getItemHeight` / `expandable` / `onItemClick` / `maxColumnWidth`
  - [x] 3.2 无 `item.img` 时跳过图片预加载，直接标记就绪
  - [x] 3.3 `getItemHeight` 优先于 aspectRatio 测高
  - [x] 3.4 `expandable=false` 时点击走 `onItemClick`（下钻）
  - [x] 3.5 清理渲染体内每帧执行的 console.log
- [x] 4. L2 组件
  - [x] 4.1 `PortfolioSidebar.jsx`：姓名 / 社交图标 / 分类筛选 + 展开项目列表
  - [x] 4.2 `FeedCard.jsx`：三类型卡片预览 + 类型角标 + hover 项目信息
- [x] 5. L3 组件
  - [x] 5.1 `FrameRenderer.jsx`：type 分发 + rich blocks 递归渲染
  - [x] 5.2 `ProjectMenu.jsx`：320w 浮层，分组同 L2 分类，默认收起
  - [x] 5.3 `ShortcutBar.jsx`：ESC / ←→ / ↑↓ / C 提示，移动端隐藏
  - [x] 5.4 `SlideProgress.jsx`：catalog 进度条，当前项 32h
  - [x] 5.5 `ProjectDetail.jsx`：横向轨道 + 实测居中 + 快捷键 + 评论抽屉
- [x] 6. 评论 UI（`src/components/comments/`）
  - [x] 6.1 CommentSection / List / Item / Form / NicknameDialog / index
  - [x] 6.2 targetPath 为空时不渲染（规避 useComments isLoading 卡死）
  - [x] 6.3 输入框 `stopPropagation`，避免被 L3 快捷键劫持

## 页面集成

- [x] 7. 路由
  - [x] 7.1 `src/app/portfolio/page.jsx`（client）
  - [x] 7.2 `src/app/portfolio/[slug]/page.jsx`（server + generateStaticParams）
  - [x] 7.3 `ProjectDetailClient.jsx`：读取 hash 定位 frame

## 验证

- [x] 8. 构建与实测
  - [x] 8.1 `pnpm build` 静态导出成功，10 个项目页全部预生成
  - [x] 8.2 L2 渲染：侧栏 + 三类型卡片混排
  - [x] 8.3 L3 渲染：header / tabs / 居中 slide / 快捷键条 / 进度条
  - [x] 8.4 激活页居中精度：delta = 0px
  - [x] 8.5 ←→ 切页并重新居中
  - [x] 8.6 C 键开合评论抽屉
  - [x] 8.7 目录菜单：10 个项目按分类分组，当前项高亮
  - [x] 8.8 L2 卡片下钻：跳转正确 slug 且 hash 带 frameId
  - [x] 8.9 gallery 回归：18 卡片 / 18 图片 / 放大 + 遮罩正常
  - [x] 8.10 明暗主题均验证

---

## 交互补充任务 - 2026-07-28（第二轮）

### 导航与入口

- [x] 9. 作品集入口收归站内
  - [x] 9.1 首页 footer「作品集」由 Figma 外链改为 `/portfolio` + `target="_self"`
  - [x] 9.2 `Footer` 新增 `backHref` prop（默认 `/`），返回目标不再硬编码

### L2 布局

- [x] 10. 二级页 footer 收敛到左侧
  - [x] 10.1 返回箭头缩至 28px（容器 30px），与 switch 等高
  - [x] 10.2 主题 / 语言开关移到箭头同排左置
  - [x] 10.3 右侧区块渲染 `null`
- [x] 11. 左栏视觉减负
  - [x] 11.1 分割线保留占位间距、去掉背景色
  - [x] 11.2 社交图标默认 `grayscale`，hover 还原品牌色
  - [x] 11.3 移除「全部」，复位职责下沉到分类标题反选
- [x] 12. 左栏 sticky
  - [x] 12.1 `md:sticky md:top-0 md:self-start md:max-h-screen`
  - [x] 12.2 去掉 L2 内容区 `overflow-y-auto`（否则形成独立滚动容器致 sticky 失效）

### L3 交互

- [x] 13. 快捷键鼠标点击路径分级
  - [x] 13.1 ESC 返回、C 评论：符号 + 文字整体可点（`group-hover` 联动）
  - [x] 13.2 ←→ 切换页面、↑↓ 切换项目：仅符号可点，文字为 `<span>`
  - [x] 13.3 `ProjectDetail` 补 `goBack` / `toggleComment` 并透传全部回调
- [x] 14. 快捷键小块去描边（仅留 `bg-press` + `r4`）
- [x] 15. 拖拽切页
  - [x] 15.1 pointer 事件 + 60px 阈值，左拖下一页 / 右拖上一页
  - [x] 15.2 拖拽中禁用 transition 保持跟手
  - [x] 15.3 `suppressClickRef` 抵消尾随 click（位移 > 6px 时）
  - [x] 15.4 `pointerup` / `pointercancel` 挂 window，防止卡在拖拽态
- [x] 16. tabs 显示条件与快捷键
  - [x] 16.1 `tabs.length > 1` 才渲染
  - [x] 16.2 alt + 数字绑定「从右往左」顺位（0→最右，9、8 依次左移）
  - [x] 16.3 用 `event.code` 匹配 `Digit[0-9]`（macOS 上 Alt+数字产生特殊字符）
  - [x] 16.4 换算式 `11 - digit`（`10 - digit` 会让 Alt+9 与 Alt+0 冲突）
  - [x] 16.5 tab `title` 展示 `Alt + N`，与 handler 共用换算
- [x] 17. 菜单项移除 `icon/send`（`>`）与竖分割线（组件自带的隐藏图层）

### 验证

- [x] 18. 第二轮实测
  - [x] 18.1 首页 footer 三个链接指向正确（简历 / 作品集站内、主站外链）
  - [x] 18.2 L2 footer 箭头与开关高度对齐（30 / 29 / 29px），右侧无内容
  - [x] 18.3 L2 左栏 sticky：body 滚动 500px 时 `top` 保持 0
  - [x] 18.4 「全部」已移除，分类可反选
  - [x] 18.5 菜单项仅剩标题 + 时间两个 span，无 svg / divider
  - [x] 18.6 快捷键小块 `border-width: 0px`
  - [x] 18.7 alt+0 / 9 / 8 分别命中页面原稿 / 代码实现 / 设计策略
  - [x] 18.8 拖拽左右各切一页并正确回中
  - [x] 18.9 点击「评论」文字开抽屉、「→」翻页、「返回」回 L2
  - [x] 18.10 `pnpm build` 静态导出通过，10 个项目页全部预生成

---

## 交互补充任务 - 2026-07-29（第三轮）

### L3 布局与样式

- [x] 19. 移动端纵向布局
  - [x] 19.1 PC 端横向布局 `hidden md:flex`，移动端 `flex md:hidden flex-col`
  - [x] 19.2 移动端无虚化无大小变化，统一 `opacity-100` / `opacity-40`
  - [x] 19.3 移动端每帧 `min-height: 45vh`
- [x] 20. 页数轴 absolute 居中
  - [x] 20.1 SlideProgress 改为 absolute 定位，不参与 flex 布局
  - [x] 20.2 快捷键和开关两侧分布
- [x] 21. 图片 frame 定高填充策略
  - [x] 21.1 改用 `object-cover` 替代 `object-contain`
  - [x] 21.2 容器用 `overflow-hidden` 确保裁剪生效

### 验证

- [x] 22. 第三轮实测
  - [x] 22.1 移动端 L3 纵向排列，无横向滚动
  - [x] 22.2 页数轴始终居中于 footer
  - [x] 22.3 图片 frame 填满容器并按比例裁剪
  - [x] 22.4 `pnpm build` 静态导出通过

---

## 待办（后续迭代）

- [ ] 23. 替换占位素材：当前 frame 用 gallery 图片占位，需换成真实项目图
- [ ] 24. 补充 `portfolio*` i18n 文案到 LanguageContext（当前组件内就地双语）
- [ ] 25. 若 frame 内出现需横向滚动的内容，需在该容器 `stopPropagation` 避免与拖拽切页抢手势
- [ ] 26. L3 PC 端帧居中定位优化（当前 absolute 居中方案已回退，待重新设计）

---

## 迭代 4 任务 - 2026-08-03

### L3 移动端旋转

- [x] 27. 实现移动端 frame 顺时针旋转 90 度 ✅ 2026-08-03
  - [x] 27.1 在 `MobileSlides` 中计算旋转后的倒数宽高比 ✅ 2026-08-03
  - [x] 27.2 增加外层占位框和交换宽高的旋转内层 ✅ 2026-08-03
  - [x] 27.3 保留桌面端、L2 和 `FrameRenderer` 现有行为 ✅ 2026-08-03
- [x] 28. 验证响应式边界与回归 ✅ 2026-08-03
  - [x] 28.1 验证移动端图片 frame 完整旋转且无横向滚动 ✅ 2026-08-03
  - [x] 28.2 验证 prototype / rich frame 的视觉和交互边界 ✅ 2026-08-03
  - [x] 28.3 验证桌面 L3 及生产构建不变 ✅ 2026-08-03

### L3 移动端 footer 修复

- [x] 29. 修复移动浏览器动态工具栏导致 footer 越出可视区 ✅ 2026-08-03
  - [x] 29.1 确认 `font-Ding` 已加载且文本字形边界正常 ✅ 2026-08-03
  - [x] 29.2 使用 `100dvh` 跟随真实动态视口，保留 `100vh` 兼容回退 ✅ 2026-08-03
  - [x] 29.3 验证 footer 与返回按钮边界位于移动端 visual viewport 内 ✅ 2026-08-03

---

## 迭代 5 任务 - 2026-08-03

### 简历页移动端 footer 菜单

- [x] 30. 扩展通用菜单底栏 ✅ 2026-08-03
  - [x] 30.1 为 `AppMenu` 增加可选 footerActions slot ✅ 2026-08-03
  - [x] 30.2 保证 HomeMenu 与 PortfolioMenu 默认底栏不变 ✅ 2026-08-03
- [x] 31. 收敛简历页移动端侧栏 ✅ 2026-08-03
  - [x] 31.1 移动端隐藏联系方式按钮组 ✅ 2026-08-03
  - [x] 31.2 移动端隐藏节点目录，桌面端保持现状 ✅ 2026-08-03
- [x] 32. 接入简历页移动端菜单 ✅ 2026-08-03
  - [x] 32.1 新增 ResumeMenu 并复用 `RESUME_SECTIONS` ✅ 2026-08-03
  - [x] 32.2 迁移下载、复制微信、复制邮箱、Figma、小红书操作 ✅ 2026-08-03
  - [x] 32.3 增加与作品集页一致的移动端 MenuButton ✅ 2026-08-03
- [x] 33. 验证简历页与公共菜单回归 ✅ 2026-08-03
  - [x] 33.1 验证移动端节点跳转和联系方式操作 ✅ 2026-08-03
  - [x] 33.2 验证桌面端简历侧栏不变 ✅ 2026-08-03
  - [x] 33.3 验证首页与作品集菜单不变并通过生产构建 ✅ 2026-08-03
