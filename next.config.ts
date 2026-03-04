import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['cytoscape', '@homebridge/node-pty-prebuilt-multiarch'],
}

export default nextConfig
