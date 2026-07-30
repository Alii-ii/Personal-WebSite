"use client";

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocale, getProjectsByCategory } from '@/contexts/ProjectContext';
import CopyEmailButton from '@/components/CopyEmailButton';
import { ChatsIcon, FigmaIcon, BilibiliIcon } from '@/public/icons';
import AnimatedContent from '@/effects/AnimatedContent';
import PortfolioCard from '@/components/portfolio/PortfolioCard';

/**
 * 侧栏社交图标按钮（24×24，r6）— 与 PortfolioSidebar 同款
 */
const IconButton = ({ children, label, onClick }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="w-6 h-6 rounded-[6px] flex items-center justify-center text-secondary hover:text-main hover:bg-hover transition-all duration-200 grayscale hover:grayscale-0"
  >
    {children}
  </button>
);

/**
 * 侧栏分隔位（与 PortfolioSidebar 保持一致）
 */
const Divider = () => <div className="w-[192px] h-px" aria-hidden="true" />;

/**
 * 获取项目的预览图路径数组 — 按 frames 顺序取前 N 张图片
 * 用于卡片多层叠放预览：[0] 最前层, [1] 第2层, [2] 第3层, [3] 第4层
 */
function getProjectPreviewSrcs(project, count = 4) {
  const images = (project.frames || []).filter((f) => f.type === 'image');
  return images.slice(0, count).map((f) => f.src);
}

/**
 * 文章随笔 — 真实飞书文章外链（3 篇）
 * 标题严格按照文档名称，点击直接跳转外链
 */
export const WRITING_ITEMS = [
  {
    title: 'Spec Coding 与工程师协作艺术',
    url: 'https://my.feishu.cn/docx/MyY4d4Zbfo575Xx8XIRcogSHnIh',
  },
  {
    title: '设计师 AI Coding 入门概览',
    url: 'https://my.feishu.cn/docx/CEfMdfpdfoQTK0xMElmcyC5gnCn',
  },
  {
    title: '工程化设计思维',
    url: 'https://my.feishu.cn/docx/YZcIdsLzpojD1mx9KuqcG8dHn8f',
  },
];

/**
 * PortfolioCompact — 精简版作品集页面
 *
 * 匹配 Figma 设计稿 node 11262:4546 的布局：
 *   整体居中，最大宽度 1440px（Figma 画板宽度），左右 padding 240px
 *   左侧 sticky 信息栏（姓名 + 社交 + 项目目录）
 *   右侧卡片纵向列表（gap 20px）
 *   第一张卡片为简历封面 → /resume
 *   后续为作品集卡片 → /portfolio/[slug]
 */
export default function PortfolioCompact() {
  const { language } = useLanguage();
  const router = useRouter();

  const groups = useMemo(() => getProjectsByCategory(), []);

  const handleProjectClick = useCallback(
    (slug) => router.push(`/portfolio/${slug}`),
    [router],
  );

  return (
    <div className="w-full flex-1 flex justify-center relative z-10">
      {/* 居中容器，最大宽度对齐 Figma 1440px 画板 */}
      <div className="w-full max-w-[960px] flex flex-col md:flex-row items-start px-6 md:px-0">
        {/* ═══════ 左侧信息栏（移动端隐藏，移入菜单） ═══════ */}
        <aside className="hidden md:block md:w-[240px] shrink-0 self-start">
          <div className="flex flex-col gap-4 pt-8 md:pt-[80px] pb-4 md:fixed md:top-0 md:left-0 md:w-[240px] md:ml-[max(64px,calc((100vw-960px)/2))] md:h-screen md:overflow-y-auto md:z-10">
            {/* 姓名 */}
            <div className="flex flex-col gap-2">
              <h1 className="font-Ding text-[40px] md:text-[64px] leading-[1] text-main opacity-80">
                黄奕礼
              </h1>
              <p className="font-Ding text-[20px] md:text-[24px] leading-[1] text-main opacity-80">
                Alii / 阿礼
              </p>
            </div>

            <Divider />

            {/* 社交图标 — 匹配 Figma icons 区域 */}
            <div className="flex items-center gap-1.5">
              <IconButton
                label="Figma"
                onClick={() => window.open('https://www.figma.com/@alii', '_blank')}
              >
                <FigmaIcon className="w-4 h-4" />
              </IconButton>
              <IconButton
                label="Bilibili"
                onClick={() => window.open('https://space.bilibili.com', '_blank')}
              >
                <BilibiliIcon className="w-4 h-4" />
              </IconButton>
              <IconButton label="Chats">
                <ChatsIcon className="w-4 h-4" />
              </IconButton>
              <CopyEmailButton appearance="sidebar" />

            </div>

            <Divider />

            {/* 项目目录 */}
            <nav className="flex flex-col gap-1 ml-[-6px]">
              {groups.map((group) => (
                <div key={group.key} className="flex flex-col">
                  <div className="px-2.5 py-1">
                    <span className="font-regular text-[14px] leading-[24px] text-tertiary">
                      {pickLocale(group.label, language)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 pb-2">
                    {group.projects.map((project) => (
                      <button
                        key={project.slug}
                        type="button"
                        onClick={() => handleProjectClick(project.slug)}
                        className="w-full flex flex-row items-start gap-1 px-2.5 py-1 rounded-[8px] text-left transition-colors duration-150 hover:bg-hover"
                      >
                        <span className="w-fit font-regular text-[14px] leading-[24px] text-main truncate">
                          {pickLocale(project.title, language)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* 文章随笔 — 3 篇真实外链 */}
              <div className="flex flex-col">
                <div className="px-2.5 py-1">
                  <span className="font-regular text-[14px] leading-[24px] text-tertiary">
                    文章随笔
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 pb-2">
                  {WRITING_ITEMS.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex flex-row items-start gap-1 px-2.5 py-1 rounded-[8px] text-left transition-colors duration-150 hover:bg-hover"
                    >
                      <span className="w-fit font-regular text-[14px] leading-[24px] text-main truncate">
                        {item.title}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </aside>

        {/* ═══════ 间距（Figma gap=120px） ═══════ */}
        <div className="hidden md:block w-[64px] shrink-0" />

        {/* ═══════ 右侧卡片列表 ═══════ */}
        <AnimatedContent
          direction="vertical"
          reverse={false}
          distance={80}
          duration={1.2}
          delay={0.6}
          immediate={true}
          flex={true}
          className="w-full flex-1 min-w-0"
        >
          {/* 卡片组容器 — menu 同款投影 + 圆角 */}
          <div
            className="w-full flex-1 py-4 md:py-[80px] flex flex-col gap-5"
            style={{
              filter: 'drop-shadow(0 4px 24px hsl(var(--neutral-fg-main) / 0.08)) drop-shadow(0 1px 4px hsl(var(--neutral-fg-main) / 0.04))',
            }}
          >
            {/* 第一张：简历封面 → /resume */}
            <PortfolioCard
              isResume
              previewSrcs={['/images/portfolio/covers/resume-cover.webp']}
              onClick={() => router.push('/resume')}
            />

            {/* 作品集项目卡片 — 数据和顺序来自 portfolio.json */}
            {groups.flatMap((group) =>
              group.projects.map((project) => (
                <PortfolioCard
                  key={project.slug}
                  project={project}
                  previewSrcs={getProjectPreviewSrcs(project)}
                  onClick={() => handleProjectClick(project.slug)}
                />
              )),
            )}
          </div>
        </AnimatedContent>
      </div>
    </div>
  );
}
