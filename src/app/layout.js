import "./globals.css";
import { TooltipProvider } from "@/components/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";

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
