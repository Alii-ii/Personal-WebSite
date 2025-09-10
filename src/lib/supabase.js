import { createClient } from '@supabase/supabase-js';

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lvttrekvsfvpwjhipuwz.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2dHRyZWt2c2Z2cHdqaGlwdXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0OTExNzcsImV4cCI6MjA3MzA2NzE3N30.dZV7o7AcLcqKjRcQVdf-yD_el9hhUSjZmy5H8eFzoJQ';

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 从 Supabase Storage 获取指定文件夹下的所有图片
 * @param {string} bucketName - 存储桶名称
 * @param {string} folderPath - 文件夹路径
 * @returns {Promise<Array>} 图片信息数组
 */
export async function getImagesFromFolder(bucketName = 'images', folderPath = '') {
  try {
    // 列出指定文件夹下的所有文件
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('获取文件列表失败:', error);
      return [];
    }

    // 过滤出图片文件
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const imageFiles = files.filter(file => 
      imageExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    );

    // 为每个图片生成公共 URL
    const images = await Promise.all(
      imageFiles.map(async (file) => {
        const filePath = folderPath ? `${folderPath}/${file.name}` : file.name;
        
        // 获取公共 URL
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        // 获取签名 URL（如果需要）
        const { data: signedUrlData } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1年有效期

        return {
          id: file.id || file.name,
          name: file.name,
          url: signedUrlData?.signedUrl || publicUrlData?.publicUrl,
          publicUrl: publicUrlData?.publicUrl,
          size: file.metadata?.size || 0,
          lastModified: file.updated_at || file.created_at,
          path: filePath
        };
      })
    );

    return images;
  } catch (error) {
    console.error('获取图片失败:', error);
    return [];
  }
}

/**
 * 获取图片的详细信息（包括尺寸）
 * @param {string} imageUrl - 图片 URL
 * @returns {Promise<Object>} 图片信息
 */
export async function getImageInfo(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight
      });
    };
    img.onerror = () => {
      resolve({
        width: 400,
        height: 300,
        aspectRatio: 4/3
      });
    };
    img.src = imageUrl;
  });
}
