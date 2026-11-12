/** @type {import('next').NextConfig} */
function normalizeSupabaseBuildUrl(value) {
  if (!value) return undefined
  const url = new URL(value)
  const isLocalDevelopment = url.protocol === 'http:' &&
    ['localhost', '127.0.0.1'].includes(url.hostname)
  if (url.protocol !== 'https:' && !isLocalDevelopment) {
    throw new Error('Supabase project URL must use HTTPS outside local development.')
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error('Supabase project URL must not include credentials, query parameters, or a fragment.')
  }
  url.pathname = url.pathname.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '')
  return url.toString().replace(/\/$/, '')
}

const publicSupabaseUrl = normalizeSupabaseBuildUrl(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
)
const serverSupabaseUrl = normalizeSupabaseBuildUrl(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
)

const productionVALUOrigin = 'https://assessment.valoriainstitute.com'
const isCloudflarePreview = process.env.CF_WORKERS_PREVIEW === '1'
const isCloudflareProduction = process.env.CF_WORKERS === '1' && !isCloudflarePreview
const isProduction = process.env.VERCEL_ENV === 'production' || isCloudflareProduction
const isPreview = process.env.VERCEL_ENV === 'preview' || isCloudflarePreview

const configuredVALUOrigin = isCloudflarePreview
  ? process.env.VALU_PREVIEW_ASSESSMENT_ORIGIN
  : process.env.VALU_UPSTREAM_ORIGIN

let valuOrigin = isProduction
  ? (configuredVALUOrigin || productionVALUOrigin)
  : (configuredVALUOrigin || null)

if (isPreview && valuOrigin) {
  try {
    const preview = new URL(valuOrigin)
    const isLocalDevelopment = preview.protocol === 'http:' &&
      ['localhost', '127.0.0.1'].includes(preview.hostname)
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
  // Next.js inlines these values into server and browser bundles. Normalize
  // both here so every Supabase client receives the project root, even if a
  // Cloudflare build variable accidentally contains the PostgREST /rest/v1 path.
  env: {
    ...(publicSupabaseUrl ? { NEXT_PUBLIC_SUPABASE_URL: publicSupabaseUrl } : {}),
    ...(serverSupabaseUrl ? { SUPABASE_URL: serverSupabaseUrl } : {}),
  },
  async rewrites() {
    if (!valuOrigin) return []
    const origin = valuOrigin
    return [
      // /valu/assessment is handled by the filesystem catch-all route. That
      // route uses the VALU_ASSESSMENT service binding, preserving same-origin
      // requests and avoiding an external rewrite that bypasses the proxy.
      // Keep only the legacy root-level API aliases here.
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
