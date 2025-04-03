/** @type {import('next').NextConfig} */
const nextConfig = {
output: 'standalone',
  experimental: {
    // Only keep necessary experimental features
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'media.camboconnect.com',
      },
      {
        protocol: 'https',
        hostname: 'f002.backblazeb2.com',
      }
    ],
    domains: [
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'media.camboconnect.com',
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
