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
        disallow: ['/dashboard', '/admin', '/profile/edit'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
