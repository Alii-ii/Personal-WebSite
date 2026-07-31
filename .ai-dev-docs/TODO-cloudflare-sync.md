# TODO：同步 Cloudflare R2（图片 CDN，本地兜底）

> 状态：**进行中 — 已切 `pub-*.r2.dev` 作为临时 CDN；自定义域 `cdn.alii.work` 仍绑不上（10001）**
> 产出时间：2026-07-28
> 更新：2026-07-29 — 自定义域全挂（含新子域），改用 R2 公网域名；本地 `/images/portfolio/*` 作兜底。新增单节点封面发布命令与完整 SOP。
>
> 基础设施：
> - R2 bucket：`illustration`
> - 临时 CDN：`https://pub-1a0773e1cc80472bbfb854bcaa76d941.r2.dev`
> - 目标 CDN（待恢复）：`https://cdn.alii.work`（Connect Domain 持续 10001）
> - 上传脚本：`npm run sync:portfolio-r2`（`scripts/sync-portfolio-r2.mjs`）
> - 单页发布（封面或任意页）：`npm run publish:figma-page`（`scripts/publish-figma-page.mjs`）
> - 页面组同步：`npm run sync:figma-group`（`scripts/sync-figma-frames.mjs`）
> - 完整流程：`.ai-dev-docs/portfolio-figma-cloudflare-sop.md`

## 目标

```
浏览器请求图片
  ├─ 优先：https://pub-….r2.dev/portfolio/<slug>/<file>.webp   ← 当前临时 CDN
  └─ 失败兜底：/images/portfolio/<slug>/<file>.webp            ← public/ 本地副本
```

自定义域修好后：

```bash
CDN_BASE=https://cdn.alii.work npm run sync:portfolio-r2 -- --json-only
```

## 待办进度

| 项 | 状态 |
| --- | --- |
| 上传 50 原图 + 50 thumbs 到 R2 | **已完成**（100/100） |
| `portfolio.json`：`src`=CDN，`srcLocal`=本地 | **已完成**（50 帧；历史 gallery 帧未改） |
| 前端 thumbs 映射（本地 + CDN） | 已做（`src/utils/portfolioImage.js`） |
| 前端 `onError` 回退本地 | 已做（FrameRenderer / FeedCard / Masonry） |
| 恢复 `cdn.alii.work` 自定义域 | **阻塞**（Dashboard + CLI 均 10001） |
| Pages 重新部署（让 JSON/前端上线） | 上传完成后执行 |
| Design Mode 封面导出 + R2 上传 + JSON 索引 | **已完成**（`portfolio/nocode-design-mode/cover.webp`） |
| Figma Link → Cloudflare SOP（单页 / 页面组） | **已完成**（见 `portfolio-figma-cloudflare-sop.md`） |

## 常用命令

```bash
# 上传 + 写 JSON（当前临时 CDN）
npm run sync:portfolio-r2 -- --write-json

# 只重写 JSON（换 CDN 前缀时）
CDN_BASE=https://cdn.alii.work npm run sync:portfolio-r2 -- --json-only

# 验收
curl -sI "https://pub-1a0773e1cc80472bbfb854bcaa76d941.r2.dev/portfolio/nocode-for-pro/01-p-01.webp" | head -5
curl -sI "https://pub-1a0773e1cc80472bbfb854bcaa76d941.r2.dev/portfolio/nocode-for-pro/thumbs/01-p-01.webp" | head -5
```

## 自定义域阻塞说明

- DNS 里曾有 `cdn` → `pub-….r2.dev`，R2 侧绑定被卸掉后 Connect 报 **internal error / 10001**
- 换全新子域同样 10001 → 像是账号侧 R2 custom domain API 问题，不是单条 DNS
- 临时方案：直接用 `pub-….r2.dev`；域名丑但不阻塞上线

## 遗留

1. 恢复 `cdn.alii.work`（或任意自定义域）后跑 `--json-only` 切换前缀
2. 历史帧 `szrh-szrh-strategy-01` 仍指向 gallery 本地路径
3. frame 标题 / summary 内容完善
