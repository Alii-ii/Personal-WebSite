import React from 'react';
import UnderlinedText from './UnderlinedText';

/**
 * 解析包含特殊标签的文本组件
 * 支持 <underline> 标签来创建带下划线的文本
 */
export default function ParsedText({
  text,
  className = '',
  onUnderlinedClick,
  underlineOpacity = 50,
  hoverOpacity = 80,
  ...props
}) {
  // 解析文本中的 <underline> 标签
  const parseText = (text) => {
    if (!text) return null;
    
    // 使用正则表达式匹配 <underline> 标签
    const underlineRegex = /<underline>(.*?)<\/underline>/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = underlineRegex.exec(text)) !== null) {
      // 添加标签前的普通文本
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }
      
      // 添加带下划线的文本
      parts.push({
        type: 'underline',
        content: match[1]
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // 添加剩余的普通文本
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }
    
    return parts;
  };
  
  const parsedParts = parseText(text);
  
  if (!parsedParts) return null;
  
  return (
    <span className={className} {...props}>
      {parsedParts.map((part, index) => {
        if (part.type === 'underline') {
          return (
            <UnderlinedText
              key={index}
              onClick={() => onUnderlinedClick && onUnderlinedClick(part.content)}
              underlineOpacity={underlineOpacity}
              hoverOpacity={hoverOpacity}
            >
              {part.content}
            </UnderlinedText>
          );
        } else {
          return <span key={index}>{part.content}</span>;
        }
      })}
    </span>
  );
}
