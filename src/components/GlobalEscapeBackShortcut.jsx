"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * 全局 Esc 返回“上一级”（路由层级父级），而不是时间顺序的 history.back
 *
 * 约束：
 * 1. 输入态不劫持，避免影响表单编辑。
 * 2. 若当前页面或弹层已消费 Esc（event.defaultPrevented），则不再追加返回。
 * 3. 根据 pathname 计算确定的父级路由；不依赖 referrer 或 history 顺序。
 */
export default function GlobalEscapeBackShortcut() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getParentHref = () => {
      if (!pathname || pathname === "/") return null;

      // 路由层级“上一级”：用 URL 结构定义父级，而非 history 时间顺序。
      if (pathname.startsWith("/portfolio/")) return "/portfolio";
      if (pathname.startsWith("/portfolio")) return "/";

      if (pathname.startsWith("/gallery")) return "/";
      if (pathname.startsWith("/resume")) return "/";

      // 其它未知页面：兜底到首页（可按需扩展）
      return "/";
    };

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;

      const target = event.target;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) {
        return;
      }

      const parentHref = getParentHref();
      if (!parentHref) return;

      event.preventDefault();

      router.push(parentHref);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pathname, router]);

  return null;
}
