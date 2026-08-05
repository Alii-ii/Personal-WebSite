import React from "react";

/**
 * 警告/错误提示图标
 */
const AlertCircleIcon = ({ className = "", width = 32, height = 32, ...props }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm0 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM12 15a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm0-8a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0v-5A.75.75 0 0 1 12 7Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default AlertCircleIcon;
