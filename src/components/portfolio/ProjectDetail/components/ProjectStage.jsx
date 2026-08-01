"use client";

import ProjectSlides from './ProjectSlides';
import { useProjectTrack } from '../hooks/useProjectTrack';
import { useSlideDrag } from '../hooks/useSlideDrag';

const ProjectStage = ({
  frames,
  activeIndex,
  imageRatios,
  isMobile,
  enterDirection,
  onActiveIndexChange,
  onPreviousPage,
  onNextPage,
}) => {
  const {
    viewportRef,
    trackRef,
    desktopSlideRefs,
    mobileSlideRefs,
    stageHeight,
    trackOffset,
    disableTrackTransition,
  } = useProjectTrack({
    activeIndex,
    frames,
    imageRatios,
    isMobile,
    enterDirection,
    onActiveIndexChange,
  });
  const { dragging, dragOffset, pointerHandlers } = useSlideDrag({
    onSelect: onActiveIndexChange,
    onPrevious: onPreviousPage,
    onNext: onNextPage,
  });

  return (
    <main
      ref={viewportRef}
      {...pointerHandlers}
      className={`flex-1 min-h-0 flex items-start md:items-center touch-pan-y pt-[72px] pb-[76px] overflow-y-auto overflow-x-hidden md:overflow-hidden no-scrollbar ${
        dragging ? 'cursor-grabbing select-none' : ''
      }`}
    >
      <div
        ref={trackRef}
        className={`w-full md:w-auto flex ${
          !isMobile && disableTrackTransition
            ? enterDirection === 'next'
              ? 'items-end'
              : 'items-start'
            : 'items-center'
        } md:gap-6 will-change-transform ${
          dragging || disableTrackTransition ? '' : 'transition-transform duration-500 ease-out'
        }`}
        style={{ transform: `translateX(${trackOffset + dragOffset}px)` }}
      >
        <ProjectSlides
          frames={frames}
          activeIndex={activeIndex}
          imageRatios={imageRatios}
          stageHeight={stageHeight}
          dragging={dragging}
          desktopSlideRefs={desktopSlideRefs}
          mobileSlideRefs={mobileSlideRefs}
        />
      </div>
    </main>
  );
};

export default ProjectStage;
