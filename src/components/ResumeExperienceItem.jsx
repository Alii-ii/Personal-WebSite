/**
 * 履历条目组件 - 用于工作/实习/项目经历等模块
 * 字段：岗位、公司、时间、描述（支持富文本和换行）
 */
export default function ResumeExperienceItem({
  position,
  company,
  time,
  summary,
  description,
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* 岗位 + 公司 + 时间 */}
      <div className="flex flex-wrap items-end gap-4">
        <p className="font-Ding text-[20px] md:text-[24px] text-green-stroke opacity-80">
          {position}
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <p className="font-Ding text-[20px] md:text-[24px] text-main opacity-80">
            {company}
          </p>
          <p className="font-regular text-[16px] md:text-[20px] text-tertiary">
            / {time}
          </p>
        </div>
      </div>
      {/* 可选摘要（支持富文本） */}
      {summary && (
        <p className="font-regular text-[14px] md:text-[16px] leading-[1.7] text-tertiary">
          {summary}
        </p>
      )}
      {/* 描述内容（支持富文本、换行、列表等） */}
      <div className="flex flex-col gap-3 text-tertiary text-[14px] md:text-[16px] leading-[1.7] font-regular">
        {description}
      </div>
    </div>
  );
}
