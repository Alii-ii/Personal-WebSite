import React from "react";

/**
 * 点赞图标（评论区操作）
 */
const LikeIcon = ({
  className = "",
  width = 16,
  height = 16,
  filled = false,
  ...props
}) => {
  if (filled) {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
        aria-hidden="true"
        {...props}
      >
        <path
          d="M6.6771 3.28118C8.39812 3.07867 10.2744 3.83613 12.0003 5.66302C13.7263 3.83613 15.6026 3.07867 17.3236 3.28118C19.239 3.50657 20.7271 4.89461 21.3793 6.78509C22.6992 10.6121 20.6874 16.3632 12.7962 20.4384C12.3037 20.6928 11.697 20.6928 11.2044 20.4384C3.31331 16.3632 1.30144 10.6121 2.62144 6.78509C3.27357 4.89461 4.76173 3.50657 6.6771 3.28118Z"
          fill="#DB3B4B"
        />
      </svg>
    );
  }

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
        d="M8 13.1S2.75 10.15 2.75 6.15A2.75 2.75 0 0 1 8 4.95a2.75 2.75 0 0 1 5.25 1.2C13.25 10.15 8 13.1 8 13.1Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default LikeIcon;
