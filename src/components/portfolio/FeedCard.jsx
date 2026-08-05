"use client";

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocale } from '@/contexts/ProjectContext';
import { ImageOffIcon, TypeBadgeIcon } from '@/public/icons';
import { toPortfolioLocalSrc, toPortfolioThumbSrc } from '@/utils/portfolioImage';

/**
 * 图片占位 / 失败态
 */
const ImageFallback = ({ label }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-press">
    <ImageOffIcon className="text-disabled" />
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
  return (
    <div className="w-7 h-7 rounded-[6px] bg-card/80 backdrop-blur-sm flex items-center justify-center text-secondary shadow-sm">
      <TypeBadgeIcon type={type} />
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
  // Masonry 可能已把 img 换成 thumbs；这里仍对 CDN/本地做统一回退
  const primarySrc = toPortfolioThumbSrc(item.img || item.src || '');
  const localThumb = toPortfolioThumbSrc(toPortfolioLocalSrc(item.src || item.img, item.srcLocal));
  const [imgSrc, setImgSrc] = useState(primarySrc);

  const projectTitle = pickLocale(item.projectTitle, language);
  const frameTitle = pickLocale(item.title, language);

  return (
    <div className="group absolute inset-0 overflow-hidden rounded-[12px] bg-press">
      {item.type === 'image' ? (
        imgError ? (
          <ImageFallback label={item.alt || frameTitle} />
        ) : (
          <img
            src={imgSrc}
            alt={item.alt || frameTitle || projectTitle}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
            style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
            onError={() => {
              if (localThumb && imgSrc !== localThumb) {
                setImgSrc(localThumb);
                return;
              }
              setImgError(true);
            }}
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
