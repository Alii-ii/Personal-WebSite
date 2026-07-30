"use client";

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocale } from '@/contexts/ProjectContext';
import AppMenu from '@/components/AppMenu';

/**
 * PortfolioMenu — 作品集页移动端全屏菜单
 *
 * 基于 AppMenu 通用壳，只注入作品集特有的项目目录 + 文章随笔内容。
 * 两者结构相同（标题 + 子项列表），统一为 sections 数组一次遍历。
 *
 * @param {boolean}  open         - 是否打开
 * @param {Function} onClose      - 关闭回调
 * @param {Array}    groups       - getProjectsByCategory() 结果
 * @param {Array}    writingItems - 文章随笔列表 [{ title, url }]
 */
const PortfolioMenu = ({ open, onClose, groups = [], writingItems = [] }) => {
  const { language } = useLanguage();
  const router = useRouter();

  const navigate = useCallback((href) => {
    onClose();
    router.push(href);
  }, [onClose, router]);

  // 将 groups + writingItems 统一为 sections: [{ key, label, items }]
  // 每个 item: { key, label, href, external }
  const sections = useMemo(() => {
    const result = groups.map((group) => ({
      key: group.key,
      label: pickLocale(group.label, language),
      items: group.projects.map((p) => ({
        key: p.slug,
        label: pickLocale(p.title, language),
        href: `/portfolio/${p.slug}`,
        external: false,
      })),
    }));

    if (writingItems.length > 0) {
      result.push({
        key: '__writing',
        label: '文章随笔',
        items: writingItems.map((item, idx) => ({
          key: `writing-${idx}`,
          label: item.title,
          href: item.url,
          external: true,
        })),
      });
    }

    return result;
  }, [groups, writingItems, language]);

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
                    onClick={() => navigate(item.href)}
                    className="w-full flex flex-row items-start gap-1 py-1.5 px-2 rounded-[8px] text-left transition-colors duration-150 active:bg-press hover:bg-hover"
                  >
                    <span className="w-fit font-regular text-[16px] leading-[24px] text-main truncate">
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
