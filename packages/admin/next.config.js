/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [],
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
};

module.exports = nextConfig;
