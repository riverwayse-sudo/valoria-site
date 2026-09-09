'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import EnquiryForm from '@/components/EnquiryForm'
import { PRIME_CLUSTERS } from '@/lib/brand'

const GOLD = '#C9A84C'
const MIDNIGHT = '#1A1A2E'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'
const LINEN = '#EDE8DC'
const BLUE = '#378ADD'
const TEAL = '#1D9E75'
const DIM = 'rgba(247,244,238,.42)'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'candidate', label: 'Talent' },
  { id: 'speaker', label: 'Speaker' },
  { id: 'facilitator', label: 'Facilitator' },
]
const TRACK_META = {
  candidate: { label: 'Talent', color: BLUE },
  speaker: { label: 'Speaker', color: GOLD },
  facilitator: { label: 'Facilitator', color: TEAL },
}

export default function MarketplacePage() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState('')
  const [availability, setAvailability] = useState('')
  const [cluster, setCluster] = useState('')
  const [session, setSession] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const requested = params.get('track')
    if (TABS.some(t => t.id === requested)) setTab(requested)
    loadListings()
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
  }, [])

  async function loadListings() {
    setLoading(true)
    const { data, error } = await supabase
      .from('marketplace_professionals')
      .select('professional_id, full_name, bio, location, languages, headline, capability, track, atb_id, display_initials, photo_url, industry, skills, topics, programme_types, availability, valu_index, cluster_scores, designation, fee_range, salary_expectation')
      .order('valu_index', { ascending: false, nullsFirst: false })
      .order('full_name', { ascending: true })

    if (error) {
      console.error('Marketplace capability query failed:', error)
      setListings([])
      setLoading(false)
      return
    }

    const real = (data || []).map(row => ({
      ...row,
      id: row.professional_id,
      active_tracks: [row.track],
      valu_score: row.valu_index,
      is_dummy: false,
    }))

    // Keep the existing visual padding with legacy sample records, but never
    // mix samples into the real capability counts.
    const minimum = 12
    const dummyNeeded = Math.max(0, minimum - real.length)
    let dummy = []
    if (dummyNeeded) {
      const { data: samples } = await supabase
        .from('marketplace_profiles')
        .select('id, atb_id, display_initials, headline, location, avatar_url, industry, skills, bio, section, featured')
        .in('section', ['talent', 'speaker'])
        .eq('status', 'active')
        .order('featured', { ascending: false })
        .limit(dummyNeeded)
      dummy = (samples || []).map(p => ({
        id: p.id,
        professional_id: p.id,
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
        track: p.section === 'speaker' ? 'speaker' : 'candidate',
        capability: p.section === 'speaker' ? 'speaker' : 'talent',
        active_tracks: [p.section === 'speaker' ? 'speaker' : 'candidate'],
        valu_score: null,
        cluster_scores: null,
        is_dummy: true,
      }))
    }

    setListings([...real, ...dummy])
    setLoading(false)
  }

  const counts = useMemo(() => {
    const result = { all: 0, candidate: 0, speaker: 0, facilitator: 0 }
    listings.forEach(item => {
      if (item.is_dummy) return
      result.all += 1
      if (result[item.track] != null) result[item.track] += 1
    })
    return result
  }, [listings])

  const industries = useMemo(() => [...new Set(listings.map(x => x.industry).filter(Boolean))].sort(), [listings])

  const filtered = useMemo(() => listings.filter(p => {
    const q = search.trim().toLowerCase()
    const tags = [...(p.skills || []), ...(p.topics || []), ...(p.programme_types || [])]
    const matchesTab = tab === 'all' || p.track === tab
    const matchesSearch = !q || [p.atb_id, p.full_name, p.headline, p.bio, ...tags].some(v => String(v || '').toLowerCase().includes(q))
    const matchesIndustry = !industry || p.industry === industry
    const currentAvailability = Array.isArray(p.availability) ? p.availability[0] : p.availability
    const matchesAvailability = !availability || currentAvailability === availability
    const matchesCluster = !cluster || (p.cluster_scores && Number(p.cluster_scores[cluster]) >= 75)
    return matchesTab && matchesSearch && matchesIndustry && matchesAvailability && matchesCluster
  }), [listings, tab, search, industry, availability, cluster])

  return (
    <main style={S.page}>
      <header style={S.header}>
        <Link href="/" style={{ lineHeight: 0 }}><img src="/logo.png" alt="Valoria Institute" style={{ height: 44 }} /></Link>
        <div style={{ textAlign: 'center' }}>
          <div style={S.headerLabel}>VALORIA MARKETPLACE</div>
          <div style={S.headerSub}>Capability-based listings · One professional account</div>
        </div>
        <Link href="/dashboard" style={S.nav}>Dashboard →</Link>
      </header>

      <nav style={S.tabs}>
        {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ ...S.tab, ...(tab === t.id ? S.tabActive : {}) }}>
          {t.label} <span style={{ opacity: .65 }}>{counts[t.id]}</span>
        </button>)}
      </nav>

      <section style={S.body}>
        <aside style={S.filters}>
          <div style={S.eyebrow}>FILTER</div>
          <label style={S.label}>Search<input style={S.input} placeholder="Name, skill, keyword…" value={search} onChange={e => setSearch(e.target.value)} /></label>
          <label style={S.label}>Industry<select style={S.input} value={industry} onChange={e => setIndustry(e.target.value)}><option value="">All industries</option>{industries.map(i => <option key={i}>{i}</option>)}</select></label>
          <label style={S.label}>Availability<select style={S.input} value={availability} onChange={e => setAvailability(e.target.value)}><option value="">Any</option><option value="open">Open</option><option value="contract_only">Contract</option></select></label>
          <div style={S.label}>PRIME cluster<div style={{ display: 'flex', gap: 6 }}>{PRIME_CLUSTERS.map(c => <button key={c.letter} onClick={() => setCluster(cluster === c.letter ? '' : c.letter)} style={{ ...S.cluster, borderColor: cluster === c.letter ? c.color : 'rgba(201,168,76,.2)', color: cluster === c.letter ? c.color : DIM }}>{c.letter}</button>)}</div></div>
          {(search || industry || availability || cluster) && <button style={S.clear} onClick={() => { setSearch(''); setIndustry(''); setAvailability(''); setCluster('') }}>Clear filters</button>}
        </aside>

        <section style={S.results}>
          <div style={{ marginBottom: 24 }}>
            <div style={S.title}>{tab === 'all' ? 'Everyone on Valoria' : TABS.find(t => t.id === tab)?.label}</div>
            <div style={S.count}>{loading ? 'Loading…' : `${filtered.length} listing${filtered.length === 1 ? '' : 's'} · ${counts.all} total capability listings`}</div>
          </div>

          {loading ? <div style={S.empty}>Loading marketplace…</div> : filtered.length === 0 ? <div style={S.empty}>No eligible listings match your filters.</div> : <div style={S.grid}>{filtered.map(p => <CapabilityCard key={`${p.id}-${p.track}`} profile={p} activeTab={tab} currentUser={session?.user} />)}</div>}
        </section>
      </section>
    </main>
  )
}

function CapabilityCard({ profile: p, activeTab, currentUser }) {
  const meta = TRACK_META[p.track] || TRACK_META.candidate
  const availability = Array.isArray(p.availability) ? p.availability[0] : p.availability
  const tags = [...new Set([...(p.skills || []), ...(p.topics || []), ...(p.programme_types || [])])].slice(0, 4)
  const initials = p.display_initials || (p.full_name || '?').split(' ').map(x => x[0]).slice(0, 2).join('')
  const enquiryType = p.track === 'facilitator' ? 'facilitator_commission' : p.track === 'speaker' ? 'speaker_booking' : 'candidate'
  const cta = p.track === 'facilitator' ? 'REQUEST FACILITATOR' : p.track === 'speaker' ? 'BOOK SPEAKER' : 'REQUEST INTRO'

  return <article style={S.card}>
    <div style={S.cardTop}>
      <div style={S.avatar}>{p.photo_url ? <img src={p.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={S.name}>{p.atb_id || p.full_name || 'Valoria Professional'}</div>
        <div style={S.small}>{initials} · Verified</div>
        <div style={S.headline}>{p.headline || p.designation || 'Valoria Professional'}</div>
        {p.location && <div style={S.location}>📍 {p.location}</div>}
      </div>
      {p.valu_score != null && <div style={S.valu}>VALU {p.valu_score}</div>}
    </div>

    <div><span style={{ ...S.track, borderColor: meta.color, color: meta.color }}>{meta.label}</span></div>
    {tags.length > 0 && <div style={S.tags}>{tags.map(t => <span key={t} style={S.tag}>{t}</span>)}</div>}
    {p.industry && <div style={S.industry}>{p.industry}</div>}
    {p.cluster_scores && <div style={S.clusterBar}>{PRIME_CLUSTERS.map(c => p.cluster_scores[c.letter] != null && <span key={c.letter} title={`${c.letter}: ${p.cluster_scores[c.letter]}`} style={{ ...S.clusterDot, background: c.color, opacity: Math.max(.25, Number(p.cluster_scores[c.letter]) / 100) }} />)}</div>}
    {p.bio && <p style={S.bio}>{p.bio.slice(0, 130)}{p.bio.length > 130 ? '…' : ''}</p>}
    {availability && <div style={S.availability}>● {availability === 'contract_only' ? 'Contract' : availability === 'open' ? 'Open' : availability}</div>}

    <div style={S.actions}>
      <Link href={`/profile/${p.id}?track=${p.track}`} style={S.view}>VIEW PROFILE</Link>
      <EnquiryForm professionalProfileId={p.id} atbId={p.atb_id} enquiryType={enquiryType} ctaLabel={cta} currentUser={currentUser} disabled={p.is_dummy} triggerStyle={S.action} />
    </div>
  </article>
}

const S = {
  page: { minHeight: '100vh', background: DARK, color: PARCHMENT, fontFamily: "'Raleway','Helvetica Neue',Arial,sans-serif" },
  header: { height: 72, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, background: MIDNIGHT, borderBottom: '1px solid rgba(201,168,76,.2)', position: 'sticky', top: 0, zIndex: 10 },
  headerLabel: { color: GOLD, fontSize: 13, fontWeight: 700, letterSpacing: '.12em' },
  headerSub: { color: DIM, fontSize: 10, marginTop: 4 },
  nav: { color: DIM, textDecoration: 'none', fontSize: 12 },
  tabs: { display: 'flex', gap: 8, flexWrap: 'wrap', padding: '18px 32px', background: 'rgba(26,26,46,.6)', borderBottom: '1px solid rgba(201,168,76,.08)' },
  tab: { padding: '9px 18px', borderRadius: 999, border: '1px solid rgba(201,168,76,.2)', background: 'transparent', color: DIM, cursor: 'pointer', fontWeight: 600 },
  tabActive: { background: GOLD, color: MIDNIGHT, borderColor: GOLD },
  body: { display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 'calc(100vh - 120px)' },
  filters: { padding: 28, borderRight: '1px solid rgba(201,168,76,.08)', background: 'rgba(26,26,46,.35)' },
  eyebrow: { color: GOLD, fontSize: 9, letterSpacing: '.16em', fontWeight: 700, marginBottom: 22 },
  label: { display: 'block', color: 'rgba(247,244,238,.55)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 20 },
  input: { display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 8, padding: '10px 12px', borderRadius: 6, border: '1px solid rgba(201,168,76,.15)', background: 'rgba(255,255,255,.04)', color: PARCHMENT },
  cluster: { flex: 1, padding: 8, background: 'transparent', border: '1px solid', borderRadius: 6, cursor: 'pointer', fontWeight: 700 },
  clear: { width: '100%', padding: 9, background: 'transparent', border: '1px solid rgba(201,168,76,.2)', borderRadius: 6, color: DIM, cursor: 'pointer' },
  results: { padding: 32 },
  title: { fontSize: 'clamp(20px,2.5vw,30px)', fontWeight: 300 },
  count: { color: DIM, fontSize: 13, marginTop: 4 },
  empty: { padding: 80, textAlign: 'center', color: DIM },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 },
  card: { background: PARCHMENT, color: MIDNIGHT, borderRadius: 8, padding: 20, border: '1px solid #D4C9A8', display: 'flex', flexDirection: 'column', gap: 10 },
  cardTop: { display: 'flex', alignItems: 'flex-start', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: MIDNIGHT, color: PARCHMENT, border: `2px solid ${GOLD}`, fontWeight: 700 },
  name: { fontSize: 13, fontWeight: 700 },
  small: { fontSize: 10, color: '#8A8578', marginTop: 3 },
  headline: { fontSize: 12, color: GOLD, marginTop: 4 },
  location: { fontSize: 11, color: '#5F5E5A', marginTop: 3 },
  valu: { color: GOLD, fontWeight: 700, fontSize: 12 },
  track: { display: 'inline-block', padding: '3px 10px', border: '1px solid', borderRadius: 999, fontSize: 10, fontWeight: 700 },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 5 },
  tag: { padding: '4px 8px', border: '1px solid #D4C9A8', borderRadius: 999, background: LINEN, fontSize: 10 },
  industry: { fontSize: 10, color: BLUE, fontWeight: 600 },
  clusterBar: { display: 'flex', gap: 5, borderTop: '1px solid #EDE8DC', paddingTop: 8 },
  clusterDot: { width: 18, height: 5, borderRadius: 3 },
  bio: { margin: 0, fontSize: 12, lineHeight: 1.6, color: '#444441' },
  availability: { fontSize: 10, color: '#1D9E75', fontWeight: 600 },
  actions: { display: 'flex', gap: 8, marginTop: 4 },
  view: { flex: 1, padding: 9, border: `1px solid ${MIDNIGHT}`, borderRadius: 999, color: MIDNIGHT, textDecoration: 'none', textAlign: 'center', fontSize: 10, fontWeight: 700, letterSpacing: '.08em' },
  action: { flex: 1, padding: 9, background: BLUE, border: 0, borderRadius: 999, color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '.08em' },
}
