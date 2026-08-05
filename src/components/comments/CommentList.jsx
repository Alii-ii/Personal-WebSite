"use client";

import { Fragment, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthContext } from '@/contexts/AuthContext';
import CommentItem from './CommentItem';

const ListSkeleton = () => (
  <div className="flex flex-col gap-3 px-3 py-3" aria-hidden="true">
    {[0, 1, 2].map((index) => (
      <div key={index} className="flex flex-col gap-2 py-1.5">
        <div className="h-4 w-20 rounded-[4px] bg-press animate-pulse" />
        <div className="h-4 w-full rounded-[4px] bg-press animate-pulse" />
      </div>
    ))}
  </div>
);

const parseCommentPath = (comment, targetPath) => {
  if (comment.target_path === targetPath) return { parentId: null, replyToId: null };
  const prefix = `${targetPath}/comments/`;
  if (!comment.target_path?.startsWith(prefix)) return { parentId: null, replyToId: null };
  const [parentId, replyToId] = comment.target_path.slice(prefix.length).split('/');
  return { parentId, replyToId: replyToId || null };
};

export default function CommentList({
  comments = [],
  likesByComment = {},
  likedCommentIds = new Set(),
  targetPath,
  isLoading,
  error,
  onReply,
  onDelete,
  onLike,
  onRetry,
}) {
  const { t } = useLanguage();
  const { user } = useAuthContext();

  const { roots, repliesByParent, commentsById } = useMemo(() => {
    const rootItems = [];
    const replies = new Map();
    const normalizedComments = comments.map((comment) => {
      const path = parseCommentPath(comment, targetPath);
      return { ...comment, ...path };
    });
    const byId = new Map(normalizedComments.map((comment) => [String(comment.id), comment]));

    normalizedComments.forEach((comment) => {
      if (!comment.parentId) {
        rootItems.push(comment);
        return;
      }
      const list = replies.get(comment.parentId) || [];
      list.push(comment);
      replies.set(comment.parentId, list);
    });

    return { roots: rootItems, repliesByParent: replies, commentsById: byId };
  }, [comments, targetPath]);

  if (isLoading) return <ListSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-start gap-2 px-3 py-6">
        <p className="font-regular text-[13px] leading-5 text-tertiary">{t(error)}</p>
        <button type="button" onClick={onRetry} className="rounded-[6px] bg-press px-2 py-1 text-[12px] text-secondary hover:bg-hover">
          {t('commentRetry')}
        </button>
      </div>
    );
  }

  if (roots.length === 0) return null;

  return (
    <ul className="flex flex-col">
      {roots.map((comment) => {
        const replies = repliesByParent.get(String(comment.id)) || [];
        return (
          <Fragment key={comment.id}>
            <CommentItem
              comment={comment}
              replyCount={replies.length}
              liked={likedCommentIds.has(comment.id)}
              likeCount={likesByComment[comment.id] || 0}
              onLike={() => onLike?.(comment.id)}
              canDelete={Boolean(user?.id) && comment.user_id === user.id}
              onDelete={() => onDelete?.(comment.id)}
              onReply={() => onReply?.({
                parentId: comment.id,
                replyToId: null,
                nickname: comment.site_profiles?.nickname || t('commentAnonymous'),
              })}
            />
            {replies.map((reply) => {
              const directTarget = commentsById.get(String(reply.replyToId));
              const replyToNickname = directTarget?.site_profiles?.nickname || comment.site_profiles?.nickname || t('commentAnonymous');
              return (
                <CommentItem
                  key={reply.id}
                  comment={{ ...reply, replyToNickname }}
                  isReply
                  liked={likedCommentIds.has(reply.id)}
                  likeCount={likesByComment[reply.id] || 0}
                  onLike={() => onLike?.(reply.id)}
                  canDelete={Boolean(user?.id) && reply.user_id === user.id}
                  onDelete={() => onDelete?.(reply.id)}
                  onReply={() => onReply?.({
                    parentId: comment.id,
                    replyToId: reply.id,
                    nickname: reply.site_profiles?.nickname || t('commentAnonymous'),
                  })}
                />
              );
            })}
          </Fragment>
        );
      })}
    </ul>
  );
}
