import Link from 'next/link'

const TRACK_META = {
  candidate: { label: 'Talent', href: '/marketplace/talent' },
  speaker: { label: 'Speaker', href: '/marketplace/speakers' },
  facilitator: { label: 'Facilitator', href: '/marketplace/facilitators' },
}

function letters(value) {
  return value ? value.replace(/\./g, '').toUpperCase() : 'V'
}

async function getHomepageProfiles() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return { profiles: [], count: null }
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }
  try {
    const [profilesResponse, countResponse] = await Promise.all([
      fetch(`${url}/rest/v1/rpc/get_homepage_professional_previews`, { method: 'POST', headers, body: '{}', cache: 'no-store' }),
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

  const loop = [...unique, ...unique]
  const discoverableCount = count ?? unique.length
  const trackCounts = unique.reduce((acc, profile) => {
    const tracks = Array.isArray(profile.active_tracks) ? profile.active_tracks : []
    tracks.forEach(track => { const normalized = track === 'talent' ? 'candidate' : track; if (TRACK_META[normalized]) acc[normalized] = (acc[normalized] || 0) + 1 })
    return acc
  }, {})

  return (
    <section className="live-profiles" aria-labelledby="registry-title">
      <div className="live-profiles-shell">
        <div className="live-profiles-copy">
          <div className="live-profiles-kicker">THE VALORIA REGISTRY · LIVE</div>
          <h2 id="registry-title" className="live-profiles-title">See who is already <em>discoverable.</em></h2>
          <p className="live-profiles-subtitle">
            This is not a feature preview. These are professionals in the live Valoria marketplace — assessed, positioned and discoverable by capability.
          </p>
          <div className="live-profiles-proof" aria-label="Registry summary">
            <strong>{discoverableCount}</strong>
            <span>professionals currently discoverable</span>
          </div>
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

      {unique.length > 0 ? (
        <>
          <div className="vi-scroll-mask">
            <div className="vi-scroll-track">
              {loop.map((profile, index) => {
                const tracks = Array.isArray(profile.active_tracks) ? profile.active_tracks : []
                const normalizedTracks = tracks.map(track => track === 'talent' ? 'candidate' : track)
                const primaryTrack = normalizedTracks.find(track => TRACK_META[track]) || 'candidate'
                const meta = TRACK_META[primaryTrack]
                const capabilityLabels = normalizedTracks.map(track => TRACK_META[track]?.label).filter(Boolean)
                return (
                  <Link
                    href={meta.href}
                    key={`${profile.id}-${index}`}
                    className="vi-scroll-card"
                    data-marketplace-intent={primaryTrack}
                    aria-label={`Discover more ${meta.label.toLowerCase()} professionals`}
                  >
                    <div className="vi-scroll-avatar" aria-hidden="true">
                      {profile.photo_url ? <img src={profile.photo_url} alt="" loading="lazy" /> : <span>{letters(profile.display_initials)}</span>}
                    </div>
                    <div className="vi-scroll-copy">
                      <div className="vi-scroll-topline"><span>{profile.atb_id || letters(profile.display_initials)}</span><i>LIVE</i></div>
                      <div className="vi-scroll-headline">{profile.headline || 'Valoria Professional'}</div>
                      <div className="vi-scroll-track-label">{capabilityLabels.length ? capabilityLabels.join(' · ') : 'Professional'}</div>
                    </div>
                    <div className="vi-scroll-score" aria-label={`VALU Index ${profile.valu_index ?? 'not available'}`}>
                      <span className="vi-scroll-score-label">VALU</span>
                      <strong>{profile.valu_index ?? '—'}</strong>
                      <span className="vi-scroll-score-max">/100</span>
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
            <Link href="/marketplace" className="live-profiles-link" data-marketplace-intent="all">OPEN THE FULL REGISTRY <span>→</span></Link>
          </div>
        </>
      ) : (
        <div className="live-profiles-public-state"><span className="live-profiles-dot" />The public registry is being populated. Start with VALU to build a discoverable professional record.</div>
      )}

      <div className="live-profiles-professional-cta">
        <span className="live-profiles-professional-rule" />
        <div>
          <small>WANT TO BE DISCOVERED?</small>
          <strong>Build the professional record that makes your capability visible.</strong>
        </div>
        <Link href="/valu">START WITH VALU <span>→</span></Link>
      </div></section>
  )
}
