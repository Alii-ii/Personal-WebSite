'use client';
import { useRef, useEffect, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

gsap.registerPlugin(InertiaPlugin);

const throttle = (func, limit) => {
  let lastCall = 0;
  return function (...args) {
    const now = performance.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      func.apply(this, args);
    }
  };
};

function hexToRgb(hex) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i);
  if (!m) return { r: 0, g: 0, b: 0, a: 1 };
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
    a: m[4] ? parseInt(m[4], 16) / 255 : 1
  };
}

// 支持 CSS 变量的颜色解析
function parseColor(color) {
  if (typeof window === 'undefined') return { r: 0, g: 0, b: 0, a: 1 };
  
  // 如果是 CSS 变量，创建临时元素来获取计算后的值
  if (color.includes('var(') || color.includes('hsl(')) {
    const tempEl = document.createElement('div');
    tempEl.style.color = color;
    document.body.appendChild(tempEl);
    const computedColor = window.getComputedStyle(tempEl).color;
    document.body.removeChild(tempEl);
    
    // 解析 rgb/rgba(r, g, b, a) 格式
    const rgbMatch = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1]),
        g: parseInt(rgbMatch[2]),
        b: parseInt(rgbMatch[3]),
        a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1
      };
    }
  }
  
  // 回退到十六进制解析
  return hexToRgb(color);
}

const DotGrid = ({
  dotSize = 16,
  gap = 32,
  baseColor = '#5227FF',
  activeColor = '#5227FF',
  highlightBoost = 0.15,
  proximity = 150,
  speedTrigger = 100,
  shockRadius = 250,
  shockStrength = 5,
  maxSpeed = 5000,
  resistance = 750,
  returnDuration = 1.5,
  className = '',
  style
}) => {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const dotsRef = useRef([]);
  const pointerRef = useRef({
    x: -9999,
    y: -9999,
    vx: 0,
    vy: 0,
    speed: 0,
    lastTime: 0,
    lastX: 0,
    lastY: 0
  });
  // 脏标记：仅在指针移动 / 有位移动画 / 网格重建时才重绘，静止时跳过整帧绘制
  const needsRedrawRef = useRef(true);
  // 进行中的 inertia / 回弹动画数量，>0 时必须持续重绘
  const activeCountRef = useRef(0);
  // 当前生效的 dpr，draw 里换算 CSS 尺寸用
  const dprRef = useRef(1);

  const baseRgb = useMemo(() => parseColor(baseColor), [baseColor]);
  const activeRgb = useMemo(() => parseColor(activeColor), [activeColor]);

  const circlePath = useMemo(() => {
    if (typeof window === 'undefined' || !window.Path2D) return null;

    const p = new Path2D();
    p.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
    return p;
  }, [dotSize]);

  const buildGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 网格只覆盖一屏视口，不跟随文档高度增长。
    // 页面很长时（如作品墙），若按容器尺寸构建会产生数万个点、上亿像素的 canvas，
    // 每帧全量重绘导致掉帧；锁定视口后点数恒定在一屏范围内。
    const width = window.innerWidth;
    const height = window.innerHeight;
    // dpr 上限 2：3x 屏下像素量再翻 2.25 倍，视觉收益极小但开销显著
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dprRef.current = dpr;

    const nextW = Math.round(width * dpr);
    const nextH = Math.round(height * dpr);
    // 尺寸未变时不要重设 canvas.width，否则会清空画布并重置变换矩阵
    if (canvas.width !== nextW || canvas.height !== nextH) {
      canvas.width = nextW;
      canvas.height = nextH;
    }
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    const cols = Math.floor((width + gap) / (dotSize + gap));
    const rows = Math.floor((height + gap) / (dotSize + gap));
    const cell = dotSize + gap;

    const gridW = cell * cols - gap;
    const gridH = cell * rows - gap;

    const extraX = width - gridW;
    const extraY = height - gridH;

    const startX = extraX / 2 + dotSize / 2;
    const startY = extraY / 2 + dotSize / 2;

    const dots = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cx = startX + x * cell;
        const cy = startY + y * cell;
        dots.push({ cx, cy, xOffset: 0, yOffset: 0, _inertiaApplied: false });
      }
    }
    dotsRef.current = dots;
    needsRedrawRef.current = true;
  }, [dotSize, gap]);

  useEffect(() => {
    if (!circlePath) return;

    let rafId;
    const proxSq = proximity * proximity;

    const baseStyle = `rgba(${baseRgb.r},${baseRgb.g},${baseRgb.b},${baseRgb.a})`;

    // 颜色/主题变化时必须重绘一次，否则脏检查会让画面停留在旧配色
    needsRedrawRef.current = true;

    const draw = () => {
      // 静止状态跳过整帧绘制：无指针移动、无进行中的动画时不做任何 canvas 操作
      if (!needsRedrawRef.current && activeCountRef.current === 0) {
        rafId = requestAnimationFrame(draw);
        return;
      }
      needsRedrawRef.current = false;

      const canvas = canvasRef.current;
      const ctx = canvas && canvas.getContext('2d');
      if (!ctx) {
        // 不能直接 return，否则整个 rAF 循环就此终止
        rafId = requestAnimationFrame(draw);
        return;
      }

      // ctx 已被 scale(dpr)，清屏须用 CSS 像素尺寸
      const cssW = canvas.width / dprRef.current;
      const cssH = canvas.height / dprRef.current;
      ctx.clearRect(0, 0, cssW, cssH);

      const { x: px, y: py } = pointerRef.current;

      let currentStyle = null;
      for (const dot of dotsRef.current) {
        const dx = dot.cx - px;
        const dy = dot.cy - py;
        const dsq = dx * dx + dy * dy;

        let style = baseStyle;
        if (dsq <= proxSq) {
          const dist = Math.sqrt(dsq);
          const t = 1 - dist / proximity;
          const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
          const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
          const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
          const a = baseRgb.a + (activeRgb.a - baseRgb.a) * t;
          const boostedAlpha = Math.min(1, a + highlightBoost);
          style = `rgba(${r},${g},${b},${boostedAlpha})`;
        }

        // 绝大多数点都是 baseStyle，避免逐点重复赋值 fillStyle
        if (style !== currentStyle) {
          ctx.fillStyle = style;
          currentStyle = style;
        }

        const ox = dot.cx + dot.xOffset;
        const oy = dot.cy + dot.yOffset;
        // 用成对 translate 抵消，替代 save/restore：后者每点都要压栈保存完整绘图状态
        ctx.translate(ox, oy);
        ctx.fill(circlePath);
        ctx.translate(-ox, -oy);
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafId);
  }, [proximity, baseColor, activeRgb, baseRgb, circlePath, highlightBoost]);

  useEffect(() => {
    buildGrid();
    // 网格只依赖视口尺寸，因此监听 window.resize 即可。
    // 不能观察 wrapper：它的高度会随页面内容（如瀑布流图片陆续加载）不断变化，
    // 会触发大量无谓的网格重建。
    window.addEventListener('resize', buildGrid);
    return () => window.removeEventListener('resize', buildGrid);
  }, [buildGrid]);

  useEffect(() => {
    const onMove = e => {
      const now = performance.now();
      const pr = pointerRef.current;
      const dt = pr.lastTime ? now - pr.lastTime : 16;
      const dx = e.clientX - pr.lastX;
      const dy = e.clientY - pr.lastY;
      let vx = (dx / dt) * 1000;
      let vy = (dy / dt) * 1000;
      let speed = Math.hypot(vx, vy);
      if (speed > maxSpeed) {
        const scale = maxSpeed / speed;
        vx *= scale;
        vy *= scale;
        speed = maxSpeed;
      }
      pr.lastTime = now;
      pr.lastX = e.clientX;
      pr.lastY = e.clientY;
      pr.vx = vx;
      pr.vy = vy;
      pr.speed = speed;

      // canvas 固定在视口，视口坐标即 canvas 局部坐标，无需 getBoundingClientRect
      pr.x = e.clientX;
      pr.y = e.clientY;
      needsRedrawRef.current = true;

      if (speed <= speedTrigger) return;

      const proxSq = proximity * proximity;
      for (const dot of dotsRef.current) {
        const ddx = dot.cx - pr.x;
        const ddy = dot.cy - pr.y;
        if (ddx * ddx + ddy * ddy < proxSq && !dot._inertiaApplied) {
          dot._inertiaApplied = true;
          activeCountRef.current++;
          gsap.killTweensOf(dot);
          const pushX = ddx + vx * 0.005;
          const pushY = ddy + vy * 0.005;
          gsap.to(dot, {
            inertia: { xOffset: pushX, yOffset: pushY, resistance },
            onComplete: () => {
              gsap.to(dot, {
                xOffset: 0,
                yOffset: 0,
                duration: returnDuration,
                ease: 'elastic.out(1,0.75)',
                onComplete: () => {
                  activeCountRef.current--;
                }
              });
              dot._inertiaApplied = false;
            }
          });
        }
      }
    };

    const onClick = e => {
      // canvas 固定在视口，直接用视口坐标
      const cx = e.clientX;
      const cy = e.clientY;
      const shockSq = shockRadius * shockRadius;
      needsRedrawRef.current = true;

      for (const dot of dotsRef.current) {
        const ddx = dot.cx - cx;
        const ddy = dot.cy - cy;
        const dsq = ddx * ddx + ddy * ddy;
        if (dsq < shockSq && !dot._inertiaApplied) {
          dot._inertiaApplied = true;
          activeCountRef.current++;
          gsap.killTweensOf(dot);
          const falloff = Math.max(0, 1 - Math.sqrt(dsq) / shockRadius);
          const pushX = ddx * shockStrength * falloff;
          const pushY = ddy * shockStrength * falloff;
          gsap.to(dot, {
            inertia: { xOffset: pushX, yOffset: pushY, resistance },
            onComplete: () => {
              gsap.to(dot, {
                xOffset: 0,
                yOffset: 0,
                duration: returnDuration,
                ease: 'elastic.out(1,0.75)',
                onComplete: () => {
                  activeCountRef.current--;
                }
              });
              dot._inertiaApplied = false;
            }
          });
        }
      }
    };

    const throttledMove = throttle(onMove, 50);
    window.addEventListener('mousemove', throttledMove, { passive: true });
    window.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('mousemove', throttledMove);
      window.removeEventListener('click', onClick);
    };
  }, [maxSpeed, speedTrigger, proximity, resistance, returnDuration, shockRadius, shockStrength]);

  return (
    <section className={`h-full w-full relative ${className}`} style={style}>
      {/* canvas 固定在视口：点阵作为背景纹理只需覆盖一屏，
          不随页面滚动、也不随文档高度增长 */}
      <div ref={wrapperRef} className="w-full h-full relative">
        <canvas
          ref={canvasRef}
          className="fixed top-0 left-0 pointer-events-none"
          style={{ width: '100vw', height: '100vh' }}
        />
      </div>
    </section>
  );
};

export default DotGrid;
