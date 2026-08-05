import React from "react";

/**
 * 关闭图标（描边版本）
 */
export const CloseStrokeIcon = ({
  className = "",
  width = 20,
  height = 20,
  ...props
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M5 5L15 15M15 5L5 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

/**
 * 关闭图标（填充版本）
 */
export const CloseFillIcon = ({
  className = "",
  width = 16,
  height = 16,
  ...props
}) => {
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
        d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"
        fill="currentColor"
      />
    </svg>
  );
};
