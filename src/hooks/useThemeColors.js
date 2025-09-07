'use client';

import { useState, useEffect } from 'react';

/**
 * 自定义 Hook - 获取当前主题的颜色值
 * 支持浅色和深色主题的动态切换
 */
export const useThemeColors = () => {
  const [colors, setColors] = useState({
    baseColor: '#191d250d', // 浅色主题默认值
    activeColor: '#191d251a'
  });

  useEffect(() => {
    const updateColors = () => {
      // 检查当前主题
      const isDark = document.documentElement.classList.contains('dark');
      
      if (isDark) {
        // 深色主题颜色 - 使用品牌色作为激活色，更明显
        setColors({
          baseColor: '#313B4C',
          activeColor: '#36d2be' // 使用品牌色，在深色背景下更突出
        });
      } else {
        // 浅色主题颜色
        setColors({
          baseColor: '#E7E8EA',
          activeColor: '#191d251a'
        });
      }
    };

    // 初始设置
    updateColors();

    // 监听主题变化
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return colors;
};
