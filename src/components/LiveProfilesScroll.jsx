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
  // Use the narrowly scoped public roster RPC; direct roster table reads are denied by RLS.
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return { profiles: [], count: null }
  const headers = { apikey: key, 'Content-Type': 'application/json' }
  if (!key.startsWith('sb_publishable_')) headers.Authorization = `Bearer ${key}`
  try {
    const response = await fetch(`${url}/rest/v1/rpc/get_marketplace_public_roster_v1`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ p_professional_id: null, p_atb_id: null }),
      cache: 'no-store',
    })
    const payload = response.ok ? await response.json() : []
    const profiles = Array.isArray(payload) ? payload.map(profile => ({
      ...profile,
      id: profile.professional_id,
      active_tracks: Array.isArray(profile.selected_capabilities) && profile.selected_capabilities.length
        ? profile.selected_capabilities
        : (Array.isArray(profile.capabilities) ? profile.capabilities : []),
    })) : []
    return { profiles, count: null }
  } catch (error) {
    console.error('Homepage public roster RPC failed:', error)
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
    const headline = String(profile.headline || '').trim()
    const profileId = String(profile.atb_id || '').normalize('NFKC').trim()
    const points = Number(profile.valu_index)
    const placeholderHeadlines = new Set(['model', 'valoria professional', 'growth dev', 'help people find meaning in their life and career'])
    const isQualityReady = Boolean(
      profile.id &&
      profileId &&
      summary.length >= 24 &&
      headline.length >= 3 &&
      !placeholderHeadlines.has(headline.toLowerCase()) &&
      !/[\u{1D400}-\u{1D7FF}]/u.test(headline) &&
      !/descriptor unavailable/i.test(summary) &&
      Number.isInteger(points) &&
      points >= 0 &&
      points <= 100 &&
      tracks.some(track => TRACK_META[track === 'talent' ? 'candidate' : track])
    )
    if (!isQualityReady || seen.has(profile.id)) continue
    seen.add(profile.id)
    unique.push(profile)
  }

  const loop = unique.slice(0, 4)
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
              ? 'These are professionals in the Valoria marketplace — assessed, positioned and discoverable by capability.'
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
                          <div className="vi-scroll-topline"><span>{String(profile.atb_id || 'VALORIA PROFESSIONAL').normalize('NFKC')}</span><i>LIVE</i></div>
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
