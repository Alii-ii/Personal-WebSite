"use client";

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocale } from '@/contexts/ProjectContext';

/**
 * 通用错误 / 占位态
 */
const FrameFallback = ({ message, action }) => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-press">
    <svg width="32" height="32" viewBox="0 0 24 24" className="text-disabled">
      <path
        d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm0 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM12 15a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm0-8a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0v-5A.75.75 0 0 1 12 7Z"
        fill="currentColor"
      />
    </svg>
    <p className="font-regular text-[13px] leading-[20px] text-tertiary">{message}</p>
    {action}
  </div>
);

/**
 * 图片型 frame
 * 定高+固定比例+自适应宽度，图片填满容器并居中裁剪
 */
const ImageFrame = ({ frame, title }) => {
  const [error, setError] = useState(false);
  if (error) return <FrameFallback message={frame.alt || title || '图片加载失败'} />;
  return (
    <div className="w-full h-full overflow-hidden">
      <img
        src={frame.src}
        alt={frame.alt || title}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
};

/**
 * 代码原型型 frame
 * 支持两种数据形态：
 *   - url  : 外链原型，用 iframe 沙箱内嵌
 *   - html : 内联 HTML 片段，直接渲染
 */
const PrototypeFrame = ({ frame, title }) => {
  const [error, setError] = useState(false);

  if (frame.url) {
    if (error) {
      return (
        <FrameFallback
          message="原型加载失败"
          action={
            <a
              href={frame.url}
              target="_blank"
              rel="noreferrer"
              className="font-regular text-[13px] leading-[20px] text-secondary underline underline-offset-4 hover:text-main transition-colors"
            >
              在新窗口打开
            </a>
          }
        />
      );
    }
    return (
      <iframe
        src={frame.url}
        title={title || 'prototype'}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-forms"
        className="w-full h-full border-0 bg-card"
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div className="w-full h-full overflow-auto bg-press">
      <div className="text-main" dangerouslySetInnerHTML={{ __html: frame.html || '' }} />
    </div>
  );
};

/**
 * 图文混排 block 渲染
 * blocks 为递归结构，通过 layout 字段（column / row / grid）表达排版意图，
 * 新增 block 类型只需在此加一个分支
 */
const Block = ({ block, language }) => {
  if (block.type === 'text') {
    const text = pickLocale(block.content, language);
    const variantClass = {
      display: 'font-Ding text-[28px] md:text-[34px] leading-[1.35] text-main',
      heading: 'font-Ding text-[18px] md:text-[20px] leading-[1.4] text-main',
      body: 'font-regular text-[14px] md:text-[15px] leading-[1.7] text-secondary',
      caption: 'font-light text-[12px] leading-[18px] text-disabled',
    }[block.variant || 'body'];
    return <p className={variantClass}>{text}</p>;
  }

  if (block.type === 'image') {
    return (
      <img
        src={block.src}
        alt={block.alt || ''}
        loading="lazy"
        decoding="async"
        className="w-full rounded-[8px] object-cover"
      />
    );
  }

  if (block.type === 'code') {
    return (
      <pre className="w-full overflow-auto rounded-[8px] bg-press px-4 py-3">
        <code className="font-mono text-[12px] leading-[1.7] text-secondary whitespace-pre">
          {block.content}
        </code>
      </pre>
    );
  }

  if (block.type === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(block.blocks || []).map((child, index) => (
          <Block key={index} block={child} language={language} />
        ))}
      </div>
    );
  }

  return null;
};

/**
 * 图文混排型 frame
 */
const RichFrame = ({ frame, language }) => {
  const layoutClass = {
    row: 'flex flex-col md:flex-row gap-6 md:gap-10',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    column: 'flex flex-col gap-4',
  }[frame.layout || 'column'];

  return (
    <div className="w-full h-full overflow-auto bg-card px-8 md:px-14 py-8 md:py-12">
      <div className={layoutClass}>
        {(frame.blocks || []).map((block, index) => (
          <Block key={index} block={block} language={language} />
        ))}
      </div>
    </div>
  );
};

/**
 * L3 frame 通用渲染器
 * 按 frame.type 分发，新增类型只加一个分支，不影响既有类型
 * @param {Object} frame - 项目 frame 数据
 */
const FrameRenderer = ({ frame }) => {
  const { language } = useLanguage();
  if (!frame) return null;

  const title = pickLocale(frame.title, language);

  if (frame.type === 'image') return <ImageFrame frame={frame} title={title} />;
  if (frame.type === 'prototype') return <PrototypeFrame frame={frame} title={title} />;
  if (frame.type === 'rich') return <RichFrame frame={frame} language={language} />;

  return <FrameFallback message={`未知的内容类型：${frame.type}`} />;
};

export default FrameRenderer;
