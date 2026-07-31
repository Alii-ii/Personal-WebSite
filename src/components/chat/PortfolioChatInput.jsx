"use client";

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ShinyText from '@/components/ShinyText';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip';
import { useChat } from '@/hooks/useChat';

function CollapseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M20.75 10C20.75 10.4142 20.4143 10.75 20 10.75L14.5001 10.75C13.8097 10.75 13.25 10.1903 13.25 9.4999L13.25 3.99996C13.25 3.58573 13.5858 3.24996 14 3.24996L14.0723 3.25339C14.4526 3.28972 14.75 3.6101 14.75 3.99995L14.75 8.18929L19.2197 3.71962C19.5126 3.42673 19.9875 3.42673 20.2804 3.71962C20.5733 4.01251 20.5733 4.48738 20.2804 4.78028L15.8107 9.25L20 9.25C20.4143 9.25 20.75 9.5857 20.75 10Z" fill="currentColor" />
      <path d="M4 13.25C3.58579 13.25 3.25 13.5858 3.25 14C3.25 14.4142 3.58579 14.75 4 14.75L8.18933 14.75L3.71967 19.2197C3.42678 19.5126 3.42678 19.9874 3.71967 20.2803C4.01257 20.5732 4.48744 20.5732 4.78033 20.2803L9.25 15.8107V20C9.25 20.3899 9.54744 20.7102 9.92777 20.7466L10 20.75C10.4142 20.75 10.75 20.4142 10.75 20L10.75 14.5C10.75 13.8096 10.1904 13.25 9.5 13.25L4 13.25Z" fill="currentColor" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M10.75 20C10.75 20.4142 10.4142 20.75 10 20.75H4.5C3.80964 20.75 3.25 20.1904 3.25 19.5V14C3.25 13.5858 3.58579 13.25 4 13.25L4.07223 13.2534C4.45256 13.2898 4.75 13.6102 4.75 14V18.1893L9.21967 13.7197C9.51256 13.4268 9.98743 13.4268 10.2803 13.7197C10.5732 14.0126 10.5732 14.4874 10.2803 14.7803L5.81066 19.25H10C10.4142 19.25 10.75 19.5858 10.75 20ZM13.25 3.99995C13.25 3.5858 13.5858 3.24995 14 3.24995H19.4999C20.1904 3.24995 20.75 3.8096 20.75 4.50005V10C20.75 10.4142 20.4142 10.75 20 10.75L19.9277 10.7466C19.5475 10.7102 19.25 10.3898 19.25 10V5.81066L14.7803 10.2803C14.4874 10.5732 14.0126 10.5732 13.7197 10.2803C13.4268 9.98744 13.4268 9.51257 13.7197 9.21967L18.1893 4.74995H14C13.5858 4.74995 13.25 4.41425 13.25 3.99995Z" fill="currentColor" />
    </svg>
  );
}

function SendIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.26735 14.6615L8.00004 14.7488H16.9862C17.8978 14.7488 18.549 14.5411 18.9397 14.1256C19.3366 13.7101 19.535 13.0682 19.535 12.2V7.93946C19.535 7.02783 19.3366 6.37666 18.9397 5.98595C18.549 5.59525 17.8978 5.3999 16.9862 5.3999H13.1443C12.9148 5.3999 12.7288 5.47432 12.5861 5.62316C12.4497 5.7658 12.3815 5.94254 12.3815 6.1534C12.3815 6.35805 12.4497 6.5348 12.5861 6.68364C12.7288 6.82627 12.9148 6.89759 13.1443 6.89759H16.9862C17.3645 6.89759 17.6311 6.97821 17.7862 7.13945C17.9474 7.3007 18.0281 7.56737 18.0281 7.93946V12.2C18.0281 12.5783 17.9474 12.848 17.7862 13.0093C17.6311 13.1705 17.3645 13.2511 16.9862 13.2511H8.00004L6.27589 13.3313L7.60004 12.2279L9.57215 10.3116C9.64037 10.2434 9.68998 10.1689 9.72099 10.0883C9.7582 10.0077 9.7768 9.91158 9.7768 9.79995C9.7768 9.58289 9.70859 9.40614 9.57215 9.26971C9.44192 9.13327 9.26517 9.06506 9.04191 9.06506C8.83106 9.06506 8.64811 9.14258 8.49307 9.29762L4.25117 13.4372C4.08372 13.5922 4 13.7783 4 13.9953C4 14.2124 4.08372 14.4015 4.25117 14.5628L8.49307 18.7024C8.64811 18.8574 8.83106 18.9349 9.04191 18.9349C9.26517 18.9349 9.44192 18.8667 9.57215 18.7303C9.70859 18.5876 9.7768 18.4078 9.7768 18.1907C9.7768 18.0853 9.7582 17.9923 9.72099 17.9117C9.68998 17.8248 9.64037 17.7473 9.57215 17.6791L7.60004 15.7721L6.26735 14.6615Z" fill="currentColor" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.08611 18.9781L8.47039 14.6489L5.98557 12.1953C5.72208 11.9351 5.54688 11.6293 5.45984 11.2778C5.37822 10.9478 5.38372 10.6175 5.4764 10.2869C5.56915 9.95646 5.73654 9.67046 5.97848 9.42889C6.23623 9.1717 6.54585 8.99849 6.90732 8.90925L9.79456 8.19649C10.0612 8.13066 10.2916 8.0018 10.4858 7.80998L13.03 5.29774L11.4517 3.73925C11.1612 3.45237 11.1611 2.98716 11.4517 2.70021C11.7422 2.41332 12.2134 2.41339 12.5039 2.70028L21.6232 11.7051C21.9138 11.992 21.9138 12.4571 21.6232 12.744C21.3326 13.031 20.8616 13.031 20.571 12.744L18.9927 11.1855L16.4485 13.6978C16.2542 13.8896 16.1238 14.1171 16.0571 14.3804L15.3353 17.2314C15.2449 17.5883 15.0695 17.894 14.809 18.1485C14.5644 18.3875 14.2748 18.5528 13.94 18.6443C13.6053 18.7359 13.2708 18.7413 12.9366 18.6607C12.5806 18.5748 12.2709 18.4017 12.0075 18.1416L9.52262 15.6879L5.13834 20.0172C4.84778 20.3041 4.37667 20.3041 4.08611 20.0172C3.79556 19.7303 3.79555 19.2651 4.08611 18.9781ZM14.0823 6.33678L11.5381 8.84902C11.1495 9.23273 10.6886 9.49039 10.1555 9.62205L7.26822 10.3347C7.08116 10.3809 6.96191 10.4957 6.91053 10.6792C6.85901 10.8626 6.90146 11.0217 7.03779 11.1563L13.0597 17.1026C13.196 17.2372 13.357 17.2791 13.5428 17.2282C13.7286 17.1774 13.8449 17.0597 13.8916 16.875L14.6134 14.024C14.7467 13.4975 15.0077 13.0424 15.3963 12.6587L17.9404 10.1465L14.0823 6.33678Z"
        fill="currentColor"
        fillOpacity="0.65"
      />
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M12.7022 3.97908C12.5075 4.17492 12.1909 4.17585 11.9951 3.98116C10.9399 2.93216 9.51796 2.33325 7.99999 2.33325C4.87039 2.33325 2.33333 4.87032 2.33333 7.99992C2.33333 11.1295 4.87039 13.6666 7.99999 13.6666C9.50853 13.6666 10.9224 13.0752 11.9759 12.0377C12.1726 11.844 12.4892 11.8464 12.6829 12.0431C12.8767 12.2399 12.8743 12.5565 12.6775 12.7502C11.4388 13.9701 9.77376 14.6666 7.99999 14.6666C4.31809 14.6666 1.33333 11.6818 1.33333 7.99992C1.33333 4.31802 4.31809 1.33325 7.99999 1.33325C9.78486 1.33325 11.4594 2.03855 12.7001 3.27198C12.8959 3.46667 12.8969 3.78325 12.7022 3.97908ZM5.99999 7.99992C5.99999 7.72378 6.22386 7.49992 6.49999 7.49992H11.457V6.58865C11.457 6.32955 11.7397 6.16952 11.9618 6.30282L14.3139 7.71408C14.5297 7.84355 14.5297 8.15628 14.3139 8.28575L11.9618 9.69702C11.7397 9.83032 11.457 9.67029 11.457 9.41119V8.49992H6.49999C6.22386 8.49992 5.99999 8.27605 5.99999 7.99992Z" fill="currentColor" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8.00018 1.33325C8.90418 1.33325 9.76922 1.50795 10.5953 1.85736C11.3929 2.19474 12.0993 2.67091 12.7142 3.28587C13.3292 3.90084 13.8054 4.60715 14.1427 5.40478C14.4922 6.23087 14.6669 7.09592 14.6668 7.99992C14.6668 8.90392 14.4921 9.76896 14.1427 10.5951C13.8054 11.3927 13.3292 12.099 12.7142 12.714C12.0993 13.329 11.3929 13.8052 10.5953 14.1425C9.76922 14.4919 8.90418 14.6666 8.00018 14.6666C7.09618 14.6666 6.23114 14.4919 5.40508 14.1425C4.60743 13.8052 3.90112 13.329 3.28615 12.714C2.98328 12.4111 2.71211 12.0825 2.47263 11.7281C2.41654 11.645 2.3867 11.5476 2.3867 11.4478C2.3867 11.1716 2.61055 10.9478 2.8867 10.9478C3.05278 10.9478 3.20803 11.0302 3.30101 11.1679L3.30163 11.1688C3.50522 11.4701 3.73576 11.7494 3.99325 12.0069C4.51627 12.5299 5.11672 12.9348 5.79461 13.2215C6.49619 13.5183 7.23138 13.6666 8.00018 13.6666C8.769 13.6666 9.5042 13.5183 10.2058 13.2215C10.8837 12.9348 11.4841 12.5299 12.0071 12.0069C12.5302 11.4839 12.935 10.8834 13.2217 10.2055C13.5185 9.50391 13.6668 8.76872 13.6668 7.99992C13.6668 7.23112 13.5185 6.49593 13.2217 5.79435C12.935 5.11646 12.5302 4.516 12.0071 3.99298C11.4841 3.46996 10.8837 3.06508 10.2058 2.77836C9.5042 2.48162 8.769 2.33325 8.00018 2.33325C7.72404 2.33325 7.50018 2.10939 7.50018 1.83325C7.50018 1.55711 7.72404 1.33325 8.00018 1.33325ZM6.43101 2.0153C6.52241 2.27589 6.38524 2.56121 6.12464 2.6526C5.61995 2.8296 5.14974 3.07318 4.71401 3.38333C4.48903 3.54346 4.17684 3.49089 4.01671 3.26592C3.93981 3.15789 3.90898 3.02373 3.931 2.89296C3.95301 2.76219 4.02608 2.64553 4.13411 2.56863C4.64673 2.20375 5.19993 1.91719 5.79371 1.70895C6.05431 1.61756 6.33961 1.75472 6.43101 2.0153ZM2.60394 4.08501C2.68181 3.97768 2.79913 3.90567 2.93009 3.88484C3.06105 3.86401 3.19493 3.89605 3.30226 3.97393C3.52578 4.13609 3.57551 4.44874 3.41335 4.67225C3.22695 4.92916 3.0633 5.19983 2.92239 5.48425C2.82748 5.67581 2.74368 5.87211 2.67099 6.07315C2.57709 6.33285 2.29046 6.46725 2.03077 6.37335C1.90606 6.32828 1.80438 6.23548 1.74808 6.11542C1.69178 5.99535 1.68548 5.85785 1.73057 5.73315C1.81609 5.49662 1.91468 5.26567 2.02634 5.04032C2.19212 4.7057 2.38465 4.38727 2.60394 4.08501ZM7.66684 4.83325C7.66684 4.55711 7.89071 4.33325 8.16684 4.33325C8.44298 4.33325 8.66684 4.55711 8.66684 4.83325V7.98185C8.66684 8.26915 8.51884 8.53622 8.27518 8.68848L6.43184 9.84058C6.19768 9.98695 5.88921 9.91575 5.74284 9.68158L5.71928 9.63955C5.60544 9.41168 5.68144 9.13032 5.90184 8.99258L7.66685 7.88958L7.66684 4.83325ZM1.48937 7.50025C1.58522 7.40862 1.71355 7.35882 1.84612 7.36178C2.12219 7.36798 2.34097 7.59678 2.33478 7.87288C2.32278 8.40777 2.38528 8.93382 2.52229 9.45102C2.55625 9.57922 2.53789 9.71562 2.47126 9.83028C2.40463 9.94495 2.29519 10.0284 2.167 10.0624C2.03882 10.0964 1.90239 10.078 1.78774 10.0114C1.67308 9.94472 1.5896 9.83528 1.55564 9.70708C1.39445 9.09862 1.32092 8.47974 1.33503 7.85045C1.33801 7.71788 1.39352 7.59192 1.48937 7.50025Z" fill="currentColor" />
    </svg>
  );
}

export default function PortfolioChatInput() {
  const nextPathname = usePathname();
  const [browserPathname, setBrowserPathname] = useState('');

  useEffect(() => {
    setBrowserPathname(window.location.pathname);
  }, []);

  const pathname = nextPathname || browserPathname;
  const normalizedPathname = pathname?.replace(/\/+$/, '') || '/';
  const isChatRoute =
    normalizedPathname === '/portfolio' || normalizedPathname === '/resume';
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
    messages,
    isStreaming,
    streamingContent,
    isRateLimited,
    rateLimitMessage,
    createConversation,
    sendMessage,
  } = useChat(user, accessToken);

  const [value, setValue] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmittingNickname, setIsSubmittingNickname] = useState(false);
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const [nicknameError, setNicknameError] = useState('');
  const textareaRef = useRef(null);
  const messageListRef = useRef(null);
  const isComposingRef = useRef(false);
  const lastCompositionEndRef = useRef(0);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!isChatRoute) return undefined;

    const focusChatInput = (event) => {
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
  }, [isChatRoute]);

  const hasInput = value.trim().length > 0;
  const isMessagePending = isSubmittingMessage || isStreaming;
  const isOpen = isPinned || isExpanded || isHovered || isFocused || hasInput || isMessagePending;
  const isNicknameMode = !isAuthLoading && (!isAuthenticated || !hasProfile);
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
  const latestVisibleMessage = visibleMessages[visibleMessages.length - 1];
  const latestTitleText = isMessagePending && !streamingContent
    ? t('chatThinking')
    : latestVisibleMessage?.contentKey
      ? t(latestVisibleMessage.contentKey)
      : latestVisibleMessage?.content || titleText;
  const placeholder = isNicknameMode && isOpen
    ? t('chatNicknamePlaceholder')
    : t('chatPlaceholder');

  useEffect(() => {
    if (isExpanded || !isOpen) return;
    const messageList = messageListRef.current;
    if (!messageList) return;
    messageList.scrollTop = messageList.scrollHeight;
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
      event.nativeEvent?.isComposing ||
      isComposingRef.current ||
      event.keyCode === 229;
    const justFinishedComposition =
      isNicknameMode && Date.now() - lastCompositionEndRef.current < 300;

    if (isConfirmingComposition || justFinishedComposition) return;
    handleSubmit();
  };

  const handleToggleExpanded = () => {
    setIsExpanded((current) => !current);
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
      className="hidden md:block fixed left-1/2 bottom-[48px] z-30 -translate-x-1/2"
      aria-label={t('chatRegionLabel')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!hasInput && !isFocused && !isExpanded && !isMessagePending) textareaRef.current?.blur();
      }}
    >
      <div
        className={[
          'relative flex flex-col justify-end overflow-hidden rounded-[16px] font-system',
          'bg-[hsl(var(--neutral-bg-card)/0.8)] backdrop-blur-[24px]',
          'shadow-[0_4px_36px_12px_hsl(var(--neutral-fg-main)/0.1)]',
          'transition-[width,min-height,background-color,border-color] duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          isOpen
            ? 'border border-divider bg-[hsl(var(--neutral-others-bg))]'
            : 'border-[1.5px] border-divider',
          isExpanded ? 'w-[560px] min-h-[420px]' : isOpen ? 'w-[480px] min-h-[129px]' : 'w-[360px] min-h-[51px]',
        ].join(' ')}
      >
        {/* 展开分支: 聊天消息区域 */}
        {!isExpanded && isOpen && !isNicknameMode && (visibleMessages.length > 0 || isMessagePending) ? (
          <div
            ref={messageListRef}
            className="no-scrollbar relative z-10 flex h-fit max-h-[50vh] w-full min-w-0 flex-col items-start gap-2 overflow-y-auto overflow-x-hidden p-2 text-[14px] leading-6 text-main"
            aria-live="polite"
            aria-label={t('chatRegionLabel')}
          >
            {visibleMessages.map((message) => (
              <div
                key={message.id}
                className={[
                  'flex w-full shrink-0',
                  message.role === 'user'
                    ? 'flex-col items-end justify-center gap-1 pl-12'
                    : 'flex-row items-start gap-1 pl-2 pr-12',
                ].join(' ')}
              >
                {message.role === 'user' ? (
                  <p className="max-w-full whitespace-pre-wrap break-words rounded-[8px] bg-divider px-2 py-1">
                    {message.content}
                  </p>
                ) : message.id === 'streaming-assistant' ? (
                  <ShinyText
                    text={message.content}
                    speed={1}
                    color="hsl(var(--neutral-fg-quaternary))"
                    shineColor="hsl(var(--neutral-fg-main))"
                    spread={120}
                    className="block min-w-0 max-w-full flex-1 whitespace-pre-wrap break-words"
                  />
                ) : (
                  <p className="min-w-0 flex-1 whitespace-pre-wrap break-words">
                    {message.contentKey ? t(message.contentKey) : message.content}
                  </p>
                )}
              </div>
            ))}

            {isMessagePending && !streamingContent ? (
              <p className="w-full min-w-0 overflow-hidden pl-2 pl-12">
                <ShinyText
                  text={t('chatThinking')}
                  speed={1}
                  color="hsl(var(--neutral-fg-quaternary))"
                  shineColor="hsl(var(--neutral-fg-main))"
                  spread={120}
                />
              </p>
            ) : null}

          </div>
        ) : (
          <header
            className={[
              'relative z-10 flex h-[30px] w-full shrink-0 items-center gap-1 overflow-hidden',
              'px-2 pt-1 pb-0.5 text-[14px] leading-6 text-secondary',
              'transition-[opacity,transform] duration-200 ease-out',
              isOpen
                ? 'translate-y-0 opacity-100 delay-100'
                : 'pointer-events-none hidden -translate-y-1 opacity-0 delay-0',
            ].join(' ')}
          >
            {/* 折叠分支: 仅标题状态 */}
            <p className="min-w-0 flex-1 truncate px-2" aria-live="polite">
              {latestTitleText}
            </p>
          </header>
        )}

        {/* 输入框区域 */}
        <div
          className={[
            'relative flex w-full shrink-0 flex-col rounded-[15px]',
            'bg-[hsl(var(--neutral-bg-card)/0.8)] px-3 py-3 border-t border-divider border-t-[0.5px]',
            'transition-[height,border-radius] duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            isExpanded ? 'h-[390px]' : isOpen ? 'h-[99px]' : 'h-[48px]',
          ].join(' ')}
        >
          {/* 单一展开/收起开关：收起隐藏，展开态默认软提示，hover 显示完整图标按钮 */}
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleToggleExpanded}
                className={[
                  'group/toggle absolute right-3 top-3 z-10 h-6 w-6 rounded-[6px]',
                  'text-tertiary transition-[background-color,color,opacity,transform] duration-150',
                  'before:absolute before:right-0 before:top-0 before:h-3 before:w-3 before:rounded-tr-[8px]',
                  'before:border-r-[1.5px] before:border-t-[1.5px] before:border-stroke',
                  'before:transition-opacity before:duration-150 hover:before:opacity-0',
                  'hover:bg-hover hover:text-main',
                  isOpen
                    ? 'scale-100 opacity-100 delay-100'
                    : 'pointer-events-none scale-90 opacity-0 delay-0',
                ].join(' ')}
                aria-label={isExpanded ? t('chatCollapse') : t('chatExpand')}
              >
                <span className="flex h-full w-full items-center justify-center opacity-0 transition-opacity duration-150 group-hover/toggle:opacity-100">
                  {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="z-[9999]">
              {isExpanded ? t('chatCollapse') : t('chatExpand')}
            </TooltipContent>
          </Tooltip>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (nicknameError) setNicknameError('');
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false;
              lastCompositionEndRef.current = Date.now();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isRateLimited || isSubmittingNickname}
            maxLength={isNicknameMode ? 20 : undefined}
            rows={1}
            className="w-full flex-1 resize-none bg-transparent pb-6 pl-1 pr-7 text-[16px] leading-6 text-main outline-none placeholder:text-quaternary disabled:cursor-not-allowed"
            aria-label={t('chatInputLabel')}
          />

          {/* 底部左侧按钮组 */}
          <div
            className={[
              'absolute bottom-3 left-3 right-3 flex h-6 items-center justify-between',
              'transition-[opacity,transform] duration-200 ease-out',
              isOpen
                ? 'translate-y-0 opacity-100 delay-100'
                : 'pointer-events-none translate-y-1 opacity-0 delay-0',
            ].join(' ')}
          >
            <div className="flex h-6 items-center gap-1 text-disabled">

              {/* Pin按钮 */}
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setIsPinned((current) => !current)}
                    className={[
                      'flex h-6 w-6 items-center justify-center rounded-[6px] transition-colors',
                      isPinned
                        ? 'bg-hover text-main'
                        : 'text-disabled hover:bg-hover hover:text-tertiary',
                    ].join(' ')}
                    aria-pressed={isPinned}
                    aria-label={isPinned ? t('chatUnpin') : t('chatPin')}
                  >
                    <PinIcon />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="z-[9999]">
                  {isPinned ? t('chatUnpin') : t('chatPin')}
                </TooltipContent>
              </Tooltip>

              {/* 新建对话 */}
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <span className="inline-flex h-6 w-6">
                    <button
                      type="button"
                      onClick={handleCreateConversation}
                      disabled={isNicknameMode || isMessagePending}
                      className="flex h-6 w-6 items-center justify-center rounded-[6px] text-disabled transition-colors hover:bg-hover hover:text-tertiary disabled:pointer-events-none disabled:opacity-35"
                      aria-label={t('chatNewConversation')}
                    >
                      <LoginIcon />
                    </button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="z-[9999]">
                  {t('chatNewConversation')}
                </TooltipContent>
              </Tooltip>

              {/* 历史对话 */}
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <span className="inline-flex h-6 w-6">
                    <button
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded-[6px] text-disabled opacity-35"
                      aria-label={t('chatHistory')}
                      disabled
                    >
                      <HistoryIcon />
                    </button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="z-[9999]">
                  {t('chatHistory')}
                </TooltipContent>
              </Tooltip>

            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!hasInput || isMessagePending || isRateLimited || isSubmittingNickname}
              className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-hover text-tertiary transition-colors hover:bg-press hover:text-main disabled:pointer-events-none disabled:opacity-35"
              aria-label={t('chatSend')}
            >
              <SendIcon size={16} />
            </button>
          </div>

          {/* 底部右侧发送按钮 */}
          <button
            type="button"
            onClick={() => {
              if (hasInput) handleSubmit();
              else textareaRef.current?.focus();
            }}
            className={[
              'absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center',
              'bg-transparent text-tertiary transition-[opacity,transform] duration-150 ease-out',
              isOpen
                ? 'pointer-events-none translate-x-1 opacity-0'
                : 'translate-x-0 opacity-100 delay-100',
            ].join(' ')}
            aria-label={t('chatSend')}
          >
            <SendIcon size={16} />
          </button>

        </div>
      </div>

    </section>,
    document.body
  );
}
