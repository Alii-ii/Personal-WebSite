"use client";

import { useState, useEffect } from 'react';
import Footer from '@/components/footer';
import DotGrid from '@/effects/DotGrid';
import AnimatedContent from '@/effects/AnimatedContent';
import Masonry from '@/effects/Masonry';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getPortfolioItems, getMasonryConfig, getPortfolioImagesFromSupabase, testSupabaseConnection } from '@/contexts/PortfolioContext';
import Link from 'next/link';

/**
 * Gallery 页面 - 作品集展示
 * 展示 Masonry 布局的作品集图片
 */
export default function Gallery() {
  const { baseColor, activeColor } = useThemeColors();
  
  // 作品集数据状态 - 初始化为静态数据
  const [portfolioItems, setPortfolioItems] = useState(getPortfolioItems());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 获取 Masonry 配置
  const masonryConfig = getMasonryConfig();
  
  // 从 Supabase 获取图片数据
  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('开始测试 Supabase 连接...');
        const connectionTest = await testSupabaseConnection();
        
        if (!connectionTest) {
          console.warn('Supabase 连接失败，保持使用静态数据');
          setIsLoading(false);
          return;
        }
        
        console.log('Supabase 连接成功，开始获取图片...');
        const images = await getPortfolioImagesFromSupabase('images', '');
        
        if (images.length > 0) {
          console.log(`成功获取 ${images.length} 张图片，更新作品集数据`);
          setPortfolioItems(images);
        } else {
          console.warn('未获取到图片，保持使用静态数据');
        }
      } catch (err) {
        console.error('获取图片时发生错误:', err);
        setError(err.message);
        // 发生错误时保持使用静态数据
      } finally {
        setIsLoading(false);
      }
    };
    
    // 页面加载时获取图片
    loadImages();
  }, []);
  
  // 处理下划线文本点击事件
  const handleUnderlinedClick = (text) => {
    console.log('点击了下划线文本:', text);
    // 确保 text 是字符串类型
    const textStr = String(text || '');
    // 如果点击的是"投稿"或"post"，刷新页面重新加载图片
    if (textStr.includes('投稿') || textStr.includes('post')) {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col relative bg-bg pb-32 md:pb-40">

      {/* 背景点阵效果 */}
      <div className="absolute inset-0 z-0">
        <DotGrid 
          dotSize={3}
          gap={18}
          baseColor={baseColor}
          activeColor={activeColor}
          proximity={120}
          speedTrigger={80}
          shockRadius={200}
          shockStrength={3}
          maxSpeed={2000}
          resistance={800}
          returnDuration={1.2}
          className="opacity-75"
        />
      </div>


      {/* 主要内容区域 */}
      <AnimatedContent
        direction="vertical"
        reverse={false}
        distance={80}
        duration={1.2}
        delay={0.6}
        immediate={true}
        flex={true}
        className="flex-1 w-full"
      >
        <div className="w-full flex-1 px-6 md:px-16 py-4 md:py-[48px] flex items-start overflow-y-auto">
            <Masonry
                items={portfolioItems}
                {...masonryConfig}
            />
        </div>
      </AnimatedContent>

      <Footer onUnderlinedClick={handleUnderlinedClick} isGallery={true} />
    </div>
  );
}
