"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/footer';
import DotGrid from '@/effects/DotGrid';
import AnimatedContent from '@/effects/AnimatedContent';
import Masonry from '@/effects/Masonry';
import PortfolioSidebar from '@/components/portfolio/PortfolioSidebar';
import FeedCard from '@/components/portfolio/FeedCard';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getFeedFrames, getProjectsByCategory } from '@/contexts/ProjectContext';

/**
 * 作品集 L2 页面 - 作品墙
 * 复用 gallery 的 feed 布局，但卡片不是「一个项目一张卡」，
 * 而是把各项目内的 frame（图片 / 代码原型 / 图文混排）平铺出来，
 * 点击任意卡片下钻到所属项目的 L3 详情页。
 */
export default function Portfolio() {
  const { baseColor, activeColor } = useThemeColors();
  const router = useRouter();

  useEffect(() => {
    // 仅在当前页面隐藏浏览器滚动条，离开页面后恢复，避免影响其他路由
    document.documentElement.classList.add('portfolio-scrollbar-hidden');
    document.body.classList.add('portfolio-scrollbar-hidden');
    return () => {
      document.documentElement.classList.remove('portfolio-scrollbar-hidden');
      document.body.classList.remove('portfolio-scrollbar-hidden');
    };
  }, []);

  const groups = useMemo(() => getProjectsByCategory(), []);
  const [activeCategory, setActiveCategory] = useState(null);
  const [expandedMap, setExpandedMap] = useState({});

  // 按分类筛选后的平铺 frame 列表
  const feedItems = useMemo(
    () => getFeedFrames({ category: activeCategory || undefined }),
    [activeCategory]
  );

  // 卡片高度直接来自数据的 feed.w/h，无需图片预加载测量，避免首屏抖动
  const getItemHeight = useCallback((item, columnWidth) => {
    const ratio = item?.feed?.w && item?.feed?.h ? item.feed.h / item.feed.w : 0.68;
    return Math.round(columnWidth * ratio);
  }, []);

  // 点击卡片下钻到 L3，并通过 hash 定位到对应 frame
  const handleItemClick = useCallback(
    (item) => {
      // 不做 hash/frame 定位，L3 默认展示第一帧，避免定位偏移问题
      router.push(`/portfolio/${item.projectSlug}`);
    },
    [router]
  );

  const renderItem = useCallback((item) => <FeedCard item={item} />, []);

  const handleToggleExpand = useCallback((key) => {
    setExpandedMap((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col relative bg-bg pb-32 md:pb-40 ">
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

      {/* 主要内容区域：左侧固定栏 + 右侧作品墙 */}
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
        <div className="w-full flex-1 flex flex-col md:flex-row items-start relative z-10">
          <PortfolioSidebar
            groups={groups}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            expandedMap={expandedMap}
            onToggleExpand={handleToggleExpand}
          />

          {/* 不设 overflow，交给文档流滚动，左栏 sticky 才能生效 */}
          <div className="w-full flex-1 px-6 md:pr-4 md:pl-0 py-4 md:py-4 flex items-start">
            <Masonry
              items={feedItems}
              maxColumnWidth={720}
              expandable={false}
              onItemClick={handleItemClick}
              renderItem={renderItem}
              getItemHeight={getItemHeight}
              scaleOnHover={true}
              hoverScale={0.98}
            />
          </div>
        </div>
      </AnimatedContent>

      <Footer isGallery={true} showGallerySubtitle={false} backHref="/" />

      <style jsx global>{`
        .portfolio-scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .portfolio-scrollbar-hidden::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>
    </div>
  );
}
