import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import TextLink from '@/components/TextLink';
import IconTextButton from '@/components/icon-text-botton';
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
const Footer = () => {
  // 获取语言上下文
  const { t } = useLanguage();
  
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

  // 调试：打印当前状态
  console.log(t('currentCopyState') + ':', copyStates);

  return (
    <footer className="pb-14 px-16 w-full h-fit flex flex-row justify-between items-stretch">
        {/* 背景遮罩 - 独立的快速过渡 */}
        <div
          className={`absolute bottom-0 left-0 right-0 w-full h-[300px] transition-opacity duration-100 z-0
          `}
          style={{
            background:
              "linear-gradient(to top, hsl(var(--press)), hsl(var(--press) / 0.01), transparent)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(48px)",
            maskImage:
              "linear-gradient(to top, black 0%, black 50%, transparent 100%)",
          }}
        />
            {/* 左 */}
            <div className="flex flex-col items-start justify-center gap-4 font-Ding z-10">
                <span className="text-secondary text-[120px] leading-[80%]">Alii</span>
                <span className="text-secondary text-[56px] leading-[100%]
                 mb-2">{t('learningCode')}</span>
                <div className="absolute bottom-8 left-16 font-regular text-disabled text-[14px] leading-[100%] flex flex-row gap-6">
                    <span>{t('copyright')}</span>
                    <span>{t('lastUpdated')}</span>
                </div>
            </div>

            {/* 右 */}
            <div className="flex flex-col items-end justify-end gap-6 z-10"> 
            
            <TextLink
                href="https://www.figma.com/design/OsMjuOsAZiPIMPK0ztUVR0/Alii---UX-Portfolio-2024?node-id=0-1&t=5jnQ7E3zqn3Wpan5-1"
                title={t('portfolioTooltip')}
            > {t('portfolio')} </TextLink>

            <TextLink
                href="https://www.miyoushe.com/zzz/accountCenter/postList?id=196941437"
                title={t('mainSiteTooltip')}
            > {t('mainSite')} </TextLink>


            <div className="flex flex-row items-center justify-center gap-3 mt-4">
                <div className="flex flex-row gap-1">

                {/* Bilibili 跳转按钮 */}
                <IconTextButton
                    text=""
                    icon={<BilibiliIcon />}
                    variant="ghost"
                    size="sm"
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
                    size="sm"
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
                    size="sm"
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

                <ThemeToggle /> 
                <LanguageToggle /> 
            </div>
            </div>
        </footer>
  );
};

export default Footer;
    