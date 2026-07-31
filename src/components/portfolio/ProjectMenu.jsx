"use client";

import UnfoldPanel from '@/components/motion/unfold-panel';
import { useLanguage } from '@/contexts/LanguageContext';
import { hasProjectPage, pickLocale } from '@/contexts/ProjectContext';

/**
 * L3 项目菜单浮层
 * 对应设计稿 menu/project：320w，r12，pad 8，gap 2，半透明 + 背景模糊
 * 分组（产品项目 / 文章随笔 / Side Project）与 L2 左栏分类共用同一份 categories schema
 *
 * 展开 / 收起动效由通用的 UnfoldPanel 提供：面板从左上角（贴近触发按钮的一侧）
 * 以 clip-path 揭开，收起时原路折回。
 *
 * ESC 不由本组件处理 —— ProjectDetail 有「评论 → 菜单 → 返回作品墙」的逐层退出，
 * 若此处再拦一层，同一次按键会被两处争抢。点遮罩关闭仍然保留。
 *
 * @param {Array} groups - getProjectsByCategory() 结果
 * @param {string} currentSlug - 当前项目
 * @param {boolean} open - 是否展开（默认收起）
 * @param {Function} onSelect - 选中项目回调
 * @param {Function} onClose - 关闭回调
 */
const ProjectMenu = ({ groups = [], currentSlug, open, onSelect, onClose }) => {
  const { language } = useLanguage();

  return (
    <UnfoldPanel
      open={open}
      onClose={onClose}
      origin="top-left"
      radius={12}
      ariaLabel="项目菜单"
      dismissOnEscape={false}
      className="absolute top-2 left-[-8px] z-40 w-[320px] max-h-[70vh] overflow-y-auto rounded-[12px] bg-card/60 backdrop-blur-[6px] border border-stroke shadow-xl p-2 flex flex-col gap-0.5"
    >
      {groups.map((group) => (
        <div key={group.key} className="flex flex-col gap-0.5">
          {/* 分组标题 */}
          <div className="px-2.5 pt-0.5">
            <span className="font-regular text-[14px] leading-[24px] text-tertiary">
              {pickLocale(group.label, language)}
            </span>
          </div>

          {/* 分组下的项目 */}
          <div className="flex flex-col gap-0.5 pb-1">
            {group.projects.map((project) => {
              const isActive = project.slug === currentSlug;
              const disabled = !hasProjectPage(project);
              return (
                <button
                  key={project.slug}
                  type="button"
                  disabled={disabled}
                  onClick={disabled ? undefined : () => onSelect?.(project.slug)}
                  className={`w-full flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-left transition-colors duration-150 ${
                    disabled ? 'cursor-default' : isActive ? 'bg-press' : 'hover:bg-hover/60'
                  }`}
                >
                  <span className={`flex-1 font-regular text-[14px] leading-[24px] truncate ${disabled ? 'text-disabled' : 'text-main'}`}>
                    {pickLocale(project.title, language)}
                  </span>
                  <span className="font-regular text-[14px] leading-[24px] text-tertiary shrink-0">
                    {project.period}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </UnfoldPanel>
  );
};

export default ProjectMenu;
