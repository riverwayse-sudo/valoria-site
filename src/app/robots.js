const SITE_URL = 'https://valoriainstitute.com'

export default function robots() {
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
