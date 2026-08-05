"use client";

import { useEffect, useState } from 'react';
import { useComments } from '@/hooks/useComments';
import { useLanguage } from '@/contexts/LanguageContext';
import CommentList from './CommentList';
import CommentComposer from './CommentComposer';

export default function CommentSection({ targetPath, className = '' }) {
  const { t } = useLanguage();
  const {
    comments,
    likesByComment,
    likedCommentIds,
    count,
    isLoading,
    error,
    addComment,
    deleteComment,
    toggleLike,
    refresh,
  } = useComments(targetPath);
  const [replyTarget, setReplyTarget] = useState(null);

  useEffect(() => setReplyTarget(null), [targetPath]);

  if (!targetPath) return null;

  const handleSubmit = (content, target) => addComment(content, target || {});

  return (
    <section className={`flex h-full min-h-0 flex-col ${className}`}>
      <div className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-1 px-3">
        <h2 className="font-regular text-[16px] leading-6 text-main">{t('commentSectionTitle')}</h2>
        {!isLoading && !error && count > 0 ? (
          <span className="font-regular text-[16px] leading-6 text-quaternary">{count}</span>
        ) : null}
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="flex min-h-full flex-col">
          <CommentList
            comments={comments}
            likesByComment={likesByComment}
            likedCommentIds={likedCommentIds}
            targetPath={targetPath}
            isLoading={isLoading}
            error={error}
            onReply={setReplyTarget}
            onDelete={deleteComment}
            onLike={toggleLike}
            onRetry={refresh}
          />

          <div className="sticky bottom-0 z-20 shrink-0 overflow-hidden rounded-b-[16px] bg-gradient-to-t from-card via-card to-transparent px-0 pt-2">
            <CommentComposer
              onSubmit={handleSubmit}
              replyTarget={replyTarget}
              onCancelReply={() => setReplyTarget(null)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
