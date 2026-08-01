"use client";

import FrameRenderer from '@/components/portfolio/FrameRenderer';

const STAGE_SHRINK = 56 / 68;

const getFrameRatio = (frame, imageRatios) => {
  if (frame.type === 'image') return imageRatios[frame.src];
  return frame.feed?.w && frame.feed?.h ? frame.feed.w / frame.feed.h : null;
};

const getDesktopFrameStyle = ({ frame, ratio, isActive, stageHeight }) => {
  const height = stageHeight ? stageHeight * (isActive ? 1 : STAGE_SHRINK) : 0;
  const viewportWidth = isActive ? 92 : 74;

  if (ratio) {
    if (height) {
      return {
        width: `min(${(height * ratio).toFixed(2)}px, ${viewportWidth}vw)`,
        aspectRatio: String(ratio),
      };
    }
    return {
      width: `min(${((isActive ? 68 : 56) * ratio).toFixed(4)}vh, ${viewportWidth}vw)`,
      aspectRatio: String(ratio),
    };
  }

  if (frame.type !== 'image') return undefined;
  return height
    ? { height: `${height.toFixed(2)}px`, width: `${(height * 1.6).toFixed(2)}px` }
    : { height: '68vh', width: '108.8vh' };
};

const DesktopSlides = ({ frames, activeIndex, imageRatios, stageHeight, dragging, slideRefs }) => (
  <div className="hidden md:flex items-center gap-6">
    {frames.map((frame, index) => {
      const isActive = index === activeIndex;
      const ratio = getFrameRatio(frame, imageRatios);
      const style = getDesktopFrameStyle({ frame, ratio, isActive, stageHeight });

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
          } ${isActive ? 'opacity-100 shadow-2xl' : 'opacity-50 shadow-lg hover:opacity-75'} ${
            ratio ? '' : isActive ? 'w-[68vw] h-[68vh]' : 'w-[56vw] h-[56vh]'
          }`}
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
      const ratio = frame.type === 'image' ? imageRatios[frame.src] : null;
      return (
        <section
          key={frame.id}
          id={frame.id}
          ref={(node) => {
            slideRefs.current[index] = node;
          }}
          data-frame-index={index}
          style={ratio ? { aspectRatio: String(ratio) } : undefined}
          className={`w-full rounded-[12px] overflow-hidden bg-card ring-1 ring-stroke ${
            ratio ? '' : 'min-h-[40vh]'
          }`}
        >
          <FrameRenderer frame={frame} />
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
      dragging={dragging}
      slideRefs={desktopSlideRefs}
    />
    <MobileSlides frames={frames} imageRatios={imageRatios} slideRefs={mobileSlideRefs} />
  </>
);

export default ProjectSlides;
