"use client";

import { useEffect, useRef, useState } from 'react';
import IconTextButton from '@/components/icon-text-botton';
import { useLanguage } from '@/contexts/LanguageContext';
import { EASE_OUT_CSS } from '@/lib/ease';
import { DeleteIcon, LikeIcon, LoadingSpinnerIcon, ReplyIcon, SendIcon } from '@/public/icons';

export const formatRelativeTime = (isoString, t) => {
  if (!isoString) return '';
  const target = new Date(isoString);
  const timestamp = target.getTime();
  if (Number.isNaN(timestamp)) return '';

  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSeconds < 60) return t('timeJustNow');
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return t('timeMinutesAgo', { n: diffMinutes });
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return t('timeHoursAgo', { n: diffHours });
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return t('timeDaysAgo', { n: diffDays });

  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return target.getFullYear() === new Date().getFullYear()
    ? `${month}-${day}`
    : `${target.getFullYear()}-${month}-${day}`;
};

const CommentActions = ({
  replyCount,
  likeCount,
  liked,
  likeAnimating,
  canDelete,
  isDeleting,
  onDelete,
  onReply,
  onLike,
  t,
}) => (
  <div className="hidden items-center gap-1 group-hover/comment:flex group-focus-within/comment:flex">
    {canDelete ? (
      <IconTextButton
        icon={isDeleting ? <LoadingSpinnerIcon width={16} height={16} className="animate-spin text-current" /> : <DeleteIcon />}
        variant="ghost"
        size="sm"
        onClick={onDelete}
        disabled={isDeleting}
        className="h-6 min-w-6 px-1 text-tertiary hover:bg-hover hover:text-main [&>span]:opacity-100"
        aria-label={isDeleting ? t('commentDeleting') : t('commentDelete')}
      />
    ) : null}
    <IconTextButton
      icon={<ReplyIcon />}
      text={replyCount > 0 ? String(replyCount) : undefined}
      variant="ghost"
      size="sm"
      onClick={onReply}
      className="h-6 min-w-6 px-1 text-tertiary hover:bg-hover hover:text-main [&>span]:opacity-100"
      aria-label={t('commentReply')}
    />
    <IconTextButton
      icon={(
        <span
          className={`inline-flex transform-gpu transition-transform duration-200 ease-out ${
            likeAnimating ? 'scale-125' : 'scale-100'
          }`}
        >
          <LikeIcon filled={liked} />
        </span>
      )}
      text={likeCount > 0 ? String(likeCount) : undefined}
      variant="ghost"
      size="sm"
      onClick={onLike}
      className={`h-6 min-w-6 px-1 hover:bg-hover [&>span]:opacity-100 ${liked ? 'text-main' : 'text-tertiary hover:text-main'}`}
      aria-label={liked ? t('commentUnlike') : t('commentLike')}
      aria-pressed={liked}
    />
  </div>
);

export default function CommentItem({
  comment,
  isReply = false,
  replyCount = 0,
  likeCount = 0,
  liked,
  canDelete = false,
  onDelete,
  onReply,
  onLike,
}) {
  const { t } = useLanguage();
  const nickname = comment?.site_profiles?.nickname || t('commentAnonymous');
  const replyToNickname = comment?.replyToNickname;
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isEntered, setIsEntered] = useState(false);
  const prevLikedRef = useRef(liked);

  useEffect(() => {
    const wasLiked = prevLikedRef.current;
    prevLikedRef.current = liked;
    // 仅在点赞成功时触发动效，取消点赞不触发
    if (wasLiked || !liked) return undefined;
    setLikeAnimating(true);
    const timer = window.setTimeout(() => setLikeAnimating(false), 200);
    return () => window.clearTimeout(timer);
  }, [liked]);

  useEffect(() => {
    // 首次挂载时做一次轻量出现动效
    const timer = window.setTimeout(() => setIsEntered(true), 16);
    return () => window.clearTimeout(timer);
  }, []);

  const handleDelete = async () => {
    if (!canDelete || isDeleting || isLeaving) return;
    setIsDeleting(true);
    setIsLeaving(true);
    setDeleteError('');
    // 先做退场动画，再真正删除，避免列表项突兀消失
    await new Promise((resolve) => window.setTimeout(resolve, 220));
    const result = await onDelete?.();
    if (result?.error || result?.errorCode) {
      setDeleteError(result.errorCode ? t(result.errorCode) : result.error);
      setIsDeleting(false);
      setIsLeaving(false);
    }
  };

  return (
    <li
      className={`group/comment relative flex flex-col overflow-hidden rounded-lg py-1.5 transition-[max-height,opacity,transform,margin,padding,background-color] duration-300 hover:bg-hover ${
        isLeaving
          ? 'my-0 max-h-0 translate-y-1 py-0 opacity-0'
          : isEntered
            ? 'max-h-60 translate-y-0 opacity-100'
            : 'max-h-60 translate-y-1 opacity-0'
      } ${isReply ? 'pl-9 pr-2' : 'pl-3 pr-2'}`}
      style={{ transitionTimingFunction: EASE_OUT_CSS }}
    >
      {isReply ? (
        <span className="absolute left-3 top-[11px] flex size-4 items-center justify-center text-quaternary opacity-50">
          <SendIcon className="transform -scale-x-100 size-3.5" />
        </span>
      ) : null}

      <div className="flex min-h-6 items-center gap-2">
        {/* user id */}
        <button
          type="button"
          onClick={onReply}
          className="group/id flex min-w-0 items-center truncate rounded-[4px] font-system text-[14px] leading-6 text-quaternary transition-colors duration-150 hover:text-main focus-visible:text-main focus-visible:outline-none"
          style={{ transitionTimingFunction: EASE_OUT_CSS }}
          aria-label={t('commentReplyTo', { name: nickname })}
        >
          <span
            aria-hidden="true"
            className="max-w-0 overflow-hidden opacity-0 transition-[max-width,opacity] duration-150 group-hover/id:max-w-4 group-hover/id:opacity-100 group-focus-visible/id:max-w-4 group-focus-visible/id:opacity-100"
            style={{ transitionTimingFunction: EASE_OUT_CSS }}
          >
            @
          </span>
          <span className="truncate">{nickname}</span>
        </button>

        {/* 右 */}
        <div className="ml-auto flex h-6 shrink-0 items-center gap-1">
          <span className="font-light text-[12px] leading-[18px] text-tertiary group-hover/comment:hidden group-focus-within/comment:hidden">
            {formatRelativeTime(comment?.created_at, t)}
          </span>
          <CommentActions
            replyCount={replyCount}
            likeCount={likeCount}
            liked={liked}
            likeAnimating={likeAnimating}
            canDelete={canDelete}
            isDeleting={isDeleting}
            onDelete={handleDelete}
            onReply={onReply}
            onLike={onLike}
            t={t}
          />
        </div>
      </div>

      <p className="min-h-6 whitespace-pre-wrap break-words font-system text-[14px] leading-6 text-main">
        {isReply && replyToNickname ? (
          <>{t('commentReplyPrefix')}<span className="text-quaternary">{t('commentReplyTarget', { name: replyToNickname })}</span>{comment?.content}</>
        ) : comment?.content}
      </p>
      <div
        className={`overflow-hidden transition-[max-height,opacity,margin-top] duration-250 ${
          deleteError ? 'mt-1 max-h-10 opacity-100' : 'mt-0 max-h-0 opacity-0'
        }`}
        style={{ transitionTimingFunction: EASE_OUT_CSS }}
      >
        <p className="font-light text-[11px] leading-4 text-quaternary">{deleteError}</p>
      </div>
    </li>
  );
}
