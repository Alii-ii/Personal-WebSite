/**
 * 履历条目组件 - 用于工作/实习/项目经历等模块
 * 字段：岗位、tags（平台标签）、公司、时间、描述（支持富文本和换行）
 */
export default function ResumeExperienceItem({
  position,
  tags,
  company,
  time,
  summary,
  description,
}) {
  return (
    <div className="flex flex-col gap-2">
      {/* 岗位 + tags + 公司 + 时间 — 一行展示 */}
      <div className="flex items-center gap-3 flex-nowrap overflow-x-auto">
        <p className="font-Ding text-[20px] md:text-[24px] text-green-stroke opacity-80 whitespace-nowrap">
          {position}
        </p>
        {tags && tags.length > 0 && (
          <div className="flex gap-1.5 shrink-0">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[12px] md:text-[13px] font-regular rounded border border-green-stroke/40 text-green-stroke bg-green-stroke/5 whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <p className="font-Ding text-[20px] md:text-[24px] text-main opacity-80 whitespace-nowrap">
          {company}
        </p>
        <p className="font-regular text-[18px] md:text-[20px] text-tertiary opacity-70 whitespace-nowrap">
          {time}
        </p>
      </div>
      {/* 可选摘要（支持富文本） */}
      {summary && (
        <p className="font-regular text-[14px] md:text-[16px] leading-[1.7] text-tertiary">
          {summary}
        </p>
      )}
      {/* 描述内容（支持富文本、换行、列表等） */}
      {description && (
        <div className="flex flex-col gap-1 text-tertiary text-[14px] md:text-[16px] leading-[1.7] font-regular">
          {description}
        </div>
      )}
    </div>
  );
}
