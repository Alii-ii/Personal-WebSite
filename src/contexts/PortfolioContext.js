/**
 * 作品集数据上下文
 * 管理 Masonry 组件展示的图片数据
 * 数据源: src/data/gallery.json（由 scripts/publish-gallery.mjs 维护）
 * 图片为 webp 格式，由 scripts/compress-images.mjs 压缩生成
 */
import galleryData from '@/data/gallery.json';

// 作品集图片数据（来自 gallery.json）
const portfolioItems = galleryData.items;

// Masonry 组件配置
const masonryConfig = {
  ease: 'power3.out',
  duration: 0.6,
  stagger: 0.1,
  animateFrom: 'bottom',
  scaleOnHover: true,
  hoverScale: 0.95,
  blurToFocus: true,
  colorShiftOnHover: true
};

// 固定 seed，确保 SSR/CSR 的图片顺序一致，避免 hydration mismatch
const PORTFOLIO_SHUFFLE_SEED = 'portfolio-order-v1';

const createSeededRandom = (seedText) => {
  let seed = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    seed ^= seedText.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }

  return () => {
    seed += 0x6D2B79F5;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * 获取作品集数据（固定 seed 洗牌，保证首屏顺序稳定）
 * @returns {Array} 随机排序的作品集项目数组
 */
export const getPortfolioItems = () => {
  const shuffledItems = [...portfolioItems];
  const random = createSeededRandom(PORTFOLIO_SHUFFLE_SEED);

  for (let i = shuffledItems.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffledItems[i], shuffledItems[j]] = [shuffledItems[j], shuffledItems[i]];
  }

  return shuffledItems;
};

/**
 * 获取 Masonry 配置
 * @returns {Object} Masonry 组件配置对象
 */
export const getMasonryConfig = () => {
  return masonryConfig;
};

/**
 * 根据 ID 获取特定作品
 * @param {number} id - 作品 ID
 * @returns {Object|null} 作品对象或 null
 */
export const getPortfolioItemById = (id) => {
  return portfolioItems.find(item => item.id === id) || null;
};

/**
 * 添加新作品（仅运行时内存；持久化请编辑 gallery.json 或用 publish-gallery.mjs）
 * @param {Object} newItem - 新作品对象
 */
export const addPortfolioItem = (newItem) => {
  const maxId = Math.max(0, ...portfolioItems.map(item => Number(item.id) || 0));
  portfolioItems.push({
    id: maxId + 1,
    ...newItem
  });
};

/**
 * 更新作品信息（仅运行时内存）
 * @param {number} id - 作品 ID
 * @param {Object} updates - 要更新的字段
 */
export const updatePortfolioItem = (id, updates) => {
  const index = portfolioItems.findIndex(item => item.id === id);
  if (index !== -1) {
    portfolioItems[index] = { ...portfolioItems[index], ...updates };
  }
};

/**
 * 删除作品（仅运行时内存）
 * @param {number} id - 作品 ID
 */
export const removePortfolioItem = (id) => {
  const index = portfolioItems.findIndex(item => item.id === id);
  if (index !== -1) {
    portfolioItems.splice(index, 1);
  }
};

export default {
  getPortfolioItems,
  getMasonryConfig,
  getPortfolioItemById,
  addPortfolioItem,
  updatePortfolioItem,
  removePortfolioItem
};
