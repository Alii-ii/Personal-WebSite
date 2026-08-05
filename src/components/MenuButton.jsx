"use client";

import IconTextButton from '@/components/icon-text-botton';
import { MenuIcon } from '@/public/icons';

/**
 * 通用菜单/目录按钮
 * size=md → 32×32 / rounded-[8px]，对齐原 w-8 h-8
 */
export default function MenuButton({
  onClick,
  active = false,
  label = '菜单',
  tooltip,
  shortcut,
  tooltipSide = 'bottom',
  className = '',
}) {
  return (
    <IconTextButton
      icon={<MenuIcon />}
      variant="ghost"
      size="md"
      tooltip={tooltip}
      shortcut={shortcut}
      tooltipSide={tooltipSide}
      onClick={onClick}
      className={[
        'h-8 w-8 [&>span]:size-[22px] [&>span]:opacity-100',
        active
          ? 'bg-hover text-main hover:bg-hover hover:text-main'
          : 'text-secondary hover:text-main',
        className,
      ].join(' ')}
      aria-label={label}
    />
  );
}
