import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize performance
  compress: true,
  poweredByHeader: false,
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Compiler options for better browser support
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // Use webpack explicitly (Turbopack is default in Next.js 16)
  // Add empty turbopack config to avoid conflicts
  turbopack: {},

  // Webpack optimizations (used when building with --webpack flag)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize bundle size
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for large libraries
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Separate chunk for recharts
            recharts: {
              name: 'recharts',
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
              chunks: 'all',
              priority: 30,
            },
            // Separate chunk for framer-motion
            framerMotion: {
              name: 'framer-motion',
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              chunks: 'all',
              priority: 30,
            },
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
