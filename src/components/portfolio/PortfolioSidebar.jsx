"use client";

import CopyEmailButton from '@/components/CopyEmailButton';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocale } from '@/contexts/ProjectContext';
import { ChatsIcon, BilibiliIcon, FigmaIcon, XiaohongshuIcon } from '@/public/icons';

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
    <aside className="w-full md:w-[360px] shrink-0 self-start">
      {/* 桌面端直接改为 fixed，并保留外层同宽占位，避免 sticky 被祖先布局影响 */}
      <div className="flex flex-col gap-4 px-6 md:px-16 pt-8 md:pt-20 pb-4 md:fixed md:top-0 md:left-0 md:w-[352px] md:h-screen md:overflow-y-auto md:z-10">
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

          <IconButton label="Bilibili" onClick={() => window.open('https://space.bilibili.com/38773851/upload/video', '_blank')}>
            <BilibiliIcon className="w-4 h-4" />
          </IconButton>

          <IconButton label="小红书" onClick={() => window.open('https://www.xiaohongshu.com/user/profile/60877ccc000000000101c324', '_blank')}>
            <XiaohongshuIcon className="w-4 h-4" />
          </IconButton>

          <IconButton label="Chats">
            <ChatsIcon className="w-4 h-4" />
          </IconButton>

          <CopyEmailButton appearance="sidebar" />
        </div>

        <Divider />

        {/* 分类：点标题筛选（再点一次取消筛选），点箭头展开项目列表 */}
        <nav className="flex flex-col gap-1">
          {groups.map((group) => {
            const isActive = activeCategory === group.key;

            return (
              <div key={group.key} className="flex flex-col ml-[-6px]">
                {/* 分类标题:没有多类型，暂时隐藏 */}
                {/* <div className="px-2.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => onCategoryChange?.(isActive ? null : group.key)}
                    className="font-regular text-[14px] leading-[24px] text-tertiary transition-colors duration-150 hover:text-secondary"
                  >
                    {pickLocale(group.label, language)}
                  </button>
                </div> */}

                {/* 项目列表：对齐 L3 menu */}
                <div className="flex flex-col gap-1 pb-1">
                  {group.projects.map((project) => (
                    <button
                      key={project.slug}
                      type="button"
                      onClick={() => router.push(`/portfolio/${project.slug}`)}
                      className="w-full flex flex-row items-start gap-1 px-2.5 py-1 rounded-[8px] text-left transition-colors duration-150 hover:bg-hover"
                    >
                      <span className="w-fit font-regular text-[14px] leading-[24px] text-main truncate">
                        {pickLocale(project.title, language)}
                      </span>
                      <span className="font-regular text-[14px] leading-[24px] text-tertiary opacity-50">
                        {project.period}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default PortfolioSidebar;
