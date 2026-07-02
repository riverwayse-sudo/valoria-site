import { supabase } from '@/lib/supabase'

export async function generateMetadata({ params }) {
  const { id } = params

  // Try real profiles first
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, headline, bio, photo_url, user_type')
    .eq('id', id)
    .single()

  if (profile) {
    const name = profile.display_name || 'Valoria Professional'
    const type = profile.user_type === 'speaker' ? 'Speaker' : 'Professional'
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
    .select('full_name, headline, bio, avatar_url, section')
    .eq('id', id)
    .single()

  if (dummy) {
    const name = dummy.full_name || 'Valoria Professional'
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
