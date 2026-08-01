'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PRIME_CLUSTERS } from '@/lib/brand'

// The real, unified marketplace — one listing showing everyone regardless
// of track, filterable by Talent / Speaker / Facilitator. Previously this
// route was a static 3-link chooser sending people off to three separate
// pages (/atb-connect, /atb-spotlight, /develop), each querying only its
// own track. Someone with more than one track (e.g. Speaker + Facilitator)
// showed up as if they were two unrelated people, once per siloed page,
// with no indication they were the same person. This page instead pulls
// every listed profile once and shows all of a person's tracks as badges
// on a single card — filtering narrows which cards are visible, it never
// re-fetches a "different" profile for the same person.

const GOLD = '#C9A84C'
const MIDNIGHT = '#1A1A2E'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'
const LINEN = '#EDE8DC'
const BLUE = '#378ADD'
const TEAL = '#1D9E75'
const PURPLE = '#7F77DD'
const DIM = 'rgba(247,244,238,.4)'

const AVAIL_COLORS = { open: '#1D9E75', contract_only: GOLD, not_available: '#888' }
const TRACK_META = {
  candidate:   { label: 'Talent',      color: BLUE },
  speaker:     { label: 'Speaker',     color: GOLD },
  facilitator: { label: 'Facilitator', color: TEAL },
}
const TABS = [
  { id: 'all',         label: 'All' },
  { id: 'candidate',   label: 'Talent' },
  { id: 'speaker',     label: 'Speaker' },
  { id: 'facilitator', label: 'Facilitator' },
]

function getAvatarLetters(displayInitials) {
  if (!displayInitials) return '?'
  const letters = displayInitials.replace(/\./g, '')
  return letters ? letters.toUpperCase() : '?'
}

// Same facilitator-first fallback the profile page itself uses when no
// ?track= is specified — kept in one place conceptually, duplicated here
// only because this is a separate bundle.
function primaryTrack(tracks) {
  if (!tracks || !tracks.length) return 'candidate'
  if (tracks.includes('facilitator')) return 'facilitator'
  if (tracks.includes('speaker')) return 'speaker'
  return 'candidate'
}

export default function MarketplacePage() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [filterIndustry, setFilterIndustry] = useState('')
  const [filterAvail, setFilterAvail] = useState('')
  const [filterCluster, setFilterCluster] = useState('')

  useEffect(() => {
    // Respect a ?track= hint from an old bookmark/link (e.g. someone with
    // /atb-spotlight saved) — old routes now redirect here with this param.
    const params = new URLSearchParams(window.location.search)
    const t = params.get('track')
    if (t && TABS.some(x => x.id === t)) setTab(t)
    fetchProfiles()
  }, [])

  async function fetchProfiles() {
    setLoading(true)
    const { data: real, error } = await supabase
      .from('professional_profiles')
      .select('id, atb_id, display_initials, headline, location, photo_url, active_tracks, industry, skills, topics, programme_types, availability, bio, valu_index, cluster_scores, listing_status, designation, fee_range, salary_expectation')
      .eq('listing_status', 'listed')
      .neq('visibility', 'private')
      .not('active_tracks', 'is', null)
      .order('valu_index', { ascending: false })

    if (error) console.error('Marketplace: profiles query failed:', error)
    const realList = (real || [])
      .filter(p => (p.active_tracks || []).length > 0)
      .map(p => ({ ...p, valu_score: p.valu_index, is_dummy: false }))

    // Samples pad the grid to a minimum size, same rule as the old
    // per-track pages — they never displace a real listing.
    const MIN_DISPLAY = 12
    const dummyNeeded = Math.max(0, MIN_DISPLAY - realList.length)
    if (dummyNeeded === 0) {
      setProfiles(realList)
      setLoading(false)
      return
    }

    const { data: dummy } = await supabase
      .from('marketplace_profiles')
      .select('id, atb_id, display_initials, headline, location, avatar_url, industry, skills, bio, section, featured')
      .in('section', ['talent', 'speaker'])
      .eq('status', 'active')
      .order('featured', { ascending: false })
      .limit(dummyNeeded)

    const dummyList = (dummy || []).map(p => ({
      id: p.id,
      atb_id: p.atb_id,
      display_initials: p.display_initials,
      headline: p.headline,
      location: p.location,
      photo_url: p.avatar_url,
      industry: p.industry,
      skills: p.skills || [],
      topics: p.section === 'speaker' ? (p.skills || []) : [],
      availability: 'open',
      bio: p.bio,
      active_tracks: [p.section === 'speaker' ? 'speaker' : 'candidate'],
      valu_score: null,
      cluster_scores: null,
      is_dummy: true,
    }))

    setProfiles([...realList, ...dummyList])
    setLoading(false)
  }

  const counts = useMemo(() => {
    const c = { all: profiles.length, candidate: 0, speaker: 0, facilitator: 0 }
    profiles.forEach(p => (p.active_tracks || []).forEach(t => { if (c[t] != null) c[t]++ }))
    return c
  }, [profiles])

  const filtered = profiles.filter(p => {
    const matchTab = tab === 'all' || (p.active_tracks || []).includes(tab)
    const q = search.toLowerCase()
    const allTags = [...(p.skills || []), ...(p.topics || []), ...(p.programme_types || [])]
    const matchSearch = !q ||
      (p.atb_id || '').toLowerCase().includes(q) ||
      (p.headline || '').toLowerCase().includes(q) ||
      (p.bio || '').toLowerCase().includes(q) ||
      allTags.some(s => s.toLowerCase().includes(q))
    const matchIndustry = !filterIndustry || p.industry === filterIndustry
    const availability = Array.isArray(p.availability) ? p.availability[0] : p.availability
    const matchAvail = !filterAvail || availability === filterAvail
    const matchCluster = !filterCluster || (p.cluster_scores && p.cluster_scores[filterCluster] >= 75)
    return matchTab && matchSearch && matchIndustry && matchAvail && matchCluster
  })

  const industries = [...new Set(profiles.map(p => p.industry).filter(Boolean))].sort()
  const hasActiveFilters = search || filterIndustry || filterAvail || filterCluster

  return (
    <div style={S.page}>
      <header style={S.header}>
        <Link href="/" style={{ lineHeight: 0 }}>
          <img src="/logo.png" alt="Valoria Institute" style={{ height: '44px', width: 'auto' }} />
        </Link>
        <div style={S.headerCenter}>
          <div style={S.headerLabel}>VALORIA MARKETPLACE</div>
          <div style={S.headerSub}>Talent · Speakers · Facilitators</div>
        </div>
        <Link href="/dashboard" style={S.navLink}>Dashboard →</Link>
      </header>

      <div style={S.tabsRow}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ ...S.tabBtn, ...(tab === t.id ? S.tabBtnActive : {}) }}>
            {t.label} <span style={S.tabCount}>{counts[t.id] ?? 0}</span>
          </button>
        ))}
      </div>

      <div style={S.body}>
        <aside style={S.filters}>
          <div style={S.eyebrow}><div style={S.eyebrowLine} /><span style={S.eyebrowText}>FILTER</span><div style={S.eyebrowLine} /></div>

          <FilterSection label="Search">
            <input style={S.searchInput} placeholder="Name, skill, keyword…" value={search} onChange={e => setSearch(e.target.value)} />
          </FilterSection>

          <FilterSection label="Industry">
            <select style={S.select} value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)}>
              <option value="">All industries</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </FilterSection>

          <FilterSection label="Availability">
            <select style={S.select} value={filterAvail} onChange={e => setFilterAvail(e.target.value)}>
              <option value="">Any</option>
              <option value="open">Open to introductions</option>
              <option value="contract_only">Contract only</option>
            </select>
          </FilterSection>

          <FilterSection label="Strongest PRIME cluster">
            <div style={S.clusterRow}>
              {PRIME_CLUSTERS.map(c => (
                <button key={c.letter} onClick={() => setFilterCluster(filterCluster === c.letter ? '' : c.letter)}
                  style={{ ...S.clusterChip, borderColor: filterCluster === c.letter ? c.color : 'rgba(201,168,76,.15)', color: filterCluster === c.letter ? c.color : 'rgba(247,244,238,.4)', background: filterCluster === c.letter ? `${c.color}14` : 'transparent' }}>
                  {c.letter}
                </button>
              ))}
            </div>
            <div style={S.clusterLabel}>75+ score in the selected cluster</div>
          </FilterSection>

          {hasActiveFilters && (
            <button style={S.clearBtn} onClick={() => { setSearch(''); setFilterIndustry(''); setFilterAvail(''); setFilterCluster('') }}>Clear filters</button>
          )}
        </aside>

        <main style={S.results}>
          <div style={{ marginBottom: '24px' }}>
            <div style={S.resultsTitle}>{tab === 'all' ? 'Everyone on Valoria' : TABS.find(t => t.id === tab)?.label}</div>
            <div style={S.resultsCount}>{loading ? 'Loading…' : `${filtered.length} profile${filtered.length === 1 ? '' : 's'}`}</div>
          </div>

          {loading ? (
            <div style={S.loadingState}>Loading profiles…</div>
          ) : filtered.length === 0 ? (
            <div style={S.emptyState}>
              <p style={{ color: DIM, fontSize: '14px' }}>No profiles match your filters yet.</p>
            </div>
          ) : (
            <div style={S.grid}>
              {filtered.map(p => <ProfileCard key={p.id} profile={p} activeTab={tab} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function ProfileCard({ profile: p, activeTab }) {
  const tracks = p.active_tracks || []
  const trackForLink = activeTab !== 'all' && tracks.includes(activeTab) ? activeTab : primaryTrack(tracks)
  const allTags = [...new Set([...(p.skills || []), ...(p.topics || []), ...(p.programme_types || [])])].slice(0, 3)
  const availability = Array.isArray(p.availability) ? p.availability[0] : p.availability
  const availColor = AVAIL_COLORS[availability] || '#888'
  const initials = p.display_initials || '—'
  const avatarLetters = getAvatarLetters(p.display_initials)
  const atbId = p.atb_id || '—'
  const compensation = p.fee_range || p.salary_expectation || null
  const compLabel = p.fee_range ? 'Fee' : 'Salary'

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
          <div style={S.cardInitials}>{initials}{!p.is_dummy && ' · Verified'}</div>
          <div style={S.cardHeadline}>{p.headline || 'Valoria Professional'}</div>
          {p.location && <div style={S.cardLocation}>📍 {p.location}</div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
          {p.is_dummy && <span style={S.sampleBadge}>SAMPLE</span>}
          {p.valu_score != null && <span style={{ fontSize: '13px', fontWeight: 700, color: GOLD }}>VALU {p.valu_score}</span>}
          {availability && (
            <span style={{ fontSize: '11px', fontWeight: 600, color: availColor }}>
              ● {availability === 'open' ? 'Open' : availability === 'contract_only' ? 'Contract' : 'Unavailable'}
            </span>
          )}
        </div>
      </div>

      <div style={S.trackRow}>
        {tracks.map(t => TRACK_META[t] && (
          <span key={t} style={{ ...S.trackPill, borderColor: TRACK_META[t].color, color: TRACK_META[t].color }}>{TRACK_META[t].label}</span>
        ))}
      </div>

      {(allTags.length > 0 || p.industry) && (
        <div style={S.tagRow}>
          {allTags.map(t => <span key={t} style={S.tag}>{t}</span>)}
          {p.industry && <span style={{ ...S.tag, borderColor: 'rgba(55,138,221,.3)', color: BLUE }}>{p.industry}</span>}
        </div>
      )}

      {p.cluster_scores && (
        <div style={S.clusterStrip}>
          {PRIME_CLUSTERS.map(c => {
            const score = p.cluster_scores[c.letter]
            if (score == null) return null
            return (
              <div key={c.letter} style={S.clusterSeg}>
                <div style={S.clusterTrack}><div style={{ ...S.clusterFill, height: `${score}%`, background: c.color }} /></div>
                <span style={{ ...S.clusterLetter, color: c.color }}>{c.letter}</span>
              </div>
            )
          })}
        </div>
      )}

      {p.bio && <p style={S.cardBio}>{p.bio.slice(0, 110)}{p.bio.length > 110 ? '…' : ''}</p>}
      {compensation && <p style={{ fontSize: '11px', color: '#8A8578', margin: 0 }}>{compLabel}: {compensation}</p>}

      <div style={S.cardActions}>
        <Link href={`/profile/${p.id}?track=${trackForLink}`} style={S.btnView}>VIEW PROFILE</Link>
        <Link href={`/profile/${p.id}?track=${trackForLink}#contact`} style={S.btnAction}>
          {trackForLink === 'facilitator' ? 'REQUEST FACILITATOR' : trackForLink === 'speaker' ? 'BOOK SPEAKER' : 'REQUEST INTRO'}
        </Link>
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
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '64px', background: MIDNIGHT, borderBottom: '1px solid rgba(201,168,76,.2)', position: 'sticky', top: 0, zIndex: 100, gap: '24px' },
  headerCenter: { textAlign: 'center' },
  headerLabel: { fontSize: '13px', fontWeight: 700, letterSpacing: '.12em', color: GOLD },
  headerSub: { fontSize: '10px', color: 'rgba(247,244,238,.35)', letterSpacing: '.06em' },
  navLink: { fontSize: '12px', color: 'rgba(247,244,238,.4)', textDecoration: 'none' },
  tabsRow: { display: 'flex', gap: '8px', padding: '18px 32px', borderBottom: '1px solid rgba(201,168,76,.08)', background: 'rgba(26,26,46,.5)', flexWrap: 'wrap' },
  tabBtn: { padding: '9px 18px', borderRadius: '999px', border: '1px solid rgba(201,168,76,.2)', background: 'transparent', color: 'rgba(247,244,238,.5)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Raleway',sans-serif", display: 'flex', alignItems: 'center', gap: '6px' },
  tabBtnActive: { background: GOLD, color: MIDNIGHT, borderColor: GOLD },
  tabCount: { fontSize: '10px', opacity: 0.7 },
  body: { display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 'calc(100vh - 120px)' },
  filters: { padding: '32px 20px', borderRight: '1px solid rgba(201,168,76,.08)', background: 'rgba(26,26,46,.4)' },
  eyebrow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
  eyebrowLine: { flex: 1, height: '1px', background: 'rgba(201,168,76,.2)' },
  eyebrowText: { fontSize: '9px', fontWeight: 700, letterSpacing: '.16em', color: GOLD },
  searchInput: { width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(201,168,76,.15)', borderRadius: '6px', color: PARCHMENT, fontSize: '13px', fontFamily: "'Raleway',sans-serif", outline: 'none', boxSizing: 'border-box' },
  select: { width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(201,168,76,.15)', borderRadius: '6px', color: PARCHMENT, fontSize: '13px', fontFamily: "'Raleway',sans-serif", outline: 'none' },
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
  card: { background: PARCHMENT, border: '0.5px solid #D4C9A8', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  cardHeader: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  avatar: { width: '52px', height: '52px', flexShrink: 0, borderRadius: '50%', border: `2px solid ${GOLD}`, background: MIDNIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cardName: { fontSize: '13px', fontWeight: 700, color: MIDNIGHT, lineHeight: 1.2, marginBottom: '2px', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '.01em' },
  cardInitials: { fontSize: '10.5px', color: '#8A8578', fontWeight: 600, marginBottom: '4px', letterSpacing: '.03em' },
  cardHeadline: { fontSize: '12px', color: GOLD, fontWeight: 500, marginBottom: '2px' },
  cardLocation: { fontSize: '11px', color: '#5F5E5A' },
  sampleBadge: { fontSize: '9px', fontWeight: 700, letterSpacing: '.08em', color: '#9A6A00', border: '1px solid rgba(154,106,0,.4)', borderRadius: '999px', padding: '2px 8px' },
  trackRow: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  trackPill: { padding: '3px 10px', borderRadius: '999px', border: '1px solid', fontSize: '10px', fontWeight: 700, letterSpacing: '.04em' },
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
  btnAction: { flex: 1, padding: '9px', background: BLUE, borderRadius: '999px', color: '#fff', fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', textAlign: 'center', textDecoration: 'none', border: 'none' },
}
