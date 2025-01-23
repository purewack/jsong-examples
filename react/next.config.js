/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  assetPrefix: './',
  reactStrictMode: true,
  transpilePackages: ['jsong-audio']
}

module.exports = nextConfig
