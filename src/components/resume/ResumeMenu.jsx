"use client";

import AppMenu from '@/components/AppMenu';
import ResumeContactActions from '@/components/resume/ResumeContactActions';

export default function ResumeMenu({ open, onClose, sections }) {
  const navigateToSection = (id) => {
    onClose();
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <AppMenu
      open={open}
      onClose={onClose}
      footerActions={<ResumeContactActions menu />}
    >
      <nav className="flex flex-col gap-1 overflow-y-auto" aria-label="简历节点目录">
        <div className="p-2 pb-1">
          <span className="font-regular text-[14px] leading-[24px] text-tertiary">
            节点目录
          </span>
        </div>
        <div className="flex flex-col gap-1 pb-2">
          {sections.map(({ id, title }) => (
            <button
              key={id}
              type="button"
              onClick={() => navigateToSection(id)}
              className="w-full flex flex-row items-start gap-1 py-1.5 px-2 rounded-[8px] text-left transition-colors duration-150 active:bg-press hover:bg-hover"
            >
              <span className="w-fit font-regular text-[16px] leading-[24px] text-main truncate">
                {title}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </AppMenu>
  );
}
