# 作品集页面发布 SOP：Figma Link → WebP → Cloudflare R2 → 网站索引

> 适用范围：个人网站 `portfolio.json` 中的封面、任意单页和成组项目页面。  
> 核心原则：不要只根据 Figma 节点类型或“是否含有子 Frame”自动判断。先理解用户给的链接在内容语义上代表“一张完整页面”还是“一组独立页面”，再选择发布模式。

## 一、先探测，再判断发布模式

用户会提供两类 Figma Link：

| 模式 | 用户语义 | 执行行为 | 命令 |
| --- | --- | --- | --- |
| 单页 | 链接节点本身就是要展示的一页；可能是封面，也可能是中间任意页 | 导出链接节点本身，不拆内部图层 | `npm run publish:figma-page` |
| 页面组 | 用户已经把一个项目的多张独立页面整理到同一个 Group / Section / Frame 下，并提供集合链接 | 把目标节点的直接子页面依次导出 | `npm run sync:figma-group` |

判断依据需要组合使用：用户描述、Figma 节点名称、目标节点尺寸、直接子节点名称和尺寸、现有项目结构。节点类型只能作辅助：一个 1920×1080 的 COMPONENT 即使内部含多个 FRAME，仍可能是一张完整页面；一个名为“项目整理”的 FRAME 则可能是多页集合。

所有链接先跑对应命令的 `--dry-run`。单页命令会显示目标节点和直接子节点，但明确不会拆分；组命令会列出计划作为独立页面导出的直接子节点。若语义仍不清楚，先询问用户，不做破坏性猜测。

## 二、认证与基础设施

Figma PAT 保存在仓库根目录 `.env`，禁止提交：

```bash
FIGMA_TOKEN=figd_xxx
```

Cloudflare 使用 Wrangler OAuth 登录态：

```bash
npx wrangler@4.86.0 login
npx wrangler@4.86.0 whoami
```

当前基础设施：R2 bucket 为 `illustration`；对象前缀为 `portfolio/<slug>/`；临时公网域名为 `https://pub-1a0773e1cc80472bbfb854bcaa76d941.r2.dev`。可用 `R2_BUCKET` 和 `CDN_BASE` 覆盖。自定义域 `cdn.alii.work` 恢复后只切 `CDN_BASE`，对象 key 不变。

## 三、模式 A：发布一个 Figma 单页

先探测：

```bash
npm run publish:figma-page -- \
  --url "<含 node-id 的 Figma Link>" \
  --slug <portfolio.json 项目 slug> \
  --tab <tab-key> \
  --filename <ascii-file-name> \
  --dry-run
```

确认“目标节点本身”就是要展示的页面后正式发布：

```bash
npm run publish:figma-page -- \
  --url "<Figma Link>" \
  --slug <project-slug> \
  --tab <tab-key> \
  --title-zh "页面标题" \
  --title-en "Page Title" \
  --filename page-01 \
  --position last
```

`--position first|last` 控制新 frame 插入位置：封面通常用 `first`，后续单页通常用 `last`；更新同一个 filename/frame id 时保持原位置。标题未传时默认使用 Figma 节点名，filename 未传时从节点名生成 ASCII 名称。`--skip-upload` 可仅写本地 WebP 和本地索引。

命令会完成：PAT 导出目标节点 PNG；Sharp 转限宽 2560px、quality 92 的 WebP；写入 `public/images/portfolio/<slug>/<filename>.webp`；上传 R2；写入 `portfolio.json` 的 `src`、`srcLocal`、`feed`、`figmaNodeId` 和 tab；发布首个 frame 后移除项目旧的人工 `disabled` 标记。

### 单页示例：Design Mode 封面

```bash
npm run publish:figma-page -- \
  --url "https://www.figma.com/design/OsMjuOsAZiPIMPK0ztUVR0/Alii---UX-Portfolio?node-id=2880-61731" \
  --slug nocode-design-mode \
  --tab overview \
  --title-zh "项目封面" \
  --title-en "Project Cover" \
  --filename cover \
  --position first
```

## 四、模式 B：同步已整理好的页面组

先探测直接子节点：

```bash
npm run sync:figma-group -- \
  --url "<指向页面集合的 Figma Link>" \
  --slug <project-slug> \
  --tab design \
  --dry-run
```

只有当输出的每个直接子节点都确实代表一张独立项目页时，才正式同步：

```bash
npm run sync:figma-group -- \
  --url "<Figma 页面组 Link>" \
  --slug <project-slug> \
  --tab design \
  --title-zh "项目中文名" \
  --title-en "Project Name"
```

该命令批量生成本地 WebP 并幂等更新 `portfolio.json`，但不直接上传 R2。随后运行：

```bash
npm run sync:portfolio-r2 -- --write-json
```

R2 同步脚本自动发现 `public/images/portfolio/` 下所有项目目录，无需维护 slug 白名单，并上传原图和 `thumbs/`。

## 五、项目可点击与 L3 路由规则

`projects[].frames` 是项目是否存在 L3 页面的内容依据：

```text
frames.length > 0 且 disabled !== true → 可点击、生成 L3 静态路由、参与上下项目切换
frames.length === 0 或 disabled === true → 仅显示整理中占位，不可进入 L3
```

新项目可以先建空壳。封面或任意单页成功发布前不生成 L3；首个 frame 发布后自然变成可访问项目。`disabled: true` 只用于已有内容的人工临时下线。

## 六、验收与故障处理

每次发布后至少完成：

```bash
# 验证 R2 对象可读
npx wrangler@4.86.0 r2 object get illustration/portfolio/<slug>/<file>.webp --remote --pipe >/dev/null

# 生成 thumbs、字体子集并静态构建
npm run build
```

验收覆盖：L2 卡片使用第一张 image frame 作为封面；有 frame 的项目可进入 L3；空项目在卡片、桌面侧栏、移动菜单和 L3 项目菜单中不可点击；空项目不生成静态路由，也不参与上下项目切换；CDN 失败时 `srcLocal` 能回退；单页和页面组都保持 Figma 顺序或明确指定的插入位置。

常见故障：Figma 401/403 时检查 PAT 权限；节点不存在时检查 file key 与 node-id；R2 失败先跑 `wrangler whoami`；自定义域异常时继续用 `pub-*.r2.dev`；如果页面组 dry-run 列出的是 title、paragraphs、tag 等内部图层，说明链接指向单页，应切回 `publish:figma-page`；如果单页 dry-run 的直接子节点全部是同尺寸、连续命名的独立画板，且用户明确说已整理成组，则改用 `sync:figma-group`。
