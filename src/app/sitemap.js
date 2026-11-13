import { getConsentVerifiedPublicProfileSitemapRows } from '@/lib/public-profile'

export const dynamic = 'force-dynamic'

const IS_STAGING = process.env.VALU_PREVIEW === '1' || process.env.NEXT_PUBLIC_VALU_PREVIEW === '1' || (process.env.NEXT_PUBLIC_SITE_URL || '').includes('staging.')
const SITE_URL = IS_STAGING ? (process.env.NEXT_PUBLIC_SITE_URL || 'https://staging.valoriainstitute.com') : 'https://valoriainstitute.com'

export default async function sitemap() {
  const now = new Date()
  const pages = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/marketplace', priority: 0.95, changeFrequency: 'daily' },
    { path: '/marketplace/talent', priority: 0.9, changeFrequency: 'daily' },
    { path: '/marketplace/speakers', priority: 0.9, changeFrequency: 'daily' },
    { path: '/marketplace/facilitators', priority: 0.9, changeFrequency: 'daily' },
    { path: '/facilitators', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/prime', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/programmes', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/events', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/insights', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/valu', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/valu/start', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/about-us', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/contact-us', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/careers', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/signup', priority: 0.6, changeFrequency: 'yearly' },
    { path: '/login', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/privacypolicy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms-of-use', priority: 0.3, changeFrequency: 'yearly' },
  ]
  const staticEntries = pages.map(page => ({
    url: `${SITE_URL}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))

  let profileEntries = []
  try {
    const profiles = await getConsentVerifiedPublicProfileSitemapRows()
    profileEntries = profiles.map(profile => ({
      url: `${SITE_URL}/profile/${profile.id}`,
      lastModified: profile.updated_at ? new Date(profile.updated_at) : now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }))
  } catch (error) {
    console.error('Sitemap public profile verification failed:', error)
  }

  return [...staticEntries, ...profileEntries]
}
