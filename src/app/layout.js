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
        {/* 加载动画区域 */}
        <div
          id="initial-loading"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-hover text-secondary opacity-100 transition-opacity duration-300 motion-reduce:transition-none select-none"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "16px",
            backgroundColor: "hsl(var(--neutral-bg-hover, 0 0% 100%))",
            color: "hsl(var(--neutral-fg-secondary, 232 20% 14% / 85%))",
            userSelect: "none",
          }}
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div
            id="initial-loading-text"
            className="font-regular text-[14px]"
            style={{ fontFamily: "'Alibaba PuHuiTi 2.0', sans-serif", fontSize: "14px", color: "inherit" }}
          >
            Loading…
          </div>
        </div>

        {/* 主要内容区域 */}
        <div
          id="initial-content"
          className="opacity-0 transition-opacity duration-300 motion-reduce:transition-none"
        >
          <LanguageProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </LanguageProvider>
        </div>

        {/* 加载动画脚本 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var loadingEl = document.getElementById('initial-loading');
                var loadingTextEl = document.getElementById('initial-loading-text');
                var contentEl = document.getElementById('initial-content');
                var pulseRaf = null;

                if (contentEl) {
                  // 初始状态已经是 opacity-0，无需修改 class
                  // 仅通过内联 style 确保隐藏
                  contentEl.style.opacity = '0';
                }

                var getPreferredTheme = function () {
                  try {
                    var savedTheme = localStorage.getItem('theme');
                    if (savedTheme === 'dark' || savedTheme === 'light') {
                      return savedTheme;
                    }
                  } catch (e) {}

                  var prefersDark = window.matchMedia &&
                    window.matchMedia('(prefers-color-scheme: dark)').matches;
                  return prefersDark ? 'dark' : 'light';
                };

                var applyLoadingTheme = function (theme) {
                  if (!loadingEl) return;

                  if (theme === 'dark') {
                    loadingEl.style.backgroundColor = 'hsl(var(--neutral-bg-card, 232 22% 13%))';
                    loadingEl.style.color = 'hsl(var(--neutral-fg-secondary, 0 0% 100% / 85%))';
                    if (loadingTextEl) loadingTextEl.style.color = 'inherit';
                    return;
                  }

                  loadingEl.style.backgroundColor = 'hsl(var(--neutral-bg-hover, 0 0% 100%))';
                  loadingEl.style.color = 'hsl(var(--neutral-fg-secondary, 232 20% 14% / 85%))';
                  if (loadingTextEl) loadingTextEl.style.color = 'inherit';
                };

                var startLoadingPulse = function () {
                  if (!loadingTextEl) return;
                  var reducedMotion = window.matchMedia &&
                    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                  if (reducedMotion) return;

                  var minOpacity = 0.55;
                  var maxOpacity = 1;
                  var maxTranslateY = 2; // 上下各 2px
                  var legMs = 450; // 单程时长：上/下各一次（总时长缩短为 900ms）
                  var startedAt = 0;
                  var easeOutCubic = function (t) {
                    return 1 - Math.pow(1 - t, 3);
                  };

                  var animate = function (timestamp) {
                    if (!startedAt) startedAt = timestamp;
                    var elapsed = timestamp - startedAt;
                    var legIndex = Math.floor(elapsed / legMs);
                    var legProgress = (elapsed % legMs) / legMs;
                    var eased = easeOutCubic(legProgress);

                    // 偶数段：透明度从低到高，位移从 -4px 到 4px
                    // 奇数段：透明度从高到低，位移从 4px 到 -4px
                    var forward = legIndex % 2 === 0;
                    var opacityStart = forward ? minOpacity : maxOpacity;
                    var opacityEnd = forward ? maxOpacity : minOpacity;
                    var translateStart = forward ? -maxTranslateY : maxTranslateY;
                    var translateEnd = forward ? maxTranslateY : -maxTranslateY;

                    var opacity = opacityStart + (opacityEnd - opacityStart) * eased;
                    var translateY = translateStart + (translateEnd - translateStart) * eased;

                    loadingTextEl.style.opacity = String(opacity);
                    loadingTextEl.style.transform = 'translateY(' + translateY + 'px)';

                    pulseRaf = window.requestAnimationFrame(animate);
                  };

                  pulseRaf = window.requestAnimationFrame(animate);
                };

                var markReady = function () {
                  if (pulseRaf) {
                    window.cancelAnimationFrame(pulseRaf);
                    pulseRaf = null;
                  }
                  if (loadingTextEl) {
                    loadingTextEl.style.opacity = '1';
                    loadingTextEl.style.transform = 'translateY(0px)';
                  }

                  if (loadingEl) {
                    loadingEl.classList.add('opacity-0', 'pointer-events-none');
                    loadingEl.style.opacity = '0';
                  }
                  if (contentEl) {
                    contentEl.style.opacity = '1';
                    contentEl.classList.remove('opacity-0');
                    contentEl.classList.add('opacity-100');
                  }
                };

                applyLoadingTheme(getPreferredTheme());
                startLoadingPulse();

                if (document.readyState === 'complete') {
                  markReady();
                  return;
                }
                window.addEventListener('load', function () {
                  markReady();
                  // 防止 hydration 覆盖导致内容再次隐藏
                  window.setTimeout(markReady, 0);
                  window.setTimeout(markReady, 80);
                  window.setTimeout(markReady, 220);
                }, { once: true });
              })();
            `
          }}
        />
        
        {/* 禁用 JS 时的兜底样式 */}
        <noscript>
          <style>{'#initial-loading{display:none !important}#initial-content{display:block !important;opacity:1 !important}'}</style>
        </noscript>

      </body>
    </html>
  );
}
