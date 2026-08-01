"use client";

// PortfolioChatInput 模块入口：连接鉴权、聊天数据、历史状态与浮动输入 UI。
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChat } from '@/hooks/useChat';
import { EASE_OUT_CSS } from '@/lib/ease';
import ChatComposer from './components/ChatComposer';
import ChatPanels from './components/ChatPanels';
import useChatHistory from './hooks/useChatHistory';

const useChatRoute = () => {
  const nextPathname = usePathname();
  const [browserPathname, setBrowserPathname] = useState('');

  useEffect(() => setBrowserPathname(window.location.pathname), []);

  const pathname = nextPathname || browserPathname;
  const normalizedPathname = pathname?.replace(/\/+$/, '') || '/';
  return normalizedPathname === '/portfolio' || normalizedPathname === '/resume';
};

export default function PortfolioChatInput() {
  const isChatRoute = useChatRoute();
  const {
    user,
    accessToken,
    isAuthenticated,
    hasProfile,
    isLoading: isAuthLoading,
    signIn,
  } = useAuthContext();
  const { t } = useLanguage();
  const {
    conversations,
    currentConversation,
    messages,
    isStreaming,
    streamingContent,
    isRateLimited,
    rateLimitMessage,
    createConversation,
    selectConversation,
    sendMessage,
  } = useChat(user, accessToken);

  const [value, setValue] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isEntered, setIsEntered] = useState(false);
  const [isSubmittingNickname, setIsSubmittingNickname] = useState(false);
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const [nicknameError, setNicknameError] = useState('');
  const textareaRef = useRef(null);
  const messageListRef = useRef(null);
  const isComposingRef = useRef(false);
  const lastCompositionEndRef = useRef(0);

  const isMessagePending = isSubmittingMessage || isStreaming;
  const history = useChatHistory({
    conversations,
    currentConversationId: currentConversation?.id,
    value,
    setValue,
    selectConversation,
    isMessagePending,
    setIsExpanded,
  });

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!isMounted || !isChatRoute) {
      setIsEntered(false);
      return undefined;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsEntered(true);
      return undefined;
    }

    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setIsEntered(true));
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [isMounted, isChatRoute]);

  useEffect(() => {
    if (!isChatRoute) return undefined;

    const focusChatInput = (event) => {
      if (history.isHistoryMode) return;
      const target = event.target;
      const isEditableTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable;
      if (
        event.key !== 'Enter' ||
        event.shiftKey ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isEditableTarget
      ) return;

      event.preventDefault();
      setIsFocused(true);
      requestAnimationFrame(() => textareaRef.current?.focus());
    };

    document.addEventListener('keydown', focusChatInput);
    return () => document.removeEventListener('keydown', focusChatInput);
  }, [isChatRoute, history.isHistoryMode]);

  const hasInput = value.trim().length > 0;
  const isOpen =
    isPinned ||
    isExpanded ||
    isHovered ||
    isFocused ||
    hasInput ||
    isMessagePending ||
    history.isHistoryMode;
  const isNicknameMode = !isAuthLoading && (!isAuthenticated || !hasProfile);
  const isLoggedIn = Boolean(isAuthenticated && hasProfile);
  const canSend =
    hasInput && !isMessagePending && !isRateLimited && !isSubmittingNickname;
  const titleText = isRateLimited
    ? t(rateLimitMessage)
    : isNicknameMode
      ? isSubmittingNickname
        ? t('chatNicknameSubmitting')
        : nicknameError || t('chatNicknameTitle')
      : t('chatRegionLabel');
  const visibleMessages = streamingContent
    ? [
        ...messages,
        {
          id: 'streaming-assistant',
          role: 'assistant',
          content: streamingContent,
        },
      ]
    : messages;
  const showMessagePanel =
    !isExpanded && !isNicknameMode && (visibleMessages.length > 0 || isMessagePending);
  const latestVisibleMessage = visibleMessages[visibleMessages.length - 1];
  const latestTitleText = isMessagePending && !streamingContent
    ? t('chatThinking')
    : latestVisibleMessage?.contentKey
      ? t(latestVisibleMessage.contentKey)
      : latestVisibleMessage?.content || titleText;
  const placeholder = isNicknameMode && isOpen
    ? t('chatNicknamePlaceholder')
    : t('chatPlaceholder');
  const shellWidthClass = isExpanded ? 'w-[560px]' : isOpen ? 'w-[480px]' : 'w-[360px]';

  useEffect(() => {
    if (isExpanded || !isOpen) return;
    const messageList = messageListRef.current;
    if (messageList) messageList.scrollTop = messageList.scrollHeight;
  }, [isExpanded, isOpen, messages, streamingContent]);

  const handleSubmit = async () => {
    const content = value.trim();
    if (!content || isStreaming || isRateLimited || isSubmittingNickname) return;

    if (isNicknameMode) {
      if (content.length > 20) {
        setNicknameError(t('chatNicknameInvalid'));
        return;
      }
      setIsSubmittingNickname(true);
      setNicknameError('');
      const result = await signIn(content);
      setIsSubmittingNickname(false);
      if (result?.error) {
        setNicknameError(result.errorCode ? t(result.errorCode) : result.error);
        return;
      }
      setValue('');
      return;
    }

    setValue('');
    setIsExpanded(false);
    setIsSubmittingMessage(true);
    try {
      await sendMessage(content);
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  const handleKeyDown = (event) => {
    event.stopPropagation();
    if (event.key !== 'Enter' || event.shiftKey) return;

    event.preventDefault();
    const isConfirmingComposition =
      event.nativeEvent?.isComposing || isComposingRef.current || event.keyCode === 229;
    const justFinishedComposition =
      isNicknameMode && Date.now() - lastCompositionEndRef.current < 300;
    if (!isConfirmingComposition && !justFinishedComposition) handleSubmit();
  };

  const handleCreateConversation = async () => {
    if (isNicknameMode || isMessagePending) return;
    setIsSubmittingMessage(true);
    try {
      const conversation = await createConversation();
      if (conversation) {
        setValue('');
        setIsExpanded(false);
      }
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  if (!isMounted || !isChatRoute) return null;

  return createPortal(
    <section
      className={`fixed bottom-[48px] left-1/2 z-30 hidden origin-bottom -translate-x-1/2 transition-[opacity,transform] duration-500 md:block ${
        isEntered
          ? 'scale-100 opacity-100'
          : 'pointer-events-none scale-[0.96] opacity-0'
      }`}
      style={{ transitionTimingFunction: EASE_OUT_CSS }}
      aria-label={t('chatRegionLabel')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!hasInput && !isFocused && !isExpanded && !isMessagePending && !history.isHistoryMode) {
          textareaRef.current?.blur();
        }
      }}
    >
      {/* 外壳 */}
      <div
        className={`relative flex flex-col justify-end overflow-hidden rounded-[16px] border-[1.5px] border-divider bg-[hsl(var(--neutral-bg-card)/0.8)] font-system shadow-[0_4px_36px_12px_hsl(var(--neutral-fg-main)/0.1)] backdrop-blur-[24px] transition-[width,background-color,border-color] duration-[360ms] ${
          isOpen ? 'bg-[hsl(var(--neutral-others-bg))]' : ''
        } ${shellWidthClass}`}
        style={{ transitionTimingFunction: EASE_OUT_CSS }}
      >
        <div
          className="grid transition-[grid-template-rows] duration-[360ms]"
          style={{
            gridTemplateRows: isOpen ? '1fr' : '0fr',
            transitionTimingFunction: EASE_OUT_CSS,
          }}
        >
          <ChatPanels
            isHistoryMode={history.isHistoryMode}
            showMessagePanel={showMessagePanel}
            historyConversations={history.historyConversations}
            selectedHistoryIndex={history.selectedHistoryIndex}
            historyItemRefs={history.historyItemRefs}
            historyListRef={history.historyListRef}
            messageListRef={messageListRef}
            visibleMessages={visibleMessages}
            isMessagePending={isMessagePending}
            streamingContent={streamingContent}
            latestTitleText={latestTitleText}
            onSelectHistory={history.selectHistory}
            onHoverHistory={history.setSelectedHistoryIndex}
            t={t}
          />
        </div>

        {/* 内输入框 */}
        <ChatComposer
          textareaRef={textareaRef}
          value={value}
          isOpen={isOpen}
          isExpanded={isExpanded}
          isPinned={isPinned}
          isHistoryMode={history.isHistoryMode}
          isLoggedIn={isLoggedIn}
          isNicknameMode={isNicknameMode}
          isRateLimited={isRateLimited}
          isSubmittingNickname={isSubmittingNickname}
          isMessagePending={isMessagePending}
          nicknameError={nicknameError}
          canSend={canSend}
          historyCount={history.historyConversations.length}
          placeholder={placeholder}
          onValueChange={(nextValue) => {
            setValue(nextValue);
            if (nicknameError) setNicknameError('');
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onCompositionStart={() => { isComposingRef.current = true; }}
          onCompositionEnd={() => {
            isComposingRef.current = false;
            lastCompositionEndRef.current = Date.now();
          }}
          onKeyDown={handleKeyDown}
          onToggleExpanded={() => setIsExpanded((current) => !current)}
          onTogglePinned={() => setIsPinned((current) => !current)}
          onCreateConversation={handleCreateConversation}
          onEnterHistory={history.enterHistory}
          onExitHistory={history.exitHistory}
          onSubmit={handleSubmit}
          t={t}
        />
      </div>
    </section>,
    document.body,
  );
}
