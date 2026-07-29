"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import FrameRenderer from '@/components/portfolio/FrameRenderer';
import ProjectMenu from '@/components/portfolio/ProjectMenu';
import MobileDrawer from '@/components/portfolio/MobileDrawer';
import ShortcutBar from '@/components/portfolio/ShortcutBar';
import SlideProgress from '@/components/portfolio/SlideProgress';
import CommentSection from '@/components/comments/CommentSection';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getCommentTargetPath,
  getProjectBySlug,
  getProjectNeighbors,
  getProjectsByCategory,
  pickLocale,
} from '@/contexts/ProjectContext';

// 已解析过的图片比例缓存（模块级，跨组件/跨项目复用，避免重复探测）
const ratioCache = new Map();

// 非活跃帧相对活跃帧的高度比例（沿用原 56vh / 68vh 的视觉手感）
const STAGE_SHRINK = 56 / 68;

/**
 * 是否处于移动端断点（与 Tailwind md 一致：<768px）
 * 页数轴交互模式、菜单呈现方式都依赖它，需在运行时响应窗口变化
 */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return isMobile;
};

/**
 * 从图片文件本身探测真实宽高比。
 *
 * 不使用数据源里的 feed 字段：feed 由 sync-figma-frames 依据 Figma 画布
 * absoluteBoundingBox 生成，供 L2 瀑布流占位用，与导出图片的实际像素并不总是一致
 * （裁剪 / 约束 / 缩放都会让二者分叉）。L3 要求外框与图片严格贴合，
 * 唯一可靠且零维护的来源是图片自身的 naturalWidth / naturalHeight。
 *
 * @param {Array} frames - 当前 tab 的 frame 列表
 * @returns {Object} src → ratio(w/h) 映射
 */
const useImageRatios = (frames) => {
  const [ratios, setRatios] = useState(() => {
    const init = {};
    (frames || []).forEach((f) => {
      if (f.type === 'image' && f.src && ratioCache.has(f.src)) {
        init[f.src] = ratioCache.get(f.src);
      }
    });
    return init;
  });

  useEffect(() => {
    let alive = true;
    const pending = (frames || []).filter(
      (f) => f.type === 'image' && f.src && !ratioCache.has(f.src),
    );

    // 切 tab 时补齐已缓存但不在当前 state 里的比例。
    // 必须先比对再决定是否 setState —— 无条件展开新对象会让引用每次都变，
    // 依赖 imageRatios 的 effect 将陷入「渲染→重跑→再渲染」的死循环。
    setRatios((prev) => {
      let added = false;
      const next = { ...prev };
      (frames || []).forEach((f) => {
        if (f.type === 'image' && f.src && ratioCache.has(f.src) && !(f.src in prev)) {
          next[f.src] = ratioCache.get(f.src);
          added = true;
        }
      });
      return added ? next : prev;
    });

    pending.forEach((f) => {
      const img = new window.Image();
      img.onload = () => {
        if (!img.naturalWidth || !img.naturalHeight) return;
        const r = img.naturalWidth / img.naturalHeight;
        ratioCache.set(f.src, r);
        if (alive) setRatios((prev) => (prev[f.src] === r ? prev : { ...prev, [f.src]: r }));
      };
      img.src = f.src;
    });

    return () => {
      alive = false;
    };
  }, [frames]);

  return ratios;
};

/**
 * 目录按钮（对应设计稿 32×32 r8）
 */
const MenuButton = ({ onClick, active }) => (
  <button
    type="button"
    aria-label="目录"
    onClick={onClick}
    className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors duration-150 ${
      active ? 'bg-hover text-main' : 'text-secondary hover:bg-hover hover:text-main'
    }`}
  >
    {/* 菜单 icon：替换为外部提供的版本 */}
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.22218 4.44434C4.59037 4.44434 4.88885 4.74281 4.88885 5.111C4.88885 5.47919 4.59037 5.77767 4.22218 5.77767H3.33329C2.9651 5.77767 2.66663 5.47919 2.66663 5.111C2.66663 4.74281 2.9651 4.44434 3.33329 4.44434H4.22218ZM18 4.44434C18.3681 4.44434 18.6666 4.74281 18.6666 5.111C18.6666 5.47919 18.3681 5.77767 18 5.77767H7.33329C6.9651 5.77767 6.66663 5.47919 6.66663 5.111C6.66663 4.74281 6.9651 4.44434 7.33329 4.44434H18ZM4.22218 9.99989C4.59037 9.99989 4.88885 10.2984 4.88885 10.6666C4.88885 11.0347 4.59037 11.3332 4.22218 11.3332H3.33329C2.9651 11.3332 2.66663 11.0347 2.66663 10.6666C2.66663 10.2984 2.9651 9.99989 3.33329 9.99989H4.22218ZM6.66663 10.6666C6.66663 10.2984 6.9651 9.99989 7.33329 9.99989H18C18.3681 9.99989 18.6666 10.2984 18.6666 10.6666C18.6666 11.0347 18.3681 11.3332 18 11.3332H7.33329C6.9651 11.3332 6.66663 11.0347 6.66663 10.6666ZM4.22218 15.5554C4.59037 15.5554 4.88885 15.8539 4.88885 16.2221C4.88885 16.5903 4.59037 16.8888 4.22218 16.8888H3.33329C2.9651 16.8888 2.66663 16.5903 2.66663 16.2221C2.66663 15.8539 2.9651 15.5554 3.33329 15.5554H4.22218ZM6.66663 16.2221C6.66663 15.8539 6.9651 15.5554 7.33329 15.5554H18C18.3681 15.5554 18.6666 15.8539 18.6666 16.2221C18.6666 16.5903 18.3681 16.8888 18 16.8888H7.33329C6.9651 16.8888 6.66663 16.5903 6.66663 16.2221Z"
        fill="currentColor"
        fillOpacity="0.65"
      />
    </svg>
  </button>
);

/**
 * L3 项目详情
 * 横向滚动的类 PPT 展示：激活页居中放大，两侧页缩小half透明
 * 快捷键：ESC 返回 / ←→ 切换页面 / ↑↓ 切换项目 / C 评论
 *
 * @param {string} slug - 项目标识
 * @param {string | null} initialFrameId - 首次进入时要定位的帧 id
 * @param {'next' | 'prev' | null} initialEnterDir - 跨项目切换进入方向
 */
const ProjectDetail = ({ slug, initialFrameId = null, initialEnterDir = null }) => {
  const router = useRouter();
  const { language } = useLanguage();
  const enterDir = initialEnterDir;

  const project = useMemo(() => getProjectBySlug(slug), [slug]);
  const groups = useMemo(() => getProjectsByCategory(), []);
  const neighbors = useMemo(() => getProjectNeighbors(slug), [slug]);

  // 首次进入时若带了 frameId，则优先定位到该帧所在 tab 与页码；
  // 否则回退到项目默认首个 tab 的第一页。
  const initialSelection = useMemo(() => {
    if (!project) return { tabKey: null, index: 0 };

    const defaultTabKey = project.tabs?.[0]?.key ?? null;
    const allFrames = project.frames || [];
    const targetFrame = initialFrameId
      ? allFrames.find((frame) => frame.id === initialFrameId)
      : null;
    const tabKey = targetFrame?.tab ?? defaultTabKey;
    const scopedFrames = tabKey ? allFrames.filter((frame) => frame.tab === tabKey) : allFrames;
    const index = targetFrame
      ? Math.max(
          0,
          scopedFrames.findIndex((frame) => frame.id === targetFrame.id),
        )
      : 0;

    return { tabKey, index };
  }, [project, initialFrameId]);

  const [activeTab, setActiveTab] = useState(initialSelection.tabKey);
  const [activeIndex, setActiveIndex] = useState(initialSelection.index);
  const [menuOpen, setMenuOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);

  // 当 slug 或 hash(frameId) 变化但组件未重挂载时，
  // 需要把 activeTab / activeIndex 重置到正确定位，否则会出现页码错乱/空白页。
  useEffect(() => {
    setActiveTab(initialSelection.tabKey);
    setActiveIndex(initialSelection.index);
  }, [initialSelection.tabKey, initialSelection.index]);

  // 当前 tab 下的 frame 列表
  const frames = useMemo(() => {
    if (!project) return [];
    const all = project.frames || [];
    return activeTab ? all.filter((frame) => frame.tab === activeTab) : all;
  }, [project, activeTab]);

  const isMobile = useIsMobile();

  // 图片真实比例（来自文件本身，非 JSON 声明），用于外框贴合
  const imageRatios = useImageRatios(frames);

  // 舞台（header 与 footer 之间）的实际可用高度。
  // 帧高度以它为基准而非固定 vh —— 固定 vh 与真实可用空间无关联，
  // 会在上下各留一条用不到的空白带。
  const [stageH, setStageH] = useState(0);

  // 用 ref 供键盘回调读取最新值，避免闭包捕获旧状态
  const stateRef = useRef({});
  stateRef.current = {
    frames,
    activeIndex,
    neighbors,
    commentOpen,
    menuOpen,
    tabs: project?.tabs || [],
  };

  // 横向轨道：实测每页位置，把激活页精确居中
  // PC 与移动端是两套独立的 frames.map，必须各自持有 ref，
  // 否则后渲染的移动端节点会覆盖 PC 节点，导致桌面端量到 display:none 的元素（尺寸恒为 0）
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const pcSlideRefs = useRef([]);
  const mobileSlideRefs = useRef([]);
  const [trackOffset, setTrackOffset] = useState(0);
  const [disableTrackTransition, setDisableTrackTransition] = useState(false);
  const enterAnimationAppliedRef = useRef(false);

  // 拖拽中的实时位移量，measure 需要读它来还原「未拖拽」基准
  const dragOffsetRef = useRef(0);

  // 移动端：纵向滚动时让 activeIndex 跟随视口中最靠前的可见帧，
  // 这样底部纯展示的页数轴才能反映当前浏览进度
  useEffect(() => {
    if (!isMobile) return undefined;
    const nodes = mobileSlideRefs.current.filter(Boolean);
    if (!nodes.length) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (!visible.length) return;
        const idx = Number(visible[0].target.dataset.frameIndex);
        if (!Number.isNaN(idx)) setActiveIndex((prev) => (prev === idx ? prev : idx));
      },
      { root: viewportRef.current, threshold: [0.35, 0.6] },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
    // imageRatios：比例探测完成后帧才有真实高度，需重新绑定观察器
  }, [isMobile, frames, imageRatios]);

  // 跟踪舞台可用高度：main 由 flex-1 撑开，其 clientHeight 即 header/footer 之间的净空间
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const readStage = () => {
      // clientHeight 含 padding，而 padding 是为悬浮 header/footer 预留的安全区，
      // 帧不应占用，故扣除后才是真实可用高度
      const cs = getComputedStyle(viewport);
      const h =
        viewport.clientHeight - parseFloat(cs.paddingTop || 0) - parseFloat(cs.paddingBottom || 0);
      if (h > 0) setStageH((prev) => (Math.abs(prev - h) < 0.5 ? prev : h));
    };

    readStage();
    const ro = new ResizeObserver(readStage);
    ro.observe(viewport);
    window.addEventListener('resize', readStage);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', readStage);
    };
  }, []);

  useEffect(() => {
    let raf = 0;

    const measure = () => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!viewport || !track) return;

      // ref 可能残留上一次渲染、已从 DOM 卸载的节点（切项目 / 切 tab 时 key 全变），
      // 这类节点 offsetParent 为 null 且尺寸恒为 0。此时回退到按 data-frame-index
      // 从当前 DOM 直接查，保证测量对象一定是活的。
      let active = pcSlideRefs.current[activeIndex];
      if (!active || !active.isConnected) {
        active = track.querySelector(
          `.md\\:flex > section[data-frame-index="${activeIndex}"]`,
        );
      }

      // 移动端为纵向布局，PC 分支被 display:none，offsetParent 为 null，此时不做横向位移
      if (!active || active.offsetParent === null) {
        setTrackOffset((prev) => (prev === 0 ? prev : 0));
        return;
      }

      // 用 offsetLeft / offsetWidth（布局坐标，不含 transform）计算绝对目标位移。
      // 相比 getBoundingClientRect，它不受进行中的 translateX 过渡影响，
      // 因此无需禁用 transition —— 位移得以正常播放左右滑动动画。
      if (active.offsetWidth === 0) return;

      // 累加 section 到 track 之间各层的布局偏移
      let offsetInTrack = 0;
      for (let node = active; node && node !== track; node = node.offsetParent) {
        offsetInTrack += node.offsetLeft;
      }

      const next = viewport.clientWidth / 2 - (offsetInTrack + active.offsetWidth / 2);
      // 只在「跨项目的上下切换」首次进入时做动效方向修正：
      // - enterDir='next'：从右侧（更大 translateX）滑入中心
      // - enterDir='prev'：从左侧（更小 translateX）滑入中心
      if (enterDir && !enterAnimationAppliedRef.current) {
        enterAnimationAppliedRef.current = true;
        setDisableTrackTransition(true);
        const viewportW = viewport.clientWidth;
        // translateX 的正负号会决定「从左/从右」进入效果；
        // 当前观测到始终“从右往左”，因此这里交换方向映射。
        const from = enterDir === 'next' ? next - viewportW : next + viewportW;
        setTrackOffset(from);

        requestAnimationFrame(() => {
          setTrackOffset(next);
          setDisableTrackTransition(false);
        });
        return;
      }

      setTrackOffset((prev) => (Math.abs(next - prev) < 0.5 ? prev : next));
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    schedule();
    // 宽高过渡 500ms，过渡结束后再校准一次
    const timer = setTimeout(schedule, 520);

    // 图片是 lazy load 的，加载完成会改变帧尺寸，需要重新测量
    const observer = new ResizeObserver(schedule);
    pcSlideRefs.current.forEach((node) => node && observer.observe(node));
    if (viewportRef.current) observer.observe(viewportRef.current);

    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener('resize', schedule);
    };
    // imageRatios / stageH 必须在依赖里：帧尺寸由它们推导，
    // 尺寸变化后需重新测量才能保持居中
  }, [activeIndex, frames, imageRatios, stageH]);

  // 切换 tab 时回到第一页
  const handleTabChange = useCallback((tabKey) => {
    setActiveTab(tabKey);
    setActiveIndex(0);
  }, []);

  // 根据目标项目的默认 tab 取首/末帧，用于跨项目时衔接左右翻页体验。
  const getProjectEdgeFrameId = useCallback((targetSlug, edge) => {
    const targetProject = getProjectBySlug(targetSlug);
    if (!targetProject) return null;

    const defaultTabKey = targetProject.tabs?.[0]?.key ?? null;
    const scopedFrames = defaultTabKey
      ? (targetProject.frames || []).filter((frame) => frame.tab === defaultTabKey)
      : targetProject.frames || [];

    if (!scopedFrames.length) return null;
    return edge === 'end' ? scopedFrames[scopedFrames.length - 1].id : scopedFrames[0].id;
  }, []);

  const goProject = useCallback(
    (targetSlug, options = {}) => {
      if (!targetSlug) return;

      const search = new URLSearchParams();
      if (options.frameId) search.set('frame', options.frameId);
      if (options.motionDir) search.set('enterDir', options.motionDir);
      const query = search.toString() ? `?${search.toString()}` : '';
      router.push(`/portfolio/${targetSlug}${query}`);
    },
    [router]
  );

  const goPrevPage = useCallback(() => {
    const { activeIndex: currentIndex, neighbors: nb } = stateRef.current;
    if (currentIndex > 0) {
      setActiveIndex((prev) => prev - 1);
      return;
    }

    if (!nb?.prev?.slug) return;
    goProject(nb.prev.slug, {
      frameId: getProjectEdgeFrameId(nb.prev.slug, 'end'),
    });
  }, [getProjectEdgeFrameId, goProject]);

  const goNextPage = useCallback(() => {
    const { activeIndex: currentIndex, frames: currentFrames, neighbors: nb } = stateRef.current;
    const total = currentFrames.length;

    if (currentIndex < total - 1) {
      setActiveIndex((prev) => prev + 1);
      return;
    }

    if (!nb?.next?.slug) return;
    goProject(nb.next.slug, {
      frameId: getProjectEdgeFrameId(nb.next.slug, 'start'),
    });
  }, [getProjectEdgeFrameId, goProject]);

  const goBack = useCallback(() => router.push('/portfolio'), [router]);
  const toggleComment = useCallback(() => setCommentOpen((prev) => !prev), []);

  // 拖拽切页：按下拖动，松手时按位移方向与阈值决定翻页
  const dragRef = useRef({ active: false, startX: 0, dx: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const handlePointerDown = useCallback((event) => {
    // 移动端是纵向平铺滚动，没有横向切页手势，接管 pointer 只会干扰滚动
    if (window.matchMedia('(max-width: 767px)').matches) return;
    // 仅左键 / 触摸
    if (event.button !== undefined && event.button !== 0) return;
    // 交互元素（链接 / 按钮 / 内嵌原型）内不劫持手势
    if (event.target.closest?.('a, button, iframe, input, textarea, select')) return;

    // 记录按下时命中的帧，松手时若未发生拖拽则视为「点击该帧」并切页。
    // 这里不做 preventDefault / setPointerCapture —— 二者都会破坏点击语义
    // （前者抑制 click 生成，后者把事件 target 重定向到 main），
    // 改在确认拖拽后（见 handlePointerMove）再抑制原生行为。
    const hit = event.target.closest?.('section[data-frame-index]');
    dragRef.current = {
      active: true,
      startX: event.clientX,
      dx: 0,
      captured: false,
      hitIndex: hit ? Number(hit.dataset.frameIndex) : -1,
    };
    dragOffsetRef.current = 0;
    setDragging(true);
  }, []);

  const handlePointerMove = useCallback((event) => {
    if (!dragRef.current.active) return;
    const dx = event.clientX - dragRef.current.startX;

    // 超过 6px 才认定为拖拽：此时才接管指针并抑制原生图片拖拽 / 选区，
    // 保证「按下即松开」的纯点击不受影响
    if (!dragRef.current.captured && Math.abs(dx) > 6) {
      dragRef.current.captured = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    if (dragRef.current.captured && event.cancelable) event.preventDefault();

    dragRef.current.dx = dx;
    dragOffsetRef.current = dx;
    setDragOffset(dx);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!dragRef.current.active) return;
    const { dx, hitIndex } = dragRef.current;
    dragRef.current = { active: false, startX: 0, dx: 0, captured: false, hitIndex: -1 };
    dragOffsetRef.current = 0;
    setDragging(false);
    setDragOffset(0);

    // 位移在阈值内视为点击：直接切到被点的帧
    // （不依赖 click 事件——拖拽期间的 preventDefault / 指针捕获会使其不可靠）
    if (Math.abs(dx) <= 6) {
      if (hitIndex >= 0) setActiveIndex(hitIndex);
      return;
    }

    // 阈值 60px：向左拖看下一页，向右拖看上一页
    if (dx <= -60) goNextPage();
    else if (dx >= 60) goPrevPage();
  }, [goNextPage, goPrevPage]);

  // 指针移出窗口也要收尾，避免卡在拖拽态
  useEffect(() => {
    if (!dragging) return;
    const onUp = () => handlePointerUp();
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [dragging, handlePointerUp]);

  // 全局快捷键
  useEffect(() => {
    const handleKeyDown = (event) => {
      // 输入态不劫持按键
      const tag = event.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target?.isContentEditable) return;

      const { neighbors: nb, commentOpen: isCommentOpen, menuOpen: isMenuOpen } =
        stateRef.current;

      // alt + 数字切换 tab：不与固定 tab 绑定，而是与「从右往左数」的顺位绑定
      // 最右侧 tab 对应 0，往左依次 9、8、7…
      // macOS 上 Alt+数字会产生特殊字符，故用 event.code 而非 event.key
      if (event.altKey) {
        const match = /^Digit([0-9])$/.exec(event.code || '');
        if (match) {
          const tabs = stateRef.current.tabs || [];
          if (tabs.length <= 1) return;
          // 0→倒数第1，9→倒数第2，8→倒数第3 …（键盘上从 0 往左依次对应）
          const digit = Number(match[1]);
          const fromRight = digit === 0 ? 1 : 11 - digit;
          const index = tabs.length - fromRight;
          if (index >= 0 && index < tabs.length) {
            event.preventDefault();
            handleTabChange(tabs[index].key);
          }
          return;
        }
      }

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          // 逐层退出：评论 → 菜单 → 返回作品墙
          if (isCommentOpen) setCommentOpen(false);
          else if (isMenuOpen) setMenuOpen(false);
          else router.push('/portfolio');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          goPrevPage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goNextPage();
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (nb.prev) goProject(nb.prev.slug, { motionDir: 'prev' });
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (nb.next) goProject(nb.next.slug, { motionDir: 'next' });
          break;
        case 'c':
        case 'C':
          // 与 ThemeToggle 的 Shift+C 区分，避免误触
          if (event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) return;
          event.preventDefault();
          setCommentOpen((prev) => !prev);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [router, goPrevPage, goNextPage, goProject, handleTabChange]);

  if (!project) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4">
          <p className="font-regular text-[15px] text-tertiary">项目不存在</p>
          <button
            type="button"
            onClick={() => router.push('/portfolio')}
            className="font-regular text-[14px] text-secondary underline underline-offset-4 hover:text-main"
          >
            返回作品集
          </button>
        </div>
      </div>
    );
  }

  const projectTitle = pickLocale(project.title, language);
  const targetPath = getCommentTargetPath(project.slug);

  return (
    <div className="relative h-screen w-full flex flex-col bg-bg overflow-hidden">
      {/* 顶部：目录按钮 + 标题 + tabs */}
      <header className="absolute inset-x-0 top-0 z-20 isolate px-6 md:px-16 pt-6 md:pt-8 pb-2 pointer-events-auto">
        {/* 移动端渐变遮罩：帧会滚到 header 下方，纯文字会失去对比度。
            自上而下由背景色淡出，与 footer 的同款渐变方向相反。
            桌面端帧不会滚动到此处，无需遮罩。 */}
        <div
          aria-hidden="true"
          className="md:hidden absolute inset-x-0 top-0 h-[160%] -z-10 pointer-events-none bg-gradient-to-b from-bg via-bg/90 to-transparent"
        />
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <MenuButton onClick={() => setMenuOpen((prev) => !prev)} active={menuOpen} />
            <h1 className="font-Ding text-[20px] md:text-[24px] leading-[31px] text-main truncate">
              {projectTitle}
            </h1>
            <span className="font-regular text-[14px] md:text-[16px] leading-[24px] text-tertiary shrink-0">
              {project.period}
            </span>
          </div>

          {/* tabs：有则显示，无（或仅一个）则隐藏 */}
          {project.tabs?.length > 1 ? (
            <nav className="hidden md:flex items-center gap-1 shrink-0">
              {project.tabs.map((tab, index) => {
                // 快捷键与「从右往左数」的顺位绑定：最右 alt+0，往左 alt+9、alt+8…
                const fromRight = project.tabs.length - index;
                const digit = fromRight === 1 ? 0 : 11 - fromRight;
                return (
                  <div key={tab.key} className="flex items-center gap-1">
                    {index > 0 ? (
                      <span className="font-regular text-[16px] leading-[24px] text-tertiary">
                        /
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => handleTabChange(tab.key)}
                      title={`Alt + ${digit}`}
                      className={`px-3 py-1 rounded-[8px] font-regular text-[16px] leading-[24px] transition-colors duration-150 ${
                        activeTab === tab.key
                          ? 'text-main'
                          : 'text-tertiary hover:text-secondary'
                      }`}
                    >
                      {pickLocale(tab.label, language)}
                    </button>
                  </div>
                );
              })}
            </nav>
          ) : null}
        </div>

        {/* 菜单浮层：仅桌面端；移动端改用底部抽屉（见组件末尾 MobileDrawer） */}
        <div className="hidden md:block absolute top-[60px] left-6 md:left-16">
          <ProjectMenu
            groups={groups}
            currentSlug={slug}
            open={menuOpen && !isMobile}
            onSelect={(targetSlug) => {
              setMenuOpen(false);
              goProject(targetSlug);
            }}
            onClose={() => setMenuOpen(false)}
          />
        </div>
      </header>

      {/* 主体：横向 PPT 滚动（激活页居中放大，两侧页缩小半透明）
           移动端：纵向排列，无虚化，无大小变化 */}
      <main
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDragStart={(e) => e.preventDefault()}
        className={`flex-1 min-h-0 flex items-start md:items-center touch-pan-y pt-[72px] pb-[76px] overflow-y-auto overflow-x-hidden md:overflow-hidden no-scrollbar ${
          dragging ? 'cursor-grabbing select-none' : ''
        }`}
      >
        <div
          ref={trackRef}
          className={`w-full md:w-auto flex ${
            !isMobile && disableTrackTransition
              ? enterDir === 'next'
                ? 'items-end'
                : 'items-start'
              : 'items-center'
          } md:gap-6 will-change-transform ${
            dragging || disableTrackTransition ? '' : 'transition-transform duration-500 ease-out'
          }`}
          style={{ transform: `translateX(${trackOffset + dragOffset}px)` }}
        >
          {/* PC 端横向滚动 */}
          <div className="hidden md:flex items-center gap-6">
            {frames.map((frame, index) => {
              const isActive = index === activeIndex;
              // 图片类 frame：比例取自图片文件本身（见 useImageRatios），外框据此贴合，
              // 无需在 JSON 里维护尺寸。非图片类（原型 / 图文）无固有比例，沿用固定视口尺寸。
              const ratio = frame.type === 'image' ? imageRatios[frame.src] : null;
              // 高度以舞台实际可用高度为基准：活跃帧填满，非活跃帧按 STAGE_SHRINK 缩小。
              // 宽度取「高度换算值」与「宽度上限」的较小者，再由 aspect-ratio 反推，
              // 保证任一维度触顶时都等比缩放、比例不失真。
              const hPx = stageH ? stageH * (isActive ? 1 : STAGE_SHRINK) : 0;
              // 宽度上限：宽图（16:9 等）填满舞台高度所需的宽度往往超出视口，
              // 此时宽度成为主约束、高度被 aspect-ratio 反推压小，舞台上下就会留白。
              // 故上限尽量放宽，仅保留一点余量让两侧邻帧露出可点提示。
              const vw = isActive ? 92 : 74;
              const sizeStyle = ratio
                ? hPx
                  ? // 宽度取「填满舞台高度所需宽度」与「视口宽度上限」的较小者，
                    // 高度由 aspect-ratio 反推 —— 任一维度触顶都等比缩放，比例不失真
                    {
                      width: `min(${(hPx * ratio).toFixed(2)}px, ${vw}vw)`,
                      aspectRatio: String(ratio),
                    }
                  : {
                      width: `min(${((isActive ? 68 : 56) * ratio).toFixed(4)}vh, ${vw}vw)`,
                      aspectRatio: String(ratio),
                    }
                : frame.type === 'image'
                  ? // 比例探测完成前：仅占高度，宽度给一个中性值，避免布局塌陷
                    hPx
                    ? { height: `${hPx.toFixed(2)}px`, width: `${(hPx * 1.6).toFixed(2)}px` }
                    : { height: '68vh', width: '108.8vh' }
                  : undefined;
              return (
                <section
                  key={frame.id}
                  id={frame.id}
                  ref={(node) => {
                    pcSlideRefs.current[index] = node;
                  }}
                  data-frame-index={index}
                  style={sizeStyle}
                  className={`shrink-0 rounded-[12px] overflow-hidden bg-card ring-1 ring-stroke transition-all duration-500 ease-out ${
                    dragging ? 'cursor-grabbing' : isActive ? 'cursor-default' : 'cursor-pointer'
                  } ${
                    isActive ? 'opacity-100 shadow-2xl' : 'opacity-50 shadow-lg hover:opacity-75'
                  } ${
                    ratio
                      ? ''
                      : isActive
                        ? 'w-[68vw] h-[68vh]'
                        : 'w-[56vw] h-[56vh]'
                  }`}
                >
                  <FrameRenderer frame={frame} />
                </section>
              );
            })}
          </div>

          {/* 移动端纵向平铺：宽度满铺，高度由图片真实比例决定，无缩放无虚化 */}
          <div className="w-full flex md:hidden flex-col items-stretch gap-3 px-4 py-4">
            {frames.map((frame, index) => {
              const ratio = frame.type === 'image' ? imageRatios[frame.src] : null;
              return (
                <section
                  key={frame.id}
                  id={frame.id}
                  ref={(node) => {
                    mobileSlideRefs.current[index] = node;
                  }}
                  data-frame-index={index}
                  style={ratio ? { aspectRatio: String(ratio) } : undefined}
                  className={`w-full rounded-[12px] overflow-hidden bg-card ring-1 ring-stroke ${
                    ratio ? '' : 'min-h-[40vh]'
                  }`}
                >
                  <FrameRenderer frame={frame} />
                </section>
              );
            })}
          </div>
        </div>
      </main>

      {/* 底部：快捷键 + 主题/语言 */}
      <footer className="absolute inset-x-0 bottom-0 z-20 isolate px-6 md:px-16 pb-6 md:pb-8 pt-2 pointer-events-auto">
        {/* 移动端渐变遮罩：与 header 同款、方向反转（自下而上由背景色淡出） */}
        <div
          aria-hidden="true"
          className="md:hidden absolute inset-x-0 bottom-0 h-[160%] -z-10 pointer-events-none bg-gradient-to-t from-bg via-bg/90 to-transparent"
        />
        {/* 页数轴：absolute 居中于 footer。
            移动端为纯展示 —— 1px 宽的竖条对手指来说热区过小，只读不点。 */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <SlideProgress
            total={frames.length}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
            interactive={!isMobile}
          />
        </div>

        {/* 快捷键说明与主题/语言切换仅桌面端；移动端前者无意义、后者已移入抽屉 */}
        <div className="hidden md:flex items-center justify-between gap-4">
          <ShortcutBar
            onBack={goBack}
            onPrevPage={goPrevPage}
            onNextPage={goNextPage}
            onPrevProject={() => neighbors.prev && goProject(neighbors.prev.slug, { motionDir: 'prev' })}
            onNextProject={() => neighbors.next && goProject(neighbors.next.slug, { motionDir: 'next' })}
            onComment={toggleComment}
          />

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </footer>

      {/* 评论抽屉：C 键唤起，不遮挡 slide 主体 */}
      <aside
        className={`fixed top-0 right-0 h-full w-full md:w-[380px] bg-card border-l border-stroke z-50 transition-transform duration-300 ease-out flex flex-col ${
          commentOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-divider shrink-0">
          <span className="font-Ding text-[16px] leading-[24px] text-main">
            {language === 'en' ? 'Comments' : '评论'}
          </span>
          <button
            type="button"
            aria-label="关闭评论"
            onClick={() => setCommentOpen(false)}
            className="w-7 h-7 rounded-[6px] flex items-center justify-center text-tertiary hover:text-main hover:bg-hover transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path
                d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {commentOpen ? <CommentSection targetPath={targetPath} /> : null}
        </div>
      </aside>

      {/* 移动端底部抽屉：项目切换 + 主题/语言，替代桌面端的菜单浮层与 footer 控件 */}
      <MobileDrawer
        open={menuOpen && isMobile}
        onOpenChange={setMenuOpen}
        groups={groups}
        currentSlug={slug}
        onSelect={(targetSlug) => {
          setMenuOpen(false);
          goProject(targetSlug);
        }}
        onBack={() => {
          setMenuOpen(false);
          goBack();
        }}
      />
    </div>
  );
};

export default ProjectDetail;
