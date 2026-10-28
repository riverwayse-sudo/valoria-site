/** @type {import('next').NextConfig} */
const { normalizeOrigin } = require('./src/lib/site-url.js')

const nextConfig = {
  async rewrites() {
    // Normalised so a configured origin with a trailing slash cannot produce a
    // double slash in the rewrite destination (/valu/assessment -> https://host//).
    const origin = normalizeOrigin(process.env.VALU_UPSTREAM_ORIGIN) || 'https://assessment.valoriainstitute.com'
    return [
      { source: '/valu/assessment', destination: `${origin}/` },
      { source: '/valu/assessment/:path*', destination: `${origin}/:path*` },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
      },
      {
        protocol: 'https',
        hostname: 'valoriainstitute.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
}
module.exports = nextConfig
