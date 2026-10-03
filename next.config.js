/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const origin = process.env.VALU_UPSTREAM_ORIGIN || 'https://assessment.valoriainstitute.com'
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
