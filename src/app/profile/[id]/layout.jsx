import { createClient } from '@supabase/supabase-js'
import { PUBLIC_PROFILE_SELECT } from '@/lib/public-profile'

const SITE_URL = 'https://valoriainstitute.com'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const ATB_RE = /^ATB-[A-Z0-9-]{4,40}$/i

export async function generateMetadata({ params }) {
  const { id } = await params
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Fail closed: without the public roster connection, the page must not be
  // advertised to search engines as an indexable professional profile.
  if (!url || !anonKey || (!UUID_RE.test(id) && !ATB_RE.test(id))) {
    return {
      title: 'Professional Profile | Valoria Institute',
      robots: { index: false, follow: true },
    }
  }

  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: profile, error } = await supabase
      .from('marketplace_public_roster')
      .select(PUBLIC_PROFILE_SELECT)
      .eq(UUID_RE.test(id) ? 'professional_id' : 'atb_id', id)
      .maybeSingle()

    // Only records in the consented, eligible public roster can be indexed.
    if (error || !profile) {
      return {
        title: 'Professional Profile | Valoria Institute',
        robots: { index: false, follow: true },
      }
    }

    const canonicalId = profile.professional_id
    const name = String(profile.full_name || 'Valoria Professional').trim()
    const capability = (profile.capabilities || []).includes('speaker')
      ? 'Speaker'
      : (profile.capabilities || []).includes('facilitator')
        ? 'Facilitator'
        : 'Professional'
    const description = String(
      profile.assessment_summary || profile.bio || profile.headline || `${name} on Valoria Institute.`
    ).trim().slice(0, 160)
    const canonicalUrl = `${SITE_URL}/profile/${canonicalId}`

    return {
      title: `${name} — ${capability} Profile | Valoria Institute`,
      description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        type: 'profile',
        title: `${name} | Valoria Institute`,
        description,
        url: canonicalUrl,
        images: profile.photo_url ? [{ url: profile.photo_url }] : [{ url: '/logo.png' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${name} | Valoria Institute`,
        description,
        images: profile.photo_url ? [profile.photo_url] : ['/logo.png'],
      },
      robots: { index: true, follow: true },
    }
  } catch (error) {
    console.error('Public profile metadata could not be generated:', error)
    return {
      title: 'Professional Profile | Valoria Institute',
      robots: { index: false, follow: true },
    }
  }
}

export default function ProfileLayout({ children }) {
  return children
}
