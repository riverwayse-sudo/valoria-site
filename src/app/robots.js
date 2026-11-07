const SITE_URL = 'https://valoriainstitute.com'

export default function robots() {
  if (process.env.VALU_PREVIEW === '1') {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard',
          '/admin',
          '/login',
          '/signup',
          '/register',
          '/reset-password',
          '/assessment',
          '/profile/edit',
          '/profile/setup',
          '/profile/onboarding',
          '/profile/settings',
          '/profile/applications',
          '/profile/claim-assessment',
          '/waitlist',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
