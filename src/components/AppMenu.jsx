"use client";

import { useState, useEffect, useCallback } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import CopyEmailButton from '@/components/CopyEmailButton';
import IconTextButton from '@/components/icon-text-botton';
import { ActionSwapIcon } from '@/components/motion/action-swap';
import { ChatsIcon, CheckIcon, BilibiliIcon, FigmaIcon, XiaohongshuIcon } from '@/public/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import EdgeMask from '@/components/EdgeMask';

/**
 * 复制文本到剪贴板
 */
const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    return true;
  } catch { return false; }
};

/**
 * AppMenu — 通用全屏菜单壳
 *
 * 提供：全屏遮罩 + EdgeMask 毛玻璃背景 + 开关动画 + ESC 关闭 +
 *       底栏（ThemeToggle / LanguageToggle / 社交按钮 / 关闭按钮）。
 *
 * 中间内容区域通过 children 传入，不同页面按需填充。
 *
 * @param {boolean}   open          - 是否打开
 * @param {Function}  onClose       - 关闭回调
 * @param {ReactNode} children      - 菜单内容区域（导航链接、目录等）
 * @param {ReactNode} footerActions - 可选的底栏联系操作；不传时使用默认邮箱与社交操作
 */
const AppMenu = ({ open, onClose, children, footerActions = null }) => {
  const { t } = useLanguage();

  const [copyStates, setCopyStates] = useState({ wechat: false });
  const [tooltipStates, setTooltipStates] = useState({ wechat: false });
  const [bilibiliHovered, setBilibiliHovered] = useState(false);
  const [figmaHovered, setFigmaHovered] = useState(false);
  const [xhsHovered, setXhsHovered] = useState(false);

  // 动画状态：visible 控制 DOM 挂载，animating 控制过渡
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimating(true)));
    } else {
      setAnimating(false);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleCopySuccess = useCallback((type) => {
    setCopyStates(prev => ({ ...prev, [type]: true }));
    setTooltipStates(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setCopyStates(prev => ({ ...prev, [type]: false }));
      setTooltipStates(prev => ({ ...prev, [type]: false }));
    }, 500);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col transition-opacity duration-300"
      style={{ opacity: animating ? 1 : 0 }}
    >
      {/* 点击关闭的透明遮罩 */}
      <div className="absolute inset-0" onClick={onClose} />
      {/* 渐变遮罩背景 — 复用 EdgeMask from="bottom" */}
      <EdgeMask from="bottom" height="100%" />

      {/* 内容 */}
      <div className="relative z-10 flex-1 flex flex-col justify-end px-12 md:px-16 pb-12 md:pb-12 gap-6">

        {/* 上方 slot：各页面自定义的导航 / 目录内容 */}
        {children}

        {/* 底栏：切换 + 社交图标 + 关闭，同行横排，空间不够时后置操作隐藏 */}
        <div className="flex flex-row items-center justify-between">
          {/* 左侧：保持原有 footer 菜单布局，超出单行高度的后置操作隐藏 */}
          <div className="flex flex-row items-center gap-1.5 min-w-0 flex-wrap overflow-hidden min-w-[118px] h-full" style={{ maxHeight: '2.5rem' }}>
            <div className="shrink-0"><ThemeToggle /></div>
            <div className="shrink-0"><LanguageToggle /></div>
            <div className="w-px h-3 mx-0.5 shrink-0" aria-hidden="true" />

            {footerActions || (
              <>
                <div className="shrink-0">
                  <CopyEmailButton />
                </div>

                <div className="shrink-0">
                  <IconTextButton
                    text=""
                    icon={
                      <ActionSwapIcon value={copyStates.wechat ? 'copied' : 'idle'} animation="blur">
                        {copyStates.wechat ? <CheckIcon /> : <ChatsIcon />}
                      </ActionSwapIcon>
                    }
                    variant="ghost"
                    size="md"
                    tooltip={copyStates.wechat ? t('wechatCopied') : t('wechatTooltip')}
                    forceTooltipOpen={tooltipStates.wechat}
                    onClick={async () => {
                      const ok = await copyToClipboard('_Alii_');
                      if (ok) handleCopySuccess('wechat');
                    }}
                  />
                </div>

                <div
                  className="shrink-0"
                  onMouseEnter={() => setFigmaHovered(true)}
                  onMouseLeave={() => setFigmaHovered(false)}
                  style={{ filter: figmaHovered ? 'none' : 'grayscale(1)', transition: 'filter 0.2s ease' }}
                >
                  <IconTextButton
                    text=""
                    icon={<FigmaIcon />}
                    variant="ghost"
                    size="md"
                    tooltip="Figma Portfolio"
                    onClick={() => window.open('https://www.figma.com/design/OsMjuOsAZiPIMPK0ztUVR0/Alii---UX-Portfolio-2024', '_blank')}
                  />
                </div>

                <div
                  className="shrink-0"
                  onMouseEnter={() => setBilibiliHovered(true)}
                  onMouseLeave={() => setBilibiliHovered(false)}
                  style={{ filter: bilibiliHovered ? 'none' : 'grayscale(1)', transition: 'filter 0.2s ease' }}
                >
                  <IconTextButton
                    text=""
                    icon={<BilibiliIcon />}
                    variant="ghost"
                    size="md"
                    tooltip={t('bilibiliTooltip')}
                    onClick={() => window.open('https://space.bilibili.com/38773851/upload/video', '_blank')}
                  />
                </div>

                <div
                  className="shrink-0"
                  onMouseEnter={() => setXhsHovered(true)}
                  onMouseLeave={() => setXhsHovered(false)}
                  style={{ filter: xhsHovered ? 'none' : 'grayscale(1)', transition: 'filter 0.2s ease' }}
                >
                  <IconTextButton
                    text=""
                    icon={<XiaohongshuIcon />}
                    variant="ghost"
                    size="md"
                    tooltip="小红书"
                    onClick={() => window.open('https://www.xiaohongshu.com/user/profile/60877ccc000000000101c324', '_blank')}
                  />
                </div>
              </>
            )}
          </div>
          
          {/* 右侧 */}
          <button
            type="button"
            aria-label="关闭菜单"
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-[8px] flex items-center justify-center text-secondary hover:text-main transition-colors duration-150 cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

        </div>
      </div>
    </div>
  );
};

export default AppMenu;
