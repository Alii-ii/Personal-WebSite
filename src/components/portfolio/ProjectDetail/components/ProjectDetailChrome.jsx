"use client";

// 页面固定控件：包含顶部标题与目录、底部页数轴与快捷栏、评论抽屉。
import { useEffect, useRef, useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import EdgeMask from '@/components/EdgeMask';
import MenuButton from '@/components/MenuButton';
import CommentSection from '@/components/comments/CommentSection';
import { EASE_OUT_CSS } from '@/lib/ease';
import { CloseFillIcon } from '@/public/icons';
import ProjectMenu from './ProjectMenu';
import ShortcutBar from './ShortcutBar';
import SlideProgress from './SlideProgress';
import { pickLocale } from '@/contexts/ProjectContext';

// 顶部栏片段：项目目录入口、标题、周期和 tab 切换。
export const ProjectHeader = ({
  projectTitle,
  period,
  visibleTabs,
  activeTab,
  language,
  menuOpen,
  isMobile,
  groups,
  currentSlug,
  onMenuToggle,
  onTabChange,
  onProjectSelect,
  onMenuClose,
}) => (
  <header className="absolute inset-x-0 top-0 z-20 isolate px-6 md:px-16 pt-6 md:pt-8 pb-2 pointer-events-auto">
    <EdgeMask from="top" className="md:hidden" />
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <MenuButton
          onClick={onMenuToggle}
          active={menuOpen}
          label="目录"
          tooltip="目录"
          shortcut="⌘/"
          className="relative z-50"
        />
        <h1 className="font-Ding text-[20px] md:text-[24px] leading-[31px] text-main truncate">
          {projectTitle}
        </h1>
        <span className="font-regular text-[14px] md:text-[16px] leading-[24px] text-tertiary shrink-0">
          {period}
        </span>
      </div>

      {visibleTabs.length > 1 ? (
        <nav className="hidden md:flex items-center gap-1 shrink-0">
          {visibleTabs.map((tab, index) => {
            const fromRight = visibleTabs.length - index;
            const digit = fromRight === 1 ? 0 : 11 - fromRight;
            return (
              <div key={tab.key} className="flex items-center gap-1">
                {index > 0 ? <span className="font-regular text-[16px] leading-[24px] text-tertiary">/</span> : null}
                <button
                  type="button"
                  onClick={() => onTabChange(tab.key)}
                  title={`Alt + ${digit}`}
                  className={`px-3 py-1 rounded-[8px] font-regular text-[16px] leading-[24px] transition-colors duration-150 ${
                    activeTab === tab.key ? 'text-main' : 'text-tertiary hover:text-secondary'
                  }`}
                >
                  {pickLocale(tab.label, language)}
                </button>
              </div>
            );
          })}
        </nav>
      ) : null}
    </div>

    <div className="hidden md:block absolute top-[60px] left-6 md:left-16">
      <ProjectMenu
        groups={groups}
        currentSlug={currentSlug}
        open={menuOpen && !isMobile}
        onSelect={onProjectSelect}
        onClose={onMenuClose}
      />
    </div>
  </header>
);

// 底部栏片段：页数轴（SlideProgress）、翻页/切项目快捷栏、主题与语言开关。
export const ProjectFooter = ({
  framesCount,
  activeIndex,
  isMobile,
  onSelectFrame,
  onBack,
  onPrevPage,
  onNextPage,
  onPrevProject,
  onNextProject,
  onComment,
  onOpenMobileMenu,
  labels,
}) => {
  const desktopRowRef = useRef(null);
  const progressRef = useRef(null);
  const controlsRef = useRef(null);
  const [shortcutWidth, setShortcutWidth] = useState(0);

  useEffect(() => {
    const desktopRow = desktopRowRef.current;
    const progress = progressRef.current;
    const controls = controlsRef.current;
    if (!desktopRow || !progress || !controls) return undefined;

    const measure = () => {
      const rowRect = desktopRow.getBoundingClientRect();
      const progressRect = progress.getBoundingClientRect();
      const controlsRect = controls.getBoundingClientRect();
      const safeGap = 16;
      const beforeProgress = progressRect.left - rowRect.left - safeGap;
      const beforeControls = controlsRect.left - rowRect.left - safeGap;
      // 左栏是 Footer 的 flex item，右侧控制组也必须从可分配宽度中扣除；
      // 进度条的左边界则是更严格的视觉安全线。
      const flexAllocation = rowRect.width - controlsRect.width - safeGap;
      const nextWidth = Math.max(
        0,
        Math.min(beforeProgress, beforeControls, flexAllocation)
      );

      setShortcutWidth((previous) =>
        Math.abs(previous - nextWidth) < 0.5 ? previous : nextWidth
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(desktopRow);
    observer.observe(progress);
    observer.observe(controls);
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [framesCount]);

  return (
    <footer className="absolute inset-x-0 bottom-0 z-20 isolate px-12 md:px-16 pb-12 md:pb-8 pt-2 pointer-events-auto">
      <EdgeMask from="bottom" height="300%" className="md:hidden" />

      <div
        ref={progressRef}
        className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 md:translate-y-[calc(-50%-10px)] translate-y-[calc(-50%-20px)]"
      >
        <SlideProgress
          total={framesCount}
          activeIndex={activeIndex}
          onSelect={onSelectFrame}
          interactive={!isMobile}
        />
      </div>

      <div ref={desktopRowRef} className="hidden md:flex items-center justify-between gap-4">
        <ShortcutBar
          availableWidth={shortcutWidth}
          onBack={onBack}
          onPrevPage={onPrevPage}
          onNextPage={onNextPage}
          onPrevProject={onPrevProject}
          onNextProject={onNextProject}
          onComment={onComment}
        />
        <div ref={controlsRef} className="flex shrink-0 items-center gap-3">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>

      <div className="flex md:hidden items-center justify-between">
        <button
          type="button"
          aria-label={labels.back}
          onClick={onBack}
          className="text-secondary text-[32px] leading-[80%] hover:opacity-80 transition-opacity duration-200 cursor-pointer font-Ding"
        >
          ←
        </button>
        <MenuButton onClick={onOpenMobileMenu} label={labels.menu} />
      </div>
    </footer>
  );
};

// 评论侧栏与主页面同处横向 flex；桌面端展开后固定占据 360px。
export const CommentDrawer = ({ open, targetPath, onClose, labels }) => (
  <aside
    aria-hidden={!open}
    aria-label={labels.drawer}
    className={`relative z-0 min-w-0 self-stretch overflow-hidden transition-[width,opacity] duration-[420ms] md:flex-none ${
      open
        ? 'w-full opacity-100 md:w-[360px]'
        : 'pointer-events-none w-0 opacity-0'
    }`}
    style={{ transitionTimingFunction: EASE_OUT_CSS }}
  >
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-transparent p-4 pl-5 md:w-[360px]">
      <button
        type="button"
        aria-label={labels.close}
        onClick={onClose}
        className="absolute right-3 top-3 z-30 flex size-6 items-center justify-center rounded-[6px] text-tertiary transition-colors duration-150 hover:bg-hover hover:text-main"
        style={{ transitionTimingFunction: EASE_OUT_CSS }}
      >
        <CloseFillIcon />
      </button>
      {open ? <CommentSection key={targetPath} targetPath={targetPath} /> : null}
    </div>
  </aside>
);
