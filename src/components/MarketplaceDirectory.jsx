'use client'

import Link from 'next/link'
import EnquiryForm from '@/components/EnquiryForm'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './MarketplaceDirectory.module.css'
import ValoriaAvatar from '@/components/ValoriaAvatar'
import { getValuTier, PRIME_CLUSTERS, PRIME_CLUSTER_NAMES, TIER_DESIGNATIONS } from '@/lib/brand'
import capabilityEvidence from '@/lib/profile-capability-evidence.cjs'
const { normalizeCapabilityTrack, getCapabilityEvidence, getCapabilityEvidenceSummary, getCapabilityCardLabels } = capabilityEvidence

const TRACKS = [
  ['all','All', '/marketplace'],
  ['candidate','Talent','/marketplace/talent'],
  ['speaker','Speakers','/marketplace/speakers'],
  ['facilitator','Facilitators','/marketplace/facilitators'],
]
const CLUSTER_NAMES = PRIME_CLUSTER_NAMES
const SCORE_BANDS = TIER_DESIGNATIONS.filter(tier => tier.min >= 35).map(tier => ({ name:tier.name, min:tier.min, max:tier.max }))

const normalize = v => String(v || '').toLowerCase() === 'talent' ? 'candidate' : String(v || '').toLowerCase()
const displayText = v => String(v ?? '').normalize('NFKC').replace(/[\uFFFD]/g, '').trim()
const titleCase = v => String(v || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())
const cleanSkill = v => displayText(v).replace(/\s*★$/, '')

export default function MarketplaceDirectory({ rows = [], counts = {}, activeTrack = 'all', dataUnavailable = false }) {
  const router = useRouter()
  const selectedTrack = normalizeCapabilityTrack(activeTrack || 'all')
  const [query,setQuery] = useState('')
  const [sector,setSector] = useState('')
  const [cluster,setCluster] = useState('')
  const [skill,setSkill] = useState('')
  const [scoreBand,setScoreBand] = useState('')
  const [selectedProfile, setSelectedProfile] = useState(null)
  const closeProfilePreview = useCallback(() => setSelectedProfile(null), [])

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') router.refresh()
    }
    const interval = window.setInterval(refreshWhenVisible, 30_000)
    document.addEventListener('visibilitychange', refreshWhenVisible)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [router])

  useEffect(() => {
    setCluster('')
    setSkill('')
    setScoreBand('')
  }, [selectedTrack])

  const sectors = useMemo(() => [...new Set(rows.map(r=>displayText(r.industry)).filter(Boolean))].sort(), [rows])
  const skills = useMemo(() => {
    const values = rows.flatMap(profile => {
      if (selectedTrack === 'speaker') return [...labelValues(profile.topics), ...labelValues(profile.format_capabilities)]
      if (selectedTrack === 'facilitator') return [...labelValues(profile.facilitation_topics), ...labelValues(profile.programme_types), ...labelValues(profile.format_capabilities)]
      if (selectedTrack === 'candidate') return labelValues(profile.skills)
      return [
        ...PRIME_CLUSTERS.flatMap(cluster => cluster.skills.map(cleanSkill)),
        ...labelValues(profile.skills),
        ...labelValues(profile.topics),
        ...labelValues(profile.facilitation_topics),
        ...labelValues(profile.programme_types),
        ...labelValues(profile.format_capabilities),
      ]
    })
    return [...new Set(values.map(cleanSkill).filter(Boolean))].sort()
  }, [rows, selectedTrack])

  const results = useMemo(() => {
    const q=query.trim().toLowerCase()
    return rows.filter(p => {
      const caps=(p.selectedCapabilities || p.selected_capabilities || p.capabilities || p.tracks || [p.track]).map(normalize)
      if(selectedTrack !== 'all' && !caps.includes(selectedTrack)) return false
      if(sector && displayText(p.industry) !== sector) return false
      const trackEvidence = selectedTrack === 'all'
        ? [...labelValues(p.skills), ...labelValues(p.topics), ...labelValues(p.facilitation_topics), ...labelValues(p.programme_types), ...labelValues(p.format_capabilities)]
        : getCapabilityEvidence(p, selectedTrack).flatMap(section => section.items)
      if(selectedTrack === 'all' && cluster && !Number.isFinite(Number(p.cluster_scores?.[cluster]))) return false
      if(skill && !trackEvidence.some(v=>v.toLowerCase()===skill.toLowerCase())) return false
      if(selectedTrack === 'all' && scoreBand) {
        const band = SCORE_BANDS.find(item => item.name === scoreBand)
        const points = Number(p.valu_index)
        if (!band || p.assessment_access !== 'full' || !Number.isFinite(points) || points < band.min || points > band.max) return false
      }
      if(!q) return true
      return [p.full_name,p.headline,p.current_job_title,p.atb_id,p.industry,...trackEvidence].some(v=>displayText(v).toLowerCase().includes(q))
    }).sort((a, b) => {
      const scored = value => value.assessment_access === 'full' && Number.isFinite(Number(value.valu_index))
      const isAvailable = value => /^(available|accepting|open)$/i.test(displayText(value.availability_status))
      return (selectedTrack === 'all' ? Number(scored(b)) - Number(scored(a)) : 0) ||
        Number(isAvailable(b)) - Number(isAvailable(a)) ||
        displayText(a.full_name).localeCompare(displayText(b.full_name))
    })
  },[rows,selectedTrack,query,sector,cluster,skill,scoreBand])

  const clearFilters = () => { setQuery(''); setSector(''); setCluster(''); setSkill(''); setScoreBand('') }
  const activeCount = Number(counts?.[selectedTrack] ?? counts?.all ?? 0)
  const hasPublicListings = rows.length > 0 || activeCount > 0

  return <div className={styles.page}>
    <Nav />
    <main>
      <section className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>{selectedTrack === 'candidate' ? 'ATB CONNECT' : selectedTrack === 'speaker' || selectedTrack === 'facilitator' ? 'ATB SPOTLIGHT' : 'VALORIA MARKETPLACE'}</p>
          <h1>
            {selectedTrack === 'all' && <>Find professionals<br/><i>by capability.</i></>}
            {selectedTrack === 'candidate' && <>Precision hiring,<br/><i>not CV triage.</i></>}
            {selectedTrack === 'speaker' && <>Find a speaker<br/><i>who can hold a room.</i></>}
            {selectedTrack === 'facilitator' && <>Find a facilitator<br/><i>for the work ahead.</i></>}
          </h1>
          <p className={styles.lede}>
            {selectedTrack === 'all' && 'Discover professionals by demonstrated capability, sector and declared expertise.'}
            {selectedTrack === 'candidate' && 'Find professionals by demonstrated capability, sector and declared expertise.'}
            {selectedTrack === 'speaker' && 'Discover speakers by speaking topics, delivery formats, audience experience and engagements.'}
            {selectedTrack === 'facilitator' && 'Discover facilitators by facilitation topics, programme types, delivery formats and client evidence. For a structured team development programme, explore Valoria Develop.'}
          </p>
          {(selectedTrack === 'all' || selectedTrack === 'candidate') && <Link className={styles.shortlistCta} href="/contact-us?type=candidate">{hasPublicListings ? 'REQUEST A SHORTLIST' : 'DISCUSS YOUR TALENT NEEDS'} <span aria-hidden="true">→</span></Link>}
          {selectedTrack === 'facilitator' && <Link className={styles.view} href="/programmes">EXPLORE VALORIA DEVELOP</Link>}
          <nav className={styles.tabs} aria-label="Filter by declared role">{TRACKS.map(([id,label,href])=><Link key={id} href={href} className={selectedTrack===id ? styles.activeTab : ''}>{label}<b>{counts[id] || 0}</b></Link>)}</nav>
        </div>
      </section>
      {hasPublicListings && (
      <section className={styles.controls}>
        <div className={styles.containerControl}>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={selectedTrack === 'speaker' ? 'Search speaking topics, formats or sectors…' : selectedTrack === 'facilitator' ? 'Search facilitation topics, programmes or sectors…' : selectedTrack === 'candidate' ? 'Search talent skills, roles or sectors…' : 'Search professionals, capabilities or sectors…'} aria-label="Search marketplace"/>
          {selectedTrack === 'all' && <select className="vi-select--light" value={cluster} onChange={e=>setCluster(e.target.value)} aria-label="Filter by PRIME cluster">
            <option value="">All professional areas</option>
            {PRIME_CLUSTERS.map(item=><option key={item.letter} value={item.letter}>{item.name}</option>)}
          </select>}
          <select className="vi-select--light" value={skill} onChange={e=>setSkill(e.target.value)} aria-label={selectedTrack === 'speaker' ? 'Filter by speaking topic or format' : selectedTrack === 'facilitator' ? 'Filter by facilitation topic or programme type' : selectedTrack === 'candidate' ? 'Filter by Talent skill' : 'Filter by capability'}>
            <option value="">{selectedTrack === 'speaker' ? 'All speaking topics and formats' : selectedTrack === 'facilitator' ? 'All facilitation specialisms' : selectedTrack === 'candidate' ? 'All Talent skills' : 'All capabilities'}</option>
            {skills.map(value=><option key={value} value={value}>{value}</option>)}
          </select>
          {selectedTrack === 'all' && <select className="vi-select--light" value={scoreBand} onChange={e=>setScoreBand(e.target.value)} aria-label="Filter by VALU Index points band">
            <option value="">All VALU Index scores</option>
            {SCORE_BANDS.map(value=><option key={value.name} value={value.name}>{value.name} · {value.min}–{value.max} points</option>)}
          </select>}
          <select className="vi-select--light" value={sector} onChange={e=>setSector(e.target.value)} aria-label="Filter by sector">
            <option value="">All sectors</option>
            {sectors.map(value=><option key={value} value={value}>{value}</option>)}
          </select>
          {(query || sector || cluster || skill || scoreBand) && <button onClick={clearFilters}>CLEAR</button>}
        </div>
        <details className={styles.filterHelp}><summary>How filtering works</summary><p>{selectedTrack === 'all' ? 'Filter by professional area, capabilities, sector or overall VALU Index points.' : selectedTrack === 'speaker' ? 'Filter by speaking topics, formats and sector. The overall VALU Index report remains in the General view.' : selectedTrack === 'facilitator' ? 'Filter by facilitation topics, programme types, delivery formats and sector. The overall VALU Index report remains in the General view.' : 'Filter by Talent skills and sector. The overall VALU Index report remains in the General view.'} We only show information approved for public display.</p></details>
      </section>
      )}
      <section className={styles.directory} data-directory-root="true">
        <div className={styles.container}>
          <div className={styles.directoryHead} data-directory-head="true">
            <div><p className={styles.eyebrow}>PUBLIC MARKETPLACE</p><h2 data-directory-count="true">{dataUnavailable ? 'Directory unavailable' : `${results.length} ${results.length===1?'professional':'professionals'}`}</h2></div>
            <span>{selectedTrack === 'all' ? 'Assessment-informed professional profiles' : selectedTrack === 'speaker' ? 'Speaking topics, formats and engagements' : selectedTrack === 'facilitator' ? 'Facilitation topics, programmes and client evidence' : 'Talent skills and professional context'}</span>
          </div>
          {dataUnavailable ? (
            <div className={styles.empty} data-directory-empty="true">
              <strong>Marketplace data could not be verified.</strong>
              <p>The directory is temporarily unavailable. Try again shortly.</p>
              <button type="button" className={styles.view} onClick={() => router.refresh()}>RETRY →</button>
            </div>
          ) : results.length ? <div className={styles.grid} data-directory-grid="true">{results.map(p=><Profile key={p.id} p={p} activeTrack={selectedTrack} onSelect={() => setSelectedProfile(p)}/>)}</div> :
            rows.length === 0 && selectedTrack === 'all' ? (
              <div className={styles.empty} data-directory-empty="true">
                <strong>No public professional profiles are currently available.</strong>
                <p>Public profiles appear when they meet Valoria’s listing requirements.</p>
                <Link className={styles.view} href="/login?returnTo=%2Fprofile%2Fsetup">EXISTING PROFESSIONAL? REVIEW YOUR PROFILE →</Link>
              </div>
            ) : rows.length === 0 && Number(counts?.all || 0) === 0 ? (
              <div className={styles.empty} data-directory-empty="true">
                <strong>{selectedTrack === 'candidate' ? 'ATB Connect is preparing its first public talent listings.' : selectedTrack === 'speaker' || selectedTrack === 'facilitator' ? 'ATB Spotlight is preparing its first public event-professional listings.' : 'The public marketplace is being prepared.'}</strong>
                <p>{selectedTrack === 'candidate' ? 'Employers can share the roles, sectors and capabilities their organisation needs. Valoria can advise on the right next step.' : selectedTrack === 'speaker' || selectedTrack === 'facilitator' ? 'Event organisers can share an event brief, audience, format and facilitation requirements with Valoria.' : 'Employers and event organisers can begin a conversation with Valoria while public profiles and opportunities are being prepared.'}</p>
                <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
                  <Link className={styles.view} href="/contact-us?type=candidate">DISCUSS YOUR TALENT NEEDS →</Link>
                  <Link className={styles.view} href="/contact-us?type=speaker_booking">DISCUSS AN EVENT BRIEF →</Link>
                </div>
                <Link className={styles.view} href="/login?returnTo=%2Fprofile%2Fsetup">EXISTING PROFESSIONAL? REVIEW YOUR PROFILE →</Link>
              </div>
            ) : rows.length === 0 && selectedTrack !== 'all' ? (
              <div className={styles.empty} data-directory-empty="true">
                <strong>{selectedTrack === 'candidate' ? 'No public talent profiles match this view yet.' : selectedTrack === 'speaker' ? 'No public speaker profiles match this view yet.' : 'No public facilitator profiles match this view yet.'}</strong>
                <p>{selectedTrack === 'candidate' ? 'Share the role, sector and capability requirements you need. Our team can advise on the right sourcing route.' : selectedTrack === 'speaker' ? 'Share the event, audience and subject you need covered. Our team can advise on the next step.' : 'Share your programme goals, audience and delivery format. Our team can advise on a suitable facilitation route.'}</p>
                <Link className={styles.view} href={selectedTrack === 'candidate' ? '/contact-us?type=candidate' : selectedTrack === 'speaker' ? '/contact-us?type=speaker_booking' : '/contact-us?type=facilitator_commission'}>{selectedTrack === 'candidate' ? 'SHARE A TALENT BRIEF' : selectedTrack === 'speaker' ? 'SHARE AN EVENT BRIEF' : 'DISCUSS A FACILITATION BRIEF'} →</Link>
              </div>
            ) : (
              <div className={styles.empty} data-directory-empty="true"><strong>No public professionals match these filters.</strong><p>Try clearing a filter or selecting another declared role.</p></div>
            )}
        </div>
      </section>
    </main>
    <ProfilePreviewModal profile={selectedProfile} onClose={closeProfilePreview} activeTrack={selectedTrack} />
    <Footer />
  </div>
}

function labelValues(value) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.map(item => {
    if (typeof item === 'string') return cleanSkill(item)
    if (!item || typeof item !== 'object') return ''
    return cleanSkill(item.label ?? item.name ?? item.skill_name ?? item.title ?? item.value)
  }).filter(Boolean))]
}

function getCapabilitySelection(profile) {
  return new Set([
    ...(Array.isArray(profile.selectedCapabilities) ? profile.selectedCapabilities : []),
    ...(Array.isArray(profile.selected_capabilities) ? profile.selected_capabilities : []),
    ...(Array.isArray(profile.capabilities) ? profile.capabilities : []),
    ...(Array.isArray(profile.tracks) ? profile.tracks : []),
    profile.track,
  ].map(normalize).filter(Boolean))
}

function Profile({p, onSelect, activeTrack = 'all'}) {
  const selectedCaps = getCapabilitySelection(p)
  const capabilityBadges = [
    ['candidate','Talent'],
    ['speaker','Speaker'],
    ['facilitator','Facilitator'],
  ]
  const normalizedTrack = normalizeCapabilityTrack(activeTrack)
  const isGeneralView = normalizedTrack === 'all'
  const isFull = isGeneralView && p.assessment_access === 'full' && p.valu_index != null
  const tier = isFull ? getValuTier(p.valu_index, 'full') : null
  const designation = tier?.name || 'Assessment Follow-up'
  const designationClass = tier ? styles[tier.name.toLowerCase()] || '' : ''
  const profileId = displayText(p.atb_id)
  const skills = isGeneralView ? [...new Set([...labelValues(p.skills), ...labelValues(p.topics), ...labelValues(p.facilitation_topics), ...labelValues(p.programme_types), ...labelValues(p.format_capabilities)])].slice(0, 3) : getCapabilityCardLabels(p, normalizedTrack)
  const cardEvidenceLabel = isGeneralView ? 'Professional capabilities' : normalizedTrack === 'candidate' ? 'Talent skills' : normalizedTrack === 'speaker' ? 'Speaking expertise' : 'Facilitation expertise'
  const availability = displayText(p.availability_status)
  const role = displayText(normalizedTrack === 'candidate' ? (p.current_job_title || p.headline) : (p.headline || p.current_job_title))
  const sector = displayText(p.industry)
  const location = displayText(p.location)
  const clusterScores = isGeneralView && p.cluster_scores && typeof p.cluster_scores === 'object' ? Object.entries(p.cluster_scores).filter(([key, value]) => Object.hasOwn(CLUSTER_NAMES, key) && value != null && value !== '' && Number.isFinite(Number(value))) : []
  const strongestCluster = clusterScores.sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0]
  const available = /^(available|accepting|open)$/i.test(availability)
  const explicitlyUnavailable = /unavailable|not available|closed/i.test(availability)
  const availabilityLabel = available ? 'Available' : explicitlyUnavailable ? 'Unavailable' : 'Availability not stated'

  return <article className={`${styles.card} ${explicitlyUnavailable ? styles.unavailableCard : ''}`}>
    <header className={styles.cardHeader}>
      <div className={styles.identity}>
<ValoriaAvatar src={p.photo_url} name={p.full_name} seed={p.professional_id || profileId} size={58} className={styles.avatar}/>
        <div className={styles.identityCopy}>
          <strong className={styles.profileName}>{displayText(p.full_name) || 'Professional profile'}</strong>
          {role && <span className={styles.profileRole}>{role}</span>}
          <span className={styles.cardIdLabel}>{profileId || 'ATB ID PENDING'}</span>
        </div>
      </div>
      <div className={styles.scoreDesignation}>
        {isGeneralView ? (isFull ? <>
          <div className={styles.valu} aria-label={`VALU Index ${p.valu_index} points`}>
            <small>VALU INDEX</small><b>{p.valu_index}</b><span>POINTS</span>
          </div>
          <span className={`${styles.tierBadge} ${designationClass}`}>{designation}</span>
        </> : <span className={styles.assessmentPending}>{p.assessment_access === 'basic' ? 'PUBLIC PROFILE' : 'VALU INDEX INSIGHT UNAVAILABLE'}</span>) : (
          <span className={styles.assessmentPending}>{normalizedTrack === 'candidate' ? 'TALENT CAPABILITY' : normalizedTrack === 'speaker' ? 'SPEAKER CAPABILITY' : 'FACILITATOR CAPABILITY'}</span>
        )}
      </div>
    </header>

    <div className={styles.cardAvailability}>
      <span className={`${styles.availabilityBadge} ${available ? styles.availableBadge : explicitlyUnavailable ? styles.unavailableBadge : styles.unknownBadge}`}>
        <i aria-hidden="true"/>{availabilityLabel}
      </span>
    </div>

    {(sector || location) && <div className={styles.profileMeta}>
      {sector && <p className={styles.specialisation}>{sector}</p>}
      {location && <p className={styles.locationLine}>{location}</p>}
    </div>}

    {skills.length > 0 ? <div className={styles.profileSkills} aria-label={cardEvidenceLabel}>{skills.map(value=><span key={value}>{value}</span>)}</div> : !isGeneralView ? <div className={styles.profileSkills} aria-label={cardEvidenceLabel}>Specialist evidence not yet published</div> : null}

    <div className={styles.specialistCapabilities} aria-label="Capability selections; selected capabilities are highlighted">
      {capabilityBadges.map(([key,label]) => (
        <span key={key} className={selectedCaps.has(key) ? styles.capabilitySelected : styles.capabilityUnselected}>{label}</span>
      ))}
    </div>

    {isGeneralView && strongestCluster && <span className={styles.strongestCapability}>Strongest: {CLUSTER_NAMES[strongestCluster] || titleCase(strongestCluster)}</span>}

    <button type="button" onClick={onSelect} className={`${styles.view} ${styles.viewButton}`} aria-haspopup="dialog">View profile <span aria-hidden="true">→</span></button>
  </article>
}

// The public preview receives only the consent-gated, route-safe roster projection.
function ProfilePreviewModal({ profile, onClose, activeTrack = 'all' }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!profile) return
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const dialog = document.querySelector('[data-profile-preview-dialog]')
      const focusable = dialog?.querySelectorAll('button:not([disabled]),a[href]')
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      previousFocus?.focus?.()
    }
  }, [profile, onClose])

  if (!profile) return null

  const isFull = profile.assessment_access === 'full' && profile.valu_index != null
  const tier = isFull ? getValuTier(profile.valu_index, 'full') : null
  const capabilities = getCapabilitySelection(profile)
  const capabilityBadges = [
    { key: 'candidate', title: 'TALENT' },
    { key: 'speaker', title: 'SPEAKER' },
    { key: 'facilitator', title: 'FACILITATOR' },
  ]
  const skills = labelValues(profile.skills).slice(0, 4)
  const topics = labelValues(profile.topics).slice(0, 3)
  const selectedTrack = normalizeCapabilityTrack(activeTrack || 'all')
  const isSpecializedView = selectedTrack !== 'all'
  const specialistSections = isSpecializedView ? getCapabilityEvidence(profile, selectedTrack) : []
  const specialistSummary = isSpecializedView ? getCapabilityEvidenceSummary(profile, selectedTrack) : ''
  const assessmentSummary = !isSpecializedView && isFull ? displayText(profile.assessment_summary || '') : ''
  const profilePath = `/profile/${encodeURIComponent(displayText(profile.atb_id || profile.id))}`
  const profileHref = isSpecializedView ? `${profilePath}?track=${encodeURIComponent(selectedTrack)}` : profilePath
  const modalHeadline = selectedTrack === 'candidate' ? (profile.current_job_title || profile.headline) : (profile.headline || profile.current_job_title)
  const enquiryActions = [
    { key: 'candidate', enquiryType: 'candidate', ctaLabel: 'REQUEST TALENT INTRO' },
    { key: 'speaker', enquiryType: 'speaker_booking', ctaLabel: 'BOOK SPEAKER' },
    { key: 'facilitator', enquiryType: 'facilitator_commission', ctaLabel: 'COMMISSION FACILITATOR' },
  ].filter(action => capabilities.has(action.key))

  return (
    <div className={styles.modalBackdrop} role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <section className={styles.modalDialog} role="dialog" aria-modal="true" aria-labelledby="profile-preview-title" aria-describedby="profile-preview-description" data-profile-preview-dialog tabIndex={-1}>
        <div className={styles.modalTopline}>
          <span>VALORIA MARKETPLACE <i /> PROFESSIONAL PROFILE</span>
          <button ref={closeButtonRef} type="button" className={styles.modalClose} onClick={onClose} aria-label="Close profile preview">×</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.modalIdentity}>
            <ValoriaAvatar src={profile.photo_url} name={profile.full_name} seed={profile.professional_id || profile.atb_id} size={96} className={styles.modalAvatar}/>
            <div className={styles.modalIdentityCopy}>
              <p className={styles.modalEyebrow}>ATB PROFILE ID · {displayText(profile.atb_id || 'PENDING')}</p>
              <h2 id="profile-preview-title">{displayText(profile.full_name || 'Professional profile')}</h2>
              <p className={styles.modalHeadline}>{displayText(modalHeadline || 'Professional capability')}</p>
              <div className={styles.modalMeta}>
                {displayText(profile.industry) && <span>{displayText(profile.industry)}</span>}
                {displayText(profile.location) && <span>{displayText(profile.location)}</span>}
                {Array.isArray(profile.languages) && profile.languages.length > 0 && <span>{labelValues(profile.languages).slice(0, 3).join(' · ')}</span>}
              </div>
            </div>
            {!isSpecializedView && <div className={styles.modalIndex}>
              <small>{isFull ? 'VALU INDEX' : 'PROFILE'}</small>
              <strong>{isFull ? profile.valu_index : 'PUBLIC'}</strong>
              <span>{isFull ? 'POINTS' : 'PROFILE'}</span>
              {tier && <b>{tier.name}</b>}
            </div>}
          </div>
          <div className={styles.modalGrid}>
            <section className={styles.modalPanel}>
              <p className={styles.modalSectionLabel}>{isSpecializedView ? 'SPECIALIST CAPABILITY EVIDENCE' : 'VALU INDEX · PROFESSIONAL INSIGHT'}</p>
              <p id="profile-preview-description" className={styles.modalSummary}>
                {isSpecializedView
                  ? specialistSummary
                  : isFull
                    ? (assessmentSummary || 'The Full VALU Index is complete. The professional insight is being prepared.')
                    : 'This profile introduces the professional’s public identity, declared capabilities and areas of expertise. Additional VALU Index insight appears when available.'}
              </p>
              {!isSpecializedView && <div className={styles.modalCredential}>
                <span>{isFull ? 'VALU INDEX INSIGHT' : 'PROFILE OVERVIEW'}</span>
                <strong>{tier ? tier.name : 'VALU INDEX SCORE NOT DISPLAYED'}</strong>
              </div>}
            </section>
            <section className={styles.modalPanel}>
              <p className={styles.modalSectionLabel}>CAPABILITY SELECTION</p>
              <p className={styles.modalSectionCopy}>The three capability areas are shown consistently to help you understand the ways this professional can contribute.</p>
              <div className={styles.modalCapabilities}>
                {capabilityBadges.map(item => (
                  <div key={item.key} className={capabilities.has(item.key) ? styles.modalCapabilitySelected : styles.modalCapability}>
                    <strong>{item.title}</strong>
                    <span>{capabilities.has(item.key) ? 'SELECTED' : 'NOT SELECTED'}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
          {isSpecializedView ? (
            specialistSections.map(section => (
              <section key={section.label} className={styles.modalListSection}>
                <p className={styles.modalSectionLabel}>{section.label}</p>
                <div className={styles.modalChips}>{section.items.map(item => <span key={item}>{item}</span>)}</div>
              </section>
            ))
          ) : (
            <>
              {skills.length > 0 && <section className={styles.modalListSection}><p className={styles.modalSectionLabel}>PROFESSIONAL SKILLS</p><div className={styles.modalChips}>{skills.map(skill => <span key={skill}>{skill}</span>)}</div></section>}
              {topics.length > 0 && <section className={styles.modalListSection}><p className={styles.modalSectionLabel}>AREAS OF EXPERTISE</p><div className={styles.modalChips}>{topics.map(topic => <span key={topic}>{topic}</span>)}</div></section>}
            </>
          )}
          <div className={styles.modalFooter}>
            <p>Choose the introduction that matches this professional’s selected capability. Valoria will review the request and coordinate the next step.</p>
            <div className={styles.modalActions}>
              {enquiryActions.map(action => (
                <EnquiryForm
                  key={action.key}
                  professionalProfileId={profile.professional_id || profile.id}
                  atbId={displayText(profile.atb_id || 'PENDING')}
                  enquiryType={action.enquiryType}
                  ctaLabel={action.ctaLabel}
                  triggerStyle={{ padding: '11px 14px', background: '#C9A84C', color: '#1A1A2E', fontSize: '8px', letterSpacing: '.08em', borderRadius: '4px' }}
                />
              ))}
              <Link href={profileHref} className={styles.modalPrimary}>EXPLORE FULL PROFILE <span>↗</span></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
