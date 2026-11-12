const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://valoriainstitute.com'

export default function robots() {
  if (process.env.VALU_STAGING_API_ENABLED === '1') {
    return {
      rules: [{ userAgent: '*', disallow: ['/'] }],
      sitemap: `${SITE_URL}/sitemap.xml`,
    }
  }

  return {
    rules: [
      {
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
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
