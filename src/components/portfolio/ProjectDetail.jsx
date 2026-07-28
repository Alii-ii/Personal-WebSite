"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import FrameRenderer from '@/components/portfolio/FrameRenderer';
import ProjectMenu from '@/components/portfolio/ProjectMenu';
import ShortcutBar from '@/components/portfolio/ShortcutBar';
import SlideProgress from '@/components/portfolio/SlideProgress';
import CommentSection from '@/components/comments/CommentSection';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getCommentTargetPath,
  getProjectBySlug,
  getProjectNeighbors,
  getProjectsByCategory,
  pickLocale,
} from '@/contexts/ProjectContext';

/**
 * 目录按钮（对应设计稿 32×32 r8）
 */
const MenuButton = ({ onClick, active }) => (
  <button
    type="button"
    aria-label="目录"
    onClick={onClick}
    className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors duration-150 ${
      active ? 'bg-hover text-main' : 'text-secondary hover:bg-hover hover:text-main'
    }`}
  >
    <svg width="21" height="21" viewBox="0 0 21 21">
      <path
        d="M3.5 5.25h14a.75.75 0 0 1 0 1.5h-14a.75.75 0 0 1 0-1.5Zm0 4.5h14a.75.75 0 0 1 0 1.5h-14a.75.75 0 0 1 0-1.5Zm0 4.5h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1 0-1.5Z"
        fill="currentColor"
      />
    </svg>
  </button>
);

/**
 * L3 项目详情
 * 横向滚动的类 PPT 展示：激活页居中放大，两侧页缩小half透明
 * 快捷键：ESC 返回 / ←→ 切换页面 / ↑↓ 切换项目 / C 评论
 *
 * @param {string} slug - 项目标识
 * @param {string} [initialFrameId] - 初始定位的 frame（来自 L2 下钻的 hash）
 */
const ProjectDetail = ({ slug, initialFrameId }) => {
  const router = useRouter();
  const { language } = useLanguage();

  const project = useMemo(() => getProjectBySlug(slug), [slug]);
  const groups = useMemo(() => getProjectsByCategory(), []);
  const neighbors = useMemo(() => getProjectNeighbors(slug), [slug]);

  const [activeTab, setActiveTab] = useState(project?.tabs?.[0]?.key ?? null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);

  // 当前 tab 下的 frame 列表
  const frames = useMemo(() => {
    if (!project) return [];
    const all = project.frames || [];
    return activeTab ? all.filter((frame) => frame.tab === activeTab) : all;
  }, [project, activeTab]);

  // 用 ref 供键盘回调读取最新值，避免闭包捕获旧状态
  const stateRef = useRef({});
  stateRef.current = {
    frames,
    activeIndex,
    neighbors,
    commentOpen,
    menuOpen,
    tabs: project?.tabs || [],
  };

  // 横向轨道：实测每页宽度，把激活页精确居中
  const viewportRef = useRef(null);
  const slideRefs = useRef([]);
  const [trackOffset, setTrackOffset] = useState(0);

  useEffect(() => {
    const measure = () => {
      const viewport = viewportRef.current;
      const active = slideRefs.current[activeIndex];
      if (!viewport || !active) return;
      // 激活页中心对齐视口中心
      const centered =
        viewport.clientWidth / 2 - (active.offsetLeft + active.offsetWidth / 2);
      setTrackOffset(centered);
    };

    // 等待宽高过渡后的布局稳定再测量
    const raf = requestAnimationFrame(measure);
    const timer = setTimeout(measure, 520);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener('resize', measure);
    };
  }, [activeIndex, frames]);

  // 从 L2 下钻进来时，定位到对应 frame（并切到它所属的 tab）
  useEffect(() => {
    if (!initialFrameId || !project) return;
    const target = (project.frames || []).find((frame) => frame.id === initialFrameId);
    if (!target) return;
    setActiveTab(target.tab);
    const list = (project.frames || []).filter((frame) => frame.tab === target.tab);
    const index = list.findIndex((frame) => frame.id === initialFrameId);
    if (index >= 0) setActiveIndex(index);
  }, [initialFrameId, project]);

  // 切换 tab 时回到第一页
  const handleTabChange = useCallback((tabKey) => {
    setActiveTab(tabKey);
    setActiveIndex(0);
  }, []);

  const goPrevPage = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const goNextPage = useCallback(() => {
    const total = stateRef.current.frames.length;
    setActiveIndex((prev) => (prev < total - 1 ? prev + 1 : prev));
  }, []);

  const goProject = useCallback(
    (targetSlug) => {
      if (targetSlug) router.push(`/portfolio/${targetSlug}`);
    },
    [router]
  );

  const goBack = useCallback(() => router.push('/portfolio'), [router]);
  const toggleComment = useCallback(() => setCommentOpen((prev) => !prev), []);

  // 拖拽切页：按下拖动，松手时按位移方向与阈值决定翻页
  const dragRef = useRef({ active: false, startX: 0, dx: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const handlePointerDown = useCallback((event) => {
    // 仅左键 / 触摸
    if (event.button !== undefined && event.button !== 0) return;
    dragRef.current = { active: true, startX: event.clientX, dx: 0 };
    setDragging(true);
  }, []);

  const handlePointerMove = useCallback((event) => {
    if (!dragRef.current.active) return;
    const dx = event.clientX - dragRef.current.startX;
    dragRef.current.dx = dx;
    setDragOffset(dx);
  }, []);

  // 拖动超过阈值时标记，用于抵消紧随其后的 click（避免拖拽被当成点选卡片）
  const suppressClickRef = useRef(false);

  const handlePointerUp = useCallback(() => {
    if (!dragRef.current.active) return;
    const { dx } = dragRef.current;
    dragRef.current = { active: false, startX: 0, dx: 0 };
    setDragging(false);
    setDragOffset(0);

    if (Math.abs(dx) > 6) {
      suppressClickRef.current = true;
      setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }

    // 阈值 60px：向左拖看下一页，向右拖看上一页
    if (dx <= -60) goNextPage();
    else if (dx >= 60) goPrevPage();
  }, [goNextPage, goPrevPage]);

  // 指针移出窗口也要收尾，避免卡在拖拽态
  useEffect(() => {
    if (!dragging) return;
    const onUp = () => handlePointerUp();
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [dragging, handlePointerUp]);

  // 全局快捷键
  useEffect(() => {
    const handleKeyDown = (event) => {
      // 输入态不劫持按键
      const tag = event.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target?.isContentEditable) return;

      const { neighbors: nb, commentOpen: isCommentOpen, menuOpen: isMenuOpen } =
        stateRef.current;

      // alt + 数字切换 tab：不与固定 tab 绑定，而是与「从右往左数」的顺位绑定
      // 最右侧 tab 对应 0，往左依次 9、8、7…
      // macOS 上 Alt+数字会产生特殊字符，故用 event.code 而非 event.key
      if (event.altKey) {
        const match = /^Digit([0-9])$/.exec(event.code || '');
        if (match) {
          const tabs = stateRef.current.tabs || [];
          if (tabs.length <= 1) return;
          // 0→倒数第1，9→倒数第2，8→倒数第3 …（键盘上从 0 往左依次对应）
          const digit = Number(match[1]);
          const fromRight = digit === 0 ? 1 : 11 - digit;
          const index = tabs.length - fromRight;
          if (index >= 0 && index < tabs.length) {
            event.preventDefault();
            handleTabChange(tabs[index].key);
          }
          return;
        }
      }

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          // 逐层退出：评论 → 菜单 → 返回作品墙
          if (isCommentOpen) setCommentOpen(false);
          else if (isMenuOpen) setMenuOpen(false);
          else router.push('/portfolio');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          goPrevPage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goNextPage();
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (nb.prev) goProject(nb.prev.slug);
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (nb.next) goProject(nb.next.slug);
          break;
        case 'c':
        case 'C':
          // 与 ThemeToggle 的 Shift+C 区分，避免误触
          if (event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) return;
          event.preventDefault();
          setCommentOpen((prev) => !prev);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [router, goPrevPage, goNextPage, goProject, handleTabChange]);

  if (!project) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4">
          <p className="font-regular text-[15px] text-tertiary">项目不存在</p>
          <button
            type="button"
            onClick={() => router.push('/portfolio')}
            className="font-regular text-[14px] text-secondary underline underline-offset-4 hover:text-main"
          >
            返回作品集
          </button>
        </div>
      </div>
    );
  }

  const projectTitle = pickLocale(project.title, language);
  const targetPath = getCommentTargetPath(project.slug);

  return (
    <div className="h-screen w-full flex flex-col bg-bg overflow-hidden">
      {/* 顶部：目录按钮 + 标题 + tabs */}
      <header className="relative shrink-0 px-6 md:px-16 pt-6 md:pt-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <MenuButton onClick={() => setMenuOpen((prev) => !prev)} active={menuOpen} />
            <h1 className="font-Ding text-[20px] md:text-[24px] leading-[31px] text-main truncate">
              {projectTitle}
            </h1>
            <span className="font-regular text-[14px] md:text-[16px] leading-[24px] text-tertiary shrink-0">
              {project.period}
            </span>
          </div>

          {/* tabs：有则显示，无（或仅一个）则隐藏 */}
          {project.tabs?.length > 1 ? (
            <nav className="hidden md:flex items-center gap-1 shrink-0">
              {project.tabs.map((tab, index) => {
                // 快捷键与「从右往左数」的顺位绑定：最右 alt+0，往左 alt+9、alt+8…
                const fromRight = project.tabs.length - index;
                const digit = fromRight === 1 ? 0 : 11 - fromRight;
                return (
                  <div key={tab.key} className="flex items-center gap-1">
                    {index > 0 ? (
                      <span className="font-regular text-[16px] leading-[24px] text-tertiary">
                        /
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => handleTabChange(tab.key)}
                      title={`Alt + ${digit}`}
                      className={`px-3 py-1 rounded-[8px] font-regular text-[16px] leading-[24px] transition-colors duration-150 ${
                        activeTab === tab.key
                          ? 'text-main'
                          : 'text-tertiary hover:text-secondary'
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

        {/* 菜单浮层：默认收起 */}
        <div className="absolute top-[60px] left-6 md:left-16">
          <ProjectMenu
            groups={groups}
            currentSlug={slug}
            open={menuOpen}
            onSelect={(targetSlug) => {
              setMenuOpen(false);
              goProject(targetSlug);
            }}
            onClose={() => setMenuOpen(false)}
          />
        </div>
      </header>

      {/* 主体：横向 PPT 滚动（激活页居中放大，两侧页缩小半透明）
           移动端：纵向排列，无虚化，无大小变化 */}
      <main
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`flex-1 min-h-0 flex items-center overflow-hidden touch-pan-y ${
          dragging ? 'cursor-grabbing select-none' : 'cursor-grab'
        }`}
      >
        <div
          className={`flex items-center gap-6 will-change-transform ${
            dragging ? '' : 'transition-transform duration-500 ease-out'
          }`}
          style={{ transform: `translateX(${trackOffset + dragOffset}px)` }}
        >
          {/* PC 端横向滚动 */}
          <div className="hidden md:flex items-center gap-6">
            {frames.map((frame, index) => {
              const isActive = index === activeIndex;
              return (
                <section
                  key={frame.id}
                  id={frame.id}
                  ref={(node) => {
                    slideRefs.current[index] = node;
                  }}
                  onClick={() => {
                    if (suppressClickRef.current) return;
                    setActiveIndex(index);
                  }}
                  className={`shrink-0 rounded-[12px] overflow-hidden bg-card border border-stroke cursor-pointer transition-all duration-500 ease-out ${
                    isActive
                      ? 'w-[68vw] h-[68vh] opacity-100 shadow-2xl'
                      : 'w-[56vw] h-[56vh] opacity-50 shadow-lg hover:opacity-75'
                  }`}
                >
                  <FrameRenderer frame={frame} />
                </section>
              );
            })}
          </div>

          {/* 移动端纵向排列 */}
          <div className="flex md:hidden flex-col items-center gap-4 px-4 py-4">
            {frames.map((frame, index) => {
              const isActive = index === activeIndex;
              return (
                <section
                  key={frame.id}
                  id={frame.id}
                  ref={(node) => {
                    slideRefs.current[index] = node;
                  }}
                  onClick={() => {
                    if (suppressClickRef.current) return;
                    setActiveIndex(index);
                  }}
                  className={`w-full rounded-[12px] overflow-hidden bg-card border border-stroke cursor-pointer ${
                    isActive ? 'opacity-100' : 'opacity-40'
                  }`}
                  style={{ minHeight: '45vh' }}
                >
                  <FrameRenderer frame={frame} />
                </section>
              );
            })}
          </div>
        </div>
      </main>

      {/* 底部：快捷键 + 主题/语言 */}
      <footer className="relative shrink-0 px-6 md:px-16 pb-6 md:pb-8 pt-2">
        {/* 页数轴：absolute 居中于 footer，移动端保持原有展示策略 */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <SlideProgress
            total={frames.length}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <ShortcutBar
            onBack={goBack}
            onPrevPage={goPrevPage}
            onNextPage={goNextPage}
            onPrevProject={() => neighbors.prev && goProject(neighbors.prev.slug)}
            onNextProject={() => neighbors.next && goProject(neighbors.next.slug)}
            onComment={toggleComment}
          />

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </footer>

      {/* 评论抽屉：C 键唤起，不遮挡 slide 主体 */}
      <aside
        className={`fixed top-0 right-0 h-full w-full md:w-[380px] bg-card border-l border-stroke z-50 transition-transform duration-300 ease-out flex flex-col ${
          commentOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-divider shrink-0">
          <span className="font-Ding text-[16px] leading-[24px] text-main">
            {language === 'en' ? 'Comments' : '评论'}
          </span>
          <button
            type="button"
            aria-label="关闭评论"
            onClick={() => setCommentOpen(false)}
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
          {commentOpen ? <CommentSection targetPath={targetPath} /> : null}
        </div>
      </aside>
    </div>
  );
};

export default ProjectDetail;
