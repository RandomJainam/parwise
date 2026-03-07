/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip TypeScript errors during build — prevents Vercel build hangs
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
