const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Forces Next.js 16 to ONLY look inside the project folder
  turbopack: {
    resolveAlias: {
      'tailwindcss': path.join(__dirname, 'node_modules', 'tailwindcss'),
    },
  },
  // Essential for Supabase & AWS images
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
  reactStrictMode: false,
};

module.exports = nextConfig;
