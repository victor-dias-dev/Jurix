/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@jurix/shared-types'],
  output: 'standalone',
};

module.exports = nextConfig;

