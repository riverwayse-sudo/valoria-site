/** @type {import('next').NextConfig} */
const configuredVALUOrigin = process.env.VALU_UPSTREAM_ORIGIN
const productionVALUOrigin = 'https://assessment.valoriainstitute.com'
let valuOrigin = process.env.VERCEL_ENV === 'production'
  ? (configuredVALUOrigin || productionVALUOrigin)
  : (configuredVALUOrigin || null)
if (process.env.VERCEL_ENV === 'preview' && valuOrigin) {
  try {
    if (new URL(valuOrigin).hostname === 'assessment.valoriainstitute.com') valuOrigin = null
  } catch {
    valuOrigin = null
  }
}

const nextConfig = {
  async rewrites() {
    if (!valuOrigin) return []
    const origin = valuOrigin
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
