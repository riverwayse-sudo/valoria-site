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
      // Preserve the platform's Vite base path so its JS/CSS assets resolve.
      { source: '/valu/assessment/:path*', destination: `${origin}/valu/assessment/:path*` },

      // The assessment bundle calls root-level platform APIs. Keep these
      // explicit so the site's own unrelated /api routes remain local.
      { source: '/api/taster-progress', destination: `${origin}/api/taster-progress` },
      { source: '/api/submit-taster', destination: `${origin}/api/submit-taster` },
      { source: '/api/assessment-progress', destination: `${origin}/api/assessment-progress` },
      { source: '/api/submit-assessment', destination: `${origin}/api/submit-assessment` },
      { source: '/api/link-assessment-to-taster', destination: `${origin}/api/link-assessment-to-taster` },
      { source: '/api/generate-and-send-report', destination: `${origin}/api/generate-and-send-report` },
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
