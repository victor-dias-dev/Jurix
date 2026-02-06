/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@jurix/shared-types'],
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;

