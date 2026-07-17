import { supabase } from '@/lib/supabase'

function getInitials(name) {
  if (!name) return 'Valoria Professional'
  const w = name.trim().split(/\s+/)
  return w.length === 1 ? w[0].slice(0,2).toUpperCase() : (w[0][0] + w[w.length-1][0]).toUpperCase()
}

export async function generateMetadata({ params }) {
  const { id } = params

  // Real professionals live in professional_profiles, not `profiles` (that's
  // the buyer/employer table — no headline, bio, or photo_url columns at
  // all). Querying the wrong table here meant every real professional's
  // profile silently fell through to the generic fallback below: no photo,
  // no bio, no individualized title — for every single share on
  // LinkedIn/WhatsApp/Twitter, with nothing ever erroring to show it.
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
      openGraph: {
        title: `${name} | Valoria Institute`,
        description: profile.bio?.slice(0, 160) || `${name} on Valoria Institute.`,
        images: profile.photo_url ? [{ url: profile.photo_url }] : [{ url: '/og-image.png' }],
      },
      robots: { index: true, follow: true },
    }
  }

  // Fallback for dummy profiles
  const { data: dummy } = await supabase
    .from('marketplace_profiles')
    .select('display_initials, headline, bio, avatar_url, section')
    .eq('id', id)
    .maybeSingle()

  if (dummy) {
    const name = dummy.display_initials || 'Valoria Professional'
    return {
      title: `${name} — ${dummy.section === 'speaker' ? 'Speaker' : 'Professional'} Profile`,
      description: dummy.bio?.slice(0, 160) || `${name} — ${dummy.headline || 'Professional'} on Valoria Institute.`,
      openGraph: {
        title: `${name} | Valoria Institute`,
        images: dummy.avatar_url ? [{ url: dummy.avatar_url }] : [{ url: '/og-image.png' }],
      },
      robots: { index: true, follow: true },
    }
  }

  return {
    title: 'Professional Profile | Valoria Institute',
    robots: { index: false },
  }
}

export default function ProfileLayout({ children }) {
  return children
}
