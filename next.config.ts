import type { NextConfig } from "next";
import path from 'path'

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  serverExternalPackages: ["@prisma/client"],
  experimental: {
    esmExternals: 'loose'},

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@/core': path.resolve(__dirname, 'src/core'),
      '@/modules': path.resolve(__dirname, 'src/modules'),
    }
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
      path: false,
    }
    return config
  },
  
  
  
};

export default nextConfig;
