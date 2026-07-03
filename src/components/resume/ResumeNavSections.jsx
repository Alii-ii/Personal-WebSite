"use client";

import AnimatedContent from '@/effects/AnimatedContent';

/**
 * 履历导航+内容区组件
 * 基于 sections 配置，左侧渲染滚动锚点，右侧渲染 section+h2 结构
 * 使用原生锚点 + scroll-behavior: smooth + scroll-margin-top 实现锚定，最可靠
 * @param {Object} props
 * @param {Array<{ id: string, title: string, content: ReactNode }>} props.sections - 区块配置
 * @param {ReactNode} props.sidebar - 左侧 aside 顶部内容（如姓名等）
 */
export default function ResumeNavSections({
  sections,
  sidebar,
}) {
  return (
    <div className="w-full max-w-[960px] flex flex-col md:flex-row gap-10 md:gap-[64px]">
      {/* 左侧导航 */}
      <aside className="w-full md:w-[240px] flex flex-col gap-8 sticky top-[80px] self-start">
        {sidebar}
        <nav
          className="flex flex-col gap-2 text-[16px] md:text-[18px] text-tertiary"
          aria-label="Resume sections"
        >
          {sections.map(({ id, title }) => (
            <a
              key={id}
              href={`#${id}`}
              className="w-fit hover:text-main transition-colors"
            >
              {title}
            </a>
          ))}
        </nav>
      </aside>

      {/* 右侧内容区 */}
      <main className="flex-1 flex flex-col gap-10 md:gap-12">
        {sections.map(({ id, title, content }, index) => (
          <AnimatedContent
            key={id}
            direction="vertical"
            reverse={false}
            distance={24}
            duration={0.5}
            delay={index * 0.04}
            threshold={0.05}
          >
            <section
              id={id}
              className="flex flex-col gap-6 scroll-mt-[80px] text-[16px] md:text-[18px]"
            >
              <h2 className="font-Ding text-[28px] md:text-[32px] leading-[1.5] tracking-[-1.6px] text-main opacity-80 mt-4">
                {title}
              </h2>
              {content}
            </section>
          </AnimatedContent>
        ))}
      </main>
    </div>
  );
}
