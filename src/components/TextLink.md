# TextLink 组件

一个带有悬停动画效果和外部链接图标的可复用文本链接组件。

## 功能特性

- ✅ 悬停动画效果（位移 + 透明度变化）
- ✅ 自动外部链接图标
- ✅ 可自定义样式和属性
- ✅ 支持禁用图标显示
- ✅ 可调整图标大小

## 使用方法

### 基础用法

```jsx
import TextLink from '@/components/TextLink';

<TextLink href="https://example.com" title="访问示例网站">
  示例链接
</TextLink>
```

### 高级用法

```jsx
// 自定义样式
<TextLink 
  href="https://example.com" 
  title="自定义链接"
  className="text-lg font-bold"
>
  自定义样式链接
</TextLink>

// 禁用图标
<TextLink 
  href="https://example.com" 
  title="无图标链接"
  showIcon={false}
>
  无图标链接
</TextLink>

// 自定义图标大小
<TextLink 
  href="https://example.com" 
  title="大图标链接"
  iconSize="w-6 h-6"
>
  大图标链接
</TextLink>

// 内部链接（不显示外部链接图标）
<TextLink 
  href="/about" 
  title="关于页面"
  target="_self"
  showIcon={false}
>
  关于我们
</TextLink>
```

## Props 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `href` | `string` | - | 链接地址（必需） |
| `children` | `ReactNode` | - | 链接文本内容（必需） |
| `title` | `string` | - | 鼠标悬停提示文本 |
| `target` | `string` | `"_blank"` | 链接打开方式 |
| `rel` | `string` | `"noopener noreferrer"` | 链接安全属性 |
| `className` | `string` | `""` | 额外的CSS类名 |
| `showIcon` | `boolean` | `true` | 是否显示外部链接图标 |
| `iconSize` | `string` | `"w-4 h-4"` | 图标大小类名 |

## 样式特性

- **悬停效果**：向右上角位移 2px，透明度变为 80%
- **动画时长**：200ms 平滑过渡
- **默认样式**：16px 字体，细体，次要文字颜色
- **图标样式**：4x4 大小，90% 透明度

## 使用场景

- 外部链接（如作品集、GitHub、社交媒体等）
- 需要视觉反馈的文本链接
- 需要统一链接样式的场景
