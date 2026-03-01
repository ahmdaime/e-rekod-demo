/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: { unoptimized: true },
  trailingSlash: true,
  webpack: (config) => {
    // ExcelJS uses Node.js modules — fallback untuk browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      stream: false,
      path: false,
    };
    return config;
  },
}

module.exports = nextConfig
