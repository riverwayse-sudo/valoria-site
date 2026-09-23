import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
  { auth: { persistSession: false, autoRefreshToken: false } }
)

const SITE_URL = 'https://valoriainstitute.com'

export async function generateMetadata({ params }) {
  const { id } = await params
  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('id,display_name,headline,bio,photo_url,active_tracks,listing_status,visibility,updated_at')
    .eq('id', id)
    .maybeSingle()

  const publiclyListed = Boolean(profile && profile.listing_status === 'listed' && profile.visibility !== 'private' && profile.display_name)

  if (!publiclyListed) {
    return {
      title: 'Professional Profile | Valoria Institute',
      robots: { index: false, follow: false },
    }
  }

  const name = profile.display_name.trim()
  const type = (profile.active_tracks || []).includes('speaker')
    ? 'Speaker'
    : (profile.active_tracks || []).includes('facilitator') ? 'Facilitator' : 'Professional'
  const description = profile.bio?.replace(/\s+/g, ' ').trim().slice(0, 160)
    || `${name} — ${profile.headline || type} on Valoria Institute.`

  return {
    title: `${name} — ${type} Profile`,
    description,
    alternates: { canonical: `/profile/${id}` },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
    openGraph: {
      type: 'profile',
      title: `${name} | Valoria Institute`,
      description,
      url: `${SITE_URL}/profile/${id}`,
      images: profile.photo_url ? [{ url: profile.photo_url, alt: `${name} — Valoria Institute profile` }] : [{ url: '/valoria-original.png', alt: 'Valoria Institute' }],
    },
  }
}

export default function ProfileLayout({ children }) {
  return children
}
