import React from "react";

/**
 * 向下箭头图标（可旋转）
 */
const ChevronDownIcon = ({ className = "", width = 20, height = 20, ...props }) => {
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
        d="M5.47 7.47a.75.75 0 0 1 1.06 0L10 10.94l3.47-3.47a.75.75 0 1 1 1.06 1.06l-4 4a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 0 1 0-1.06Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default ChevronDownIcon;
