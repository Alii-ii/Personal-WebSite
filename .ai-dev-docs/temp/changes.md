# 本次改动整理（2026-03-30，Asia/Shanghai）

## 1. 背景与目标
- 目标 1：优化网站首次打开时的白屏体验（仅首屏，不影响页面间过渡）。
- 目标 2：Footer 的更新时间改为自动更新（基于构建信息）。
- 目标 3：移除 `PortfolioContext` 对 Supabase 的运行时依赖。
- 目标 4：修复 Gallery 首屏 hydration mismatch 风险。
- 目标 5：沉淀本轮改动文档，并引入 spec workflow 文档。

## 2. 需求确认（ANALYZE 摘要）
- 首屏必须先展示 loading，避免空白页和未样式化内容闪现。
- Loading 在 dark mode 下需要正确展示文字对比度。
- Loading 文案动画需为平滑缓动（ease-out），并带上下位移。
- 路由切换过渡机制不在本次改动范围内。

## 3. 设计与实现（DESIGN/IMPLEMENT 摘要）
- 首屏 Loading（`src/app/layout.js`）：
  - 使用内联结构 + 脚本控制显示/隐藏，降低 CSS 未就绪时的闪白风险。
  - 保持仅首屏生效，不通过 `src/app/loading.jsx` 接管路由段过渡。
  - 根据 `localStorage.theme` + `prefers-color-scheme` 应用首屏 dark/light 配色。
  - 统一文字颜色 token 为 `neutral-fg-secondary`，并让文字 `color: inherit`，修复 dark 背景下文字不可见。
  - `Loading…` 动画改为 JS 驱动的 `easeOutCubic` 平滑缓动，透明度与位移使用同一曲线。
  - 当前参数：单程 `450ms`（总周期 `900ms`），位移幅度 `2px`（上下）。
  - 保留 `prefers-reduced-motion` 关闭动画能力。
- 自动更新时间：
  - 构建前执行 `scripts/get-last-commit-date.js`。
  - `src/lib/git-info.js` 优先读取 `buildTime`/`lastCommitDate` 并格式化显示。
  - `package.json` 中 `build`、`export` 串联自动日期更新；新增 `build:clean` 做干净构建。
- Supabase 清理：
  - `src/app/gallery/page.jsx` 移除 Supabase 拉取逻辑，仅用静态作品集数据。
- Hydration 稳定性修复：
  - `src/contexts/PortfolioContext.js` 使用固定 seed（`portfolio-order-v1`）的确定性洗牌，替代 `Math.random()`。
  - 保持“随机观感”同时确保 SSR/CSR 首帧一致，减少 hydration mismatch。
- Workflow 文档：
  - 新增 `.cursor/rules/spec-workflow.md`，作为本地开发流程规范文档。

## 4. 受影响文件
- `.cursor/rules/spec-workflow.md`
- `.ai-dev-docs/temp/changes.md`
- `src/app/layout.js`
- `src/app/gallery/page.jsx`
- `src/contexts/PortfolioContext.js`
- `src/lib/git-info.js`
- `package.json`

## 5. 不变更项（本次明确约束）
- 不改动页面间路由过渡 Loading 机制。
- 不新增第三方依赖。
- 不调整既有组件 API。

## 6. 验证记录
- 已执行：`npm run build:clean`（此前回合）。
- 结果：构建与导出通过。
- 已知提示：`browserslist` 数据过旧（不影响本次功能）。
- 本轮后续动画参数与 token 调整未重复触发构建（按会话偏好）。

## 7. 后续建议
- CI 与本地统一使用 `npm run build:clean` 以规避 `.next` 缓存错位问题。
- 若后续仍出现 hydration warning，优先排查首屏涉及的“非确定性渲染值”。
