/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fixes the "Unrecognized key" error by moving turbopack to the top level
  turbopack: {
    root: '.', 
  },
  reactStrictMode: false, // Keeps the Master Header loop-free
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = nextConfig;