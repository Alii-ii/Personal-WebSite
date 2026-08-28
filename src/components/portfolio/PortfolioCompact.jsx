"use client";

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocale, getProjectsByCategory, hasProjectPage } from '@/contexts/ProjectContext';
import CopyEmailButton from '@/components/CopyEmailButton';
import IconTextButton from '@/components/icon-text-botton';
import { ActionSwapIcon } from '@/components/motion/action-swap';
import { ChatsIcon, CheckIcon, FigmaIcon, BilibiliIcon, ChevronDownIcon, DownloadIcon, XiaohongshuIcon } from '@/public/icons';
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
 * 复制文本到剪贴板，失败时回退到 execCommand。
 */
const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * 获取项目的预览图路径数组 — 按 frames 顺序取前 N 张图片
 * 用于卡片多层叠放预览：[0] 最前层, [1] 第2层, [2] 第3层, [3] 第4层
 */
function getProjectPreviewSrcs(project, count = 4) {
  const images = (project.frames || []).filter((f) => f.type === 'image');
  return images.slice(0, count).map((f) => f.src);
}

/**
 * 文章随笔 — 真实飞书文章外链（3 篇）+ 预告内容（2 篇）
 * 标题严格按照文档名称，点击直接跳转外链
 */
export const WRITING_ITEMS = [
  {
    title: { zh: 'Spec Coding 与工程师协作艺术', en: 'The Art of Spec Coding with Engineers' },
    url: 'https://my.feishu.cn/docx/MyY4d4Zbfo575Xx8XIRcogSHnIh',
  },
  {
    title: { zh: '设计师 AI Coding 入门概览', en: 'AI Coding Overview for Designers' },
    url: 'https://my.feishu.cn/docx/CEfMdfpdfoQTK0xMElmcyC5gnCn',
  },
  {
    title: { zh: '工程化设计思维', en: 'Engineering-Minded Design Thinking' },
    url: 'https://my.feishu.cn/docx/YZcIdsLzpojD1mx9KuqcG8dHn8f',
  },
  {
    title: { zh: '个人向 Design Engineer 工作流思考', en: 'Personal Design Engineer Workflow Reflections' },
    disabled: true,
  },
  {
    title: { zh: 'Codex & Cursor 的信任设计与交互粒度差异', en: 'Trust Design & Interaction Granularity: Codex vs Cursor' },
    disabled: true,
  },
];

/**
 * 构建目录 sections 数据 — sidebar 和 PortfolioMenu 共享
 * @param {Array} groups - getProjectsByCategory() 结果
 * @param {string} language - 当前语言
 * @param {Function} t - i18n 翻译函数
 * @param {boolean} includeDisabled - 是否包含禁用态条目（L2=true, L3=false）
 */
export function buildNavSections(groups, language, t, includeDisabled = true) {
  const filterDisabled = (items) => includeDisabled ? items : items.filter((i) => !i.disabled);

  return [
    ...groups.map((group) => {
      const items = filterDisabled(group.projects.map((p) => {
        const disabled = !hasProjectPage(p);
        return {
          key: p.slug,
          label: pickLocale(p.title, language),
          meta: p.period,
          href: `/portfolio/${p.slug}`,
          external: false,
          disabled,
        };
      }));
      return { key: group.key, label: pickLocale(group.label, language), items };
    }),
    ...(WRITING_ITEMS.length > 0 ? [{
      key: '__writing',
      label: t('writing'),
      items: filterDisabled(WRITING_ITEMS.map((item, idx) => ({
        key: `writing-${idx}`,
        label: pickLocale(item.title, language),
        href: item.url || '#',
        external: !item.disabled,
        disabled: !!item.disabled,
      }))),
    }] : []),
    {
      key: '__side-project',
      label: t('sideProject'),
      items: [{
        key: 'vibe-writing',
        label: 'Cursor for Documentation',
        href: 'https://vibe-writing.mynocode.host',
        external: true,
        disabled: false,
      }],
    },
  ];
}

/**
 * PortfolioCompact — 精简版作品集页面
 *
 * 双栏作品集布局：
 *   整体内容最大宽度 1080px，左侧固定信息栏，右侧卡片自适应占满剩余空间
 *   左侧展示姓名、社交入口与分组目录，右侧按时间顺序纵向排列大图卡片
 *   第一张卡片为简历封面 → /resume
 *   后续为作品集卡片 → /portfolio/[slug]
 */
export default function PortfolioCompact() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const groups = useMemo(() => getProjectsByCategory(), []);
  const [isProductProjectsExpanded, setIsProductProjectsExpanded] = useState(false);
  const [isWritingExpanded, setIsWritingExpanded] = useState(false);
  const [isWechatCopied, setIsWechatCopied] = useState(false);
  const [isWechatTooltipOpen, setIsWechatTooltipOpen] = useState(false);

  const handleProjectClick = useCallback(
    (slug) => router.push(`/portfolio/${slug}`),
    [router],
  );

  const handleWechatCopy = useCallback(async () => {
    const success = await copyToClipboard('_Alii_');
    if (!success) {
      console.error(t('copyFailed'));
      return;
    }

    setIsWechatCopied(true);
    setIsWechatTooltipOpen(true);
    window.setTimeout(() => {
      setIsWechatCopied(false);
      setIsWechatTooltipOpen(false);
    }, 500);
  }, [t]);

  return (
    <div className="w-full flex-1 flex justify-center relative z-10">
      {/* 居中容器，最大宽度对齐 Figma 1440px 画板 */}
      <div className="w-full max-w-[1080px] flex flex-col md:flex-row items-start px-6 md:px-0">
        
        {/* ═══════ 左侧信息栏（移动端隐藏，移入菜单） ═══════ */}
        <aside className="hidden md:block md:w-[240px] shrink-0 self-start">
          <div className="flex flex-col gap-4 pt-8 md:pt-[80px] pb-4 md:fixed md:top-0 md:left-0 md:w-[240px] md:ml-[max(64px,calc((100vw-1080px)/2))] md:h-screen md:z-10">
            {/* 姓名 */}
            <div className="flex flex-col gap-2">
              <h1 className="font-Ding text-[40px] md:text-[64px] leading-[1] text-main opacity-80">
                黄奕礼
              </h1>
              <p className="font-Ding text-[16px] leading-[1] text-main opacity-80">
                Alii / 阿礼
              </p>
            </div>

            <Divider />

            {/* 社交图标 — 匹配 Figma icons 区域 */}
            <div className="flex items-center gap-1.5">
              <IconTextButton
                text="下载PDF"
                icon={<DownloadIcon />}
                variant="default"
                size="sm"
                tooltip="下载简历 PDF"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = '/resume/resume-zh.pdf';
                  link.download = '【简历】产品设计-黄奕礼.pdf';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              />
              <IconButton
                label="Figma"
                onClick={() => window.open('https://www.figma.com/@alii', '_blank')}
              >
                <FigmaIcon className="w-4 h-4" />
              </IconButton>
              <IconButton
                label="Bilibili"
                onClick={() => window.open('https://space.bilibili.com/38773851/upload/video', '_blank')}
              >
                <BilibiliIcon className="w-4 h-4" />
              </IconButton>
              <IconButton
                label="小红书"
                onClick={() => window.open('https://www.xiaohongshu.com/user/profile/60877ccc000000000101c324', '_blank')}
              >
                <XiaohongshuIcon className="w-4 h-4" />
              </IconButton>
              <IconTextButton
                text=""
                icon={
                  <ActionSwapIcon value={isWechatCopied ? 'copied' : 'idle'} animation="blur">
                    {isWechatCopied ? <CheckIcon /> : <ChatsIcon />}
                  </ActionSwapIcon>
                }
                variant="ghost"
                size="sm"
                tooltip={isWechatCopied ? t('wechatCopied') : t('wechatTooltip')}
                forceTooltipOpen={isWechatTooltipOpen}
                aria-label={isWechatCopied ? t('wechatCopied') : t('wechatTooltip')}
                className="text-secondary hover:text-main grayscale hover:grayscale-0"
                onClick={handleWechatCopy}
              />
              <CopyEmailButton appearance="sidebar" />
            </div>

            <Divider />

            {/* 项目目录 + 文章随笔 + 独立开发 — 共享 buildNavSections */}
            <nav className="flex flex-col gap-1.5 ml-[-6px]">
              {buildNavSections(groups, language, t).map((section) => {
                const isProductSection = section.key === 'product';
                const isWritingSection = section.key === '__writing';
                const isSectionExpanded = isProductSection
                  ? isProductProjectsExpanded
                  : isWritingSection && isWritingExpanded;
                const canToggle = (isProductSection && section.items.length > 3)
                  || (isWritingSection && section.items.some((item) => item.disabled));
                const visibleItems = isProductSection && !isProductProjectsExpanded
                  ? section.items.slice(0, 3)
                  : isWritingSection && !isWritingExpanded
                    ? section.items.filter((item) => !item.disabled)
                    : section.items;

                return (
                  <div key={section.key} className="flex flex-col">

                    {/* 标题 */}
                    <div className="px-2.5 py-1">
                      <span className="font-regular text-[13px] leading-[20px] text-tertiary">
                        {section.label}
                      </span>
                    </div>

                    {/* 选项 */}
                    <div className="flex flex-col gap-1 pb-4">
                      <AnimatePresence initial={false}>
                        {visibleItems.map((item) => (
                          <motion.div
                            key={item.key}
                            initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            {item.external ? (
                              <a
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-between gap-3 px-2.5 py-1 rounded-[8px] text-left transition-colors duration-150 hover:bg-hover"
                              >
                                <span className="min-w-0 flex-1 font-regular text-[14px] leading-[24px] text-main truncate">
                                  {item.label}
                                </span>
                                {item.meta && (
                                  <span className="shrink-0 font-regular text-[13px] leading-[20px] text-tertiary opacity-50">
                                    {item.meta}
                                  </span>
                                )}
                              </a>
                            ) : (
                              <button
                                type="button"
                                disabled={item.disabled}
                                onClick={item.disabled ? undefined : () => handleProjectClick(item.href.replace('/portfolio/', ''))}
                                className={`w-full flex items-center justify-between gap-3 px-2.5 py-1 rounded-[8px] text-left transition-colors duration-150 ${item.disabled ? 'cursor-default' : 'hover:bg-hover'}`}
                              >
                                <span className={`min-w-0 flex-1 font-regular text-[14px] leading-[24px] truncate ${item.disabled ? 'text-disabled' : 'text-main'}`}>
                                  {item.label}
                                </span>
                                {item.meta && (
                                  <span className="shrink-0 font-regular text-[13px] leading-[20px] text-tertiary opacity-50">
                                    {item.meta}
                                  </span>
                                )}
                              </button>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {canToggle && (
                        <button
                          type="button"
                          aria-label={`${isSectionExpanded ? '收起' : '展开'}${isProductSection ? '产品项目' : '文章随笔预告'}`}
                          aria-expanded={isSectionExpanded}
                          onClick={() => {
                            if (isProductSection) {
                              setIsProductProjectsExpanded((expanded) => !expanded);
                            } else {
                              setIsWritingExpanded((expanded) => !expanded);
                            }
                          }}
                          className="w-full h-8 flex items-center justify-start px-2 rounded-[8px] text-tertiary transition-colors duration-150 hover:text-secondary hover:bg-hover"
                        >
                          <ChevronDownIcon
                            width={16}
                            height={16}
                            className={`transition-transform duration-200 ${isSectionExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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
          className="w-full flex-1 min-w-0 md:mr-[64px] m-0"
        >
          {/* 卡片组容器 — 纵向单列，保持紧凑但有呼吸感 */}
          <div
            className="w-full flex-1 py-4 md:py-[80px] flex flex-col gap-6"
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
              group.projects.map((project) => {
                const disabled = !hasProjectPage(project);
                return (
                  <PortfolioCard
                    key={project.slug}
                    project={project}
                    disabled={disabled}
                    previewSrcs={getProjectPreviewSrcs(project)}
                    onClick={disabled ? undefined : () => handleProjectClick(project.slug)}
                  />
                );
              }),
            )}
          </div>
        </AnimatedContent>
      </div>
    </div>
  );
}
