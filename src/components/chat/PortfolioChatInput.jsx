"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import IconTextButton from '@/components/icon-text-botton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip';
import { useChat } from '@/hooks/useChat';

const PLACEHOLDER = 'Ask me anything…';

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
  const {
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
    sendMessage,
  } = useChat();

  const [value, setValue] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmittingNickname, setIsSubmittingNickname] = useState(false);
  const [nicknameError, setNicknameError] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
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
  }, []);

  const hasInput = value.trim().length > 0;
  const isOpen = isExpanded || isHovered || isFocused || hasInput || isStreaming;

  const latestAssistantReply = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].role === 'assistant') return messages[index].content;
    }
    return '';
  }, [messages]);

  const responseText = streamingContent || latestAssistantReply;
  const isNicknameMode = !isAuthLoading && (!isAuthenticated || !hasProfile);
  const titleText = isRateLimited
    ? rateLimitMessage
    : isNicknameMode
      ? isSubmittingNickname
        ? t('chatNicknameSubmitting')
        : nicknameError || t('chatNicknameTitle')
      : responseText || '和 Alii 聊天';
  const placeholder = isNicknameMode && isOpen
    ? t('chatNicknamePlaceholder')
    : PLACEHOLDER;

  const handleSubmit = async () => {
    const content = value.trim();
    if (!content || isStreaming || isRateLimited || isSubmittingNickname) return;

    if (isNicknameMode) {
      if (content.length > 20) {
        setNicknameError('昵称需要 1-20 个字符');
        return;
      }

      setIsSubmittingNickname(true);
      setNicknameError('');
      const result = await signIn(content);
      setIsSubmittingNickname(false);

      if (result?.error) {
        setNicknameError(result.error);
        return;
      }

      setValue('');
      return;
    }

    setValue('');
    await sendMessage(content);
  };

  const handleKeyDown = (event) => {
    event.stopPropagation();
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleToggleExpanded = () => {
    setIsExpanded((current) => !current);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  if (!isMounted) return null;

  return createPortal(
    <section
      className="hidden md:block fixed left-1/2 bottom-[48px] z-30 -translate-x-1/2"
      aria-label={t('chatRegionLabel')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!hasInput && !isFocused && !isExpanded && !isStreaming) textareaRef.current?.blur();
      }}
    >
      <div
        className={[
          'flex flex-col overflow-visible rounded-[16px] font-system',
          'bg-[hsl(var(--neutral-bg-card)/0.8)] backdrop-blur-[24px]',
          'shadow-[0_4px_36px_12px_hsl(var(--neutral-fg-main)/0.1)]',
          'transition-[width,height,background-color,border-color] duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          isOpen
            ? 'border border-divider bg-[hsl(var(--neutral-others-bg))]'
            : 'border-[1.5px] border-divider',
          isExpanded ? 'w-[560px] h-[420px]' : isOpen ? 'w-[480px] h-[129px]' : 'w-[360px] h-[51px]',
        ].join(' ')}
      >
        <header
          className={[
            'absolute left-0 right-0 top-0 z-10 flex h-[30px] items-center gap-1 overflow-hidden',
            'px-4 pt-1 pb-0.5 text-[14px] leading-6 text-secondary',
            'transition-[opacity,transform] duration-200 ease-out',
            isOpen
              ? 'translate-y-0 opacity-100 delay-100'
              : 'pointer-events-none -translate-y-1 opacity-0 delay-0',
          ].join(' ')}
        >
          <p className="min-w-0 flex-1 truncate" aria-live="polite">
            {isStreaming && !streamingContent ? 'Alii 正在想…' : titleText}
          </p>
        </header>

        <div
          className={[
            'absolute bottom-0 left-0 right-0 flex flex-col rounded-[15px]',
            'bg-[hsl(var(--neutral-bg-card)/0.8)] px-3 py-3',
            'transition-[height,border-radius] duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            isExpanded ? 'h-[390px]' : isOpen ? 'h-[99px]' : 'h-[48px]',
          ].join(' ')}
        >
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleToggleExpanded}
                className={[
                  'absolute right-0 top-0 z-10 h-3 w-3 rounded-tr-[8px]',
                  'border-r-[1.5px] border-t-[1.5px] border-divider',
                  'transition-opacity duration-150',
                  isOpen ? 'pointer-events-none opacity-0' : 'opacity-100 delay-100',
                ].join(' ')}
                aria-label={t('chatExpand')}
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="z-[9999]">
              {t('chatExpand')}
            </TooltipContent>
          </Tooltip>

          <div
            className={[
              'absolute right-3 top-3 z-10 transition-[opacity,transform] duration-200 ease-out',
              isOpen
                ? 'scale-100 opacity-100 delay-100'
                : 'pointer-events-none scale-90 opacity-0 delay-0',
            ].join(' ')}
          >
            <IconTextButton
              icon={isExpanded ? <CollapseIcon /> : <ExpandIcon />}
              text=""
              variant="ghost"
              size="sm"
              tooltip={isExpanded ? t('chatCollapse') : t('chatExpand')}
              tooltipSide="top"
              onClick={handleToggleExpanded}
              className="h-6 w-6 rounded-[6px] p-1 text-tertiary [&>span]:!size-4 [&>span]:opacity-100"
              aria-label={isExpanded ? t('chatCollapse') : t('chatExpand')}
            />
          </div>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (nicknameError) setNicknameError('');
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isStreaming || isRateLimited || isSubmittingNickname}
            maxLength={isNicknameMode ? 20 : undefined}
            rows={1}
            className="w-full flex-1 resize-none bg-transparent pb-6 pl-1 pr-7 text-[16px] leading-6 text-main outline-none placeholder:text-quaternary disabled:cursor-not-allowed"
            aria-label={t('chatInputLabel')}
          />

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
              <button
                type="button"
                onClick={() => textareaRef.current?.focus()}
                className="flex h-6 w-6 items-center justify-center rounded-[6px] text-disabled transition-colors hover:bg-hover hover:text-tertiary"
                aria-label={t('chatLogin')}
              >
                <LoginIcon />
              </button>
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-[6px] text-disabled"
                aria-label={t('chatHistory')}
                disabled
              >
                <HistoryIcon />
              </button>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!hasInput || isStreaming || isRateLimited || isSubmittingNickname}
              className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-hover text-tertiary transition-colors hover:bg-press hover:text-main disabled:opacity-35"
              aria-label={t('chatSend')}
            >
              <SendIcon size={16} />
            </button>
          </div>

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
