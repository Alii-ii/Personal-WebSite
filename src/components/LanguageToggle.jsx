"use client";

import React, { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { LanguageCnIcon, LanguageEnIcon } from "@/public/icons";

// 语言切换组件
const LanguageToggle = () => {
  const { language, toggleLanguage, getLanguageDisplayName, mounted } = useLanguage();

  // 键盘快捷键 Shift + L（不允许同时按下其他修饰键）
  useEffect(() => {
    const handleKeyDown = (event) => {
      const isLanguageShortcut =
        event.shiftKey &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        event.code === 'KeyL';
      if (isLanguageShortcut) {
        event.preventDefault();
        toggleLanguage();
      }
    };

    // 添加全局键盘事件监听器
    document.addEventListener('keydown', handleKeyDown);

    // 清理函数：组件卸载时移除事件监听器
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleLanguage]); // 依赖toggleLanguage函数

  // 处理点击事件
  const handleClick = (event) => {
    toggleLanguage();
  };

  return (
    <Tooltip delayDuration={1000}>
      <TooltipTrigger asChild>
        <div
          onClick={handleClick}
          className="flex flex-row justify-center items-center p-0.5 gap-[2px] size-fit rounded-[6px] cursor-pointer relative border border-[0.5px] border-stroke bg-press overflow-hidden"
          role="button"
          tabIndex={0}
          aria-label={`Switch language, current: ${getLanguageDisplayName()}`}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              toggleLanguage();
            }
          }}
        >
      {/* Cn */}
      <div className="z-10 flex flex-row justify-center items-center p-1 size-fit rounded-[4px] hover:opacity-80 cursor-pointer">
        <LanguageCnIcon className="w-4 h-4 flex-none order-0 text-secondary opacity-90" />
      </div>

      {/* En */}
      <div className="z-10 flex flex-row justify-center items-center p-1 size-fit rounded-[4px] hover:opacity-80 cursor-pointer">
        <LanguageEnIcon className="w-4 h-4 flex-none order-0 text-secondary opacity-90" />
      </div>

          {/* toggle */}
          <div
            className={`absolute top-0.5 size-6 rounded-[4px] z-0 bg-card ${mounted ? "transition-all duration-200" : ""} ${language === "zh" || !mounted ? "left-0.5" : "left-[28px]"}`}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>⇧ + L</TooltipContent>
    </Tooltip>
  );
};

export default LanguageToggle;
