import Link from 'next/link'
import { AssessmentStartLink } from '@/components/Nav'
import ValoriaAvatar from '@/components/ValoriaAvatar'
import { getValuTier, PRIME_CLUSTERS } from '@/lib/brand'
import { getMarketplaceDirectoryData } from '@/lib/marketplace-data'

const TRACK_META = {
  candidate: { label: 'Talent', href: '/marketplace/talent' },
  speaker: { label: 'Speaker', href: '/marketplace/speakers' },
  facilitator: { label: 'Facilitator', href: '/marketplace/facilitators' },
}

const displayText = value => String(value ?? '').normalize('NFKC').replace(/[\uFFFD]/g, '').trim()

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

  const qualityProfiles = profiles.slice(0, 13)
  const discoverableCount = counts.all

  return (
    <section className="live-profiles" aria-labelledby="marketplace-title">
      <div className="live-profiles-shell">
        <div className="live-profiles-copy">
          <div className="live-profiles-kicker">THE VALORIA MARKETPLACE</div>
          <h2 id="marketplace-title" className="live-profiles-title">Find professionals <em>by capability.</em></h2>
          <p className="live-profiles-subtitle">Explore public profiles by capability. Some profiles include additional VALU Index insight where available; every profile requires explicit visibility consent.</p>
          {!dataUnavailable && <div className="live-profiles-proof" aria-label="Public marketplace profile count"><strong>{discoverableCount}</strong><span>public professional profiles</span></div>}
        </div>

        {dataUnavailable ? (
          <div className="live-profiles-actions">
            <Link href="/marketplace" className="live-profile-action primary"><span><small>PUBLIC MARKETPLACE</small>Listings temporarily unavailable</span><b>→</b></Link>
          </div>
        ) : (
          <div className="live-profiles-actions" aria-label="Marketplace and development actions">
            {counts.candidate > 0 ? (
              <Link href="/marketplace/talent" className="live-profile-action primary" data-marketplace-intent="talent"><span><small>ATB CONNECT</small>Find talent</span><b>→</b></Link>
            ) : (
              <a href="/contact-us?type=candidate" className="live-profile-action primary"><span><small>ATB CONNECT</small>Discuss your talent needs</span><b>→</b></a>
            )}
            {counts.speaker > 0 ? (
              <Link href="/marketplace/speakers" className="live-profile-action" data-marketplace-intent="speaker"><span><small>ATB SPOTLIGHT</small>Find a speaker</span><b>→</b></Link>
            ) : (
              <a href="/contact-us?type=speaker_booking" className="live-profile-action"><span><small>ATB SPOTLIGHT</small>Discuss a speaker brief</span><b>→</b></a>
            )}
            {counts.facilitator > 0 ? (
              <Link href="/marketplace/facilitators" className="live-profile-action" data-marketplace-intent="facilitator"><span><small>ATB SPOTLIGHT</small>Find a facilitator</span><b>→</b></Link>
            ) : (
              <Link href="/contact-us?type=training" className="live-profile-action"><span><small>VALORIA DEVELOP</small>Commission a PRIME programme</span><b>→</b></Link>
            )}
          </div>
        )}
      </div>

      {dataUnavailable ? (
        <div className="live-profiles-public-state" role="status">Public profile data could not be verified right now. Please try the marketplace again shortly.</div>
      ) : qualityProfiles.length > 0 ? (
        <>
          <div className="vi-scroll-mask">
            <div className="vi-scroll-track" aria-label="Public professional profiles">
              {[false, true].map((isClone) => (
                <div className="vi-scroll-group" key={isClone ? 'clone' : 'original'} aria-hidden={isClone}>
                  {qualityProfiles.map(profile => {
                    const tracks = Array.isArray(profile.selectedCapabilities) && profile.selectedCapabilities.length
                      ? profile.selectedCapabilities
                      : Array.isArray(profile.selected_capabilities) && profile.selected_capabilities.length
                        ? profile.selected_capabilities
                        : (Array.isArray(profile.capabilities) ? profile.capabilities : [])
                    const normalizedTracks = tracks.map(track => {
                      const value = String(track || '').trim().toLowerCase()
                      return value === 'talent' ? 'candidate' : value
                    })
                    const capabilityStates = Object.entries(TRACK_META).map(([key, meta]) => ({ key, label: meta.label, active: normalizedTracks.includes(key) }))
                    const profileHref = profile.atb_id ? `/profile/${encodeURIComponent(profile.atb_id)}` : '/marketplace'
                    const development = developmentArea(profile.cluster_scores)
                    const isBasic = profile.assessment_access === 'basic'
                    const tier = isBasic ? null : getValuTier(profile.valu_index, 'full')
                    return (
                      <Link href={profileHref} key={profile.id} tabIndex={isClone ? -1 : undefined} className="vi-scroll-card" data-marketplace-intent={normalizedTracks[0] || 'all'} aria-label={`View public professional profile ${profile.atb_id || ''}`}>
                        <div className="vi-scroll-avatar" aria-hidden="true"><ValoriaAvatar src={profile.photo_url} seed={profile.id || profile.atb_id} size={64} /></div>
                        <div className="vi-scroll-copy">
                          <div className="vi-scroll-topline"><span>{profile.atb_id || 'VALORIA PROFESSIONAL'}</span><i>PUBLIC</i></div>
                          <strong className="vi-scroll-name">{profile.atb_id || 'VALORIA PROFESSIONAL'}</strong>
                          <div className="vi-scroll-headline">{displayText(profile.headline)}</div>
                          <div className="vi-scroll-track-label" role="group" aria-label={`Capabilities: ${capabilityStates.map(item => `${item.label} ${item.active ? 'selected' : 'not selected'}`).join(', ')}`}>{capabilityStates.map(item => <span key={item.key} className={item.active ? 'is-active' : 'is-inactive'} aria-hidden="true">{item.label}</span>)}</div>
                          <div className="vi-scroll-designation">{isBasic ? 'PUBLIC PROFILE' : (tier?.name || 'VALU INDEX PROFILE')}</div>
                          {!isBasic && <><div className="vi-scroll-summary">{displayText(profile.assessment_summary)}</div>{development && <div className="vi-scroll-development">TOP DEVELOPMENT AREA · {development}</div>}</>}
                        </div>
                        <div className="vi-scroll-score" aria-label={isBasic ? 'Public professional profile' : `VALU Index ${profile.valu_index} points`}>
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
          <div className="live-profiles-bottom"><Link href="/marketplace" className="live-profiles-link">VIEW THE MARKETPLACE <span>→</span></Link></div>
        </>
      )}

      <div className="live-profiles-professional-cta">
        <span className="live-profiles-professional-rule" />
        <div><small>YOUR PROFESSIONAL PRESENCE</small><strong>Make your capabilities easier to understand and connect to opportunity.</strong></div>
        <AssessmentStartLink href="/valu/register/">TAKE THE VALU INDEX TASTER <span>→</span></AssessmentStartLink>
      </div>
    </section>
  )
}
