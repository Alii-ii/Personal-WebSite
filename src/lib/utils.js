import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 Tailwind CSS 类名的工具函数
 * 结合了 clsx 和 tailwind-merge 的功能
 * 
 * @param {...any} inputs - 类名输入
 * @returns {string} 合并后的类名字符串
 * 
 * 使用示例：
 * cn("px-2 py-1", "px-4") // 结果: "py-1 px-4" (px-2 被 px-4 覆盖)
 * cn("text-red-500", { "text-blue-500": isBlue }) // 条件类名
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
