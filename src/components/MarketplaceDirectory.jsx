'use client'

import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './MarketplaceDirectory.module.css'
import ValoriaAvatar from '@/components/ValoriaAvatar'
import { getValuTier, PRIME_CLUSTERS } from '@/lib/brand'

const TRACKS = [
  ['all','All', '/marketplace'],
  ['candidate','Talent','/marketplace/talent'],
  ['speaker','Speakers','/marketplace/speakers'],
  ['facilitator','Facilitators','/marketplace/facilitators'],
]

const normalize = v => String(v || '').toLowerCase() === 'talent' ? 'candidate' : String(v || '').toLowerCase()
const displayText = v => String(v ?? '').normalize('NFKC').replace(/[\uFFFD]/g, '').trim()
const IS_STAGING_PREVIEW = process.env.NEXT_PUBLIC_VALU_PREVIEW === '1'

export default function MarketplaceDirectory({ rows = [], counts = {}, activeTrack = 'all' }) {
  const router = useRouter()
  const [query,setQuery] = useState('')
  const [selectedProfile, setSelectedProfile] = useState(null)
  const closeProfilePreview = useCallback(() => setSelectedProfile(null), [])
  // Keep an open directory in sync with the database-backed roster without requiring a manual refresh.
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
  const [industry,setIndustry] = useState('')
  const [cluster,setCluster] = useState('')
  const [skill,setSkill] = useState('')
  const [declaredRole,setDeclaredRole] = useState('')
  const [seniorityBand,setSeniorityBand] = useState('')
  const industries = useMemo(() => [...new Set(rows.map(r=>displayText(r.industry)).filter(Boolean))].sort(), [rows])
  const skills = useMemo(() => [...new Set(rows.flatMap(r=>labelValues(r.skills)))].sort(), [rows])
  const seniorityBands = useMemo(() => [...new Set(rows.map(r=>displayText(r.seniority_band)).filter(Boolean))].sort(), [rows])

  const results = useMemo(() => {
    const q=query.trim().toLowerCase()
    return rows.filter(p => {
      if (!/^ATB-[A-Z0-9-]{4,40}$/i.test(displayText(p.atb_id))) return false
      const listedCapabilities = Array.isArray(p.capabilities) ? p.capabilities : (Array.isArray(p.tracks) ? p.tracks : (p.track ? [p.track] : []))
      if(activeTrack !== 'all' && !listedCapabilities.map(normalize).includes(activeTrack)) return false
      if(industry && displayText(p.industry) !== industry) return false
      if(cluster && getLeadingCluster(p) !== cluster) return false
      if(skill && !labelValues(p.skills).includes(skill)) return false
      if(declaredRole && !getSelectedCapabilities(p).includes(declaredRole)) return false
      if(seniorityBand && displayText(p.seniority_band) !== seniorityBand) return false
      if(!q) return true
      return [p.atb_id,p.headline,p.current_job_title,p.industry,...labelValues(p.skills),...labelValues(p.topics)].some(v=>displayText(v).toLowerCase().includes(q))
    })
  },[rows,activeTrack,query,industry,cluster,skill,declaredRole,seniorityBand])

  const itemListSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: activeTrack === 'all' ? 'Valoria Professional Marketplace' : 'Valoria ' + activeTrack + ' Marketplace',
    numberOfItems: results.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: results.map((profile, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Person',
        identifier: profile.atb_id,
        url: 'https://valoriainstitute.com/profile/' + profile.id,
        jobTitle: profile.headline || profile.current_job_title || undefined,
      },
    })),
  }), [results, activeTrack])
  const itemListSchemaJson = results.length
    ? JSON.stringify(itemListSchema).replace(/</g, '\\u003c')
    : null

  return <div className={styles.page}>
    {itemListSchemaJson && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: itemListSchemaJson }} />}
    <Nav />
    <main>
    <section className={styles.hero}>
      <div className={styles.container}>
        <p className={styles.eyebrow}>THE VALORIA MARKETPLACE</p>
        <h1>{activeTrack === 'all' ? <>Find professionals<br/><i>by capability.</i></> : <>{TRACKS.find(t=>t[0]===activeTrack)?.[1]}<br/><i>on Valoria.</i></>}</h1>
        <p className={styles.lede}>The directory presents professionals through declared capabilities, relevant experience and approved public profile information. Where available, a completed VALU assessment adds structured context in points and an assessment-informed summary. It is one source of insight—not a credential verification or a substitute for independent professional diligence.</p>
        <nav className={styles.tabs}>{TRACKS.map(([id,label,href])=><Link key={id} href={href} className={activeTrack===id ? styles.activeTab : ''}>{label}<b>{counts[id] || 0}</b></Link>)}</nav>
      </div>
    </section>
    <section className={styles.controls}>
      <div className={styles.containerControl}>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search professionals, skills or industries…" aria-label="Search marketplace"/>
        <select value={cluster} onChange={e=>setCluster(e.target.value)} aria-label="Filter by leading PRIME cluster">
          <option value="">All PRIME clusters</option>
          {PRIME_CLUSTERS.map(item=><option key={item.letter} value={item.letter}>{item.name}</option>)}
        </select>
        <select value={skill} onChange={e=>setSkill(e.target.value)} aria-label="Filter by professional skill">
          <option value="">All skills</option>
          {skills.map(value=><option key={value} value={value}>{value}</option>)}
        </select>
        <select value={industry} onChange={e=>setIndustry(e.target.value)} aria-label="Filter by sector">
          <option value="">All sectors</option>
          {industries.map(value=><option key={value} value={value}>{value}</option>)}
        </select>
        <select value={declaredRole} onChange={e=>setDeclaredRole(e.target.value)} aria-label="Filter by declared role">
          <option value="">All declared roles</option>
          <option value="candidate">Candidate / Talent</option>
          <option value="speaker">Speaker</option>
          <option value="facilitator">Facilitator</option>
        </select>
        {seniorityBands.length > 0 && <select value={seniorityBand} onChange={e=>setSeniorityBand(e.target.value)} aria-label="Filter by seniority"><option value="">All seniority levels</option>{seniorityBands.map(value=><option key={value} value={value}>{value}</option>)}</select>}
        {(query || industry || cluster || skill || declaredRole || seniorityBand) && <button type="button" onClick={()=>{setQuery('');setIndustry('');setCluster('');setSkill('');setDeclaredRole('');setSeniorityBand('')}}>CLEAR</button>}
      </div>
    </section>
    <section className={styles.directory}>
      <div className={styles.container}>
        <div className={styles.directoryHead}>
          <div><p className={styles.eyebrow}>APPROVED PUBLIC PROFILES</p><h2>{results.length} {results.length===1?'professional':'professionals'}</h2></div>
          <span>CAPABILITY · EXPERIENCE · PRIME</span>
        </div>
        {results.length ? <div className={styles.grid}>{results.map(p=><Profile key={p.id} p={p} onSelect={() => setSelectedProfile(p)}/>)}</div> :
          IS_STAGING_PREVIEW
            ? <div className={styles.previewUnavailable} role="status"><strong>Approved public profiles are being prepared.</strong><p>Public profiles appear only when the professional has chosen visibility and the profile meets Valoria’s listing requirements. Personal contact details and individual assessment answers are not displayed here.</p><p>Completed the VALU Index Taster? Sign in or create an account to continue your professional profile.</p><Link href="/signup" className={styles.view}>SIGN IN OR CREATE ACCOUNT</Link></div>
            : <div className={styles.empty}><strong>No professionals match this view.</strong><p>Try adjusting your search or selecting another capability. Profile visibility reflects each professional's choices and Valoria's listing requirements.</p></div>}
      </div>
    </section>
    </main>
    <ProfilePreviewModal profile={selectedProfile} onClose={closeProfilePreview} />
    <Footer />
  </div>
}

function getSelectedCapabilities(profile) {
  return [...new Set([
    ...(Array.isArray(profile.selectedCapabilities) ? profile.selectedCapabilities : []),
    ...(Array.isArray(profile.selected_capabilities) ? profile.selected_capabilities : []),
  ].map(normalize).filter(Boolean))]
}

function getDevelopmentFocus(profile) {
  const scores = profile.cluster_scores
  if (!scores || typeof scores !== 'object' || Array.isArray(scores)) return ''
  const entries = Object.entries(scores).filter(([letter, value]) =>
    PRIME_CLUSTERS.some(cluster => cluster.letter === letter) && value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))
  )
  if (entries.length !== 5) return ''
  entries.sort((a, b) => Number(a[1]) - Number(b[1]))
  return PRIME_CLUSTERS.find(cluster => cluster.letter === entries[0][0])?.name || ''
}

function getLeadingCluster(profile) {
  const scores = profile.cluster_scores
  if (!scores || typeof scores !== 'object' || Array.isArray(scores)) return ''
  const entries = Object.entries(scores).filter(([letter, value]) =>
    PRIME_CLUSTERS.some(cluster => cluster.letter === letter) && value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))
  )
  if (entries.length !== 5) return ''
  entries.sort((a, b) => Number(b[1]) - Number(a[1]))
  return entries[0][0]
}

function labelValues(value) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.map(item => {
    if (typeof item === 'string') return displayText(item)
    if (!item || typeof item !== 'object') return ''
    return displayText(item.label ?? item.name ?? item.skill_name ?? item.title ?? item.value)
  }).filter(Boolean))]
}

function getCapabilitySelection(profile) {
  return new Set([
    ...getSelectedCapabilities(profile),
    ...(Array.isArray(profile.capabilities) ? profile.capabilities : []),
    ...(Array.isArray(profile.tracks) ? profile.tracks : []),
    profile.track,
  ].map(normalize).filter(Boolean))
}

function Profile({p, onSelect}) {
  // Keep selected capabilities distinct from approved public listing lanes.
  // Cards may disclose a selected capability, but category discovery uses only
  // capabilities that have passed the separate eligibility and publication gate.
  const selectedCaps = getCapabilitySelection(p)
  // Keep all three capability lanes visible on every card. Selection is a
  // profile preference; category listing eligibility remains a separate gate.
  const capabilityBadges = [
    { key:'candidate', title:'TALENT', selected:selectedCaps.has('candidate') },
    { key:'speaker', title:'SPEAKER', selected:selectedCaps.has('speaker') },
    { key:'facilitator', title:'FACILITATOR', selected:selectedCaps.has('facilitator') },
  ]
  const specialisation=displayText(p.industry || '')
  // Fail closed: only an explicitly full assessment can expose an official score/designation.
  const isFullAssessment = p.assessment_access === 'full' && p.valu_index != null
  const isBasic = !isFullAssessment
  const tier = isFullAssessment ? getValuTier(p.valu_index, 'full') : null
  const profileId = displayText(p.atb_id || 'PROFILE ID PENDING')
  // This text is sourced from the canonical VALU Index report projection, never the member's bio/headline.
  const assessmentSummary = isFullAssessment ? displayText(p.assessment_summary || '') : ''
  const developmentFocus = isFullAssessment ? getDevelopmentFocus(p) : ''
  return <article className={styles.card}>
    <div className={styles.identity}>
      <ValoriaAvatar src={p.photo_url} seed={p.professional_id || p.atb_id} size={64} className={styles.avatar} />
      <div className={styles.identityCopy}>
        <small>ATB PROFILE ID</small>
        <strong>{profileId}</strong>
        <span className={isBasic ? styles.snapshotStatus : styles.assessedStatus}>{isBasic ? 'VALU TASTER COMPLETE' : 'FULL VALU INDEX COMPLETE'}</span>
      </div>
      <div className={styles.valu}>
        <small>VALU INDEX</small>
        <b>{isFullAssessment ? p.valu_index : '—'}</b>
        <span>{isFullAssessment ? 'POINTS' : 'TASTER'}</span>
      </div>
    </div>
    <h3 className={styles.professionalName}>{displayText(p.headline || p.current_job_title || 'Professional profile')}</h3>
    {displayText(p.headline) && <p className={styles.professionalHeadline}>{displayText(p.current_job_title || '')}</p>}
    <p className={styles.specialisation} title={specialisation}>{specialisation || 'Professional capability'}</p>
    <div className={styles.assessmentInsight}>
      <small>VALU INDEX ASSESSMENT INSIGHT</small>
      {isFullAssessment
        ? (assessmentSummary
          ? <p className={styles.assessmentSummary} title={assessmentSummary}>{developmentFocus ? `Top development area: ${developmentFocus}. ` : ''}{assessmentSummary}</p>
          : <p className={styles.assessmentPending}>Assessment insight is being prepared.</p>)
        : <p className={styles.assessmentPending}>Complete the full VALU Index assessment to unlock this insight.</p>}
    </div>
    <div className={styles.signalRow}>
      {isFullAssessment && tier
        ? <span className={`${styles.tierBadge} ${styles[tier.badgeClass] || ''}`}>{tier.name}</span>
        : <span className={`${styles.tierBadge} ${styles.snapshotTier}`}>OFFICIAL VALU RESULT<br/>PENDING</span>}
    </div>
    <div className={styles.capabilities} aria-label={`Capability selection: ${capabilityBadges.filter(b=>b.selected).map(b=>b.title).join(', ') || 'none selected'}`} title="Selection status only; category listing eligibility is assessed separately"><small className={styles.capabilityLabel}>CAPABILITY SELECTION</small>{capabilityBadges.map(badge=><span className={`${styles.capabilityBadge} ${badge.selected ? styles.capabilitySelected : styles.capabilityUnselected}`} key={badge.key}><strong>{badge.title}</strong><small>{badge.selected ? 'SELECTED' : 'NOT SELECTED'}</small></span>)}</div>
    <button type="button" onClick={onSelect} className={`${styles.view} ${styles.viewButton}`} aria-haspopup="dialog">VIEW PROFILE</button>
  </article>
}


function ProfilePreviewModal({ profile, onClose }) {
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
  const skills = labelValues(profile.skills).slice(0, 8)
  const topics = labelValues(profile.topics).slice(0, 6)
  const assessmentSummary = isFull ? displayText(profile.assessment_summary || '') : ''
  const developmentFocus = isFull ? getDevelopmentFocus(profile) : ''
  const profileHref = `/profile/${encodeURIComponent(displayText(profile.id || profile.atb_id))}`

  return (
    <div
      className={styles.modalBackdrop}
      role="presentation"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}
    >
      <section
        className={styles.modalDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-preview-title"
        aria-describedby="profile-preview-description"
        data-profile-preview-dialog
        tabIndex={-1}
      >
        <div className={styles.modalTopline}>
          <span>VALORIA MARKETPLACE <i /> PROFESSIONAL PROFILE</span>
          <button ref={closeButtonRef} type="button" className={styles.modalClose} onClick={onClose} aria-label="Close profile preview">×</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalIdentity}>
            <ValoriaAvatar
              src={profile.photo_url}
              seed={profile.professional_id || profile.atb_id}
              size={96}
              className={styles.modalAvatar}
            />
            <div className={styles.modalIdentityCopy}>
              <p className={styles.modalEyebrow}>ATB PROFILE ID · {displayText(profile.atb_id || 'PENDING')}</p>
              <h2 id="profile-preview-title">{displayText(profile.atb_id || 'Valoria Professional')}</h2>
              <p className={styles.modalHeadline}>{displayText(profile.headline || profile.current_job_title || 'Professional capability')}</p>
              <div className={styles.modalMeta}>
                {displayText(profile.industry) && <span>{displayText(profile.industry)}</span>}
                {displayText(profile.location) && <span>{displayText(profile.location)}</span>}
                {Array.isArray(profile.languages) && profile.languages.length > 0 && <span>{labelValues(profile.languages).slice(0, 3).join(' · ')}</span>}
              </div>
            </div>
            <div className={styles.modalIndex}>
              <small>VALU INDEX</small>
              <strong>{isFull ? profile.valu_index : '—'}</strong>
              <span>{isFull ? 'POINTS' : 'TASTER'}</span>
              {tier && <b>{tier.name}</b>}
            </div>
          </div>

          <div className={styles.modalGrid}>
            <section className={styles.modalPanel}>
              <p className={styles.modalSectionLabel}>VALU INDEX · ASSESSMENT INSIGHT</p>
              <p id="profile-preview-description" className={styles.modalSummary}>
                {isFull
                  ? (assessmentSummary || 'The Full VALU assessment is complete. The professional insight is being prepared.')
                  : 'This professional has completed the VALU Index Taster. A public profile is visible only where the professional has chosen visibility and Valoria's listing requirements are met. The separate full VALU Index establishes official points, merit tier and assessment insight.'}
              </p>
              <div className={styles.modalCredential}>
                <span>{isFull ? 'FULL VALU INDEX COMPLETE' : 'VALU TASTER COMPLETE'}</span>
                <strong>{tier ? tier.name : 'OFFICIAL RESULT PENDING'}</strong>
              </div>
              {developmentFocus && <div className={styles.modalCredential}><span>TOP DEVELOPMENT AREA</span><strong>{developmentFocus}</strong></div>}
            </section>

            <section className={styles.modalPanel}>
              <p className={styles.modalSectionLabel}>CAPABILITY SELECTION</p>
              <p className={styles.modalSectionCopy}>The three capability lanes are shown consistently. Selection is distinct from capability-specific listing eligibility.</p>
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

          {skills.length > 0 && (
            <section className={styles.modalListSection}>
              <p className={styles.modalSectionLabel}>PROFESSIONAL SKILLS</p>
              <div className={styles.modalChips}>{skills.map(skill => <span key={skill}>{skill}</span>)}</div>
            </section>
          )}

          {topics.length > 0 && (
            <section className={styles.modalListSection}>
              <p className={styles.modalSectionLabel}>AREAS OF EXPERTISE</p>
              <div className={styles.modalChips}>{topics.map(topic => <span key={topic}>{topic}</span>)}</div>
            </section>
          )}

          <div className={styles.modalFooter}>
            <p>Contact details and individual assessment answers are not displayed in this public preview.</p>
            <Link href={profileHref} className={styles.modalPrimary}>OPEN FULL PROFILE <span>↗</span></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
