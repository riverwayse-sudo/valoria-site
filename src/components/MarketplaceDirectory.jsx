'use client'

import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { useMemo, useState } from 'react'
import styles from './MarketplaceDirectory.module.css'
import ValoriaAvatar from '@/components/ValoriaAvatar'

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
  const capabilityLabels = [...new Set(caps.map(c => c === 'candidate' ? 'TALENT' : c === 'speaker' ? 'SPEAKER' : c === 'facilitator' ? 'FACILITATOR' : c.toUpperCase()))]
  const skillTags=labelValues(p.skills)
  const topicTags=labelValues(p.topics)
  const tags=capabilityLabels.length ? capabilityLabels : skillTags.length ? skillTags : topicTags
  const career=displayText(p.headline || p.current_job_title || p.designation || 'Valoria Professional')
  const bio=displayText(p.bio)
  return <article className={styles.card}>
    <div className={styles.identity}>
      <ValoriaAvatar src={p.photo_url} seed={p.professional_id || p.atb_id} size={64} className={styles.avatar} />
      <div>
        <small>PROFILE ID</small>
        <strong>{displayText(p.atb_id || p.professional_id || 'UNASSIGNED')}</strong>
        <em>✓ VALORIA ASSESSED</em>
      </div>
      {p.valu_index != null && <div className={styles.valu}><small>VALU</small><b>{p.valu_index}</b><span>/100</span></div>}
    </div>
    <p className={styles.career}>{career}</p>
    {tags.length > 0 && <div className={styles.capabilities}>{tags.map(tag=><span key={tag}>{displayText(tag)}</span>)}</div>}
    {bio && <p className={styles.bio}>{bio.length>220 ? bio.slice(0,220)+'…' : bio}</p>}
    <Link href={`/profile/${p.id}`} className={styles.view}>VIEW PROFILE →</Link>
  </article>
}
