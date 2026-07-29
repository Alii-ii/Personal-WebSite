import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';

/**
 * 作品墙里每张卡片只显示约 532px 宽，但 portfolio 原图是 2560x1440。
 * 即使懒加载，图片一旦进入视口仍要解码成约 14MB 位图；
 * 因此这里把 /images/portfolio/<项目>/<图>.webp 映射到同目录的 thumbs/ 版本。
 *
 * 缩略图由 scripts/generate-portfolio-thumbs.mjs 生成。
 * 非 portfolio 图片（如 gallery）保持原路径不变。
 */
const resolveFeedSrc = (item) => {
  const src = item?.img || item?.src || '';
  if (!src.startsWith('/images/portfolio/') || src.includes('/thumbs/')) return src;
  const idx = src.lastIndexOf('/');
  return `${src.slice(0, idx)}/thumbs${src.slice(idx)}`;
};

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
 * 预加载图片并获取尺寸
 * @param {Array} items - 包含 img 的图片项数组
 * @returns {Promise<Array>} 图片数据数组
 */
const preloadImages = async items => {
  if (typeof window === 'undefined') {
    return items.map(item => ({ 
      src: item.img, 
      width: 400, 
      height: 300 
    }));
  }
  
  const imageData = await Promise.all(
    items.map(
      item =>
        new Promise(resolve => {
          const img = new Image();
          img.src = item.img;
          
          img.onload = () => resolve({
            src: item.img,
            width: img.naturalWidth,
            height: img.naturalHeight
          });
          
          img.onerror = () => resolve({
            src: item.img,
            width: 400,
            height: 300
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
  // 跟踪每个图片项实际使用的图片源
  const [imageSources, setImageSources] = useState({});
  // 跟踪每个图片项的加载状态：true=已加载, false=加载中, 'error'=加载失败
  const [imageLoadStatus, setImageLoadStatus] = useState({});

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

  // 获取图片实际尺寸的辅助函数（用于 Masonry 布局）
  const getImageSize = useCallback((imageId) => {
    // 使用 items 和 imageDimensions 来计算尺寸
    const item = items.find(item => (item.id || items.indexOf(item)) === imageId);
    if (item) {
      // 获取该 item 实际使用的图片源
      const itemKey = item.id || items.indexOf(item);
      const actualSrc = imageSources[itemKey] || item.img;
      const imgData = imageDimensions[actualSrc] || { width: 400, height: 300 };
      const aspectRatio = imgData.width / imgData.height;
      const columnWidth = Math.min(maxColumnWidth, (width - 16) / Math.ceil(width / maxColumnWidth));
      const height = columnWidth / aspectRatio;
      return { w: columnWidth, h: height };
    }
    // 如果找不到，使用默认尺寸
    return { w: 300, h: 200 };
  }, [items, imageDimensions, imageSources, maxColumnWidth, width]);

  // 计算放大后的图片尺寸（考虑最大阈值限制）
  const getExpandedImageSize = useCallback((imageId) => {
    const item = items.find(item => (item.id || items.indexOf(item)) === imageId);
    if (!item) {
      return { w: 400, h: 300 };
    }

    // 获取原始图片尺寸
    const itemKey = item.id || items.indexOf(item);
    const actualSrc = imageSources[itemKey] || item.img;
    const imgData = imageDimensions[actualSrc] || { width: 400, height: 300 };
    const aspectRatio = imgData.width / imgData.height;

    // 获取屏幕尺寸
    const maxWidth = window.innerWidth * 0.9; // 最大宽度为屏幕的90%
    const maxHeight = window.innerHeight * 0.9; // 最大高度为屏幕的90%

    // 计算放大后的尺寸，保持宽高比
    let expandedWidth = imgData.width;
    let expandedHeight = imgData.height;

    // 如果宽度超过限制，按宽度缩放
    if (expandedWidth > maxWidth) {
      expandedWidth = maxWidth;
      expandedHeight = expandedWidth / aspectRatio;
    }

    // 如果高度超过限制，按高度缩放
    if (expandedHeight > maxHeight) {
      expandedHeight = maxHeight;
      expandedWidth = expandedHeight * aspectRatio;
    }

    return { w: expandedWidth, h: expandedHeight };
  }, [items, imageDimensions, imageSources]);

  // 同步 expandedImageId 到 ref
  useEffect(() => {
    expandedImageIdRef.current = expandedImageId;
  }, [expandedImageId]);

  // 监听窗口大小变化，重新计算放大图片的位置和尺寸
  useEffect(() => {
    if (!isWebDevice || !expandedImageId || !expandedImagePosition) return;

    const handleResize = () => {
      // 重新计算放大后的尺寸
      const expandedSize = getExpandedImageSize(expandedImageId);
      // 重新计算居中位置
      const centerX = window.innerWidth / 2 - expandedSize.w / 2;
      const centerY = window.innerHeight / 2 - expandedSize.h / 2;
      setExpandedImagePosition({ x: centerX, y: centerY });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isWebDevice, expandedImageId, expandedImagePosition, getExpandedImageSize]);

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
            const expandedSize = getExpandedImageSize(newId);
            const centerX = window.innerWidth / 2 - expandedSize.w / 2;
            const centerY = window.innerHeight / 2 - expandedSize.h / 2;
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
            const expandedSize = getExpandedImageSize(newId);
            const centerX = window.innerWidth / 2 - expandedSize.w / 2;
            const centerY = window.innerHeight / 2 - expandedSize.h / 2;
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
  }, [items, getExpandedImageSize]); // 添加 getExpandedImageSize 依赖

  // 检查是否需要自适应宽度（移动端阈值到1000px之间）
  const shouldFillWidth = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const screenWidth = window.innerWidth;
    return screenWidth > 768 && screenWidth <= 1000;
  }, [width]);

  // 存储原始位置和尺寸的 ref，用于动画
  const originalPositionsRef = useRef({});
  // 存储 grid 的 ref，用于在回调中访问
  const gridRef = useRef([]);
  const shouldCenterRef = useRef(false);
  const actualWidthRef = useRef(0);
  const widthRef = useRef(0);

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
    if (items.length === 0) {
      setImagesReady(true);
      return;
    }

    // 不再在这里 new Image() 预加载全部图片。
    // 原实现会在挂载瞬间对全部 item 发起下载（作品墙 = 52 个并发请求），
    // 且每张 2560x1440 原图解码后占约 14MB 位图，合计 700MB+。
    //
    // 现在改为：布局尺寸直接取 item.feed 预设值（数据里已有，无需下载即可确定），
    // 真正的图片下载交给 <img loading="lazy"> 由浏览器按视口调度。
    const dims = {};
    const sources = {};
    const status = {};

    items.forEach((item, index) => {
      const itemKey = item.id || index;
      const src = resolveFeedSrc(item);
      sources[itemKey] = src;
      // feed 预设宽高来自数据层，缺失时回落到 4:3
      const w = item.feed?.w || 400;
      const h = item.feed?.h || 300;
      dims[src] = { width: w, height: h };
      status[itemKey] = true;
    });

    setImageSources(sources);
    setImageDimensions(dims);
    setImageLoadStatus(status);
    setImagesReady(true);
  }, [items]);

  const grid = useMemo(() => {
    console.log('计算 grid，参数:', { width, imagesReady, itemsLength: items.length, baseColumns, loadedCount: Object.keys(imageLoadStatus).filter(k => imageLoadStatus[k]).length });
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
    
    // 生成稳定的随机高度的辅助函数（基于 itemKey）
    // 基数 400px，幅度 ±100px，步长 50px
    // 结果：300, 350, 400, 450, 500
    const getRandomPlaceholderHeight = (itemKey) => {
      // 使用简单的哈希函数将 itemKey 转换为 0-4 的索引
      const hash = String(itemKey).split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0);
      }, 0);
      const index = Math.abs(hash) % 5; // 0-4 的索引
      const baseHeight = 400; // 基数
      const offset = (index - 2) * 50; // -100, -50, 0, 50, 100
      return baseHeight + offset;
    };

    const colHeights = new Array(columns).fill(0);

    // 处理所有图片项（包括加载中、已加载、加载失败）
    return items.map((child, index) => {
      const itemKey = child.id || index;
      const loadStatus = imageLoadStatus[itemKey];
      
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = col * (columnWidth + gap);
      
      // 根据加载状态决定尺寸
      let height, imgData;
      if (loadStatus === true) {
        // 已加载：使用实际图片尺寸
        const actualSrc = imageSources[itemKey] || child.img;
        imgData = imageDimensions[actualSrc] || { width: 400, height: 300 };
        const aspectRatio = imgData.width / imgData.height;
        height = columnWidth / aspectRatio;
      } else {
        // 加载中或加载失败：使用随机默认高度
        const randomHeight = getRandomPlaceholderHeight(itemKey);
        imgData = { width: 400, height: randomHeight };
        const aspectRatio = imgData.width / imgData.height;
        height = columnWidth / aspectRatio;
      }
      
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
        // 保存实际使用的图片源（如果已加载）
        actualImgSrc: loadStatus === true ? (imageSources[itemKey] || child.img) : null,
        // 保存加载状态
        loadStatus: loadStatus === undefined ? 'loading' : loadStatus
      };
    });
  }, [baseColumns, items, width, imagesReady, imageDimensions, imageSources, imageLoadStatus, maxColumnWidth]);
  
  console.log('计算出的 grid:', grid);

  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (!imagesReady || grid.length === 0) return;

    // 为每个新加载的图片应用入场动画
    grid.forEach((item) => {
      const selector = `[data-key="${item.id}"]`;
      const element = document.querySelector(selector);
      
      if (element) {
        // 检查这个元素是否已经动画过（通过检查 data-animated 属性）
        if (!element.dataset.animated) {
          // 标记为已动画，避免重复动画
          element.dataset.animated = 'true';
          
          // 应用入场动画
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
              delay: 0 // 每个图片加载完成后立即显示，不再使用 index * stagger
            }
          );
        }
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

  // 同步 refs，以便在回调中使用最新值
  useEffect(() => {
    gridRef.current = grid;
    shouldCenterRef.current = shouldCenter;
    actualWidthRef.current = actualWidth;
    widthRef.current = width;
  }, [grid, shouldCenter, actualWidth, width]);

  // 图片点击处理 - 使用 useCallback 优化性能（必须在 grid 定义之后）
  const handleImageClick = useCallback((imageId, event) => {
    if (!isWebDevice) return; // 移动端不处理
    
    event.stopPropagation(); // 阻止事件冒泡
    event.preventDefault(); // 阻止默认行为
    
    // 使用 ref 获取最新的 grid 值
    const currentGrid = gridRef.current;
    const currentShouldCenter = shouldCenterRef.current;
    const currentActualWidth = actualWidthRef.current;
    const currentWidth = widthRef.current;
    
    if (expandedImageId === imageId) {
      // 点击已放大的图片，缩小
      // 找到对应的 DOM 元素并执行缩小动画
      const element = document.querySelector(`[data-key="${imageId}"]`);
      if (element) {
        const item = items.find(item => (item.id || items.indexOf(item)) === imageId);
        if (item) {
          const itemKey = item.id || items.indexOf(item);
          const gridItem = currentGrid.find(g => g.id === itemKey);
          if (gridItem) {
            // 计算原始位置
            const originalX = currentShouldCenter ? gridItem.x + (currentWidth - currentActualWidth) / 2 : gridItem.x;
            const originalY = gridItem.y;
            
            // 执行缩小动画
            gsap.to(element, {
              left: originalX,
              top: originalY,
              width: gridItem.w,
              height: gridItem.h,
              duration: 0.4,
              ease: 'power2.out',
              onComplete: () => {
                setExpandedImageId(null);
                setExpandedImagePosition(null);
              }
            });
          } else {
            setExpandedImageId(null);
            setExpandedImagePosition(null);
          }
        } else {
          setExpandedImageId(null);
          setExpandedImagePosition(null);
        }
      } else {
        setExpandedImageId(null);
        setExpandedImagePosition(null);
      }
    } else {
      // 点击其他图片，放大新图片
      // 找到对应的 DOM 元素并执行放大动画
      const element = document.querySelector(`[data-key="${imageId}"]`);
      if (element) {
        const item = items.find(item => (item.id || items.indexOf(item)) === imageId);
        if (item) {
          const itemKey = item.id || items.indexOf(item);
          const gridItem = currentGrid.find(g => g.id === itemKey);
          if (gridItem) {
            // 获取原始位置和尺寸
            const originalX = currentShouldCenter ? gridItem.x + (currentWidth - currentActualWidth) / 2 : gridItem.x;
            const originalY = gridItem.y;
            
            // 计算放大后的尺寸和位置
            const expandedSize = getExpandedImageSize(imageId);
            const centerX = window.innerWidth / 2 - expandedSize.w / 2;
            const centerY = window.innerHeight / 2 - expandedSize.h / 2;
            
            // 先设置状态，然后执行动画
            setExpandedImageId(imageId);
            setExpandedImagePosition({ x: centerX, y: centerY });
            
            // 使用 GSAP 执行放大动画
            // 先设置初始状态
            gsap.set(element, {
              position: 'fixed',
              left: originalX,
              top: originalY,
              width: gridItem.w,
              height: gridItem.h,
              zIndex: 50
            });
            
            // 执行动画到放大状态
            gsap.to(element, {
              left: centerX,
              top: centerY,
              width: expandedSize.w,
              height: expandedSize.h,
              duration: 0.4,
              ease: 'power2.out'
            });
          }
        }
      }
    }
  }, [isWebDevice, expandedImageId, getExpandedImageSize, items]);

  // 容器点击处理 - 点击空白区域缩小图片
  const handleContainerClick = useCallback((event) => {
    // 只有当点击的是容器本身（不是子元素）时才缩小图片
    if (isWebDevice && expandedImageId && event.target === event.currentTarget) {
      // 找到对应的 DOM 元素并执行缩小动画
      const element = document.querySelector(`[data-key="${expandedImageId}"]`);
      if (element) {
        const item = items.find(item => (item.id || items.indexOf(item)) === expandedImageId);
        if (item) {
          const itemKey = item.id || items.indexOf(item);
          const gridItem = gridRef.current.find(g => g.id === itemKey);
          if (gridItem) {
            // 计算原始位置
            const originalX = shouldCenterRef.current ? gridItem.x + (widthRef.current - actualWidthRef.current) / 2 : gridItem.x;
            const originalY = gridItem.y;
            
            // 执行缩小动画
            gsap.to(element, {
              left: originalX,
              top: originalY,
              width: gridItem.w,
              height: gridItem.h,
              duration: 0.4,
              ease: 'power2.out',
              onComplete: () => {
                setExpandedImageId(null);
                setExpandedImagePosition(null);
              }
            });
            return;
          }
        }
      }
      // 如果没有找到元素或 gridItem，直接关闭
      setExpandedImageId(null);
      setExpandedImagePosition(null);
    }
  }, [isWebDevice, expandedImageId, items]);

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
      
      {grid.map(item => {
        // 计算放大后的尺寸（如果当前图片被放大）
        const isExpanded = expandedImageId === item.id && expandedImagePosition && isWebDevice;
        const expandedSize = isExpanded ? getExpandedImageSize(item.id) : null;
        
        return (
        <div
          key={item.id}
          data-key={item.id}
          style={{ 
            position: isExpanded ? 'fixed' : 'absolute', // 放大图片使用 fixed，不随页面滚动
            willChange: 'transform, opacity',
            left: isExpanded
              ? expandedImagePosition.x 
              : (shouldCenter ? item.x + (width - actualWidth) / 2 : item.x),
            top: isExpanded
              ? expandedImagePosition.y 
              : item.y,
            width: isExpanded ? expandedSize.w : item.w,
            height: isExpanded ? expandedSize.h : item.h,
            zIndex: isExpanded ? 50 : 1, // 提高放大图片的层级
            transform: 'translateZ(0)', // 启用硬件加速
            backfaceVisibility: 'hidden' // 优化渲染性能
          }}
          onMouseEnter={e => {
            if (!isExpanded) {
              handleMouseEnter(item.id, e.currentTarget);
            }
          }}
          onMouseLeave={e => {
            if (!isExpanded) {
              handleMouseLeave(item.id, e.currentTarget);
            }
          }}
        >
          <div 
            className="relative w-full h-full rounded-[8px] bg-press overflow-hidden cursor-pointer"
            style={{ 
              boxShadow: isExpanded
                ? '0px 8px 24px 0px rgba(0,0,0,0.15)' 
                : '0px 4px 12px 0px rgba(0,0,0,0.08)',
              transform: 'scale(1)', // 不再使用 scale 变换，直接改变尺寸
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // 平滑过渡
              maxWidth: '100%',
              maxHeight: '100%',
              width: shouldFillWidth && !isExpanded ? '100%' : undefined,
              willChange: isExpanded ? 'width, height, box-shadow' : 'transform, box-shadow',
              transformOrigin: 'center center'
            }}
            onClick={(e) => {
              // 只有已加载的图片才能点击放大
              if (item.loadStatus === true) {
                handleImageClick(item.id, e);
              }
            }}
          >
            {/* 根据加载状态显示不同内容 */}
            {item.loadStatus === true ? (
              // 已加载：显示实际图片
              <>
                <img
                  src={item.actualImgSrc || item.img}
                  alt={item.title || item.tittle || ''}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full overflow-hidden rounded-[8px] "
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
                    const itemKey = item.id || items.findIndex(i => i === item);
                    setImageLoadStatus(prev => ({
                      ...prev,
                      [itemKey]: 'error'
                    }));
                  }}
                />
                {colorShiftOnHover && !isExpanded && (
                  <div className="color-overlay absolute inset-0 rounded-[10px] bg-gradient-to-tr from-pink-500/50 to-sky-500/50 opacity-0 pointer-events-none z-100" />
                )}
              </>
            ) : item.loadStatus === 'error' ? (
              // 加载失败：显示错误占位符
              <div 
                className={`absolute inset-0 flex items-center justify-center bg-press`}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" className="text-disabled">
                  <path  
                    d="M20.9672 8.47255C21.2585 8.17807 21.7333 8.1755 22.0278 8.46681C22.3223 8.75811 22.3248 9.23298 22.0335 9.52745C21.3553 10.2131 20.6425 10.8156 19.8957 11.3347L22.4627 13.9016C22.7556 14.1945 22.7556 14.6694 22.4627 14.9623C22.1698 15.2552 21.6949 15.2552 21.402 14.9623L18.5825 12.1428C17.5839 12.6816 16.531 13.0853 15.425 13.3533L16.3894 16.9526C16.4966 17.3527 16.2592 17.764 15.8591 17.8712C15.459 17.9784 15.0477 17.741 14.9405 17.3409L13.9454 13.6269C13.3128 13.7089 12.6644 13.75 12.0004 13.75C11.3363 13.75 10.6879 13.7089 10.0553 13.6269L9.06011 17.3409C8.95291 17.741 8.54166 17.9784 8.14156 17.8712C7.74146 17.764 7.50401 17.3527 7.61121 16.9526L8.57566 13.3533C7.46966 13.0853 6.41676 12.6816 5.41817 12.1428L2.59869 14.9623C2.3058 15.2552 1.83093 15.2552 1.53803 14.9623C1.24514 14.6694 1.24514 14.1945 1.53803 13.9016L4.10497 11.3347C3.3582 10.8156 2.64538 10.2131 1.96715 9.52745C1.67584 9.23298 1.67841 8.75811 1.97289 8.46681C2.26736 8.1755 2.74223 8.17807 3.03353 8.47255C5.5312 10.9974 8.50611 12.25 12.0004 12.25C15.4946 12.25 18.4695 10.9974 20.9672 8.47255Z" 
                    fill="currentColor"/>
                </svg>

              </div>
            ) : (
              // 加载中：显示加载占位符
              <div 
                className={`absolute inset-0 flex items-center justify-center `}
              >
                <svg
                  width="36" height="36"
                  viewBox="0 0 24 24"
                  className="text-disabled size-8 animate-spin"
                  style={{
                    animation: 'spin-masonry-loader 0.9s linear infinite'
                  }}
                >
                  <style>{`
                    @keyframes spin-masonry-loader {
                      0% { transform: rotate(0deg);}
                      100% { transform: rotate(360deg);}
                    }
                  `}</style>
                  <path
                    d="M12.1566 3.00001C12.6763 3.00871 13.0931 3.43243 13.0931 3.95217C13.0931 4.47192 12.6763 4.89564 12.1566 4.90422L12.1503 4.9043L12.1409 4.90436L12.1312 4.9043C8.1383 4.90966 4.90429 8.148 4.90429 12.1409C4.90429 16.1374 8.1442 19.3774 12.1409 19.3774C15.5503 19.3774 18.4535 17.0075 19.1951 13.757C19.3047 13.2769 19.7109 12.9026 20.2034 12.9026C20.7667 12.9026 21.2142 13.3865 21.1039 13.939C20.2612 18.1602 16.5409 21.2818 12.1409 21.2818C7.09252 21.2818 3 17.1892 3 12.1409C3 7.09252 7.09252 3 12.1409 3L12.1566 3.00001Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
        );
      })}
    </div>
  );
};

export default Masonry;
