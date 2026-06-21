import { supabase } from '@/lib/supabase'

const SITE_URL = 'https://valoriainstitute.com'

export async function generateMetadata({ params }) {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, headline, bio, industry, tier, user_type, photo_url, is_visible')
      .eq('id', params.id)
      .single()

    if (!profile || !profile.is_visible) {
      return {
        title: 'Profile',
        robots: { index: false, follow: false },
      }
    }

    const roleLabel = profile.user_type === 'speaker' ? 'Speaker' : 'Professional'
    const title = `${profile.display_name} — ${profile.headline || roleLabel}`
    const description =
      (profile.bio && profile.bio.slice(0, 155)) ||
      `${profile.display_name} is a ${roleLabel.toLowerCase()} on Valoria Institute${profile.industry ? `, in ${profile.industry}` : ''}. Independently assessed against the PRIME framework.`

    return {
      title,
      description,
      alternates: { canonical: `/profile/${params.id}` },
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/profile/${params.id}`,
        type: 'profile',
        images: profile.photo_url
          ? [{ url: profile.photo_url, width: 800, height: 800, alt: profile.display_name }]
          : [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Valoria Institute' }],
      },
      twitter: {
        card: 'summary',
        title,
        description,
        images: [profile.photo_url || '/og-image.png'],
      },
    }
  } catch {
    return { title: 'Profile' }
  }
}

export default function ProfileLayout({ children }) {
  return children
}
