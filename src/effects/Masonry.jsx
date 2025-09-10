import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';

const useMedia = (queries, values, defaultValue) => {
  const get = () => values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue;

  const [value, setValue] = useState(get);

  useEffect(() => {
    const handler = () => setValue(get);
    queries.forEach(q => matchMedia(q).addEventListener('change', handler));
    return () => queries.forEach(q => matchMedia(q).removeEventListener('change', handler));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries]);

  return value;
};

const useMeasure = () => {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
};

const preloadImages = async urls => {
  const imageData = await Promise.all(
    urls.map(
      src =>
        new Promise(resolve => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve({
            src,
            width: img.naturalWidth,
            height: img.naturalHeight
          });
          img.onerror = () => resolve({
            src,
            width: 400, // 默认宽度
            height: 300 // 默认高度
          });
        })
    )
  );
  return imageData;
};

const Masonry = ({
  items,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false
}) => {
  const columns = useMedia(
    ['(min-width:1500px)', '(min-width:1000px)', '(min-width:600px)', '(min-width:400px)'],
    [5, 4, 3, 2],
    1
  );
  
  // 最大列宽限制（web端）
  const maxColumnWidth = 360;

  const [containerRef, { width }] = useMeasure();
  const [imagesReady, setImagesReady] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({});

  const getInitialPosition = item => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return { x: item.x, y: item.y };

    let direction = animateFrom;
    if (animateFrom === 'random') {
      const dirs = ['top', 'bottom', 'left', 'right'];
      direction = dirs[Math.floor(Math.random() * dirs.length)];
    }

    switch (direction) {
      case 'top':
        return { x: item.x, y: -200 };
      case 'bottom':
        return { x: item.x, y: window.innerHeight + 200 };
      case 'left':
        return { x: -200, y: item.y };
      case 'right':
        return { x: window.innerWidth + 200, y: item.y };
      case 'center':
        return {
          x: containerRect.width / 2 - item.w / 2,
          y: containerRect.height / 2 - item.h / 2
        };
      default:
        return { x: item.x, y: item.y + 100 };
    }
  };

  useEffect(() => {
    console.log('Masonry 组件接收到 items:', items);
    if (items.length === 0) {
      console.warn('Masonry 组件接收到空的 items 数组');
      setImagesReady(true);
      return;
    }
    
    preloadImages(items.map(i => i.img)).then(imageData => {
      console.log('图片预加载完成:', imageData);
      const dimensions = {};
      imageData.forEach(({ src, width, height }) => {
        dimensions[src] = { width, height };
      });
      setImageDimensions(dimensions);
      setImagesReady(true);
    });
  }, [items]);

  const grid = useMemo(() => {
    console.log('计算 grid，参数:', { width, imagesReady, itemsLength: items.length, columns });
    if (!width || width <= 0 || !imagesReady) {
      console.log('grid 计算条件不满足，返回空数组');
      return [];
    }
    const colHeights = new Array(columns).fill(0);
    const gap = 16;
    const totalGaps = (columns - 1) * gap;
    let columnWidth = (width - totalGaps) / columns;
    
    // 限制最大列宽（web端）
    if (columnWidth > maxColumnWidth) {
      console.log(`列宽 ${columnWidth}px 超过最大限制 ${maxColumnWidth}px，已限制为 ${maxColumnWidth}px`);
      columnWidth = maxColumnWidth;
    }
    
    console.log(`计算出的列宽: ${columnWidth}px，容器宽度: ${width}px，列数: ${columns}`);

    return items.map((child, index) => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = col * (columnWidth + gap);
      
      // 使用动态加载的图片尺寸，如果没有则使用默认值
      const imgData = imageDimensions[child.img] || { width: 400, height: 300 };
      const aspectRatio = imgData.width / imgData.height;
      const height = columnWidth / aspectRatio;
      const y = colHeights[col];

      colHeights[col] += height + gap;
      
      return { 
        ...child, 
        x, 
        y, 
        w: columnWidth, 
        h: height,
        originalWidth: imgData.width,
        originalHeight: imgData.height
      };
    });
  }, [columns, items, width, imagesReady, imageDimensions]);
  
  console.log('计算出的 grid:', grid);

  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (!imagesReady) return;

    grid.forEach((item, index) => {
      const selector = `[data-key="${item.id}"]`;

      if (!hasMounted.current) {
        gsap.fromTo(
          selector,
          {
            opacity: 0,
            ...(blurToFocus && { filter: 'blur(10px)' })
          },
          {
            opacity: 1,
            ...(blurToFocus && { filter: 'blur(0px)' }),
            duration: 0.8,
            ease: 'power3.out',
            delay: index * stagger
          }
        );
      }
    });

    hasMounted.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, imagesReady, stagger, animateFrom, blurToFocus, duration, ease]);

  const handleMouseEnter = (id, element) => {
    console.log('鼠标进入:', id, 'scaleOnHover:', scaleOnHover, 'colorShiftOnHover:', colorShiftOnHover);
    if (scaleOnHover) {
      // 直接对传入的 element 应用动画
      gsap.to(element, {
        scale: hoverScale,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay');
      if (overlay) gsap.to(overlay, { opacity: 0.3, duration: 0.3 });
    }
  };

  const handleMouseLeave = (id, element) => {
    console.log('鼠标离开:', id);
    if (scaleOnHover) {
      // 直接对传入的 element 应用动画
      gsap.to(element, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay');
      if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });
    }
  };

  // 计算容器总高度
  const containerHeight = grid.length > 0 ? Math.max(...grid.map(item => item.y + item.h)) + 100 : 0;
  
  // 计算实际使用的总宽度（考虑列宽限制）
  const actualWidth = grid.length > 0 ? Math.max(...grid.map(item => item.x + item.w)) : 0;
  const shouldCenter = actualWidth < width && actualWidth > 0;
  
  console.log(`容器信息: 总宽度=${width}px, 实际使用宽度=${actualWidth}px, 是否需要居中=${shouldCenter}`);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full"
      style={{ height: containerHeight }}
    >
      {grid.map(item => (
        <div
          data-key={item.id}
          className="absolute"
          style={{ 
            willChange: 'transform, opacity',
            left: shouldCenter ? item.x + (width - actualWidth) / 2 : item.x,
            top: item.y,
            width: item.w,
            height: item.h
          }}
          // url 为空时点击无响应，否则新窗口打开
          onClick={() => {
            if (item.url) {
              window.open(item.url, 'noopener');
            }
          }}
          onMouseEnter={e => {
            console.log('onMouseEnter 事件触发:', item.id);
            handleMouseEnter(item.id, e.currentTarget);
          }}
          onMouseLeave={e => {
            console.log('onMouseLeave 事件触发:', item.id);
            handleMouseLeave(item.id, e.currentTarget);
          }}
        >
          <div 
            className="relative w-full h-full rounded-[8px] overflow-hidden border border-stroke border-[0.5px]"
            style={{ boxShadow: '0px 4px 12px 0px rgba(0,0,0,0.08)' }}>
            <img
              src={item.img}
              alt={item.title || ''}
              className="w-full h-full"
              style={{ 
                width: '100%', 
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center'
              }}
            />
            {colorShiftOnHover && (
              <div className="color-overlay absolute inset-0 rounded-[10px] bg-gradient-to-tr from-pink-500/50 to-sky-500/50 opacity-0 pointer-events-none z-100" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Masonry;
