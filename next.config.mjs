/** @type {import('next').NextConfig} */
const nextConfig = {
  // 确保热更新正常工作
  experimental: {
    // 启用Turbopack的热更新
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // 开发服务器配置
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  // 允许跨域请求（解决警告）
  allowedDevOrigins: ['172.18.185.120'],
};

export default nextConfig;
