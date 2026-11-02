const PRODUCTION_ASSESSMENT_ORIGIN = 'https://assessment.valoriainstitute.com'

export function getValuAssessmentOrigin(env = process.env) {
  const isCloudflarePreview = env.CF_WORKERS_PREVIEW === '1'
  const isCloudflareProduction = env.CF_WORKERS === '1' && !isCloudflarePreview
  const isProduction = env.VERCEL_ENV === 'production' || isCloudflareProduction
  const configured = (isCloudflarePreview
    ? env.VALU_PREVIEW_ASSESSMENT_ORIGIN || env.VALU_UPSTREAM_ORIGIN
    : env.VALU_UPSTREAM_ORIGIN)?.trim()

  if (isProduction) return configured || PRODUCTION_ASSESSMENT_ORIGIN
  if (!configured) return null

  try {
    const url = new URL(configured)
    if (!['http:', 'https:'].includes(url.protocol)) return null
    // Preview builds must never send test participants into production.
    if (url.hostname === 'assessment.valoriainstitute.com') return null
    return url.origin
  } catch {
    return null
  }
}
