"use client";

import { useState } from 'react';
import IconTextButton from '@/components/icon-text-botton';
import { ActionSwapIcon } from '@/components/motion/action-swap';
import { MailIcon, ChatsIcon, CheckIcon, FigmaIcon, XiaohongshuIcon, DownloadIcon } from '@/public/icons';

const WECHAT_ID = '13632359551';
const EMAIL = 'alii.wong@foxmail.com';
const FIGMA_URL = 'https://www.figma.com/design/OsMjuOsAZiPIMPK0ztUVR0/Alii---UX-Portfolio-2024';
const XHS_URL = 'https://www.xiaohongshu.com/user/profile/60877ccc000000000101c324';

const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    return true;
  } catch (error) {
    console.error('复制失败', error);
    return false;
  }
};

const downloadResume = () => {
  const link = document.createElement('a');
  link.href = '/resume/resume-zh.pdf';
  link.download = '【简历】产品设计-黄奕礼.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function ResumeContactActions({ menu = false, className = '' }) {
  const [copyStates, setCopyStates] = useState({ wechat: false, email: false });
  const [tooltipStates, setTooltipStates] = useState({ wechat: false, email: false });
  const [figmaHovered, setFigmaHovered] = useState(false);
  const [xhsHovered, setXhsHovered] = useState(false);

  const handleCopySuccess = (type) => {
    setCopyStates((previous) => ({ ...previous, [type]: true }));
    setTooltipStates((previous) => ({ ...previous, [type]: true }));
    setTimeout(() => {
      setCopyStates((previous) => ({ ...previous, [type]: false }));
      setTooltipStates((previous) => ({ ...previous, [type]: false }));
    }, 1000);
  };

  const actions = (
    <>
      <div className="shrink-0">
        <IconTextButton
          text={menu ? '' : '下载PDF'}
          icon={<DownloadIcon />}
          variant="default"
          size="md"
          tooltip="下载简历 PDF"
          aria-label="下载简历 PDF"
          onClick={downloadResume}
        />
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
          tooltip={copyStates.wechat ? '已复制 ✓' : '复制微信号'}
          aria-label={copyStates.wechat ? '微信号已复制' : '复制微信号'}
          forceTooltipOpen={tooltipStates.wechat}
          onClick={async () => {
            const success = await copyToClipboard(WECHAT_ID);
            if (success) handleCopySuccess('wechat');
          }}
        />
      </div>

      <div className="shrink-0">
        <IconTextButton
          text=""
          icon={
            <ActionSwapIcon value={copyStates.email ? 'copied' : 'idle'} animation="blur">
              {copyStates.email ? <CheckIcon /> : <MailIcon />}
            </ActionSwapIcon>
          }
          variant="ghost"
          size="md"
          tooltip={copyStates.email ? '已复制 ✓' : '复制邮箱'}
          aria-label={copyStates.email ? '邮箱已复制' : '复制邮箱'}
          forceTooltipOpen={tooltipStates.email}
          onClick={async () => {
            const success = await copyToClipboard(EMAIL);
            if (success) handleCopySuccess('email');
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
          aria-label="打开 Figma Portfolio"
          onClick={() => window.open(FIGMA_URL, '_blank')}
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
          aria-label="打开小红书"
          onClick={() => window.open(XHS_URL, '_blank')}
        />
      </div>
    </>
  );

  if (menu) return actions;

  return (
    <div className={`mt-4 flex flex-wrap items-center gap-1 ${className}`}>
      {actions}
    </div>
  );
}
