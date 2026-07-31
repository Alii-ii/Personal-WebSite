"use client";

import { useState, useEffect, useRef } from 'react';

const MAX_LENGTH = 20;

/**
 * 昵称设置弹窗
 * 首次评论前用它匿名登录：填个昵称即可，重名等错误由 signIn() 返回后原样展示
 * @param {Object} props - 组件属性
 * @param {boolean} props.open - 是否展开
 * @param {Function} props.onClose - 关闭回调
 * @param {Function} props.onSubmit - 提交回调，接收 nickname，返回 { error?: string }
 */
const NicknameDialog = ({ open, onClose, onSubmit }) => {
  const [nickname, setNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // 每次打开重置内容并聚焦
  useEffect(() => {
    if (open) {
      setNickname('');
      setError(null);
      setIsSubmitting(false);
      // 等弹窗挂载完成再聚焦
      const timer = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!open) return null;

  const trimmed = nickname.trim();
  const isValid = trimmed.length >= 1 && trimmed.length <= MAX_LENGTH;

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const result = await onSubmit?.(trimmed);

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onClose?.();
  };

  // 同样要拦住全局快捷键，Enter 提交、Esc 关闭
  const handleKeyDown = (e) => {
    e.stopPropagation();

    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-6">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-main/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* 弹窗主体 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="设置昵称"
        className="relative w-full max-w-[320px] rounded-[12px] bg-card border border-stroke p-5 flex flex-col gap-4 shadow-lg"
      >
        <div className="flex flex-col gap-1">
          <h2 className="font-Ding text-[18px] leading-[26px] text-main">先取个昵称</h2>
          <p className="font-light text-[12px] leading-[18px] text-quaternary">
            用于显示在你的评论旁，1-20 个字符
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <input
            ref={inputRef}
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="你的昵称"
            maxLength={MAX_LENGTH}
            disabled={isSubmitting}
            className={[
              'w-full rounded-[8px] px-3 py-2',
              'bg-press border border-stroke',
              'font-system text-[13px] leading-[20px] text-main',
              'placeholder:text-quaternary',
              'transition-colors focus:outline-none focus:border-divider',
              'disabled:opacity-60',
            ].join(' ')}
          />

          <div className="flex items-center gap-2 min-h-[16px]">
            {error ? (
              <span className="font-light text-[11px] leading-[16px] text-tertiary">
                {error}
              </span>
            ) : null}
            <span className="ml-auto flex-shrink-0 font-light text-[11px] leading-[16px] text-quaternary">
              {trimmed.length}/{MAX_LENGTH}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className={[
              'rounded-[8px] px-3 py-1.5',
              'font-regular text-[12px] leading-[18px] text-secondary',
              'transition-colors hover:bg-hover active:bg-press',
              'disabled:pointer-events-none disabled:opacity-50',
            ].join(' ')}
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className={[
              'rounded-[8px] px-3 py-1.5',
              'font-regular text-[12px] leading-[18px]',
              'bg-main text-card transition-colors',
              'hover:bg-secondary active:bg-tertiary',
              'disabled:pointer-events-none disabled:opacity-40',
            ].join(' ')}
          >
            {isSubmitting ? '提交中' : '确定'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NicknameDialog;
