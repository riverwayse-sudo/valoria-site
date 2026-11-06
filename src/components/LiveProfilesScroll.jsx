import Link from 'next/link'
import ValoriaAvatar from '@/components/ValoriaAvatar'
import { BRAND } from '@/lib/brand'

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

  const loop = [...unique, ...unique]
  const discoverableCount = Math.max(count ?? 0, unique.length)
  const trackCounts = unique.reduce((acc, profile) => {
    const tracks = Array.isArray(profile.active_tracks) ? profile.active_tracks : []
    tracks.forEach(track => { const normalized = track === 'talent' ? 'candidate' : track; if (TRACK_META[normalized]) acc[normalized] = (acc[normalized] || 0) + 1 })
    return acc
  }, {})

  return (
    <section className="live-profiles" aria-labelledby="registry-title">
      <div className="live-profiles-shell">
        <div className="live-profiles-copy">
          <div className="live-profiles-kicker">{unique.length > 0 ? 'THE VALORIA REGISTRY · LIVE' : 'THE AFRICAN TALENT BUREAU'}</div>
          <h2 id="registry-title" className="live-profiles-title">
            {unique.length > 0 ? <>See who is already <em>discoverable.</em></> : <>Professional capability, <em>made discoverable.</em></>}
          </h2>
          <p className="live-profiles-subtitle">
            {unique.length > 0
              ? 'These are professionals in the Valoria marketplace — assessed, positioned and discoverable by capability.'
              : 'A capability-led professional registry connecting organisations with talent, speakers and facilitators across Africa.'}
          </p>
          {discoverableCount > 0 && unique.length > 0 && (
            <div className="live-profiles-proof" aria-label="Registry summary">
              <strong>{discoverableCount}</strong>
              <span>professionals currently discoverable</span>
            </div>
          )}
          <p className="live-profiles-trust">
            VALU Index results are expressed in points on a 100-point scale. Explore each profile for capability context. {BRAND.compliance}. <Link href="/privacypolicy">Read our Privacy Policy</Link>.
          </p>
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
                    aria-hidden={index >= unique.length ? true : undefined}
                    tabIndex={index >= unique.length ? -1 : undefined}
                  >
                    <div className="vi-scroll-avatar" aria-hidden="true">
                      <ValoriaAvatar src={profile.photo_url} seed={profile.id || profile.atb_id} size={64} />
                    </div>
                    <div className="vi-scroll-copy">
                      <div className="vi-scroll-topline"><span>{profile.atb_id || 'VALORIA PROFESSIONAL'}</span><i>LIVE</i></div>
                      <div className="vi-scroll-headline">{profile.assessment_summary || 'Assessment-based capability descriptor unavailable.'}</div>
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
            <Link href="/marketplace" className="live-profiles-link" data-marketplace-intent="all">OPEN THE FULL REGISTRY <span>→</span></Link>
          </div>
        </>
      ) : (
        <div className="live-profiles-public-state">
          <div className="live-profiles-empty-copy">
            <span className="live-profiles-empty-kicker">THE AFRICAN TALENT BUREAU</span>
            <strong>Make professional expertise easier to find.</strong>
            <p>Explore the pathways through which employers, event organisers and programme teams can discover relevant expertise.</p>
            <Link href="/marketplace" className="live-profiles-empty-link">EXPLORE THE BUREAU <span aria-hidden="true">→</span></Link>
          </div>
          <div className="live-profiles-empty-grid">
            <div className="live-profiles-empty-card"><span>01 · TALENT</span><strong>Professional capability</strong><small>For hiring and sourcing.</small></div>
            <div className="live-profiles-empty-card"><span>02 · SPEAKERS</span><strong>Subject expertise</strong><small>For events and conversations.</small></div>
            <div className="live-profiles-empty-card"><span>03 · FACILITATORS</span><strong>Learning and change</strong><small>For programmes and workshops.</small></div>
          </div>
        </div>
      )}

      <div className="live-profiles-professional-cta">
        <span className="live-profiles-professional-rule" />
        <div>
          <small>WANT TO BE DISCOVERED?</small>
          <strong>Build the professional record that makes your capability visible.</strong>
        </div>
        <Link href="/valu">START WITH VALU INDEX <span>→</span></Link>
      </div></section>
  )
}
