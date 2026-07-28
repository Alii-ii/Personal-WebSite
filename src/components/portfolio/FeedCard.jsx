"use client";

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocale } from '@/contexts/ProjectContext';

/**
 * 图片占位 / 失败态
 */
const ImageFallback = ({ label }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-press">
    <svg width="28" height="28" viewBox="0 0 24 24" className="text-disabled">
      <path
        d="M20.9672 8.47255C21.2585 8.17807 21.7333 8.1755 22.0278 8.46681C22.3223 8.75811 22.3248 9.23298 22.0335 9.52745C21.3553 10.2131 20.6425 10.8156 19.8957 11.3347L22.4627 13.9016C22.7556 14.1945 22.7556 14.6694 22.4627 14.9623C22.1698 15.2552 21.6949 15.2552 21.402 14.9623L18.5825 12.1428C17.5839 12.6816 16.531 13.0853 15.425 13.3533L16.3894 16.9526C16.4966 17.3527 16.2592 17.764 15.8591 17.8712C15.459 17.9784 15.0477 17.741 14.9405 17.3409L13.9454 13.6269C13.3128 13.7089 12.6644 13.75 12.0004 13.75C11.3363 13.75 10.6879 13.7089 10.0553 13.6269L9.06011 17.3409C8.95291 17.741 8.54166 17.9784 8.14156 17.8712C7.74146 17.764 7.50401 17.3527 7.61121 16.9526L8.57566 13.3533C7.46966 13.0853 6.41676 12.6816 5.41817 12.1428L2.59869 14.9623C2.3058 15.2552 1.83093 15.2552 1.53803 14.9623C1.24514 14.6694 1.24514 14.1945 1.53803 13.9016L4.10497 11.3347C3.3582 10.8156 2.64538 10.2131 1.96715 9.52745C1.67584 9.23298 1.67841 8.75811 1.97289 8.46681C2.26736 8.1755 2.74223 8.17807 3.03353 8.47255C5.5312 10.9974 8.50611 12.25 12.0004 12.25C15.4946 12.25 18.4695 10.9974 20.9672 8.47255Z"
        fill="currentColor"
      />
    </svg>
    {label ? (
      <span className="font-regular text-[12px] leading-[18px] text-disabled px-4 text-center line-clamp-2">
        {label}
      </span>
    ) : null}
  </div>
);

/**
 * 类型角标：让作品墙上一眼分得清图片 / 代码原型 / 图文混排
 */
const TypeBadge = ({ type }) => {
  const paths = {
    image: 'M3 5.5A2.5 2.5 0 0 1 5.5 3h9A2.5 2.5 0 0 1 17 5.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 3 14.5v-9Zm2.5-1a1 1 0 0 0-1 1v6.3l2.6-2.2a1 1 0 0 1 1.3 0l2.7 2.3 1.6-1.3a1 1 0 0 1 1.3 0l1.5 1.3V5.5a1 1 0 0 0-1-1h-9Zm2 2.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z',
    prototype: 'M7.4 5.3a.75.75 0 0 1 0 1.06L4.06 9.7a.42.42 0 0 0 0 .6l3.34 3.34a.75.75 0 1 1-1.06 1.06l-3.34-3.34a1.92 1.92 0 0 1 0-2.72L6.34 5.3a.75.75 0 0 1 1.06 0Zm5.2 0a.75.75 0 0 1 1.06 0L17 8.64a1.92 1.92 0 0 1 0 2.72L13.66 14.7a.75.75 0 1 1-1.06-1.06l3.34-3.34a.42.42 0 0 0 0-.6L12.6 6.36a.75.75 0 0 1 0-1.06Z',
    rich: 'M4 5.25c0-.41.34-.75.75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 5.25Zm0 3.5c0-.41.34-.75.75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 8.75Zm0 3.5c0-.41.34-.75.75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75Z',
  };

  return (
    <div className="w-7 h-7 rounded-[6px] bg-card/80 backdrop-blur-sm flex items-center justify-center text-secondary shadow-sm">
      <svg width="20" height="20" viewBox="0 0 20 20">
        <path d={paths[type] || paths.image} fill="currentColor" />
      </svg>
    </div>
  );
};

/**
 * 代码原型预览：作品墙只做「看得出是什么」的低成本静态预览，完整交互在 L3
 */
const PrototypePreview = ({ html }) => (
  <div className="absolute inset-0 overflow-hidden bg-press">
    <div
      className="origin-top-left scale-[0.72] w-[139%] text-main pointer-events-none select-none"
      dangerouslySetInnerHTML={{ __html: html || '' }}
    />
  </div>
);

/**
 * 图文混排预览
 */
const RichPreview = ({ blocks = [], language }) => (
  <div className="absolute inset-0 overflow-hidden bg-press px-5 py-5 flex flex-col gap-2">
    {blocks.slice(0, 4).map((block, index) => {
      const text = pickLocale(block.content, language);
      if (block.variant === 'display') {
        return (
          <p key={index} className="font-Ding text-[20px] leading-[28px] text-main line-clamp-3">
            {text}
          </p>
        );
      }
      if (block.variant === 'heading') {
        return (
          <p key={index} className="font-regular text-[13px] leading-[20px] text-tertiary">
            {text}
          </p>
        );
      }
      if (block.variant === 'caption') {
        return (
          <p key={index} className="font-light text-[11px] leading-[16px] text-disabled mt-auto">
            {text}
          </p>
        );
      }
      return (
        <p key={index} className="font-regular text-[13px] leading-[20px] text-secondary line-clamp-2">
          {text}
        </p>
      );
    })}
  </div>
);

/**
 * L2 作品墙卡片
 * 作为 Masonry 的 renderItem 使用：铺的是 frame（图片 / 代码原型 / 图文混排），
 * 点击下钻到所属项目的 L3 详情页
 * @param {Object} item - 由 getFeedFrames 产出的 feed item
 */
const FeedCard = ({ item }) => {
  const { language } = useLanguage();
  const [imgError, setImgError] = useState(false);

  const projectTitle = pickLocale(item.projectTitle, language);
  const frameTitle = pickLocale(item.title, language);

  return (
    <div className="group absolute inset-0 overflow-hidden rounded-[12px] bg-press">
      {item.type === 'image' ? (
        imgError ? (
          <ImageFallback label={item.alt || frameTitle} />
        ) : (
          <img
            src={item.src}
            alt={item.alt || frameTitle || projectTitle}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
            style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
            onError={() => setImgError(true)}
          />
        )
      ) : item.type === 'prototype' ? (
        <PrototypePreview html={item.html} />
      ) : (
        <RichPreview blocks={item.blocks} language={language} />
      )}

      {/* 左上角类型角标 */}
      <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <TypeBadge type={item.type} />
      </div>

      {/* hover 浮出项目信息，提示可下钻 */}
      <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 bg-gradient-to-t from-black/55 to-transparent pointer-events-none">
        <p className="font-Ding text-[15px] leading-[22px] text-white truncate">{projectTitle}</p>
        <p className="font-regular text-[12px] leading-[18px] text-white/70 truncate">
          {frameTitle || item.period}
        </p>
      </div>
    </div>
  );
};

export default FeedCard;
