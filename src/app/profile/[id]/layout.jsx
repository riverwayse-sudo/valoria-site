const SITE_URL = 'https://valoriainstitute.com'

export async function generateMetadata({ params }) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseKey) return { title: 'Profile' }

    const { createClient } = await import('@supabase/supabase-js')
    const client = createClient(supabaseUrl, supabaseKey)
    const { data: profile } = await client
      .from('profiles')
      .select('display_name, headline, bio, industry, tier, user_type, photo_url, is_visible, valu_score')
      .eq('id', params.id)
      .single()

    if (!profile || !profile.is_visible) return { title: 'Profile', robots: { index: false, follow: false } }

    const roleLabel = profile.user_type === 'speaker' ? 'Speaker' : 'Professional'
    const scoreLine = profile.valu_score != null ? ` VALU Index: ${profile.valu_score}/100.` : ''
    const title = `${profile.display_name} — ${profile.headline || roleLabel}`
    const description = (profile.bio && profile.bio.slice(0, 140) + scoreLine) ||
      `${profile.display_name} is a ${roleLabel.toLowerCase()} on Valoria Institute${profile.industry ? `, in ${profile.industry}` : ''}.${scoreLine} Independently assessed against the PRIME framework.`

    return {
      title,
      description,
      alternates: { canonical: `/profile/${params.id}` },
      openGraph: {
        title, description,
        url: `${SITE_URL}/profile/${params.id}`,
        type: 'profile',
        images: profile.photo_url
          ? [{ url: profile.photo_url, width: 800, height: 800, alt: profile.display_name }]
          : [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Valoria Institute' }],
      },
      twitter: { card: 'summary', title, description, images: [profile.photo_url || '/og-image.png'] },
    }
  } catch { return { title: 'Profile' } }
}

export default function ProfileLayout({ children }) { return children }
