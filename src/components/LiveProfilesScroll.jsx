import Link from 'next/link'
import ValoriaAvatar from '@/components/ValoriaAvatar'
import { getValuTier, PRIME_CLUSTERS } from '@/lib/brand'
import { getMarketplaceDirectoryData } from '@/lib/marketplace-data'

const TRACK_META = {
  candidate: { label: 'Talent', href: '/marketplace/talent' },
  speaker: { label: 'Speaker', href: '/marketplace/speakers' },
  facilitator: { label: 'Facilitator', href: '/marketplace/facilitators' },
}

const displayText = value => String(value ?? '').normalize('NFKC').replace(/[\\uFFFD]/g, '').trim()

function developmentArea(scores) {
  if (!scores || typeof scores !== 'object') return null
  const weakest = Object.entries(scores)
    .filter(([letter, value]) => PRIME_CLUSTERS.some(cluster => cluster.letter === letter) && Number.isFinite(Number(value)))
    .sort((a, b) => Number(a[1]) - Number(b[1]))[0]
  return weakest ? PRIME_CLUSTERS.find(cluster => cluster.letter === weakest[0])?.name || null : null
}

export default async function LiveProfilesScroll() {
  let profiles = []
  let counts = { all: 0, candidate: 0, speaker: 0, facilitator: 0 }
  let dataUnavailable = false
  try {
    const data = await getMarketplaceDirectoryData('all')
    profiles = data.rows
    counts = data.counts
  } catch (error) {
    console.error('Homepage marketplace data unavailable:', error)
    dataUnavailable = true
  }

  // The server-only Registry projection has already applied consent, assessment,
  // listing and revocation checks before rows reach this public component.
  const unique = profiles.slice(0, 13)
  const loop = unique
  const discoverableCount = counts.all

  return (
    <section className="live-profiles" aria-labelledby="marketplace-title">
      <div className="live-profiles-shell">
        <div className="live-profiles-copy">
          <div className="live-profiles-kicker">THE VALORIA MARKETPLACE</div>
          <h2 id="marketplace-title" className="live-profiles-title">
            <>Find professionals <em>by capability.</em></>
          </h2>
          <p className="live-profiles-subtitle">
            Explore public professional profiles by capability. VALU Index insight appears where available for public display. Professionals choose whether their profiles are visible.
          </p>
          {!dataUnavailable && discoverableCount > 0 && unique.length > 0 && (
            <div className="live-profiles-proof" aria-label="Marketplace summary">
              <strong>{discoverableCount}</strong>
              <span>professionals currently discoverable</span>
            </div>
          )}
          <p className="live-profiles-trust">
            VALU Index results are expressed in points. Public profiles appear according to Valoria's eligibility and visibility rules. <Link href="/privacypolicy">Read our Privacy Policy</Link>.
          </p>
        </div>

        {dataUnavailable ? (
          <div className="live-profiles-actions" role="status">
            <Link href="/marketplace" className="live-profile-action primary"><span><small>PUBLIC MARKETPLACE</small>Listings temporarily unavailable</span><b>→</b></Link>
          </div>
        ) : (
          <div className="live-profiles-actions" aria-label="Marketplace actions">
            {counts.candidate > 0 ? (
              <Link href="/marketplace/talent" className="live-profile-action primary" data-marketplace-intent="talent"><span><small>TALENT</small>Find talent</span><b>→</b></Link>
            ) : (
              <Link href="/contact-us?type=candidate" className="live-profile-action primary"><span><small>TALENT</small>Share a talent brief</span><b>→</b></Link>
            )}
            {counts.speaker > 0 ? (
              <Link href="/marketplace/speakers" className="live-profile-action" data-marketplace-intent="speaker"><span><small>EVENTS</small>Find a speaker</span><b>→</b></Link>
            ) : (
              <Link href="/contact-us?type=speaker_booking" className="live-profile-action"><span><small>EVENTS</small>Discuss a speaker brief</span><b>→</b></Link>
            )}
            {counts.facilitator > 0 ? (
              <Link href="/marketplace/facilitators" className="live-profile-action" data-marketplace-intent="facilitator"><span><small>LEARNING & CHANGE</small>Find a facilitator</span><b>→</b></Link>
            ) : (
              <Link href="/contact-us?type=training" className="live-profile-action"><span><small>LEARNING & CHANGE</small>Commission a PRIME program</span><b>→</b></Link>
            )}
          </div>
        )}
      </div>

      {dataUnavailable ? (
        <div className="live-profiles-public-state" role="status">Public profile data could not be verified right now. Please try the marketplace again shortly.</div>
      ) : unique.length > 0 ? (
        <>
          <div className="vi-scroll-mask">
            <div className="vi-scroll-track" aria-label="Public professional profiles">
              {[false, true].map((isClone) => (
                <div className="vi-scroll-group" key={isClone ? 'clone' : 'original'} aria-hidden={isClone}>
                  {loop.map((profile, index) => {
                    const tracks = Array.isArray(profile.selectedCapabilities) && profile.selectedCapabilities.length
                      ? profile.selectedCapabilities
                      : Array.isArray(profile.selected_capabilities) && profile.selected_capabilities.length
                        ? profile.selected_capabilities
                        : (Array.isArray(profile.capabilities) ? profile.capabilities : [])
                    const normalizedTracks = tracks.map(track => track === 'talent' ? 'candidate' : track)
                    const capabilityLabels = normalizedTracks.map(track => TRACK_META[track]?.label).filter(Boolean)
                    const profileHref = profile.atb_id ? `/profile/${encodeURIComponent(profile.atb_id)}` : '/marketplace'
                    const isBasic = profile.assessment_access === 'basic'
                    const tier = isBasic ? null : getValuTier(profile.valu_index, 'full')
                    const development = developmentArea(profile.cluster_scores)
                    return (
                      <Link
                        href={profileHref}
                        key={`${profile.id}-${index}`}
                        className="vi-scroll-card"
                        data-marketplace-intent={normalizedTracks[0] || 'all'}
                        aria-label={`View public professional profile ${profile.atb_id || ''}`}
                        tabIndex={isClone ? -1 : undefined}
                      >
                        <div className="vi-scroll-avatar" aria-hidden="true">
                          <ValoriaAvatar src={profile.photo_url} seed={profile.id || profile.atb_id} size={64} />
                        </div>
                        <div className="vi-scroll-copy">
                          <div className="vi-scroll-topline"><span>{profile.atb_id || 'VALORIA PROFESSIONAL'}</span><i>LIVE</i></div>
                          <div className="vi-scroll-headline">{displayText(profile.headline)}</div>
                          <div className="vi-scroll-track-label">{capabilityLabels.length ? capabilityLabels.join(' · ') : 'NO DECLARED ROLE'}</div>
                          <div className="vi-scroll-designation">{isBasic ? 'PROFESSIONAL LISTING' : (tier?.name || 'PROFESSIONAL LISTING')}</div>
                          {!isBasic && <><div className="vi-scroll-summary">{displayText(profile.assessment_summary)}</div>{development && <div className="vi-scroll-development">TOP DEVELOPMENT AREA · {development}</div>}</>}
                        </div>
                        <div className="vi-scroll-score" aria-label={isBasic ? 'Public professional listing' : `VALU Index ${profile.valu_index} points`}>
                          <span className="vi-scroll-score-label">{isBasic ? 'PROFILE' : 'VALU INDEX'}</span>
                          <strong>{isBasic ? 'PUBLIC' : profile.valu_index}</strong>
                          {!isBasic && <span className="vi-scroll-score-max">points</span>}
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
            <p>Explore the pathways through which employers, event organizers and program teams can discover relevant expertise.</p>
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
          <strong>Build a professional profile that helps relevant decision-makers understand your capabilities.</strong>
        </div>
        <Link href="/valu">START WITH THE VALU TASTER <span>→</span></Link>
      </div></section>
  )
}
