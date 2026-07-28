"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocale } from '@/contexts/ProjectContext';

/**
 * L3 项目菜单浮层
 * 对应设计稿 menu/project：320w，r12，pad 8，gap 2，半透明 + 背景模糊
 * 分组（产品项目 / 文章随笔 / Side Project）与 L2 左栏分类共用同一份 categories schema
 *
 * @param {Array} groups - getProjectsByCategory() 结果
 * @param {string} currentSlug - 当前项目
 * @param {boolean} open - 是否展开（默认收起）
 * @param {Function} onSelect - 选中项目回调
 * @param {Function} onClose - 关闭回调
 */
const ProjectMenu = ({ groups = [], currentSlug, open, onSelect, onClose }) => {
  const { language } = useLanguage();

  if (!open) return null;

  return (
    <>
      {/* 点击空白处关闭 */}
      <div className="fixed inset-0 z-30" onClick={onClose} />

      <div className="absolute top-0 left-0 z-40 w-[320px] max-h-[70vh] overflow-y-auto rounded-[12px] bg-card/90 backdrop-blur-xl border border-stroke shadow-xl p-2 flex flex-col gap-0.5">
        {groups.map((group) => (
          <div key={group.key} className="flex flex-col gap-0.5">
            {/* 分组标题 */}
            <div className="px-2.5 py-1">
              <span className="font-regular text-[14px] leading-[24px] text-tertiary">
                {pickLocale(group.label, language)}
              </span>
            </div>

            {/* 分组下的项目 */}
            <div className="flex flex-col gap-0.5 pb-1">
              {group.projects.map((project) => {
                const isActive = project.slug === currentSlug;
                return (
                  <button
                    key={project.slug}
                    type="button"
                    onClick={() => onSelect?.(project.slug)}
                    className={`w-full flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-left transition-colors duration-150 ${
                      isActive ? 'bg-hover' : 'hover:bg-hover/60'
                    }`}
                  >
                    <span className="flex-1 font-regular text-[14px] leading-[24px] text-main truncate">
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
      </div>
    </>
  );
};

export default ProjectMenu;
