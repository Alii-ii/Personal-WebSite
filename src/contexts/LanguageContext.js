"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLastUpdatedText, getLastCommitYear } from '../lib/git-info';

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
    mainSite: "绘画平台", 
    mainSiteTooltip: "点击访问绘画平台",
    copyright: `© Alii.Wong ${getLastCommitYear()} all rights reserved`,
    lastUpdated: getLastUpdatedText('zh'),
    
    // 社交按钮
    bilibiliTooltip: "Alii在B站刷什么👀",
    writing: "文章随笔",
    sideProject: "独立开发",
    wechatTooltip: "get 微信",
    wechatCopied: "已复制到粘贴板~",
    emailTooltip: "get 邮箱", 
    emailCopied: "已复制到粘贴板~",

    // AI Chat
    chatExpand: "展开",
    chatCollapse: "收起",
    chatSend: "发送",
    chatLogin: "登录",
    chatPin: "常驻展开",
    chatUnpin: "取消常驻",
    chatNewConversation: "开始新对话",
    chatHistory: "历史对话",
    chatInputLabel: "输入你想对 Alii 说的话",
    chatRegionLabel: "和 Alii 聊天",
    chatNicknameTitle: "取个昵称再开始聊天吧",
    chatNicknamePlaceholder: "1~20个字符内, 账号基于访问设备记录哦…",
    chatNicknameSubmitting: "正在记录昵称…",
    chatPlaceholder: "Ask me anything…",
    chatThinking: "Alii 正在想…",
    chatNicknameInvalid: "昵称需要 1-20 个字符",
    chatNicknameTaken: "该昵称已被使用",
    chatSignInFailed: "登录失败，请重试",
    chatProfileCreateFailed: "创建个人信息失败",
    chatSessionExpired: "登录状态已失效，请刷新后重试",
    chatConversationTimeout: "创建对话超时，请检查 Supabase 连接后重试",
    chatMessageSaveTimeout: "消息保存超时，请检查 Supabase 连接后重试",
    chatMessageSaveFailed: "消息保存失败，请重试",
    chatRateLimited: "今天聊得够多啦，明天再来吧 ☕",
    chatRequestFailed: "Alii 走神了，晚点再来试试吧…",
    chatResponseTimeout: "Alii 想太久了，这次先重试一下吧…",
    chatNetworkInterrupted: "网络连接中断，请检查网络后重试",
    chatResponseSaveFailed: "回复已显示，但未保存到历史记录，请复制后重试",
    chatHistoryPlaceholder: "↑ ↓ 切换, ↵ 选择, esc 返回",
    chatBack: "返回",
    timeJustNow: "刚刚",
    timeMinutesAgo: "{n}分钟前",
    timeHoursAgo: "{n}小时前",
    timeDaysAgo: "{n}天前",
    timeWeeksAgo: "{n}周前",
    timeMonthsAgo: "{n}月前",
    timeYearsAgo: "{n}年前",
    
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
    copyright: `© Alii.Wong ${getLastCommitYear()} all rights reserved`,
    lastUpdated: getLastUpdatedText('en'),
    
    // Social buttons
    bilibiliTooltip: "What is Alii watching on Bilibili 👀",
    writing: "Writing",
    sideProject: "Side Project",
    wechatTooltip: "get WeChat",
    wechatCopied: "Copied to clipboard~",
    emailTooltip: "get Email",
    emailCopied: "Copied to clipboard~",

    // AI Chat
    chatExpand: "Expand",
    chatCollapse: "Collapse",
    chatSend: "Send",
    chatLogin: "Log in",
    chatPin: "Keep open",
    chatUnpin: "Allow collapse",
    chatNewConversation: "Start a new conversation",
    chatHistory: "Chat history",
    chatInputLabel: "Type a message to Alii",
    chatRegionLabel: "Chat with Alii",
    chatNicknameTitle: "Choose a nickname to start chatting",
    chatNicknamePlaceholder: "1–20 characters; your account stays on this device…",
    chatNicknameSubmitting: "Saving your nickname…",
    chatPlaceholder: "Ask me anything…",
    chatThinking: "Alii is thinking…",
    chatNicknameInvalid: "Your nickname must be 1–20 characters",
    chatNicknameTaken: "That nickname is already taken",
    chatSignInFailed: "Sign-in failed. Please try again",
    chatProfileCreateFailed: "Couldn’t create your profile",
    chatSessionExpired: "Your session has expired. Please refresh and try again",
    chatConversationTimeout: "Creating the conversation timed out. Please check the Supabase connection and try again",
    chatMessageSaveTimeout: "Saving the message timed out. Please check the Supabase connection and try again",
    chatMessageSaveFailed: "Couldn’t save the message. Please try again",
    chatRateLimited: "That’s enough chatting for today. Come back tomorrow ☕",
    chatRequestFailed: "Alii got distracted. Please try again later…",
    chatResponseTimeout: "Alii took too long to think. Please try again…",
    chatNetworkInterrupted: "The connection was interrupted. Check your network and try again",
    chatResponseSaveFailed: "The reply is visible but wasn’t saved to history. Copy it and try again",
    chatHistoryPlaceholder: "↑ ↓ to navigate, ↵ to select, esc to go back",
    chatBack: "Back",
    timeJustNow: "just now",
    timeMinutesAgo: "{n} min ago",
    timeHoursAgo: "{n} hr ago",
    timeDaysAgo: "{n} days ago",
    timeWeeksAgo: "{n} wk ago",
    timeMonthsAgo: "{n} mo ago",
    timeYearsAgo: "{n} yr ago",
    
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
  const [mounted, setMounted] = useState(false);

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

    setLanguage(initialLanguage);
    applyLanguage(initialLanguage);
    setMounted(true);
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
    getLanguageCode,
    mounted
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
