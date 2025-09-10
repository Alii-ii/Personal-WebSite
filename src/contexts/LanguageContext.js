"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLastUpdatedText } from '../lib/git-info';

// 翻译数据
const translations = {
  zh: {
    // Footer 组件文本
    learningCode: "最近在吭哧吭哧<underline>学代码</underline>…",
    lastPostDays: "距离上次<underline>投稿</underline>123天了…",
    portfolio: "作品集",
    resume: "简历",
    resumeTooltip: "点击访问简历",
    portfolioTooltip: "点击访问作品集",
    mainSite: "主站平台", 
    mainSiteTooltip: "点击访问主站平台",
    copyright: "© Alii.Wong 2025 all rights reserved",
    lastUpdated: getLastUpdatedText('zh'),
    
    // 社交按钮
    bilibiliTooltip: "Alii在B站刷什么👀",
    wechatTooltip: "get 微信",
    wechatCopied: "已复制到粘贴板~",
    emailTooltip: "get 邮箱", 
    emailCopied: "已复制到粘贴板~",
    
    // 控制台日志
    copySuccess: "复制成功，更新状态",
    newCopyState: "新的复制状态",
    resetState: "重置状态",
    currentCopyState: "当前复制状态",
    clickWechatCopy: "点击微信号复制按钮",
    copyResult: "复制结果",
    wechatCopiedToClipboard: "微信号已复制到粘贴板",
    clickEmailCopy: "点击邮箱复制按钮",
    emailCopiedToClipboard: "邮箱地址已复制到粘贴板",
    jumpToBilibili: "跳转Bilibili",
    copyFailed: "复制失败"
  },
  en: {
    // Footer component text
    learningCode: "Recently learning to <underline>code</underline>…",
    lastPostDays: "123 days since last <underline>post</underline>…",
    portfolio: "Portfolio",
    resume: "Resume",
    resumeTooltip: "Click to visit resume",
    portfolioTooltip: "Click to visit portfolio",
    mainSite: "Main Site",
    mainSiteTooltip: "Click to visit main site",
    copyright: "© Alii.Wong 2025 all rights reserved",
    lastUpdated: getLastUpdatedText('en'),
    
    // Social buttons
    bilibiliTooltip: "What is Alii watching on Bilibili 👀",
    wechatTooltip: "get WeChat",
    wechatCopied: "Copied to clipboard~",
    emailTooltip: "get Email",
    emailCopied: "Copied to clipboard~",
    
    // Console logs
    copySuccess: "Copy successful, updating state",
    newCopyState: "New copy state",
    resetState: "Reset state",
    currentCopyState: "Current copy state",
    clickWechatCopy: "Click WeChat copy button",
    copyResult: "Copy result",
    wechatCopiedToClipboard: "WeChat ID copied to clipboard",
    clickEmailCopy: "Click email copy button",
    emailCopiedToClipboard: "Email address copied to clipboard",
    jumpToBilibili: "Jump to Bilibili",
    copyFailed: "Copy failed"
  }
};

// 创建语言上下文
const LanguageContext = createContext();

// 语言提供者组件
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('zh');

  useEffect(() => {
    // 检测用户默认语言偏好
    const detectUserLanguage = () => {
      // 1. 优先检查本地存储的用户选择
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
        return savedLanguage;
      }
      
      // 2. 检测浏览器语言设置
      const browserLanguage = navigator.language || navigator.languages?.[0] || 'en';
      
      // 3. 支持更多中文变体
      const chineseVariants = ['zh', 'zh-CN', 'zh-TW', 'zh-HK', 'zh-SG'];
      const isChinese = chineseVariants.some(lang => browserLanguage.startsWith(lang));
      
      // 4. 支持更多英语变体
      const englishVariants = ['en', 'en-US', 'en-GB', 'en-AU', 'en-CA'];
      const isEnglish = englishVariants.some(lang => browserLanguage.startsWith(lang));
      
      // 5. 根据检测结果返回默认语言
      if (isChinese) {
        return 'zh';
      } else if (isEnglish) {
        return 'en';
      } else {
        // 6. 其他语言默认使用英语
        return 'en';
      }
    };
    
    const initialLanguage = detectUserLanguage();
    console.log(`检测到用户语言偏好: ${initialLanguage} (浏览器语言: ${navigator.language})`);
    
    setLanguage(initialLanguage);
    applyLanguage(initialLanguage);
  }, []);

  // 应用语言设置
  const applyLanguage = (newLanguage) => {
    const root = document.documentElement;
    
    if (newLanguage === 'zh') {
      root.setAttribute('lang', 'zh-CN');
    } else {
      root.setAttribute('lang', 'en');
    }
    
    localStorage.setItem('language', newLanguage);
  };

  // 切换语言
  const toggleLanguage = () => {
    const newLanguage = language === 'zh' ? 'en' : 'zh';
    setLanguage(newLanguage);
    applyLanguage(newLanguage);
  };

  // 获取翻译文本
  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  // 获取当前语言的显示名称
  const getLanguageDisplayName = () => {
    return language === 'zh' ? '中文' : 'English';
  };

  // 获取当前语言的英文名称
  const getLanguageCode = () => {
    return language;
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    getLanguageDisplayName,
    getLanguageCode
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// 使用语言上下文的钩子
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
