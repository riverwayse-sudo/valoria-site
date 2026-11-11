import { getConsentVerifiedPublicProfileSitemapRows } from '@/lib/public-profile'

const IS_PREVIEW = process.env.VALU_PREVIEW === '1' || process.env.NEXT_PUBLIC_VALU_PREVIEW === '1' || process.env.CF_WORKERS_PREVIEW === '1'
export const dynamic = 'force-dynamic'

const SITE_URL = IS_PREVIEW ? 'https://staging.valoriainstitute.com' : 'https://valoriainstitute.com'

export default async function sitemap() {
  const now = new Date()
  const pages = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/valu', priority: 0.95, changeFrequency: 'monthly' },
    { path: '/knowledge', priority: 0.75, changeFrequency: 'monthly' },
    { path: '/knowledge/valu-index', priority: 0.75, changeFrequency: 'monthly' },
    { path: '/knowledge/prime-framework', priority: 0.75, changeFrequency: 'monthly' },
    { path: '/knowledge/professional-capability', priority: 0.75, changeFrequency: 'monthly' },
    { path: '/prime', priority: 0.85, changeFrequency: 'monthly' },
    { path: '/develop', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/marketplace', priority: 0.95, changeFrequency: 'daily' },
    { path: '/marketplace/talent', priority: 0.9, changeFrequency: 'daily' },
    { path: '/marketplace/speakers', priority: 0.9, changeFrequency: 'daily' },
    { path: '/marketplace/facilitators', priority: 0.9, changeFrequency: 'daily' },
    { path: '/jobs', priority: 0.9, changeFrequency: 'daily' },
    { path: '/opportunities', priority: 0.9, changeFrequency: 'daily' },
    { path: '/atb-connect', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/atb-spotlight', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/events', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/insights', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/intelligence', priority: 0.85, changeFrequency: 'monthly' },
    { path: '/about-us', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/contact-us', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/careers', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  ]
  const staticEntries = pages.map(p => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }))

  // A staging preview must never enumerate live member profiles.
  if (IS_PREVIEW) return staticEntries

  // Public profile URLs are enumerated only after server-side consent,
  // listing, assessment and revocation checks have all passed.
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
