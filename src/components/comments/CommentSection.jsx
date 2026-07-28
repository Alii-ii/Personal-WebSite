"use client";

import { useState } from 'react';
import { useComments } from '@/hooks/useComments';
import { useAuthContext } from '@/contexts/AuthContext';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import NicknameDialog from './NicknameDialog';

/**
 * 评论区容器
 * 组合列表 + 输入框，并处理未登录（未设昵称）的引导流程
 * @param {Object} props - 组件属性
 * @param {string} props.targetPath - 评论目标路径（如 'gallery/20250910-180822'）
 * @param {string} [props.className] - 额外的 CSS 类名
 */
const CommentSection = ({ targetPath, className = '' }) => {
  // Hook 必须无条件调用，targetPath 为空的分支在下面用 return 处理
  const { comments, count, isLoading, error, addComment, deleteComment, refresh } =
    useComments(targetPath);
  const { user, hasProfile, isLoading: isAuthLoading, signIn } = useAuthContext();
  const [dialogOpen, setDialogOpen] = useState(false);

  // targetPath 缺失时 useComments 不会发起请求，isLoading 会一直卡在 true，直接不渲染
  if (!targetPath) return null;

  // 已登录且已设昵称才能发评论
  const canComment = Boolean(user) && hasProfile;

  return (
    <section
      className={['flex flex-col gap-3', className].filter(Boolean).join(' ')}
    >
      {/* 标题栏 */}
      <div className="flex items-baseline gap-2">
        <h2 className="font-Ding text-[15px] leading-[22px] text-main">评论</h2>
        {!isLoading && !error && (
          <span className="font-light text-[12px] leading-[18px] text-quaternary">
            {count}
          </span>
        )}
      </div>

      {/* 列表 */}
      <CommentList
        comments={comments}
        isLoading={isLoading}
        error={error}
        currentUser={user}
        onDelete={deleteComment}
        onRetry={refresh}
      />

      {/* 底部输入区：已登录给输入框，未登录给引导按钮 */}
      <div className="pt-1">
        {isAuthLoading ? (
          <div className="h-[92px] rounded-[8px] bg-press animate-pulse" aria-hidden="true" />
        ) : canComment ? (
          <CommentForm onSubmit={addComment} />
        ) : (
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className={[
              'w-full rounded-[8px] px-3 py-2.5 text-left',
              'bg-press border border-stroke',
              'font-regular text-[13px] leading-[20px] text-quaternary',
              'transition-colors hover:bg-hover hover:text-tertiary active:bg-press',
            ].join(' ')}
          >
            设置昵称后即可评论
          </button>
        )}
      </div>

      <NicknameDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={signIn}
      />
    </section>
  );
};

export default CommentSection;
