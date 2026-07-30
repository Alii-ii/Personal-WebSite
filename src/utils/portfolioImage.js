/**
 * Portfolio 图片 URL 工具
 * 主路径优先走 R2/CDN，本地 /images/portfolio/* 作兜底。
 */

/** CDN 原图 → 同路径 thumbs（L2 作品墙用） */
export const toPortfolioThumbSrc = (src = '') => {
  if (!src || src.includes('/thumbs/')) return src;

  // 本地：/images/portfolio/<slug>/<file>.webp
  if (src.startsWith('/images/portfolio/')) {
    const idx = src.lastIndexOf('/');
    return `${src.slice(0, idx)}/thumbs${src.slice(idx)}`;
  }

  // CDN：.../portfolio/<slug>/<file>.webp
  const marker = '/portfolio/';
  const i = src.indexOf(marker);
  if (i === -1) return src;
  const after = src.slice(i + marker.length); // <slug>/<file>.webp
  const slash = after.indexOf('/');
  if (slash === -1) return src;
  const slug = after.slice(0, slash);
  const file = after.slice(slash + 1);
  if (!file || file.includes('/')) return src;
  return `${src.slice(0, i)}${marker}${slug}/thumbs/${file}`;
};

/**
 * CDN URL → 本地兜底路径。
 * 优先用显式 srcLocal；否则从 .../portfolio/<slug>/... 反推。
 */
export const toPortfolioLocalSrc = (src = '', srcLocal) => {
  if (srcLocal) return srcLocal;
  if (!src || src.startsWith('/')) return '';
  const marker = '/portfolio/';
  const i = src.indexOf(marker);
  if (i === -1) return '';
  return `/images${src.slice(i)}`; // /images/portfolio/...
};
