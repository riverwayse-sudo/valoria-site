const SITE_URL = 'https://valoriainstitute.com'

export default function robots() {
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
