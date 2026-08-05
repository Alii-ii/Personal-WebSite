"use client";

import { useLayoutEffect, useRef, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import IconTextButton from '@/components/icon-text-botton';
import { LoadingSpinnerIcon, SendIcon } from '@/public/icons';

const MAX_LENGTH = 500;

export default function CommentComposer({
  onSubmit,
  replyTarget,
  onCancelReply,
}) {
  const {
    user,
    hasProfile,
    isLoading: isAuthLoading,
    signIn,
  } = useAuthContext();
  const { t } = useLanguage();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);
  const isComposingRef = useRef(false);
  const lastCompositionEndRef = useRef(0);

  const canComment = Boolean(user) && hasProfile;
  const isNicknameMode = !isAuthLoading && !canComment;
  const trimmed = content.trim();
  const maxLength = isNicknameMode ? 20 : MAX_LENGTH;
  const canSubmit =
    trimmed.length > 0 && content.length <= maxLength && !isSubmitting && !isAuthLoading;

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = '24px';
    const maxHeight = window.innerHeight * 0.5;
    const nextHeight = content
      ? Math.min(textarea.scrollHeight, maxHeight)
      : 24;
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = content && textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [content, isNicknameMode, replyTarget]);

  const submit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError('');

    if (isNicknameMode) {
      if (trimmed.length > 20) {
        setError(t('chatNicknameInvalid'));
        setIsSubmitting(false);
        return;
      }
      const result = await signIn(trimmed);
      if (result?.error) {
        setError(result.errorCode ? t(result.errorCode) : result.error);
      } else {
        setContent('');
      }
      setIsSubmitting(false);
      return;
    }

    const result = await onSubmit?.(trimmed, replyTarget);
    if (result?.error || result?.errorCode) {
      setError(result.errorCode ? t(result.errorCode) : result.error);
    } else {
      setContent('');
      onCancelReply?.();
    }
    setIsSubmitting(false);
  };

  const handleKeyDown = (event) => {
    event.stopPropagation();
    if (event.key !== 'Enter' || event.shiftKey) return;

    event.preventDefault();
    const isConfirmingComposition =
      event.nativeEvent?.isComposing || isComposingRef.current || event.keyCode === 229;
    const justFinishedComposition = Date.now() - lastCompositionEndRef.current < 300;
    if (!isConfirmingComposition && !justFinishedComposition) submit();
  };

  return (
    <div className="relative flex h-fit min-h-10 w-full shrink-0 flex-col overflow-hidden rounded-[16px] border border-divider bg-[hsl(var(--neutral-bg-card)/0.88)] px-3 pb-8 pt-2 backdrop-blur-[24px] backdrop-saturate-150">
      {replyTarget && canComment ? (
        <div className="mb-1 flex items-center gap-1 pl-1 pr-7 font-system text-[12px] leading-[18px] text-tertiary">
          <span className="truncate">{t('commentReplyingTo', { name: replyTarget.nickname })}</span>
          <button
            type="button"
            onClick={onCancelReply}
            className="ml-auto shrink-0 rounded-[4px] px-1 hover:bg-hover hover:text-main"
          >
            {t('commentCancel')}
          </button>
        </div>
      ) : null}

      <textarea
        ref={textareaRef}
        value={content}
        onChange={(event) => {
          setContent(event.target.value);
          if (error) setError('');
        }}
        onCompositionStart={() => { isComposingRef.current = true; }}
        onCompositionEnd={() => {
          isComposingRef.current = false;
          lastCompositionEndRef.current = Date.now();
        }}
        onKeyDown={handleKeyDown}
        placeholder={
          isAuthLoading
            ? t('chatNicknameSubmitting')
            : isNicknameMode
              ? t('commentNicknamePlaceholder')
              : replyTarget
                ? `${t('commentReplyTo', { name: replyTarget.nickname })}…`
                : t('commentPlaceholder')
        }
        disabled={isSubmitting || isAuthLoading}
        maxLength={maxLength}
        rows={1}
        className="h-6 max-h-[50vh] min-h-6 w-full resize-none overflow-y-hidden bg-transparent pl-1 pr-8 font-system text-[14px] leading-6 text-main outline-none placeholder:text-quaternary disabled:cursor-not-allowed"
        aria-label={isNicknameMode ? t('commentNicknameInputLabel') : t('commentInputLabel')}
      />

      <div className="absolute bottom-2 left-3 flex h-6 max-w-[245px] items-center pl-1 font-system text-[11px] leading-4 text-tertiary">
        {error ? <span className="truncate">{error}</span> : null}
      </div>

      <IconTextButton
        icon={
          isSubmitting ? (
            <LoadingSpinnerIcon width={16} height={16} className="animate-spin text-current" />
          ) : (
            <SendIcon size={16} />
          )
        }
        variant={canSubmit ? 'CTA' : 'default'}
        size="sm"
        onClick={submit}
        disabled={!canSubmit}
        className={`absolute bottom-2 right-3 [&>span]:opacity-100 disabled:opacity-35 ${
          canSubmit ? '' : 'bg-hover text-tertiary hover:bg-hover hover:text-tertiary'
        }`}
        aria-label={isNicknameMode ? t('commentSetNickname') : t('commentSend')}
      />
    </div>
  );
}
