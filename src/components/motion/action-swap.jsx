"use client";
// beui.dev/components/motion/action-swap
// Minimal extraction: only ActionSwapIcon (used by ThemeToggle)

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { SPRING_SWAP, EASE_OUT } from "@/lib/ease";

const BLUR_TRANSITION = { duration: 0.2, ease: "easeInOut" };

const SWAP_BLUR = "blur(8px)";
const ROLL_BLUR = "blur(3px)";

const ROLL_EXIT_TRANSITION = { duration: 0.14, ease: EASE_OUT };

const ICON_VARIANTS = {
  blur: {
    initial: { opacity: 0, scale: 0.25, filter: SWAP_BLUR },
    animate: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: BLUR_TRANSITION,
    },
    exit: {
      opacity: 0,
      scale: 0.25,
      filter: SWAP_BLUR,
      transition: BLUR_TRANSITION,
    },
  },
  roll: {
    initial: { opacity: 0, y: 12, filter: ROLL_BLUR },
    animate: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: SPRING_SWAP,
    },
    exit: {
      opacity: 0,
      y: -12,
      filter: ROLL_BLUR,
      transition: ROLL_EXIT_TRANSITION,
    },
  },
};

export function ActionSwapIcon({
  value,
  children,
  animation = "blur",
  className,
}) {
  const reduce = useReducedMotion();
  // Icons are single elements — cascade maps to its closest motion, roll.
  const coreAnimation = animation === "cascade" ? "roll" : animation;

  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden",
        className
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={`${animation}-${value}`}
          aria-hidden
          variants={ICON_VARIANTS[coreAnimation]}
          initial={reduce ? false : "initial"}
          animate={
            reduce
              ? { opacity: 1, filter: "blur(0px)", scale: 1, y: 0 }
              : "animate"
          }
          exit={reduce ? undefined : "exit"}
          className="col-start-1 row-start-1 inline-flex items-center justify-center will-change-[opacity,filter,transform]"
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
