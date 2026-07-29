"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import CopyEmailButton from '@/components/CopyEmailButton';
import IconTextButton from '@/components/icon-text-botton';
import TextLink from '@/components/TextLink';
import { ActionSwapIcon } from '@/components/motion/action-swap';
import { ChatsIcon, CheckIcon, BilibiliIcon, FigmaIcon } from '@/public/icons';
import { useLanguage } from '@/contexts/LanguageContext';

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
 * HomeMenu — 首页全屏菜单
 *
 * 点击菜单按钮后弹出，全屏均匀渐变遮罩背景。
 * 包含：导航链接（简历、作品集、摸鱼平台）、社交图标、主题/语言切换。
 */
const HomeMenu = ({ open, onClose }) => {
  const { t } = useLanguage();
  const router = useRouter();

  const [copyStates, setCopyStates] = useState({ wechat: false });
  const [tooltipStates, setTooltipStates] = useState({ wechat: false });
  const [bilibiliHovered, setBilibiliHovered] = useState(false);
  const [figmaHovered, setFigmaHovered] = useState(false);

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

  const navigate = useCallback((href) => {
    onClose();
    router.push(href);
  }, [onClose, router]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col transition-opacity duration-300"
      style={{ opacity: animating ? 1 : 0 }}
    >
      {/* 全屏渐变遮罩背景：复用 EdgeMask 的毛玻璃渐变语言 */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        style={{
          background: 'linear-gradient(to top, hsl(var(--neutral-bg-card)), hsl(var(--neutral-bg-card) / 0.8), hsl(var(--neutral-bg-card) / 0.5), transparent)',
          backdropFilter: 'blur(48px)',
          WebkitBackdropFilter: 'blur(48px)',
          maskImage: 'linear-gradient(to top, black 0%, black 50%, transparent 100%)',
        }}
      />
      {/* 补充顶部模糊层，确保全屏覆盖 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, hsl(var(--neutral-bg-card)), hsl(var(--neutral-bg-card) / 0.8), hsl(var(--neutral-bg-card) / 0.5), transparent)',
          backdropFilter: 'blur(48px)',
          WebkitBackdropFilter: 'blur(48px)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 50%, transparent 100%)',
        }}
      />

      {/* 内容 */}
      <div className="relative z-10 flex-1 flex flex-col justify-end px-12 md:px-16 pb-12 md:pb-12 gap-6">
        {/* 导航链接 */}
        <div className="flex flex-col items-end gap-6">
          <TextLink
            href="/resume"
            title={t('resumeTooltip')}
            target="_self"
            onClick={(e) => { e.preventDefault(); navigate('/resume'); }}
          >
            {t('resume')}
          </TextLink>
          <TextLink
            href="/portfolio"
            title={t('portfolioTooltip')}
            target="_self"
            onClick={(e) => { e.preventDefault(); navigate('/portfolio'); }}
          >
            {t('portfolio')}
          </TextLink>
          <TextLink
            href="https://www.miyoushe.com/zzz/accountCenter/postList?id=196941437"
            title={t('mainSiteTooltip')}
          >
            {t('mainSite')}
          </TextLink>
        </div>

        {/* 社交图标（左对齐） */}
        <div className="flex flex-row items-center justify-start gap-0.5 md:gap-1">
          <div
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
              onClick={() => window.open('https://space.bilibili.com/38773851/favlist?fid=702542351&ftype=create', '_blank')}
            />
          </div>
          <div
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
          <CopyEmailButton />
        </div>

        {/* 切换区 + 关闭按钮（同排，两端对齐） */}
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-2 md:gap-3">
            <ThemeToggle />
            <LanguageToggle />
          </div>
          <button
            type="button"
            aria-label="关闭菜单"
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-secondary hover:text-main transition-colors duration-150 cursor-pointer"
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

export default HomeMenu;
