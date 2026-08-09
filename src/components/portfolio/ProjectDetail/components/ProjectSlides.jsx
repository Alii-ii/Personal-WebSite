"use client";

// 项目帧列表：分别渲染桌面端横向幻灯片和移动端纵向内容流。
import FrameRenderer from './FrameRenderer';

const STAGE_SHRINK = 56 / 68;

const getFrameRatio = (frame, imageRatios) => {
  const feedRatio = frame.feed?.w && frame.feed?.h ? frame.feed.w / frame.feed.h : null;
  if (frame.type === 'image') return imageRatios[frame.src] || feedRatio;
  return feedRatio;
};

const getDesktopFrameStyle = ({ frame, ratio, isActive, stageHeight, stageWidth }) => {
  const height = stageHeight ? stageHeight * (isActive ? 1 : STAGE_SHRINK) : 0;
  const maxWidth = stageWidth ? stageWidth * (isActive ? 0.92 : 0.74) : 0;

  if (ratio) {
    const heightBasedWidth = height ? height * ratio : 0;
    return {
      width: `${Math.max(0, Math.min(heightBasedWidth, maxWidth || heightBasedWidth)).toFixed(2)}px`,
      aspectRatio: String(ratio),
    };
  }

  if (frame.type !== 'image') return undefined;
  const fallbackWidth = Math.min(height * 1.6, maxWidth || height * 1.6);
  return height
    ? { height: `${(fallbackWidth / 1.6).toFixed(2)}px`, width: `${fallbackWidth.toFixed(2)}px` }
    : undefined;
};

const DesktopSlides = ({
  frames,
  activeIndex,
  imageRatios,
  stageHeight,
  stageWidth,
  dragging,
  resizeDriven,
  slideRefs,
}) => {
  const stageReady = stageHeight > 0 && stageWidth > 0;
  const activeFrame = frames[activeIndex];
  const activeRatio = activeFrame ? getFrameRatio(activeFrame, imageRatios) : null;

  if (!stageReady) {
    const skeletonStyle = activeRatio
      ? {
          width: `min(92vw, calc((100vh - 148px) * ${activeRatio}))`,
          aspectRatio: String(activeRatio),
        }
      : { width: 'min(92vw, 960px)', aspectRatio: '16 / 10' };

    return (
      <div className="hidden md:flex w-screen items-center justify-center" aria-busy="true">
        <div
          style={skeletonStyle}
          className="relative max-h-[calc(100vh-148px)] overflow-hidden rounded-[12px] bg-card ring-1 ring-stroke shadow-2xl"
          role="status"
          aria-label="内容加载中"
        >
          <div className="absolute inset-0 animate-pulse bg-press" />
          <div className="absolute inset-x-[12%] bottom-[12%] flex flex-col gap-3">
            <div className="h-3 w-2/5 rounded-full bg-divider" />
            <div className="h-3 w-3/5 rounded-full bg-divider" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-6">
      {frames.map((frame, index) => {
        const isActive = index === activeIndex;
        const ratio = getFrameRatio(frame, imageRatios);
        const style = getDesktopFrameStyle({ frame, ratio, isActive, stageHeight, stageWidth });

        return (
          <section
            key={frame.id}
            id={frame.id}
            ref={(node) => {
              slideRefs.current[index] = node;
            }}
            data-frame-index={index}
            style={{
              ...style,
              transitionProperty: resizeDriven
                ? 'opacity, box-shadow'
                : 'all',
            }}
            className={`shrink-0 rounded-[12px] overflow-hidden bg-card ring-1 ring-stroke duration-500 ease-out ${
              dragging ? 'cursor-grabbing' : isActive ? 'cursor-default' : 'cursor-pointer'
            } ${isActive ? 'opacity-100 shadow-2xl' : 'opacity-50 shadow-lg hover:opacity-75'}`}
          >
            <FrameRenderer frame={frame} isActive={isActive} />
          </section>
        );
      })}
    </div>
  );
};

const MobileSlides = ({ frames, imageRatios, slideRefs }) => (
  <div className="w-full flex md:hidden flex-col items-stretch gap-3 px-4 py-4">
    {frames.map((frame, index) => {
      const ratio =
        getFrameRatio(frame, imageRatios) ||
        (frame.feed?.w && frame.feed?.h ? frame.feed.w / frame.feed.h : null);
      const rotatedStyle = ratio ? { aspectRatio: String(1 / ratio) } : undefined;
      const frameStyle = ratio
        ? {
            width: `${ratio * 100}%`,
            height: `${100 / ratio}%`,
          }
        : undefined;

      return (
        <section
          key={frame.id}
          id={frame.id}
          ref={(node) => {
            slideRefs.current[index] = node;
          }}
          data-frame-index={index}
          style={rotatedStyle}
          className={`relative w-full ${ratio ? '' : 'min-h-[40vh]'}`}
        >
          <div
            style={frameStyle}
            className="absolute left-1/2 top-1/2 rounded-[12px] overflow-hidden bg-card ring-1 ring-stroke [transform:translate(-50%,-50%)_rotate(90deg)]"
          >
            <FrameRenderer frame={frame} />
          </div>
        </section>
      );
    })}
  </div>
);

const ProjectSlides = ({
  frames,
  activeIndex,
  imageRatios,
  stageHeight,
  stageWidth,
  dragging,
  resizeDriven,
  desktopSlideRefs,
  mobileSlideRefs,
}) => (
  <>
    <DesktopSlides
      frames={frames}
      activeIndex={activeIndex}
      imageRatios={imageRatios}
      stageHeight={stageHeight}
      stageWidth={stageWidth}
      dragging={dragging}
      resizeDriven={resizeDriven}
      slideRefs={desktopSlideRefs}
    />
    <MobileSlides frames={frames} imageRatios={imageRatios} slideRefs={mobileSlideRefs} />
  </>
);

export default ProjectSlides;
