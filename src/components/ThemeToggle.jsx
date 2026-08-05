"use client";
// Based on beui.dev/components/motion/theme-toggle
// Adapted to preserve existing toggle switch UI + Shift+C shortcut

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useReducedMotion } from "motion/react";
import { ActionSwapIcon } from "@/components/motion/action-swap";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { MoonIcon, SunIcon } from "@/public/icons";

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

// ---------- ThemeToggle Component ----------
const ThemeToggle = () => {
  const { isDark, mounted, toggle } = useThemeToggle({
    variant: "circle-blur",
    start: "bottom-right",
  });

  // 键盘快捷键 Shift + C（不允许同时按下其他修饰键）
  useEffect(() => {
    const handleKeyDown = (event) => {
      const isThemeShortcut =
        event.shiftKey &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        event.code === "KeyC";
      if (isThemeShortcut) {
        event.preventDefault();
        toggle();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  return (
    <Tooltip delayDuration={1000}>
      <TooltipTrigger asChild>
        <div
          onClick={toggle}
          className="flex flex-row justify-center items-center p-0.5 gap-[2px] size-fit rounded-[6px] cursor-pointer relative border border-[0.5px] border-stroke bg-press overflow-hidden"
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
      </TooltipTrigger>
      <TooltipContent>⇧ + C</TooltipContent>
    </Tooltip>
  );
};

export default ThemeToggle;
