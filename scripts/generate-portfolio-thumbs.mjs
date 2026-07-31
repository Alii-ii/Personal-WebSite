#!/usr/bin/env node
/**
 * 为 public/images/portfolio 下的原图生成作品墙用的缩略图
 * 输出到同目录的 thumbs/ 子目录，文件名与原图一致
 *
 * 背景：
 *   作品墙（L2 /portfolio）里每张图只显示约 532px 宽，
 *   但原图是 2560x1440。浏览器仍需把原图解码成 14.1MB 位图驻留内存，
 *   52 张合计约 721MB —— 这部分开销「懒加载」是省不掉的，
 *   只要图片进入视口就必须解码。因此必须提供按显示尺寸裁切的缩略图。
 *
 *   L3 项目详情页仍使用原图，不受影响。
 *
 * 用法:
 *   node scripts/generate-portfolio-thumbs.mjs           # 跳过已存在
 *   node scripts/generate-portfolio-thumbs.mjs --force    # 全部重生成
 */
import { readdir, mkdir, access, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

// sharp 在 devDependencies 里。CI（如 Cloudflare Pages 的
// `npm ci --only=production`）不会安装它，因此这里动态引入：
// 拿不到就跳过生成，直接复用仓库里已提交的 thumbs/ 产物。
// 静态 import 会在模块加载阶段就抛错，没有降级的机会。
let sharp = null;
try {
  ({ default: sharp } = await import('sharp'));
} catch {
  sharp = null;
}

const ROOT = process.cwd();
const SRC_ROOT = join(ROOT, 'public/images/portfolio');
const THUMB_DIR_NAME = 'thumbs';

// 作品墙卡片显示宽度约 532px，按 2x 屏预留 => 1064px
// 再放宽一点到 1200，兼顾偏大的视口，同时仍远小于 2560
const MAX_WIDTH = 1200;
const QUALITY = 78;

const force = process.argv.includes('--force');
const exists = (p) => access(p).then(() => true).catch(() => false);
const fmt = (b) => (b > 1024 * 1024 ? `${(b / 1048576).toFixed(2)} MB` : `${(b / 1024).toFixed(0)} KB`);

async function processDir(dir) {
  const outDir = join(dir, THUMB_DIR_NAME);
  const entries = await readdir(dir, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && ['.webp', '.png', '.jpg', '.jpeg'].includes(extname(e.name).toLowerCase()))
    .map((e) => e.name);

  if (!files.length) return { before: 0, after: 0, count: 0 };

  await mkdir(outDir, { recursive: true });

  let before = 0;
  let after = 0;
  let count = 0;

  for (const name of files) {
    const src = join(dir, name);
    const out = join(outDir, name);

    if (!force && (await exists(out))) {
      const s = await stat(out);
      after += s.size;
      before += (await stat(src)).size;
      count++;
      continue;
    }

    const srcStat = await stat(src);
    const meta = await sharp(src).metadata();

    // 原图本来就不宽就不放大，只做质量压缩
    const targetWidth = Math.min(MAX_WIDTH, meta.width || MAX_WIDTH);

    await sharp(src)
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(out);

    const outStat = await stat(out);
    before += srcStat.size;
    after += outStat.size;
    count++;

    console.log(
      `  ${name}  ${meta.width}x${meta.height} ${fmt(srcStat.size)}  ->  ${targetWidth}px ${fmt(outStat.size)}`
    );
  }

  return { before, after, count };
}

async function main() {
  if (!sharp) {
    console.log('[thumbs] 未安装 sharp，跳过缩略图生成，使用仓库中已有的 thumbs/ 产物');
    return;
  }

  if (!(await exists(SRC_ROOT))) {
    console.log(`[thumbs] 未找到 ${SRC_ROOT}，跳过`);
    return;
  }

  const entries = await readdir(SRC_ROOT, { withFileTypes: true });
  // covers/ 仅服务固定简历卡片，不参与作品墙，不需要生成 thumbs。
  const dirs = entries.filter(
    (e) => e.isDirectory() && e.name !== THUMB_DIR_NAME && e.name !== 'covers',
  );

  let totalBefore = 0;
  let totalAfter = 0;
  let totalCount = 0;

  for (const d of dirs) {
    console.log(`\n[${d.name}]`);
    const r = await processDir(join(SRC_ROOT, d.name));
    totalBefore += r.before;
    totalAfter += r.after;
    totalCount += r.count;
  }

  console.log(
    `\n完成：${totalCount} 张  ${fmt(totalBefore)} -> ${fmt(totalAfter)}  ` +
      `(${totalBefore ? ((1 - totalAfter / totalBefore) * 100).toFixed(0) : 0}% 减少)`
  );
}

// 缩略图属于非关键优化，且仓库里已提交了一份产物兜底。
// 生成失败不应该让整个构建挂掉，告警即可。
main().catch((err) => {
  console.warn('[thumbs] 生成失败，改用仓库中已有的 thumbs/ 产物：', err?.message || err);
});
