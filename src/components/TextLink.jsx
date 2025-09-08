"use client";

import React from "react";

/**
 * 文本链接组件
 * 带有悬停动画效果和外部链接图标的可复用链接组件
 */
const TextLink = ({ 
  href, 
  children, 
  title, 
  target = "_blank", 
  rel = "noopener noreferrer",
  className = "",
  showIcon = true,
  iconSize = "w-4 h-4"
}) => {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={`flex flex-row items-center justify-center gap-0.5 text-secondary font-light text-[16px] select-none
        hover:translate-x-[2px] hover:translate-y-[-2px] hover:opacity-80 cursor-pointer duration-200 ${className}`}
      title={title}
    >
      {children}
      {showIcon && (
        <svg 
          className={`${iconSize} flex-none order-0 text-secondary opacity-90`} 
          viewBox="0 0 16 16" 
          fill="none"
        >
          <path
            d="M11.3236 4.02776L4.80568 4.22528C4.66787 4.22946 4.53448 4.17654 4.43699 4.07905C4.24173 3.88379 4.24174 3.5672 4.43699 3.37194C4.52706 3.28188 4.6481 3.22959 4.7754 3.22574L12.1996 3.00076C12.6794 2.98622 13.0723 3.37909 13.0578 3.85895L12.8328 11.2831C12.8289 11.4104 12.7766 11.5315 12.6866 11.6215C12.4913 11.8168 12.1747 11.8168 11.9795 11.6215C11.882 11.524 11.8291 11.3907 11.8332 11.2528L12.0308 4.73487L4.01004 12.7556C3.81479 12.9508 3.49819 12.9508 3.30294 12.7556C3.10768 12.5603 3.10768 12.2437 3.30294 12.0485L11.3236 4.02776Z"
            fill="currentColor"
          />
        </svg>
      )}
    </a>
  );
};

export default TextLink;
