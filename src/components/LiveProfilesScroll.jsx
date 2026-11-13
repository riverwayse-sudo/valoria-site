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

// Staging-only visual fixtures; never expose these as public participant records.
const STAGING_PROFILE_FIXTURES = [
  { id: 'staging-qa-001', atb_id: 'ATB-PREVIEW-001', headline: 'Strategy & Operations', selectedCapabilities: ['candidate', 'speaker'], points: 78 },
  { id: 'staging-qa-002', atb_id: 'ATB-PREVIEW-002', headline: 'Finance & Governance', selectedCapabilities: ['candidate', 'facilitator'], points: 84 },
  { id: 'staging-qa-003', atb_id: 'ATB-PREVIEW-003', headline: 'Digital Transformation', selectedCapabilities: ['speaker', 'facilitator'], points: 72 },
]

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
  const showVisualPreview = process.env.VALU_PREVIEW === '1' && !dataUnavailable && qualityProfiles.length === 0
  const displayProfiles = qualityProfiles.length ? qualityProfiles : (showVisualPreview ? STAGING_PROFILE_FIXTURES : [])
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

      </div>

      {dataUnavailable ? (
        <div className="live-profiles-public-state" role="status">Public profile data could not be verified right now. Please try the marketplace again shortly.</div>
      ) : displayProfiles.length > 0 ? (
        <>
          {showVisualPreview && (
            <>
              <div className="live-profiles-public-state" role="status">
                <strong className="live-profiles-empty-title">The registry is opening through verified capability.</strong>
                Public profiles appear only after the participant has completed the applicable requirements and explicitly agreed to public visibility.
              </div>
              <div className="live-profiles-preview-note" role="note">
                <strong>VISUAL PREVIEW ONLY</strong>
                <span>Illustrative QA fixtures and sample point values — not participant records or live scores.</span>
              </div>
            </>
          )}
          <div className="vi-scroll-mask" aria-label={showVisualPreview ? 'Visual preview of professional profile cards' : 'Public professional profile carousel'}>
            <div className="vi-scroll-track" aria-label={showVisualPreview ? 'Illustrative profile cards' : 'Public professional profiles'}>
              {[false, true].map((isClone) => (
                <div className="vi-scroll-group" key={isClone ? 'clone' : 'original'} aria-hidden={isClone}>
                  {displayProfiles.map((profile, index) => {
                    if (showVisualPreview) {
                      const capabilityStates = Object.entries(TRACK_META).map(([key, meta]) => ({
                        key, label: meta.label, active: profile.selectedCapabilities.includes(key),
                      }))
                      return (
                        <div className="vi-scroll-card" key={profile.id} data-visual-fixture={isClone ? undefined : 'true'} aria-label="QA visual fixture, not a participant profile">
                          <div className="vi-scroll-avatar" aria-hidden="true"><ValoriaAvatar seed={profile.id} size={64} /></div>
                          <div className="vi-scroll-copy">
                            <div className="vi-scroll-topline"><span>{profile.atb_id}</span><i>VISUAL FIXTURE</i></div>
                            <strong className="vi-scroll-name">Illustrative Professional {String(index + 1).padStart(2, '0')}</strong>
                            <div className="vi-scroll-headline">{profile.headline}</div>
                            <div className="vi-scroll-track-label" role="group" aria-label={`Capabilities: ${capabilityStates.map(item => `${item.label} ${item.active ? 'selected' : 'not selected'}`).join(', ')}`}>{capabilityStates.map(item => <span key={item.key} className={item.active ? 'is-active' : 'is-inactive'} aria-hidden="true">{item.label}</span>)}</div>
                            <div className="vi-scroll-designation">QA VISUAL PREVIEW</div>
                            <div className="vi-scroll-summary">Synthetic content for layout review only</div>
                            <div className="vi-scroll-development">Not a participant profile</div>
                          </div>
                          <div className="vi-scroll-score" aria-label="Illustrative VALU Index points for visual QA only">
                            <span className="vi-scroll-score-label">VALU INDEX</span>
                            <strong>{profile.points}</strong>
                            <span className="vi-scroll-score-max">PTS · QA</span>
                          </div>
                        </div>
                      )
                    }
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
      ) : (
        <div className="live-profiles-public-state" role="status">
          <strong className="live-profiles-empty-title">The registry is opening through verified capability.</strong>
          Public profiles appear only after the participant has completed the applicable requirements and explicitly agreed to public visibility. Until then, employers and organisers can submit a brief and our team can advise on the appropriate next step.
        </div>
      )}


      <div className="live-profiles-actions" aria-label="Valoria engagement routes">
        <Link href="/contact-us?type=hiring" className="live-profile-action primary">
          <span><small>ATB CONNECT</small>Discuss your talent needs</span><b>→</b>
        </Link>
        <Link href="/contact-us?type=speaker" className="live-profile-action">
          <span><small>ATB SPOTLIGHT</small>Discuss a speaker brief</span><b>→</b>
        </Link>
        <Link href="/contact-us?type=training" className="live-profile-action">
          <span><small>VALORIA DEVELOP</small>Commission a PRIME programme</span><b>→</b>
        </Link>
      </div>

      <div className="live-profiles-professional-cta">
        <span className="live-profiles-professional-rule" />
        <div><small>YOUR PROFESSIONAL PRESENCE</small><strong>Make your capabilities easier to understand and connect to opportunity.</strong></div>
        <AssessmentStartLink href="/valu/register/">TAKE THE VALU INDEX TASTER <span>→</span></AssessmentStartLink>
      </div>
    </section>
  )
}
