/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'alibaba-light': ['Alibaba PuHuiTi 2.0', 'sans-serif'],
        'alibaba-regular': ['Alibaba PuHuiTi 2.0', 'sans-serif'],
        'alibaba-semibold': ['Alibaba PuHuiTi 2.0', 'sans-serif'],
        'ding': ['DingTalk JinBuTi', 'sans-serif'],
      },
      colors: {
        // 使用CSS变量的方式
        'brand': 'hsl(var(--brand-main))',
        'brand-bg': 'hsl(var(--brand-bg))',
        'brand-stroke': 'hsl(var(--brand-stroke))',
        'main': 'hsl(var(--neutral-fg-main))',
        'secondary': 'hsl(var(--neutral-fg-secondary))',
        'tertiary': 'hsl(var(--neutral-fg-tertiary))',
        'quaternary': 'hsl(var(--neutral-fg-quaternary))',
        'disabled': 'hsl(var(--neutral-fg-disabled))',
        'card': 'hsl(var(--neutral-bg-card))',
        'hover': 'hsl(var(--neutral-bg-hover))',
        'press': 'hsl(var(--neutral-bg-press))',
        'divider': 'hsl(var(--neutral-bg-divider))',
        'stroke': 'hsl(var(--neutral-bg-stroke))',
        'bg': 'hsl(var(--background))',
        'others': 'hsl(var(--neutral-others-bg))',
        'transparent': 'hsl(var(--neutral-others-transparent))',
        'green': 'hsl(var(--function-green-bg))',
        'green-stroke': 'hsl(var(--function-green-stroke))',
        'blue': 'hsl(var(--function-blue-bg))',
        'blue-stroke': 'hsl(var(--function-blue-stroke))',
      },
    },
  },
  plugins: [],
}
