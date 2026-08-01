"use client";

// ProjectDetail 页面入口：组合项目导航、展示舞台、顶部/底部控件和浮层。
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getCommentTargetPath,
  hasProjectPage,
  pickLocale,
} from '@/contexts/ProjectContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import DotGrid from '@/effects/DotGrid';
import PortfolioMenu from '@/components/portfolio/PortfolioMenu';
import {
  CommentDrawer,
  ProjectFooter,
  ProjectHeader,
} from './components/ProjectDetailChrome';
import ProjectStage from './components/ProjectStage';
import { useImageRatios, useIsMobile } from './hooks/useProjectMedia';
import { useProjectNavigation } from './hooks/useProjectNavigation';
import { useProjectShortcuts } from './hooks/useProjectShortcuts';

const ProjectBackground = ({ baseColor, activeColor }) => (
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
);

const PrototypePreloader = ({ urls }) =>
  urls.map((url) => (
    <iframe
      key={url}
      src={url}
      aria-hidden="true"
      tabIndex={-1}
      className="absolute w-0 h-0 overflow-hidden border-0 opacity-0 pointer-events-none"
      allow="clipboard-write; storage-access; cross-origin-isolated"
    />
  ));

const MissingProject = ({ onBack }) => (
  <div className="min-h-screen w-full flex items-center justify-center bg-bg">
    <div className="flex flex-col items-center gap-4">
      <p className="font-regular text-[15px] text-tertiary">项目不存在</p>
      <button
        type="button"
        onClick={onBack}
        className="font-regular text-[14px] text-secondary underline underline-offset-4 hover:text-main"
      >
        返回作品集
      </button>
    </div>
  </div>
);

/**
 * L3 项目详情：负责组合导航、舞台和页面 chrome，具体交互下沉到模块 hooks。
 */
const ProjectDetail = ({ slug, initialFrameId = null, initialEnterDir = null }) => {
  const { language } = useLanguage();
  const { baseColor, activeColor } = useThemeColors();
  const isMobile = useIsMobile();
  const navigation = useProjectNavigation({ slug, initialFrameId });
  const {
    project,
    groups,
    neighbors,
    frames,
    visibleTabs,
    preloadUrls,
    activeTab,
    activeIndex,
    menuOpen,
    commentOpen,
    setActiveIndex,
    setMenuOpen,
    setCommentOpen,
    changeTab,
    goProject,
    goPrevPage,
    goNextPage,
    goBack,
    toggleComment,
  } = navigation;
  const imageRatios = useImageRatios(frames);

  useProjectShortcuts({
    visibleTabs,
    neighbors,
    menuOpen,
    commentOpen,
    onTabChange: changeTab,
    onPreviousPage: goPrevPage,
    onNextPage: goNextPage,
    onProjectChange: goProject,
    onBack: goBack,
    onMenuToggle: () => setMenuOpen((previous) => !previous),
    onMenuClose: () => setMenuOpen(false),
    onCommentToggle: toggleComment,
    onCommentClose: () => setCommentOpen(false),
  });

  if (!hasProjectPage(project)) return <MissingProject onBack={goBack} />;

  return (
    <div className="relative h-screen w-full flex flex-col bg-bg overflow-hidden">
      <PrototypePreloader urls={preloadUrls} />
      <ProjectBackground baseColor={baseColor} activeColor={activeColor} />

      <ProjectHeader
        projectTitle={pickLocale(project.title, language)}
        period={project.period}
        visibleTabs={visibleTabs}
        activeTab={activeTab}
        language={language}
        menuOpen={menuOpen}
        isMobile={isMobile}
        groups={groups}
        currentSlug={slug}
        onMenuToggle={() => setMenuOpen((previous) => !previous)}
        onTabChange={changeTab}
        onProjectSelect={(targetSlug) => {
          setMenuOpen(false);
          goProject(targetSlug);
        }}
        onMenuClose={() => setMenuOpen(false)}
      />

      <ProjectStage
        frames={frames}
        activeIndex={activeIndex}
        imageRatios={imageRatios}
        isMobile={isMobile}
        enterDirection={initialEnterDir}
        onActiveIndexChange={setActiveIndex}
        onPreviousPage={goPrevPage}
        onNextPage={goNextPage}
      />

      <ProjectFooter
        framesCount={frames.length}
        activeIndex={activeIndex}
        isMobile={isMobile}
        onSelectFrame={setActiveIndex}
        onBack={goBack}
        onPrevPage={goPrevPage}
        onNextPage={goNextPage}
        onPrevProject={() => neighbors.prev && goProject(neighbors.prev.slug, { motionDir: 'prev' })}
        onNextProject={() => neighbors.next && goProject(neighbors.next.slug, { motionDir: 'next' })}
        onComment={toggleComment}
        onOpenMobileMenu={() => setMenuOpen(true)}
      />

      <CommentDrawer
        open={commentOpen}
        language={language}
        targetPath={getCommentTargetPath(project.slug)}
        onClose={() => setCommentOpen(false)}
      />
      <PortfolioMenu
        open={menuOpen && isMobile}
        onClose={() => setMenuOpen(false)}
        groups={groups}
      />
    </div>
  );
};

export default ProjectDetail;
