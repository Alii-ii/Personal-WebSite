#!/usr/bin/env node
/**
 * 单个 Figma 页面发布：Figma PAT 导出链接节点本身 → WebP → Cloudflare R2 → portfolio.json
 *
 * 单页可以是项目封面，也可以是任意项目页；本脚本永远导出链接指向的节点本身，
 * 不会因为节点内部含有 FRAME / COMPONENT 就自动拆分。
 *
 * 用法：
 *   npm run publish:figma-page -- \
 *     --url "https://www.figma.com/design/<fileKey>/<name>?node-id=1-2" \
 *     --slug nocode-design-mode \
 *     --tab overview --title-zh "项目封面" --title-en "Project Cover" \
 *     --filename cover [--position first|last] [--scale 2] [--dry-run] [--skip-upload]
 *
 * 认证：
 *   - Figma：FIGMA_TOKEN（环境变量或仓库根目录 .env）
 *   - Cloudflare：Wrangler OAuth 登录，或 Wrangler 支持的 CLOUDFLARE_* 环境变量
 *
 * 默认基础设施：
 *   - R2_BUCKET=illustration
 *   - CDN_BASE=https://pub-1a0773e1cc80472bbfb854bcaa76d941.r2.dev
 */
import { access, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';

const execFileAsync = promisify(execFile);
const ROOT = process.cwd();
const PORTFOLIO_JSON = join(ROOT, 'src/data/portfolio.json');
const MAX_WIDTH = 2560;
const QUALITY = 92;
const FEED_W = 532;

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const index = args.indexOf(name);
  return index !== -1 && args[index + 1] && !args[index + 1].startsWith('--')
    ? args[index + 1]
    : fallback;
};
const has = (name) => args.includes(name);

const figmaUrl = getArg('--url');
const slug = getArg('--slug');
const tabKey = getArg('--tab', 'overview');
const titleZhArg = getArg('--title-zh');
const titleEnArg = getArg('--title-en');
const filenameArg = getArg('--filename');
const position = getArg('--position', 'last');
const scale = getArg('--scale', '2');
const dryRun = has('--dry-run');
const skipUpload = has('--skip-upload');
const bucket = process.env.R2_BUCKET || 'illustration';
const cdnBase = (process.env.CDN_BASE || 'https://pub-1a0773e1cc80472bbfb854bcaa76d941.r2.dev').replace(/\/$/, '');

if (!figmaUrl || !slug) {
  console.error('用法: npm run publish:figma-page -- --url "<Figma 页面链接>" --slug <project-slug> [--filename page-01]');
  process.exit(1);
}
if (!['first', 'last'].includes(position)) {
  console.error('--position 仅支持 first 或 last');
  process.exit(1);
}

const exists = (path) => access(path).then(() => true).catch(() => false);
const fmtBytes = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const slugifyName = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'page';
const feedFromSize = (width, height) => ({
  w: FEED_W,
  h: Math.round(FEED_W * (height / width)),
});

async function loadFigmaToken() {
  if (process.env.FIGMA_TOKEN) return process.env.FIGMA_TOKEN;
  try {
    const env = await readFile(join(ROOT, '.env'), 'utf8');
    const match = env.match(/^\s*FIGMA_TOKEN\s*=\s*(.+?)\s*$/m);
    return match?.[1]?.replace(/^["']|["']$/g, '') || null;
  } catch {
    return null;
  }
}

function parseFigmaUrl(url) {
  const fileKey = url.match(/\/(?:file|design)\/([a-zA-Z0-9]+)/)?.[1];
  const rawNodeId = url.match(/[?&]node-id=([^&]+)/)?.[1];
  if (!fileKey) throw new Error('无法从 Figma 链接解析 fileKey');
  if (!rawNodeId) throw new Error('Figma 链接缺少 node-id');
  return {
    fileKey,
    nodeId: decodeURIComponent(rawNodeId).replace(/-/g, ':'),
  };
}

async function figmaGet(url, token) {
  const response = await fetch(url, {
    headers: { 'X-Figma-Token': token },
    signal: AbortSignal.timeout(300_000),
  });
  if (!response.ok) throw new Error(`Figma API ${response.status}: ${(await response.text()).slice(0, 200)}`);
  const json = await response.json();
  if (json.err) throw new Error(`Figma API: ${json.err}`);
  return json;
}

async function uploadToR2(localPath, key) {
  await execFileAsync(
    'npx',
    [
      '--yes',
      'wrangler@4.86.0',
      'r2',
      'object',
      'put',
      `${bucket}/${key}`,
      '--file',
      localPath,
      '--remote',
      '--content-type',
      'image/webp',
    ],
    { stdio: 'pipe', maxBuffer: 10 * 1024 * 1024 },
  );
}

async function main() {
  const token = await loadFigmaToken();
  if (!token) throw new Error('缺少 FIGMA_TOKEN（请配置到 .env 或环境变量）');

  const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);
  const nodeData = await figmaGet(
    `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}&depth=1`,
    token,
  );
  const node = nodeData.nodes?.[nodeId]?.document;
  if (!node) throw new Error(`未找到 Figma 节点 ${nodeId}`);

  const bounds = node.absoluteBoundingBox;
  const filename = (filenameArg || slugifyName(node.name)).replace(/[^a-zA-Z0-9_-]/g, '-');
  const titleZh = titleZhArg || node.name;
  const titleEn = titleEnArg || titleZh;
  const children = (node.children || []).map((child) => ({
    name: child.name,
    type: child.type,
    width: Math.round(child.absoluteBoundingBox?.width || 0),
    height: Math.round(child.absoluteBoundingBox?.height || 0),
  }));
  console.log(`→ Figma 目标节点「${node.name}」 ${node.type}${bounds ? ` ${Math.round(bounds.width)}×${Math.round(bounds.height)}` : ''}`);
  if (children.length) {
    console.log(`→ 直接子节点 ${children.length} 个（仅供判断，本命令不会拆分）：`);
    children.slice(0, 20).forEach((child) => console.log(`   - ${child.name} (${child.type}${child.width ? ` ${child.width}×${child.height}` : ''})`));
    if (children.length > 20) console.log(`   ...其余 ${children.length - 20} 个`);
  }
  console.log(`→ 模式: 单页（导出目标节点本身），写入位置=${position}`);
  console.log(`→ R2: ${bucket}/portfolio/${slug}/${filename}.webp`);
  console.log(`→ CDN: ${cdnBase}/portfolio/${slug}/${filename}.webp`);
  if (dryRun) {
    console.log('[dry-run] 请结合用户意图判断：若链接代表页面集合，请改用 npm run sync:figma-group；否则去掉 --dry-run 发布该单页。');
    return;
  }

  const imageData = await figmaGet(
    `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(nodeId)}&format=png&scale=${scale}`,
    token,
  );
  const imageUrl = imageData.images?.[nodeId];
  if (!imageUrl) throw new Error('Figma 未返回节点导出地址');

  const imageResponse = await fetch(imageUrl, { signal: AbortSignal.timeout(300_000) });
  if (!imageResponse.ok) throw new Error(`下载 Figma 图片失败: HTTP ${imageResponse.status}`);
  const png = Buffer.from(await imageResponse.arrayBuffer());

  const outputDir = join(ROOT, 'public/images/portfolio', slug);
  const outputPath = join(outputDir, `${filename}.webp`);
  await mkdir(outputDir, { recursive: true });
  const output = await sharp(png)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(outputPath);
  const outputBytes = (await stat(outputPath)).size;
  console.log(`✓ WebP: ${fmtBytes(png.length)} → ${fmtBytes(outputBytes)} (${output.width}×${output.height})`);

  const key = `portfolio/${slug}/${filename}.webp`;
  if (!skipUpload) {
    await uploadToR2(outputPath, key);
    console.log(`✓ R2 上传完成: ${key}`);
  } else {
    console.log('i 已跳过 R2 上传（--skip-upload）');
  }

  const data = JSON.parse(await readFile(PORTFOLIO_JSON, 'utf8'));
  const project = data.projects.find((item) => item.slug === slug);
  if (!project) throw new Error(`portfolio.json 中不存在项目 slug=${slug}`);

  const localSrc = `/images/portfolio/${slug}/${filename}.webp`;
  const remoteSrc = `${cdnBase}/${key}`;
  const frameId = `${slug}-${filename}`;
  const frame = {
    id: frameId,
    tab: tabKey,
    type: 'image',
    title: { zh: titleZh, en: titleEn },
    feed: feedFromSize(output.width, output.height),
    src: skipUpload ? localSrc : remoteSrc,
    alt: `${project.title?.zh || slug} - ${titleZh}`,
    figmaNodeId: nodeId,
  };
  if (!skipUpload) frame.srcLocal = localSrc;

  const existingIndex = (project.frames || []).findIndex((item) => item.id === frameId);
  if (existingIndex >= 0) {
    project.frames[existingIndex] = { ...project.frames[existingIndex], ...frame };
  } else if (position === 'first') {
    project.frames = [frame, ...(project.frames || [])];
  } else {
    project.frames = [...(project.frames || []), frame];
  }

  if (!project.tabs?.some((tab) => tab.key === tabKey)) {
    project.tabs = [
      ...(project.tabs || []),
      { key: tabKey, label: { zh: '项目概览', en: 'Overview' } },
    ];
  }
  // 项目是否可进入 L3 最终由 frames 自动判定；同步清理旧的人工禁用标记。
  delete project.disabled;

  await writeFile(PORTFOLIO_JSON, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`✓ portfolio.json: ${slug} 已写入 frame=${frameId}`);

  if (!(await exists(outputPath))) throw new Error('本地 WebP 写入后不存在');
  console.log(`\n完成：${remoteSrc}`);
}

main().catch((error) => {
  console.error(`\n✗ ${error.message}`);
  process.exit(1);
});
