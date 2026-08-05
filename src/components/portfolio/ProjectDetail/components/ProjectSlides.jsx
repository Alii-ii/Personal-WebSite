"use client";

// 项目帧列表：分别渲染桌面端横向幻灯片和移动端纵向内容流。
import FrameRenderer from './FrameRenderer';

const STAGE_SHRINK = 56 / 68;

const getFrameRatio = (frame, imageRatios) => {
  if (frame.type === 'image') return imageRatios[frame.src];
  return frame.feed?.w && frame.feed?.h ? frame.feed.w / frame.feed.h : null;
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

const DesktopSlides = ({ frames, activeIndex, imageRatios, stageHeight, stageWidth, dragging, slideRefs }) => (
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
          style={style}
          className={`shrink-0 rounded-[12px] overflow-hidden bg-card ring-1 ring-stroke transition-all duration-500 ease-out ${
            dragging ? 'cursor-grabbing' : isActive ? 'cursor-default' : 'cursor-pointer'
          } ${isActive ? 'opacity-100 shadow-2xl' : 'opacity-50 shadow-lg hover:opacity-75'}`}
        >
          <FrameRenderer frame={frame} />
        </section>
      );
    })}
  </div>
);

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
      slideRefs={desktopSlideRefs}
    />
    <MobileSlides frames={frames} imageRatios={imageRatios} slideRefs={mobileSlideRefs} />
  </>
);

export default ProjectSlides;
