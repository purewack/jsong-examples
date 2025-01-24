/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: '/jsong-examples/react/gh-pages', // Adjust to your subdirectory
  assetPrefix: '/jsong-examples/react/gh-pages', // Ensures static assets are correctly resolved
  distDir: 'gh-pages',
  images: {
    unoptimized: true,
  },
  transpilePackages: ['jsong-audio']
}

module.exports = nextConfig
