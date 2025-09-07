import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 overflow-visible rounded-[6px] bg-main px-2 py-1 font-[Alibaba PuHuiTi 2.0] text-[12px] text-card " +
            "select-none shadow-md animate-in fade-in-0 zoom-in-95 " +
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 " +
            "data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 " +
            "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 " +
            "data-[side=top]:slide-in-from-bottom-2 " +
            "[&[data-side=top]_.arrow-top]:block [&[data-side=bottom]_.arrow-bottom]:block " +
            "[&[data-side=left]_.arrow-left]:block [&[data-side=right]_.arrow-right]:block " +
            "pointer-events-none",
          className,
        )}
        {...props}
      >
        {props.children}

        {/* 箭头 - top方向 */}
        <div className="arrow-top hidden absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-main" />

        {/* 箭头 - bottom方向 */}
        <div className="arrow-bottom hidden absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-main" />

        {/* 箭头 - left方向 */}
        <div className="arrow-left hidden absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-main" />

        {/* 箭头 - right方向 */}
        <div className="arrow-right hidden absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-main" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  ),
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
