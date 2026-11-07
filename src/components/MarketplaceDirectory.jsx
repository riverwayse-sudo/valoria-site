'use client'

import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './MarketplaceDirectory.module.css'
import ValoriaAvatar from '@/components/ValoriaAvatar'
import { PRIME_CLUSTERS } from '@/lib/brand'

const TRACKS = [
  ['all','All', '/marketplace'],
  ['candidate','Talent','/marketplace/talent'],
  ['speaker','Speakers','/marketplace/speakers'],
  ['facilitator','Facilitators','/marketplace/facilitators'],
]
const CLUSTER_NAMES = { P:'Presence', R:'Relationships', I:'Intelligence', M:'Mastery', E:'Enterprise' }

const normalize = v => String(v || '').toLowerCase() === 'talent' ? 'candidate' : String(v || '').toLowerCase()
const displayText = v => String(v ?? '').normalize('NFKC').replace(/[\uFFFD]/g, '').trim()
const titleCase = v => String(v || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())
const cleanSkill = v => displayText(v).replace(/\s*★$/, '')

export default function MarketplaceDirectory({ rows = [], counts = {}, activeTrack = 'all', dataUnavailable = false }) {
  const router = useRouter()
  const [query,setQuery] = useState('')
  const [sector,setSector] = useState('')
  const [cluster,setCluster] = useState('')
  const [skill,setSkill] = useState('')

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

  const sectors = useMemo(() => [...new Set(rows.map(r=>displayText(r.industry)).filter(Boolean))].sort(), [rows])
  const skills = useMemo(() => [...new Set(PRIME_CLUSTERS.flatMap(cluster => cluster.skills.map(cleanSkill)))].sort(), [])

  const results = useMemo(() => {
    const q=query.trim().toLowerCase()
    return rows.filter(p => {
      const caps=[...(p.capabilities || p.tracks || [p.track])].map(normalize)
      if(activeTrack !== 'all' && !caps.includes(activeTrack)) return false
      if(sector && displayText(p.industry) !== sector) return false
      if(cluster && !Number.isFinite(Number(p.cluster_scores?.[cluster]))) return false
      if(skill && !labelValues(p.skills).some(v=>v.toLowerCase()===skill.toLowerCase())) return false
      if(!q) return true
      return [p.full_name,p.headline,p.current_job_title,p.atb_id,p.industry,...labelValues(p.skills),...labelValues(p.topics)].some(v=>displayText(v).toLowerCase().includes(q))
    })
  },[rows,activeTrack,query,sector,cluster,skill])

  const clearFilters = () => { setQuery(''); setSector(''); setCluster(''); setSkill('') }

  return <div className={styles.page}>
    <Nav />
    <main>
      <section className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>{activeTrack === 'candidate' ? 'ATB CONNECT' : activeTrack === 'speaker' || activeTrack === 'facilitator' ? 'ATB SPOTLIGHT' : 'VALORIA MARKETPLACE'}</p>
          <h1>
            {activeTrack === 'all' && <>Find professionals<br/><i>by capability.</i></>}
            {activeTrack === 'candidate' && <>Precision hiring,<br/><i>not CV triage.</i></>}
            {activeTrack === 'speaker' && <>Find a speaker<br/><i>who can hold a room.</i></>}
            {activeTrack === 'facilitator' && <>Find a facilitator<br/><i>for the work ahead.</i></>}
          </h1>
          <p className={styles.lede}>
            {activeTrack === 'all' && 'Explore public professional profiles at Basic and Full levels. Basic listings present verified professional identity and declared capabilities; Full listings also present VALU points and assessment-derived capability insight.'}
            {activeTrack === 'candidate' && 'ATB Connect helps employers explore public professional profiles by declared capability and sector. Full listings also include VALU points and assessment-derived capability insight.'}
            {activeTrack === 'speaker' && 'ATB Spotlight helps event organisers discover public speakers by declared expertise and PRIME capability. Full listings include assessment-derived insight; Basic listings show verified professional information.'}
            {activeTrack === 'facilitator' && 'ATB Spotlight helps training buyers discover public facilitators by declared expertise and PRIME capability. Full listings include assessment-derived insight; Basic listings show verified professional information. For a structured team development programme, explore Valoria Develop.'}
          </p>
          {activeTrack === 'facilitator' && <Link className={styles.view} href="/programmes">EXPLORE VALORIA DEVELOP</Link>}
          <nav className={styles.tabs} aria-label="Filter by declared role">{TRACKS.map(([id,label,href])=><Link key={id} href={href} className={activeTrack===id ? styles.activeTab : ''}>{label}<b>{counts[id] || 0}</b></Link>)}</nav>
        </div>
      </section>
      <section className={styles.controls}>
        <div className={styles.containerControl}>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search professionals, skills or sectors…" aria-label="Search marketplace"/>
          <select value={cluster} onChange={e=>setCluster(e.target.value)} aria-label="Filter by PRIME cluster">
            <option value="">All PRIME clusters</option>
            {PRIME_CLUSTERS.map(item=><option key={item.letter} value={item.letter}>{item.name}</option>)}
          </select>
          <select value={skill} onChange={e=>setSkill(e.target.value)} aria-label="Filter by skill">
            <option value="">All declared skills</option>
            {skills.map(value=><option key={value} value={value}>{value}</option>)}
          </select>
          <select value={sector} onChange={e=>setSector(e.target.value)} aria-label="Filter by sector">
            <option value="">All sectors</option>
            {sectors.map(value=><option key={value} value={value}>{value}</option>)}
          </select>
          {(query || sector || cluster || skill) && <button onClick={clearFilters}>CLEAR</button>}
        </div>
        <p className={styles.filterNote}>Filter by declared role, PRIME cluster, declared skill and sector. Seniority is not currently included in the public roster; private work-history data is not inferred or exposed as a filter.</p>
      </section>
      <section className={styles.directory}>
        <div className={styles.container}>
          <div className={styles.directoryHead}>
            <div><p className={styles.eyebrow}>PUBLIC MARKETPLACE</p><h2>{dataUnavailable ? 'Directory unavailable' : `${results.length} ${results.length===1?'professional':'professionals'}`}</h2></div>
            <span>VALU INDEX × PRIME</span>
          </div>
          {dataUnavailable ? (
            <div className={styles.empty}>
              <strong>Marketplace data could not be verified.</strong>
              <p>The directory is temporarily unavailable. Try again shortly.</p>
              <button type="button" className={styles.view} onClick={() => router.refresh()}>RETRY →</button>
            </div>
          ) : results.length ? <div className={styles.grid}>{results.map(p=><Profile key={p.id} p={p}/>)}</div> :
            rows.length === 0 && activeTrack === 'all' ? (
              <div className={styles.empty}>
                <strong>No public professional profiles are currently available.</strong>
                <p>Public listings appear after a professional completes the required profile, chooses public visibility, records consent and meets the applicable listing requirements.</p>
                <Link className={styles.view} href="/login?returnTo=%2Fprofile%2Fsetup">EXISTING PROFESSIONAL? REVIEW YOUR PROFILE →</Link>
              </div>
            ) : rows.length === 0 && activeTrack !== 'all' ? (
              <div className={styles.empty}>
                <strong>{activeTrack === 'candidate' ? 'No public talent profiles are available yet.' : activeTrack === 'speaker' ? 'No public speaker profiles are available yet.' : 'No public facilitator profiles are available yet.'}</strong>
                <p>{activeTrack === 'candidate' ? 'ATB Connect search becomes useful when public profiles are available for the roles employers need. Contact Valoria to discuss a sourcing requirement.' : 'ATB Spotlight will show profiles when professionals meet the relevant listing and visibility requirements. Contact Valoria to discuss an event or facilitation requirement.'}</p>
                <a className={styles.view} href={activeTrack === 'candidate' ? 'mailto:info@valoriainstitute.com?subject=ATB%20Connect%20Access%20Enquiry' : 'mailto:info@valoriainstitute.com?subject=ATB%20Spotlight%20Enquiry'}>CONTACT VALORIA →</a>
              </div>
            ) : (
              <div className={styles.empty}><strong>No public professionals match these filters.</strong><p>Try clearing a filter or selecting another declared role.</p></div>
            )}
        </div>
      </section>
    </main>
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

function Profile({p}) {
  const selectedCaps = new Set([
    ...(Array.isArray(p.selectedCapabilities) ? p.selectedCapabilities : []),
    ...(Array.isArray(p.selected_capabilities) ? p.selected_capabilities : []),
    ...(Array.isArray(p.capabilities) ? p.capabilities : []),
    ...(Array.isArray(p.tracks) ? p.tracks : []),
    p.track,
  ].map(normalize).filter(Boolean))
  const capabilityBadges = [
    { key:'candidate', title:'TALENT', selected:selectedCaps.has('candidate') },
    { key:'speaker', title:'SPEAKER', selected:selectedCaps.has('speaker') },
    { key:'facilitator', title:'FACILITATOR', selected:selectedCaps.has('facilitator') },
  ]
  const isBasic = p.assessment_access === 'basic'
  const designation = displayText(p.designation)
  const designationClass = {
    'Force to Align With': styles.forceToAlignWith,
    'Emerging Force': styles.emergingForce,
    'Developing Professional': styles.developingProfessional,
    'Building Foundations': styles.buildingFoundations,
  }[designation] || ''
  const profileId = displayText(p.atb_id)
  const clusterScores = p.cluster_scores && typeof p.cluster_scores === 'object' ? p.cluster_scores : {}
  const weakest = Object.entries(clusterScores)
    .filter(([key,value]) => CLUSTER_NAMES[key] && Number.isFinite(Number(value)))
    .sort((a,b) => Number(a[1])-Number(b[1]))[0]
  const developmentFocus = weakest ? CLUSTER_NAMES[weakest[0]] : 'Not available'
  const skills = labelValues(p.skills).slice(0, 3)
  const availability = displayText(p.availability_status)
  return <article className={styles.card}>
    <div className={styles.identity}>
      <ValoriaAvatar src={p.photo_url} seed={p.professional_id || profileId} size={64} className={styles.avatar}/>
      <div className={styles.identityCopy}>
        <strong className={styles.profileName}>{displayText(p.full_name)}</strong>
        <small>{profileId}</small>
        <span className={styles.assessedStatus}>{isBasic ? 'BASIC LISTING' : '✓ FULL VALU ASSESSED'}</span>
      </div>
      {!isBasic && <div className={styles.valu} aria-label={`VALU Index ${p.valu_index} points`}>
        <small>VALU INDEX</small>
        <b>{p.valu_index}</b>
        <span>POINTS</span>
      </div>}
    </div>
    <p className={styles.career}>{displayText(p.headline)}</p>
    <p className={styles.specialisation}>{displayText(p.current_job_title)}{p.industry ? ` · ${displayText(p.industry)}` : ''}</p>
    <div className={styles.profileDetails}>{[p.location, availability && `Availability: ${titleCase(availability)}`].filter(Boolean).map(value=><span key={value}>{displayText(value)}</span>)}</div>

    {skills.length > 0 && <div className={styles.profileSkills}>{skills.map(value=><span key={value}>{value}</span>)}</div>}
    <div className={styles.signalRow}>
      <span className={`${styles.tierBadge} ${designationClass}`}>{isBasic ? 'BASIC MEMBER' : designation}</span>
    </div>
    {!isBasic && <div className={styles.developmentFocus}><small>TOP DEVELOPMENT AREA</small><strong>{developmentFocus}</strong></div>}
    <div className={styles.capabilities} aria-label={`Declared roles: ${capabilityBadges.filter(b=>b.selected).map(b=>b.title).join(', ') || 'none selected'}`}>
      <small className={styles.capabilityLabel}>DECLARED ROLES</small>
      {capabilityBadges.map(badge=><span className={`${styles.capabilityBadge} ${badge.selected ? styles.capabilitySelected : styles.capabilityUnselected}`} key={badge.key}><strong>{badge.title}</strong><small>{badge.selected ? 'SELECTED' : 'NOT SELECTED'}</small></span>)}
    </div>
    {!isBasic && <div className={styles.assessmentInsight}>
      <small>VALU INDEX ASSESSMENT INSIGHT</small>
      <p className={styles.assessmentSummary}>{displayText(p.assessment_summary)}</p>
    </div>}
    <Link href={`/profile/${encodeURIComponent(profileId)}`} className={styles.view}>VIEW PROFILE</Link>
  </article>
}
