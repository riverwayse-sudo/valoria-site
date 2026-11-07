'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getValuTier } from '@/lib/brand'

const DARK = '#1A1A2E'
const PARCHMENT = '#F7F4EE'
const GOLD = '#C9A84C'
const MUTED = '#777786'

export default function AdminMarketplaceRosterPage() {
  const [candidates, setCandidates] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Please sign in with an administrator account.')
      const response = await fetch('/api/admin/marketplace-roster', {
        headers: { Authorization: \`Bearer \${session.access_token}\` },
        cache: 'no-store',
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Could not load the professional roster.')
      setCandidates(data.candidates || [])
    } catch (err) {
      setError(err.message || 'Could not load the professional roster.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('en')
    if (!q) return candidates
    return candidates.filter(p => \`\${p.display_name || ''} \${p.account_name || ''} \${p.atb_id || ''}\`.toLocaleLowerCase('en').includes(q))
  }, [candidates, search])

  const fullCount = candidates.filter(p => p.assessment_access === 'full').length
  const basicCount = candidates.filter(p => p.assessment_access === 'basic').length
  const publicReadyCount = candidates.filter(p => p.public_ready).length

  return (
    <main style={{ minHeight:'100vh', background:'#F7F4EE', color:DARK, padding:'30px clamp(18px,4vw,48px) 70px', fontFamily:'Raleway,Arial,sans-serif' }}>
      <div style={{ maxWidth:1280, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:18, flexWrap:'wrap', marginBottom:28 }}>
          <div>
            <Link href="/admin" style={{ color:'#8B702B', fontSize:10, fontWeight:800, letterSpacing:'.14em', textDecoration:'none' }}>← ADMINISTRATION</Link>
            <p style={{ margin:'18px 0 8px', color:'#8B702B', fontSize:9, fontWeight:800, letterSpacing:'.2em' }}>INTERNAL CONTROL · NOT PUBLIC</p>
            <h1 style={{ margin:0, fontSize:'clamp(28px,4vw,42px)', fontWeight:700, letterSpacing:'-.04em' }}>Marketplace roster readiness</h1>
            <p style={{ maxWidth:720, margin:'12px 0 0', color:'#686879', fontSize:13, lineHeight:1.75 }}>Assessment-linked, non-test professional accounts with aligned account and profile names. This page is an internal review tool; it does not publish profiles or bypass consent and eligibility controls.</p>
          </div>
          <button type="button" onClick={load} disabled={loading} style={{ minHeight:42, padding:'0 18px', border:'1px solid '+DARK, background:DARK, color:PARCHMENT, fontSize:9, fontWeight:800, letterSpacing:'.13em', cursor:loading?'wait':'pointer' }}>{loading?'REFRESHING…':'REFRESH ROSTER'}</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12, marginBottom:22 }}>
          {[
            ['CANDIDATES', candidates.length],
            ['FULL ASSESSMENT', fullCount],
            ['BASIC · TASTER', basicCount],
            ['PUBLICLY READY', publicReadyCount],
          ].map(([label,value])=><div key={label} style={{ padding:'18px 20px', border:'1px solid rgba(26,26,46,.12)', background:'#FFFEFC' }}>
            <div style={{ color:'#8B702B', fontSize:8, fontWeight:800, letterSpacing:'.16em' }}>{label}</div>
            <div style={{ marginTop:8, color:DARK, fontSize:30, fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{value}</div>
          </div>)}
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, flexWrap:'wrap', marginBottom:16 }}>
          <input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search name or ATB ID…" style={{ width:'min(100%,420px)', minHeight:44, boxSizing:'border-box', padding:'0 14px', border:'1px solid rgba(26,26,46,.18)', background:'#FFFEFC', color:DARK, font:'inherit', fontSize:12, outlineColor:GOLD }}/>
          <span style={{ color:MUTED, fontSize:10 }}>{filtered.length} of {candidates.length} candidates</span>
        </div>

        {error && <div role="alert" style={{ marginBottom:18, padding:14, borderLeft:'3px solid #B34F3C', background:'rgba(179,79,60,.07)', color:'#913D30', fontSize:12 }}>{error}</div>}

        {loading && <div style={{ padding:40, textAlign:'center', color:MUTED, fontSize:12 }}>Loading roster review…</div>}

        {!loading && !error && filtered.length === 0 && <div style={{ padding:40, border:'1px dashed rgba(26,26,46,.22)', background:'#FFFEFC', textAlign:'center' }}>
          <h2 style={{ margin:'0 0 8px', color:DARK, fontSize:18 }}>{candidates.length===0?'No candidate records in this environment':'No matching candidates'}</h2>
          <p style={{ maxWidth:520, margin:'0 auto', color:MUTED, fontSize:12, lineHeight:1.7 }}>{candidates.length===0?'The isolated staging database currently contains no professional profiles. Production participant records are not copied into staging.':'Try a different name or ATB ID.'}</p>
        </div>}

        {!loading && filtered.length>0 && <div style={{ display:'grid', gap:12 }}>
          {filtered.map(profile => {
            const full = profile.assessment_access === 'full'
            const tier = full ? getValuTier(Number(profile.valu_points), 'full') : null
            const state = profile.public_ready ? 'PUBLICLY READY' : !profile.public_consent ? 'CONSENT NOT RECORDED' : profile.visibility !== 'public' ? 'REGISTERED-ONLY' : 'LISTING CHECKS PENDING'
            return <article key={profile.id} style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(230px,.58fr)', gap:20, padding:'22px 24px', border:'1px solid rgba(26,26,46,.12)', background:'#FFFEFC' }}>
              <div>
                <div style={{ display:'flex', alignItems:'baseline', gap:10, flexWrap:'wrap' }}>
                  <h2 style={{ margin:0, color:DARK, fontSize:18, fontWeight:700 }}>{profile.display_name || 'Unnamed professional'}</h2>
                  <span style={{ color:MUTED, fontSize:10 }}>Account: {profile.account_name}</span>
                </div>
                <div style={{ marginTop:6, color:'#8B702B', fontSize:10, fontWeight:800, letterSpacing:'.1em' }}>{profile.atb_id || 'ATB ID pending'}</div>
                <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginTop:13 }}>
                  <span style={tagStyle}>{full?'FULL ASSESSMENT':'BASIC · TASTER'}</span>
                  {full && <span style={tagStyle}>VALU {profile.valu_points ?? '—'} POINTS</span>}
                  {full && tier && <span style={{...tagStyle,borderColor:'rgba(201,168,76,.5)',color:'#8B702B'}}>{tier.name.toUpperCase()}</span>}
                  {!full && <span style={{...tagStyle,color:'#527A61',borderColor:'rgba(82,122,97,.28)'}}>BASIC ACCESS VIA TASTER</span>}
                  <span style={tagStyle}>{profile.profile_complete?'PROFILE COMPLETE':'PROFILE INCOMPLETE'}</span>
                  {(profile.capability_labels||[]).map(label=><span key={label} style={tagStyle}>{label}</span>)}
                </div>
                {full && (profile.capability_issues||[]).length>0 && <div style={{ marginTop:12, color:'#9A6A32', fontSize:10, lineHeight:1.65 }}>
                  <strong style={{ letterSpacing:'.08em' }}>FULL CAPABILITY CHECKS PENDING:</strong> {profile.capability_issues.join(' · ')}
                </div>}
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', justifyContent:'center', gap:9, paddingLeft:20, borderLeft:'1px solid rgba(26,26,46,.1)' }}>
                <span style={{...tagStyle,color:profile.public_ready?'#527A61':'#9A6A32'}}>{state}</span>
                <span style={{ color:MUTED, fontSize:10 }}>Listing: {profile.listing_status} · Visibility: {profile.visibility}</span>
                <span style={{ color:MUTED, fontSize:10 }}>Public permission: {profile.public_consent?'Recorded':'Not recorded'}</span>
                <Link href={\`/profile/\${profile.id}\`} style={{ marginTop:4, color:'#8B702B', fontSize:9, fontWeight:800, letterSpacing:'.12em', textDecoration:'none' }}>REVIEW PROFILE ↗</Link>
              </div>
            </article>
          })}
        </div>}

        <p style={{ margin:'22px 0 0', color:'#9898A4', fontSize:10, lineHeight:1.6 }}>A completed taster is evaluated under the Basic pathway. Full VALU merit tiers are shown only for completed Full assessments. Public publication remains subject to explicit permission and the applicable listing and capability rules.</p>
      </div>
    </main>
  )
}

const tagStyle = {
  display:'inline-flex',
  alignItems:'center',
  minHeight:23,
  padding:'0 9px',
  border:'1px solid rgba(26,26,46,.12)',
  background:'rgba(26,26,46,.025)',
  color:'#555568',
  fontSize:8,
  fontWeight:800,
  letterSpacing:'.08em',
}
