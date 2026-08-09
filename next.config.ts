import type { NextConfig } from "next";
import path from 'path'

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  serverExternalPackages: ["@prisma/client"],
  
  // ✅ این رو جایگزین `turbopack: {}` کن
  turbopack: {
    rules: {
      '*.ttf': {
        loaders: ['file-loader'],
      },
    },
  },
  
  /*
  experimental: {
    esmExternals: 'loose'},
  */

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@/core': path.resolve(__dirname, 'src/core'),
      '@/modules': path.resolve(__dirname, 'src/modules'),
    }
    config.module.rules.push({
      test: /\.(ttf)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/fonts/[name][ext]'
      }
    })
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