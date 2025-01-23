/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/jsong-examples/react",
  images: {
    unoptimized: true,
  },
  transpilePackages: ['jsong-audio']
}

module.exports = nextConfig
