/** @type {import('next').NextConfig} */
const productionVALUOrigin = 'https://assessment.valoriainstitute.com'
const isCloudflareProduction = process.env.CF_PAGES === '1' && process.env.CF_PAGES_BRANCH === 'main'
const isProduction = process.env.VERCEL_ENV === 'production' || isCloudflareProduction
const isPreview = process.env.VERCEL_ENV === 'preview' || (process.env.CF_PAGES === '1' && !isCloudflareProduction)
const configuredVALUOrigin = isProduction
  ? process.env.VALU_UPSTREAM_ORIGIN
  : process.env.VALU_PREVIEW_ASSESSMENT_ORIGIN
let valuOrigin = isProduction
  ? (configuredVALUOrigin || productionVALUOrigin)
  : (configuredVALUOrigin || null)

if (isPreview && valuOrigin) {
  try {
    const preview = new URL(valuOrigin)
    const isLocalDevelopment = preview.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(preview.hostname)
    if ((preview.protocol !== 'https:' && !isLocalDevelopment) ||
        preview.hostname === 'assessment.valoriainstitute.com' ||
        preview.hostname === 'valoria-platform.riverwayse.workers.dev') {
      valuOrigin = null
    } else {
      valuOrigin = preview.origin
    }
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
      { protocol: 'https', hostname: 'cdn.prod.website-files.com' },
      { protocol: 'https', hostname: 'valoriainstitute.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
  },
}
module.exports = nextConfig
