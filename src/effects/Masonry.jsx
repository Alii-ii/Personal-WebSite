import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';

const useMedia = (queries, values, defaultValue) => {
  const get = () => {
    if (typeof window === 'undefined') return defaultValue;
    return values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue;
  };

  const [value, setValue] = useState(get);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
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
    if (typeof window === 'undefined' || !ref.current) return;
    
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
};

/**
 * 预加载图片，优先使用本地图片，失败时回退到CDN
 * @param {Array} items - 包含 img 和 fallbackImg 的图片项数组
 * @returns {Promise<Array>} 图片数据数组
 */
const preloadImages = async items => {
  if (typeof window === 'undefined') {
    return items.map(item => ({ 
      src: item.fallbackImg || item.img, 
      width: 400, 
      height: 300 
    }));
  }
  
  const imageData = await Promise.all(
    items.map(
      item =>
        new Promise(resolve => {
          // 优先使用本地图片（fallbackImg），其次使用CDN（img）
          const primarySrc = item.fallbackImg || item.img;
          const fallbackSrc = item.fallbackImg ? item.img : null;
          
          const img = new Image();
          
          // 先尝试加载本地图片
          img.src = primarySrc;
          
          img.onload = () => resolve({
            src: primarySrc,
            width: img.naturalWidth,
            height: img.naturalHeight
          });
          
          img.onerror = () => {
            // 如果本地图片加载失败且有CDN备用，尝试CDN
            if (fallbackSrc) {
              const fallbackImg = new Image();
              fallbackImg.src = fallbackSrc;
              fallbackImg.onload = () => resolve({
                src: fallbackSrc,
                width: fallbackImg.naturalWidth,
                height: fallbackImg.naturalHeight
              });
              fallbackImg.onerror = () => resolve({
                src: primarySrc, // 使用原始源，即使加载失败
                width: 400, // 默认宽度
                height: 300 // 默认高度
              });
            } else {
              // 没有备用图片，返回默认值
              resolve({
                src: primarySrc,
                width: 400, // 默认宽度
                height: 300 // 默认高度
              });
            }
          };
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
  // 最大列宽限制（web端）
  const maxColumnWidth = 360;
  
  // 图片放大功能状态
  const [expandedImageId, setExpandedImageId] = useState(null);
  const [isWebDevice, setIsWebDevice] = useState(false);
  const [expandedImagePosition, setExpandedImagePosition] = useState(null);
  
  // 使用 ref 来跟踪当前状态，避免异步更新问题
  const expandedImageIdRef = useRef(null);
  const isWebDeviceRef = useRef(false);
  
  // 基础列数（用于小屏幕）- 设置较小的基础列数，让宽屏幕能显示更多列
  const baseColumns = useMedia(
    ['(min-width:400px)'],
    [1],
    1
  );

  const [containerRef, { width }] = useMeasure();
  const [imagesReady, setImagesReady] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({});
  // 跟踪每个图片项实际使用的图片源（优先本地，失败时使用CDN）
  const [imageSources, setImageSources] = useState({});

  // 设备检测 - 判断是否为Web端
  useEffect(() => {
    const checkDevice = () => {
      const isWeb = window.innerWidth > 768; // 768px作为移动端阈值
      setIsWebDevice(isWeb);
      isWebDeviceRef.current = isWeb; // 同步更新 ref
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // 同步 expandedImageId 到 ref
  useEffect(() => {
    expandedImageIdRef.current = expandedImageId;
  }, [expandedImageId]);

  // 获取图片实际尺寸的辅助函数
  const getImageSize = useCallback((imageId) => {
    // 使用 items 和 imageDimensions 来计算尺寸
    const item = items.find(item => (item.id || items.indexOf(item)) === imageId);
    if (item) {
      // 获取该 item 实际使用的图片源
      const itemKey = item.id || items.indexOf(item);
      const actualSrc = imageSources[itemKey] || item.fallbackImg || item.img;
      const imgData = imageDimensions[actualSrc] || { width: 400, height: 300 };
      const aspectRatio = imgData.width / imgData.height;
      const columnWidth = Math.min(maxColumnWidth, (width - 16) / Math.ceil(width / maxColumnWidth));
      const height = columnWidth / aspectRatio;
      return { w: columnWidth, h: height };
    }
    // 如果找不到，使用默认尺寸
    return { w: 300, h: 200 };
  }, [items, imageDimensions, imageSources, maxColumnWidth, width]);

  // 键盘快捷键支持 - 使用防抖来避免快速按键问题
  useEffect(() => {
    let isProcessing = false; // 防止重复处理
    
    const handleKeyDown = (event) => {
      // 防止重复处理
      if (isProcessing) {
        return;
      }
      
      // 使用 ref 获取最新值，避免异步状态更新问题
      const currentExpandedId = expandedImageIdRef.current;
      const currentIsWebDevice = isWebDeviceRef.current;
      
      if (!currentIsWebDevice || currentExpandedId === null || currentExpandedId === undefined) {
        return;
      }

      // 使用 items 而不是 grid 来避免循环依赖
      const currentIndex = items.findIndex(item => (item.id || items.indexOf(item)) === currentExpandedId);
      
      if (currentIndex === -1) {
        return;
      }

      // 设置处理标志
      isProcessing = true;

      switch (event.key) {
        case 'Escape':
          // ESC 退出放大
          event.preventDefault();
          setExpandedImageId(null);
          setExpandedImagePosition(null);
          setTimeout(() => { isProcessing = false; }, 100);
          break;
        
        case 'ArrowUp':
        case 'ArrowLeft':
          // 上/左 往前切换
          event.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          const prevItem = items[prevIndex];
          
          if (prevItem) {
            // 使用视口中心而不是容器中心
            const newId = prevItem.id || prevIndex;
            const size = getImageSize(newId);
            const centerX = window.innerWidth / 2 - size.w / 2;
            const centerY = window.innerHeight / 2 - size.h / 2;
            setExpandedImagePosition({ x: centerX, y: centerY });
            setExpandedImageId(newId);
          }
          setTimeout(() => { isProcessing = false; }, 100);
          break;
        
        case 'ArrowDown':
        case 'ArrowRight':
          // 下/右 往后切换
          event.preventDefault();
          const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          const nextItem = items[nextIndex];
          
          if (nextItem) {
            // 使用视口中心而不是容器中心
            const newId = nextItem.id || nextIndex;
            const size = getImageSize(newId);
            const centerX = window.innerWidth / 2 - size.w / 2;
            const centerY = window.innerHeight / 2 - size.h / 2;
            setExpandedImagePosition({ x: centerX, y: centerY });
            setExpandedImageId(newId);
          }
          setTimeout(() => { isProcessing = false; }, 100);
          break;
      }
    };

    // 添加键盘事件监听器
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [items, getImageSize]); // 添加 getImageSize 依赖

  // 检查是否需要自适应宽度（移动端阈值到1000px之间）
  const shouldFillWidth = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const screenWidth = window.innerWidth;
    return screenWidth > 768 && screenWidth <= 1000;
  }, [width]);

  // 图片点击处理 - 使用 useCallback 优化性能
  const handleImageClick = useCallback((imageId, event) => {
    if (!isWebDevice) return; // 移动端不处理
    
    event.stopPropagation(); // 阻止事件冒泡
    event.preventDefault(); // 阻止默认行为
    
    if (expandedImageId === imageId) {
      // 点击已放大的图片，缩小
      setExpandedImageId(null);
      setExpandedImagePosition(null);
    } else {
      // 点击其他图片，放大新图片
      // 使用 getImageSize 获取实际尺寸
      const size = getImageSize(imageId);
      // 计算居中位置 - 使用视口中心而不是容器中心
      const centerX = window.innerWidth / 2 - size.w / 2;
      const centerY = window.innerHeight / 2 - size.h / 2;
      console.log('点击放大 - 视口尺寸:', window.innerWidth, 'x', window.innerHeight);
      console.log('图片尺寸:', size.w, 'x', size.h);
      console.log('计算位置:', centerX, centerY);
      setExpandedImagePosition({ x: centerX, y: centerY });
      setExpandedImageId(imageId);
    }
  }, [isWebDevice, expandedImageId, getImageSize]);

  // 容器点击处理 - 点击空白区域缩小图片
  const handleContainerClick = useCallback((event) => {
    // 只有当点击的是容器本身（不是子元素）时才缩小图片
    if (isWebDevice && expandedImageId && event.target === event.currentTarget) {
      setExpandedImageId(null);
      setExpandedImagePosition(null);
    }
  }, [isWebDevice, expandedImageId]);

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
    
    // 使用更新后的 preloadImages，传入完整 items 以支持优先本地图片
    preloadImages(items).then(imageData => {
      console.log('图片预加载完成:', imageData);
      const dimensions = {};
      const sources = {};
      
      // 为每个 item 建立图片源映射
      items.forEach((item, index) => {
        const imgData = imageData[index];
        // 使用 item 的唯一标识（id 或 index）
        const itemKey = item.id || index;
        // 存储该 item 实际使用的图片源
        sources[itemKey] = imgData.src;
        // 存储图片尺寸（使用实际使用的图片源作为 key）
        dimensions[imgData.src] = { width: imgData.width, height: imgData.height };
      });
      
      setImageSources(sources);
      setImageDimensions(dimensions);
      setImagesReady(true);
    });
  }, [items]);

  const grid = useMemo(() => {
    console.log('计算 grid，参数:', { width, imagesReady, itemsLength: items.length, baseColumns });
    if (!width || width <= 0 || !imagesReady) {
      console.log('grid 计算条件不满足，返回空数组');
      return [];
    }
    
    const gap = 16;
    
    // 动态计算列数：基于容器宽度和最大列宽
    let columns = baseColumns;
    let columnWidth = (width - (columns - 1) * gap) / columns;
    
    console.log(`初始计算: 基础列数=${baseColumns}, 容器宽度=${width}px, 初始列宽=${columnWidth}px`);
    
    // 如果计算出的列宽大于最大限制，则增加列数
    while (columnWidth > maxColumnWidth && columns < 20) { // 最多20列，避免过多
      columns++;
      columnWidth = (width - (columns - 1) * gap) / columns;
      console.log(`增加列数到 ${columns}，新列宽: ${columnWidth}px`);
    }
    
    // 如果列宽仍然太大，则限制列宽
    if (columnWidth > maxColumnWidth) {
      console.log(`列宽 ${columnWidth}px 超过最大限制 ${maxColumnWidth}px，已限制为 ${maxColumnWidth}px`);
      columnWidth = maxColumnWidth;
    }
    
    console.log(`最终结果: 列数=${columns}，列宽=${columnWidth}px，容器宽度=${width}px`);
    
    const colHeights = new Array(columns).fill(0);

    return items.map((child, index) => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = col * (columnWidth + gap);
      
      // 获取该 item 实际使用的图片源
      const itemKey = child.id || index;
      const actualSrc = imageSources[itemKey] || child.fallbackImg || child.img;
      // 使用动态加载的图片尺寸，如果没有则使用默认值
      const imgData = imageDimensions[actualSrc] || { width: 400, height: 300 };
      const aspectRatio = imgData.width / imgData.height;
      const height = columnWidth / aspectRatio;
      const y = colHeights[col];

      colHeights[col] += height + gap;
      
      return { 
        ...child, 
        id: child.id || index, // 确保有唯一的 id
        x, 
        y, 
        w: columnWidth, 
        h: height,
        originalWidth: imgData.width,
        originalHeight: imgData.height,
        // 保存实际使用的图片源
        actualImgSrc: actualSrc
      };
    });
  }, [baseColumns, items, width, imagesReady, imageDimensions, imageSources, maxColumnWidth]);
  
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

  const handleMouseEnter = useCallback((id, element) => {
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
  }, [scaleOnHover, hoverScale, colorShiftOnHover]);

  const handleMouseLeave = useCallback((id, element) => {
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
  }, [scaleOnHover, colorShiftOnHover]);

  // 计算容器总高度 - 使用视口高度减去 footer 高度
  const containerHeight = useMemo(() => {
    return grid.length > 0 ? Math.max(...grid.map(item => item.y + item.h)) + 200 : 0;
  }, [grid]);
  
  // 计算实际使用的总宽度（考虑列宽限制）
  const actualWidth = useMemo(() => {
    return grid.length > 0 ? Math.max(...grid.map(item => item.x + item.w)) : 0;
  }, [grid]);
  
  const shouldCenter = useMemo(() => {
    return actualWidth < width && actualWidth > 0;
  }, [actualWidth, width]);
  

  return (
    <div 
      ref={containerRef} 
      className="relative w-full"
      style={{ minHeight: containerHeight }}
      onClick={handleContainerClick}
    >
      {/* 放大图片时的遮罩层 */}
      {expandedImageId && isWebDevice && (
        <div 
          className="fixed inset-0 bg-bg opacity-50 backdrop-blur-sm z-40"
          onClick={() => {
            setExpandedImageId(null);
            setExpandedImagePosition(null);
          }}
        />
      )}
      
      {grid.map(item => (
        <div
          data-key={item.id}
          className={expandedImageId === item.id && expandedImagePosition ? "fixed" : "absolute"}
          style={{ 
            willChange: 'transform, opacity',
            left: expandedImageId === item.id && expandedImagePosition 
              ? expandedImagePosition.x 
              : (shouldCenter ? item.x + (width - actualWidth) / 2 : item.x),
            top: expandedImageId === item.id && expandedImagePosition 
              ? expandedImagePosition.y 
              : item.y,
            width: item.w,
            height: item.h,
            zIndex: expandedImageId === item.id ? 50 : 1, // 提高放大图片的层级
            transform: 'translateZ(0)', // 启用硬件加速
            backfaceVisibility: 'hidden' // 优化渲染性能
          }}
          onMouseEnter={e => {
            handleMouseEnter(item.id, e.currentTarget);
          }}
          onMouseLeave={e => {
            handleMouseLeave(item.id, e.currentTarget);
          }}
        >
          <div 
            className="relative w-full h-full rounded-[8px] overflow-hidden border border-stroke border-[0.5px] cursor-pointer"
            style={{ 
              boxShadow: expandedImageId === item.id && isWebDevice 
                ? '0px 8px 24px 0px rgba(0,0,0,0.15)' 
                : '0px 4px 12px 0px rgba(0,0,0,0.08)',
              transform: expandedImageId === item.id && isWebDevice ? 'scale(2)' : 'scale(1)',
              transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              loading: 'lazy',
              maxWidth: '100%',
              maxHeight: '100%',
              width: shouldFillWidth ? '100%' : undefined,
              willChange: 'transform, box-shadow', // 提示浏览器优化这些属性
              transformOrigin: 'center center' // 确保缩放从中心开始
            }}
            onClick={(e) => handleImageClick(item.id, e)}
          >
            <img
              src={item.actualImgSrc || item.fallbackImg || item.img}
              alt={item.title || item.tittle || ''}
              className="w-full h-full overflow-hidden"
              style={{ 
                width: '100%', 
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                transform: 'translateZ(0)', // 启用硬件加速
                backfaceVisibility: 'hidden', // 优化渲染性能
                imageRendering: 'optimizeQuality' // 优化图片渲染质量
              }}
              onError={(e) => {
                // 如果当前图片加载失败，尝试切换到备用图片源
                const currentSrc = e.target.src;
                const itemKey = item.id || items.findIndex(i => i === item);
                
                // 如果当前是本地图片，尝试切换到CDN
                if (currentSrc === item.fallbackImg && item.img) {
                  e.target.src = item.img;
                  // 更新图片源状态
                  setImageSources(prev => ({
                    ...prev,
                    [itemKey]: item.img
                  }));
                }
                // 如果当前是CDN图片且本地图片存在，尝试使用本地图片（虽然不应该发生，但作为最后的兜底）
                else if (currentSrc === item.img && item.fallbackImg) {
                  e.target.src = item.fallbackImg;
                  setImageSources(prev => ({
                    ...prev,
                    [itemKey]: item.fallbackImg
                  }));
                }
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
