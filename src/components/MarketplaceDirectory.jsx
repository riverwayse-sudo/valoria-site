'use client'

import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { useMemo, useState } from 'react'
import styles from './MarketplaceDirectory.module.css'

const TRACKS = [
  ['all','All', '/marketplace'],
  ['candidate','Professional','/marketplace/talent'],
  ['speaker','Speaker','/marketplace/speakers'],
  ['facilitator','Facilitator','/marketplace/facilitators'],
]

const normalize = v => String(v || '').toLowerCase() === 'talent' ? 'candidate' : String(v || '').toLowerCase()
const displayText = v => String(v ?? '').normalize('NFKC').replace(/[\uFFFD]/g, '').trim()

const CAPABILITY_BADGES = {
  candidate: { label:'PROFESSIONAL', sublabel:'CAREER · TALENT', icon:'◆' },
  speaker: { label:'SPEAKER', sublabel:'KNOWLEDGE · COMMUNICATION', icon:'◈' },
  facilitator: { label:'FACILITATOR', sublabel:'PEOPLE · PROGRESS', icon:'◇' },
}

const CLUSTER_NAMES = { P:'Presence', R:'Relationships', I:'Intelligence', M:'Mastery', E:'Enterprise' }

function assessmentSummary(p) {
  const scores = p?.cluster_scores
  if (!scores || typeof scores !== 'object') return 'Assessment summary will appear after the VALU Index is completed.'
  const ranked = Object.entries(scores)
    .filter(([,v]) => Number.isFinite(Number(v)))
    .map(([letter,v]) => [letter, Number(v)])
    .sort((a,b) => b[1] - a[1])
  if (!ranked.length) return 'Assessment summary will appear after the VALU Index is completed.'
  const strongest = ranked.slice(0, 2).map(([l]) => CLUSTER_NAMES[l] || l)
  const developing = ranked[ranked.length - 1]?.[0]
  const designation = displayText(p.designation).replace(/_/g,' ')
  const strengthText = strongest.length > 1 ? 'strongest across ' + strongest[0] + ' and ' + strongest[1] : 'strongest in ' + strongest[0]
  const developmentText = developing && ranked.length > 2 ? ' ' + (CLUSTER_NAMES[developing] || developing) + ' is the clearest area for continued development.' : ''
  return 'The VALU Index indicates a profile ' + strengthText + '.' + developmentText + (designation ? ' Overall designation: ' + designation + '.' : '')
}

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
      return [p.atb_id,p.headline,p.current_job_title,p.bio,p.industry,...(p.skills||[]),...(p.topics||[])].some(v=>displayText(v).toLowerCase().includes(q))
    })
  },[rows,activeTrack,query,industry])

  return <div className={styles.page}>
    <Nav />
    <main>
    <section className={styles.hero}>
      <div className={styles.container}>
        <p className={styles.eyebrow}>THE AFRICAN TALENT BUREAU</p>
        <h1>{activeTrack === 'all' ? <>Find capability.<br/><i>Engage confidently.</i></> : <>{TRACKS.find(t=>t[0]===activeTrack)?.[1]}<br/><i>on Valoria.</i></>}</h1>
        <p className={styles.lede}>A curated directory of professionals who have completed the VALU Index and meet the Institute's marketplace requirements.</p>
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
  const initials = displayText(p.display_initials) || 'V'
  const caps=[...(p.capabilities||p.tracks||[p.track])].map(normalize).filter(Boolean)
  const career=displayText(p.headline || p.current_job_title || p.designation || 'Valoria Professional')
  const summary=assessmentSummary(p)
  return <article className={styles.card}>
    <div className={styles.identity}>
      <div className={styles.avatar}>{p.photo_url ? <img src={p.photo_url} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" /> : initials}</div>
      <div>
        <small>PROFILE ID</small>
        <strong>{displayText(p.atb_id || p.professional_id || 'UNASSIGNED')}</strong>
        <em>✓ VALORIA ASSESSED</em>
      </div>
      {p.valu_index != null && <div className={styles.valu}><small>VALU</small><b>{p.valu_index}</b><span>/100</span></div>}
    </div>
    <p className={styles.career}>{career}</p>
    <div className={styles.capabilities} aria-label="Valoria capability badges">
      {caps.map(cap => {
        const badge=CAPABILITY_BADGES[cap]
        if (!badge) return null
        return <span key={cap} title={badge.sublabel} className={styles.capabilityBadge}>
          <b>{badge.icon}</b><span><strong>{badge.label}</strong><small>{badge.sublabel}</small></span>
        </span>
      })}
    </div>
    <div className={styles.assessmentSummary}>
      <small>ASSESSMENT PROFILE</small>
      <p>{summary}</p>
    </div>
    <Link href={`/profile/${p.id}`} className={styles.view}>VIEW PROFILE →</Link>
  </article>
}
