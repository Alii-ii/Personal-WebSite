# TODO：同步 Cloudflare（本次未执行，交由其他工具）

> 状态：**本地已完成，Cloudflare 侧待执行（见下方说明）**
> 产出时间：2026-07-28
> 更新：2026-07-29 — 本次 3 个项目均已 git commit，push 后 GitHub Actions 自动部署
> 未执行原因：当前会话的 Cloudflare MCP 不可用，且本机未配置 `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID`。
> 本地侧（Figma 导出 → webp 压缩 → portfolio.json 写入 → 构建验证）已全部完成，**Cloudflare 侧一步未做**。

## 本次变更内容

| 项目 | Figma 节点 | 帧数 | 原始 → webp |
| --- | --- | --- | --- |
| `undergraduate-thesis` 本科毕设 | `739-47421` 【本科毕设】 | 16 | 25.68 MB → 1.42 MB |
| `nocode-for-pro` | `2765-76016` 【美团项目】01 | 10 | 9.37 MB → 1.00 MB |
| `chatgpt-home-buying` 购房 ChatGPT | `445-50333` 【实习项目】 | 9 | 5.72 MB → 720 KB |
| `laolao-service-design` 捞捞服务设计 | `52-37269` 【服务设计】01 | 15 | 16.03 MB → 1.20 MB |

- 数据清理：移除 `shenzhen-rental-housing`（其 2 帧合并入本科毕设），清除所有旧 `gallery/` 占位图引用
- 新增脚本：`scripts/sync-figma-frames.mjs`（幂等、Figma 分批渲染、故障隔离）
- 新增 npm script：`npm run sync:figma`

## 待办 1：部署静态站点（必做）

站点是 `output: 'export'` 静态导出，图片走仓库内 `public/`，**推送即部署**，无需手动传图：

```bash
git add public/images/portfolio/undergraduate-thesis \
        src/data/portfolio.json \
        scripts/sync-figma-frames.mjs \
        .ai-dev-docs/TODO-cloudflare-sync.md
git commit -m "feat(portfolio): sync 16 undergraduate thesis frames from Figma"
git push origin main
```

推送后 `.github/workflows/deploy.yml` 会自动 `npm run build` 并 `wrangler pages deploy out`。

**验收**：打开 `https://<你的域名>/portfolio/undergraduate-thesis/`，确认 16 页都能显示。

> 注意：仓库会因此增加 1.42 MB 二进制文件。若不希望图片进 Git，改走下面的 R2 方案。

## 待办 2：改走 R2 + CDN（可选）

仅在你想让图片脱离 Git 仓库时才需要。前置：`CLOUDFLARE_ACCOUNT_ID`、`CLOUDFLARE_API_TOKEN`、R2 bucket、CDN 自定义域。

```bash
# 1. 批量上传 16 个 webp 到 R2
for f in public/images/portfolio/undergraduate-thesis/*.webp; do
  npx wrangler r2 object put \
    "<BUCKET>/portfolio/undergraduate-thesis/$(basename "$f")" \
    --file "$f" --remote
done

# 2. 把 portfolio.json 里的 src 从本地路径换成 CDN 域名
node -e '
const fs=require("fs");
const p="src/data/portfolio.json";
const d=JSON.parse(fs.readFileSync(p,"utf8"));
const CDN="https://<CDN_DOMAIN>";
d.projects.find(x=>x.slug==="undergraduate-thesis").frames
  .forEach(f=>{ if(f.src?.startsWith("/images/")) f.src=CDN+f.src.replace("/images","") });
fs.writeFileSync(p, JSON.stringify(d,null,2)+"\n");
'
```

同时确认 R2 自定义域已开 CORS / 公共读，否则前端会 403。

## 待办 3：缓存

`_headers` 已对 `/images/*` 设了 `max-age=31536000, immutable`。**新增文件不受影响**（新路径首次请求即回源），无需刷缓存。

只有在「覆盖同名文件」时才需要清 CDN 缓存：

```bash
npx wrangler pages deployment list   # 确认最新部署
# 覆盖同名图片时，去 Dashboard → Caching → Purge Files 指定 URL
```

建议做法：内容更新时用 `--force` 重跑脚本并让文件名带版本后缀，避免走 purge。

## 复现 / 增量更新命令

```bash
# 增量（跳过已存在的 webp）
node scripts/sync-figma-frames.mjs \
  --url "https://www.figma.com/design/OsMjuOsAZiPIMPK0ztUVR0/Alii---UX-Portfolio?node-id=739-47421" \
  --slug undergraduate-thesis --title-zh "本科毕设" --title-en "Undergraduate Thesis" \
  --category product --period "2024.6" --tab design

# Figma 改稿后强制重新导出
… 同上 --force
```

脚本幂等：按 frame id 覆盖更新，重跑不会产生重复条目（已验证：二次运行仍为 16 frame）。

## 遗留问题（需你决策，与 Cloudflare 无关）

1. **内容与既有项目重叠** —— 既有 `shenzhen-rental-housing`（2024.3，「深圳保租房 0-1 服务设计」）与本次「本科毕设」是同一课题，且它现在仍指向 `gallery/` 下的占位图。是合并成一个项目、还是保留两条，需要你定。
2. **frame 标题是 Figma 原名**（`P 01`…`P 16`）—— 建议手动改成有语义的标题；脚本已做保护，改过的标题在重跑时不会被覆盖。
3. **`summary` 为空** —— 新建项目时留空，需补中英文简介。
4. **作品墙 `/portfolio` 当前渲染为空** —— 与本次改动无关，已回归验证：移除本次项目后 `/portfolio` 依然 0 张图。原因是工作区里未提交的 `src/effects/Masonry.jsx` 改动（`imagesReady` / `useMeasure` 相关），L3 详情页不受影响。
