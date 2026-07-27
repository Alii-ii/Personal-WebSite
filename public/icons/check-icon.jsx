import React from "react";

/**
 * 对勾图标组件 - 用于复制成功等确认状态
 */
const CheckIcon = ({ className = "", width = 16, height = 16, ...props }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      {...props}
    >
      <path
        d="M13.3536 4.14645C13.5488 4.34171 13.5488 4.65829 13.3536 4.85355L6.35355 11.8536C6.15829 12.0488 5.84171 12.0488 5.64645 11.8536L2.64645 8.85355C2.45118 8.65829 2.45118 8.34171 2.64645 8.14645C2.84171 7.95118 3.15829 7.95118 3.35355 8.14645L6 10.7929L12.6464 4.14645C12.8417 3.95118 13.1583 3.95118 13.3536 4.14645Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default CheckIcon;
