/**
 * 作品集数据上下文
 * 管理 Masonry 组件展示的图片数据
 * 优先使用本地静态图片，失败时使用 CDN 图片作为兜底
 */

// 作品集图片数据
const portfolioItems = [
  {
    img: 'https://cdn.alii.work/20250910-180822.png',
    fallbackImg: '/images/gallery/20250910-180822.png',
    url: '#',
    title: '猫猫',
    description: '这是第一个作品的描述'
  },
  {
    img: 'https://cdn.alii.work/20250910-180838.png',
    fallbackImg: '/images/gallery/20250910-180838.png',
    url: '#',
    title: '玲',
  },
  {
    img: 'https://cdn.alii.work/20250910-183944.jpeg',
    fallbackImg: '/images/gallery/20250910-183944.jpeg',
    title: '薇薇安',
  },
  {
    img: 'https://cdn.alii.work/20250910-180757.png',
    fallbackImg: '/images/gallery/20250910-180757.png',
    tittle: '11号/社长/雅',
  },
  {
    img: 'https://cdn.alii.work/20250910-183952.jpeg',
    fallbackImg: '/images/gallery/20250910-183952.jpeg',
    tittle: '甘雨',
  },
  {
    img: 'https://cdn.alii.work/20250910-180743.png',
    fallbackImg: '/images/gallery/20250910-180743.png',
    tittle: '艾莲/玲/猫猫',
  },
  {
    img: 'https://cdn.alii.work/20250910-183948.jpeg',
    fallbackImg: '/images/gallery/20250910-183948.jpeg',
    tittle: '兄妹拜年',
  },
  {
    img: 'https://cdn.alii.work/20250910-183958.jpeg',
    fallbackImg: '/images/gallery/20250910-183958.jpeg',
    tittle: '一斗',
  },
  {
    img: 'https://cdn.alii.work/20250910-184010.jpeg',
    fallbackImg: '/images/gallery/20250910-184010.jpeg',
    tittle: '青衣(竖)',
  },
  {
    img: 'https://cdn.alii.work/20250910-184003.jpeg',
    fallbackImg: '/images/gallery/20250910-184003.jpeg',
    tittle: '花火',
  },
  {
    img: 'https://cdn.alii.work/20250910-184014.jpeg',
    fallbackImg: '/images/gallery/20250910-184014.jpeg',
    tittle: '简',
  },
  {
    img: 'https://cdn.alii.work/20250910-184006.jpeg',
    fallbackImg: '/images/gallery/20250910-184006.jpeg',
    tittle: '帽帽猫',
  },
  {
    img: 'https://cdn.alii.work/20250910-191655.jpeg',
    fallbackImg: '/images/gallery/20250910-191655.jpeg',
    tittle: '千织',
  },
  {
    img: 'https://cdn.alii.work/20250910-191725.jpeg',
    fallbackImg: '/images/gallery/20250910-191725.jpeg',
    tittle: '某电系常驻异常',
  },
  {
    img: 'https://cdn.alii.work/cover.png',
    fallbackImg: '/images/gallery/cover.png',
    tittle: '孚孚',
  },
  {
    img: 'https://cdn.alii.work/20250910-191659.jpeg',
    fallbackImg: '/images/gallery/20250910-191659.jpeg',
    tittle: '白术',
  },
  {
    img: 'https://cdn.alii.work/20250910-191708.jpeg',
    fallbackImg: '/images/gallery/20250910-191708.jpeg',
    tittle: '安比',
  },
  {
    img: 'https://cdn.alii.work/20250910-191722.jpeg',
    fallbackImg: '/images/gallery/20250910-191722.jpeg',
    tittle: '11号',
  },
  
];

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

/**
 * 获取作品集数据
 * 每个项目包含 img (CDN链接) 和 fallbackImg (本地图片路径)
 * Masonry 组件会优先使用 fallbackImg，失败时回退到 img
 * @returns {Array} 作品集项目数组
 */
export const getPortfolioItems = () => {
  // 直接返回作品集数据，每个项目已包含 fallbackImg 字段
  return portfolioItems;
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
 * 添加新作品
 * @param {Object} newItem - 新作品对象
 */
export const addPortfolioItem = (newItem) => {
  const maxId = Math.max(...portfolioItems.map(item => item.id));
  portfolioItems.push({
    id: maxId + 1,
    ...newItem
  });
};

/**
 * 更新作品信息
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
 * 删除作品
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
