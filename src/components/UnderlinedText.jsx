import React from 'react';

/**
 * 带下划线效果的文本组件
 * 支持关键词高亮、hover效果和点击事件
 */
export default function UnderlinedText({
  children,
  className = '',
  onClick,
  underlineOpacity = 50,
  hoverOpacity = 80,
  ...props
}) {
  return (
    <span
      className={`
        relative cursor-pointer transition-all duration-200
        ${className}
      `}
      onClick={onClick}
      style={{
        '--underline-opacity': `${underlineOpacity}%`,
        '--hover-opacity': `${hoverOpacity}%`,
      }}
      {...props}
    >
      {children}
      {/* 下划线 */}
      <span
        className="absolute bottom-0 left-0 w-full h-0.5 bg-current transition-opacity duration-200"
        style={{
          opacity: 'var(--underline-opacity)',
        }}
      />
      {/* hover 状态的下划线 */}
      <span
        className="absolute bottom-0 left-0 w-full h-0.5 bg-current opacity-0 transition-opacity duration-200 group-hover:opacity-[var(--hover-opacity)]"
        style={{
          '--hover-opacity': `${hoverOpacity}%`,
        }}
      />
    </span>
  );
}
