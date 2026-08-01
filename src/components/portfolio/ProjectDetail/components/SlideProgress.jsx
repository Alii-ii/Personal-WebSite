"use client";

// 项目详情底部页数轴：用竖条展示当前 frame 位置，桌面端支持点击跳页。
/**
 * L3 底部进度条（对应设计稿 catalog）
 * 每个 frame 一根竖条，当前项 32h，其余 16h
 *
 * 桌面端可点击跳转；移动端为纯展示 —— 每根条只有 1px 宽，
 * 点击热区对手指过小，误触率高于命中率，故不提供交互。
 *
 * @param {number} total - frame 总数
 * @param {number} activeIndex - 当前 frame 下标
 * @param {Function} onSelect - 点击某一项回调（仅 interactive 时生效）
 * @param {boolean} interactive - 是否可点击，默认 true
 */
const SlideProgress = ({ total = 0, activeIndex = 0, onSelect, interactive = true }) => {
  if (total <= 1) return null;

  const bars = Array.from({ length: total }).map((_, index) => {
    const isActive = index === activeIndex;
    return { index, isActive };
  });

  // 纯展示：不渲染 button，避免无效热区抢占触摸事件
  if (!interactive) {
    return (
      <div className="flex items-center gap-0 select-none pointer-events-none" aria-hidden="true">
        {bars.map(({ index, isActive }) => (
          <span key={index} className="px-1.5 py-1 flex items-center">
            <span
              className={`block w-px rounded-full transition-all duration-300 ${
                isActive ? 'h-8 bg-main' : 'h-4 bg-stroke'
              }`}
            />
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0 select-none">
      {bars.map(({ index, isActive }) => (
        <button
          key={index}
          type="button"
          aria-label={`第 ${index + 1} 页`}
          onClick={() => onSelect?.(index)}
          className="px-1.5 py-1 group"
        >
          <span
            className={`block w-px rounded-full transition-all duration-300 ${
              isActive ? 'h-8 bg-main' : 'h-4 bg-stroke group-hover:bg-tertiary'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default SlideProgress;
