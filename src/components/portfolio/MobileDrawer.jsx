"use client";

import { AnimatePresence, motion, useDragControls, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { hasProjectPage, pickLocale } from '@/contexts/ProjectContext';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';

// 长时长、完全阻尼的 tween 比 spring 更顺 —— 无回弹、一次减速到位。
// 遮罩用同一条曲线，保证面板与背景同步。
const DRAWER = { duration: 0.5, ease: [0.32, 0.72, 0, 1] };

// 项目列表区的高度阈值：超出即在内部滚动，抽屉整体仍是 h-fit
const LIST_MAX_H = '48vh';

/**
 * 移动端底部抽屉
 *
 * 高度自适应内容（h-fit），项目列表超过阈值时在内部滚动；
 * 底部固定放主题 / 语言切换（桌面端在 footer，移动端收进这里）。
 *
 * @param {boolean} open
 * @param {Function} onOpenChange
 * @param {Array} groups - getProjectsByCategory() 结果
 * @param {string} currentSlug
 * @param {Function} onSelect - 选中项目
 * @param {Function} onBack - 退出 L3 返回作品墙
 */
const MobileDrawer = ({ open, onOpenChange, groups = [], currentSlug, onSelect, onBack }) => {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const dragControls = useDragControls();
  const reduce = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 锁背景滚动。iOS Safari 会忽略单独的 overflow:hidden —— 抽屉内的边界滚动
  // 会串到页面上，关闭后停在别处。position:fixed 才是真正生效的锁，
  // 关闭时再恢复滚动位置。
  useEffect(() => {
    if (!open) return undefined;
    const body = document.body;
    const scrollY = window.scrollY;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      overflow: body.style.overflow,
    };
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.overflow = 'hidden';
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  // ESC 关闭
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, onOpenChange]);

  const handleDragEnd = (_, info) => {
    // 向下快速甩动或拖拽距离足够 → 关闭
    if (info.velocity.y > 500 || info.offset.y > 100) onOpenChange(false);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="pointer-events-none fixed inset-0 z-50 md:hidden">
          <motion.button
            type="button"
            aria-label="关闭菜单"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={DRAWER}
            onClick={() => onOpenChange(false)}
            className="pointer-events-auto absolute inset-0 bg-bg/50 backdrop-blur-sm"
          />

          <motion.div
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.02, bottom: 0.4 }}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            initial={reduce ? { y: 0, opacity: 0 } : { y: '100%' }}
            animate={reduce ? { y: 0, opacity: 1 } : { y: 0 }}
            exit={reduce ? { y: 0, opacity: 0 } : { y: '100%' }}
            transition={reduce ? { duration: 0.18 } : DRAWER}
            role="dialog"
            aria-modal="true"
            aria-label="项目菜单"
            className="pointer-events-auto absolute bottom-0 inset-x-0 flex flex-col overflow-hidden rounded-t-[20px] bg-card border-t border-stroke shadow-xl will-change-transform"
          >
            {/* 拖拽把手 */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex touch-none flex-col items-center px-4 pb-1 pt-3"
            >
              <div className="h-1 w-9 rounded-full bg-tertiary/40" />
            </div>

            {/* 项目列表：超过阈值内部滚动，overscroll-contain 防止滚动串到页面 */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain no-scrollbar px-5 pt-2"
              style={{ maxHeight: LIST_MAX_H }}
            >
              {groups.map((group) => (
                <div key={group.key} className="flex flex-col gap-0.5 pb-1">
                  <div className="px-2.5 py-1">
                    <span className="font-regular text-[14px] leading-[24px] text-tertiary">
                      {pickLocale(group.label, language)}
                    </span>
                  </div>

                  {group.projects.map((project) => {
                    const isActive = project.slug === currentSlug;
                    const disabled = !hasProjectPage(project);
                    return (
                      <button
                        key={project.slug}
                        type="button"
                        disabled={disabled}
                        onClick={disabled ? undefined : () => onSelect?.(project.slug)}
                        className={`w-full flex items-center gap-1.5 px-2.5 py-2 rounded-[8px] text-left transition-colors duration-150 ${
                          disabled ? 'cursor-default' : isActive ? 'bg-hover' : 'hover:bg-hover active:bg-hover/60'
                        }`}
                      >
                        <span className={`flex-1 font-regular text-[15px] leading-[24px] truncate ${disabled ? 'text-disabled' : 'text-main'}`}>
                          {pickLocale(project.title, language)}
                        </span>
                        <span className="font-regular text-[13px] leading-[24px] text-tertiary shrink-0">
                          {project.period}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* 底部：左返回（移动端退出 L3 的入口，桌面端由 ShortcutBar 的 ESC 承担）
                + 右主题 / 语言切换（桌面端在 footer，移动端收进抽屉） */}
            <div
              className="shrink-0 flex items-center justify-between gap-3 px-5 pt-3"
              style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
            >
              <button
                type="button"
                onClick={onBack}
                title="返回作品集"
                className="font-Ding text-secondary text-[32px] leading-[80%] pb-1 active:opacity-60 transition-opacity duration-200 select-none"
              >
                ←
              </button>

              <div className="flex items-center gap-3">
                <ThemeToggle />
                <LanguageToggle />
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
};

export default MobileDrawer;
