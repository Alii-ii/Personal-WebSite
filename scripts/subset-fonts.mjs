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
    + '，。！？、；：''""【】《》（）—…·';
  for (const ch of safeChars) chars.add(ch);

  return chars;
}

const fmtKB = (b) => `${(b / 1024).toFixed(0)} KB`;

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

  console.log('\n完成。如果新增了大量新文字，记得 build 后检查页面字体是否正常。');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
