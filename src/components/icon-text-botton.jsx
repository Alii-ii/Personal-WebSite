"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

/**
 * 图标文本按钮组件
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.icon - 左侧图标元素
 * @param {string} props.text - 按钮文本
 * @param {Function} props.onClick - 点击事件处理函数
 * @param {string} props.variant - 按钮变体 ('default' | 'ghost' | 'CTA')
 * @param {string} props.size - 按钮大小 ('sm' | 'md' | 'lg')
 * @param {boolean} props.disabled - 是否禁用
 * @param {string} props.className - 额外的CSS类名
 * @param {string} props.tooltip - 提示文案
 * @param {string} props.shortcut - 快捷键文本
 * @param {string} props.tooltipSide - 提示框位置 ('top' | 'bottom' | 'left' | 'right')
 * @param {React.ReactNode} props.rightIcon - 右侧图标元素
 * @param {Object} props.buttonProps - 传递给按钮的其他属性
 * 
 * 使用示例：
 * 
 * 1. 只有左侧图标
 * <IconTextButton
  icon={<LinkIcon />}
  text="复制链接"
  variant="ghost"
  size="sm"
  tooltip="复制链接"
  shortcut="Ctrl+L"
  tooltipSide="bottom"
/>
 * 
 * 2. 只有右侧图标
 * <IconTextButton
  text="文档标题"
  variant="ghost"
  size="md"
  rightIcon={<ArrowIcon />}
  onClick={handleClick}
/>
 * 
 * 3. 同时有左右图标
 * <IconTextButton
  icon={<FolderIcon />}
  text="我的文档"
  rightIcon={<ArrowIcon />}
  variant="ghost"
  size="md"
  onClick={handleClick}
/>
 * 
 * 4. 只有文本
 * <IconTextButton
  text="按钮文本"
  variant="ghost"
  size="md"
  onClick={handleClick}
/>
 */
const IconTextButton = ({
  icon,
  text,
  onClick,
  variant = "default",
  size = "md",
  disabled = false,
  className = "",
  tooltip,
  shortcut,
  tooltipSide = "top",
  rightIcon,
  forceTooltipOpen = false, // 新增：强制 tooltip 保持打开状态
  ...buttonProps
}) => {
  // 基础样式
  const baseStyles = [
    "inline-flex items-center justify-center gap-1",
    "rounded-[6px] font-regular size-fit",
    "transition-colors",
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
  ].join(" ");

  // 变体样式
  const variants = {
    default: "bg-press text-main hover:bg-divider active:bg-stroke",
    ghost: "hover:bg-hover hover:text-secondary active:bg-press",
    CTA: "bg-main text-card hover:bg-secondary active:bg-tertiary",
  };

  // 大小样式 - 根据是否有文字内容来决定样式
  const isIconOnly = icon && !text;
  const sizes = {
    sm: isIconOnly
      ? "p-1 text-[10px] rounded-[6px]"
      : "py-1 px-2 text-[10px] rounded-[6px]",
    md: isIconOnly
      ? "p-1.5 text-sm rounded-[8px]"
      : "py-1.5 px-2 text-sm rounded-[8px]",
  };

  // 图标大小
  const iconSizes = {
    sm: "size-4",
    md: "size-5",
  };

  // 渲染按钮内容
  const renderButton = () => {
    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        onClick={onClick}
        disabled={disabled}
        {...buttonProps}
      >
        {/* 左侧图标 */}
        {icon && (
          <span className={cn("flex-shrink-0", iconSizes[size])}>
            {React.cloneElement(icon, {
              className: cn("w-full h-full opacity-80", icon.props?.className),
            })}
          </span>
        )}

        {/* 文本内容 */}
        {text && <span>{text}</span>}

        {/* 右侧图标 */}
        {rightIcon && (
          <span className={cn("flex-shrink-0", iconSizes[size])}>
            {React.cloneElement(rightIcon, {
              className: cn(
                "w-full h-full opacity-80",
                rightIcon.props?.className,
              ),
            })}
          </span>
        )}
      </button>
    );
  };

  // 如果没有提示文案，直接返回按钮
  if (!tooltip) {
    return renderButton();
  }

  // 有提示文案时，包装 Tooltip
  return (
    <Tooltip key={tooltip} delayDuration={200} open={forceTooltipOpen ? true : undefined}>
      <TooltipTrigger asChild>{renderButton()}</TooltipTrigger>

      <TooltipContent side={tooltipSide} className="z-[9999]">
        <div className="flex items-center gap-1">
          <span className="text-card">{tooltip}</span>

          {shortcut && (
            <kbd
              className="
                inline-flex 
                size-fit
                select-none 
                items-center 
                font-regular
                text-[12px] 
                text-card/50
                [letter-spacing:4px]
                [&:last-child]:mr-[-4px]
                text-center
              "
            >
              {shortcut}
            </kbd>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default IconTextButton;
