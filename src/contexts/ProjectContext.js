/**
 * 作品集项目数据层
 * 数据源: src/data/portfolio.json
 *
 * 设计要点：projects[].frames 是唯一内容源，存在两种投影
 *   - L2 /portfolio        : 把所有项目的 frame 平铺成作品墙
 *   - L3 /portfolio/[slug] : 按 tab 分组，横向 PPT 式展示
 * 因此这里同时提供「按项目取」和「平铺取」两类读取函数。
 */
import portfolioData from '@/data/portfolio.json';

const categories = portfolioData.categories;
const projects = portfolioData.projects;

/** 固定 seed，保证 SSR/CSR 顺序一致，避免 hydration mismatch */
const FEED_SHUFFLE_SEED = 'portfolio-feed-v1';

const createSeededRandom = (seedText) => {
  let seed = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    seed ^= seedText.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }

  return () => {
    seed += 0x6d2b79f5;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * 取多语言字段，兼容纯字符串写法
 * @param {Object|string} field - { zh, en } 或字符串
 * @param {string} language - 'zh' | 'en'
 * @returns {string}
 */
export const pickLocale = (field, language = 'zh') => {
  if (field == null) return '';
  if (typeof field === 'string') return field;
  return field[language] ?? field.zh ?? field.en ?? '';
};

/**
 * 获取全部分类
 * @returns {Array} 分类数组
 */
export const getCategories = () => categories;

/**
 * 获取全部项目
 * @returns {Array} 项目数组
 */
export const getProjects = () => projects;

/**
 * 项目是否拥有可进入 L3 的内容页。
 * frames 是唯一内容源：至少有一个 frame 才允许生成路由或触发导航。
 * disabled 继续作为人工总开关，便于内容临时下线。
 * @param {Object} project - 项目对象
 * @returns {boolean}
 */
export const hasProjectPage = (project) =>
  Boolean(project && !project.disabled && Array.isArray(project.frames) && project.frames.length > 0);

/**
 * 按分类分组的项目（用于 L2 左栏与 L3 菜单，二者共用同一 schema）
 * @returns {Array<{ key, label, projects }>}
 */
export const getProjectsByCategory = () =>
  categories
    .map((category) => {
      const grouped = projects.filter((project) => project.category === category.key);
      const ordered = [...grouped].sort((a, b) => {
        const ao = Number.isFinite(a.order) ? a.order : Number.MAX_SAFE_INTEGER;
        const bo = Number.isFinite(b.order) ? b.order : Number.MAX_SAFE_INTEGER;
        return ao - bo;
      });

      return {
        ...category,
        projects: ordered,
      };
    })
    .filter((group) => group.projects.length > 0);

/**
 * 根据 slug 获取单个项目
 * @param {string} slug - 项目稳定标识
 * @returns {Object|null}
 */
export const getProjectBySlug = (slug) =>
  projects.find((project) => project.slug === slug) || null;

/**
 * 获取全部 slug（供 generateStaticParams 使用）
 * @returns {Array<string>}
 */
export const getAllProjectSlugs = () =>
  projects.filter(hasProjectPage).map((project) => project.slug);

/**
 * L2 作品墙数据：把所有项目的 frame 平铺，并回填所属项目信息
 * 每个 feed item 携带 projectSlug，点击即可下钻到 L3 并定位到该 frame
 * @param {Object} options
 * @param {string} [options.category] - 仅取某个分类
 * @param {boolean} [options.shuffle=true] - 是否按固定 seed 洗牌
 * @returns {Array} feed item 数组
 */
export const getFeedFrames = ({ category, shuffle = true } = {}) => {
  const pageProjects = projects.filter(hasProjectPage);
  const source = category
    ? pageProjects.filter((project) => project.category === category)
    : pageProjects;

  const frames = source.flatMap((project) =>
    (project.frames || []).map((frame) => ({
      // Masonry 需要稳定且全局唯一的 id
      id: `${project.slug}__${frame.id}`,
      frameId: frame.id,
      projectSlug: project.slug,
      projectTitle: project.title,
      category: project.category,
      period: project.period,
      tab: frame.tab,
      type: frame.type,
      title: frame.title,
      feed: frame.feed,
      // 图片类保留 img 字段，兼容 Masonry 既有的图片分支与预加载逻辑
      img: frame.type === 'image' ? frame.src : undefined,
      src: frame.src,
      // CDN 主路径失败时回退本地 public/ 副本
      srcLocal: frame.srcLocal,
      alt: frame.alt,
      html: frame.html,
      url: frame.url,
      layout: frame.layout,
      blocks: frame.blocks,
    }))
  );

  if (!shuffle) return frames;

  const shuffled = [...frames];
  const random = createSeededRandom(FEED_SHUFFLE_SEED);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * L3 单项目的 frame 列表（可按 tab 过滤）
 * @param {string} slug - 项目标识
 * @param {string} [tabKey] - tab key，不传则返回全部
 * @returns {Array} frame 数组
 */
export const getProjectFrames = (slug, tabKey) => {
  const project = getProjectBySlug(slug);
  if (!project) return [];
  const frames = project.frames || [];
  return tabKey ? frames.filter((frame) => frame.tab === tabKey) : frames;
};

/**
 * 上一个 / 下一个项目（供 L3 的 ↑↓ 切换项目使用）
 * 排序与 getProjectsByCategory() 一致：按分类顺序 → 组内 order 升序，
 * 确保 L3 的上下切换与 L2 侧栏 / L3 菜单的项目顺序完全一致。
 * @param {string} slug - 当前项目标识
 * @returns {{ prev: Object|null, next: Object|null, index: number }}
 */
export const getProjectNeighbors = (slug) => {
  // 与 getProjectsByCategory 同源：按分类展平为有序列表
  const ordered = getProjectsByCategory()
    .flatMap((group) => group.projects)
    .filter(hasProjectPage);
  const index = ordered.findIndex((project) => project.slug === slug);
  if (index === -1) return { prev: null, next: null, index: -1 };
  return {
    prev: index > 0 ? ordered[index - 1] : null,
    next: index < ordered.length - 1 ? ordered[index + 1] : null,
    index,
  };
};

/**
 * 评论 target_path 约定
 *   项目整体: portfolio/{slug}
 *   单 frame: portfolio/{slug}/{frameId}
 * 必须使用稳定 slug / frameId，禁止使用数组索引
 * @param {string} slug
 * @param {string} [frameId]
 * @returns {string}
 */
export const getCommentTargetPath = (slug, frameId) =>
  frameId ? `portfolio/${slug}/${frameId}` : `portfolio/${slug}`;

export default {
  getCategories,
  getProjects,
  hasProjectPage,
  getProjectsByCategory,
  getProjectBySlug,
  getAllProjectSlugs,
  getFeedFrames,
  getProjectFrames,
  getProjectNeighbors,
  getCommentTargetPath,
  pickLocale,
};
