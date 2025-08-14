/** @type {import('next').NextConfig} */
const nextConfig = {
    // Environment variables (optional, but good for clarity)
    env: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    },
    
    // Production optimizations
    poweredByHeader: false,
    compress: true,
    
    // Skip ESLint during build (for quick deployment)
    eslint: {
      ignoreDuringBuilds: true,
    },
    
    // Skip TypeScript errors during build (if needed)
    typescript: {
      ignoreBuildErrors: true,
    },
    
    // Optional: Add domains if you're using next/image with external images
    images: {
      domains: [], // Add your image domains here if needed
    },
  }
  
  module.exports = nextConfig