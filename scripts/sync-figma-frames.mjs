#!/usr/bin/env node
/**
 * Figma 页面组批量同步：REST API 导出 → webp 压缩 → 写入 portfolio.json
 *
 * 本脚本把链接节点明确视为“页面集合”，从其直接子节点抓取待发布页面
 * （FRAME / COMPONENT / INSTANCE / GROUP / SECTION）。仅当用户提供的是组 link，
 * 或 dry-run 结果确认这些直接子节点就是独立项目页时使用；单页请用 publish:figma-page。
 *
 * 从指定 Figma 节点下抓取所有子画板（FRAME / COMPONENT / INSTANCE / GROUP），
 * 按 PNG 2x 导出，压缩成 webp 落到 public/images/portfolio/<slug>/，
 * 最后把 frames 数组幂等写回 src/data/portfolio.json。
 *
 * 用法:
 *   npm run sync:figma-group -- --url "<figma 组链接>" --slug <项目 slug> \
 *     [--title-zh "中文名"] [--title-en "English"] [--category product] \
 *     [--period 2024.6] [--tab design] [--scale 2] [--force] [--dry-run]
 *
 * 环境变量（从 .env 自动读取）:
 *   FIGMA_TOKEN  Figma Personal Access Token
 *
 * 幂等性：同 slug 重跑会「按 frame id 覆盖更新」而非重复追加；
 *        已存在的 webp 默认跳过，--force 可强制重新导出压缩。
 */
import { readFile, writeFile, mkdir, stat, access, readdir } from 'node:fs/promises';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const PORTFOLIO_JSON = join(ROOT, 'src/data/portfolio.json');
const IMG_ROOT = 'public/images/portfolio';
const MAX_WIDTH = 2560; // 2x 原图（3840px）下采样，retina 全屏无放大模糊
const QUALITY = 92;   // 文字/线条密集幻灯片用 q80 振铃明显，q92+ 改善显著
const FEED_W = 532; // portfolio.json 既有约定：作品墙卡片统一宽度
const FRAME_TYPES = new Set(['FRAME', 'COMPONENT', 'INSTANCE', 'GROUP', 'SECTION']);

/**
 * 按图片真实像素换算 L2 瀑布流占位尺寸（统一宽度，高度随比例）
 */
const feedFromSize = (w, h) =>
  w && h ? { w: FEED_W, h: Math.round(FEED_W * (h / w)) } : { w: FEED_W, h: Math.round(FEED_W * 9 / 16) };

/**
 * 读取已存在的图片文件，回填 frame.feed。
 * 用于 SKIP 分支：即便本轮不重新导出，也要校正历史遗留的错误尺寸。
 */
async function setFeedFromFile(frame, filePath) {
  try {
    const meta = await sharp(filePath).metadata();
    frame.feed = feedFromSize(meta.width, meta.height);
  } catch {
    frame.feed = feedFromSize(0, 0);
  }
}

/* ---------------------------------- 参数 ---------------------------------- */
const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback;
};
const has = (name) => args.includes(name);

const figmaUrl = getArg('--url');
const slug = getArg('--slug');
const titleZh = getArg('--title-zh');
const titleEn = getArg('--title-en');
const category = getArg('--category', 'product');
const period = getArg('--period');
const tabKey = getArg('--tab', 'design');
const namePrefix = getArg('--name-prefix');
const scale = getArg('--scale', '2');
const force = has('--force');
const dryRun = has('--dry-run');

const usage = () => {
  console.log(`
用法: npm run sync:figma-group -- --url "<Figma 页面组链接>" --slug <项目slug> [选项]

注意:
  本命令会把目标节点的直接子节点当作独立页面。若链接指向单个完整页面，
  即使内部含有 Frame / Component，也应改用 publish:figma-page。

必填:
  --url          Figma 画板链接（含 node-id）
  --slug         portfolio.json 中的项目 slug

可选:
  --title-zh     项目中文名（新建项目时用，默认取 Figma 父节点名）
  --title-en     项目英文名
  --category     分类 product | writing | side （默认 product）
  --period       时间，如 2024.6
  --tab          frame 归属的 tab key（默认 design）
  --name-prefix  非 ASCII 画板名（如「知住 01」）的文件名前缀，如 zhizhu
  --scale        Figma 导出倍率（默认 2）
  --force        强制重新导出并覆盖已有 webp
  --dry-run      只打印计划，不写文件
`);
};

if (!figmaUrl || !slug) {
  usage();
  process.exit(1);
}

/* -------------------------------- 工具函数 -------------------------------- */
const fmtBytes = (b) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(2)} MB` : `${(b / 1024).toFixed(1)} KB`);
const exists = (p) => access(p).then(() => true).catch(() => false);

/** 从 .env 读取 FIGMA_TOKEN（不引第三方依赖） */
async function loadToken() {
  if (process.env.FIGMA_TOKEN) return process.env.FIGMA_TOKEN;
  try {
    const env = await readFile(join(ROOT, '.env'), 'utf8');
    for (const line of env.split('\n')) {
      const m = line.match(/^\s*FIGMA_TOKEN\s*=\s*(.+?)\s*$/);
      if (m) return m[1].replace(/^["']|["']$/g, '');
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** 解析 figma 链接里的 fileKey 与 nodeId */
function parseFigmaUrl(url) {
  const fileKey = url.match(/\/(?:file|design)\/([a-zA-Z0-9]+)/)?.[1];
  const rawNode = url.match(/node-id=([^&]+)/)?.[1];
  if (!fileKey) throw new Error(`无法从链接解析 fileKey: ${url}`);
  if (!rawNode) throw new Error(`链接缺少 node-id: ${url}`);
  // node-id 在 URL 里是 739-47421，API 需要 739:47421
  const nodeId = decodeURIComponent(rawNode).replace(/-/g, ':');
  return { fileKey, nodeId };
}

/**
 * 文件名安全化：P 01 → p-01
 *
 * 注意：文件名一律转成纯 ASCII。中文名（如「知住 01」）若直接进文件名，
 * URL 里会变成 percent-encoding，CDN / 部分静态服务器上容易踩坑，
 * 因此走 --name-prefix 指定的英文前缀，中文只保留在 frame.title 里展示。
 */
const slugifyName = (name, index) => {
  const ascii = name
    .trim()
    .toLowerCase()
    .replace(/[^\w]+/g, '-')
    .replace(/^-+|-+$/g, '');
  // 去掉非 ASCII 后可能只剩序号（「知住 01」→「01」）甚至空串，此时回退到前缀 + 序号
  if (!ascii || /^\d+$/.test(ascii)) {
    const suffix = ascii || String(index + 1).padStart(2, '0');
    return namePrefix ? `${namePrefix}-${suffix}` : `frame-${suffix}`;
  }
  return ascii;
};

/**
 * 带超时与重试的 fetch
 * Figma 渲染大画板很慢（实测 2 张 1920x1080 @2x 约 28s），
 * Node 默认 fetch 超时会直接 abort，这里显式放宽到 5 分钟。
 */
async function fetchWithRetry(url, { headers, timeout = 300_000, retries = 2 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetch(url, { headers, signal: AbortSignal.timeout(timeout) });
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        const wait = 3000 * (attempt + 1);
        console.log(`  ⟳ 请求失败（${err.message}），${wait / 1000}s 后重试 ${attempt + 1}/${retries}`);
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }
  throw lastErr;
}

async function figmaGet(url, token) {
  const res = await fetchWithRetry(url, { headers: { 'X-Figma-Token': token } });
  if (!res.ok) throw new Error(`Figma API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  if (json.err) throw new Error(`Figma API 返回错误: ${json.err}`);
  return json;
}

/* ---------------------------------- 主流程 --------------------------------- */
async function main() {
  const token = await loadToken();
  if (!token) {
    console.error('✗ 缺少 FIGMA_TOKEN（请在 .env 中配置或用环境变量传入）');
    process.exit(1);
  }

  const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);
  console.log(`→ file=${fileKey}  node=${nodeId}  scale=${scale}x`);

  // 1. 取节点树，找出所有子画板
  const nodeData = await figmaGet(
    `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}&depth=2`,
    token,
  );
  const rootNode = nodeData.nodes?.[nodeId]?.document;
  if (!rootNode) throw new Error(`未找到节点 ${nodeId}，请确认链接与访问权限`);

  const children = (rootNode.children || []).filter((c) => FRAME_TYPES.has(c.type));
  if (!children.length) throw new Error(`节点「${rootNode.name}」下没有可导出的画板`);

  // Figma 画板顺序按名称自然排序，保证 P 01..P 16 稳定
  children.sort((a, b) => a.name.localeCompare(b.name, 'zh', { numeric: true }));

  console.log(`✓ 父节点「${rootNode.name}」下发现 ${children.length} 个画板：`);
  children.forEach((c, i) => {
    const bb = c.absoluteBoundingBox;
    console.log(`   ${String(i + 1).padStart(2)}. ${c.name}  (${c.type}${bb ? ` ${Math.round(bb.width)}x${Math.round(bb.height)}` : ''})`);
  });

  if (dryRun) {
    console.log('\n[dry-run] 未执行导出与写入。请确认上方子节点确实分别代表独立项目页；若它们只是单页内部图层，请改用 publish:figma-page。');
    return;
  }

  // 2. 分批取导出 URL
  // Figma 渲染是同步阻塞的，一次塞 16 个大画板会超时，按 BATCH 拆分更稳。
  const BATCH = 4;
  const images = {};
  const batches = [];
  for (let i = 0; i < children.length; i += BATCH) batches.push(children.slice(i, i + BATCH));

  console.log(`\n→ 请求 Figma 渲染 PNG @${scale}x（分 ${batches.length} 批，每批 ${BATCH} 张，较慢请稍候）...`);
  for (const [bi, batch] of batches.entries()) {
    const ids = batch.map((c) => c.id).join(',');
    const t0 = Date.now();
    const imgData = await figmaGet(
      `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(ids)}&format=png&scale=${scale}`,
      token,
    );
    Object.assign(images, imgData.images || {});
    console.log(
      `  批次 ${bi + 1}/${batches.length} 完成（${batch.map((c) => c.name).join(', ')}）耗时 ${((Date.now() - t0) / 1000).toFixed(0)}s`,
    );
  }
  const imgData = { images };

  const outDir = join(ROOT, IMG_ROOT, slug);
  await mkdir(outDir, { recursive: true });

  // 3. 下载 + 压缩 webp
  const frames = [];
  let totalBefore = 0;
  let totalAfter = 0;
  let done = 0;
  let skipped = 0;
  const failed = [];

  for (const [i, child] of children.entries()) {
    const seq = String(i + 1).padStart(2, '0');
    const baseName = `${seq}-${slugifyName(child.name, i)}`;
    const webpName = `${baseName}.webp`;
    const webpPath = join(outDir, webpName);
    const publicPath = `/images/portfolio/${slug}/${webpName}`;

    // feed 供 L2 瀑布流占位。必须来自最终 webp 的真实像素，
    // 而不是 Figma 画布的 absoluteBoundingBox —— 画板尺寸与导出图在存在
    // 裁剪 / 约束 / 缩放时会分叉，导致卡片高度与图片对不上。
    const frame = {
      id: `${slug}-${baseName}`,
      tab: tabKey,
      type: 'image',
      title: { zh: child.name, en: child.name },
      feed: null, // 占位，落盘后由 setFeedFromFile 回填
      src: publicPath,
      alt: `${titleZh || rootNode.name} - ${child.name}`,
      figmaNodeId: child.id,
    };

    if (!force && (await exists(webpPath))) {
      // 跳过重新导出，但仍按现有文件校正 feed，避免沿用历史错误值
      await setFeedFromFile(frame, webpPath);
      frames.push(frame);
      skipped += 1;
      console.log(`  SKIP   ${child.name} → ${webpName} (已存在，--force 覆盖)`);
      continue;
    }

    const url = imgData.images?.[child.id];
    if (!url) {
      failed.push({ name: child.name, reason: 'Figma 未返回导出地址' });
      console.log(`  ERROR  ${child.name}  Figma 未返回导出地址`);
      continue;
    }

    // 单张失败不应该拖垮整轮同步，这里单独捕获并记录
    let buf;
    try {
      const res = await fetchWithRetry(url, { timeout: 300_000, retries: 3 });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      buf = Buffer.from(await res.arrayBuffer());
    } catch (err) {
      failed.push({ name: child.name, reason: err.message });
      console.log(`  ERROR  ${child.name}  下载失败: ${err.message}`);
      continue;
    }

    // toFile 返回实际写出的宽高，直接用它推导 feed，无需二次读文件
    const outInfo = await sharp(buf)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(webpPath);
    frame.feed = feedFromSize(outInfo.width, outInfo.height);

    const after = (await stat(webpPath)).size;
    // 只有真正落盘成功的图才写进数据，避免 portfolio.json 里出现指向不存在文件的 src
    frames.push(frame);
    totalBefore += buf.length;
    totalAfter += after;
    done += 1;
    console.log(
      `  OK     ${child.name} → ${webpName}  ${fmtBytes(buf.length)} → ${fmtBytes(after)}  (-${((1 - after / buf.length) * 100).toFixed(0)}%)`,
    );
  }

  if (done) {
    console.log(
      `\n合计 ${done} 张：${fmtBytes(totalBefore)} → ${fmtBytes(totalAfter)}，平均减幅 ${((1 - totalAfter / totalBefore) * 100).toFixed(0)}%`,
    );
  }
  if (skipped) console.log(`跳过 ${skipped} 张已存在的 webp`);
  if (failed.length) {
    console.log(`\n⚠ ${failed.length} 张失败（未写入图片，重跑即可补齐）：`);
    failed.forEach((f) => console.log(`   - ${f.name}: ${f.reason}`));
  }

  // 4. 幂等写入 portfolio.json
  const data = JSON.parse(await readFile(PORTFOLIO_JSON, 'utf8'));
  let project = data.projects.find((p) => p.slug === slug);

  if (!project) {
    project = {
      slug,
      category,
      title: { zh: titleZh || rootNode.name, en: titleEn || titleZh || rootNode.name },
      period: period || '',
      summary: { zh: '', en: '' },
      tabs: [{ key: tabKey, label: { zh: '页面原稿', en: 'Design' } }],
      frames: [],
    };
    data.projects.push(project);
    console.log(`\n✓ 新建项目 ${slug}（category=${category}）`);
  } else {
    console.log(`\n✓ 更新已有项目 ${slug}`);
    if (!project.tabs?.some((t) => t.key === tabKey)) {
      project.tabs = [...(project.tabs || []), { key: tabKey, label: { zh: '页面原稿', en: 'Design' } }];
    }
    if (titleZh) project.title.zh = titleZh;
    if (titleEn) project.title.en = titleEn;
    if (period) project.period = period;
  }

  // 按 id 覆盖：保留人工编辑过的 title/summary，替换图片类 frame
  const byId = new Map(project.frames.map((f) => [f.id, f]));
  for (const f of frames) {
    const old = byId.get(f.id);
    // 保留人工改写过的标题（若与 Figma 原名不同则视为已定制）
    if (old?.title && old.title.zh !== f.title.zh && old.figmaNodeId === f.figmaNodeId) {
      f.title = old.title;
    }
    byId.set(f.id, { ...old, ...f });
  }
  // 本次同步的 frame 保持 Figma 顺序在前，其他类型 frame（rich/prototype）保留在后
  const syncedIds = new Set(frames.map((f) => f.id));
  project.frames = [
    ...frames.map((f) => byId.get(f.id)),
    ...project.frames.filter((f) => !syncedIds.has(f.id)),
  ];

  await writeFile(PORTFOLIO_JSON, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`✓ 写入 ${PORTFOLIO_JSON}：${slug} 共 ${project.frames.length} 个 frame`);

  // 5. Cloudflare 同步待办
  const files = (await readdir(outDir)).filter((f) => f.endsWith('.webp'));
  console.log(`
────────────────────────────────────────────────────────
⚠ 待办：同步 Cloudflare（本脚本不负责，交由其他工具执行）
  1) 静态站点：git push 后 GitHub Actions 会自动构建部署到 Pages
  2) 如需走 CDN，把 ${files.length} 个 webp 上传 R2：
     npx wrangler r2 object put <BUCKET>/portfolio/${slug}/<file> \\
       --file ${IMG_ROOT}/${slug}/<file> --remote
     再把 portfolio.json 里的 src 换成 https://<CDN_DOMAIN>/portfolio/${slug}/<file>
  3) 部署后清理缓存：npx wrangler pages deployment list
详见 .ai-dev-docs/TODO-cloudflare-sync.md
────────────────────────────────────────────────────────`);
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
