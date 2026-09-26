import { notFound } from 'next/navigation'
import { getMarketplaceCounts, getMarketplaceRows } from '@/lib/marketplace-data'
import styles from './marketplace.module.css'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const TRACKS = {
  talent: { key: 'candidate', label: 'Talent', description: 'Verified professionals available for roles, projects and opportunities.' },
  speakers: { key: 'speaker', label: 'Speakers', description: 'Professionals available for keynotes, panels, fireside conversations and executive sessions.' },
  facilitators: { key: 'facilitator', label: 'Facilitators', description: 'Experienced practitioners available to facilitate learning, strategy and capability sessions.' },
}

export default async function MarketplaceTrackPage({ params }) {
  const config = TRACKS[params.track]
  if (!config) notFound()
  const [rows, counts] = await Promise.all([getMarketplaceRows(config.key), getMarketplaceCounts()])
  return <main className={styles.page}>
    <section className={styles.hero}><div className={styles.eyebrow}>VALORIA INSTITUTE · MARKETPLACE</div><h1>{config.label}</h1><p>{config.description}</p><div className={styles.stats}><span><strong>{counts[config.key] ?? 0}</strong> verified {config.label.toLowerCase()}</span><span>One professional profile · multiple capabilities</span></div></section>
    <nav className={styles.tabs} aria-label="Marketplace categories">{Object.entries(TRACKS).map(([slug,item]) => <a key={slug} href={`/marketplace/${slug}`} className={slug===params.track?styles.activeTab:''}>{item.label}</a>)}</nav>
    <section className={styles.directory}>{rows.length===0?<div className={styles.empty}><h2>No verified {config.label.toLowerCase()} are currently listed.</h2><p>Listings appear after the professional completes the required assessment and eligibility pathway.</p></div>:<div className={styles.grid}>{rows.map(profile=><article key={profile.id} className={styles.card}><div className={styles.identity}>{profile.photo_url?<img src={profile.photo_url} alt="" className={styles.avatar}/>:<div className={styles.avatarFallback}>{profile.display_initials||profile.full_name?.slice(0,2)?.toUpperCase()||'VI'}</div>}<div><h2>{profile.full_name}</h2>{profile.headline&&<p className={styles.headline}>{profile.headline}</p>}{profile.location&&<p className={styles.meta}>{profile.location}</p>}</div></div>{profile.bio&&<p className={styles.bio}>{profile.bio}</p>}<div className={styles.capabilities}>{(profile.capabilities||[]).map(capability=><span key={capability}>{capability==='candidate'?'Talent':capability}</span>)}</div><a className={styles.profileLink} href={`/profile/${profile.id}`}>View professional profile →</a></article>)}</div>}</section>
  </main>
}
