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
      'randomuser.me',
      'images.unsplash.com'
    ],
  },
}

module.exports = nextConfig