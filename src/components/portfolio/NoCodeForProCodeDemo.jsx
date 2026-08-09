"use client";

import { motion } from 'framer-motion';
import { useState } from 'react';

const STEP_CONFIGS = [
  {
    text: '嗨👋\n「菜单」功能移到这里了',
    tooltipDirection: 'top-right',
    arrowDirection: 'top',
    arrowOffset: '15%',
    catPosition: 'bottom',
    catOrientation: 'right',
  },
  {
    text: '🔔\n「通知」设置在这里',
    tooltipDirection: 'top-left',
    arrowDirection: 'top',
    arrowOffset: '85%',
    catPosition: 'bottom',
    catOrientation: 'left',
  },
  {
    text: '📁\n「文件管理」更方便了',
    tooltipDirection: 'left-bottom',
    arrowDirection: 'left',
    arrowOffset: '60%',
    catPosition: 'bottom',
    catOrientation: 'right',
  },
  {
    text: '⚙️\n「设置」界面重新设计',
    tooltipDirection: 'right-bottom',
    arrowDirection: 'right',
    arrowOffset: '60%',
    catPosition: 'bottom',
    catOrientation: 'left',
  },
  {
    text: '📊\n「数据统计」新功能',
    tooltipDirection: 'left-top',
    arrowDirection: 'left',
    arrowOffset: '40%',
    catPosition: 'top',
    catOrientation: 'right',
  },
  {
    text: '💬\n「帮助中心」就在这里',
    tooltipDirection: 'right-top',
    arrowDirection: 'right',
    arrowOffset: '40%',
    catPosition: 'top',
    catOrientation: 'left',
  },
  {
    text: '🚀\n「快捷操作」面板',
    tooltipDirection: 'bottom-right',
    arrowDirection: 'bottom',
    arrowOffset: '15%',
    catPosition: 'top',
    catOrientation: 'right',
  },
  {
    text: '✨\n「搜索」功能升级啦',
    tooltipDirection: 'bottom-left',
    arrowDirection: 'bottom',
    arrowOffset: '85%',
    catPosition: 'top',
    catOrientation: 'left',
  },
];

const ARROW_PATH = 'M1.63425e-05 0.499984C2.53676e-05 0.223848 0.22388 0 0.500016 0H9.50002C9.77617 0 10 0.223868 10 0.500016L10 0.82843C10 0.923186 9.92319 1 9.82843 1C9.29799 1 8.78929 1.22974 8.41421 1.6387L5.70711 4.59032C5.31658 5.01613 4.68342 5.01613 4.29289 4.59032L1.58579 1.6387C1.21071 1.22974 0.702006 1 0.171573 1C0.0768166 1 2.51066e-06 0.923183 5.60765e-06 0.828427L1.63425e-05 0.499984Z';

const getBorderRadius = ({ catPosition, catOrientation }) => {
  if (catPosition === 'top' && catOrientation === 'left') return '16px 36px 16px 16px';
  if (catPosition === 'top' && catOrientation === 'right') return '36px 16px 16px 16px';
  if (catPosition === 'bottom' && catOrientation === 'left') return '16px 16px 36px 16px';
  return '16px 16px 16px 36px';
};

const getTooltipPosition = ({ arrowDirection, arrowOffset }) => {
  if (arrowDirection === 'top') {
    return { left: '50%', top: 'calc(100% + 10px)', transform: `translateX(-${arrowOffset})` };
  }
  if (arrowDirection === 'bottom') {
    return { bottom: 'calc(100% + 10px)', left: '50%', transform: `translateX(-${arrowOffset})` };
  }
  if (arrowDirection === 'left') {
    return { left: 'calc(100% + 10px)', top: '50%', transform: `translateY(-${arrowOffset})` };
  }
  return { right: 'calc(100% + 10px)', top: '50%', transform: `translateY(-${arrowOffset})` };
};

const getTooltipMotion = ({ arrowDirection, arrowOffset }) => {
  const initialOffset = {
    top: { x: 0, y: -6 },
    bottom: { x: 0, y: 6 },
    left: { x: -6, y: 0 },
    right: { x: 6, y: 0 },
  }[arrowDirection];
  const transformOrigin = {
    top: `${arrowOffset} 0%`,
    bottom: `${arrowOffset} 100%`,
    left: `0% ${arrowOffset}`,
    right: `100% ${arrowOffset}`,
  }[arrowDirection];

  return { initialOffset, transformOrigin };
};

const Arrow = ({ direction, offset }) => {
  const props = {
    top: { className: 'absolute top-[-4px] rotate-180 -translate-x-1/2', style: { left: offset } },
    bottom: { className: 'absolute bottom-[-4px] -translate-x-1/2', style: { left: offset } },
    left: { className: 'absolute left-[-6.5px] rotate-90 -translate-y-1/2', style: { top: offset } },
    right: { className: 'absolute right-[-6.5px] -rotate-90 -translate-y-1/2', style: { top: offset } },
  }[direction];

  return (
    <svg
      {...props}
      data-tooltip-arrow={direction}
      width="10"
      height="5"
      viewBox="0 0 10 5"
      fill="#111925"
      aria-hidden="true"
    >
      <path d={ARROW_PATH} />
    </svg>
  );
};

const CatHead = ({ orientation }) => (
  <svg
    className={`absolute top-[-12px] ${orientation === 'left' ? 'left-0 scale-x-[-1]' : 'right-0'}`}
    width="38"
    height="31"
    viewBox="0 0 38 31"
    fill="none"
    aria-hidden="true"
  >
    <path d="M8.04096 0.00816228C10.6774 -0.105256 13.0153 5.76173 13.8718 7.57337C14.7129 9.35254 15.2769 10.5866 15.5613 11.2724C15.6601 11.5074 16.1543 11.5658 16.1727 11.5679C16.1727 11.5679 20.6783 12.0075 24.865 11.5557C25.4617 11.4913 26.0676 11.3065 26.1327 10.6875C26.7047 5.19427 27.6591 2.34462 28.9941 2.14199C29.2835 2.09815 29.5921 2.17975 29.9173 2.38452C31.6919 4.69807 31.7751 8.37733 35.5729 14.464C37.5713 17.6669 38 20.1493 38 28H0L0.000177326 12H0.484026C1.21086 12 1.57428 12 1.84061 11.8008C2.10694 11.6016 2.21097 11.2486 2.41904 10.5424C4.53813 3.35034 6.4121 -0.193723 8.04096 0.00816228Z" fill="#111925" />
    <path d="M10.8222 25.8628C10.4733 25.6172 10.1987 25.2804 10.0286 24.8891C9.92319 26.6805 10.8087 28.439 12.3694 29.5375C14.7552 31.2168 17.9416 30.7988 19.4866 28.6039C21.0315 26.4091 20.3499 23.2684 17.9641 21.5891C15.9423 20.166 13.3106 20.2161 11.5822 21.7107C12.2413 21.5416 12.9415 21.6697 13.4979 22.0614C14.5477 22.8003 14.7997 24.2502 14.0608 25.2999C13.3219 26.3497 11.8719 26.6017 10.8222 25.8628Z" fill="white" />
    <path d="M29.9031 21.988C28.0736 20.8079 25.6582 21.1294 24.201 22.7468C24.8033 22.5535 25.4605 22.6402 25.992 22.9831C26.9727 23.6157 27.2549 24.9235 26.6223 25.9042C25.9897 26.8848 24.6819 27.167 23.7012 26.5345C23.445 26.3692 23.2276 26.1504 23.0639 25.8931C23.1212 27.337 23.8781 28.6626 25.0924 29.4459C27.1519 30.7743 29.8983 30.1817 31.2267 28.1223C32.5551 26.0628 31.9625 23.3164 29.9031 21.988Z" fill="white" />
  </svg>
);

const CatButt = ({ position, orientation }) => {
  const positionClass = position === 'top'
    ? `top-[-16.5px] ${orientation === 'left' ? 'right-0' : 'left-0'}`
    : `bottom-[-16.5px] ${orientation === 'left' ? 'right-0' : 'left-0'}`;
  const transformClass = `${position === 'top' ? 'scale-y-[-1]' : ''} ${orientation === 'left' ? 'scale-x-[-1]' : ''}`;

  return (
    <svg
      className={`absolute ${positionClass} ${transformClass}`}
      width="64"
      height="54"
      viewBox="0 0 64 54"
      fill="none"
      aria-hidden="true"
    >
      <path d="M63.9207 37.18C45.5857 37.18 32.9015 37.3165 23.6055 35.2309C25.3886 37.0704 27.5086 38.7907 30.0527 40.582C33.2047 42.8012 33.9453 47.133 31.707 50.2579C29.4686 53.3827 25.0992 54.1171 21.9473 51.898C12.6857 45.3771 6.53043 38.3844 3.13671 26.2462C1.09294 18.9363 -0.00189209 16.18 -0.00189209 1.8941e-06C20.5 -2.36763e-06 63.9207 1.8941e-06 63.9207 1.8941e-06C63.9207 1.8941e-06 63.9207 26.18 63.9207 37.18Z" fill="#111925" />
    </svg>
  );
};

const CatTooltip = ({ config, step, onNext }) => {
  const { initialOffset, transformOrigin } = getTooltipMotion(config);

  return (
    <div
      data-cat-tooltip={config.tooltipDirection}
      className="absolute z-10"
      style={getTooltipPosition(config)}
    >
      <motion.div
        className="relative flex min-w-[180px] w-fit max-w-[360px] flex-col justify-between gap-3 bg-[#111925] p-3 pt-6 text-white shadow-[0_3px_12px_rgba(27,31,38,0.18)]"
        style={{ borderRadius: getBorderRadius(config), transformOrigin }}
        initial={{ opacity: 0, scale: 0.9, ...initialOffset }}
        animate={{ opacity: [0, 1, 1, 1], scale: [0.9, 1.04, 0.99, 1], x: 0, y: 0 }}
        transition={{
          opacity: { duration: 0.12, times: [0, 0.55, 0.8, 1], ease: 'easeOut' },
          scale: { duration: 0.28, times: [0, 0.5, 0.78, 1], ease: ['easeOut', 'easeInOut', 'easeOut'] },
          x: { duration: 0.18, ease: 'easeOut' },
          y: { duration: 0.18, ease: 'easeOut' },
        }}
      >
        <div className="z-10 h-fit px-2 text-center text-[14px] leading-[1.5]">
          {config.text.split('\n').map((line, index) => (
            <span key={line} className="whitespace-nowrap">
              {line}{index < config.text.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>
        <div className="z-10 flex h-fit w-full flex-row items-center justify-between">
          <div className="ml-1 flex select-none flex-row items-center gap-2 text-[14px] text-white">
            <span>{step + 1}</span><span className="opacity-50">/</span><span className="opacity-50">8</span>
          </div>
          <button
            type="button"
            className="select-none rounded-[8px] bg-white px-3 py-1 text-[12px] text-[#111925]/90 hover:bg-opacity-90"
            onClick={onNext}
          >
            {step === 7 ? '再看一次' : '我知道了👌'}
          </button>
        </div>
        <CatHead orientation={config.catOrientation} />
        <CatButt position={config.catPosition} orientation={config.catOrientation} />
        <Arrow direction={config.arrowDirection} offset={config.arrowOffset} />
      </motion.div>
    </div>
  );
};

const NoCodeForProCodeDemo = () => {
  const [step, setStep] = useState(0);
  const config = STEP_CONFIGS[step];

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f1f2f4] p-[3%]">
      <div className="relative h-full w-full overflow-hidden rounded-[16px] bg-white shadow-sm">
        <div className="absolute left-[4%] top-[5%] text-[11px] tracking-[0.16em] text-[#111925]/45">
          NOCODE COMPONENT / CAT TOOLTIP
        </div>
        <div className="absolute right-[4%] top-[5%] text-[11px] text-[#111925]/40">
          {config.tooltipDirection}
        </div>

        <div
          data-tooltip-anchor
          className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-[8px] bg-[#111925]/50"
        >
          <CatTooltip
            key={config.tooltipDirection}
            config={config}
            step={step}
            onNext={() => setStep((value) => (value + 1) % STEP_CONFIGS.length)}
          />
        </div>

        <div className="absolute bottom-[5%] left-1/2 flex -translate-x-1/2 gap-1.5">
          {STEP_CONFIGS.map((item, index) => (
            <button
              key={item.tooltipDirection}
              type="button"
              aria-label={`查看第 ${index + 1} 步：${item.tooltipDirection}`}
              onClick={() => setStep(index)}
              className={`h-1.5 rounded-full transition-all ${index === step ? 'w-5 bg-[#111925]' : 'w-1.5 bg-[#111925]/20'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoCodeForProCodeDemo;
