const SITE_URL = 'https://valoriainstitute.com'
const IS_PREVIEW = process.env.VALU_PREVIEW === '1' || process.env.NEXT_PUBLIC_VALU_PREVIEW === '1' || process.env.CF_WORKERS_PREVIEW === '1'

export default function robots() {
  if (IS_PREVIEW) {
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
          '/profile/evidence',
          '/profile/matching',
          '/profile/passport',
          '/report',
          '/journey',
          '/valu/start',
          '/waitlist',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
