import { useState, useEffect } from 'react';
import DecryptedText from '@/effects/DecryptedText';
import ParsedText from './ParsedText';

/**
 * 循环播放的乱码文本组件
 * 在多个文本之间循环切换，每个文本都有乱码替换效果
 */
export default function CyclingDecryptedText({
  texts = [], // 文本数组
  cycleInterval = 4000, // 循环间隔时间（毫秒）
  decryptedProps = {}, // 传递给 DecryptedText 的属性
  className = '',
  onUnderlinedClick, // 下划线文本点击事件
  underlineOpacity = 50, // 下划线透明度
  hoverOpacity = 80, // hover时下划线透明度
  ...props
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0); // 用于强制重新渲染动画
  const [showUnderlined, setShowUnderlined] = useState(false); // 控制是否显示下划线

  useEffect(() => {
    if (texts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % texts.length);
      setAnimationKey(prev => prev + 1); // 更新动画键值，强制重新触发动画
      setShowUnderlined(false); // 重置下划线显示状态
    }, cycleInterval);

    return () => clearInterval(interval);
  }, [texts.length, cycleInterval]);

  // 监听动画键值变化，延迟显示下划线
  useEffect(() => {
    if (animationKey > 0) {
      // 计算动画时间：文本长度 × speed × maxIterations
      const currentText = texts[currentIndex] || '';
      const cleanText = currentText.replace(/<[^>]*>/g, '');
      const textLength = cleanText.length;
      const speed = decryptedProps.speed || 40;
      const maxIterations = decryptedProps.maxIterations || 6;
      
      // 对于顺序显示，动画时间 = 文本长度 × speed
      // 对于非顺序显示，动画时间 = speed × maxIterations
      const animationDuration = decryptedProps.sequential 
        ? textLength * speed 
        : speed * maxIterations;
      
      // 添加一点缓冲时间确保动画完全结束
      const delay = animationDuration + 100;
      
      const timer = setTimeout(() => {
        setShowUnderlined(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [animationKey, currentIndex, texts, decryptedProps]);

  if (texts.length === 0) return null;

  return (
    <div className={`relative ${className}`} {...props}>
      {showUnderlined ? (
        /* 带下划线的静态文本 */
        <ParsedText
          text={texts[currentIndex]}
          onUnderlinedClick={onUnderlinedClick}
          underlineOpacity={underlineOpacity}
          hoverOpacity={hoverOpacity}
          className="text-secondary"
        />
      ) : (
        /* 动画文本 */
        <DecryptedText
          key={`${animationKey}-${currentIndex}`} // 使用更唯一的 key
          text={texts[currentIndex]}
          animateOn="view"
          speed={50}
          maxIterations={8}
          sequential={true}
          revealDirection="start"
          useOriginalCharsOnly={true}
          className="text-secondary"
          encryptedClassName="text-secondary opacity-30"
          {...decryptedProps}
        />
      )}
    </div>
  );
}
