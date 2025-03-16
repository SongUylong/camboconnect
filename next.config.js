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
      'paragoniu.edu.kh',
      'api.dicebear.com',
      'googleusercontent.com',
      'cambodiatechassociation.org',
      'example.com',
      'images.unsplash.com',
      'picsum.photos',
    ],
    // Add unoptimized option for Docker
    unoptimized: process.env.NODE_ENV === 'production',
  },
  // Add security headers for production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // Add compression
  compress: true,
  // Disable powered by header
  poweredByHeader: false,
}

module.exports = nextConfig