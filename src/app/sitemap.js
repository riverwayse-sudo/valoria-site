const SITE_URL = 'https://valoriainstitute.com'

const STATIC_PAGES = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/valu', priority: 0.95, changeFrequency: 'monthly' },
  { path: '/prime', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/marketplace', priority: 0.95, changeFrequency: 'daily' },
  { path: '/marketplace/talent', priority: 0.9, changeFrequency: 'daily' },
  { path: '/marketplace/speakers', priority: 0.9, changeFrequency: 'daily' },
  { path: '/marketplace/facilitators', priority: 0.9, changeFrequency: 'daily' },
  { path: '/facilitators', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/develop', priority: 0.75, changeFrequency: 'monthly' },
  { path: '/programmes', priority: 0.65, changeFrequency: 'monthly' },
  { path: '/about-us', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/insights', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/knowledge', priority: 0.85, changeFrequency: 'monthly' },
  { path: '/knowledge/valu-index', priority: 0.85, changeFrequency: 'monthly' },
  { path: '/knowledge/prime-framework', priority: 0.85, changeFrequency: 'monthly' },
  { path: '/knowledge/professional-capability', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/contact-us', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/privacypolicy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms-of-use', priority: 0.3, changeFrequency: 'yearly' },
]

export default async function sitemap() {
  const now = new Date()
  const staticEntries = STATIC_PAGES.map(p => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }))

  let profileEntries = []
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import('@supabase/supabase-js')
      const client = createClient(supabaseUrl, supabaseKey)
      const { data, error } = await client
        .from('professional_profiles')
        .select('id, updated_at, display_name, listing_status, visibility')
        .eq('listing_status', 'listed')
        .or('visibility.is.null,visibility.neq.private')
        .not('display_name', 'is', null)

      if (error) console.error('sitemap: profile fetch failed:', error)
      profileEntries = (data || []).map(p => ({
        url: `${SITE_URL}/profile/${p.id}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: 'weekly',
        priority: 0.6,
      }))
    }
  } catch (error) {
    console.error('sitemap: unexpected profile fetch failure:', error)
  }

  return [...staticEntries, ...profileEntries]
}
