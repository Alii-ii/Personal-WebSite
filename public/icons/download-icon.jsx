import React from "react";

/**
 * 下载图标组件
 * @param {Object} props - 组件属性
 * @param {string} props.className - 额外的CSS类名
 * @param {number} props.width - 图标宽度
 * @param {number} props.height - 图标高度
 */
const DownloadIcon = ({ className = "", width = 16, height = 16, ...props }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.5 21.75H4.5C4.08579 21.75 3.75 21.4142 3.75 21C3.75 20.5858 4.08579 20.25 4.5 20.25H19.5C19.9142 20.25 20.25 20.5858 20.25 21C20.25 21.4142 19.9142 21.75 19.5 21.75ZM12.9078 18.33L20.0455 10.7647C20.1768 10.6255 20.25 10.4413 20.25 10.25C20.25 9.8358 19.9142 9.5 19.5 9.5C19.2935 9.5 19.0962 9.5851 18.9545 9.7353L12.75 16.3114V2.5C12.75 2.0858 12.4142 1.75 12 1.75C11.5858 1.75 11.25 2.0858 11.25 2.5V16.3183L5.04485 9.76765C4.90286 9.61775 4.70596 9.53305 4.5 9.53305C4.08579 9.53305 3.75 9.86885 3.75 10.2831C3.75 10.475 3.82355 10.6596 3.9555 10.7989L11.0911 18.3318C11.338 18.5924 11.6409 18.7225 11.9999 18.7222C12.3588 18.7218 12.6615 18.5911 12.9078 18.33Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default DownloadIcon;
