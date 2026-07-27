#!/usr/bin/env node
/**
 * 新增 Gallery 图片工作流：压缩 webp → 上传 R2(可选) → 追加索引到 gallery.json
 *
 * 用法:
 *   node scripts/publish-gallery.mjs <原图路径> --title "标题" [--desc "描述"] [--no-cdn]
 *
 * 上传 R2 所需环境变量(缺失则只压缩+写本地索引，不阻塞):
 *   CLOUDFLARE_ACCOUNT_ID
 *   CLOUDFLARE_API_TOKEN
 *   R2_BUCKET        (R2 存储桶名)
 *   CDN_DOMAIN       (R2 自定义域名，如 cdn.alii.work)
 *
 * 示例:
 *   node scripts/publish-gallery.mjs ~/Desktop/new.png --title "新作品"
 *   CLOUDFLARE_ACCOUNT_ID=xxx CLOUDFLARE_API_TOKEN=xxx R2_BUCKET=imgs CDN_DOMAIN=cdn.alii.work \
 *     node scripts/publish-gallery.mjs ~/Desktop/new.png --title "新作品"
 */
import { readFile, writeFile, mkdir, stat, access } from 'node:fs/promises';
import { join, parse, extname } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';

const execFileAsync = promisify(execFile);
const ROOT = process.cwd();
const WEBP_DIR = join(ROOT, 'public/images/gallery/webp');
const GALLERY_JSON = join(ROOT, 'src/data/gallery.json');
const MAX_WIDTH = 1600;
const QUALITY = 80;
const INPUT_EXTS = ['.png', '.jpg', '.jpeg'];

const args = process.argv.slice(2);
const getArg = (name) => {
  const i = args.indexOf(name);
  return i !== -1 ? args[i + 1] : undefined;
};
const positional = args.filter((a) => !a.startsWith('--'));
const srcPath = positional[0];
const title = getArg('--title');
const desc = getArg('--desc');
const noCdn = args.includes('--no-cdn');

const usage = () =>
  console.log(
    '用法: node scripts/publish-gallery.mjs <原图路径> --title "标题" [--desc "描述"] [--no-cdn]\n' +
      '环境变量(上传 R2): CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN / R2_BUCKET / CDN_DOMAIN',
  );

if (!srcPath || !title) {
  usage();
  process.exit(1);
}

const absSrc = srcPath.startsWith('/') ? srcPath : join(ROOT, srcPath);
const ext = extname(absSrc).toLowerCase();
if (!INPUT_EXTS.includes(ext)) {
  console.error(`仅支持 ${INPUT_EXTS.join('/')}，得到 ${ext || '无扩展名'}`);
  process.exit(1);
}

const baseName = parse(absSrc).name;
const webpName = `${baseName}.webp`;
const webpPath = join(WEBP_DIR, webpName);
const localImg = `/images/gallery/webp/${webpName}`;

const cf = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  apiToken: process.env.CLOUDFLARE_API_TOKEN,
  bucket: process.env.R2_BUCKET,
  cdnDomain: process.env.CDN_DOMAIN,
};
const hasCf = !noCdn && cf.accountId && cf.apiToken && cf.bucket && cf.cdnDomain;

async function uploadToR2() {
  const key = webpName;
  const env = {
    ...process.env,
    CLOUDFLARE_ACCOUNT_ID: cf.accountId,
    CLOUDFLARE_API_TOKEN: cf.apiToken,
  };
  await execFileAsync(
    'npx',
    ['--yes', 'wrangler@latest', 'r2', 'object', 'put', `${cf.bucket}/${key}`, '--file', webpPath, '--remote'],
    { env, stdio: 'pipe' },
  );
  return `https://${cf.cdnDomain}/${key}`;
}

async function main() {
  await mkdir(WEBP_DIR, { recursive: true });

  try {
    await access(absSrc);
  } catch {
    console.error(`找不到原图: ${absSrc}`);
    process.exit(1);
  }

  // 1. 压缩 webp
  const before = (await stat(absSrc)).size;
  await sharp(absSrc)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(webpPath);
  const after = (await stat(webpPath)).size;
  console.log(`✓ 压缩: ${(before / 1024).toFixed(1)}KB → ${(after / 1024).toFixed(1)}KB → ${webpPath}`);

  // 2. 上传 R2（可选）
  let img = localImg;
  if (hasCf) {
    try {
      const cdnUrl = await uploadToR2();
      img = cdnUrl;
      console.log(`✓ 上传 R2: ${cdnUrl}`);
    } catch (err) {
      console.warn(`⚠ R2 上传失败，回退本地路径: ${err.message}`);
      img = localImg;
    }
  } else {
    console.log(`i 跳过 R2 上传（未配置 CF 凭据），使用本地路径: ${localImg}`);
    console.log(`  上传时设置 CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN / R2_BUCKET / CDN_DOMAIN 后重跑`);
  }

  // 3. 追加索引到 gallery.json
  const data = JSON.parse(await readFile(GALLERY_JSON, 'utf8'));
  const nextId = Math.max(0, ...data.items.map((i) => Number(i.id) || 0)) + 1;
  const newItem = { id: nextId, img, title };
  if (desc) newItem.description = desc;
  data.items.push(newItem);
  await writeFile(GALLERY_JSON, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`✓ 索引: gallery.json #${nextId}  ${title}`);
  console.log(`\n完成。新图片 id=${nextId}，img=${img}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
