"use client";

import { useState } from 'react';

const MAX_LENGTH = 500;

/**
 * 评论输入框
 * @param {Object} props - 组件属性
 * @param {Function} props.onSubmit - 提交回调，接收 content，返回 { error?: string }
 * @param {string} [props.placeholder] - 占位文案
 */
const CommentForm = ({ onSubmit, placeholder = '写下你的想法…' }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const trimmed = content.trim();
  const isOverLimit = content.length > MAX_LENGTH;
  const canSubmit = trimmed.length > 0 && !isOverLimit && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    const result = await onSubmit?.(trimmed);

    if (result?.error) {
      setError(result.error);
    } else {
      setContent('');
    }
    setIsSubmitting(false);
  };

  // 详情页有全局方向键 / C 键快捷键，输入时必须拦住冒泡，否则打字会触发翻页
  const handleKeyDown = (e) => {
    e.stopPropagation();

    // Cmd/Ctrl + Enter 快捷提交
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={3}
        disabled={isSubmitting}
        className={[
          'w-full resize-none rounded-[8px] px-3 py-2',
          'bg-press border border-stroke',
          'font-system text-[13px] leading-[20px] text-main',
          'placeholder:text-quaternary',
          'transition-colors focus:outline-none focus:border-divider',
          'disabled:opacity-60',
        ].join(' ')}
      />

      <div className="flex items-center gap-2">
        {/* 错误优先，其次显示字数 */}
        {error ? (
          <span className="font-light text-[11px] leading-[16px] text-tertiary truncate min-w-0">
            {error}
          </span>
        ) : (
          <span
            className={[
              'font-light text-[11px] leading-[16px] flex-shrink-0',
              isOverLimit ? 'text-tertiary' : 'text-quaternary',
            ].join(' ')}
          >
            {content.length}/{MAX_LENGTH}
          </span>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className={[
            'ml-auto flex-shrink-0 rounded-[8px] px-3 py-1.5',
            'font-regular text-[12px] leading-[18px]',
            'bg-main text-card transition-colors',
            'hover:bg-secondary active:bg-tertiary',
            'disabled:pointer-events-none disabled:opacity-40',
          ].join(' ')}
        >
          {isSubmitting ? '发送中' : '发送'}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
