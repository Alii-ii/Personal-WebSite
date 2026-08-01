"use client";

import { useCallback, useEffect, useRef, useState } from 'react';

const EMPTY_DRAG = { active: false, startX: 0, dx: 0, captured: false, hitIndex: -1 };

export const useSlideDrag = ({ onSelect, onPrevious, onNext }) => {
  const dragRef = useRef(EMPTY_DRAG);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const handlePointerDown = useCallback((event) => {
    if (window.matchMedia('(max-width: 767px)').matches) return;
    if (event.button !== undefined && event.button !== 0) return;
    if (event.target.closest?.('a, button, iframe, input, textarea, select')) return;

    const hit = event.target.closest?.('section[data-frame-index]');
    dragRef.current = {
      active: true,
      startX: event.clientX,
      dx: 0,
      captured: false,
      hitIndex: hit ? Number(hit.dataset.frameIndex) : -1,
    };
    setDragging(true);
  }, []);

  const handlePointerMove = useCallback((event) => {
    if (!dragRef.current.active) return;
    const offset = event.clientX - dragRef.current.startX;
    if (!dragRef.current.captured && Math.abs(offset) > 6) {
      dragRef.current.captured = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    if (dragRef.current.captured && event.cancelable) event.preventDefault();

    dragRef.current.dx = offset;
    setDragOffset(offset);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!dragRef.current.active) return;
    const { dx, hitIndex } = dragRef.current;
    dragRef.current = EMPTY_DRAG;
    setDragging(false);
    setDragOffset(0);

    if (Math.abs(dx) <= 6) {
      if (hitIndex >= 0) onSelect(hitIndex);
      return;
    }
    if (dx <= -60) onNext();
    else if (dx >= 60) onPrevious();
  }, [onNext, onPrevious, onSelect]);

  useEffect(() => {
    if (!dragging) return undefined;
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [dragging, handlePointerUp]);

  return {
    dragging,
    dragOffset,
    pointerHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onDragStart: (event) => event.preventDefault(),
    },
  };
};
