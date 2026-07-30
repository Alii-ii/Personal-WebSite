"use client";

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocale, getProjectsByCategory } from '@/contexts/ProjectContext';
import CopyEmailButton from '@/components/CopyEmailButton';
import { ChatsIcon, FigmaIcon } from '@/public/icons';
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
 * 侧栏分隔位
 */
const Divider = () => <div className="w-[192px] h-px" aria-hidden="true" />;

/* ────────────────────────────────────────────────────────────────
 * 卡片封面映射：将 project slug 映射到从 Figma 导出的封面图
 * 当前已有的作品集项目封面（来自 Figma REST API 导出）
 * ──────────────────────────────────────────────────────────────── */
const PROJECT_COVERS = {
  'nocode-for-pro': '/images/portfolio/covers/nocode-for-pro.webp',
  'chatgpt-home-buying': '/images/portfolio/covers/chatgpt-home-buying.webp',
  'laolao-service-design': '/images/portfolio/covers/laolao-service-design.webp',
};

/**
 * 获取项目的封面图路径：
 * 1. 优先使用从 Figma 导出的 covers/ 目录
 * 2. 回退到项目第一帧的 src（缩略图）
 */
function getProjectCover(project) {
  if (PROJECT_COVERS[project.slug]) return PROJECT_COVERS[project.slug];
  // 回退：取项目第一帧图片
  const firstImage = (project.frames || []).find(f => f.type === 'image');
  return firstImage?.src || '';
}

/* ────────────────────────────────────────────────────────────────
 * 文章随笔项目列表 — 外部链接 or 未来扩展
 * 从 Figma 设计稿中提取的文章列表数据
 * ──────────────────────────────────────────────────────────────── */
const WRITING_ITEMS = [
  { title: '思考 | Cursor 和 Codex 的交互粒...', href: null },
  { title: '思考 | 个人向 Design Engineer...', href: null },
  { title: '课程 | Spec Coding 与工程师协作...', href: null },
  { title: '课程 | 工程化设计思维', href: null },
  { title: '课程 | AI Coding 入门概览', href: null },
];

/**
 * PortfolioCompact — 精简版作品集页面
 *
 * 匹配 Figma 设计稿（node 11262:4546），适用于当前可展示内容较少的阶段。
 * 布局：左侧 sticky 信息栏（姓名 + 社交 + 项目目录）+ 右侧卡片纵向列表。
 * 第一张卡片为简历封面，点击跳转 /resume；其余为作品集卡片，点击跳转 L3 详情页。
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
    <div className="w-full flex-1 flex flex-col md:flex-row items-start relative z-10">
      {/* ═══════ 左侧信息栏 ═══════ */}
      <aside className="w-full md:w-[360px] shrink-0 self-start">
        <div className="flex flex-col gap-4 px-6 md:px-16 pt-8 md:pt-20 pb-4 md:fixed md:top-0 md:left-0 md:w-[352px] md:h-screen md:overflow-y-auto md:z-10">
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

          {/* 社交图标 — 与 PortfolioSidebar 一致 */}
          <div className="flex items-center gap-1.5">
            <IconButton
              label="Figma"
              onClick={() => window.open('https://www.figma.com/@alii', '_blank')}
            >
              <FigmaIcon className="w-4 h-4" />
            </IconButton>
            <IconButton label="Chats">
              <ChatsIcon className="w-4 h-4" />
            </IconButton>
            <CopyEmailButton appearance="sidebar" />
          </div>

          <Divider />

          {/* 产品项目 */}
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

            {/* 文章随笔 — 静态条目 */}
            <div className="flex flex-col">
              <div className="px-2.5 py-1">
                <span className="font-regular text-[14px] leading-[24px] text-tertiary">
                  文章随笔
                </span>
              </div>
              <div className="flex flex-col gap-0.5 pb-2">
                {WRITING_ITEMS.map((item) => (
                  <div
                    key={item.title}
                    className="w-full flex flex-row items-start gap-1 px-2.5 py-1 rounded-[8px] text-left text-quaternary"
                  >
                    <span className="w-fit font-regular text-[14px] leading-[24px] truncate">
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* ═══════ 右侧卡片列表 ═══════ */}
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
        <div className="w-full flex-1 px-6 md:pr-16 md:pl-0 py-4 md:py-20 flex flex-col gap-5 max-w-[600px]">
          {/* 第一张：简历封面 → /resume */}
          <PortfolioCard
            isResume
            coverSrc="/images/portfolio/covers/resume-cover.webp"
            onClick={() => router.push('/resume')}
          />

          {/* 作品集项目卡片 — 按 order 排列 */}
          {groups.flatMap((group) =>
            group.projects.map((project) => (
              <PortfolioCard
                key={project.slug}
                project={project}
                coverSrc={getProjectCover(project)}
                onClick={() => handleProjectClick(project.slug)}
              />
            )),
          )}
        </div>
      </AnimatedContent>
    </div>
  );
}
