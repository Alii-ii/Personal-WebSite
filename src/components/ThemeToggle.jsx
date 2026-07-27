"use client";
// Based on beui.dev/components/motion/theme-toggle
// Adapted to preserve existing toggle switch UI + Shift+C shortcut

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useReducedMotion } from "motion/react";
import { ActionSwapIcon } from "@/components/motion/action-swap";

// ---------- View Transition CSS (from beui) ----------
const VT_STYLE_ID = "beui-theme-toggle-vt";

const VT_CSS = `
html[data-beui-vt="rect"]::view-transition-old(root) {
  animation: none;
  mix-blend-mode: normal;
}
html[data-beui-vt="rect"]::view-transition-new(root) {
  mix-blend-mode: normal;
  animation: beui-rect-reveal 400ms ease-out;
}
html[data-beui-vt="circle"]::view-transition-old(root),
html[data-beui-vt="circle-blur"]::view-transition-old(root) {
  animation: none;
  mix-blend-mode: normal;
}
html[data-beui-vt="circle"]::view-transition-new(root) {
  mix-blend-mode: normal;
  animation: beui-circle-reveal 700ms cubic-bezier(0.4, 0, 0.2, 1);
}
html[data-beui-vt="circle-blur"]::view-transition-new(root) {
  mix-blend-mode: normal;
  animation: beui-circle-blur-reveal 700ms cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes beui-rect-reveal {
  from { clip-path: var(--beui-vt-from, inset(100% 0 0 0)); }
  to   { clip-path: inset(0 0 0 0); }
}
@keyframes beui-circle-reveal {
  from { clip-path: circle(0% at var(--beui-vt-origin, 50% 100%)); }
  to   { clip-path: circle(150% at var(--beui-vt-origin, 50% 100%)); }
}
@keyframes beui-circle-blur-reveal {
  from { clip-path: circle(0% at var(--beui-vt-origin, 50% 100%)); filter: blur(8px); }
  to   { clip-path: circle(150% at var(--beui-vt-origin, 50% 100%)); filter: blur(0px); }
}
`;

const RECT_FROM = {
  "top-left": "inset(0 100% 100% 0)",
  "top-right": "inset(0 0 100% 100%)",
  "bottom-left": "inset(100% 100% 0 0)",
  "bottom-right": "inset(100% 0 0 100%)",
  center: "inset(50% 50% 50% 50%)",
  "bottom-up": "inset(100% 0 0 0)",
};

const CIRCLE_ORIGIN = {
  "top-left": "0% 0%",
  "top-right": "100% 0%",
  "bottom-left": "0% 100%",
  "bottom-right": "100% 100%",
  center: "50% 50%",
  "bottom-up": "50% 100%",
};

// ---------- useThemeToggle (from beui, adapted) ----------
function useThemeToggle({
  variant = "rectangle",
  start = "bottom-up",
} = {}) {
  const { setTheme, resolvedTheme } = useTheme();
  const reduce = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (document.getElementById(VT_STYLE_ID)) return;
    const el = document.createElement("style");
    el.id = VT_STYLE_ID;
    el.textContent = VT_CSS;
    document.head.appendChild(el);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const toggle = () => {
    const next = isDark ? "light" : "dark";

    if (reduce || !("startViewTransition" in document)) {
      setTheme(next);
      return;
    }

    const root = document.documentElement;

    if (variant === "rectangle") {
      root.style.setProperty("--beui-vt-from", RECT_FROM[start]);
      root.dataset.beuiVt = "rect";
    } else {
      root.style.setProperty("--beui-vt-origin", CIRCLE_ORIGIN[start]);
      root.dataset.beuiVt = variant;
    }

    const vt = document.startViewTransition(() => setTheme(next));

    vt.finished.finally(() => {
      delete root.dataset.beuiVt;
    });
  };

  return { isDark, mounted, toggle };
}

// ---------- Sun / Moon SVG icons (existing design) ----------
const SunIcon = () => (
  <svg className="w-4 h-4 flex-none" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 6.75C9.10575 6.75 6.75 9.10575 6.75 12C6.75 14.8942 9.10575 17.25 12 17.25C14.8942 17.25 17.25 14.8942 17.25 12C17.25 9.10575 14.8942 6.75 12 6.75ZM12 15.75C9.9285 15.75 8.25 14.0715 8.25 12C8.25 9.9285 9.9285 8.25 12 8.25C14.0715 8.25 15.75 9.9285 15.75 12C15.75 14.0715 14.0715 15.75 12 15.75ZM12 5.25C12.414 5.25 12.75 4.914 12.75 4.5V3C12.75 2.586 12.414 2.25 12 2.25C11.586 2.25 11.25 2.586 11.25 3V4.5C11.25 4.914 11.586 5.25 12 5.25ZM12 18.75C11.586 18.75 11.25 19.086 11.25 19.5V21C11.25 21.414 11.586 21.75 12 21.75C12.414 21.75 12.75 21.414 12.75 21V19.5C12.75 19.086 12.414 18.75 12 18.75ZM17.8328 7.22625L18.8932 6.16575C19.1865 5.8725 19.1865 5.3985 18.8932 5.10525C18.6 4.812 18.126 4.812 17.8328 5.10525L16.7723 6.16575C16.479 6.459 16.479 6.933 16.7723 7.22625C17.0655 7.5195 17.5403 7.5195 17.8328 7.22625ZM6.16725 16.7738L5.10675 17.8342C4.8135 18.1275 4.8135 18.6015 5.10675 18.8948C5.4 19.188 5.874 19.188 6.16725 18.8948L7.22775 17.8342C7.521 17.5402 7.521 17.0662 7.22775 16.7738C6.9345 16.4805 6.45975 16.4798 6.16725 16.7738ZM5.25 12C5.25 11.586 4.914 11.25 4.5 11.25H3C2.586 11.25 2.25 11.586 2.25 12C2.25 12.414 2.586 12.75 3 12.75H4.5C4.914 12.75 5.25 12.414 5.25 12ZM21 11.25H19.5C19.086 11.25 18.75 11.586 18.75 12C18.75 12.414 19.086 12.75 19.5 12.75H21C21.414 12.75 21.75 12.414 21.75 12C21.75 11.586 21.414 11.25 21 11.25ZM6.16575 7.22625C6.459 7.5195 6.93375 7.5195 7.22625 7.22625C7.5195 6.933 7.5195 6.459 7.22625 6.16575L6.16575 5.10525C5.8725 4.812 5.3985 4.812 5.10525 5.10525C4.812 5.3985 4.812 5.8725 5.10525 6.16575L6.16575 7.22625ZM17.8342 16.7723C17.5402 16.479 17.0662 16.479 16.7738 16.7723C16.4805 17.0655 16.4798 17.5395 16.7738 17.8328L17.8342 18.8932C18.1275 19.1865 18.6015 19.1865 18.8948 18.8932C19.188 18.6 19.188 18.126 18.8948 17.8328L17.8342 16.7723Z"
      fill="currentColor"
    />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-4 h-4 flex-none" viewBox="0 0 24 24" fill="none">
    <path
      d="M20.3621 12.0376C20.3621 7.7626 17.1371 4.2001 12.8996 3.7876C12.3138 3.72426 11.905 4.35778 12.1871 4.8751C12.6371 5.6626 12.8621 6.6001 12.8621 7.5001C12.8621 10.5376 10.3871 13.0501 7.31213 13.0501C6.48713 13.0501 5.69964 12.8626 4.94964 12.5251C4.41036 12.2713 3.80423 12.7243 3.89963 13.3126C4.49964 17.4001 7.94963 20.3626 12.0371 20.3626C16.6121 20.3626 20.3621 16.6126 20.3621 12.0376ZM12.0371 18.8626C9.11213 18.8626 6.59964 17.0251 5.66214 14.4001C6.18714 14.5126 6.71214 14.5876 7.27464 14.5876C11.1746 14.5876 14.3246 11.4376 14.3246 7.5376C14.3246 6.8626 14.2121 6.1876 14.0246 5.5501C16.8371 6.3751 18.8621 9.0001 18.8621 12.0376C18.8621 15.7876 15.7871 18.8626 12.0371 18.8626Z"
      fill="currentColor"
    />
  </svg>
);

// ---------- ThemeToggle Component ----------
const ThemeToggle = () => {
  const { isDark, mounted, toggle } = useThemeToggle({
    variant: "circle-blur",
    start: "bottom-right",
  });

  // 键盘快捷键 Shift + C
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.shiftKey && event.key === "C") {
        event.preventDefault();
        toggle();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  return (
    <div
      onClick={toggle}
      className="flex flex-row justify-center items-center p-0.5 gap-[2px] size-fit rounded-[6px] cursor-pointer relative border border-[0.5px] border-stroke bg-press overflow-hidden"
      title="点击切换主题 (快捷键: Shift + C)"
      role="button"
      tabIndex={0}
      aria-label={
        mounted && isDark ? "Switch to light mode" : "Switch to dark mode"
      }
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
    >
      {/* Light icon with swap animation */}
      <div className="z-10 flex flex-row justify-center items-center p-1 size-fit rounded-[4px] hover:opacity-80 cursor-pointer">
        {mounted ? (
          <ActionSwapIcon
            value={isDark ? "dark" : "light"}
            animation="blur"
            className="w-4 h-4"
          >
            <SunIcon />
          </ActionSwapIcon>
        ) : (
          <SunIcon />
        )}
      </div>

      {/* Dark icon with swap animation */}
      <div className="z-10 flex flex-row justify-center items-center p-1 size-fit rounded-[4px] hover:opacity-80 cursor-pointer">
        {mounted ? (
          <ActionSwapIcon
            value={isDark ? "dark" : "light"}
            animation="blur"
            className="w-4 h-4"
          >
            <MoonIcon />
          </ActionSwapIcon>
        ) : (
          <MoonIcon />
        )}
      </div>

      {/* Sliding indicator */}
      <div
        className={`absolute top-0.5 size-6 rounded-[4px] z-0 bg-card ${
          mounted ? "transition-all duration-200" : ""
        } ${isDark && mounted ? "left-[28px]" : "left-0.5"}`}
      />
    </div>
  );
};

export default ThemeToggle;
