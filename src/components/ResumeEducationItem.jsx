/**
 * 教育背景条目组件 - 用于教育经历模块
 * 字段：时间、内容（支持富文本、多行）
 */
export default function ResumeEducationItem({ time, content }) {
  return (
    <div className="flex flex-col gap-3 min-w-[200px] flex-1 opacity-70">
      <p className="font-regular text-[18px] md:text-[20px] leading-none text-tertiary">
        {time}
      </p>
      <div className="font-Ding text-[20px] md:text-[24px] leading-[1.3] text-main">
        {content}
      </div>
    </div>
  );
}
