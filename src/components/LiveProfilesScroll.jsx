import Link from 'next/link'
import ValoriaAvatar from '@/components/ValoriaAvatar'

const TRACK_META = {
  candidate: { label: 'Talent', href: '/marketplace/talent' },
  speaker: { label: 'Speaker', href: '/marketplace/speakers' },
  facilitator: { label: 'Facilitator', href: '/marketplace/facilitators' },
}

async function getHomepageProfiles() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return { profiles: [], count: null }
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }
  try {
    const [profilesResponse, countResponse] = await Promise.all([
      fetch(`${url}/rest/v1/rpc/get_homepage_professional_previews_v2`, { method: 'POST', headers, body: '{}', cache: 'no-store' }),
      fetch(`${url}/rest/v1/rpc/get_homepage_professional_count`, { method: 'POST', headers, body: '{}', cache: 'no-store' }),
    ])
    const profilesPayload = profilesResponse.ok ? await profilesResponse.json() : []
    const countPayload = countResponse.ok ? await countResponse.json() : null
    return { profiles: Array.isArray(profilesPayload) ? profilesPayload : [], count: typeof countPayload === 'number' ? countPayload : null }
  } catch (error) {
    console.error('Homepage profile data fetch failed:', error)
    return { profiles: [], count: null }
  }
}

export default async function LiveProfilesScroll() {
  const { profiles, count } = await getHomepageProfiles()
  const unique = []
  const seen = new Set()
  for (const profile of profiles) {
    if (seen.has(profile.id)) continue
    seen.add(profile.id)
    unique.push(profile)
  }

  const qualityProfiles = unique.filter(profile => typeof profile.assessment_summary === 'string' && profile.assessment_summary.trim().length >= 12)
  const discoverableCount = count
  const trackCounts = unique.reduce((acc, profile) => {
    const tracks = Array.isArray(profile.active_tracks) ? profile.active_tracks : []
    tracks.forEach(track => { const normalized = track === 'talent' ? 'candidate' : track; if (TRACK_META[normalized]) acc[normalized] = (acc[normalized] || 0) + 1 })
    return acc
  }, {})

  return (
    <section className="live-profiles" aria-labelledby="marketplace-title">
      <div className="live-profiles-shell">
        <div className="live-profiles-copy">
          <div className="live-profiles-kicker">THE VALORIA MARKETPLACE</div>
          <h2 id="marketplace-title" className="live-profiles-title">Find professionals <em>by capability.</em></h2>
          <p className="live-profiles-subtitle">
            Explore public professional profiles that meet Valoria’s listing requirements. Each profile presents structured capability information and VALU evidence where available.
          </p>
          {typeof discoverableCount === 'number' && <div className="live-profiles-proof" aria-label="Public marketplace profile count"><strong>{discoverableCount}</strong><span>public professional profiles</span></div>}
        </div>

        <div className="live-profiles-actions" aria-label="Marketplace actions">
          <Link href="/marketplace/talent" className="live-profile-action primary" data-marketplace-intent="talent">
            <span><small>HIRING / SOURCING</small>Find talent</span><b>→</b>
          </Link>
          <Link href="/marketplace/speakers" className="live-profile-action" data-marketplace-intent="speaker">
            <span><small>EVENTS / PROGRAMMES</small>Find a speaker</span><b>→</b>
          </Link>
          <Link href="/marketplace/facilitators" className="live-profile-action" data-marketplace-intent="facilitator">
            <span><small>WORKSHOPS / CHANGE</small>Find a facilitator</span><b>→</b>
          </Link>
        </div>
      </div>

      {qualityProfiles.length > 0 ? (
        <>
          <div className="vi-scroll-mask vi-scroll-mask-static">
            <div className="vi-scroll-track vi-scroll-track-static">
              {qualityProfiles.map((profile) => {
                const tracks = Array.isArray(profile.active_tracks) ? profile.active_tracks : []
                const normalizedTracks = tracks.map(track => track === 'talent' ? 'candidate' : track)
                const primaryTrack = normalizedTracks.find(track => TRACK_META[track]) || 'candidate'
                const meta = TRACK_META[primaryTrack]
                const capabilityLabels = normalizedTracks.map(track => TRACK_META[track]?.label).filter(Boolean)
                return (
                  <Link
                    href={meta.href}
                    key={profile.id}
                    className="vi-scroll-card"
                    data-marketplace-intent={primaryTrack}
                    aria-label={`Discover more ${meta.label.toLowerCase()} professionals`}
                  >
                    <div className="vi-scroll-avatar" aria-hidden="true">
                      <ValoriaAvatar src={profile.photo_url} seed={profile.id || profile.atb_id} size={64} />
                    </div>
                    <div className="vi-scroll-copy">
                      <div className="vi-scroll-topline"><span>{profile.atb_id || 'VALORIA PROFESSIONAL'}</span><i>LIVE</i></div>
                      <div className="vi-scroll-headline">{profile.assessment_summary}</div>
                      <div className="vi-scroll-track-label">{capabilityLabels.length ? capabilityLabels.join(' · ') : 'Professional'}</div>
                    </div>
                    <div className="vi-scroll-score" aria-label={`VALU Index ${profile.valu_index ?? 'not available'}`}>
                      <span className="vi-scroll-score-label">VALU INDEX</span>
                      <strong>{profile.valu_index ?? '—'}</strong>
                      <span className="vi-scroll-score-max">points</span>
                    </div>
                    <span className="vi-scroll-card-arrow" aria-hidden="true">↗</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="live-profiles-bottom">
            <div className="live-profiles-counts">
              {Object.entries(TRACK_META).map(([track, meta]) => (
                <span key={track}><b>{trackCounts[track] || 0}</b> {meta.label.toLowerCase()} profiles</span>
              ))}
            </div>
            <Link href="/marketplace" className="live-profiles-link" data-marketplace-intent="all">VIEW THE MARKETPLACE <span>→</span></Link>
          </div>
        </>
      ) : (
        <div className="live-profiles-public-state"><span className="live-profiles-dot" />No public professional profiles currently meet the homepage display standard. Visit the marketplace to see current listings.</div>
      )}

      <div className="live-profiles-professional-cta">
        <span className="live-profiles-professional-rule" />
        <div>
          <small>WANT TO BE DISCOVERED?</small>
          <strong>Build a professional profile that helps relevant buyers understand your capabilities.</strong>
        </div>
        <Link href="/valu">BUILD YOUR PROFESSIONAL PROFILE <span>→</span></Link>
      </div></section>
  )
}
