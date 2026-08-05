"use client";

import React from "react";
import { ExternalLinkIcon } from "@/public/icons";

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
        <ExternalLinkIcon className={`${iconSize} flex-none order-0 text-secondary opacity-90`} />
      )}
    </a>
  );
};

export default TextLink;
