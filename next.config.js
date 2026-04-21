const path = require('path');
const { execSync } = require('child_process');

/**
 * One identity string for local dev, GitHub Actions, and Amplify:
 * CI sets AWS_COMMIT_ID / VERCEL_* ; locally we use `git rev-parse HEAD`.
 * Inlined as NEXT_PUBLIC_GIT_SHA on the client (see layout.tsx data-git-sha).
 */
function resolveGitSha() {
  const fromEnv =
    process.env.NEXT_PUBLIC_GIT_SHA ||
    process.env.AWS_COMMIT_ID ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.CODEBUILD_RESOLVED_SOURCE_VERSION;
  if (fromEnv && String(fromEnv).trim()) return String(fromEnv).trim();
  try {
    return execSync('git rev-parse HEAD', {
      encoding: 'utf-8',
      cwd: __dirname,
    }).trim();
  } catch {
    return '';
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GIT_SHA: resolveGitSha(),
    // Ensure browser bundle gets Supabase URL/key after .env.local loads (avoids stale/empty NEXT_PUBLIC_* in dev).
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    NEXT_PUBLIC_PARABLE_DEV_GUEST: process.env.NEXT_PUBLIC_PARABLE_DEV_GUEST ?? '',
    NEXT_PUBLIC_SUPABASE_BROWSER_RELAY:
      process.env.NEXT_PUBLIC_SUPABASE_BROWSER_RELAY ?? '',
  },
  async redirects() {
    return [
      { source: '/testify', destination: '/sanctuary', permanent: true },
      { source: '/testify/:path*', destination: '/sanctuary/:path*', permanent: true },
    ];
  },
  async rewrites() {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!base || !String(base).startsWith('https://')) return [];
    const origin = String(base).replace(/\/$/, '');
    return [
      {
        source: '/supabase-proxy/:path*',
        destination: `${origin}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/sanctuary',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
      {
        source: '/sanctuary/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
      {
        source: '/following',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
      {
        source: '/following/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
    ];
  },
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
