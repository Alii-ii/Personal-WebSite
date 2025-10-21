/**
 * 作品集数据上下文
 * 管理 Masonry 组件展示的图片数据
 * 支持从 Supabase Storage 自动获取图片
 */

import { getImagesFromFolder, getImageInfo, supabase } from '@/lib/supabase';

// 作品集图片数据
const portfolioItems = [
  {
    img: 'https://cdn.alii.work/20250910-180822.png',
    url: '#',
    title: '猫猫',
    description: '这是第一个作品的描述'
  },
  {
    img: 'https://c d ncdn.alii.work/20250910-180838.png',
    url: '#',
    title: '玲',
  },
  {
    img: 'https://cdn.alii.work/20250910-183944.jpeg',
    title: '薇薇安',
  },
  {
    img: 'https://cdn.alii.work/20250910-180757.png',
    tittle: '11号/社长/雅'
  },
  {
    img: 'https://cdn.alii.work/20250910-183952.jpeg',
    tittle: '甘雨',
  },
  {
    img: 'https://cdn.alii.work/20250910-180743.png',
    tittle: '艾莲/玲/猫猫',
  },
  {
    img: 'https://cdn.alii.work/20250910-183948.jpeg',
    tittle: '兄妹拜年',
  },
  {
    img: 'https://cdn.alii.work/20250910-183958.jpeg',
    tittle: '一斗',
  },
  {
    img: 'https://cdn.alii.work/20250910-184010.jpeg',
    tittle: '青衣(竖)',
  },
  {
    img: 'https://cdn.alii.work/20250910-184003.jpeg',
    tittle: '花火',
  },
  {
    img: 'https://cdn.alii.work/20250910-184014.jpeg',
    tittle: '简',
  },
  {
    img: 'https://cdn.alii.work/20250910-184006.jpeg',
    tittle: '帽帽猫',
  },
  {
    img: 'https://cdn.alii.work/20250910-191655.jpeg',
    tittle: '千织',
  },
  {
    img: 'https://cdn.alii.work/20250910-191725.jpeg',
    tittle: '某电系常驻异常',
  },
  {
    img: 'https://cdn.alii.work/cover.png',
    tittle: '孚孚',
  },
  {
    img: 'https://cdn.alii.work/20250910-191659.jpeg',
    tittle: '白术',
  },
  {
    img: 'https://cdn.alii.work/20250910-191708.jpeg',
    tittle: '安比',
  },
  {
    img: 'https://cdn.alii.work/20250910-191722.jpeg',
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
 * @returns {Array} 作品集项目数组
 */
export const getPortfolioItems = () => {
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
 * 从 Supabase Storage 获取作品集图片
 * @param {string} bucketName - 存储桶名称，默认为 'images'
 * @param {string} folderPath - 文件夹路径，默认为空（根目录）
 * @returns {Promise<Array>} 作品集图片数组
 */
export async function getPortfolioImagesFromSupabase(bucketName = 'images', folderPath = '') {
  try {
    console.log(`正在从 Supabase 获取图片: ${bucketName}/${folderPath}`);
    
    // 获取图片列表
    const images = await getImagesFromFolder(bucketName, folderPath);
    
    if (images.length === 0) {
      console.warn('未找到任何图片');
      return [];
    }

    // 转换为作品集格式
    const portfolioImages = await Promise.all(
      images.map(async (image, index) => {
        // 获取图片尺寸信息
        const imageInfo = await getImageInfo(image.url);
        
        return {
          id: image.id || `supabase-${index}`,
          img: image.url,
          url: image.url, // 可以设置为详情页链接
          title: image.name.replace(/\.[^/.]+$/, ''), // 移除文件扩展名作为标题
          description: `来自 Supabase Storage 的图片 - ${image.name}`,
          // 添加元数据
          metadata: {
            size: image.size,
            lastModified: image.lastModified,
            path: image.path,
            originalWidth: imageInfo.width,
            originalHeight: imageInfo.height,
            aspectRatio: imageInfo.aspectRatio
          }
        };
      })
    );

    console.log(`成功获取 ${portfolioImages.length} 张图片`);
    return portfolioImages;
  } catch (error) {
    console.error('从 Supabase 获取图片失败:', error);
    return [];
  }
}

/**
 * 测试 Supabase 连接
 * @returns {Promise<boolean>} 连接是否成功
 */
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.storage.from('images').list('', { limit: 1 });
    if (error) {
      console.error('Supabase 连接测试失败:', error);
      return false;
    }
    console.log('Supabase 连接成功！');
    return true;
  } catch (error) {
    console.error('Supabase 连接测试失败:', error);
    return false;
  }
}

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
