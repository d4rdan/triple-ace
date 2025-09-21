/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Webpack configuration for client-side builds
  webpack: (config, { isServer }) => {
    // Only apply fallbacks for client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  // Optional: Add this if you want to suppress hydration warnings during development
  // compiler: {
  //   removeConsole: process.env.NODE_ENV === 'production',
  // },
};

module.exports = nextConfig;