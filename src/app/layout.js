import "./globals.css";
import { TooltipProvider } from "@/components/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";

export const metadata = {
  title: "Next.js 项目",
  description: "基于 React + Tailwind + Next.js 的纯前端项目",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className="font-alibaba-regular antialiased m-0 p-0">
        <LanguageProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
