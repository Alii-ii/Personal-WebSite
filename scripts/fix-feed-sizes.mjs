/**
 * 一次性校正：按图片真实像素重算 portfolio.json 里所有 image frame 的 feed。
 *
 * 背景：早期 feed 由 sync-figma-frames 依据 Figma 画布 absoluteBoundingBox 推算，
 * 与导出图实际像素在存在裁剪 / 约束 / 缩放时会分叉。sync 脚本已改为按真实像素生成，
 * 本脚本用于修正存量数据。
 *
 * 用法：node scripts/fix-feed-sizes.mjs [--dry-run]
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import sharp from 'sharp';

const ROOT = process.cwd();
const PORTFOLIO_JSON = join(ROOT, 'src/data/portfolio.json');
const FEED_W = 532;
const dryRun = process.argv.includes('--dry-run');

const data = JSON.parse(await readFile(PORTFOLIO_JSON, 'utf8'));
let changed = 0;
let missing = 0;
let checked = 0;

for (const project of data.projects || []) {
  for (const frame of project.frames || []) {
    if (frame.type !== 'image' || !frame.src) continue;
    checked += 1;

    const filePath = join(ROOT, 'public', frame.src);
    if (!existsSync(filePath)) {
      console.log(`  MISS   ${project.slug} / ${frame.id}  文件不存在: ${frame.src}`);
      missing += 1;
      continue;
    }

    const { width, height } = await sharp(filePath).metadata();
    if (!width || !height) {
      console.log(`  MISS   ${project.slug} / ${frame.id}  无法读取尺寸`);
      missing += 1;
      continue;
    }

    const next = { w: FEED_W, h: Math.round(FEED_W * (height / width)) };
    const prev = frame.feed;
    if (prev && prev.w === next.w && prev.h === next.h) continue;

    const prevRatio = prev?.w && prev?.h ? (prev.w / prev.h).toFixed(3) : 'n/a';
    console.log(
      `  FIX    ${project.slug} / ${frame.id}\n` +
        `         ${prev ? `${prev.w}x${prev.h}` : 'null'} (ratio ${prevRatio})` +
        ` → ${next.w}x${next.h} (ratio ${(next.w / next.h).toFixed(3)})  [源图 ${width}x${height}]`,
    );
    frame.feed = next;
    changed += 1;
  }
}

console.log(`\n检查 ${checked} 张，需修正 ${changed} 张，无法读取 ${missing} 张`);

if (dryRun) {
  console.log('[dry-run] 未写入。');
} else if (changed) {
  await writeFile(PORTFOLIO_JSON, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`✓ 已写入 ${PORTFOLIO_JSON}`);
} else {
  console.log('无需修改。');
}
