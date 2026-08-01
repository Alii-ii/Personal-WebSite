"use client";

// 历史会话 hook：筛选当前会话、管理键盘选择，并负责进入/退出/切换历史会话。
import { useEffect, useMemo, useRef, useState } from 'react';

export default function useChatHistory({
  conversations,
  currentConversationId,
  value,
  setValue,
  selectConversation,
  isMessagePending,
  setIsExpanded,
}) {
  const [isHistoryMode, setIsHistoryMode] = useState(false);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(0);
  const [savedValue, setSavedValue] = useState('');
  const historyListRef = useRef(null);
  const historyItemRefs = useRef([]);

  const historyConversations = useMemo(
    () =>
      conversations
        .filter((conversation) => conversation.id !== currentConversationId)
        .sort((first, second) => new Date(first.updated_at) - new Date(second.updated_at)),
    [conversations, currentConversationId],
  );

  const exitHistory = () => {
    setIsHistoryMode(false);
    setValue(savedValue);
    setSavedValue('');
  };

  const selectHistory = async (conversationId) => {
    await selectConversation(conversationId);
    exitHistory();
  };

  const enterHistory = () => {
    if (!historyConversations.length || isMessagePending) return;
    setSavedValue(value);
    setValue('');
    setIsExpanded(false);
    setSelectedHistoryIndex(historyConversations.length - 1);
    setIsHistoryMode(true);
  };

  useEffect(() => {
    if (!isHistoryMode) return;
    historyItemRefs.current[selectedHistoryIndex]?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [isHistoryMode, selectedHistoryIndex]);

  useEffect(() => {
    if (!isHistoryMode || !historyConversations.length) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        event.stopImmediatePropagation();
        setSelectedHistoryIndex((previous) => Math.max(0, previous - 1));
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        event.stopImmediatePropagation();
        setSelectedHistoryIndex((previous) =>
          Math.min(historyConversations.length - 1, previous + 1),
        );
      } else if (event.key === 'Enter') {
        event.preventDefault();
        event.stopImmediatePropagation();
        const conversation = historyConversations[selectedHistoryIndex];
        if (conversation) selectHistory(conversation.id);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        exitHistory();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isHistoryMode, historyConversations, selectedHistoryIndex, savedValue]);

  return {
    isHistoryMode,
    selectedHistoryIndex,
    historyConversations,
    historyListRef,
    historyItemRefs,
    setSelectedHistoryIndex,
    enterHistory,
    exitHistory,
    selectHistory,
  };
}
