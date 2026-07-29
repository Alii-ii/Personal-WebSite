"use client";

import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { useEffect } from 'react';
import { EASE_OUT, TRANSITION_UNFOLD } from '@/lib/ease';
import { cn } from '@/lib/utils';

/**
 * 通用「展开 / 收起」浮层原语。
 *
 * 表面通过 clip-path 从指定原点向外展开，而非缩放 —— 内容始终保持原始尺寸，
 * 只是被逐步揭开，因此没有 transform scale 常见的文字模糊与二次回流。
 *
 * 用 tween 而非 spring：复杂 clip-path 字符串在 spring 收敛末端会跳变；
 * 且圆角半径全程恒定，让整段时长都读作「表面在展开」，
 * 而不是提前结束、最后几帧在磨圆角。
 *
 * 适用于菜单、下拉、弹窗等所有需要「从某点长出来」的浮层。
 *
 * @param {boolean} open
 * @param {Function} onClose - 点遮罩 / ESC 时触发
 * @param {'top-left'|'top-right'|'bottom-left'|'bottom-right'|'center'} origin - 展开原点
 * @param {number} radius - 圆角（px），需与内容层圆角一致，否则展开过程会露直角
 * @param {boolean} backdrop - 是否渲染点击遮罩，默认 true
 * @param {boolean} dismissOnBackdrop - 点遮罩是否关闭，默认 true
 * @param {boolean} dismissOnEscape - ESC 是否关闭，默认 true。
 *        宿主已有逐层退出逻辑时应传 false，避免两处争抢同一次按键
 * @param {number} backdropZ - 遮罩层级，默认 30
 * @param {string} className - 面板类名（定位、尺寸、背景由调用方决定）
 * @param {string} ariaLabel
 */
const UnfoldPanel = ({
  open,
  onClose,
  origin = 'top-left',
  radius = 12,
  backdrop = true,
  dismissOnBackdrop = true,
  dismissOnEscape = true,
  backdropZ = 30,
  className,
  ariaLabel,
  children,
}) => {
  const reduce = useReducedMotion() ?? false;

  // 折叠态：把可视区压到原点所在的角，展开时向外揭开
  const folded =
    {
      'top-left': `inset(0% 100% 100% 0% round ${radius}px)`,
      'top-right': `inset(0% 0% 100% 100% round ${radius}px)`,
      'bottom-left': `inset(100% 100% 0% 0% round ${radius}px)`,
      'bottom-right': `inset(100% 0% 0% 100% round ${radius}px)`,
      center: `inset(48% 48% 48% 48% round ${radius}px)`,
    }[origin] || `inset(0% 100% 100% 0% round ${radius}px)`;

  const opened = `inset(0% 0% 0% 0% round ${radius}px)`;

  // ESC 关闭。用捕获阶段并阻断冒泡，避免同一次按键同时触发上层的 ESC 行为
  // （L3 的 ESC 是「返回作品墙」，菜单打开时应只关菜单）
  useEffect(() => {
    if (!open || !dismissOnEscape) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      onClose?.();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, dismissOnEscape, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <PresenceGate>
          {(isPresent) => (
            <>
              {backdrop ? (
                <motion.div
                  aria-hidden="true"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0.1 : 0.28, ease: EASE_OUT }}
                  onClick={() => dismissOnBackdrop && onClose?.()}
                  style={{ pointerEvents: isPresent ? 'auto' : 'none', zIndex: backdropZ }}
                  className="fixed inset-0"
                />
              ) : null}

              <motion.div
                role="dialog"
                aria-label={ariaLabel}
                initial={
                  reduce ? { opacity: 0, clipPath: opened } : { opacity: 1, clipPath: folded }
                }
                animate={{ opacity: 1, clipPath: opened }}
                exit={reduce ? { opacity: 0, clipPath: opened } : { opacity: 1, clipPath: folded }}
                transition={reduce ? { duration: 0.14, ease: EASE_OUT } : TRANSITION_UNFOLD}
                style={{ pointerEvents: isPresent ? 'auto' : 'none' }}
                className={cn('will-change-[clip-path]', className)}
              >
                {children}
              </motion.div>
            </>
          )}
        </PresenceGate>
      ) : null}
    </AnimatePresence>
  );
};

/**
 * 退场动画播放期间关闭指针事件，
 * 避免「正在消失的面板」仍然拦截点击
 */
const PresenceGate = ({ children }) => children(useIsPresent());

export default UnfoldPanel;
