import { useState, useEffect } from 'react';
import DecryptedText from '@/effects/DecryptedText';

/**
 * 循环播放的乱码文本组件
 * 在多个文本之间循环切换，每个文本都有乱码替换效果
 */
export default function CyclingDecryptedText({
  texts = [], // 文本数组
  cycleInterval = 4000, // 循环间隔时间（毫秒）
  decryptedProps = {}, // 传递给 DecryptedText 的属性
  className = '',
  ...props
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0); // 用于强制重新渲染动画

  useEffect(() => {
    if (texts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % texts.length);
      setAnimationKey(prev => prev + 1); // 更新动画键值，强制重新触发动画
    }, cycleInterval);

    return () => clearInterval(interval);
  }, [texts.length, cycleInterval]);

  if (texts.length === 0) return null;

  return (
    <div className={className} {...props}>
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
    </div>
  );
}
