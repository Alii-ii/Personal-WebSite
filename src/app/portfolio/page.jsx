"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/footer';
import DotGrid from '@/effects/DotGrid';
import AnimatedContent from '@/effects/AnimatedContent';
import Masonry from '@/effects/Masonry';
import PortfolioSidebar from '@/components/portfolio/PortfolioSidebar';
import PortfolioCompact, { WRITING_ITEMS } from '@/components/portfolio/PortfolioCompact';
import PortfolioMenu from '@/components/portfolio/PortfolioMenu';
import MobileDrawer from '@/components/portfolio/MobileDrawer';
import FeedCard from '@/components/portfolio/FeedCard';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getFeedFrames, getProjectsByCategory } from '@/contexts/ProjectContext';

/**
 * 是否启用完整作品墙模式（Masonry feed）。
 * 当前可展示内容较少，默认使用精简的卡片列表布局（PortfolioCompact）。
 * 待作品集内容充实后，将此值设为 true 切回完整 feed 模式。
 */
const ENABLE_FULL_FEED = false;

/**
 * 作品集 L2 页面
 *
 * 两种布局模式：
 * 1. Compact（默认）：左侧信息栏 + 右侧卡片纵向列表，第一张卡片为简历入口
 * 2. Full Feed：瀑布流作品墙，把所有项目 frame 平铺展示
 */
export default function Portfolio() {
  const { baseColor, activeColor } = useThemeColors();
  const router = useRouter();

  useEffect(() => {
    document.documentElement.classList.add('portfolio-scrollbar-hidden');
    document.body.classList.add('portfolio-scrollbar-hidden');
    return () => {
      document.documentElement.classList.remove('portfolio-scrollbar-hidden');
      document.body.classList.remove('portfolio-scrollbar-hidden');
    };
  }, []);

  // ─── Full Feed 模式所需状态 ───
  const groups = useMemo(() => getProjectsByCategory(), []);
  const [activeCategory, setActiveCategory] = useState(null);
  const [expandedMap, setExpandedMap] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);

  const feedItems = useMemo(
    () => getFeedFrames({ category: activeCategory || undefined }),
    [activeCategory],
  );

  const getItemHeight = useCallback((item, columnWidth) => {
    const ratio = item?.feed?.w && item?.feed?.h ? item.feed.h / item.feed.w : 0.68;
    return Math.round(columnWidth * ratio);
  }, []);

  const handleItemClick = useCallback(
    (item) => router.push(`/portfolio/${item.projectSlug}`),
    [router],
  );

  const renderItem = useCallback((item) => <FeedCard item={item} />, []);

  const handleToggleExpand = useCallback((key) => {
    setExpandedMap((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

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

      {ENABLE_FULL_FEED ? (
        /* ═══════════════════════════════════════════════
         * Full Feed 模式 — 原始瀑布流作品墙
         * ═══════════════════════════════════════════════ */
        <>
          <div className="w-full flex-1 flex flex-col md:flex-row items-start relative z-10">
            <PortfolioSidebar
              groups={groups}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              expandedMap={expandedMap}
              onToggleExpand={handleToggleExpand}
            />

            <AnimatedContent
              direction="vertical"
              reverse={false}
              distance={80}
              duration={1.2}
              delay={0.6}
              immediate={true}
              flex={true}
              className="w-full flex-1"
            >
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
            </AnimatedContent>
          </div>

          {/* 移动端右下角菜单按钮 */}
          <button
            type="button"
            aria-label="目录"
            onClick={() => setMenuOpen(true)}
            className="md:hidden fixed right-12 bottom-12 z-30 w-8 h-8 rounded-[8px] flex items-center justify-center text-secondary active:bg-hover active:text-main transition-colors duration-150 cursor-pointer"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4.22218 4.44434C4.59037 4.44434 4.88885 4.74281 4.88885 5.111C4.88885 5.47919 4.59037 5.77767 4.22218 5.77767H3.33329C2.9651 5.77767 2.66663 5.47919 2.66663 5.111C2.66663 4.74281 2.9651 4.44434 3.33329 4.44434H4.22218ZM18 4.44434C18.3681 4.44434 18.6666 4.74281 18.6666 5.111C18.6666 5.47919 18.3681 5.77767 18 5.77767H7.33329C6.9651 5.77767 6.66663 5.47919 6.66663 5.111C6.66663 4.74281 6.9651 4.44434 7.33329 4.44434H18ZM4.22218 9.99989C4.59037 9.99989 4.88885 10.2984 4.88885 10.6666C4.88885 11.0347 4.59037 11.3332 4.22218 11.3332H3.33329C2.9651 11.3332 2.66663 11.0347 2.66663 10.6666C2.66663 10.2984 2.9651 9.99989 3.33329 9.99989H4.22218ZM6.66663 10.6666C6.66663 10.2984 6.9651 9.99989 7.33329 9.99989H18C18.3681 9.99989 18.6666 10.2984 18.6666 10.6666C18.6666 11.0347 18.3681 11.3332 18 11.3332H7.33329C6.9651 11.3332 6.66663 11.0347 6.66663 10.6666ZM4.22218 15.5554C4.59037 15.5554 4.88885 15.8539 4.88885 16.2221C4.88885 16.5903 4.59037 16.8888 4.22218 16.8888H3.33329C2.9651 16.8888 2.66663 16.5903 2.66663 16.2221C2.66663 15.8539 2.9651 15.5554 3.33329 15.5554H4.22218ZM6.66663 16.2221C6.66663 15.8539 6.9651 15.5554 7.33329 15.5554H18C18.3681 15.5554 18.6666 15.8539 18.6666 16.2221C18.6666 16.5903 18.3681 16.8888 18 16.8888H7.33329C6.9651 16.8888 6.66663 16.5903 6.66663 16.2221Z"
                fill="currentColor"
                fillOpacity="0.65"
              />
            </svg>
          </button>

          {/* 移动端底部抽屉 */}
          <MobileDrawer
            open={menuOpen}
            onOpenChange={setMenuOpen}
            groups={groups}
            currentSlug={null}
            onSelect={(targetSlug) => {
              setMenuOpen(false);
              router.push(`/portfolio/${targetSlug}`);
            }}
            onBack={() => {
              setMenuOpen(false);
              router.push('/');
            }}
          />
        </>
      ) : (
        /* ═══════════════════════════════════════════════
         * Compact 模式 — 卡片列表（当前默认）
         * ═══════════════════════════════════════════════ */
        <>
          <PortfolioCompact />

          {/* 移动端右下角菜单按钮 — 与首页同款位置 */}
          <button
            type="button"
            aria-label="菜单"
            onClick={() => setMenuOpen(true)}
            className="md:hidden fixed right-12 bottom-12 z-30 w-8 h-8 rounded-[8px] flex items-center justify-center text-secondary hover:text-main active:text-main transition-colors duration-150 cursor-pointer"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4.22218 4.44434C4.59037 4.44434 4.88885 4.74281 4.88885 5.111C4.88885 5.47919 4.59037 5.77767 4.22218 5.77767H3.33329C2.9651 5.77767 2.66663 5.47919 2.66663 5.111C2.66663 4.74281 2.9651 4.44434 3.33329 4.44434H4.22218ZM18 4.44434C18.3681 4.44434 18.6666 4.74281 18.6666 5.111C18.6666 5.47919 18.3681 5.77767 18 5.77767H7.33329C6.9651 5.77767 6.66663 5.47919 6.66663 5.111C6.66663 4.74281 6.9651 4.44434 7.33329 4.44434H18ZM4.22218 9.99989C4.59037 9.99989 4.88885 10.2984 4.88885 10.6666C4.88885 11.0347 4.59037 11.3332 4.22218 11.3332H3.33329C2.9651 11.3332 2.66663 11.0347 2.66663 10.6666C2.66663 10.2984 2.9651 9.99989 3.33329 9.99989H4.22218ZM6.66663 10.6666C6.66663 10.2984 6.9651 9.99989 7.33329 9.99989H18C18.3681 9.99989 18.6666 10.2984 18.6666 10.6666C18.6666 11.0347 18.3681 11.3332 18 11.3332H7.33329C6.9651 11.3332 6.66663 11.0347 6.66663 10.6666ZM4.22218 15.5554C4.59037 15.5554 4.88885 15.8539 4.88885 16.2221C4.88885 16.5903 4.59037 16.8888 4.22218 16.8888H3.33329C2.9651 16.8888 2.66663 16.5903 2.66663 16.2221C2.66663 15.8539 2.9651 15.5554 3.33329 15.5554H4.22218ZM6.66663 16.2221C6.66663 15.8539 6.9651 15.5554 7.33329 15.5554H18C18.3681 15.5554 18.6666 15.8539 18.6666 16.2221C18.6666 16.5903 18.3681 16.8888 18 16.8888H7.33329C6.9651 16.8888 6.66663 16.5903 6.66663 16.2221Z"
                fill="currentColor"
                fillOpacity="0.65"
              />
            </svg>
          </button>

          {/* 全屏菜单 — 项目目录 + 文章随笔 + 社交 */}
          <PortfolioMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            groups={groups}
            writingItems={WRITING_ITEMS}
          />
        </>
      )}

      <Footer
        isGallery={true}
        showGallerySubtitle={false}
        backHref="/"
        maskHeight="240px"
        togglesSide="left"
        hideRight="mobile"
      />

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
