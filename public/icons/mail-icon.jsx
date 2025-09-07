import React from "react";

/**
 * 加号图标组件
 * @param {Object} props - 组件属性
 * @param {string} props.className - 额外的CSS类名
 * @param {number} props.width - 图标宽度
 * @param {number} props.height - 图标高度
 */
const MailIcon = ({ className = "", width = 16, height = 16, ...props }) => {
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
        d="M12.3334 2.16663H3.66675C2.56218 2.16663 1.66675 3.06206 1.66675 4.16663V11.8333C1.66675 12.9379 2.56218 13.8333 3.66675 13.8333H12.3334C13.438 13.8333 14.3334 12.9379 14.3334 11.8333V4.16663C14.3334 3.06206 13.438 2.16663 12.3334 2.16663ZM12.3334 3.16663C12.8857 3.16663 13.3334 3.61434 13.3334 4.16663V4.75962L8.00008 7.75929L2.66675 4.75962V4.16663C2.66675 3.61434 3.11446 3.16663 3.66675 3.16663H12.3334ZM2.66675 5.90699L7.59151 8.67716C7.84521 8.81986 8.15495 8.81986 8.40865 8.67716L13.3334 5.90699V11.8333C13.3334 12.3856 12.8857 12.8333 12.3334 12.8333H3.66675C3.11446 12.8333 2.66675 12.3856 2.66675 11.8333V5.90699Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default MailIcon;
