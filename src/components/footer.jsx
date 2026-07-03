import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import TextLink from '@/components/TextLink';
import IconTextButton from '@/components/icon-text-botton';
import AnimatedContent from '@/effects/AnimatedContent';
import CyclingDecryptedText from '@/components/CyclingDecryptedText';
import { MailIcon, ChatsIcon, BilibiliIcon } from '@/public/icons';
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
 * Footer 组件 - 页面底部区域
 * 包含个人信息、链接和社交图标
 */
const Footer = ({ onUnderlinedClick, isGallery = false, showGallerySubtitle = true, className = '', maskHeight = '480px' }) => {
  // 获取语言上下文
  const { t } = useLanguage();
  // 获取路由对象
  const router = useRouter();
  
  // 复制状态管理
  const [copyStates, setCopyStates] = useState({
    wechat: false,
    email: false
  });

  // Tooltip 显示状态管理
  const [tooltipStates, setTooltipStates] = useState({
    wechat: false,
    email: false
  });

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
        // 布局基础
        "footer",
        "fixed bottom-0 left-0 right-0 w-full min-w-[300px] h-fit z-20",
        // 内边距和分行
        "pb-10 md:pb-12 px-6 md:px-16",
        // 行结构
        "flex flex-col md:flex-row justify-between items-start md:items-end gap-2 md:gap-0",
        // 额外自定义
        className,
      ].join(" ")}
    >
      {/* 背景遮罩 - 独立的快速过渡 */}
      <div
        className={[
          "footer__mask",
          "absolute bottom-0 left-0 right-0 w-full z-1",
          "transition-opacity duration-100",
          "select-none pointer-events-none",
        ].join(" ")}
        style={{
          height: maskHeight,
          background:
            "linear-gradient(to top, hsl(var(--neutral-bg-card)), hsl(var(--neutral-bg-card) / 0.8), hsl(var(--neutral-bg-card) / 0.5), transparent)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(48px)",
          maskImage: "linear-gradient(to top, black 0%, black 50%, transparent 100%)",
        }}
      />

      {/* 左区：动画/标题 */}
      <AnimatedContent
        direction="horizontal"
        reverse={true}
        distance={80}
        duration={1.2}
        delay={0.2}
        immediate={true}
        flex={false}
        className="footer__left h-full flex items-start justify-start"
      >
        <div className="footer__left-content flex flex-col items-start justify-center gap-4 md:pb-4 font-Ding z-10 select-none">
          {isGallery ? (
            // Gallery 页面：显示返回按钮
            <button
              onClick={() => router.push('/')}
              className="footer__back-btn text-secondary text-[48px] md:text-[56px] leading-[80%] hover:opacity-80 transition-opacity duration-200 cursor-pointer"
              title="返回首页"
            >
              ←
            </button>
          ) : (
            // 首页：显示 Alii 文案
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

      {/* 中区：版权信息 */}
      <CopyrightFade t={t} />

      {/* 右区：操作/链接 */}
      <AnimatedContent
        direction="horizontal"
        reverse={false}
        distance={80}
        duration={1.2}
        delay={0.2}
        immediate={true}
        flex={false}
        className="footer__right h-full flex items-start md:items-end justify-start md:items-end"
      >
        {isGallery ? (
          // 二级页极简区块
          <div className="footer__right-gallery flex flex-col items-start md:items-end gap-1 md:gap-6 z-10">
            <div className="footer__right-toggles flex flex-row-reverse md:flex-row items-center justify-start md:justify-center gap-2 md:gap-3 py-2 md:py-0">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>
        ) : (
          <div className="footer__right-main flex flex-col items-start md:items-end gap-1 md:gap-6 z-10">
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
                href="https://www.figma.com/design/OsMjuOsAZiPIMPK0ztUVR0/Alii---UX-Portfolio-2024?node-id=0-1&t=5jnQ7E3zqn3Wpan5-1"
                title={t('portfolioTooltip')}
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
                <IconTextButton
                  text=""
                  icon={<BilibiliIcon />}
                  variant="ghost"
                  size="md"
                  tooltip={t('bilibiliTooltip')}
                  onClick={() => {
                    window.open('https://space.bilibili.com/38773851/favlist?fid=702542351&ftype=create', '_blank');
                  }}
                />
                <IconTextButton
                  key={`wechat-${copyStates.wechat}`}
                  text=""
                  icon={<ChatsIcon />}
                  variant="ghost"
                  size="md"
                  tooltip={copyStates.wechat ? t('wechatCopied') : t('wechatTooltip')}
                  forceTooltipOpen={tooltipStates.wechat}
                  onClick={async () => {
                    const success = await copyToClipboard('_Alii_', t);
                    if (success) handleCopySuccess('wechat');
                  }}
                />
                <IconTextButton
                  key={`email-${copyStates.email}`}
                  text=""
                  icon={<MailIcon />}
                  variant="ghost"
                  size="md"
                  tooltip={copyStates.email ? t('emailCopied') : t('emailTooltip')}
                  forceTooltipOpen={tooltipStates.email}
                  onClick={async () => {
                    const success = await copyToClipboard('alii.wong@foxmail.com', t);
                    if (success) handleCopySuccess('email');
                  }}
                />
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
