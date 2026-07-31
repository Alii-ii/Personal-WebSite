#!/usr/bin/env node
/**
 * 字体子集化：扫描 src/ 中实际用到的字符 → 从 TTF 生成 woff2 子集
 *
 * 用法：
 *   node scripts/subset-fonts.mjs            # 扫描 src/ 生成子集
 *   node scripts/subset-fonts.mjs --dry-run  # 只打印字符集，不写文件
 *
 * 何时需要重跑：
 *   - 新增/修改了中文页面文本（resume 加新经历、footer 改文案等）
 *   - 新增了 locale 翻译
 *   - 不确定时跑一次也没坏处，几秒钟的事
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { createHash } from 'node:crypto';
import subsetFont from 'subset-font';

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, 'src');
const FONTS_DIR = join(ROOT, 'public/fonts');
const DRY_RUN = process.argv.includes('--dry-run');

// 源字体 → 输出 woff2 的映射
const FONT_MAP = [
  { ttf: 'AlibabaPuHuiTi-2-45-Light.ttf', woff2: 'AlibabaPuHuiTi-2-45-Light.woff2' },
  { ttf: 'AlibabaPuHuiTi-2-55-Regular.ttf', woff2: 'AlibabaPuHuiTi-2-55-Regular.woff2' },
  { ttf: 'AlibabaPuHuiTi-2-75-SemiBold.ttf', woff2: 'AlibabaPuHuiTi-2-75-SemiBold.woff2' },
  { ttf: 'DingTalk JinBuTi.ttf', woff2: 'DingTalk-JinBuTi.woff2' },
];

// 扫描目录提取所有文本字符
function collectChars(dir) {
  const chars = new Set();
  const exts = new Set(['.jsx', '.js', '.json', '.css', '.md', '.ts', '.tsx']);

  function walk(d) {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') walk(p);
      } else if (exts.has(extname(entry.name))) {
        for (const ch of readFileSync(p, 'utf8')) chars.add(ch);
      }
    }
  }
  walk(dir);

  // 补充常用字符，防止动态内容或用户输入缺字
  const safeChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    + '.,;:!?@#$%^&*()-_+=[]{}|\\/\'\"<>~`© …—–·×→←↑↓✓✕●○■□▲△▼▽★☆'
    // 全角引号用 Unicode 转义，避免裸引号破坏 JS 字符串字面量
    + '，。！？、；：\u2018\u2019\u201c\u201d【】《》（）—…·'
    // 补充常用排版符号：序号、单位、几何图形等，子集化扫描不到这些就缺字
    + '①②③④⑤⑥⑦⑧⑨⑩⑾⑿⒀⒁⒂°℃℉§¶·•◦‣※♠♣♥♦☎☑☐☒';
  for (const ch of safeChars) chars.add(ch);

  return chars;
}

const fmtKB = (b) => `${(b / 1024).toFixed(0)} KB`;

// 版本号注入目标：@font-face 的 url() 与 layout 的 preload href
const GLOBALS_CSS = join(ROOT, 'src/app/globals.css');
const LAYOUT_JS = join(ROOT, 'src/app/layout.js');

function isWordChar(c) {
  return (c >= '0' && c <= '9') || (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z');
}

/**
 * 把 woff2 引用的 ?v= 刷新为 fontVersion。
 * _headers 给 /fonts/* 设了 immutable 一年缓存：子集内容变但文件名不变时，
 * 浏览器不重新请求 → 老访客仍缺字。靠 ?v= 变化改 URL、强制重新拉取。
 * 字符集没变则 fontVersion 不变，命中旧缓存。
 */
function injectVersion(fontVersion) {
  for (const file of [GLOBALS_CSS, LAYOUT_JS]) {
    let src = readFileSync(file, 'utf8');
    let changed = false;
    for (const { woff2 } of FONT_MAP) {
      let out = '';
      let idx = 0;
      let pos = src.indexOf(woff2, idx);
      while (pos !== -1) {
        out += src.slice(idx, pos) + woff2;
        idx = pos + woff2.length;
        // 已有 ?v=oldhash 则跳过旧的，统一替换为新版本号
        if (src.startsWith('?v=', idx)) {
          let j = idx + 4;
          while (j < src.length && isWordChar(src[j])) j++;
          idx = j;
        }
        out += '?v=' + fontVersion;
        changed = true;
        pos = src.indexOf(woff2, idx);
      }
      out += src.slice(idx);
      src = out;
    }
    if (changed) {
      writeFileSync(file, src);
      console.log(`  ↳ 版本号注入 ${basename(file)} (?v=${fontVersion})`);
    }
  }
}

async function main() {
  const chars = collectChars(SRC_DIR);
  const text = [...chars].join('');

  // 统计 CJK 字符数
  const cjkCount = [...chars].filter(
    (ch) => ch.codePointAt(0) >= 0x4e00 && ch.codePointAt(0) <= 0x9fff,
  ).length;

  console.log(`扫描 src/：共 ${chars.size} 个唯一字符（其中 CJK 汉字 ${cjkCount} 个）\n`);

  if (DRY_RUN) {
    const cjk = [...chars]
      .filter((ch) => ch.codePointAt(0) >= 0x4e00 && ch.codePointAt(0) <= 0x9fff)
      .sort()
      .join('');
    console.log('CJK 字符列表：\n' + cjk);
    console.log('\n（--dry-run 模式，不写文件）');
    return;
  }

  for (const { ttf, woff2 } of FONT_MAP) {
    const ttfPath = join(FONTS_DIR, ttf);
    const woff2Path = join(FONTS_DIR, woff2);

    try {
      const ttfBuf = readFileSync(ttfPath);
      const before = ttfBuf.length;
      const result = await subsetFont(ttfBuf, text, { targetFormat: 'woff2' });
      writeFileSync(woff2Path, result);
      const after = result.length;
      const pct = ((1 - after / before) * 100).toFixed(0);
      console.log(
        `  ✓ ${basename(ttf).padEnd(40)} ${fmtKB(before).padStart(8)} → ${fmtKB(after).padStart(6)}  (-${pct}%)`,
      );
    } catch (err) {
      console.error(`  ✗ ${basename(ttf)}: ${err.message}`);
    }
  }

  // 字符集内容变 → fontVersion 变 → @font-face/preload 的 ?v= 变 → 浏览器重新拉取 woff2，
  // 绕过 /fonts/* 的 immutable 缓存。字符集没变则版本号不变，命中缓存。
  const fontVersion = createHash('sha1').update(text).digest('hex').slice(0, 8);
  injectVersion(fontVersion);

  console.log('\n完成。新增文字会随 build 自动进子集并刷新缓存。');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
