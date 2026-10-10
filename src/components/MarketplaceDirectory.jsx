'use client'

import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { useMemo, useState } from 'react'
import styles from './MarketplaceDirectory.module.css'
import ValoriaAvatar from '@/components/ValoriaAvatar'
import { getValuTier } from '@/lib/brand'

const TRACKS = [
  ['all','All', '/marketplace'],
  ['candidate','Talent','/marketplace/talent'],
  ['speaker','Speakers','/marketplace/speakers'],
  ['facilitator','Facilitators','/marketplace/facilitators'],
]

const normalize = v => String(v || '').toLowerCase() === 'talent' ? 'candidate' : String(v || '').toLowerCase()
const displayText = v => String(v ?? '').normalize('NFKC').replace(/[\uFFFD]/g, '').trim()

export default function MarketplaceDirectory({ rows = [], counts = {}, activeTrack = 'all' }) {
  const [query,setQuery] = useState('')
  const [industry,setIndustry] = useState('')
  const industries = useMemo(() => [...new Set(rows.map(r=>displayText(r.industry)).filter(Boolean))].sort(), [rows])

  const results = useMemo(() => {
    const q=query.trim().toLowerCase()
    return rows.filter(p => {
      const caps=[...(p.capabilities || p.tracks || [p.track])].map(normalize)
      if(activeTrack !== 'all' && !caps.includes(activeTrack)) return false
      if(industry && displayText(p.industry) !== industry) return false
      if(!q) return true
      return [p.atb_id,p.headline,p.current_job_title,p.industry,...(p.skills||[]),...(p.topics||[])].some(v=>displayText(v).toLowerCase().includes(q))
    })
  },[rows,activeTrack,query,industry])

  return <div className={styles.page}>
    <Nav />
    <main>
    <section className={styles.hero}>
      <div className={styles.container}>
        <p className={styles.eyebrow}>THE AFRICAN TALENT BUREAU</p>
        <h1>{activeTrack === 'all' ? <>Find capability.<br/><i>Engage confidently.</i></> : <>{TRACKS.find(t=>t[0]===activeTrack)?.[1]}<br/><i>on Valoria.</i></>}</h1>
        <p className={styles.lede}>A curated directory of professionals who have completed the Valoria assessment and meet the Institute's marketplace requirements.</p>
        <nav className={styles.tabs}>{TRACKS.map(([id,label,href])=><Link key={id} href={href} className={activeTrack===id ? styles.activeTab : ''}>{label}<b>{counts[id] || 0}</b></Link>)}</nav>
      </div>
    </section>
    <section className={styles.controls}>
      <div className={styles.containerControl}>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search professionals, skills or industries…" aria-label="Search marketplace"/>
        <select value={industry} onChange={e=>setIndustry(e.target.value)} aria-label="Filter by industry">
          <option value="">All industries</option>
          {industries.map(v=><option key={v} value={v}>{v}</option>)}
        </select>
        {(query || industry) && <button onClick={()=>{setQuery('');setIndustry('')}}>CLEAR</button>}
      </div>
    </section>
    <section className={styles.directory}>
      <div className={styles.container}>
        <div className={styles.directoryHead}>
          <div><p className={styles.eyebrow}>VERIFIED DIRECTORY</p><h2>{results.length} {results.length===1?'professional':'professionals'}</h2></div>
          <span>VALU × PRIME</span>
        </div>
        {results.length ? <div className={styles.grid}>{results.map(p=><Profile key={p.id} p={p}/>)}</div> :
          <div className={styles.empty}><strong>No professionals match this view.</strong><p>Try clearing the search or selecting another marketplace category.</p></div>}
      </div>
    </section>
    </main>
    <Footer />
  </div>
}

function labelValues(value) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.map(item => {
    if (typeof item === 'string') return displayText(item)
    if (!item || typeof item !== 'object') return ''
    return displayText(item.label ?? item.name ?? item.skill_name ?? item.title ?? item.value)
  }).filter(Boolean))]
}

function Profile({p}) {
  const caps=[...(p.capabilities||p.tracks||[p.track])].map(normalize).filter(Boolean)
  const capabilityBadges = [...new Set(caps)].map(c => ({
    key:c,
    title:c === 'candidate' ? 'PROFESSIONAL' : c === 'speaker' ? 'SPEAKER' : c === 'facilitator' ? 'FACILITATOR' : c.toUpperCase(),
    detail:c === 'candidate' ? 'CAREER · TALENT' : c === 'speaker' ? 'KNOWLEDGE · COMMUNICATION' : c === 'facilitator' ? 'PEOPLE · PROGRESS' : '',
  }))
  const specialisation=displayText(p.industry || '')
  // Fail closed: only an explicitly full assessment can expose an official score/designation.
  const isFullAssessment = p.assessment_access === 'full' && p.valu_index != null
  const isBasic = !isFullAssessment
  const tier = isFullAssessment ? getValuTier(p.valu_index, 'full') : null
  const profileId = displayText(p.atb_id || 'PROFILE ID PENDING')
  // This text is sourced from the canonical VALU Index report projection, never the member's bio/headline.
  const assessmentSummary = isFullAssessment ? displayText(p.assessment_summary || '') : ''
  return <article className={styles.card}>
    <div className={styles.identity}>
      <ValoriaAvatar src={p.photo_url} seed={p.professional_id || p.atb_id} size={64} className={styles.avatar} />
      <div className={styles.identityCopy}>
        <small>ATB PROFILE ID</small>
        <strong>{profileId}</strong>
        <span className={isBasic ? styles.snapshotStatus : styles.assessedStatus}>{isBasic ? 'BASIC · SNAPSHOT' : '✓ VALORIA ASSESSED'}</span>
      </div>
    </div>
    {specialisation && <p className={styles.specialisation}>{specialisation}</p>}
    {isFullAssessment && <div className={styles.assessmentInsight}>
      <small>VALU INDEX ASSESSMENT INSIGHT</small>
      {assessmentSummary
        ? <p className={styles.assessmentSummary}>{assessmentSummary}</p>
        : <p className={styles.assessmentPending}>Assessment insight is being prepared.</p>}
    </div>}
    {isFullAssessment && <div className={styles.signalRow}>
      <div className={styles.scoreBlock}>
        <small>VALU INDEX</small>
        <strong>{p.valu_index}<span> POINTS</span></strong>
      </div>
      {tier && <span className={`${styles.tierBadge} ${styles[tier.badgeClass] || ''}`}>
        {tier.stars && <span className={styles.tierStars}>{tier.stars}</span>}
        <span>{tier.name}</span>
      </span>}
    </div>}
    {capabilityBadges.length > 0 && <div className={styles.capabilities}>{capabilityBadges.map(badge=><span className={styles.capabilityBadge} key={badge.key}><strong>{badge.title}</strong><small>{badge.detail}</small></span>)}</div>}
    <Link href={`/profile/${encodeURIComponent(profileId)}`} className={styles.view}>VIEW PROFILE</Link>
  </article>
}
