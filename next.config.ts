import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['cytoscape', '@homebridge/node-pty-prebuilt-multiarch'],
  webpack: (config) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /three\.core\.js/, message: /THREE\.Clock.*deprecated/ },
    ]
    return config
  },
}

export default nextConfig
