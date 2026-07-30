#!/usr/bin/env node
/**
 * 把 public/images/portfolio 下的原图 + thumbs 上传到 R2，
 * 并可选把 portfolio.json 的 image src 切成 CDN（保留 srcLocal 作兜底）。
 *
 * 用法:
 *   node scripts/sync-portfolio-r2.mjs              # 只上传
 *   node scripts/sync-portfolio-r2.mjs --write-json  # 上传并改 portfolio.json
 *   node scripts/sync-portfolio-r2.mjs --json-only   # 只改 JSON，不上传
 *
 * 环境变量（可选覆盖）:
 *   R2_BUCKET   默认 illustration
 *   CDN_BASE    默认 https://pub-1a0773e1cc80472bbfb854bcaa76d941.r2.dev
 *               （cdn.alii.work 自定义域修好后改成 https://cdn.alii.work 再跑 --json-only）
 */
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const ROOT = process.cwd();
const IMG_ROOT = join(ROOT, 'public/images/portfolio');
const PORTFOLIO_JSON = join(ROOT, 'src/data/portfolio.json');

const args = process.argv.slice(2);
const writeJson = args.includes('--write-json') || args.includes('--json-only');
const jsonOnly = args.includes('--json-only');

const BUCKET = process.env.R2_BUCKET || 'illustration';
const CDN_BASE = (process.env.CDN_BASE || 'https://pub-1a0773e1cc80472bbfb854bcaa76d941.r2.dev').replace(
  /\/$/,
  '',
);

const SLUGS = [
  'nocode-for-pro',
  'chatgpt-home-buying',
  'undergraduate-thesis',
  'laolao-service-design',
];

async function listWebp(dir) {
  try {
    const names = await readdir(dir);
    return names.filter((n) => n.endsWith('.webp')).map((n) => join(dir, n));
  } catch {
    return [];
  }
}

async function uploadOne(localPath, key) {
  // 固定 4.86：@latest 已要求 Node >=22，本机仍是 Node 20
  await execFileAsync(
    'npx',
    [
      '--yes',
      'wrangler@4.86.0',
      'r2',
      'object',
      'put',
      `${BUCKET}/${key}`,
      '--file',
      localPath,
      '--remote',
      '--content-type',
      'image/webp',
    ],
    { stdio: 'pipe', maxBuffer: 10 * 1024 * 1024 },
  );
}

async function mapPool(items, concurrency, worker) {
  const results = [];
  let i = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (i < items.length) {
      const idx = i;
      i += 1;
      results[idx] = await worker(items[idx], idx);
    }
  });
  await Promise.all(runners);
  return results;
}

async function uploadAll() {
  const queue = [];
  for (const slug of SLUGS) {
    const fullDir = join(IMG_ROOT, slug);
    const thumbDir = join(fullDir, 'thumbs');
    for (const f of await listWebp(fullDir)) {
      queue.push({ file: f, key: `portfolio/${slug}/${f.split('/').pop()}`, slug });
    }
    for (const f of await listWebp(thumbDir)) {
      queue.push({ file: f, key: `portfolio/${slug}/thumbs/${f.split('/').pop()}`, slug });
    }
  }

  console.log(`\n待上传 ${queue.length} 个文件（并发 4）`);
  let ok = 0;
  let fail = 0;

  await mapPool(queue, 4, async ({ file, key }) => {
    const size = (await stat(file)).size;
    try {
      await uploadOne(file, key);
      ok += 1;
      console.log(`  ✓ ${key} (${(size / 1024).toFixed(0)} KB)`);
    } catch (err) {
      fail += 1;
      console.error(`  ✗ ${key}: ${err.message.split('\n')[0]}`);
    }
  });

  console.log(`\n上传完成：成功 ${ok}，失败 ${fail}`);
  return fail === 0;
}

async function patchJson() {
  const data = JSON.parse(await readFile(PORTFOLIO_JSON, 'utf8'));
  let changed = 0;
  for (const project of data.projects || []) {
    for (const frame of project.frames || []) {
      if (frame.type !== 'image' || !frame.src) continue;

      // 已是 CDN：只在路径匹配时刷新 CDN 前缀；保留已有 srcLocal
      if (frame.src.startsWith('/images/portfolio/')) {
        frame.srcLocal = frame.src;
        frame.src = `${CDN_BASE}${frame.src.replace('/images/portfolio', '/portfolio')}`;
        changed += 1;
      } else if (frame.srcLocal?.startsWith('/images/portfolio/')) {
        // 已有兜底字段：按当前 CDN_BASE 重写主 src（便于日后切回 cdn.alii.work）
        frame.src = `${CDN_BASE}${frame.srcLocal.replace('/images/portfolio', '/portfolio')}`;
        changed += 1;
      }
    }
  }
  await writeFile(PORTFOLIO_JSON, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`✓ 写入 ${PORTFOLIO_JSON}：更新 ${changed} 个 image src → ${CDN_BASE}`);
}

async function main() {
  console.log(`bucket=${BUCKET}`);
  console.log(`cdn=${CDN_BASE}`);
  if (!jsonOnly) {
    const ok = await uploadAll();
    if (!ok) process.exitCode = 1;
  }
  if (writeJson) await patchJson();
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
