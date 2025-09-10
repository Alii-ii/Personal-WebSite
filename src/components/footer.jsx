import { useState } from 'react';
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
 * Footer 组件 - 页面底部区域
 * 包含个人信息、链接和社交图标
 */
const Footer = ({ onUnderlinedClick, isGallery = false }) => {
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
    console.log(`${t('copySuccess')}: ${type}`);
    
    // 更新复制状态
    setCopyStates(prev => {
      const newState = {
        ...prev,
        [type]: true
      };
      console.log(t('newCopyState') + ':', newState);
      return newState;
    });

    // 强制显示 tooltip
    setTooltipStates(prev => ({
      ...prev,
      [type]: true
    }));
    
    // 重置状态
    setTimeout(() => {
      console.log(`${t('resetState')}: ${type}`);
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
    console.log('点击了下划线文本:', text);
    // 调用父组件传递的点击处理函数
    if (onUnderlinedClick) {
      onUnderlinedClick(text);
    }
  };

  // 调试：打印当前状态
  console.log(t('currentCopyState') + ':', copyStates);

  return (
    <footer className="fixed bottom-0 left-0 right-0 pb-10 md:pb-12 px-6 md:px-16 w-full h-fit flex flex-col md:flex-row justify-between items-start md:items-end gap-2 md:gap-0 z-20">
      {/* 背景遮罩 - 独立的快速过渡 */}
      <div
        className={`absolute bottom-0 left-0 right-0 w-full h-[480px] transition-opacity duration-100 z-1 select-none pointer-events-none
        `}
        style={{
          background:
            "linear-gradient(to top, hsl(var(--neutral-bg-card)), hsl(var(--neutral-bg-card) / 0.8), hsl(var(--neutral-bg-card) / 0.7), transparent)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(48px)",
          maskImage:
            "linear-gradient(to top, black 0%, black 50%, transparent 100%)",
        }}
      />

      {/* 左侧内容 - 从左侧滑入 */}
      <AnimatedContent
        direction="horizontal"
        reverse={true}
        distance={80}
        duration={1.2}
        delay={0.2}
        immediate={true}
        flex={false}
        className="h-full flex items-start justify-start"
      >
        <div className="flex flex-col items-start justify-center gap-4 md:pb-4 font-Ding z-10 select-none">

            {isGallery ? (
              // Gallery 页面：显示返回按钮
              <button
                onClick={() => router.push('/')}
                className="text-secondary text-[48px] md:text-[56px] leading-[80%] hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                title="返回首页"
              >
                ←
              </button>
            ) : (
              // 首页：显示 Alii 文案
              <span className="text-secondary text-[108px] md:text-[120px] leading-[80%]">Alii</span>
            )}
            
            {isGallery ? (
              // Gallery 页面：只显示投稿文案，不循环
              <CyclingDecryptedText
                texts={[t('lastPostDays')]} // 只传入一个文案
                cycleInterval={0} // 不循环
                className="text-[48px] md:text-[56px] leading-[100%] mb-2"
                onUnderlinedClick={handleUnderlinedClick}
                underlineOpacity={50}
                hoverOpacity={80}
                decryptedProps={{
                  speed: 40,
                  maxIterations: 6,
                  sequential: true,
                  revealDirection: 'start',
                  useOriginalCharsOnly: true
                }}
              />
            ) : (
              // 首页：正常循环显示文案
              <CyclingDecryptedText
                texts={[t('learningCode'), t('lastPostDays')]}
                cycleInterval={3000}
                className="text-[48px] md:text-[56px] leading-[100%] mb-2"
                onUnderlinedClick={handleUnderlinedClick}
                underlineOpacity={50}
                hoverOpacity={80}
                decryptedProps={{
                  speed: 40,
                  maxIterations: 6,
                  sequential: true,
                  revealDirection: 'start',
                  useOriginalCharsOnly: true
                }}
              />
            )}
            
        </div>
      </AnimatedContent>
            
      {/* 版权信息 - 独立于动画框架，保持绝对定位 */}
      {/* 
        页面刷新后，延迟后再渐变显示（opacity从0到1）
        使用Tailwind的transition和opacity类，配合useEffect控制
        现在transition的时间为300ms
      */}
      {(() => {
        // 使用useState和useEffect实现延迟渐显
        // 由于JSX中不能直接用hook，这里用IIFE+useState/useEffect
        const React = require('react');
        const { useState, useEffect } = React;
        function CopyrightFade() {
          const [show, setShow] = useState(false);
          useEffect(() => {
            const timer = setTimeout(() => setShow(true), 800);
            return () => clearTimeout(timer);
          }, []);
          return (
            <div
              // 使用Tailwind的transition-opacity和duration-300
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
        }
        return <CopyrightFade />;
      })()}

      {/* 右侧内容 - 从右侧滑入 */}
      <AnimatedContent
        direction="horizontal"
        reverse={false}
        distance={80}
        duration={1.2}
        delay={0.2}
        immediate={true}
        flex={false}
        className="h-full flex items-start md:items-end justify-start md:items-end"
      >
        <div className="flex flex-col items-start md:items-end gap-1 md:gap-6 z-10"> 

          {/* 强调入口 */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-start gap-6 pt-4 md:pt-0">
            <TextLink
                href="https://www.figma.com/design/OsMjuOsAZiPIMPK0ztUVR0/Alii---UX-Portfolio-2024?node-id=0-1&t=5jnQ7E3zqn3Wpan5-1"
                title={t('portfolioTooltip')}
            > {t('resume')} </TextLink>

            <TextLink
                href="https://www.figma.com/design/OsMjuOsAZiPIMPK0ztUVR0/Alii---UX-Portfolio-2024?node-id=0-1&t=5jnQ7E3zqn3Wpan5-1"
                title={t('portfolioTooltip')}
            > {t('portfolio')} </TextLink>

            <TextLink
                href="https://www.miyoushe.com/zzz/accountCenter/postList?id=196941437"
                title={t('mainSiteTooltip')}
            > {t('mainSite')} </TextLink>
          </div>

          {/* 底部行 */}
          <div className="flex flex-row-reverse md:flex-row items-center justify-start md:justify-center gap-2 md:gap-3 py-2 md:py-0">

            {/* 小按钮组 */}
            <div className="flex flex-row gap-0.5 md:gap-1">
              {/* Bilibili 跳转按钮 */}
              <IconTextButton
                  text=""
                  icon={<BilibiliIcon />}
                  variant="ghost"
                  size="md"
                  tooltip={t('bilibiliTooltip')}
                  onClick={() => {
                      window.open('https://space.bilibili.com/38773851/favlist?fid=702542351&ftype=create', '_blank'); // 替换为你的B站主页链接
                      console.log(t('jumpToBilibili'));
                  }}
              />
              {/* 微信号复制按钮 */}
              <IconTextButton
                  key={`wechat-${copyStates.wechat}`}
                  text=""
                  icon={<ChatsIcon />}
                  variant="ghost"
                  size="md"
                  tooltip={copyStates.wechat ? t('wechatCopied') : t('wechatTooltip')}
                  forceTooltipOpen={tooltipStates.wechat}
                  onClick={async () => {
                      console.log(t('clickWechatCopy'));
                      const success = await copyToClipboard('_Alii_', t);
                      console.log(t('copyResult') + ':', success);
                      if (success) {
                          handleCopySuccess('wechat');
                          console.log(t('wechatCopiedToClipboard'));
                      }
                  }}
              />
              {/* 邮箱复制按钮 */}
              <IconTextButton
                  key={`email-${copyStates.email}`}
                  text=""
                  icon={<MailIcon />}
                  variant="ghost"
                  size="md"
                  tooltip={copyStates.email ? t('emailCopied') : t('emailTooltip')}
                  forceTooltipOpen={tooltipStates.email}
                  onClick={async () => {
                      console.log(t('clickEmailCopy'));
                      const success = await copyToClipboard('alii.wong@foxmail.com', t);
                      console.log(t('copyResult') + ':', success);
                      if (success) {
                          handleCopySuccess('email');
                          console.log(t('emailCopiedToClipboard'));
                      }
                  }}
              />
            </div>

            {/* 切换组 */}
            <ThemeToggle /> 
            <LanguageToggle /> 
          </div>

        </div>
      </AnimatedContent>
    </footer>
  );
};

export default Footer;
    