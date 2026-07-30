"use client";

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import AppMenu from '@/components/AppMenu';
import { buildNavSections } from '@/components/portfolio/PortfolioCompact';

/**
 * PortfolioMenu — 作品集页移动端全屏菜单
 *
 * 基于 AppMenu 通用壳，只注入作品集特有的目录内容。
 * 数据通过 buildNavSections 构建，与 sidebar 共享同一份逻辑。
 *
 * @param {boolean}  open    - 是否打开
 * @param {Function} onClose - 关闭回调
 * @param {Array}    groups  - getProjectsByCategory() 结果
 */
const PortfolioMenu = ({ open, onClose, groups = [] }) => {
  const { language, t } = useLanguage();
  const router = useRouter();

  const navigate = useCallback((href) => {
    onClose();
    router.push(href);
  }, [onClose, router]);

  const sections = useMemo(
    () => buildNavSections(groups, language, t, false),
    [groups, language, t],
  );

  return (
    <AppMenu open={open} onClose={onClose}>
      <nav className="flex flex-col gap-1 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.key} className="flex flex-col">
            <div className="p-2 pb-1">
              <span className="font-regular text-[14px] leading-[24px] text-tertiary">
                {section.label}
              </span>
            </div>

            <div className="flex flex-col gap-1 pb-2">
              {section.items.map((item) =>
                item.external ? (
                  <a
                    key={item.key}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex flex-row items-start gap-1 py-1.5 px-2 rounded-[8px] text-left transition-colors duration-150 active:bg-press hover:bg-hover"
                  >
                    <span className="w-fit font-regular text-[16px] leading-[24px] text-main truncate">
                      {item.label}
                    </span>
                  </a>
                ) : (
                  <button
                    key={item.key}
                    type="button"
                    disabled={item.disabled}
                    onClick={item.disabled ? undefined : () => navigate(item.href)}
                    className={`w-full flex flex-row items-start gap-1 py-1.5 px-2 rounded-[8px] text-left transition-colors duration-150 ${item.disabled ? 'cursor-default' : 'active:bg-press hover:bg-hover'}`}
                  >
                    <span className={`w-fit font-regular text-[16px] leading-[24px] truncate ${item.disabled ? 'text-disabled' : 'text-main'}`}>
                      {item.label}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </nav>
    </AppMenu>
  );
};

export default PortfolioMenu;
