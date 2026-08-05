import React from "react";

/**
 * 作品类型角标图标
 */
const TypeBadgeIcon = ({ type = "image", className = "", width = 20, height = 20, ...props }) => {
  const paths = {
    image:
      "M3 5.5A2.5 2.5 0 0 1 5.5 3h9A2.5 2.5 0 0 1 17 5.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 3 14.5v-9Zm2.5-1a1 1 0 0 0-1 1v6.3l2.6-2.2a1 1 0 0 1 1.3 0l2.7 2.3 1.6-1.3a1 1 0 0 1 1.3 0l1.5 1.3V5.5a1 1 0 0 0-1-1h-9Zm2 2.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z",
    prototype:
      "M7.4 5.3a.75.75 0 0 1 0 1.06L4.06 9.7a.42.42 0 0 0 0 .6l3.34 3.34a.75.75 0 1 1-1.06 1.06l-3.34-3.34a1.92 1.92 0 0 1 0-2.72L6.34 5.3a.75.75 0 0 1 1.06 0Zm5.2 0a.75.75 0 0 1 1.06 0L17 8.64a1.92 1.92 0 0 1 0 2.72L13.66 14.7a.75.75 0 1 1-1.06-1.06l3.34-3.34a.42.42 0 0 0 0-.6L12.6 6.36a.75.75 0 0 1 0-1.06Z",
    rich:
      "M4 5.25c0-.41.34-.75.75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 5.25Zm0 3.5c0-.41.34-.75.75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 8.75Zm0 3.5c0-.41.34-.75.75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75Z",
  };

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
      <path d={paths[type] || paths.image} fill="currentColor" />
    </svg>
  );
};

export default TypeBadgeIcon;
