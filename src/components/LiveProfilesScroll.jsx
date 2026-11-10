import Link from 'next/link'
import ValoriaAvatar from '@/components/ValoriaAvatar'
import { BRAND } from '@/lib/brand'

const PLACEHOLDER_HEADLINES = new Set([
  'model',
  'growth dev',
  'help people find meaning in their life and career',
  'valoria professional',
])

const TRACK_META = {
  candidate: { label: 'Talent', href: '/marketplace/talent' },
  speaker: { label: 'Speaker', href: '/marketplace/speakers' },
  facilitator: { label: 'Facilitator', href: '/marketplace/facilitators' },
}

async function getHomepageProfiles() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  // This is a public homepage projection: use the anon key so roster RLS enforces visibility.
  // Never use a service-role key for public Marketplace discovery reads.
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return { profiles: [], count: null }
  const headers = { apikey: key, 'Content-Type': 'application/json' }
  // Publishable API keys are sent in the apikey header, not as a Bearer JWT.
  if (!key.startsWith('sb_publishable_')) headers.Authorization = `Bearer ${key}`
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
    const tracks = Array.isArray(profile.active_tracks) ? profile.active_tracks : []
    const summary = String(profile.assessment_summary || '').trim()
    const headline = String(profile.headline || '').normalize('NFKC').trim()
    const profileId = String(profile.atb_id || '').trim()
    const points = profile.valu_index == null ? null : Number(profile.valu_index)
    // Basic-access profiles have no official score or report summary yet.
    // Full-assessment profiles must have both a valid points result and a VALU report summary.
    const isBasicSnapshot = points === null && summary.length === 0 && headline.length >= 3 && !PLACEHOLDER_HEADLINES.has(headline.toLowerCase()) && !/descriptor unavailable/i.test(headline)
    const isFullAssessmentReady = Number.isInteger(points) && points >= 0 && points <= 100 &&
      summary.length >= 24 && !/descriptor unavailable/i.test(summary)
    const isQualityReady = Boolean(
      profile.id &&
      profileId &&
      (isBasicSnapshot || isFullAssessmentReady) &&
      tracks.some(track => TRACK_META[track === 'talent' ? 'candidate' : track])
    )
    if (!isQualityReady || seen.has(profile.id)) continue
    seen.add(profile.id)
    unique.push(profile)
  }

  const loop = unique
  // The count endpoint covers the full public roster, while previews are capped at 24.
  // Only show a count when every public row was returned and passed the same quality bar.
  const discoverableCount = count !== null && count <= 24 && count === unique.length ? count : null

  return (
    <section className="live-profiles" aria-labelledby="marketplace-title">
      <div className="live-profiles-shell">
        <div className="live-profiles-copy">
          <div className="live-profiles-kicker">{unique.length > 0 ? 'THE VALORIA MARKETPLACE · LIVE' : 'THE VALORIA MARKETPLACE'}</div>
          <h2 id="marketplace-title" className="live-profiles-title">
            {unique.length > 0 ? <>See who is already <em>discoverable.</em></> : <>Professional capability, <em>made discoverable.</em></>}
          </h2>
          <p className="live-profiles-subtitle">
            {unique.length > 0
              ? 'Explore public professional profiles, with assessment information shown according to each person’s Valoria access and visibility status.'
              : 'A capability-led marketplace for employers, event organisers and training buyers to discover professional expertise.'}
          </p>
          {discoverableCount > 0 && unique.length > 0 && (
            <div className="live-profiles-proof" aria-label="Marketplace summary">
              <strong>{discoverableCount}</strong>
              <span>professionals currently discoverable</span>
            </div>
          )}
          <p className="live-profiles-trust">
            VALU Index results are expressed in points. Public profiles appear according to Valoria's eligibility and visibility rules. <Link href="/privacypolicy">Read our Privacy Policy</Link>.
          </p>
        </div>

        {unique.length > 0 && (
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
        )}
      </div>

      {unique.length > 0 ? (
        <>
          <div className="vi-scroll-mask">
            <div className="vi-scroll-track" aria-label="Public professional profiles">
              {[false, true].map((isClone) => (
                <div className="vi-scroll-group" key={isClone ? 'clone' : 'original'} aria-hidden={isClone}>
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
                        tabIndex={isClone ? -1 : undefined}
                      >
                        <div className="vi-scroll-avatar" aria-hidden="true">
                          <ValoriaAvatar src={profile.photo_url} seed={profile.id || profile.atb_id} size={64} />
                        </div>
                        <div className="vi-scroll-copy">
                          <div className="vi-scroll-topline"><span>{profile.atb_id || 'VALORIA PROFESSIONAL'}</span><i>LIVE</i></div>
                          <div className="vi-scroll-headline">{profile.assessment_summary || profile.headline || 'Basic marketplace access. Complete the full VALU assessment to receive your official points-based Index.'}</div>
                          <div className="vi-scroll-track-label">{capabilityLabels.length ? capabilityLabels.join(' · ') : 'Professional'}</div>
                        </div>
                        <div className="vi-scroll-score" aria-label={profile.valu_index != null ? `VALU Index ${profile.valu_index} points` : 'Basic marketplace access'}>
                          <span className="vi-scroll-score-label">{profile.valu_index != null ? 'VALU INDEX' : 'ASSESSMENT'}</span>
                          <strong>{profile.valu_index != null ? profile.valu_index : 'BASIC'}</strong>
                          <span className="vi-scroll-score-max">{profile.valu_index != null ? 'points' : 'ACCESS'}</span>
                        </div>
                        <span className="vi-scroll-card-arrow" aria-hidden="true">↗</span>
                      </Link>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="live-profiles-bottom">
            <Link href="/marketplace" className="live-profiles-link" data-marketplace-intent="all">OPEN THE MARKETPLACE <span>→</span></Link>
          </div>
        </>
      ) : (
        <div className="live-profiles-public-state">
          <div className="live-profiles-empty-copy">
            <span className="live-profiles-empty-kicker">THE VALORIA MARKETPLACE</span>
            <strong>Make professional expertise easier to find.</strong>
            <p>Explore the pathways through which employers, event organisers and programme teams can discover relevant expertise.</p>
            <Link href="/marketplace" className="live-profiles-empty-link">EXPLORE THE MARKETPLACE <span aria-hidden="true">→</span></Link>
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
        <Link href="/valu">START WITH THE VALU TASTER <span>→</span></Link>
      </div></section>
  )
}
