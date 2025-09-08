import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const AnimatedContent = ({
  children,
  distance = 100,
  direction = 'vertical',
  reverse = false,
  duration = 0.8,
  ease = 'power3.out',
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  threshold = 0.1,
  delay = 0,
  onComplete,
  // 新增：是否立即播放动画（用于单屏页面）
  immediate = false,
  // 新增：支持className和wrapperClassName
  className = '',
  wrapperClassName = '',
  // 新增：控制是否使用flex布局
  flex = false,
  ...props
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const axis = direction === 'horizontal' ? 'x' : 'y';
    const offset = reverse ? -distance : distance;
    
    // 修复 threshold 计算，确保在单屏页面中能正确触发
    const startPct = threshold >= 1 ? 100 : (1 - threshold) * 100;

    // 设置初始状态
    gsap.set(el, {
      [axis]: offset,
      scale,
      opacity: animateOpacity ? initialOpacity : 1,
      visibility: 'visible' // 确保元素可见
    });

    // 创建动画
    const animationConfig = {
      [axis]: 0,
      scale: 1,
      opacity: 1,
      visibility: 'visible', // 确保动画过程中元素可见
      duration,
      ease,
      delay,
      onComplete
    };

    // 如果是立即播放模式，直接播放动画
    if (immediate) {
      gsap.to(el, animationConfig);
    } else {
      // 使用 ScrollTrigger
      gsap.to(el, {
        ...animationConfig,
        scrollTrigger: {
          trigger: el,
          start: `top ${startPct}%`,
          toggleActions: 'play none none none',
          once: true,
          // 添加刷新和更新机制
          refreshPriority: -1,
          onRefresh: () => {
            // 确保在刷新时重新设置初始状态
            gsap.set(el, {
              [axis]: offset,
              scale,
              opacity: animateOpacity ? initialOpacity : 1,
              visibility: 'visible'
            });
          }
        }
      });
    }

    return () => {
      // 只清理当前元素的 ScrollTrigger
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === el) {
          trigger.kill();
        }
      });
      gsap.killTweensOf(el);
    };
  }, [
    distance,
    direction,
    reverse,
    duration,
    ease,
    initialOpacity,
    animateOpacity,
    scale,
    threshold,
    delay,
    onComplete,
    immediate
  ]);

  return (
    <div 
      ref={ref}
      className={`${className} ${wrapperClassName}`}
      style={{
        // 初始状态：确保内容在动画开始前完全隐藏
        opacity: animateOpacity ? initialOpacity : 1,
        transform: `translate${direction === 'horizontal' ? 'X' : 'Y'}(${reverse ? -distance : distance}px) scale(${scale})`,
        // 防止内容在动画设置前显示
        visibility: 'hidden',
        // 根据flex属性决定是否使用flex布局
        display: flex ? 'flex' : 'block',
        ...(flex && { flex: 1, width: '100%' })
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default AnimatedContent;
