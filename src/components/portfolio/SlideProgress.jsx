"use client";

/**
 * L3 底部进度条（对应设计稿 catalog）
 * 每个 frame 一根竖条，当前项 32h，其余 16h，点击可跳转
 *
 * @param {number} total - frame 总数
 * @param {number} activeIndex - 当前 frame 下标
 * @param {Function} onSelect - 点击某一项回调
 */
const SlideProgress = ({ total = 0, activeIndex = 0, onSelect }) => {
  if (total <= 1) return null;

  return (
    <div className="flex items-center gap-0 select-none">
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            key={index}
            type="button"
            aria-label={`第 ${index + 1} 页`}
            onClick={() => onSelect?.(index)}
            className="px-1.5 py-1 group"
          >
            <span
              className={`block w-px rounded-full transition-all duration-300 ${
                isActive
                  ? 'h-8 bg-main'
                  : 'h-4 bg-stroke group-hover:bg-tertiary'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default SlideProgress;
