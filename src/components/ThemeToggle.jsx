"use client";

import React, { useState, useEffect } from "react";

// 主题切换组件
const ThemeToggle = () => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // 检查本地存储或系统偏好
    const savedTheme = localStorage.getItem("theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    const initialTheme = savedTheme || systemTheme;

    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  // 添加键盘快捷键监听
  useEffect(() => {
    const handleKeyDown = (event) => {
      // 检查是否按下了 Shift + C
      if (event.shiftKey && event.key === 'C') {
        event.preventDefault(); // 防止默认行为
        toggleTheme();
      }
    };

    // 添加全局键盘事件监听器
    document.addEventListener('keydown', handleKeyDown);

    // 清理函数：组件卸载时移除事件监听器
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [theme]); // 依赖theme状态，确保使用最新的theme值

  const applyTheme = (newTheme) => {
    const root = document.documentElement;

    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", newTheme);
  };

  // 主题切换函数
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    // 先更新状态，触发开关位移动画
    setTheme(newTheme);
    // 200ms后应用全局主题变换
    setTimeout(() => {
      applyTheme(newTheme);
    }, 200);
  };

  // 处理点击事件
  const handleClick = (event) => {
    toggleTheme();
  };

  return (
    <div
      onClick={handleClick}
      className="flex flex-row justify-center items-center p-0.5 gap-[2px] size-fit rounded-[6px] cursor-pointer relative border border-[0.5px] border-stroke bg-press overflow-hidden"
      title="点击切换主题 (快捷键: Shift + C)"
    >
      {/* Light */}
      <div className="z-10 flex flex-row justify-center items-center p-1 size-fit rounded-[4px] hover:opacity-80 cursor-pointer">
        <svg
          className="w-4 h-4 flex-none order-0 text-secondary"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 6.75C9.10575 6.75 6.75 9.10575 6.75 12C6.75 14.8942 9.10575 17.25 12 17.25C14.8942 17.25 17.25 14.8942 17.25 12C17.25 9.10575 14.8942 6.75 12 6.75ZM12 15.75C9.9285 15.75 8.25 14.0715 8.25 12C8.25 9.9285 9.9285 8.25 12 8.25C14.0715 8.25 15.75 9.9285 15.75 12C15.75 14.0715 14.0715 15.75 12 15.75ZM12 5.25C12.414 5.25 12.75 4.914 12.75 4.5V3C12.75 2.586 12.414 2.25 12 2.25C11.586 2.25 11.25 2.586 11.25 3V4.5C11.25 4.914 11.586 5.25 12 5.25ZM12 18.75C11.586 18.75 11.25 19.086 11.25 19.5V21C11.25 21.414 11.586 21.75 12 21.75C12.414 21.75 12.75 21.414 12.75 21V19.5C12.75 19.086 12.414 18.75 12 18.75ZM17.8328 7.22625L18.8932 6.16575C19.1865 5.8725 19.1865 5.3985 18.8932 5.10525C18.6 4.812 18.126 4.812 17.8328 5.10525L16.7723 6.16575C16.479 6.459 16.479 6.933 16.7723 7.22625C17.0655 7.5195 17.5403 7.5195 17.8328 7.22625ZM6.16725 16.7738L5.10675 17.8342C4.8135 18.1275 4.8135 18.6015 5.10675 18.8948C5.4 19.188 5.874 19.188 6.16725 18.8948L7.22775 17.8342C7.521 17.5402 7.521 17.0662 7.22775 16.7738C6.9345 16.4805 6.45975 16.4798 6.16725 16.7738ZM5.25 12C5.25 11.586 4.914 11.25 4.5 11.25H3C2.586 11.25 2.25 11.586 2.25 12C2.25 12.414 2.586 12.75 3 12.75H4.5C4.914 12.75 5.25 12.414 5.25 12ZM21 11.25H19.5C19.086 11.25 18.75 11.586 18.75 12C18.75 12.414 19.086 12.75 19.5 12.75H21C21.414 12.75 21.75 12.414 21.75 12C21.75 11.586 21.414 11.25 21 11.25ZM6.16575 7.22625C6.459 7.5195 6.93375 7.5195 7.22625 7.22625C7.5195 6.933 7.5195 6.459 7.22625 6.16575L6.16575 5.10525C5.8725 4.812 5.3985 4.812 5.10525 5.10525C4.812 5.3985 4.812 5.8725 5.10525 6.16575L6.16575 7.22625ZM17.8342 16.7723C17.5402 16.479 17.0662 16.479 16.7738 16.7723C16.4805 17.0655 16.4798 17.5395 16.7738 17.8328L17.8342 18.8932C18.1275 19.1865 18.6015 19.1865 18.8948 18.8932C19.188 18.6 19.188 18.126 18.8948 17.8328L17.8342 16.7723Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Dark */}
      <div className="z-10 flex flex-row justify-center items-center p-1 size-fit rounded-[4px] hover:opacity-80 cursor-pointer">
        <svg
          className="w-4 h-4 flex-none order-0 text-secondary"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M20.3621 12.0376C20.3621 7.7626 17.1371 4.2001 12.8996 3.7876C12.3138 3.72426 11.905 4.35778 12.1871 4.8751C12.6371 5.6626 12.8621 6.6001 12.8621 7.5001C12.8621 10.5376 10.3871 13.0501 7.31213 13.0501C6.48713 13.0501 5.69964 12.8626 4.94964 12.5251C4.41036 12.2713 3.80423 12.7243 3.89963 13.3126C4.49964 17.4001 7.94963 20.3626 12.0371 20.3626C16.6121 20.3626 20.3621 16.6126 20.3621 12.0376ZM12.0371 18.8626C9.11213 18.8626 6.59964 17.0251 5.66214 14.4001C6.18714 14.5126 6.71214 14.5876 7.27464 14.5876C11.1746 14.5876 14.3246 11.4376 14.3246 7.5376C14.3246 6.8626 14.2121 6.1876 14.0246 5.5501C16.8371 6.3751 18.8621 9.0001 18.8621 12.0376C18.8621 15.7876 15.7871 18.8626 12.0371 18.8626Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* toggle */}
      <div
        className={`absolute top-0.5 size-6 rounded-[4px] transition-all z-0 duration-200 bg-card ${theme === "light" ? "left-0.5" : "left-[28px]"}`}
      ></div>
    </div>
  );
};

export default ThemeToggle;
