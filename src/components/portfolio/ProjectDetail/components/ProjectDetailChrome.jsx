"use client";

// 页面固定控件：包含顶部标题与目录、底部页数轴与快捷栏、评论抽屉。
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import EdgeMask from '@/components/EdgeMask';
import MenuButton from '@/components/MenuButton';
import CommentSection from '@/components/comments/CommentSection';
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
}) => (
  <footer className="absolute inset-x-0 bottom-0 z-20 isolate px-12 md:px-16 pb-12 md:pb-8 pt-2 pointer-events-auto">
    <EdgeMask from="bottom" height="300%" className="md:hidden" />
    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 md:translate-y-[-50%] translate-y-[calc(-50%-12px)]">
      <SlideProgress
        total={framesCount}
        activeIndex={activeIndex}
        onSelect={onSelectFrame}
        interactive={!isMobile}
      />
    </div>

    <div className="hidden md:flex items-center justify-between gap-4">
      <ShortcutBar
        onBack={onBack}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
        onPrevProject={onPrevProject}
        onNextProject={onNextProject}
        onComment={onComment}
      />
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <LanguageToggle />
      </div>
    </div>

    <div className="flex md:hidden items-center justify-between">
      <button
        type="button"
        aria-label="返回作品集"
        onClick={onBack}
        className="text-secondary text-[32px] leading-[80%] hover:opacity-80 transition-opacity duration-200 cursor-pointer font-Ding"
      >
        ←
      </button>
      <MenuButton onClick={onOpenMobileMenu} label="菜单" />
    </div>
  </footer>
);

// 评论抽屉片段：按需挂载当前项目的评论内容。
export const CommentDrawer = ({ open, language, targetPath, onClose }) => (
  <aside
    className={`fixed top-0 right-0 h-full w-full md:w-[380px] bg-card border-l border-stroke z-50 transition-transform duration-300 ease-out flex flex-col ${
      open ? 'translate-x-0' : 'translate-x-full'
    }`}
  >
    <div className="flex items-center justify-between px-5 py-4 border-b border-divider shrink-0">
      <span className="font-Ding text-[16px] leading-[24px] text-main">
        {language === 'en' ? 'Comments' : '评论'}
      </span>
      <button
        type="button"
        aria-label="关闭评论"
        onClick={onClose}
        className="w-7 h-7 rounded-[6px] flex items-center justify-center text-tertiary hover:text-main hover:bg-hover transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path
            d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
    <div className="flex-1 overflow-y-auto">
      {open ? <CommentSection targetPath={targetPath} /> : null}
    </div>
  </aside>
);
