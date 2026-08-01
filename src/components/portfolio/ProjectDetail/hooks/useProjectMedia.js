"use client";

import { useEffect, useState } from 'react';

const ratioCache = new Map();

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsMobile(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener('change', sync);
    return () => mediaQuery.removeEventListener('change', sync);
  }, []);

  return isMobile;
};

/**
 * 从图片文件本身探测真实宽高比。模块级缓存会跨 tab 和项目复用结果。
 */
export const useImageRatios = (frames) => {
  const [ratios, setRatios] = useState(() => {
    const initialRatios = {};
    (frames || []).forEach((frame) => {
      if (frame.type === 'image' && frame.src && ratioCache.has(frame.src)) {
        initialRatios[frame.src] = ratioCache.get(frame.src);
      }
    });
    return initialRatios;
  });

  useEffect(() => {
    let alive = true;
    const pendingFrames = (frames || []).filter(
      (frame) => frame.type === 'image' && frame.src && !ratioCache.has(frame.src),
    );

    setRatios((previousRatios) => {
      let changed = false;
      const nextRatios = { ...previousRatios };
      (frames || []).forEach((frame) => {
        if (
          frame.type === 'image' &&
          frame.src &&
          ratioCache.has(frame.src) &&
          !(frame.src in previousRatios)
        ) {
          nextRatios[frame.src] = ratioCache.get(frame.src);
          changed = true;
        }
      });
      return changed ? nextRatios : previousRatios;
    });

    pendingFrames.forEach((frame) => {
      const image = new window.Image();
      image.onload = () => {
        if (!image.naturalWidth || !image.naturalHeight) return;
        const ratio = image.naturalWidth / image.naturalHeight;
        ratioCache.set(frame.src, ratio);
        if (alive) {
          setRatios((previousRatios) =>
            previousRatios[frame.src] === ratio
              ? previousRatios
              : { ...previousRatios, [frame.src]: ratio },
          );
        }
      };
      image.src = frame.src;
    });

    return () => {
      alive = false;
    };
  }, [frames]);

  return ratios;
};
