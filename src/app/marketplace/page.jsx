'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const GOLD = '#C9A84C'
const MIDNIGHT = '#1A1A2E'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'
const LINEN = '#EDE8DC'

const TIER_BADGES = {
  emerging:    { label: '✦ Emerging',    bg: LINEN,    text: '#2E2E4A', border: '#D4C9A8' },
  established: { label: '✦✦ Established', bg: MIDNIGHT, text: GOLD,     border: 'none' },
  elite:       { label: '✦✦✦ Elite',      bg: GOLD,     text: MIDNIGHT,  border: 'none' },
}

const AVAIL_COLORS = { open: '#1D9E75', contract_only: GOLD, not_available: '#888' }

export default function MarketplacePage() {
  const [mode, setMode] = useState('talent') // 'talent' | 'speaker'
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterIndustry, setFilterIndustry] = useState('')
  const [filterTier, setFilterTier] = useState('')
  const [filterAvail, setFilterAvail] = useState('')

  useEffect(() => { fetchProfiles() }, [mode])

  async function fetchProfiles() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, headline, location, photo_url, user_type, industry, skills, topics, tier, availability, speaking_credits, bio')
      .eq('user_type', mode)
      .eq('is_visible', true)
      .order('speaking_credits', { ascending: false })
    setProfiles(data || [])
    setLoading(false)
  }

  const filtered = profiles.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || (p.display_name || '').toLowerCase().includes(q) ||
      (p.headline || '').toLowerCase().includes(q) ||
      (p.bio || '').toLowerCase().includes(q) ||
      (p.skills || []).some(s => s.toLowerCase().includes(q)) ||
      (p.topics || []).some(t => t.toLowerCase().includes(q))
    const matchIndustry = !filterIndustry || p.industry === filterIndustry
    const matchTier = !filterTier || p.tier === filterTier
    const matchAvail = !filterAvail || p.availability === filterAvail
    return matchSearch && matchIndustry && matchTier && matchAvail
  })

  return (
    <div style={styles.page}>

      {/* TOP BAR */}
      <header style={styles.header}>
        <Link href="/" style={styles.logo}>
          <img src="https://cdn.prod.website-files.com/69dc1aa64e9486349988bac7/69dc1c27ba1412845b48c9e6_relume-885162.png" alt="Valoria Institute" style={{ height: '44px', width: 'auto' }} />
        </Link>
        <div style={styles.modeTabs}>
          <button onClick={() => setMode('talent')} style={{ ...styles.modeTab, ...(mode === 'talent' ? styles.modeTabActive : {}) }}>
            ATB CONNECT <span style={styles.modeTabSub}>Talent</span>
          </button>
          <button onClick={() => setMode('speaker')} style={{ ...styles.modeTab, ...(mode === 'speaker' ? styles.modeTabActive : {}) }}>
            ATB SPOTLIGHT <span style={styles.modeTabSub}>Speakers</span>
          </button>
        </div>
        <Link href="/profile/edit" style={styles.profileLink}>My Profile →</Link>
      </header>

      <div style={styles.body}>

        {/* FILTERS SIDEBAR */}
        <aside style={styles.filters}>
          <div style={styles.eyebrow}><div style={styles.eyebrowLine} /><span style={styles.eyebrowText}>FILTER</span></div>

          <input type="search" placeholder="Search by name, skill, topic…" value={search}
            onChange={e => setSearch(e.target.value)} style={styles.searchInput} />

          {mode === 'talent' && (
            <>
              <FilterSection label="INDUSTRY">
                <select value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)} style={styles.select}>
                  <option value="">All industries</option>
                  {['Finance','Technology','Healthcare','Energy','Media','Education','Legal','Consulting','NGO/Development','Government'].map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </FilterSection>
              <FilterSection label="AVAILABILITY">
                {[['', 'All'], ['open', 'Open to opportunities'], ['contract_only', 'Contract only']].map(([v, l]) => (
                  <label key={v} style={styles.radioLabel}>
                    <input type="radio" name="avail" value={v} checked={filterAvail === v} onChange={() => setFilterAvail(v)} style={{ accentColor: GOLD }} /> {l}
                  </label>
                ))}
              </FilterSection>
            </>
          )}

          {mode === 'speaker' && (
            <FilterSection label="TIER">
              {[['', 'All tiers'], ['emerging', '✦ Emerging'], ['established', '✦✦ Established'], ['elite', '✦✦✦ Elite']].map(([v, l]) => (
                <label key={v} style={styles.radioLabel}>
                  <input type="radio" name="tier" value={v} checked={filterTier === v} onChange={() => setFilterTier(v)} style={{ accentColor: GOLD }} /> {l}
                </label>
              ))}
            </FilterSection>
          )}

          <button onClick={() => { setSearch(''); setFilterIndustry(''); setFilterTier(''); setFilterAvail('') }}
            style={styles.clearBtn}>Clear filters</button>
        </aside>

        {/* RESULTS */}
        <main style={styles.results}>
          <div style={styles.resultsHeader}>
            <div>
              <h1 style={styles.resultsTitle}>
                {mode === 'talent' ? 'PRIME-assessed talent.' : 'Verified speakers.'}
              </h1>
              <p style={styles.resultsCount}>
                {loading ? 'Loading…' : `${filtered.length} ${mode === 'talent' ? 'professional' : 'speaker'}${filtered.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
          </div>

          {loading ? (
            <div style={styles.loadingState}>Loading profiles…</div>
          ) : filtered.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '32px', color: GOLD, marginBottom: '12px' }}>◈</div>
              <p style={{ color: 'rgba(247,244,238,.4)', fontSize: '14px' }}>No profiles match your current filters.</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {filtered.map(p => <ProfileCard key={p.id} profile={p} mode={mode} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function ProfileCard({ profile: p, mode }) {
  const tier = TIER_BADGES[p.tier] || TIER_BADGES.emerging
  const tags = mode === 'speaker' ? (p.topics || []).slice(0, 2) : (p.skills || []).slice(0, 2)

  return (
    <div style={styles.card}>
      {/* Card header */}
      <div style={styles.cardHeader}>
        <div style={styles.avatarRing}>
          {p.photo_url
            ? <img src={p.photo_url} alt={p.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            : <span style={{ color: 'rgba(247,244,238,.3)', fontSize: '18px' }}>◈</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={styles.cardName}>{p.display_name || 'Anonymous'}</div>
          <div style={styles.cardHeadline}>{p.headline || 'Valoria Professional'}</div>
          {p.location && <div style={styles.cardLocation}>{p.location}</div>}
        </div>
        {mode === 'speaker' && (
          <span style={{ ...styles.tierBadge, background: tier.bg, color: tier.text, border: tier.border !== 'none' ? `1px solid ${tier.border}` : 'none' }}>
            {tier.label}
          </span>
        )}
        {mode === 'talent' && p.availability && (
          <span style={{ ...styles.availBadge, color: AVAIL_COLORS[p.availability] || '#888' }}>
            ● {p.availability === 'open' ? 'Open' : p.availability === 'contract_only' ? 'Contract' : 'Unavailable'}
          </span>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div style={styles.tagRow}>
          {tags.map(t => <span key={t} style={styles.tag}>{t}</span>)}
          {mode === 'speaker' && p.speaking_credits > 0 && (
            <span style={{ ...styles.tag, borderColor: 'rgba(201,168,76,.3)', color: GOLD }}>{p.speaking_credits} credits</span>
          )}
        </div>
      )}

      {/* Bio snippet */}
      {p.bio && <p style={styles.cardBio}>{p.bio.slice(0, 120)}{p.bio.length > 120 ? '…' : ''}</p>}

      {/* Actions */}
      <div style={styles.cardActions}>
        <Link href={`/profile/${p.id}`} style={styles.btnViewProfile}>VIEW PROFILE</Link>
        <Link href={`/profile/${p.id}#contact`} style={styles.btnBook}>
          {mode === 'speaker' ? 'BOOK NOW' : 'CONTACT'}
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

const styles = {
  page: { minHeight: '100vh', background: DARK, fontFamily: "'Raleway', 'Helvetica Neue', Arial, sans-serif", color: PARCHMENT },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '64px', background: MIDNIGHT, borderBottom: '1px solid rgba(201,168,76,.12)', position: 'sticky', top: 0, zIndex: 100, gap: '24px' },
  logo: { flexShrink: 0 },
  modeTabs: { display: 'flex', gap: '4px', background: 'rgba(255,255,255,.04)', borderRadius: '8px', padding: '4px' },
  modeTab: { padding: '8px 20px', borderRadius: '6px', border: 'none', background: 'transparent', color: 'rgba(247,244,238,.4)', fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', cursor: 'pointer', fontFamily: "'Raleway', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', transition: 'all .2s' },
  modeTabActive: { background: GOLD, color: MIDNIGHT },
  modeTabSub: { fontSize: '9px', fontWeight: 400, letterSpacing: '.05em', opacity: .7 },
  profileLink: { fontSize: '12px', color: 'rgba(247,244,238,.4)', textDecoration: 'none', whiteSpace: 'nowrap' },
  body: { display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 'calc(100vh - 64px)' },
  filters: { padding: '32px 20px', borderRight: '1px solid rgba(201,168,76,.08)', background: 'rgba(26,26,46,.4)' },
  eyebrow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
  eyebrowLine: { flex: 1, height: '1px', background: 'rgba(201,168,76,.2)' },
  eyebrowText: { fontSize: '9px', fontWeight: 700, letterSpacing: '.16em', color: GOLD },
  searchInput: { width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(201,168,76,.15)', borderRadius: '6px', color: PARCHMENT, fontSize: '13px', fontFamily: "'Raleway', sans-serif", outline: 'none', marginBottom: '24px', boxSizing: 'border-box' },
  select: { width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(201,168,76,.15)', borderRadius: '6px', color: PARCHMENT, fontSize: '13px', fontFamily: "'Raleway', sans-serif", outline: 'none' },
  radioLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgba(247,244,238,.55)', cursor: 'pointer', marginBottom: '8px' },
  clearBtn: { width: '100%', padding: '8px', background: 'transparent', border: '1px solid rgba(201,168,76,.15)', borderRadius: '6px', color: 'rgba(247,244,238,.35)', fontSize: '11px', cursor: 'pointer', fontFamily: "'Raleway', sans-serif", marginTop: '8px' },
  results: { padding: '32px' },
  resultsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' },
  resultsTitle: { fontSize: 'clamp(20px,2.5vw,30px)', fontWeight: 200, letterSpacing: '-.02em', marginBottom: '4px' },
  resultsCount: { fontSize: '13px', color: 'rgba(247,244,238,.35)', fontWeight: 300 },
  loadingState: { textAlign: 'center', color: 'rgba(247,244,238,.3)', padding: '80px', fontSize: '14px' },
  emptyState: { textAlign: 'center', padding: '80px 20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' },
  card: { background: PARCHMENT, border: `0.5px solid #D4C9A8`, borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' },
  cardHeader: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  avatarRing: { width: '52px', height: '52px', flexShrink: 0, borderRadius: '50%', border: `2px solid ${GOLD}`, background: MIDNIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cardName: { fontSize: '15px', fontWeight: 700, color: MIDNIGHT, lineHeight: 1.2, marginBottom: '2px' },
  cardHeadline: { fontSize: '12px', color: GOLD, fontWeight: 500, marginBottom: '2px' },
  cardLocation: { fontSize: '11px', color: '#5F5E5A' },
  tierBadge: { display: 'inline-block', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 },
  availBadge: { fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  tag: { padding: '4px 10px', borderRadius: '999px', border: '1px solid #D4C9A8', fontSize: '11px', color: '#2E2E4A', fontWeight: 500, background: '#EDE8DC' },
  cardBio: { fontSize: '12px', color: '#444441', lineHeight: 1.6, margin: 0 },
  cardActions: { display: 'flex', gap: '8px', marginTop: '4px' },
  btnViewProfile: { flex: 1, padding: '9px', border: `1px solid ${MIDNIGHT}`, borderRadius: '999px', color: MIDNIGHT, fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', textAlign: 'center', textDecoration: 'none', background: 'transparent' },
  btnBook: { flex: 1, padding: '9px', background: GOLD, borderRadius: '999px', color: MIDNIGHT, fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', textAlign: 'center', textDecoration: 'none', border: 'none' },
}
