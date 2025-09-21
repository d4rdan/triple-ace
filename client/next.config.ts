// /client/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Enable webpack 5 config for better module resolution
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  // Enable experimental features if needed
  experimental: {
    // Enable if you want to use the app directory instead of pages
    // appDir: true,
  },
}

module.exports = nextConfig;