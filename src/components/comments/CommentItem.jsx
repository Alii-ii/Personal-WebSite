"use client";

import { useState } from 'react';

/**
 * 把时间戳格式化为相对时间文案
 * 不引第三方日期库，站内只需要「刚刚 / N 分钟前 / N 小时前 / N 天前 / 具体日期」这几档
 * @param {string} isoString - ISO 时间字符串（Supabase created_at）
 * @returns {string} 相对时间文案
 */
const formatRelativeTime = (isoString) => {
  if (!isoString) return '';

  const target = new Date(isoString);
  const timestamp = target.getTime();
  if (Number.isNaN(timestamp)) return '';

  // 允许轻微的客户端/服务端时钟偏差，负数一律按「刚刚」处理
  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (diffSeconds < 60) return '刚刚';

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} 分钟前`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} 小时前`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} 天前`;

  // 超过 30 天直接显示日期，同年省略年份，窄栏更省空间
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  if (target.getFullYear() === new Date().getFullYear()) {
    return `${month}-${day}`;
  }
  return `${target.getFullYear()}-${month}-${day}`;
};

/**
 * 单条评论
 * 无头像设计：只呈现昵称、相对时间和正文，适配 380px 窄栏抽屉
 * @param {Object} props - 组件属性
 * @param {Object} props.comment - 评论数据 { id, user_id, content, created_at, site_profiles }
 * @param {Object} [props.currentUser] - 当前登录用户，用于判断删除权限
 * @param {Function} props.onDelete - 删除回调，接收 commentId，返回 { error?: string }
 */
const CommentItem = ({ comment, currentUser, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // 昵称在 JOIN 出来的关联表里，可能为空
  const nickname = comment?.site_profiles?.nickname || '匿名访客';
  const isOwner = Boolean(currentUser?.id) && comment?.user_id === currentUser.id;

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    setDeleteError(null);

    const result = await onDelete?.(comment.id);

    // 删除成功时该条会被父级移除，无需再回写 state
    if (result?.error) {
      setDeleteError(result.error);
      setIsDeleting(false);
    }
  };

  return (
    <li className="group flex flex-col gap-1 py-3 border-b border-divider last:border-b-0">
      {/* 头部：昵称 + 时间 + 删除 */}
      <div className="flex items-center gap-2">
        <span className="font-system text-[13px] leading-[20px] text-secondary truncate min-w-0">
          {nickname}
        </span>
        <span className="font-light text-[11px] leading-[16px] text-quaternary flex-shrink-0">
          {formatRelativeTime(comment?.created_at)}
        </span>

        {isOwner && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            title="删除这条评论"
            className={[
              'ml-auto flex-shrink-0 rounded-[6px] px-1.5 py-0.5',
              'font-regular text-[11px] leading-[16px] text-quaternary',
              'transition-colors hover:bg-hover hover:text-secondary active:bg-press',
              'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
              'disabled:pointer-events-none disabled:opacity-50',
            ].join(' ')}
          >
            {isDeleting ? '删除中' : '删除'}
          </button>
        )}
      </div>

      {/* 正文：保留用户换行，长串字符强制断行避免撑破窄栏 */}
      <p className="font-system text-[13px] leading-[20px] text-main whitespace-pre-wrap break-words">
        {comment?.content}
      </p>

      {deleteError && (
        <p className="font-light text-[11px] leading-[16px] text-quaternary">
          {deleteError}
        </p>
      )}
    </li>
  );
};

export default CommentItem;
