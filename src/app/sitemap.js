const SITE_URL = 'https://valoriainstitute.com'

export default async function sitemap() {
  const now = new Date()

  const pages = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/marketplace', priority: 0.9, changeFrequency: 'daily' },
    { path: '/atb-connect', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/spotlight', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/facilitators', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/develop', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/prime', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/programmes', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/about-us', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/contact-us', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/waitlist', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/signup', priority: 0.6, changeFrequency: 'yearly' },
    { path: '/login', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/privacypolicy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms-of-use', priority: 0.3, changeFrequency: 'yearly' },
  ]

  const staticEntries = pages.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }))

  // Live, listed profiles are real indexable content — include them so
  // search engines and AI answer engines can surface individual talent
  // and speaker profiles, not just the marketing pages.
  let profileEntries = []
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import('@supabase/supabase-js')
      const client = createClient(supabaseUrl, supabaseKey)
      const { data } = await client
        .from('profiles')
        .select('id, updated_at')
        .eq('is_visible', true)
      profileEntries = (data || []).map((p) => ({
        url: `${SITE_URL}/profile/${p.id}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: 'weekly',
        priority: 0.6,
      }))
    }
  } catch {
    // Build-time Supabase failure shouldn't break the whole sitemap
  }

  return [...staticEntries, ...profileEntries]
}
