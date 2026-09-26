import styles from './MarketplaceDirectory.module.css'

const TRACKS = [['talent','Talent'],['speakers','Speakers'],['facilitators','Facilitators']]

export default function MarketplaceDirectory({ rows, counts, activeTrack }) {
  const label = activeTrack === 'all' ? 'All Professionals' : TRACKS.find(([key]) => key === activeTrack)?.[1] || 'Marketplace'
  const countKey = activeTrack === 'all' ? 'all' : activeTrack === 'talent' ? 'candidate' : activeTrack === 'speakers' ? 'speaker' : 'facilitator'
  return <main className={styles.page}>
    <section className={styles.hero}><div className={styles.eyebrow}>VALORIA INSTITUTE · MARKETPLACE</div><h1>{label}</h1><p>Verified professionals presented through one professional identity and their eligible capabilities.</p><div className={styles.stats}><span><strong>{counts?.[countKey] ?? 0}</strong> verified professionals</span><span>Talent · Speakers · Facilitators</span></div></section>
    <nav className={styles.tabs} aria-label="Marketplace categories"><a href="/marketplace" className={activeTrack==='all'?styles.activeTab:''}>All</a>{TRACKS.map(([slug,name])=><a key={slug} href={`/marketplace/${slug}`} className={activeTrack===slug?styles.activeTab:''}>{name}</a>)}</nav>
    <section className={styles.directory}>{rows.length===0?<div className={styles.empty}><h2>No verified professionals are currently listed.</h2><p>Listings appear after the required assessment and eligibility pathway is complete.</p></div>:<div className={styles.grid}>{rows.map(profile=><article key={profile.id} className={styles.card}><div className={styles.identity}>{profile.photo_url?<img src={profile.photo_url} alt="" className={styles.avatar}/>:<div className={styles.avatarFallback}>{profile.display_initials||profile.full_name?.slice(0,2)?.toUpperCase()||'VI'}</div>}<div><h2>{profile.full_name}</h2>{profile.headline&&<p className={styles.headline}>{profile.headline}</p>}{profile.location&&<p className={styles.meta}>{profile.location}</p>}</div></div>{profile.bio&&<p className={styles.bio}>{profile.bio}</p>}<div className={styles.capabilities}>{(profile.capabilities||[]).map(c=><span key={c}>{c==='candidate'?'Talent':c}</span>)}</div><a className={styles.profileLink} href={`/profile/${profile.id}`}>View professional profile →</a></article>)}</div>}</section>
  </main>
}
