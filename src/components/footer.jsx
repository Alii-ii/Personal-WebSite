import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import CopyEmailButton from '@/components/CopyEmailButton';
import TextLink from '@/components/TextLink';
import IconTextButton from '@/components/icon-text-botton';
import AnimatedContent from '@/effects/AnimatedContent';
import CyclingDecryptedText from '@/components/CyclingDecryptedText';
import { ChatsIcon, CheckIcon, BilibiliIcon, FigmaIcon, XiaohongshuIcon } from '@/public/icons';
import { ActionSwapIcon } from '@/components/motion/action-swap';
import EdgeMask from '@/components/EdgeMask';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * 复制文本到剪贴板的通用函数
 * 支持现代 Clipboard API 和传统降级方案
 */
const copyToClipboard = async (text, t) => {
  try {
    // 检查是否支持现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      // 降级方案：使用传统的 document.execCommand
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    return true;
  } catch (err) {
    console.error(t('copyFailed'), err);
    return false;
  }
};

/**
 * 版权信息渐显组件
 * 页面加载 800ms 后淡入显示
 */
const CopyrightFade = ({ t }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 800);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div
      className={
        "absolute bottom-4 md:bottom-8 left-6 md:left-16 font-regular text-disabled text-[13px] md:text-[14px] leading-[100%] flex flex-row gap-4 md:gap-6 z-10 transition-opacity duration-300 select-none truncate" +
        (show ? " opacity-100" : " opacity-0")
      }
    >
      <span>{t('copyright')}</span>
      <span>{t('lastUpdated')}</span>
      <span>Build with Cursor</span>
    </div>
  );
};

/**
 * 真机移动浏览器的地址栏 / 工具栏会让 visual viewport 小于 layout viewport。
 * fixed footer 默认仍可能锚定到 layout viewport 底部，因此按两者差值上移。
 */
const useMobileVisualViewportBottom = () => {
  const [bottom, setBottom] = useState(0);

  useEffect(() => {
    const visualViewport = window.visualViewport;
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    let animationFrame = 0;

    const sync = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        if (!mediaQuery.matches || !visualViewport) {
          setBottom(0);
          return;
        }
        const layoutHeight = document.documentElement.clientHeight;
        const visibleBottom = visualViewport.offsetTop + visualViewport.height;
        const nextBottom = Math.max(0, Math.round(layoutHeight - visibleBottom));
        setBottom((previous) => (previous === nextBottom ? previous : nextBottom));
      });
    };

    sync();
    visualViewport?.addEventListener('resize', sync);
    visualViewport?.addEventListener('scroll', sync);
    window.addEventListener('orientationchange', sync);
    mediaQuery.addEventListener('change', sync);

    return () => {
      cancelAnimationFrame(animationFrame);
      visualViewport?.removeEventListener('resize', sync);
      visualViewport?.removeEventListener('scroll', sync);
      window.removeEventListener('orientationchange', sync);
      mediaQuery.removeEventListener('change', sync);
    };
  }, []);

  return bottom;
};

/**
 * Footer 组件 - 页面底部区域
 * 包含个人信息、链接和社交图标
 */
const Footer = ({
  onUnderlinedClick,
  isGallery = false,
  showGallerySubtitle = true,
  className = '',
  maskHeight = '480px',
  togglesSide = 'right', // 仅影响 isGallery 模式下 ThemeToggle/LanguageToggle 的位置
  hideRight = false, // false=显示, true=全隐藏, 'mobile'=仅移动端隐藏
}) => {
  // 获取语言上下文
  const { t } = useLanguage();
  // 获取路由对象
  const router = useRouter();
  const mobileVisualViewportBottom = useMobileVisualViewportBottom();
  
  // 复制状态管理
  const [copyStates, setCopyStates] = useState({
    wechat: false
  });

  // Tooltip 显示状态管理
  const [tooltipStates, setTooltipStates] = useState({
    wechat: false
  });

  // 图标 hover 状态（默认灰度，hover 显示原色）
  const [bilibiliHovered, setBilibiliHovered] = useState(false);
  const [figmaHovered, setFigmaHovered] = useState(false);
  const [xhsHovered, setXhsHovered] = useState(false);

  // 处理复制成功后的状态更新
  const handleCopySuccess = (type) => {
    // 更新复制状态
    setCopyStates(prev => {
      const newState = {
        ...prev,
        [type]: true
      };
      return newState;
    });

    // 强制显示 tooltip
    setTooltipStates(prev => ({
      ...prev,
      [type]: true
    }));
    
    // 重置状态
    setTimeout(() => {
      setCopyStates(prev => ({
        ...prev,
        [type]: false
      }));
      
      // 重置 tooltip 状态
      setTooltipStates(prev => ({
        ...prev,
        [type]: false
      }));
    }, 500);
  };

  // 处理下划线文本点击事件
  const handleUnderlinedClick = (text) => {
    // 调用父组件传递的点击处理函数
    if (onUnderlinedClick) {
      onUnderlinedClick(text);
    }
  };

  return (
    <footer
      className={[
        // 布局基础：移动端由 visualViewport 的真实差值修正 fixed 定位
        "footer",
        "fixed bottom-0 left-0 right-0 w-full min-w-[300px] h-fit z-20",
        // 内边距和分行
        "pb-10 md:pb-12 px-6 md:px-16",
        // 行结构
        "flex flex-col md:flex-row justify-between items-start md:items-end gap-2 md:gap-0",
        // 额外自定义
        className,
      ].join(" ")}
      style={{ bottom: `${mobileVisualViewportBottom}px` }}
    >
      {/* 背景遮罩 */}
      <EdgeMask from="bottom" height={maskHeight} className="footer__mask z-0 transition-opacity duration-100" />

      {/* 左区：动画/标题 */}
      <AnimatedContent
        direction="horizontal"
        reverse={true}
        distance={80}
        duration={1.2}
        delay={0.2}
        immediate={true}
        flex={false}
        className="footer__left relative z-10 h-full flex items-start justify-start"
      >
        <div className={`footer__left-content flex flex-col items-start justify-center gap-4 ${isGallery ? '' : 'md:pb-4'} font-Ding z-10 select-none`}>
          {isGallery ? (
            togglesSide === 'left' ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/')}
                  className="footer__back-btn text-secondary text-[32px] md:text-[32px] leading-[80%] hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                  title="返回首页"
                >
                  ←
                </button>
                <div className="hidden md:flex items-center gap-3 select-none font-regular text-secondary">
                  <ThemeToggle />
                  <LanguageToggle />
                </div>
              </div>
            ) : (
              <button
                onClick={() => router.push('/')}
                className="footer__back-btn text-secondary text-[48px] md:text-[56px] leading-[80%] hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                title="返回首页"
              >
                ←
              </button>
            )
          ) : (
            <span className="footer__brand text-secondary text-[108px] md:text-[120px] leading-[80%]">Alii</span>
          )}
          {isGallery ? (
            showGallerySubtitle ? (
              // Gallery 页面：只显示投稿文案，不循环
              <CyclingDecryptedText
                texts={[t('lastPostDays')]}
                cycleInterval={0}
                className="footer__subtitle text-[48px] md:text-[56px] leading-[100%] mb-2"
                onUnderlinedClick={handleUnderlinedClick}
                underlineOpacity={50}
                hoverOpacity={80}
                decryptedProps={{
                  speed: 40,
                  maxIterations: 6,
                  sequential: true,
                  revealDirection: 'start',
                  useOriginalCharsOnly: true,
                }}
              />
            ) : null
          ) : (
            // 首页：正常循环显示文案
            <CyclingDecryptedText
              texts={[t('learningCode'), t('lastPostDays')]}
              cycleInterval={3000}
              className="footer__subtitle text-[48px] md:text-[56px] leading-[100%] mb-2"
              onUnderlinedClick={handleUnderlinedClick}
              underlineOpacity={50}
              hoverOpacity={80}
              decryptedProps={{
                speed: 40,
                maxIterations: 6,
                sequential: true,
                revealDirection: 'start',
                useOriginalCharsOnly: true,
              }}
            />
          )}
        </div>
      </AnimatedContent>

      {/* 中区：版权信息（仅首页显示） */}
      {!isGallery && <CopyrightFade t={t} />}

      {/* 右区：操作/链接（hideRight='mobile' 时仅移动端隐藏） */}
      <AnimatedContent
        direction="horizontal"
        reverse={false}
        distance={80}
        duration={1.2}
        delay={0.2}
        immediate={true}
        flex={false}
        className="footer__right relative z-10 h-full flex items-start md:items-end justify-start md:items-end"
      >
        {isGallery ? (
          // 二级页极简区块
          <div className={`footer__right-gallery flex flex-col items-start md:items-end gap-1 md:gap-6 z-10${hideRight === 'mobile' ? ' hidden md:flex' : hideRight ? ' hidden' : ''}`}>
            {togglesSide !== 'left' ? (
              <div className="footer__right-toggles flex flex-row-reverse md:flex-row items-center justify-start md:justify-center gap-2 md:gap-3 py-2 md:py-0">
                <ThemeToggle />
                <LanguageToggle />
              </div>
            ) : null}
          </div>
        ) : (
          <div className={`footer__right-main flex flex-col items-start md:items-end gap-1 md:gap-6 z-10${hideRight === 'mobile' ? ' hidden md:flex' : hideRight ? ' hidden' : ''}`}>
            {/* 重要入口区 */}
            <div className="footer__right-links flex flex-row md:flex-col items-center md:items-end justify-start gap-6 pt-4 md:pt-0">
              <TextLink
                href="/resume"
                title={t('resumeTooltip')}
                target="_self"
              >
                {t('resume')}
              </TextLink>
              <TextLink
                href="/portfolio"
                title={t('portfolioTooltip')}
                target="_self"
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

            {/* 底部小按钮和切换区 */}
            <div className="footer__right-bottom flex flex-row-reverse md:flex-row items-center justify-start md:justify-center gap-2 md:gap-3 py-2 md:py-0">
              
              {/* 小按钮组 */}
              <div className="footer__right-icons flex flex-row gap-0.5 md:gap-1">
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
                    onClick={() => {
                      window.open('https://space.bilibili.com/38773851/upload/video', '_blank');
                    }}
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
                    onClick={() => {
                      window.open('https://www.figma.com/design/OsMjuOsAZiPIMPK0ztUVR0/Alii---UX-Portfolio-2024', '_blank');
                    }}
                  />
                </div>
                <div
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
                    onClick={() => {
                      window.open('https://www.xiaohongshu.com/user/profile/60877ccc000000000101c324', '_blank');
                    }}
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
                    const success = await copyToClipboard('_Alii_', t);
                    if (success) handleCopySuccess('wechat');
                  }}
                />
                <CopyEmailButton />
              </div>

              {/* 切换区 */}
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>
        )}
      </AnimatedContent>
    </footer>
  );
};

export default Footer;
