import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * 入场动画容器。
 *
 * 可见性原则：元素默认可见，动画只做「增强」，绝不作为可见性的唯一来源。
 *
 * 旧实现用 gsap.set(el, {opacity: 0}) 先强制隐藏、再靠 gsap.to 恢复。
 * 这条链只要断了元素就永久停在 opacity:0，且没有任何自愈路径：
 *   - 页面在后台标签页加载时，浏览器暂停 rAF，GSAP ticker 不推进，
 *     补间根本不执行，但 set 的隐藏已经生效
 *   - 脚本异常 / chunk 加载失败同理
 * 表现为整页内容淡到看不见、位置偏移，必须手动刷新才能恢复。
 *
 * 现在改为 gsap.from + immediateRender:false：
 * 元素的初始态由 DOM/CSS 决定（可见），只有当补间真正开始播放时
 * 才会被拉到起点再动回来。动画没跑 = 保持可见，而不是保持隐藏。
 * 另外补一层 visibilitychange 兜底，页面回到前台时把未完成的动画落到终态。
 */
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
  // 是否立即播放动画（用于单屏页面），false 则等滚动到视口再播
  immediate = false,
  className = '',
  wrapperClassName = '',
  // 控制是否使用flex布局
  flex = false,
  ...props
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const axis = direction === 'horizontal' ? 'x' : 'y';
    const offset = reverse ? -distance : distance;
    const startPct = threshold >= 1 ? 100 : (1 - threshold) * 100;

    // 终态：元素本来就该长这样。动画失败时保持这个状态即可。
    const settle = () => {
      gsap.set(el, { [axis]: 0, scale: 1, opacity: 1, visibility: 'visible' });
    };

    // 起点（gsap.from 的 from 值），不会在创建时立刻应用
    const fromVars = {
      [axis]: offset,
      scale,
      opacity: animateOpacity ? initialOpacity : 1,
    };

    const toVars = {
      duration,
      ease,
      delay,
      onComplete,
      // 动画结束后清掉内联 transform，避免残留的 matrix() 一直创建层叠上下文，
      // 把子元素的 z-index 关在里面（footer 遮罩层级错乱的原因之一）
      clearProps: 'transform',
      // 关键：不要在创建补间的瞬间就把元素设成起点状态。
      // 补间真正开始播放时才应用 from 值，此前元素保持 CSS 里的可见态。
      immediateRender: false,
    };

    let tween;
    let scrollTrigger;

    if (immediate) {
      tween = gsap.from(el, { ...fromVars, ...toVars });
    } else {
      tween = gsap.from(el, {
        ...fromVars,
        ...toVars,
        scrollTrigger: {
          trigger: el,
          start: `top ${startPct}%`,
          toggleActions: 'play none none none',
          once: true,
          refreshPriority: -1,
        },
      });
      scrollTrigger = tween.scrollTrigger;
    }

    // 兜底一：超时强制落终态。
    // 这是最关键的一层 —— 页面在后台标签页加载时 visibility 自始至终是 hidden，
    // 「变化」事件根本不会触发；而 rAF 被节流到约 1fps 会让补间以极慢速度爬行
    // （实测 opacity 从 0.03 爬到 1 花了十几秒，期间内容几乎不可见）。
    // 因此不能只依赖事件，必须用与 rAF 无关的 setTimeout 兜底。
    const budgetMs = (delay + duration) * 1000 + 1200;
    const timeoutId = setTimeout(() => {
      if (tween && tween.progress() >= 1) return;
      // ScrollTrigger 模式下只救「已经进入视口」的元素：
      // 它本该可见却卡在 from 状态。视口外的元素保持原样，
      // 等滚动到时正常播放入场动画。
      if (!immediate) {
        const r = el.getBoundingClientRect();
        const inView = r.top < window.innerHeight && r.bottom > 0;
        if (!inView) return;
      }
      settle();
    }, budgetMs);

    // 兜底二：回到前台 / bfcache 恢复时，若元素本该可见却仍是透明的，直接落终态。
    // 同样只处理已进入视口的元素。
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (tween && tween.progress() >= 1) return;
      if (!immediate) {
        const r = el.getBoundingClientRect();
        if (!(r.top < window.innerHeight && r.bottom > 0)) return;
      }
      if (parseFloat(getComputedStyle(el).opacity) < 1) settle();
    };

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pageshow', onVisible);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('pageshow', onVisible);
      if (scrollTrigger) scrollTrigger.kill();
      if (tween) tween.kill();
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
        // 默认可见：JS 不可用 / 动画没跑 时，这就是最终呈现的状态
        opacity: 1,
        transform: 'none',
        visibility: 'visible',
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
