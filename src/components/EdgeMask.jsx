/**
 * EdgeMask — 通用边缘渐变遮罩
 *
 * 从指定方向（top / bottom）向对侧渐隐，用于 header、footer 等浮层下方，
 * 让内容滚动到浮层后面时保持可读性。
 *
 * 视觉规范来自 footer mask：
 *   · 多色阶 linear-gradient（bg-card → 80% → 50% → transparent）
 *   · backdrop-filter: blur 提供毛玻璃质感
 *   · mask-image 控制模糊区域的衰减曲线
 *
 * @param {'top' | 'bottom'} from   - 遮罩从哪条边开始（不透明端），默认 'bottom'
 * @param {string}           height - CSS 高度，如 '480px'、'160%'，默认 '160%'
 * @param {string}           className - 额外类名，如 'md:hidden' 限制断点
 */
const EdgeMask = ({ from = 'bottom', height = '160%', className = '' }) => {
  const isTop = from === 'top';

  return (
    <div
      aria-hidden="true"
      className={[
        'absolute inset-x-0 -z-10 pointer-events-none select-none',
        isTop ? 'top-0' : 'bottom-0',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        height,
        background: isTop
          ? 'linear-gradient(to bottom, hsl(var(--neutral-bg-card)), hsl(var(--neutral-bg-card) / 0.8), hsl(var(--neutral-bg-card) / 0.5), transparent)'
          : 'linear-gradient(to top, hsl(var(--neutral-bg-card)), hsl(var(--neutral-bg-card) / 0.8), hsl(var(--neutral-bg-card) / 0.5), transparent)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(48px)',
        maskImage: isTop
          ? 'linear-gradient(to bottom, black 0%, black 50%, transparent 100%)'
          : 'linear-gradient(to top, black 0%, black 50%, transparent 100%)',
      }}
    />
  );
};

export default EdgeMask;
