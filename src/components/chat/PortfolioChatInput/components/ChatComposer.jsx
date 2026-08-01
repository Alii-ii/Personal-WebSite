"use client";

// 聊天输入区：负责展开开关、textarea、固定/新建/历史工具栏和发送按钮。
import IconTextButton from '@/components/icon-text-botton';
import {
  BackIcon,
  CollapseIcon,
  ExpandIcon,
  HistoryIcon,
  LoginIcon,
  PinIcon,
  SendIcon,
} from '@/public/icons';
import { EASE_OUT_CSS } from '@/lib/ease';

export default function ChatComposer({
  textareaRef,
  value,
  isOpen,
  isExpanded,
  isPinned,
  isHistoryMode,
  isLoggedIn,
  isNicknameMode,
  isRateLimited,
  isSubmittingNickname,
  isMessagePending,
  nicknameError,
  canSend,
  historyCount,
  placeholder,
  onValueChange,
  onFocus,
  onBlur,
  onCompositionStart,
  onCompositionEnd,
  onKeyDown,
  onToggleExpanded,
  onTogglePinned,
  onCreateConversation,
  onEnterHistory,
  onExitHistory,
  onSubmit,
  t,
}) {
  return (
    <div
      className={`relative flex w-full shrink-0 flex-col rounded-[15px] border-t border-divider border-t-[0.5px] bg-[hsl(var(--neutral-bg-card)/0.8)] px-3 py-3 transition-[height,border-radius] duration-[360ms] ${
        isExpanded ? 'h-[390px]' : isOpen ? 'h-[99px]' : 'h-[48px]'
      }`}
      style={{ transitionTimingFunction: EASE_OUT_CSS }}
    >
      {/* 展开/收起：角标软提示 + hover 显图标（其余走 ghost/sm） */}
      <IconTextButton
        icon={isExpanded ? <CollapseIcon /> : <ExpandIcon />}
        variant="ghost"
        size="sm"
        tooltip={isExpanded ? t('chatCollapse') : t('chatExpand')}
        onClick={onToggleExpanded}
        className={[
          'absolute right-3 top-3 z-10 text-tertiary hover:text-main',
          // 角标软提示（组件无此能力）
          'before:absolute before:right-0 before:top-0 before:h-3 before:w-3 before:rounded-tr-[8px]',
          'before:border-r-[1.5px] before:border-t-[1.5px] before:border-stroke',
          'before:transition-opacity before:duration-150 hover:before:opacity-0',
          // 覆盖组件默认 opacity-80：收起时藏图标，hover 再显
          '[&>span]:opacity-0 [&>span]:transition-opacity [&>span]:duration-150 hover:[&>span]:opacity-100',
          // 外壳显隐（组件只有 transition-colors）
          'transition-[opacity,transform] duration-150',
          isOpen
            ? 'scale-100 opacity-100 delay-100'
            : 'pointer-events-none scale-90 opacity-0 delay-0',
        ].join(' ')}
        aria-label={isExpanded ? t('chatCollapse') : t('chatExpand')}
      />

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onValueChange(event.target.value, nicknameError)}
        onFocus={onFocus}
        onBlur={onBlur}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
        onKeyDown={onKeyDown}
        placeholder={isHistoryMode ? t('chatHistoryPlaceholder') : placeholder}
        disabled={isRateLimited || isSubmittingNickname || isHistoryMode}
        maxLength={isNicknameMode ? 20 : undefined}
        rows={1}
        className="w-full flex-1 resize-none bg-transparent pb-6 pl-1 pr-7 text-[16px] leading-6 text-main outline-none placeholder:text-quaternary disabled:cursor-not-allowed"
        aria-label={t('chatInputLabel')}
      />

      <div
        className={`absolute bottom-3 left-3 flex h-6 items-center gap-1 text-disabled transition-[opacity,transform] duration-200 ease-out ${
          isOpen
            ? 'translate-y-0 opacity-100 delay-100'
            : 'pointer-events-none translate-y-1 opacity-0 delay-0'
        }`}
      >
        {isHistoryMode ? (
          <IconTextButton
            icon={<BackIcon />}
            variant="ghost"
            size="sm"
            tooltip={t('chatBack')}
            onClick={onExitHistory}
            className="text-disabled [&>span]:opacity-100 hover:text-tertiary"
            aria-label={t('chatBack')}
          />
        ) : (
          <>
            <IconTextButton
              icon={<PinIcon />}
              variant="ghost"
              size="sm"
              tooltip={isPinned ? t('chatUnpin') : t('chatPin')}
              onClick={onTogglePinned}
              className={`text-disabled [&>span]:opacity-100 hover:text-tertiary ${
                isPinned ? 'bg-hover text-main hover:bg-hover hover:text-main' : ''
              }`}
              aria-pressed={isPinned}
              aria-label={isPinned ? t('chatUnpin') : t('chatPin')}
            />

            {isLoggedIn ? (
              <>
                <IconTextButton
                  icon={<LoginIcon />}
                  variant="ghost"
                  size="sm"
                  tooltip={t('chatNewConversation')}
                  onClick={onCreateConversation}
                  disabled={isMessagePending}
                  className="text-disabled [&>span]:opacity-100 hover:text-tertiary disabled:opacity-35"
                  aria-label={t('chatNewConversation')}
                />
                {historyCount > 0 ? (
                  <IconTextButton
                    icon={<HistoryIcon />}
                    variant="ghost"
                    size="sm"
                    tooltip={t('chatHistory')}
                    onClick={onEnterHistory}
                    disabled={isMessagePending}
                    className="text-disabled [&>span]:opacity-100 hover:text-tertiary disabled:opacity-35"
                    aria-label={t('chatHistory')}
                  />
                ) : null}
              </>
            ) : null}
          </>
        )}
      </div>

      {!isHistoryMode ? (
        <IconTextButton
          icon={<SendIcon size={16} />}
          variant={canSend ? 'CTA' : 'default'}
          size="sm"
          onClick={onSubmit}
          disabled={!canSend}
          className={`absolute bottom-3 right-3 [&>span]:opacity-100 disabled:opacity-35 ${
            canSend ? '' : 'bg-hover text-tertiary hover:bg-hover hover:text-tertiary'
          }`}
          aria-label={t('chatSend')}
        />
      ) : null}
    </div>
  );
}
