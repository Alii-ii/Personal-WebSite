import React from "react";

/**
 * 图片加载中的旋转图标
 */
const LoadingSpinnerIcon = ({
  className = "text-disabled size-8 animate-spin",
  width = 36,
  height = 36,
  ...props
}) => {
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
        d="M12.1566 3.00001C12.6763 3.00871 13.0931 3.43243 13.0931 3.95217C13.0931 4.47192 12.6763 4.89564 12.1566 4.90422L12.1503 4.9043L12.1409 4.90436L12.1312 4.9043C8.1383 4.90966 4.90429 8.148 4.90429 12.1409C4.90429 16.1374 8.1442 19.3774 12.1409 19.3774C15.5503 19.3774 18.4535 17.0075 19.1951 13.757C19.3047 13.2769 19.7109 12.9026 20.2034 12.9026C20.7667 12.9026 21.2142 13.3865 21.1039 13.939C20.2612 18.1602 16.5409 21.2818 12.1409 21.2818C7.09252 21.2818 3 17.1892 3 12.1409C3 7.09252 7.09252 3 12.1409 3L12.1566 3.00001Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default LoadingSpinnerIcon;
