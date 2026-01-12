/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_BASE_PATH || ''
const assetPrefix = process.env.NEXT_BASE_PATH || ''

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['jsong-audio'],
  basePath,
  assetPrefix,
  trailingSlash: true,
  output: 'export'
}

module.exports = nextConfig
