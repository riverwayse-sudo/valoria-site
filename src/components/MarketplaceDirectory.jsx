'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import styles from './MarketplaceDirectory.module.css'

const TRACKS = [
  ['all','All', '/marketplace'],
  ['candidate','Talent','/marketplace/talent'],
  ['speaker','Speakers','/marketplace/speakers'],
  ['facilitator','Facilitators','/marketplace/facilitators'],
]

const normalize = v => String(v || '').toLowerCase() === 'talent' ? 'candidate' : String(v || '').toLowerCase()

export default function MarketplaceDirectory({ rows = [], counts = {}, activeTrack = 'all' }) {
  const [query,setQuery] = useState('')
  const [industry,setIndustry] = useState('')
  const industries = useMemo(() => [...new Set(rows.map(r=>r.industry).filter(Boolean))].sort(), [rows])

  const results = useMemo(() => {
    const q=query.trim().toLowerCase()
    return rows.filter(p => {
      const caps=[...(p.capabilities || p.tracks || [p.track])].map(normalize)
      if(activeTrack !== 'all' && !caps.includes(activeTrack)) return false
      if(industry && p.industry !== industry) return false
      if(!q) return true
      return [p.atb_id,p.full_name,p.headline,p.bio,p.industry,...(p.skills||[]),...(p.topics||[])].some(v=>String(v||'').toLowerCase().includes(q))
    })
  },[rows,activeTrack,query,industry])

  return <main className={styles.marketplacePage}>
    <header className={styles.marketplaceHeader}>
      <Link href="/" className={styles.marketplaceLogo}>VALORIA <span>INSTITUTE</span></Link>
      <div className={styles.marketplaceHeaderTitle}>MARKETPLACE</div>
      <Link href="/dashboard" className={styles.marketplaceDashboard}>DASHBOARD →</Link>
    </header>

    <section className={styles.marketplaceHero}>
      <div className={styles.marketplaceContainer}>
        <p className={styles.marketplaceEyebrow}>THE AFRICAN TALENT BUREAU</p>
        <h1>{activeTrack === 'all' ? <>Find capability.<br/><i>Engage confidently.</i></> : <>{TRACKS.find(t=>t[0]===activeTrack)?.[1]}<br/><i>on Valoria.</i></>}</h1>
        <p className={styles.marketplaceLede}>A curated directory of professionals who have completed the Valoria assessment and meet the Institute's marketplace requirements.</p>
        <nav className={styles.marketplaceTabs}>
          {TRACKS.map(([id,label,href])=><Link key={id} href={href} className={activeTrack===id ? styles.marketplaceActiveTab : ''}>{label}<b>{counts[id] || 0}</b></Link>)}
        </nav>
      </div>
    </section>

    <section className={styles.marketplaceControls}>
      <div className={styles.marketplaceContainerControl}>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search professionals, skills or industries…" aria-label="Search marketplace"/>
        <select value={industry} onChange={e=>setIndustry(e.target.value)} aria-label="Filter by industry">
          <option value="">All industries</option>
          {industries.map(v=><option key={v} value={v}>{v}</option>)}
        </select>
        {(query || industry) && <button onClick={()=>{setQuery('');setIndustry('')}}>CLEAR</button>}
      </div>
    </section>

    <section className={styles.marketplaceDirectory}>
      <div className={styles.marketplaceContainer}>
        <div className={styles.marketplaceDirectoryHead}>
          <div><p className={styles.marketplaceEyebrow}>VERIFIED DIRECTORY</p><h2>{results.length} {results.length===1?'professional':'professionals'}</h2></div>
          <span>VALU × PRIME</span>
        </div>
        {results.length ? <div className={styles.marketplaceGrid}>{results.map(p=><Profile key={p.id} p={p}/>)}</div> :
          <div className={styles.marketplaceEmpty}><strong>No professionals match this view.</strong><p>Try clearing the search or selecting another marketplace category.</p></div>}
      </div>
    </section>
  </main>
}

function Profile({p}) {
  const initials=p.display_initials || String(p.full_name||'V').split(' ').map(x=>x[0]).slice(0,2).join('')
  const caps=[...(p.capabilities||p.tracks||[p.track])].map(normalize).filter(Boolean)
  return <article className={styles.marketplaceCard}>
    <div className={styles.marketplaceIdentity}>
      <div className={styles.marketplaceAvatar}>{p.photo_url ? <img src={p.photo_url} alt="" /> : initials}</div>
      <div><small>PROFILE ID</small><strong>{p.atb_id || p.professional_id || 'UNASSIGNED'}</strong><em>✓ VALORIA ASSESSED</em></div>
      {p.valu_index != null && <div className={styles.marketplaceValu}><small>VALU</small><b>{p.valu_index}</b></div>}
    </div>
    <h3>{p.headline || p.designation || 'Valoria Professional'}</h3>
    {p.location && <p className={styles.marketplaceLocation}>{p.location}</p>}
    <div className={styles.marketplaceCapabilities}>{caps.map(c=><span key={c}>{c==='candidate'?'TALENT':c.toUpperCase()}</span>)}</div>
    {p.bio && <p className={styles.marketplaceBio}>{p.bio.length>155 ? p.bio.slice(0,155)+'…' : p.bio}</p>}
    <Link href={`/profile/${p.id}`} className={styles.marketplaceView}>VIEW PROFILE →</Link>
  </article>
}
