/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // Only keep necessary experimental features
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
    ],
    // Add unoptimized option for Docker
    unoptimized: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig