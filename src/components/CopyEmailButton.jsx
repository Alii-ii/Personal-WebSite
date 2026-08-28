"use client";

import { useState } from 'react';
import IconTextButton from '@/components/icon-text-botton';
import { ActionSwapIcon } from '@/components/motion/action-swap';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckIcon, MailIcon } from '@/public/icons';

const EMAIL_ADDRESS = 'alii.wong@foxmail.com';

/**
 * 复制文本到剪贴板。
 * 优先使用现代 Clipboard API，失败时回退到传统方案。
 */
const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

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
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * 复用的复制邮箱按钮。
 * `appearance="footer"` 使用首页 footer 的按钮样式与 tooltip，
 * `appearance="sidebar"` 使用 /portfolio 左侧栏的小图标按钮样式。
 */
export default function CopyEmailButton({ appearance = 'footer' }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleClick = async () => {
    const success = await copyToClipboard(EMAIL_ADDRESS);
    if (!success) {
      console.error(t('copyFailed'));
      return;
    }

    setCopied(true);
    setTooltipOpen(true);

    window.setTimeout(() => {
      setCopied(false);
      setTooltipOpen(false);
    }, 500);
  };

  if (appearance === 'sidebar') {
    return (
      <IconTextButton
        text=""
        icon={
          <ActionSwapIcon value={copied ? 'copied' : 'idle'} animation="blur">
            {copied ? <CheckIcon /> : <MailIcon />}
          </ActionSwapIcon>
        }
        variant="ghost"
        size="sm"
        tooltip={copied ? t('emailCopied') : t('emailTooltip')}
        forceTooltipOpen={tooltipOpen}
        aria-label={copied ? t('emailCopied') : t('emailTooltip')}
        className="text-secondary hover:text-main grayscale hover:grayscale-0"
        onClick={handleClick}
      />
    );
  }

  return (
    <IconTextButton
      text=""
      icon={
        <ActionSwapIcon value={copied ? 'copied' : 'idle'} animation="blur">
          {copied ? <CheckIcon /> : <MailIcon />}
        </ActionSwapIcon>
      }
      variant="ghost"
      size="md"
      tooltip={copied ? t('emailCopied') : t('emailTooltip')}
      forceTooltipOpen={tooltipOpen}
      onClick={handleClick}
    />
  );
}
