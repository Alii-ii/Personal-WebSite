/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静态导出配置 - 适配Cloudflare Pages
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Turbopack配置（已稳定）
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // 开发服务器配置
  devIndicators: {
    position: 'bottom-right',
  },
  // 允许跨域请求（解决警告）
  allowedDevOrigins: ['172.18.185.120'],
};

export default nextConfig;
