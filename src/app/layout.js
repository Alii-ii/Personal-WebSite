import "./globals.css";
import { TooltipProvider } from "@/components/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ClientProviders from "@/components/ClientProviders";

export const metadata = {
  title: "Alii Wong",
  description: "Alii Wong's Personal Website",
  keywords: ["个人网站", "作品集", "博客"],
  authors: [{ name: "Alii" }],
  openGraph: {
    title: "Alii - 个人网站",
    description: "Alii 的个人作品集和博客",
    type: "website",
  },
};

// 主题防闪烁：在 body 内容绘制前同步设置 <html> 主题 class。
// 背景：SSR 阶段 <html> 无主题 class（默认走 :root light），
// 若用户偏好 dark，需等 React hydration + next-themes mount 后才加 .dark，
// 期间会有 light→dark 的主题闪烁。
// 此脚本在 body 解析时同步执行（早于后续内容绘制），首帧即用正确主题绘制，
// 既无闪烁又不遮挡内容；next-themes mount 后会接管且与此一致。
// suppressHydrationWarning 容忍 SSR(无 class) vs 客户端(有 class) 的差异。
const themeInitScript = `(function(){try{var s=localStorage.getItem('theme');var t=(s==='dark'||s==='light')?s:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.classList.add(t);document.documentElement.style.colorScheme=t;}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 字体 preload：提前发起请求，避免等 CSS 解析后才加载 */}
        <link rel="preload" href="/fonts/AlibabaPuHuiTi-2-55-Regular.woff2?v=289fdc21" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/AlibabaPuHuiTi-2-45-Light.woff2?v=289fdc21" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/DingTalk-JinBuTi.woff2?v=289fdc21" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="font-alibaba-regular antialiased m-0 p-0">
        {/* 主题防闪烁脚本，见上 themeInitScript */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />

        <ClientProviders>
          <LanguageProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </LanguageProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
