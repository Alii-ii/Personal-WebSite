"use client";

import CommentItem from './CommentItem';

/**
 * 加载态骨架：窄栏里用两条灰块占位，避免抽屉打开时高度突变
 */
const ListSkeleton = () => (
  <div className="flex flex-col gap-3 py-3" aria-hidden="true">
    {[0, 1].map((index) => (
      <div key={index} className="flex flex-col gap-2">
        <div className="h-3 w-20 rounded-[4px] bg-press animate-pulse" />
        <div className="h-3 w-full rounded-[4px] bg-press animate-pulse" />
        <div className="h-3 w-3/5 rounded-[4px] bg-press animate-pulse" />
      </div>
    ))}
  </div>
);

/**
 * 评论列表
 * 负责加载态、错误态、空态和正常列表四种呈现，数据由父级 useComments 提供
 * @param {Object} props - 组件属性
 * @param {Array} props.comments - 评论数组（hook 已按时间升序排好，旧的在前）
 * @param {boolean} props.isLoading - 是否加载中
 * @param {string|null} props.error - 错误文案（hook 返回的中文文案）
 * @param {Object} [props.currentUser] - 当前登录用户，用于判断删除权限
 * @param {Function} props.onDelete - 删除回调，接收 commentId
 * @param {Function} [props.onRetry] - 错误态重试回调
 */
const CommentList = ({ comments = [], isLoading, error, currentUser, onDelete, onRetry }) => {
  if (isLoading) {
    return <ListSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-start gap-2 py-6">
        <p className="font-regular text-[13px] leading-[20px] text-tertiary">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={[
              'rounded-[6px] px-2 py-1',
              'font-regular text-[12px] leading-[18px] text-secondary',
              'bg-press transition-colors hover:bg-divider active:bg-stroke',
            ].join(' ')}
          >
            重试
          </button>
        )}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="py-8">
        <p className="font-light text-[13px] leading-[20px] text-quaternary">
          还没有评论，来说点什么吧
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUser={currentUser}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};

export default CommentList;
