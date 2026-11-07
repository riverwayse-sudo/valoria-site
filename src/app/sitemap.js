import { isPublicProfileContentReady } from '@/lib/marketplace-data'

const IS_PREVIEW = process.env.VALU_PREVIEW === '1' || process.env.NEXT_PUBLIC_VALU_PREVIEW === '1' || process.env.CF_WORKERS_PREVIEW === '1'
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
    { path: '/privacypolicy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms-of-use', priority: 0.3, changeFrequency: 'yearly' },
  ]
  const staticEntries = pages.map(p => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }))

  // A staging preview must never enumerate live member profiles.
  if (IS_PREVIEW) return staticEntries

  // Only enumerate the consented public projection. The underlying
  // professional_profiles table is intentionally not readable by anon.
  let profileEntries = []
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import('@supabase/supabase-js')
      const client = createClient(supabaseUrl, supabaseKey)
      const { data, error } = await client
        .rpc('get_consent_verified_marketplace_roster')
        .select('professional_id,projection_refreshed_at,full_name,atb_id,headline,current_job_title,assessment_access,valu_index,assessment_summary')
        .not('professional_id', 'is', null)
      if (error) console.error('sitemap: public roster fetch failed:', error)
      profileEntries = (data || []).filter(isPublicProfileContentReady).map(p => ({
        url: `${SITE_URL}/profile/${p.professional_id}`,
        lastModified: p.projection_refreshed_at ? new Date(p.projection_refreshed_at) : now,
        changeFrequency: 'weekly',
        priority: 0.6,
      }))
    }
  } catch {
    // Build-time Supabase failure must not break sitemap generation.
  }

  return [...staticEntries, ...profileEntries]
}
