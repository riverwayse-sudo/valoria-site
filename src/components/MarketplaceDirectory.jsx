'use client'

import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { useMemo, useState } from 'react'
import styles from './MarketplaceDirectory.module.css'

const TRACKS = [
  ['all','All professionals', '/marketplace'],
  ['candidate','Professionals','/marketplace/talent'],
  ['speaker','Speakers','/marketplace/speakers'],
  ['facilitator','Facilitators','/marketplace/facilitators'],
]

const PAGE_CONTENT = {
  all: {
    eyebrow: 'VALORIA PROFESSIONAL REGISTRY',
    title: <>Find capability.<br/><i>Make the connection.</i></>,
    description: 'Explore professionals across disciplines and discover the expertise, experience and capability available through the Valoria network.',
    search: 'Search by expertise, skill, topic or industry…',
    heading: 'Explore the registry',
  },
  candidate: {
    eyebrow: 'FOR EMPLOYERS & ORGANISATIONS',
    title: <>Discover people.<br/><i>Understand capability.</i></>,
    description: 'Find professionals with a richer view of their strengths, experience and development profile. Move beyond titles to make more informed talent connections.',
    search: 'Search professionals, skills or industries…',
    heading: 'Professionals in the registry',
  },
  speaker: {
    eyebrow: 'FOR EVENT ORGANISERS & PROGRAMME CURATORS',
    title: <>Find the right voice.<br/><i>For the room.</i></>,
    description: 'Discover speakers and subject-matter experts for conferences, leadership programmes and professional events. Explore areas of expertise before starting a conversation.',
    search: 'Search speakers, topics or areas of expertise…',
    heading: 'Speakers & subject-matter experts',
  },
  facilitator: {
    eyebrow: 'FOR LEARNING & DEVELOPMENT LEADERS',
    title: <>Bring expertise<br/><i>into the room.</i></>,
    description: 'Find facilitators who can help people and organisations learn, develop and move forward. Explore professional focus areas, programme interests and capability profiles.',
    search: 'Search facilitators, skills or programme areas…',
    heading: 'Facilitators & learning partners',
  },
}

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
  if (!scores || typeof scores !== 'object') return 'A fuller capability summary becomes available when the professional completes their VALU assessment.'
  const ranked = Object.entries(scores)
    .filter(([,v]) => Number.isFinite(Number(v)))
    .map(([letter,v]) => [letter, Number(v)])
    .sort((a,b) => b[1] - a[1])
  if (!ranked.length) return 'A fuller capability summary becomes available when the professional completes their VALU assessment.'
  const strongest = ranked.slice(0, 2).map(([l]) => CLUSTER_NAMES[l] || l)
  const developing = ranked[ranked.length - 1]?.[0]
  const designation = displayText(p.designation).replace(/_/g,' ')
  const strengthText = strongest.length > 1 ? 'strongest across ' + strongest[0] + ' and ' + strongest[1] : 'strongest in ' + strongest[0]
  const developmentText = developing && ranked.length > 2 ? ' ' + (CLUSTER_NAMES[developing] || developing) + ' is an area for continued development.' : ''
  return 'The VALU Index indicates a profile ' + strengthText + '.' + developmentText + (designation ? ' Overall designation: ' + designation + '.' : '')
}

function valuesFrom(rows, getter) {
  return [...new Set(rows.flatMap(row => {
    const value = getter(row)
    return Array.isArray(value) ? value.map(displayText) : [displayText(value)]
  }).filter(Boolean))].sort()
}

export default function MarketplaceDirectory({ rows = [], counts = {}, activeTrack = 'all' }) {
  const [query,setQuery] = useState('')
  const [industry,setIndustry] = useState('')
  const [location,setLocation] = useState('')
  const [language,setLanguage] = useState('')
  const [availability,setAvailability] = useState('')
  const page = PAGE_CONTENT[activeTrack] || PAGE_CONTENT.all
  const industries = useMemo(() => valuesFrom(rows, r=>r.industry), [rows])
  const locations = useMemo(() => valuesFrom(rows, r=>r.location), [rows])
  const languages = useMemo(() => valuesFrom(rows, r=>r.languages), [rows])
  const availabilities = useMemo(() => valuesFrom(rows, r=>r.availability_status || r.availability), [rows])

  const results = useMemo(() => {
    const q=query.trim().toLowerCase()
    return rows.filter(p => {
      const caps=[...(p.capabilities || p.tracks || [p.track])].map(normalize)
      if(activeTrack !== 'all' && !caps.includes(activeTrack)) return false
      if(industry && displayText(p.industry) !== industry) return false
      if(location && displayText(p.location) !== location) return false
      if(language && !labelValues(p.languages).includes(language)) return false
      if(availability && displayText(p.availability_status || p.availability) !== availability) return false
      if(!q) return true
      const searchable=[p.atb_id,p.headline,p.current_job_title,p.bio,p.industry,p.location,p.languages,p.availability_status,p.availability,p.skills,p.topics,p.programme_types]
      return searchable.flatMap(v=>Array.isArray(v)?v:[v]).some(v=>displayText(v).toLowerCase().includes(q))
    })
  },[rows,activeTrack,query,industry,location,language,availability])

  const hasFilters = query || industry || location || language || availability
  const clearFilters = () => {setQuery('');setIndustry('');setLocation('');setLanguage('');setAvailability('')}

  return <div className={styles.page}>
    <Nav />
    <main>
    <section className={styles.hero}>
      <div className={styles.container}>
        <p className={styles.eyebrow}>{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p className={styles.lede}>{page.description}</p>
        <nav className={styles.tabs} aria-label="Marketplace categories">{TRACKS.map(([id,label,href])=><Link key={id} href={href} className={activeTrack===id ? styles.activeTab : ''} aria-current={activeTrack===id?'page':undefined}>{label}<b>{counts[id] || 0}</b></Link>)}</nav>
      </div>
    </section>
    <section className={styles.controls} aria-label="Filter registry">
      <div className={styles.containerControl}>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={page.search} aria-label="Search registry"/>
        <select value={industry} onChange={e=>setIndustry(e.target.value)} aria-label="Filter by industry">
          <option value="">All industries</option>
          {industries.map(v=><option key={v} value={v}>{v}</option>)}
        </select>
        <select value={location} onChange={e=>setLocation(e.target.value)} aria-label="Filter by location">
          <option value="">All locations</option>
          {locations.map(v=><option key={v} value={v}>{v}</option>)}
        </select>
        <select value={language} onChange={e=>setLanguage(e.target.value)} aria-label="Filter by language">
          <option value="">All languages</option>
          {languages.map(v=><option key={v} value={v}>{v}</option>)}
        </select>
        <select value={availability} onChange={e=>setAvailability(e.target.value)} aria-label="Filter by availability">
          <option value="">Any availability</option>
          {availabilities.map(v=><option key={v} value={v}>{v}</option>)}
        </select>
        {hasFilters && <button onClick={clearFilters} type="button">CLEAR FILTERS</button>}
      </div>
    </section>
    <section className={styles.directory}>
      <div className={styles.container}>
        <div className={styles.directoryHead}>
          <div><p className={styles.eyebrow}>VALU × PRIME</p><h2>{page.heading}</h2></div>
          <span>{results.length} {results.length===1?'PROFILE':'PROFILES'}</span>
        </div>
        {results.length ? <div className={styles.grid}>{results.map(p=><Profile key={p.id} p={p}/>)}</div> :
          <div className={styles.empty}><strong>No profiles match these filters.</strong><p>Adjust your search or clear the filters to explore the wider registry.</p>{hasFilters && <button onClick={clearFilters} type="button">CLEAR FILTERS</button>}</div>}
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
        <em>{p.marketplace_access_level === 'full' ? '✓ FULL VALU INDEX' : '✓ BASIC MARKETPLACE'}</em>
      </div>
      {p.marketplace_access_level === 'full' && p.valu_index != null && <div className={styles.valu}><small>VALU POINTS</small><b>{p.valu_index}</b></div>}
    </div>
    <div className={styles.accessRow}><span className={styles.accessBadge}>{p.marketplace_access_level === 'full' ? 'FULL VALU INDEX' : 'BASIC'}</span>{p.marketplace_access_level === 'full' && p.valu_tier && <span className={styles.tierBadge}>{p.valu_tier}</span>}</div>
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
      <small>CAPABILITY SNAPSHOT</small>
      <p>{summary}</p>
    </div>
    <Link href={`/profile/${p.id}${activeTrack === 'speaker' || activeTrack === 'facilitator' ? `?track=${activeTrack}` : ''}`} className={styles.view}>VIEW PROFILE</Link>
  </article>
}
