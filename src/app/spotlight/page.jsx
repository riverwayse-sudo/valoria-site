'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PRIME_CLUSTERS } from '@/lib/brand'

const GOLD = '#C9A84C'
const MIDNIGHT = '#1A1A2E'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'
const LINEN = '#EDE8DC'

const TIER_BADGES = {
  tier_1: { label: '✦✦✦ Tier I',   bg: GOLD,     text: MIDNIGHT },
  tier_2: { label: '✦✦ Tier II',   bg: MIDNIGHT, text: GOLD },
  tier_3: { label: '✦ Tier III',   bg: LINEN,    text: '#2E2E4A' },
}

const TOPICS = ['Leadership','Strategy','Innovation','Diversity & Inclusion','Finance',
  'Technology & AI','Communication','Entrepreneurship','Governance','People Development',
  'Mental Health at Work','Global Affairs','Sustainability','Future of Work']

function getAvatarLetters(displayInitials) {
  if (!displayInitials) return '?'
  const letters = displayInitials.replace(/\./g, '')
  return letters ? letters.toUpperCase() : '?'
}

export default function ATBSpotlightPage() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTier, setFilterTier] = useState('')
  const [filterTopic, setFilterTopic] = useState('')
  const [filterCluster, setFilterCluster] = useState('')

  useEffect(() => { fetchProfiles() }, [])

  async function fetchProfiles() {
    setLoading(true)

    // Try real assessed speakers first
    const { data: real } = await supabase
      .from('professional_profiles')
      .select('id, atb_id, display_initials, headline, location, photo_url, active_tracks, industry, topics, speaker_tier, bio, valu_index, cluster_scores, listing_status, fee_range, youtube_links')
      .eq('listing_status', 'listed')
      .contains('active_tracks', ['speaker'])
      .order('valu_index', { ascending: false })

    if (real && real.length > 0) {
      setProfiles(real.map(p => ({ ...p, valu_score: p.valu_index })))
      setLoading(false)
      return
    }

    // Fallback: dummy speaker profiles
    const { data: dummy } = await supabase
      .from('marketplace_profiles')
      .select('id, atb_id, display_initials, headline, location, avatar_url, industry, skills, bio, fee_range, featured, video_url, years_experience')
      .eq('section', 'speaker')
      .eq('status', 'active')
      .order('featured', { ascending: false })

    setProfiles((dummy || []).map(p => ({
      id: p.id,
      atb_id: p.atb_id,
      display_initials: p.display_initials,
      headline: p.headline,
      location: p.location,
      photo_url: p.avatar_url,
      industry: p.industry,
      topics: p.skills || [],
      speaker_tier: p.featured ? 'tier_2' : 'tier_3',
      bio: p.bio,
      fee_range: p.fee_range,
      valu_score: null,
      cluster_scores: null,
      youtube_links: p.video_url ? [p.video_url] : [],
      is_dummy: true,
    })))
    setLoading(false)
  }

  const filtered = profiles.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      (p.atb_id || '').toLowerCase().includes(q) ||
      (p.headline || '').toLowerCase().includes(q) ||
      (p.bio || '').toLowerCase().includes(q) ||
      (p.topics || []).some(t => t.toLowerCase().includes(q))
    const matchTier = !filterTier || p.speaker_tier === filterTier
    const matchTopic = !filterTopic || (p.topics || []).includes(filterTopic)
    const matchCluster = !filterCluster || (p.cluster_scores && p.cluster_scores[filterCluster] >= 75)
    return matchSearch && matchTier && matchTopic && matchCluster
  })

  return (
    <div style={S.page}>

      {/* HEADER */}
      <header style={S.header}>
        <Link href="/" style={{ lineHeight: 0 }}>
          <img src="/logo.png" alt="Valoria Institute" style={{ height: '44px', width: 'auto' }} />
        </Link>
        <div style={S.headerCenter}>
          <div style={S.headerLabel}>ATB SPOTLIGHT</div>
          <div style={S.headerSub}>Speaker Discovery & Booking</div>
        </div>
        <nav style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link href="/atb-connect" style={S.navLink}>ATB Connect →</Link>
          <Link href="/login" style={S.navLink}>Sign In</Link>
        </nav>
      </header>

      <div style={S.body}>

        {/* FILTERS */}
        <aside style={S.filters}>
          <div style={S.eyebrow}><div style={S.eyebrowLine} /><span style={S.eyebrowText}>FILTER</span></div>

          <input type="search" placeholder="Search by name, topic…"
            value={search} onChange={e => setSearch(e.target.value)} style={S.searchInput} />

          <FilterSection label="TIER">
            {[['', 'All tiers'], ['tier_1', '✦✦✦ Tier I'], ['tier_2', '✦✦ Tier II'], ['tier_3', '✦ Tier III']].map(([v, l]) => (
              <label key={v} style={S.radioLabel}>
                <input type="radio" name="tier" value={v} checked={filterTier === v}
                  onChange={() => setFilterTier(v)} style={{ accentColor: GOLD }} /> {l}
              </label>
            ))}
          </FilterSection>

          <FilterSection label="TOPIC">
            <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)} style={S.select}>
              <option value="">All topics</option>
              {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </FilterSection>

          <FilterSection label="STRONGEST IN">
            <div style={S.clusterRow}>
              {PRIME_CLUSTERS.map(c => {
                const active = filterCluster === c.letter
                return (
                  <button key={c.letter} onClick={() => setFilterCluster(active ? '' : c.letter)}
                    title={c.name}
                    style={{ ...S.clusterChip, background: active ? c.color : 'transparent', borderColor: c.color, color: active ? MIDNIGHT : c.color }}>
                    {c.letter}
                  </button>
                )
              })}
            </div>
            {filterCluster && <div style={S.clusterLabel}>{PRIME_CLUSTERS.find(c => c.letter === filterCluster)?.name} ≥ 75</div>}
          </FilterSection>

          <button onClick={() => { setSearch(''); setFilterTier(''); setFilterTopic(''); setFilterCluster('') }}
            style={S.clearBtn}>Clear filters</button>
        </aside>

        {/* RESULTS */}
        <main style={S.results}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={S.resultsTitle}>Verified speakers.</h1>
            <p style={S.resultsCount}>
              {loading ? 'Loading…' : `${filtered.length} speaker${filtered.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {loading ? (
            <div style={S.loadingState}>Loading speakers…</div>
          ) : filtered.length === 0 ? (
            <div style={S.emptyState}>
              <div style={{ fontSize: '32px', color: GOLD, marginBottom: '12px' }}>◈</div>
              <p style={{ color: 'rgba(247,244,238,.4)', fontSize: '14px' }}>No speakers match your current filters.</p>
            </div>
          ) : (
            <div style={S.grid}>
              {filtered.map(p => <SpeakerCard key={p.id} profile={p} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function SpeakerCard({ profile: p }) {
  const tier = TIER_BADGES[p.speaker_tier] || TIER_BADGES.tier_3
  const topics = (p.topics || []).slice(0, 3)
  const hasReel = p.youtube_links && p.youtube_links.length > 0 && p.youtube_links[0]
  const initials = p.display_initials || '—'
  const avatarLetters = getAvatarLetters(p.display_initials)
  const atbId = p.atb_id || '—'

  return (
    <div style={S.card}>
      <div style={S.cardHeader}>
        <div style={S.avatar}>
          {p.photo_url
            ? <img src={p.photo_url} alt={`${initials} profile photo`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            : <span style={{ color: MIDNIGHT, fontSize: '15px', fontWeight: 700 }}>{avatarLetters}</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={S.cardName}>{atbId}</div>
          <div style={S.cardInitials}>{initials} · Verified</div>
          <div style={S.cardHeadline}>{p.headline || 'Valoria Speaker'}</div>
          {p.location && <div style={S.cardLocation}>📍 {p.location}</div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
          <span style={{ ...S.tierBadge, background: tier.bg, color: tier.text }}>{tier.label}</span>
          {p.valu_score != null && <span style={{ fontSize: '11px', fontWeight: 700, color: GOLD }}>VALU {p.valu_score}</span>}
        </div>
      </div>

      {topics.length > 0 && (
        <div style={S.tagRow}>
          {topics.map(t => <span key={t} style={S.tag}>{t}</span>)}
          {p.fee_range && <span style={{ ...S.tag, borderColor: 'rgba(201,168,76,.3)', color: GOLD }}>{p.fee_range}</span>}
        </div>
      )}

      {hasReel && (
        <div style={{ fontSize: '11px', color: GOLD, display: 'flex', alignItems: 'center', gap: '4px' }}>
          ▶ Speaker reel available
        </div>
      )}

      {p.cluster_scores && (
        <div style={S.clusterStrip}>
          {PRIME_CLUSTERS.map(c => {
            const score = p.cluster_scores[c.letter]
            if (score == null) return null
            return (
              <div key={c.letter} style={S.clusterSeg}>
                <div style={S.clusterTrack}>
                  <div style={{ ...S.clusterFill, height: `${score}%`, background: c.color }} />
                </div>
                <span style={{ ...S.clusterLetter, color: c.color }}>{c.letter}</span>
              </div>
            )
          })}
        </div>
      )}

      {p.bio && <p style={S.cardBio}>{p.bio.slice(0, 110)}{p.bio.length > 110 ? '…' : ''}</p>}

      <div style={S.cardActions}>
        <Link href={`/profile/${p.id}`} style={S.btnView}>VIEW PROFILE</Link>
        <Link href={`/profile/${p.id}#contact`} style={S.btnAction}>BOOK SPEAKER</Link>
      </div>
    </div>
  )
}

function FilterSection({ label, children }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.14em', color: 'rgba(201,168,76,.6)', marginBottom: '10px', textTransform: 'uppercase' }}>{label}</div>
      {children}
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: DARK, fontFamily: "'Raleway','Helvetica Neue',Arial,sans-serif", color: PARCHMENT },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '64px', background: MIDNIGHT, borderBottom: `1px solid rgba(201,168,76,.2)`, position: 'sticky', top: 0, zIndex: 100, gap: '24px' },
  headerCenter: { textAlign: 'center' },
  headerLabel: { fontSize: '13px', fontWeight: 700, letterSpacing: '.12em', color: GOLD },
  headerSub: { fontSize: '10px', color: 'rgba(247,244,238,.35)', letterSpacing: '.06em' },
  navLink: { fontSize: '12px', color: 'rgba(247,244,238,.4)', textDecoration: 'none' },
  body: { display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 'calc(100vh - 64px)' },
  filters: { padding: '32px 20px', borderRight: '1px solid rgba(201,168,76,.08)', background: 'rgba(26,26,46,.4)' },
  eyebrow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
  eyebrowLine: { flex: 1, height: '1px', background: 'rgba(201,168,76,.2)' },
  eyebrowText: { fontSize: '9px', fontWeight: 700, letterSpacing: '.16em', color: GOLD },
  searchInput: { width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(201,168,76,.15)', borderRadius: '6px', color: PARCHMENT, fontSize: '13px', fontFamily: "'Raleway',sans-serif", outline: 'none', marginBottom: '24px', boxSizing: 'border-box' },
  select: { width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(201,168,76,.15)', borderRadius: '6px', color: PARCHMENT, fontSize: '13px', fontFamily: "'Raleway',sans-serif", outline: 'none' },
  radioLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgba(247,244,238,.55)', cursor: 'pointer', marginBottom: '8px' },
  clearBtn: { width: '100%', padding: '8px', background: 'transparent', border: '1px solid rgba(201,168,76,.15)', borderRadius: '6px', color: 'rgba(247,244,238,.35)', fontSize: '11px', cursor: 'pointer', fontFamily: "'Raleway',sans-serif", marginTop: '8px' },
  clusterRow: { display: 'flex', gap: '6px' },
  clusterChip: { flex: 1, padding: '8px 0', borderRadius: '6px', border: '1.5px solid', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Raleway',sans-serif", transition: 'all .15s' },
  clusterLabel: { fontSize: '10px', color: 'rgba(247,244,238,.4)', marginTop: '8px', textAlign: 'center' },
  results: { padding: '32px' },
  resultsTitle: { fontSize: 'clamp(20px,2.5vw,30px)', fontWeight: 200, letterSpacing: '-.02em', marginBottom: '4px' },
  resultsCount: { fontSize: '13px', color: 'rgba(247,244,238,.35)', fontWeight: 300 },
  loadingState: { textAlign: 'center', color: 'rgba(247,244,238,.3)', padding: '80px', fontSize: '14px' },
  emptyState: { textAlign: 'center', padding: '80px 20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' },
  card: { background: PARCHMENT, border: '0.5px solid #D4C9A8', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' },
  cardHeader: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  avatar: { width: '52px', height: '52px', flexShrink: 0, borderRadius: '50%', border: `2px solid ${GOLD}`, background: MIDNIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cardName: { fontSize: '13px', fontWeight: 700, color: MIDNIGHT, lineHeight: 1.2, marginBottom: '2px', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '.01em' },
  cardInitials: { fontSize: '10.5px', color: '#8A8578', fontWeight: 600, marginBottom: '4px', letterSpacing: '.03em' },
  cardHeadline: { fontSize: '12px', color: GOLD, fontWeight: 500, marginBottom: '2px' },
  cardLocation: { fontSize: '11px', color: '#5F5E5A' },
  tierBadge: { display: 'inline-block', padding: '4px 10px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap' },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  tag: { padding: '4px 10px', borderRadius: '999px', border: '1px solid #D4C9A8', fontSize: '11px', color: '#2E2E4A', fontWeight: 500, background: LINEN },
  clusterStrip: { display: 'flex', gap: '6px', alignItems: 'flex-end', padding: '10px 4px 2px', borderTop: '1px solid #EDE8DC' },
  clusterSeg: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 },
  clusterTrack: { width: '100%', height: '28px', background: '#EDE8DC', borderRadius: '2px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' },
  clusterFill: { width: '100%', borderRadius: '2px', transition: 'height .3s' },
  clusterLetter: { fontSize: '9px', fontWeight: 700, letterSpacing: '.04em' },
  cardBio: { fontSize: '12px', color: '#444441', lineHeight: 1.6, margin: 0 },
  cardActions: { display: 'flex', gap: '8px', marginTop: '4px' },
  btnView: { flex: 1, padding: '9px', border: `1px solid ${MIDNIGHT}`, borderRadius: '999px', color: MIDNIGHT, fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', textAlign: 'center', textDecoration: 'none', background: 'transparent' },
  btnAction: { flex: 1, padding: '9px', background: GOLD, borderRadius: '999px', color: MIDNIGHT, fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', textAlign: 'center', textDecoration: 'none', border: 'none' },
}
