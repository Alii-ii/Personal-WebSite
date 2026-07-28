"use client";

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocale } from '@/contexts/ProjectContext';
import { MailIcon, ChatsIcon, BilibiliIcon, FigmaIcon, GlobeIcon } from '@/public/icons';

/**
 * 侧栏分隔位（隐藏横线，仅保留原分割线占位的间距）
 */
const Divider = () => <div className="w-[192px] h-px" aria-hidden="true" />;

/**
 * 社交图标按钮（24×24，r6）
 * 默认去色，hover 时还原品牌色
 */
const IconButton = ({ children, label, onClick }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="w-6 h-6 rounded-[6px] flex items-center justify-center text-secondary hover:text-main hover:bg-hover transition-all duration-200 grayscale hover:grayscale-0"
  >
    {children}
  </button>
);

/**
 * 展开箭头（随展开状态旋转）
 */
const ArrowIcon = ({ expanded }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    className={`text-tertiary transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
  >
    <path
      d="M5.47 7.47a.75.75 0 0 1 1.06 0L10 10.94l3.47-3.47a.75.75 0 1 1 1.06 1.06l-4 4a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 0 1 0-1.06Z"
      fill="currentColor"
    />
  </svg>
);

/**
 * L2 左侧固定栏
 * 对应设计稿 name 区（352w，padding 64/80，gap 16）
 * 分类与 L3 菜单分组共用同一份 categories schema
 *
 * @param {Array} groups - getProjectsByCategory() 结果
 * @param {string|null} activeCategory - 当前筛选的分类 key，null 表示全部
 * @param {Function} onCategoryChange - 点击分类回调
 * @param {Object} expandedMap - { [categoryKey]: boolean } 展开状态
 * @param {Function} onToggleExpand - 展开/收起回调
 */
const PortfolioSidebar = ({
  groups = [],
  activeCategory = null,
  onCategoryChange,
  expandedMap = {},
  onToggleExpand,
}) => {
  const { language } = useLanguage();
  const router = useRouter();

  return (
    <aside className="w-full md:w-[352px] shrink-0 flex flex-col gap-4 px-6 md:px-16 pt-8 md:pt-20 pb-4 md:sticky md:top-0 md:self-start md:max-h-screen md:overflow-y-auto">
      {/* 姓名 */}
      <div className="flex flex-col gap-2">
        <h1 className="font-Ding text-[40px] md:text-[64px] leading-[1] text-main">黄奕礼</h1>
        <p className="font-Ding text-[20px] md:text-[24px] leading-[1] text-main">Alii / 阿礼</p>
      </div>

      <Divider />

      {/* 社交图标 */}
      <div className="flex items-center gap-1.5">
        <IconButton label="Figma" onClick={() => window.open('https://www.figma.com/@alii', '_blank')}>
          <FigmaIcon className="w-4 h-4" />
        </IconButton>
        <IconButton label="Bilibili" onClick={() => window.open('https://space.bilibili.com', '_blank')}>
          <BilibiliIcon className="w-4 h-4" />
        </IconButton>
        <IconButton label="Mail" onClick={() => window.open('mailto:772984045@qq.com')}>
          <MailIcon className="w-4 h-4" />
        </IconButton>
        <div className="w-px h-3 bg-divider mx-1.5" />
        <IconButton label="Chats">
          <ChatsIcon className="w-4 h-4" />
        </IconButton>
        <IconButton label="Site" onClick={() => router.push('/')}>
          <GlobeIcon className="w-4 h-4" />
        </IconButton>
      </div>

      <Divider />

      {/* 分类：点标题筛选（再点一次取消筛选），点箭头展开项目列表 */}
      <nav className="flex flex-col gap-1">
        {groups.map((group) => {
          const isActive = activeCategory === group.key;
          const isExpanded = !!expandedMap[group.key];

          return (
            <div key={group.key} className="flex flex-col">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onCategoryChange?.(isActive ? null : group.key)}
                  className={`font-Ding text-[18px] leading-[26px] transition-colors duration-200 ${
                    isActive ? 'text-main' : 'text-tertiary hover:text-secondary'
                  }`}
                >
                  {pickLocale(group.label, language)}
                </button>
                <button
                  type="button"
                  aria-label="toggle"
                  aria-expanded={isExpanded}
                  onClick={() => onToggleExpand?.(group.key)}
                  className="w-5 h-5 flex items-center justify-center"
                >
                  <ArrowIcon expanded={isExpanded} />
                </button>
              </div>

              {/* 展开后列出该分类下的项目，可直达 L3 */}
              {isExpanded ? (
                <div className="flex flex-col gap-0.5 pl-1 pt-1 pb-1">
                  {group.projects.map((project) => (
                    <button
                      key={project.slug}
                      type="button"
                      onClick={() => router.push(`/portfolio/${project.slug}`)}
                      className="group flex items-baseline gap-2 text-left py-0.5"
                    >
                      <span className="font-regular text-[13px] leading-[20px] text-secondary group-hover:text-main transition-colors duration-200 truncate">
                        {pickLocale(project.title, language)}
                      </span>
                      <span className="font-regular text-[12px] leading-[18px] text-disabled shrink-0">
                        {project.period}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default PortfolioSidebar;
