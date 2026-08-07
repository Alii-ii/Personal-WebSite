"use client";

// 项目帧内容渲染器：按 image、prototype、rich 等 frame 类型选择具体展示方式。
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocale } from '@/contexts/ProjectContext';
import { AlertCircleIcon } from '@/public/icons';
import { toPortfolioLocalSrc } from '@/utils/portfolioImage';
import NoCodeForProCodeDemo from '@/components/portfolio/NoCodeForProCodeDemo';

/**
 * 通用错误 / 占位态
 */
const FrameFallback = ({ message, action }) => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-press">
    <AlertCircleIcon className="text-disabled" />
    <p className="font-regular text-[13px] leading-[20px] text-tertiary">{message}</p>
    {action}
  </div>
);

/**
 * 图片型 frame
 * 外框已按图片真实比例定尺寸（见 ProjectDetail 的 useImageRatios），
 * 故此处让图片以 block 完全铺满容器：既无裁切也无留白，边到边无缝包裹。
 * 用 object-cover 而非 contain —— 比例一致时二者等效，
 * 但 cover 能吸收亚像素舍入误差，不会在边缘露出 1px 底色。
 */
const ImageFrame = ({ frame, title }) => {
  const localSrc = toPortfolioLocalSrc(frame.src, frame.srcLocal);
  // 优先 CDN；失败后切本地兜底，再失败才显示错误态
  const [src, setSrc] = useState(frame.src);
  const [error, setError] = useState(false);

  if (error) return <FrameFallback message={frame.alt || title || '图片加载失败'} />;
  return (
    <img
      src={src}
      alt={frame.alt || title}
      loading="lazy"
      decoding="async"
      draggable={false}
      className="block w-full h-full object-cover select-none [-webkit-user-drag:none]"
      onError={() => {
        if (localSrc && src !== localSrc) {
          setSrc(localSrc);
          return;
        }
        setError(true);
      }}
    />
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
    // Figma embed 需要完整的权限策略：
    //   - clipboard-write：Figma 的复制功能
    //   - storage-access：第三方 cookie/storage（Figma 内部跨域资源依赖此权限）
    //   - 不设 sandbox：Figma 内部多层 iframe + WASM 需要完整浏览器能力
    const isFigma = frame.url.includes('figma.com');
    return (
      <iframe
        src={frame.url}
        title={title || 'prototype'}
        {...(!isFigma && { loading: 'lazy', sandbox: 'allow-scripts allow-same-origin allow-forms' })}
        {...(isFigma && {
          allow: 'clipboard-write; storage-access; cross-origin-isolated',
        })}
        allowFullScreen
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
        draggable={false}
        className="w-full rounded-[8px] object-contain select-none [-webkit-user-drag:none]"
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
  if (frame.type === 'nocode-for-pro-code') return <NoCodeForProCodeDemo />;

  return <FrameFallback message={`未知的内容类型：${frame.type}`} />;
};

export default FrameRenderer;
