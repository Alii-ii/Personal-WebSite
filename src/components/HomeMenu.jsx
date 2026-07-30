"use client";

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TextLink from '@/components/TextLink';
import { useLanguage } from '@/contexts/LanguageContext';
import AppMenu from '@/components/AppMenu';

/**
 * HomeMenu — 首页全屏菜单
 *
 * 基于 AppMenu 通用壳，只注入首页特有的导航链接内容。
 */
const HomeMenu = ({ open, onClose }) => {
  const { t } = useLanguage();
  const router = useRouter();

  const navigate = useCallback((href) => {
    onClose();
    router.push(href);
  }, [onClose, router]);

  return (
    <AppMenu open={open} onClose={onClose}>
      {/* 导航链接 */}
      <div className="flex flex-col items-end gap-6">
        <TextLink
          href="/resume"
          title={t('resumeTooltip')}
          target="_self"
          onClick={(e) => { e.preventDefault(); navigate('/resume'); }}
        >
          {t('resume')}
        </TextLink>
        <TextLink
          href="/portfolio"
          title={t('portfolioTooltip')}
          target="_self"
          onClick={(e) => { e.preventDefault(); navigate('/portfolio'); }}
        >
          {t('portfolio')}
        </TextLink>
        <TextLink
          href="https://www.miyoushe.com/zzz/accountCenter/postList?id=196941437"
          title={t('mainSiteTooltip')}
        >
          {t('mainSite')}
        </TextLink>
      </div>
    </AppMenu>
  );
};

export default HomeMenu;
