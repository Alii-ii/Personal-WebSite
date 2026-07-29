// Shared motion tokens from beui.dev
// Easing curves mirror CSS custom properties; springs are canonical physics.

export const EASE_OUT = [0.16, 1, 0.3, 1];
export const EASE_IN_OUT = [0.77, 0, 0.175, 1];
export const EASE_DRAWER = [0.32, 0.72, 0, 1];

/**
 * 面板展开（clip-path unfold）专用曲线。
 * 复杂的 clip-path 字符串在 spring 收敛末端容易跳变，故用固定时长的 tween：
 * 整段时间都读作「表面在展开」，而不是提前结束、最后几帧在磨圆角。
 */
export const EASE_UNFOLD = [0.2, 0, 0.2, 1];

/** 展开动效的标准过渡（配合 EASE_UNFOLD 使用） */
export const TRANSITION_UNFOLD = { duration: 0.43, ease: EASE_UNFOLD };

/** CSS string form of EASE_OUT for inline style transitions. */
export const EASE_OUT_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";

/** Press feedback on buttons and other tappable surfaces. */
export const SPRING_PRESS = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.6,
};

/** Content swaps — label/icon slots trading places inside a control. */
export const SPRING_SWAP = {
  type: "spring",
  stiffness: 460,
  damping: 30,
  mass: 0.55,
};

/** Overlay panel entrances — modals and sheets summoned by pointer. */
export const SPRING_PANEL = {
  type: "spring",
  stiffness: 420,
  damping: 40,
  mass: 0.5,
};

/** Shared-layout glides — pills, indicators and panels morphing between positions. */
export const SPRING_LAYOUT = {
  type: "spring",
  stiffness: 360,
  damping: 32,
  mass: 0.6,
};

/** Cursor-follow physics for decorative mouse tracking (magnetic, tilt, dock). */
export const SPRING_MOUSE = {
  stiffness: 200,
  damping: 15,
  mass: 0.3,
};
