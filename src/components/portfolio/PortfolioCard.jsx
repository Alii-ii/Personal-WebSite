"use client";

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocale } from '@/contexts/ProjectContext';
import EdgeMask from '@/components/EdgeMask';
import ImageLoadingIndicator from '@/components/ImageLoadingIndicator';

const CardImage = ({ src, alt, eager = false, showErrorTitle = false, errorTitle = '' }) => {
  const imageRef = useRef(null);
  const [status, setStatus] = useState(src ? 'loading' : 'error');

  useEffect(() => {
    setStatus(src ? 'loading' : 'error');

    const image = imageRef.current;
    if (image?.complete) {
      setStatus(image.naturalWidth > 0 ? 'loaded' : 'error');
    }
  }, [src]);

  const isLoaded = status === 'loaded';
  const isError = status === 'error';

  return (
    <>
      {!isError && (
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          className={`w-full h-full object-cover object-top transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ transform: 'translateZ(0)' }}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          aria-hidden={showErrorTitle ? undefined : 'true'}
        />
      )}
      {status === 'loading' && (
        <div
          className={`absolute inset-0 flex items-center justify-center ${showErrorTitle ? '' : 'bg-press'}`}
          style={showErrorTitle ? {
            background: 'linear-gradient(hsl(var(--neutral-bg-press)), hsl(var(--neutral-bg-press))), hsl(var(--neutral-bg-card))',
          } : undefined}
        >
          <ImageLoadingIndicator />
        </div>
      )}
      {isError && (
        <div className="absolute inset-0 bg-press flex items-center justify-center">
          {showErrorTitle && (
            <span className="text-disabled font-regular text-[14px]">{errorTitle}</span>
          )}
        </div>
      )}
    </>
  );
};

/**
 * 作品集卡片组件 — 匹配 Figma protfolio_set 组件 (node 11272:7373)
 *
 * Default 态：容器宽高比 562:300，多层叠放效果（项目卡片）。
 * Hover 态：前层卡片叠加 EdgeMask from="left" — 复用 footer 调好的模糊渐变参数。
 *
 * isResume 模式：仅单张封面，hover 时同样有 EdgeMask 效果。
 */
const PortfolioCard = ({ project, previewSrcs = [], onClick, isResume = false, disabled = false }) => {
  const { language } = useLanguage();
  const [hovered, setHovered] = useState(false);

  const title = isResume ? '查看简历' : (project ? pickLocale(project.title, language) : '');
  const subtitle = disabled && project ? pickLocale(project.summary, language) : '';
  const coverSrc = previewSrcs[0] || '';

  /* ─── 卡片布局参数 ─── */
  const W = 562;
  const H = 300;

  /**
   * 0.5px 描边层 — 用于卡片内部各图层
   */
  const strokeOverlay = (
    <div
      className="absolute inset-0 rounded-[12px] pointer-events-none"
      style={{ border: '0.5px solid hsl(var(--neutral-bg-stroke))' }}
    />
  );

  /**
   * 顶层描边 — z-30，始终在 hoverMask(z-20) 之上
   * 仅左+上+下三侧，不含右侧 — 因为 EdgeMask 从左到右渐变，
   * 右侧是透明/清晰区域，如果有描边会在不透明图片上露出
   */
  const strokeColor = 'hsl(var(--neutral-bg-stroke))';
  const topStroke = (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        zIndex: 30,
        border: `0.5px solid ${strokeColor}`,
        borderRadius: '12px',
        clipPath: 'inset(0 12px 0 0)',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.3s ease-out',
      }}
    />
  );

  // 后层数据：从远到近
  const backLayers = [
    { w: 460, h: 259, x: 96,  y: 21, hx: 462, srcIdx: 3, overlayOpacity: 0.8 },
    { w: 485, h: 273, x: 66,  y: 14, hx: 317, srcIdx: 2, overlayOpacity: 0.6 },
    { w: 509, h: 286, x: 34,  y: 7,  hx: 158, srcIdx: 1, overlayOpacity: 0.4 },
  ];

  /**
   * Hover mask — 直接复用 EdgeMask from="left"，保留已调好的模糊渐变参数
   */
  const hoverMask = (
    <div
      className="absolute inset-0 rounded-[12px] overflow-hidden pointer-events-none"
      style={{
        zIndex: 20,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.3s ease-out',
      }}
    >
      <EdgeMask from="left" width="80%" />
      {/* 箭头 — z-20 确保在 EdgeMask(z-10) 之上 */}
      <div className="absolute inset-y-0 left-0 z-20 flex items-center justify-center pointer-events-none" style={{ width: '25%' }}>
        <span className="font-Ding text-[42px] leading-[1] text-main opacity-60 select-none">
          →
        </span>
      </div>
    </div>
  );

  // ── 禁用卡片：纯占位，不可点击，无 hover 效果 ──
  if (disabled) {
    return (
      <div className="relative w-full rounded-[12px] px-8 py-5 bg-press/50">
        <div className="flex flex-col gap-1">
          <span className="text-tertiary font-regular text-[16px]">{title}</span>
          {subtitle && <span className="text-disabled font-regular text-[13px]">{subtitle}</span>}
        </div>
        {strokeOverlay}
      </div>
    );
  }

  // ── 简历卡片：单张封面 + hover mask ──
  if (isResume) {
    return (
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group relative w-full cursor-pointer focus:outline-none"
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        <div className="absolute top-0 left-0 w-full h-full rounded-[12px] overflow-hidden">
          <CardImage
            src={coverSrc}
            alt={title}
            eager
            showErrorTitle
            errorTitle={title}
          />
          {strokeOverlay}
        </div>
        {hoverMask}
        {topStroke}
      </button>
    );
  }

  // ── 项目卡片：多层叠放 + hover 展开 + hover mask ──
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative w-full cursor-pointer focus:outline-none"
      style={{ aspectRatio: `${W} / ${H}` }}
    >
      {/* ── 后层（真实图片预览 + 渐变遮罩，从远到近） ── */}
      {backLayers.map((layer, i) => {
        const wPct = (layer.w / W) * 100;
        const hPct = (layer.h / H) * 100;
        const defaultX = (layer.x / W) * 100;
        const yPct = (layer.y / H) * 100;
        const hoverX = (layer.hx / W) * 100;

        const currentX = hovered ? hoverX : defaultX;
        const layerSrc = previewSrcs[layer.srcIdx] || coverSrc;

        const maskColor = 'hsl(var(--neutral-bg-card))';
        const op = layer.overlayOpacity;

        return (
          <div
            key={i}
            className="absolute rounded-[12px] overflow-hidden"
            style={{
              width: `${wPct}%`,
              height: `${hPct}%`,
              left: `${currentX}%`,
              top: `${yPct}%`,
              zIndex: i + 1,
              transition: 'left 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <CardImage src={layerSrc} alt="" />
            {/* bg-card 渐变遮罩 — 从四周边缘向内渐隐 */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: [
                  `linear-gradient(to right, ${maskColor} 0%, transparent 40%)`,
                  `linear-gradient(to left, ${maskColor} 0%, transparent 40%)`,
                  `linear-gradient(to bottom, ${maskColor} 0%, transparent 40%)`,
                  `linear-gradient(to top, ${maskColor} 0%, transparent 40%)`,
                ].join(', '),
                opacity: hovered ? 0 : op,
                transition: 'opacity 0.35s ease-out',
              }}
            />
            {/* 0.5px 描边 */}
            {strokeOverlay}
          </div>
        );
      })}

      {/* ── 最前层 p01：第 1 帧封面图 ── */}
      <div
        className="absolute top-0 left-0 rounded-[12px] overflow-hidden"
        style={{
          width: `${(533 / W) * 100}%`,
          height: '100%',
          zIndex: backLayers.length + 1,
        }}
      >
        <CardImage
          src={coverSrc}
          alt={title}
          showErrorTitle
          errorTitle={title}
        />
        {/* 0.5px 描边 */}
        {strokeOverlay}
      </div>

      {/* ── Hover mask：复用 EdgeMask from="left" ── */}
      {hoverMask}
      {/* ── 顶层描边：始终在 mask 之上 ── */}
      {topStroke}
    </button>
  );
};

export default PortfolioCard;
