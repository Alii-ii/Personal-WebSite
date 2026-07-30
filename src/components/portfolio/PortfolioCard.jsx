"use client";

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocale } from '@/contexts/ProjectContext';

/**
 * 作品集卡片组件 — 匹配 Figma protfolio_set 组件
 *
 * 多张封面图叠放、透视渐远，hover 时整体微缩。
 * 每张封面带半透明遮罩模拟景深。
 *
 * @param {Object} project     - portfolio.json 中的 project 对象
 * @param {string} coverSrc    - 封面图路径
 * @param {Function} onClick   - 点击回调
 * @param {boolean} isResume   - 是否为简历卡片（仅一张图，不做层叠）
 */
const PortfolioCard = ({ project, coverSrc, onClick, isResume = false }) => {
  const { language } = useLanguage();
  const [imgError, setImgError] = useState(false);

  const title = project ? pickLocale(project.title, language) : '';

  // 简历卡片：单层，无层叠效果
  if (isResume) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group relative w-full overflow-hidden rounded-[12px] cursor-pointer transition-transform duration-300 ease-out hover:scale-[0.98] active:scale-[0.96] focus:outline-none"
        style={{ aspectRatio: '533 / 300' }}
      >
        {imgError ? (
          <div className="absolute inset-0 bg-press flex items-center justify-center">
            <span className="text-disabled font-regular text-[14px]">简历预览</span>
          </div>
        ) : (
          <img
            src={coverSrc}
            alt="简历预览"
            loading="eager"
            className="w-full h-full object-cover"
            style={{ transform: 'translateZ(0)' }}
            onError={() => setImgError(true)}
          />
        )}
        {/* hover 浮出标题 */}
        <div className="absolute inset-x-0 bottom-0 px-5 pb-4 pt-12 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
          <p className="font-Ding text-[15px] leading-[22px] text-white">查看简历</p>
        </div>
      </button>
    );
  }

  // 作品集卡片：多层叠放效果（匹配 Figma protfolio_set）
  // Figma 中每个 portfolio_set 有 6 层（p01 最前 → Page 最后），
  // 这里用 CSS 模拟 3-4 层叠放透视效果
  const layers = [
    { scale: 0.865, offsetY: -14, opacity: 0.35, blur: 6 },  // 最后层
    { scale: 0.91,  offsetY: -7,  opacity: 0.55, blur: 3 },  // 中间层
    { scale: 0.955, offsetY: -2,  opacity: 0.75, blur: 1 },  // 次前层
  ];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full cursor-pointer transition-transform duration-300 ease-out hover:scale-[0.98] active:scale-[0.96] focus:outline-none"
      style={{ aspectRatio: '562 / 300' }}
    >
      {/* 背景层叠效果 */}
      {layers.map((layer, i) => (
        <div
          key={i}
          className="absolute left-1/2 bottom-0 rounded-[12px] overflow-hidden border border-stroke/15"
          style={{
            width: `${layer.scale * 100}%`,
            aspectRatio: '533 / 300',
            transform: `translateX(-50%) translateY(${layer.offsetY}px)`,
            zIndex: i,
          }}
        >
          {/* 封面图 */}
          {!imgError && (
            <img
              src={coverSrc}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover"
              style={{ transform: 'translateZ(0)' }}
              aria-hidden="true"
            />
          )}
          {/* 半透明遮罩 — 模拟深色透视衰减 */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: `hsl(var(--neutral-bg-card) / ${layer.opacity})`,
              backdropFilter: `blur(${layer.blur}px)`,
              WebkitBackdropFilter: `blur(${layer.blur}px)`,
            }}
          />
        </div>
      ))}

      {/* 最前层（主封面） */}
      <div
        className="absolute left-1/2 bottom-0 rounded-[12px] overflow-hidden border border-stroke/15"
        style={{
          width: '95%',
          aspectRatio: '533 / 300',
          transform: 'translateX(-50%)',
          zIndex: layers.length,
          boxShadow: '0 2px 10px -1px hsl(var(--neutral-bg-card) / 0.1)',
        }}
      >
        {imgError ? (
          <div className="absolute inset-0 bg-press flex items-center justify-center">
            <span className="text-disabled font-regular text-[14px]">{title}</span>
          </div>
        ) : (
          <img
            src={coverSrc}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover"
            style={{ transform: 'translateZ(0)' }}
            onError={() => setImgError(true)}
          />
        )}

        {/* hover 浮出项目信息 */}
        <div className="absolute inset-x-0 bottom-0 px-5 pb-4 pt-12 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
          <p className="font-Ding text-[15px] leading-[22px] text-white truncate">{title}</p>
          {project?.period && (
            <p className="font-regular text-[12px] leading-[18px] text-white/70">
              {project.period}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};

export default PortfolioCard;
