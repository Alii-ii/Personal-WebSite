"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";

/**
 * 客户端 Provider 包装器
 * layout.js 是 Server Component，无法直接渲染依赖浏览器 API 的 Provider。
 * 通过这个 Client Component 桥接。
 */
export default function ClientProviders({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="theme"
    >
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
