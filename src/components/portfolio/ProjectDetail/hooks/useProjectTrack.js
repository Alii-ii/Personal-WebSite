"use client";

import { useEffect, useRef, useState } from 'react';

export const useProjectTrack = ({
  activeIndex,
  frames,
  imageRatios,
  isMobile,
  enterDirection,
  onActiveIndexChange,
}) => {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const desktopSlideRefs = useRef([]);
  const mobileSlideRefs = useRef([]);
  const enterAnimationAppliedRef = useRef(false);
  const [stageHeight, setStageHeight] = useState(0);
  const [trackOffset, setTrackOffset] = useState(0);
  const [disableTrackTransition, setDisableTrackTransition] = useState(false);

  useEffect(() => {
    if (!isMobile) return undefined;
    const nodes = mobileSlideRefs.current.filter(Boolean);
    if (!nodes.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio);
        if (!visibleEntries.length) return;
        const index = Number(visibleEntries[0].target.dataset.frameIndex);
        if (!Number.isNaN(index)) {
          onActiveIndexChange((previous) => (previous === index ? previous : index));
        }
      },
      { root: viewportRef.current, threshold: [0.35, 0.6] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [isMobile, frames, imageRatios, onActiveIndexChange]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const readStageHeight = () => {
      const styles = getComputedStyle(viewport);
      const height =
        viewport.clientHeight -
        parseFloat(styles.paddingTop || 0) -
        parseFloat(styles.paddingBottom || 0);
      if (height > 0) {
        setStageHeight((previous) => (Math.abs(previous - height) < 0.5 ? previous : height));
      }
    };

    readStageHeight();
    const observer = new ResizeObserver(readStageHeight);
    observer.observe(viewport);
    window.addEventListener('resize', readStageHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', readStageHeight);
    };
  }, []);

  useEffect(() => {
    let animationFrame = 0;

    const measure = () => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!viewport || !track) return;

      let activeSlide = desktopSlideRefs.current[activeIndex];
      if (!activeSlide || !activeSlide.isConnected) {
        activeSlide = track.querySelector(
          `.md\\:flex > section[data-frame-index="${activeIndex}"]`,
        );
      }

      if (!activeSlide || activeSlide.offsetParent === null) {
        setTrackOffset((previous) => (previous === 0 ? previous : 0));
        return;
      }
      if (activeSlide.offsetWidth === 0) return;

      let offsetInTrack = 0;
      for (let node = activeSlide; node && node !== track; node = node.offsetParent) {
        offsetInTrack += node.offsetLeft;
      }

      const nextOffset =
        viewport.clientWidth / 2 - (offsetInTrack + activeSlide.offsetWidth / 2);
      if (enterDirection && !enterAnimationAppliedRef.current) {
        enterAnimationAppliedRef.current = true;
        setDisableTrackTransition(true);
        const initialOffset =
          enterDirection === 'next'
            ? nextOffset - viewport.clientWidth
            : nextOffset + viewport.clientWidth;
        setTrackOffset(initialOffset);
        requestAnimationFrame(() => {
          setTrackOffset(nextOffset);
          setDisableTrackTransition(false);
        });
        return;
      }

      setTrackOffset((previous) =>
        Math.abs(nextOffset - previous) < 0.5 ? previous : nextOffset,
      );
    };

    const scheduleMeasure = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(measure);
    };

    scheduleMeasure();
    const timer = setTimeout(scheduleMeasure, 520);
    const observer = new ResizeObserver(scheduleMeasure);
    desktopSlideRefs.current.forEach((node) => node && observer.observe(node));
    if (viewportRef.current) observer.observe(viewportRef.current);
    window.addEventListener('resize', scheduleMeasure);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener('resize', scheduleMeasure);
    };
  }, [activeIndex, frames, imageRatios, stageHeight, enterDirection]);

  return {
    viewportRef,
    trackRef,
    desktopSlideRefs,
    mobileSlideRefs,
    stageHeight,
    trackOffset,
    disableTrackTransition,
  };
};
