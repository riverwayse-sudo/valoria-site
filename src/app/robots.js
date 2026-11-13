const IS_STAGING = process.env.VALU_PREVIEW === '1' ||
  process.env.NEXT_PUBLIC_VALU_PREVIEW === '1' ||
  (process.env.NEXT_PUBLIC_SITE_URL || '').includes('staging.')
const SITE_URL = IS_STAGING
  ? (process.env.NEXT_PUBLIC_SITE_URL || 'https://staging.valoriainstitute.com')
  : 'https://valoriainstitute.com'

export default function robots() {
  const rules = IS_STAGING
    ? [{ userAgent: '*', disallow: ['/'] }]
    : [{
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/admin',
          '/employer/dashboard',
          '/journey',
          '/profile/edit',
          '/profile/applications',
          '/profile/claim-assessment',
          '/profile/evidence',
          '/profile/matching',
          '/profile/onboarding',
          '/profile/passport',
          '/profile/settings',
          '/profile/setup',
          '/test/assessment',
          '/assessment/bridge',
          '/auth/callback',
          '/reset-password',
        ],
      }]

  return {
    rules,
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
