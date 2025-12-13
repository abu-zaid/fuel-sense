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

  // Generate ETags for better caching
  generateEtags: true,
};

export default nextConfig;
