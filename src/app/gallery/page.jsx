"use client";

import { useState } from 'react';
import Footer from '@/components/footer';
import DotGrid from '@/effects/DotGrid';
import AnimatedContent from '@/effects/AnimatedContent';
import Masonry from '@/effects/Masonry';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getPortfolioItems, getMasonryConfig } from '@/contexts/PortfolioContext';

/**
 * Gallery 页面 - 作品集展示
 * 展示 Masonry 布局的作品集图片
 */
export default function Gallery() {
  const { baseColor, activeColor } = useThemeColors();
  
  // 备注：已移除 Supabase 读取逻辑，作品集仅使用静态数据
  const [portfolioItems] = useState(getPortfolioItems());
  
  // 获取 Masonry 配置
  const masonryConfig = getMasonryConfig();
  
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
