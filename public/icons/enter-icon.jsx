import React from "react";

/**
 * 回复层级引导图标（Enter）
 */
const EnterIcon = ({ className = "", width = 16, height = 16, ...props }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M11.75 3.5v3.25c0 1.1-.9 2-2 2H4.5m2.25-2.25L4.5 8.75 6.75 11"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default EnterIcon;
