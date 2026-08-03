"use client";

// 全局快捷键 hook：处理退出层级、翻页、切项目、切 tab、目录和评论开关。
import { useEffect, useRef } from 'react';

export const useProjectShortcuts = ({
  visibleTabs,
  neighbors,
  menuOpen,
  commentOpen,
  onTabChange,
  onPreviousPage,
  onNextPage,
  onProjectChange,
  onBack,
  onMenuToggle,
  onMenuClose,
  onCommentToggle,
  onCommentClose,
}) => {
  const stateRef = useRef({});
  stateRef.current = { visibleTabs, neighbors, menuOpen, commentOpen };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const tag = event.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target?.isContentEditable) return;

      const state = stateRef.current;
      if ((event.metaKey || event.ctrlKey) && event.key === '/') {
        event.preventDefault();
        onMenuToggle();
        return;
      }

      if (event.altKey) {
        const match = /^Digit([0-9])$/.exec(event.code || '');
        if (match) {
          if (state.visibleTabs.length <= 1) return;
          const digit = Number(match[1]);
          const fromRight = digit === 0 ? 1 : 11 - digit;
          const index = state.visibleTabs.length - fromRight;
          if (index >= 0 && index < state.visibleTabs.length) {
            event.preventDefault();
            onTabChange(state.visibleTabs[index].key);
          }
          return;
        }
      }

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          if (state.commentOpen) onCommentClose();
          else if (state.menuOpen) onMenuClose();
          else onBack();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onPreviousPage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          onNextPage();
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (state.neighbors.prev) {
            onProjectChange(state.neighbors.prev.slug, { motionDir: 'prev' });
          }
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (state.neighbors.next) {
            onProjectChange(state.neighbors.next.slug, { motionDir: 'next' });
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    onBack,
    onCommentClose,
    onCommentToggle,
    onMenuClose,
    onMenuToggle,
    onNextPage,
    onPreviousPage,
    onProjectChange,
    onTabChange,
  ]);
};
