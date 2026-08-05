"use client";

// 项目详情底部快捷栏：提供返回、翻页、切项目和评论操作的键盘提示与点击入口。
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * 单个按键胶囊（对应设计稿 unit/shortCut，20×20 / ESC 32×20，r4，无描边）
 */
const Key = ({ children, wide = false, onClick, title }) => {
  const base = `inline-flex items-center justify-center h-5 rounded-[4px] bg-press font-regular text-[11px] leading-none text-tertiary ${
    wide ? 'px-1.5' : 'w-5'
  }`;

  if (!onClick) return <span className={base}>{children}</span>;

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`${base} hover:bg-hover hover:text-main transition-colors duration-150 cursor-pointer`}
    >
      {children}
    </button>
  );
};

const Divider = () => <span className="w-px h-2 mx-1" />;

const Label = ({ children }) => (
  <span className="font-regular text-[12px] leading-[18px] text-tertiary ml-1">{children}</span>
);

/**
 * L3 底部快捷键提示条
 * 对应设计稿 footer 左侧：ESC 返回 / ←→ 切换页面 / ↑↓ 切换项目 / C 评论
 *
 * 非 absolute：落在 footer 的 flex 左槽；中间页数轴才是 absolute 居中。
 * 窄屏依次隐藏（先藏优先项）：↑↓ → ←→ → ESC → C
 *
 * 鼠标点击路径：
 *   - 返回、评论：符号与文字整体可点
 *   - 切换页面、切换项目：仅符号可点，文字不可点
 * 移动端隐藏（无键盘）
 */
const ShortcutBar = ({
  availableWidth = Number.POSITIVE_INFINITY,
  onBack,
  onPrevPage,
  onNextPage,
  onPrevProject,
  onNextProject,
  onComment,
}) => {
  const { language } = useLanguage();
  const label = {
    back: language === 'en' ? 'Back' : '返回',
    page: language === 'en' ? 'Page' : '切换页面',
    project: language === 'en' ? 'Project' : '切换项目',
    comment: language === 'en' ? 'Comment' : '评论',
  };

  // Footer 会被评论抽屉真实挤压，因此按其左侧安全区而非 viewport
  // 决定缩减级别，并给中间进度条保留不重叠的空间。
  const showBack = availableWidth >= 128;
  const showPage = availableWidth >= 244;
  const showProject = availableWidth >= 356;

  return (
    <div className="hidden md:flex items-center gap-1 select-none min-w-0">
      {/* ESC：第三藏，保留优先级高于双向箭头 */}
      <div className={showBack ? 'contents' : 'hidden'}>
        <button
          type="button"
          onClick={onBack}
          title={label.back}
          className="group flex items-center gap-1 rounded-[4px] px-0.5 -mx-0.5 cursor-pointer"
        >
          <span className="inline-flex items-center justify-center h-5 px-1.5 rounded-[4px] bg-press font-regular text-[11px] leading-none text-tertiary group-hover:bg-hover group-hover:text-main transition-colors duration-150">
            ESC
          </span>
          <span className="font-regular text-[12px] leading-[18px] text-tertiary group-hover:text-main transition-colors duration-150 ml-1">
            {label.back}
          </span>
        </button>
        <Divider />
      </div>

      {/* ←→：第二藏 */}
      <div className={showPage ? 'contents' : 'hidden'}>
        <Key onClick={onPrevPage} title={label.page}>
          ←
        </Key>
        <Key onClick={onNextPage} title={label.page}>
          →
        </Key>
        <Label>{label.page}</Label>
        <Divider />
      </div>

      {/* ↑↓：最先藏 */}
      <div className={showProject ? 'contents' : 'hidden'}>
        <Key onClick={onPrevProject} title={label.project}>
          ↑
        </Key>
        <Key onClick={onNextProject} title={label.project}>
          ↓
        </Key>
        <Label>{label.project}</Label>
        <Divider />
      </div>

      {/* C：最后藏；整栏在 md 以下已隐藏 */}
      <button
        type="button"
        onClick={onComment}
        title={label.comment}
        className="group flex items-center gap-1 rounded-[4px] px-0.5 -mx-0.5 cursor-pointer"
      >
        <span className="inline-flex items-center justify-center h-5 w-5 rounded-[4px] bg-press font-regular text-[11px] leading-none text-tertiary group-hover:bg-hover group-hover:text-main transition-colors duration-150">
          C
        </span>
        <span className="font-regular text-[12px] leading-[18px] text-tertiary group-hover:text-main transition-colors duration-150 ml-1">
          {label.comment}
        </span>
      </button>
    </div>
  );
};

export default ShortcutBar;
