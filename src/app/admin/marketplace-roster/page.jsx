'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getValuTier } from '@/lib/brand'

const C = { midnight: '#1A1A2E', gold: '#C9A84C', parchment: '#F7F4EE', muted: '#777786', line: 'rgba(26,26,46,.12)' }
const styles = {
  page: { minHeight: '100vh', background: C.parchment, color: C.midnight, padding: '30px clamp(16px,4vw,48px) 72px', fontFamily: 'Raleway,Arial,sans-serif' },
  shell: { maxWidth: 1280, margin: '0 auto' },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 18, flexWrap: 'wrap', marginBottom: 28 },
  kicker: { color: '#8B702B', fontSize: 9, fontWeight: 800, letterSpacing: '.18em' },
  title: { margin: '10px 0 8px', fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700, letterSpacing: '-.04em' },
  copy: { maxWidth: 760, margin: 0, color: '#686879', fontSize: 12, lineHeight: 1.75 },
  back: { color: '#8B702B', fontSize: 10, fontWeight: 800, letterSpacing: '.12em', textDecoration: 'none' },
  refresh: { minHeight: 42, padding: '0 18px', border: '1px solid #1A1A2E', background: '#1A1A2E', color: '#F7F4EE', font: '800 9px Raleway,Arial', letterSpacing: '.13em', cursor: 'pointer' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(145px,1fr))', gap: 10, margin: '24px 0' },
  stat: { padding: '16px 18px', border: '1px solid rgba(26,26,46,.12)', background: '#FFFEFC' },
  statLabel: { color: '#8B702B', fontSize: 8, fontWeight: 800, letterSpacing: '.14em' },
  statValue: { marginTop: 7, fontSize: 28, fontWeight: 700, fontVariantNumeric: 'tabular-nums' },
  tools: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', margin: '22px 0 14px' },
  search: { width: 'min(100%,420px)', minHeight: 44, boxSizing: 'border-box', padding: '0 14px', border: '1px solid rgba(26,26,46,.2)', background: '#FFFEFC', color: C.midnight, font: '12px Raleway,Arial', outlineColor: C.gold },
  list: { display: 'grid', gap: 10 },
  card: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 18, padding: '20px 22px', border: '1px solid rgba(26,26,46,.12)', background: '#FFFEFC' },
  name: { margin: 0, fontSize: 17, fontWeight: 700 },
  id: { marginTop: 5, color: '#8B702B', fontSize: 10, fontWeight: 800, letterSpacing: '.1em' },
  headline: { margin: '9px 0 0', color: '#686879', fontSize: 12, lineHeight: 1.6 },
  tags: { display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12 },
  tag: { padding: '5px 8px', border: '1px solid rgba(26,26,46,.14)', color: '#575768', fontSize: 8, fontWeight: 800, letterSpacing: '.08em' },
  goldTag: { padding: '5px 8px', border: '1px solid rgba(201,168,76,.5)', color: '#8B702B', fontSize: 8, fontWeight: 800, letterSpacing: '.08em' },
  side: { display: 'grid', alignContent: 'start', gap: 9, borderLeft: '1px solid rgba(26,26,46,.12)', paddingLeft: 18 },
  sideRow: { display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 10, lineHeight: 1.5 },
  capLabel: { marginTop: 12, color: '#8B702B', fontSize: 8, fontWeight: 800, letterSpacing: '.13em' },
  capList: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 7 },
  cap: { padding: '5px 8px', border: '1px solid rgba(26,26,46,.14)', fontSize: 9, fontWeight: 700 },
  eligibleCap: { padding: '5px 8px', border: '1px solid rgba(50,120,82,.35)', background: 'rgba(50,120,82,.07)', color: '#356B4B', fontSize: 9, fontWeight: 700 },
  alert: { padding: '14px 16px', borderLeft: '3px solid #B34F3C', background: 'rgba(179,79,60,.07)', color: '#913D30', fontSize: 12 },
  empty: { padding: 40, border: '1px dashed rgba(26,26,46,.22)', background: '#FFFEFC', textAlign: 'center' },
}

export default function AdminMarketplaceRosterPage() {
  const [candidates, setCandidates] = useState([])
  const [summary, setSummary] = useState({ total: 0, full: 0, basic: 0, public: 0, incomplete: 0 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Sign in with an authorised Valoria administrator account.')
      const response = await fetch('/api/admin/marketplace-roster', {
        headers: { Authorization: 'Bearer ' + session.access_token },
        cache: 'no-store',
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Could not load the marketplace roster.')
      setCandidates(data.candidates || [])
      setSummary(data.summary || { total: 0, full: 0, basic: 0, public: 0, incomplete: 0 })
    } catch (err) {
      setError(err.message || 'Could not load the marketplace roster.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('en')
    if (!q) return candidates
    return candidates.filter(profile =>
      [profile.display_name, profile.atb_id, profile.headline, profile.industry]
        .filter(Boolean).join(' ').toLocaleLowerCase('en').includes(q)
    )
  }, [candidates, search])

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.top}>
          <div>
            <Link href="/admin" style={styles.back}>← ADMINISTRATION</Link>
            <div style={{ ...styles.kicker, marginTop: 18 }}>INTERNAL CONTROL · READ ONLY</div>
            <h1 style={styles.title}>Marketplace roster</h1>
            <p style={styles.copy}>Review public professionals, assessment presentation, recorded visibility consent and capability-specific eligibility. This screen is read-only: it does not publish profiles or change participant records.</p>
          </div>
          <button type="button" style={styles.refresh} onClick={load} disabled={loading}>{loading ? 'REFRESHING…' : 'REFRESH ROSTER'}</button>
        </div>

        <div style={styles.stats}>
          {[
            ['PUBLIC PROFILES', summary.public],
            ['FULL VALU', summary.full],
            ['BASIC · TASTER', summary.basic],
            ['PROFILE INCOMPLETE', summary.incomplete],
            ['TOTAL IN ROSTER', summary.total],
          ].map(([label, value]) => <div style={styles.stat} key={label}><div style={styles.statLabel}>{label}</div><div style={styles.statValue}>{value}</div></div>)}
        </div>

        <div style={styles.tools}>
          <input style={styles.search} value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name, ATB ID, role or industry…" aria-label="Search marketplace roster" />
          <span style={{ color: C.muted, fontSize: 10 }}>{filtered.length} of {candidates.length} profiles</span>
        </div>

        {error && <div style={styles.alert} role="alert">{error}</div>}
        {loading && <div style={styles.empty}>Loading the public roster…</div>}
        {!loading && !error && filtered.length === 0 && <div style={styles.empty}><h2 style={{ margin: '0 0 8px', fontSize: 18 }}>{candidates.length ? 'No matching profiles' : 'No public profiles in this environment'}</h2><p style={{ margin: 0, color: C.muted, fontSize: 12 }}>Try another search or check the environment’s public roster.</p></div>}

        {!loading && !error && filtered.length > 0 && <div style={styles.list}>
          {filtered.map(profile => {
            const designation = profile.assessment_access === 'full' ? getValuTier(profile.valu_points, 'full')?.name : null
            return <article style={styles.card} key={profile.id}>
            <div>
              <h2 style={styles.name}>{profile.display_name || 'Unnamed professional'}</h2>
              <div style={styles.id}>{profile.atb_id || 'ATB ID pending'}</div>
              {profile.headline && <p style={styles.headline}>{profile.headline}</p>}
              <div style={styles.tags}>
                <span style={styles.goldTag}>{profile.assessment_access === 'full' ? 'FULL ASSESSMENT' : 'BASIC · TASTER'}</span>
                {profile.assessment_access === 'full' && profile.valu_points != null && <span style={styles.tag}>VALU {profile.valu_points} POINTS</span>}
                {designation && <span style={styles.goldTag}>{designation.toUpperCase()}</span>}
                <span style={styles.tag}>{profile.public_ready ? 'PUBLIC' : 'REVIEW'}</span>
              </div>
              <div style={styles.capLabel}>DECLARED CAPABILITIES</div>
              <div style={styles.capList}>
                {['talent', 'speaker', 'facilitator'].map(capability => {
                  const selected = profile.selected_capabilities.includes(capability)
                  const eligible = profile.eligible_capabilities.includes(capability)
                  return <span key={capability} style={eligible ? styles.eligibleCap : styles.cap}>{capability.toUpperCase()}{selected ? ' · SELECTED' : ' · NOT SELECTED'}</span>
                })}
              </div>
            </div>
            <div style={styles.side}>
              <div style={styles.sideRow}><span>Profile completion</span><strong>{profile.profile_complete ? 'Complete' : 'Incomplete'}</strong></div>
              <div style={styles.sideRow}><span>Public visibility consent</span><strong>{profile.public_consent ? 'Recorded' : 'Not recorded'}</strong></div>
              <div style={styles.sideRow}><span>Public listing</span><strong>{profile.public_ready ? 'Listed' : 'Not listed'}</strong></div>
              <div style={styles.sideRow}><span>Industry</span><strong>{profile.industry || 'Not supplied'}</strong></div>
              <div style={styles.sideRow}><span>Last roster refresh</span><strong>{profile.projection_refreshed_at ? new Date(profile.projection_refreshed_at).toLocaleString() : '—'}</strong></div>
            </div>
          </article>
          })}
        </div>}
      </div>
    </main>
  )
}
