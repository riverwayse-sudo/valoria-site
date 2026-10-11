'use client'

import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { useMemo, useState } from 'react'
import styles from './MarketplaceDirectory.module.css'
import ValoriaAvatar from '@/components/ValoriaAvatar'
import { getValuTier } from '@/lib/brand'

const TRACKS = [
  ['all', 'All', '/marketplace'],
  ['candidate', 'Talent', '/marketplace/talent'],
  ['speaker', 'Speakers', '/marketplace/speakers'],
  ['facilitator', 'Facilitators', '/marketplace/facilitators'],
]

const normalize = value => String(value || '').toLowerCase() === 'talent' ? 'candidate' : String(value || '').toLowerCase()
const displayText = value => String(value ?? '').normalize('NFKC').replace(/[\uFFFD]/g, '').trim()

export default function MarketplaceDirectory({ rows = [], counts = {}, activeTrack = 'all' }) {
  const [query, setQuery] = useState('')
  const [industry, setIndustry] = useState('')
  const industries = useMemo(() => [...new Set(rows.map(row => displayText(row.industry)).filter(Boolean))].sort(), [rows])

  const results = useMemo(() => {
    const search = query.trim().toLowerCase()
    return rows.filter(profile => {
      const capabilities = [...(profile.capabilities || profile.tracks || [profile.track])].map(normalize)
      if (activeTrack !== 'all' && !capabilities.includes(activeTrack)) return false
      if (industry && displayText(profile.industry) !== industry) return false
      if (!search) return true
      return [profile.atb_id, profile.headline, profile.current_job_title, profile.industry, ...(profile.skills || []), ...(profile.topics || [])]
        .some(value => displayText(value).toLowerCase().includes(search))
    })
  }, [rows, activeTrack, query, industry])

  return <div className={styles.page}>
    <Nav />
    <main>
      <section className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>THE AFRICAN TALENT BUREAU</p>
          <h1>{activeTrack === 'all' ? <>Find capability.<br /><i>Engage confidently.</i></> : <>{TRACKS.find(track => track[0] === activeTrack)?.[1]}<br /><i>on Valoria.</i></>}</h1>
          <p className={styles.lede}>A curated directory of professionals who have completed the Valoria assessment and meet the Institute's marketplace requirements.</p>
          <nav className={styles.tabs} aria-label="Marketplace categories">
            {TRACKS.map(([id, label, href]) => <Link key={id} href={href} className={activeTrack === id ? styles.activeTab : ''} aria-current={activeTrack === id ? 'page' : undefined}>{label}<b>{counts[id] || 0}</b></Link>)}
          </nav>
        </div>
      </section>
      <section className={styles.controls}>
        <div className={styles.containerControl}>
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search professionals, skills or industries…" aria-label="Search marketplace" />
          <select value={industry} onChange={event => setIndustry(event.target.value)} aria-label="Filter by industry">
            <option value="">All industries</option>
            {industries.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
          {(query || industry) && <button onClick={() => { setQuery(''); setIndustry('') }}>CLEAR</button>}
        </div>
      </section>
      <section className={styles.directory}>
        <div className={styles.container}>
          <div className={styles.directoryHead}>
            <div><p className={styles.eyebrow}>VERIFIED DIRECTORY</p><h2>{results.length} {results.length === 1 ? 'professional' : 'professionals'}</h2></div>
            <span>VALU INDEX <i>×</i> PRIME</span>
          </div>
          {results.length
            ? <div className={styles.grid}>{results.map(profile => <Profile key={profile.professional_id || profile.id} p={profile} />)}</div>
            : <div className={styles.empty}><strong>No professionals match this view.</strong><p>Try clearing the search or selecting another marketplace category.</p></div>}
        </div>
      </section>
    </main>
    <Footer />
  </div>
}

function Profile({ p }) {
  const capabilities = [...new Set([...(p.capabilities || p.tracks || [p.track])].map(normalize).filter(Boolean))]
  const capabilityBadges = capabilities.map(capability => ({
    key: capability,
    title: capability === 'candidate' ? 'PROFESSIONAL' : capability === 'speaker' ? 'SPEAKER' : capability === 'facilitator' ? 'FACILITATOR' : capability.toUpperCase(),
  }))
  const career = displayText(p.current_job_title || p.headline || '')
  const industry = displayText(p.industry || '')
  const isFullAssessment = p.assessment_access === 'full' && p.valu_index != null
  const tier = isFullAssessment ? getValuTier(p.valu_index, 'full') : null
  const profileId = displayText(p.atb_id || 'PROFILE ID PENDING')
  const assessmentSummary = isFullAssessment ? displayText(p.assessment_summary || '') : ''

  return <article className={styles.card}>
    <div className={styles.cardTop}>
      <ValoriaAvatar src={p.photo_url} seed={p.professional_id || p.atb_id} size={58} className={styles.avatar} />
      <div className={styles.identityCopy}>
        <small>ATB PROFILE ID</small>
        <strong className={styles.profileId} title={profileId}>{profileId}</strong>
        <div className={styles.scoreLine} aria-label={isFullAssessment ? `VALU Index score ${p.valu_index} points` : 'Full VALU Index pending'}>
          <strong>{isFullAssessment ? p.valu_index : '—'}</strong>
          <span>{isFullAssessment ? 'VALU INDEX POINTS' : 'SCORE PENDING'}</span>
        </div>
      </div>
    </div>

    <div className={styles.capabilityBlock}>
      <span className={styles.microLabel}>LISTED AS</span>
      <div className={styles.capabilities} aria-label="Marketplace listings">
        {capabilityBadges.map(badge => <span className={styles.capabilityBadge} key={badge.key}>{badge.title}</span>)}
      </div>
    </div>

    <div className={styles.roleBlock}>
      <p className={styles.role} title={career}>{career || 'Professional capability'}</p>
      {industry && <p className={styles.industry} title={industry}>{industry}</p>}
    </div>

    <div className={styles.assessmentInsight}>
      <div className={styles.sectionLabel}><span>VALU INDEX INSIGHT</span><span className={styles.insightRule} /></div>
      {isFullAssessment
        ? assessmentSummary
          ? <p className={styles.assessmentSummary} title={assessmentSummary}>{assessmentSummary}</p>
          : <p className={styles.assessmentPending}>Assessment insight is being prepared.</p>
        : <p className={styles.assessmentPending}>Complete the full assessment to unlock your insight.</p>}
    </div>

    <div className={styles.cardBottom}>
      <div className={styles.statusRow}>
        <span className={isFullAssessment ? styles.assessedStatus : styles.snapshotStatus}>
          {isFullAssessment ? '✓ FULL VALU INDEX' : 'SNAPSHOT · IN PROGRESS'}
        </span>
        {tier
          ? <span className={`${styles.tierBadge} ${styles[tier.badgeClass] || ''}`}>{tier.stars && <span className={styles.tierStars}>{tier.stars}</span>}{tier.name}</span>
          : <span className={styles.pendingBadge}>TIER PENDING</span>}
      </div>
      <Link href={`/profile/${encodeURIComponent(profileId)}`} className={styles.view}>View profile <span aria-hidden="true">↗</span></Link>
    </div>
  </article>
}
