#!/usr/bin/env node
/**
 * 把 public/images/gallery 下的原图批量压缩为 webp
 * 输出到 public/images/gallery/webp/，文件名 = 原始 basename + .webp
 *
 * 用法:
 *   node scripts/compress-images.mjs          # 只压缩新增（跳过已存在）
 *   node scripts/compress-images.mjs --force   # 强制重新压缩全部
 *
 * 调参: 修改下方 MAX_WIDTH / QUALITY
 */
import { readdir, stat, mkdir, access } from 'node:fs/promises';
import { join, extname, parse } from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, 'public/images/gallery');
const OUT_DIR = join(SRC_DIR, 'webp');
const INPUT_EXTS = ['.png', '.jpg', '.jpeg'];
const MAX_WIDTH = 1600;   // 长边上限，卡片/移动端足够，避免原图过大
const QUALITY = 80;       // webp 质量

const force = process.argv.includes('--force');
const fmtBytes = (b) => (b > 1024 ? `${(b / 1024).toFixed(1)} KB` : `${b} B`);
const exists = async (p) => access(p).then(() => true).catch(() => false);

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const entries = await readdir(SRC_DIR, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && INPUT_EXTS.includes(extname(e.name).toLowerCase()))
    .map((e) => e.name);

  if (!files.length) {
    console.log(`未在 ${SRC_DIR} 找到可压缩图片（${INPUT_EXTS.join('/')}）`);
    return;
  }

  let totalBefore = 0;
  let totalAfter = 0;
  let count = 0;
  let skipped = 0;
  const results = [];

  for (const name of files) {
    const inPath = join(SRC_DIR, name);
    const outName = `${parse(name).name}.webp`;
    const outPath = join(OUT_DIR, outName);

    if (!force && (await exists(outPath))) {
      skipped += 1;
      results.push({ name, outName, status: 'skip' });
      continue;
    }

    const before = (await stat(inPath)).size;
    try {
      await sharp(inPath)
        .rotate() // 修正 EXIF 方向
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(outPath);
      const after = (await stat(outPath)).size;
      totalBefore += before;
      totalAfter += after;
      count += 1;
      results.push({ name, outName, before, after, ratio: 1 - after / before });
    } catch (err) {
      results.push({ name, outName, status: 'error', reason: err.message });
    }
  }

  console.log('\n=== webp 压缩报告 ===');
  for (const r of results) {
    if (r.status === 'skip') {
      console.log(`  SKIP   ${r.name} → ${r.outName}  (已存在，--force 可覆盖)`);
    } else if (r.status === 'error') {
      console.log(`  ERROR  ${r.name}  ${r.reason}`);
    } else {
      console.log(
        `  OK     ${r.name} → ${r.outName}  ${fmtBytes(r.before)} → ${fmtBytes(r.after)}  (-${(r.ratio * 100).toFixed(0)}%)`,
      );
    }
  }

  if (count) {
    const avg = ((1 - totalAfter / totalBefore) * 100).toFixed(0);
    console.log(
      `\n合计 ${count} 张：${fmtBytes(totalBefore)} → ${fmtBytes(totalAfter)}，平均减幅 ${avg}%`,
    );
  }
  if (skipped) console.log(`跳过 ${skipped} 张已存在的 webp`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
