import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
  { auth: { persistSession: false, autoRefreshToken: false } }
)

function getInitials(name) {
  if (!name) return 'Valoria Professional'
  const w = name.trim().split(/\s+/)
  return w.length === 1 ? w[0].slice(0,2).toUpperCase() : (w[0][0] + w[w.length-1][0]).toUpperCase()
}

export async function generateMetadata({ params }) {
  const { id } = params

  // Public professional profiles use the authoritative professional profile source.
  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('display_name, headline, bio, photo_url, active_tracks')
    .eq('id', id)
    .maybeSingle()

  if (profile) {
    const name = getInitials(profile.display_name)
    const type = (profile.active_tracks || []).includes('speaker') ? 'Speaker' : 'Professional'
    return {
      title: `${name} — ${type} Profile`,
      description: profile.bio?.slice(0, 160) || `${name} — ${profile.headline || type} on Valoria Institute.`,
      alternates: { canonical: `/profile/${id}` },
      openGraph: {
        title: `${name} | Valoria Institute`,
        description: profile.bio?.slice(0, 160) || `${name} on Valoria Institute.`,
        url: `/profile/${id}`,
        images: profile.photo_url ? [{ url: profile.photo_url }] : [{ url: '/og-image.png' }],
      },
      robots: { index: true, follow: true },
    }
  }

  return {
    title: 'Professional Profile | Valoria Institute',
    alternates: { canonical: `/profile/${id}` },
    robots: { index: false },
  }
}

export default function ProfileLayout({ children }) {
  return children
}