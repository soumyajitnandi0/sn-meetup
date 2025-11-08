/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  
  // Performance optimizations
  compress: true,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
  
  // Production optimizations
  poweredByHeader: false,
  generateEtags: true,
  
  // Use webpack instead of Turbopack to avoid migration issues
  // Path aliases are handled by jsconfig.json
  webpack: (config, { isServer }) => {
    // Additional webpack config if needed
    return config;
  },
};

export default nextConfig;
