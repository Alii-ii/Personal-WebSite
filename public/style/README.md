# 🎨 颜色 Tokens 使用参考（简化版）

## 📋 快速参考

### 如何查阅颜色 Tokens

1. **源文件**: 查看 `src/style/` 文件夹中的 `light-tokens.js` 和 `dark-tokens.js`
3. **CSS 变量**: 查看 `src/globals.css` 中定义的 CSS 变量

## 🎯 在 React 组件中使用（简化类名）

### 1. 背景色 (bg-*)

```jsx
// 品牌色背景
<div className="bg-brand">品牌主色背景</div>
<div className="bg-brand-bg">品牌背景色</div>
<div className="bg-brand-stroke">品牌描边色背景</div>

// 背景色（已简化，去掉 neutral- 前缀和 -bg- 中缀）
<div className="bg-card">卡片背景</div>
<div className="bg-hover">悬停背景</div>
<div className="bg-press">按下背景</div>
<div className="bg-divider">分割线背景</div>
<div className="bg-stroke">描边背景</div>

// 其他背景
<div className="bg-others">其他背景</div>
<div className="bg-transparent">透明背景</div>

// 功能色背景（已简化，去掉 function- 前缀和 -bg 后缀）
<div className="bg-green">绿色功能背景</div>
<div className="bg-green-stroke">绿色描边背景</div>
<div className="bg-blue">蓝色功能背景</div>
<div className="bg-blue-stroke">蓝色描边背景</div>
```

### 2. 文字颜色 (text-*)

```jsx
// 文字颜色（已简化，去掉 neutral- 前缀和 -fg- 中缀）
<h1 className="text-main">主要标题</h1>
<p className="text-secondary">次要文字</p>
<span className="text-tertiary">辅助文字</span>
<small className="text-quaternary">四级文字</small>
<span className="text-disabled">禁用文字</span>

// 功能色文字（已简化）
<span className="text-green-stroke">成功文字</span>
<span className="text-blue-stroke">信息文字</span>
```

### 3. 边框颜色 (border-*)

```jsx
// 边框颜色（简化版）
<div className="border border-brand-stroke">品牌色边框</div>
<div className="border border-stroke">中性边框</div>
<div className="border border-divider">分割线边框</div>
<div className="border border-green-stroke">绿色边框</div>
<div className="border border-blue-stroke">蓝色边框</div>
```

## 🎨 完整颜色列表（简化版）

### 品牌色 (Brand Colors)
| 简化类名 | CSS 变量 | 用途 |
|---------|----------|------|
| `bg-brand` | `--brand-main` | 品牌主色 |
| `bg-brand-bg` | `--brand-bg` | 品牌背景色 |
| `bg-brand-stroke` | `--brand-stroke` | 品牌描边色 |

### 背景色 (Background Colors) - 已简化
| 简化类名 | CSS 变量 | 用途 |
|---------|----------|------|
| `bg-card` | `--neutral-bg-card` | 卡片背景 |
| `bg-hover` | `--neutral-bg-hover` | 悬停背景 |
| `bg-press` | `--neutral-bg-press` | 按下背景 |
| `bg-divider` | `--neutral-bg-divider` | 分割线 |
| `bg-stroke` | `--neutral-bg-stroke` | 描边色 |
| `bg-others` | `--neutral-others-bg` | 其他背景 |
| `bg-transparent` | `--neutral-others-transparent` | 透明背景 |

### 前景色 (Foreground Colors) - 已简化
| 简化类名 | CSS 变量 | 用途 |
|---------|----------|------|
| `text-main` | `--neutral-fg-main` | 主要文字 |
| `text-secondary` | `--neutral-fg-secondary` | 次要文字 |
| `text-tertiary` | `--neutral-fg-tertiary` | 三级文字 |
| `text-quaternary` | `--neutral-fg-quaternary` | 四级文字 |
| `text-disabled` | `--neutral-fg-disabled` | 禁用文字 |

### 功能色 (Function Colors) - 已简化
| 简化类名 | CSS 变量 | 用途 |
|---------|----------|------|
| `bg-green` | `--function-green-bg` | 绿色功能背景 |
| `bg-green-stroke` | `--function-green-stroke` | 绿色描边 |
| `bg-blue` | `--function-blue-bg` | 蓝色功能背景 |
| `bg-blue-stroke` | `--function-blue-stroke` | 蓝色描边 |


## 🛠️ 高级用法

### 1. 使用 CSS 变量（保持不变）

```css
/* CSS 变量名保持不变，确保向后兼容 */
.custom-element {
  background-color: hsl(var(--brand-main));
  color: hsl(var(--neutral-fg-main));
  border: 1px solid hsl(var(--neutral-bg-stroke));
}
```

### 2. 条件样式（简化版）

```jsx
// 根据状态使用不同颜色（简化类名）
const StatusBadge = ({ status, children }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-bg text-green-stroke border-green-stroke';
      case 'info':
        return 'bg-blue-bg text-blue-stroke border-blue-stroke';
      default:
        return 'bg-bg-card text-fg-main border-bg-stroke';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full border ${getStatusColor()}`}>
      {children}
    </span>
  );
};

// 使用示例
<StatusBadge status="success">成功</StatusBadge>
<StatusBadge status="info">信息</StatusBadge>
```

## 📱 响应式和状态变体（简化版）

```jsx
// 悬停效果
<button className="bg-brand hover:bg-brand-stroke transition-colors">
  悬停变色按钮
</button>

// 深色模式自动适配（已配置）
<div className="bg-bg-card text-fg-main">
  自动适配深色模式的内容
</div>

// 响应式设计
<div className="bg-bg-card md:bg-brand lg:bg-green-bg">
  响应式背景色
</div>
```

## 🎨 常用组合模式（简化版）

### 1. 卡片样式
```jsx
<div className="bg-bg-card border border-bg-stroke rounded-lg p-6">
  <h3 className="text-fg-main font-semibold mb-2">卡片标题</h3>
  <p className="text-fg-secondary">卡片内容描述</p>
</div>
```

### 2. 状态提示
```jsx
// 成功提示
<div className="bg-green-bg border border-green-stroke rounded-lg p-4">
  <p className="text-green-stroke">操作成功！</p>
</div>

// 信息提示
<div className="bg-blue-bg border border-blue-stroke rounded-lg p-4">
  <p className="text-blue-stroke">重要信息提醒</p>
</div>
```

### 3. 导航栏
```jsx
<nav className="bg-bg-card border-b border-bg-divider">
  <div className="container mx-auto px-4 py-3">
    <h1 className="text-fg-main font-bold">网站标题</h1>
  </div>
</nav>
```

### 4. 按钮组合
```jsx
<div className="flex gap-2">
  <button className="bg-brand text-white px-4 py-2 rounded">
    主要按钮
  </button>
  <button className="bg-green-bg text-green-stroke border border-green-stroke px-4 py-2 rounded hover:bg-green-stroke hover:text-white">
    成功按钮
  </button>
  <button className="bg-bg-card text-fg-main border border-bg-stroke px-4 py-2 rounded hover:bg-bg-hover">
    次要按钮
  </button>
</div>
```

## 🔍 调试和验证

### 查看当前颜色值
在浏览器开发者工具中：
```javascript
// 获取 CSS 变量值（变量名保持不变）
getComputedStyle(document.documentElement).getPropertyValue('--brand-main')

// 获取所有颜色变量
const colors = {};
document.documentElement.style.cssText.split(';').forEach(rule => {
  if (rule.includes('--')) {
    const [property, value] = rule.split(':');
    colors[property.trim()] = value.trim();
  }
});
console.log(colors);
```



## 🚀 迁移指南

### 从旧类名迁移到新类名

#### 批量替换（推荐）
在你的项目中使用查找替换功能：

```bash
# 背景色类名替换
bg-neutral-bg-card → bg-bg-card
bg-neutral-bg-hover → bg-bg-hover
bg-neutral-bg-press → bg-bg-press
bg-neutral-bg-divider → bg-bg-divider
bg-neutral-bg-stroke → bg-bg-stroke

# 前景色类名替换
text-neutral-fg-main → text-fg-main
text-neutral-fg-secondary → text-fg-secondary
text-neutral-fg-tertiary → text-fg-tertiary
text-neutral-fg-quaternary → text-fg-quaternary
text-neutral-fg-disabled → text-fg-disabled

# 功能色类名替换
bg-function-green-bg → bg-green-bg
bg-function-green-stroke → bg-green-stroke
bg-function-blue-bg → bg-blue-bg
bg-function-blue-stroke → bg-blue-stroke

# 边框色类名替换
border-neutral-bg-stroke → border-bg-stroke
border-neutral-bg-divider → border-bg-divider
border-function-green-stroke → border-green-stroke
border-function-blue-stroke → border-blue-stroke
```

#### 使用 VS Code 全局替换
1. 按 `Ctrl+Shift+H` 打开全局替换
2. 启用正则表达式模式
3. 使用以下正则替换模式：

```regex
查找: bg-neutral-bg-(\w+)
替换: bg-bg-$1

查找: text-neutral-fg-(\w+)
替换: text-fg-$1

查找: bg-function-(\w+)-(\w+)
替换: bg-$1-$2

查找: border-neutral-bg-(\w+)
替换: border-bg-$1
```

## 💡 最佳实践

1. **优先使用简化类名**: 新项目直接使用简化版类名
2. **保持一致性**: 团队内统一使用同一套类名
3. **CSS 变量保持不变**: 原有的 CSS 变量名继续有效，确保向后兼容
4. **语义化命名**: 类名更简洁但仍保持语义清晰

## 📚 更多资源(这里需要根据本仓库更新!)

- **在线演示**: 访问 `/colors` 页面查看所有颜色
- **源文件**: `src/st/` 文件夹
- **配置文件**: `src/lib/theme-tokens.js`
- **CSS 变量**: `src/index.css`
- **更新文档**: `src/tokens/README.md` 