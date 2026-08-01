"use client";

// 项目详情底部页数轴：用竖条展示当前 frame 位置，桌面端支持点击跳页。
/**
 * L3 底部进度条（对应设计稿 catalog）
 * 每个 frame 一根竖条，当前项 32h，其余 16h；默认 2px 宽
 *
 * 桌面端可点击跳转；移动端 interactive=false —— 热区对手指过小，
 * 仅禁点（pointer-events-none），样式与桌面共用。
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

  // 间距 hover 按整体；竖条加粗/加长按单条
  return (
    <div
      className={`group/track flex items-center gap-0 select-none ${interactive ? '' : 'pointer-events-none'}`}
      aria-hidden={interactive ? undefined : true}
    >
      {bars.map(({ index, isActive }) => (
        <button
          key={index}
          type="button"
          aria-label={`第 ${index + 1} 页`}
          tabIndex={interactive ? undefined : -1}
          onClick={() => interactive && onSelect?.(index)}
          className="group/bar px-1 py-1 transition-[padding] duration-300 group-hover/track:px-1.5"
        >
          <span
            className={`block w-0.5 rounded-full transition-all duration-300 group-hover/bar:w-[3px] ${
              isActive
                ? 'h-8 bg-main group-hover/bar:h-9'
                : 'h-4 bg-stroke group-hover/bar:h-5 group-hover/bar:bg-tertiary'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default SlideProgress;
