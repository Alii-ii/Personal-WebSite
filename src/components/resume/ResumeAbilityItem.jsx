/**
 * 核心能力条目组件 - 用于展示能力模块
 * 字段：图标、标题、副标题、描述
 */
export default function ResumeAbilityItem({
  icon,
  title,
  subtitle,
  description,
}) {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-xl border border-border bg-bg/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <span className="text-[24px]">{icon}</span>
        <div className="flex flex-col">
          <p className="font-Ding text-[16px] md:text-[18px] text-main opacity-80">
            {title}
          </p>
          <p className="font-regular text-[12px] md:text-[14px] text-tertiary">
            {subtitle}
          </p>
        </div>
      </div>
      <p className="font-regular text-[14px] md:text-[16px] leading-[1.7] text-tertiary">
        {description}
      </p>
    </div>
  );
}
