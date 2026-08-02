"use client";

// 聊天顶部内容区：在历史列表、消息列表和单行状态标题之间切换。
import ShinyText from '@/components/ShinyText';
import { EASE_OUT_CSS } from '@/lib/ease';

export const getRelativeTime = (dateString, t) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return t('timeJustNow');
  if (diffMin < 60) return t('timeMinutesAgo').replace('{n}', diffMin);
  if (diffHour < 24) return t('timeHoursAgo').replace('{n}', diffHour);
  if (diffDay < 7) return t('timeDaysAgo').replace('{n}', diffDay);
  if (diffDay < 30) return t('timeWeeksAgo').replace('{n}', diffWeek);
  if (diffDay < 365) return t('timeMonthsAgo').replace('{n}', diffMonth);
  return t('timeYearsAgo').replace('{n}', diffYear);
};

const HistoryPanel = ({ conversations, selectedIndex, itemRefs, listRef, onSelect, onHover, t }) => (
  <div
    ref={listRef}
    className="no-scrollbar relative z-10 flex h-fit max-h-[50vh] w-full min-w-0 flex-col overflow-y-auto overflow-x-hidden p-2 text-[14px] leading-6 text-main opacity-100 delay-75 transition-opacity duration-200"
    style={{ transitionTimingFunction: EASE_OUT_CSS }}
  >
    {conversations.map((conversation, index) => (
      <button
        key={conversation.id}
        ref={(element) => { itemRefs.current[index] = element; }}
        className={`flex w-full items-center justify-between gap-2 rounded-[8px] px-2.5 py-1 text-left transition-colors duration-150 ${
          index === selectedIndex ? 'bg-hover' : 'hover:bg-hover/50'
        }`}
        onClick={() => onSelect(conversation.id)}
        onMouseEnter={() => onHover(index)}
      >
        <span className="min-w-0 flex-1 truncate">{conversation.title}</span>
        <span className="shrink-0 text-[13px] text-tertiary">
          {getRelativeTime(conversation.updated_at, t)}
        </span>
      </button>
    ))}
  </div>
);

const MessagePanel = ({ messages, isPending, streamingContent, listRef, t }) => (
  <div
    ref={listRef}
    className="no-scrollbar relative z-10 flex h-fit max-h-[50vh] w-full min-w-0 flex-col items-start gap-2 overflow-y-auto overflow-x-hidden p-2 text-[14px] leading-6 text-main opacity-100 delay-75 transition-opacity duration-200"
    style={{ transitionTimingFunction: EASE_OUT_CSS }}
    aria-live="polite"
    aria-label={t('chatRegionLabel')}
  >
    {messages.map((message) => (
      <div
        key={message.id}
        className={`flex w-full shrink-0 ${
          message.role === 'user'
            ? 'flex-col items-end justify-center gap-1 pl-12'
            : 'flex-row items-start gap-1 pl-2 pr-12'
        }`}
      >
        {message.role === 'user' ? (
          <p className="max-w-full whitespace-pre-wrap break-words rounded-[8px] bg-divider px-2 py-1">
            {message.content}
          </p>
        ) : message.id === 'streaming-assistant' ? (
          <ShinyText
            text={message.content}
            speed={1}
            color="hsl(var(--neutral-fg-quaternary))"
            shineColor="hsl(var(--neutral-fg-main))"
            spread={120}
            className="block min-w-0 max-w-full flex-1 whitespace-pre-wrap break-words"
          />
        ) : (
          <p className="min-w-0 flex-1 whitespace-pre-wrap break-words">
            {message.contentKey ? t(message.contentKey) : message.content}
          </p>
        )}
      </div>
    ))}

    {isPending && !streamingContent ? (
      <p className="w-full min-w-0 overflow-hidden pl-2 pr-12">
        <ShinyText
          text={t('chatThinking')}
          speed={1}
          color="hsl(var(--neutral-fg-quaternary))"
          shineColor="hsl(var(--neutral-fg-main))"
          spread={120}
        />
      </p>
    ) : null}
  </div>
);

const StatusHeader = ({ text }) => (
  <header
    className="relative z-10 flex h-[30px] w-full shrink-0 translate-y-0 items-center gap-1 overflow-hidden px-2 pb-0.5 pt-1 text-[14px] leading-6 text-secondary opacity-100 delay-75 transition-[opacity,transform] duration-200"
    style={{ transitionTimingFunction: EASE_OUT_CSS }}
  >
    <p className="min-w-0 flex-1 truncate px-2" aria-live="polite">{text}</p>
  </header>
);

export default function ChatPanels({
  isHistoryMode,
  showMessagePanel,
  historyConversations,
  selectedHistoryIndex,
  historyItemRefs,
  historyListRef,
  messageListRef,
  visibleMessages,
  isMessagePending,
  streamingContent,
  latestTitleText,
  onSelectHistory,
  onHoverHistory,
  t,
}) {
  return (
    <div
      className="min-h-0 overflow-hidden"
      style={{
        textShadow: '0 0.5px 0 rgb(0 0 0 / 0.4), 0 -0.5px 0 rgb(255 255 255 / 0.35)',
      }}
    >
      {isHistoryMode ? (
        <HistoryPanel
          conversations={historyConversations}
          selectedIndex={selectedHistoryIndex}
          itemRefs={historyItemRefs}
          listRef={historyListRef}
          onSelect={onSelectHistory}
          onHover={onHoverHistory}
          t={t}
        />
      ) : showMessagePanel ? (
        <MessagePanel
          messages={visibleMessages}
          isPending={isMessagePending}
          streamingContent={streamingContent}
          listRef={messageListRef}
          t={t}
        />
      ) : (
        <StatusHeader text={latestTitleText} />
      )}
    </div>
  );
}
