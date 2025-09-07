"use client";

import Footer from '@/components/footer';
import DotGrid from '@/components/DotGrid';
import { useThemeColors } from '@/hooks/useThemeColors';

/**
 * 首页组件 - 空白页面
 * 这是一个简洁的空白页面，等待后续功能开发
 * 使用阿里巴巴普惠体字体和自定义颜色系统
 */
export default function Home() {
  const { baseColor, activeColor } = useThemeColors();

  return (
    <div className="min-h-screen w-full flex flex-col relative bg-bg">

      {/* 背景点阵效果 */}
      <div className="absolute inset-0 z-0">
        <DotGrid 
          dotSize={3}
          gap={18}
          baseColor={baseColor}
          activeColor={activeColor}
          proximity={120}
          speedTrigger={80}
          shockRadius={200}
          shockStrength={3}
          maxSpeed={2000}
          resistance={800}
          returnDuration={1.2}
          className="opacity-75"
        />
      </div>

      {/* canvas - 自适应填满剩余空间 */}
      <div className="flex-1 w-full border-divider border-1 border-dashed flex items-center justify-center relative z-10">
        <div className=""></div>
      </div>

      <Footer />
    </div>
  );
}
