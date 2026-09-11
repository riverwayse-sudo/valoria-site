'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const T = {
  dark: '#0F0F1A',
  midnight: '#1A1A2E',
  parchment: '#F7F4EE',
  gold: '#C9A84C',
  muted: 'rgba(247,244,238,.58)',
  faint: 'rgba(247,244,238,.32)',
  line: 'rgba(201,168,76,.18)',
  green: '#1D9E75',
}

const PATHS = [
  {
    key: 'candidate',
    name: 'Talent',
    bureau: 'ATB Connect',
    description: 'Be discoverable for roles, opportunities, placement and strategic introductions.',
    href: '/marketplace/talent',
  },
  {
    key: 'speaker',
    name: 'Speaker',
    bureau: 'ATB Spotlight',
    description: 'Be discoverable for keynotes, panels, events and speaking engagements.',
    href: '/marketplace/speakers',
  },
  {
    key: 'facilitator',
    name: 'Facilitator',
    bureau: 'ATB Develop',
    description: 'Be discoverable for learning programmes, workshops and organisational development.',
    href: '/marketplace/facilitators',
  },
]

export default function ProfileSettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [capabilities, setCapabilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [draftPaths, setDraftPaths] = useState([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: auth } = await supabase.auth.getUser()
      const u = auth?.user
      if (!u) {
        router.push('/login?redirect=/profile/settings')
        return
      }
      const [{ data: p, error: profileError }, { data: caps, error: capError }] = await Promise.all([
        supabase.from('professional_profiles').select('id,atb_id,display_name,headline,active_tracks,profile_complete,listing_status,valu_index').eq('id', u.id).maybeSingle(),
        supabase.from('professional_capabilities').select('id,professional_id,capability,is_active,eligibility_status,eligible_for_listing').eq('professional_id', u.id).order('capability'),
      ])
      if (cancelled) return
      if (profileError) setError('We could not load your profile settings.')
      if (capError) console.error('Capability settings load failed:', capError)
      setUser(u)
      setProfile(p)
      setCapabilities(caps || [])
      setDraftPaths(p?.active_tracks || [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [router])

  const capabilityByKey = useMemo(() => Object.fromEntries(capabilities.map(c => [c.capability, c])), [capabilities])
  const activeCount = draftPaths.length

  function togglePath(key) {
    setMessage('')
    setError('')
    setDraftPaths(current => current.includes(key) ? current.filter(x => x !== key) : [...current, key])
  }

  async function savePaths() {
    if (!user || !draftPaths.length) {
      setError('Keep at least one capability path active. Your Valoria identity can have one or more paths.')
      return
    }
    setSaving(true)
    setMessage('')
    setError('')

    const { error: updateError } = await supabase
      .from('professional_profiles')
      .update({ active_tracks: draftPaths })
      .eq('id', user.id)
      .select('id,active_tracks')
      .maybeSingle()

    if (updateError) {
      console.error('Capability path save failed:', updateError)
      setError(updateError.message || 'Your capability paths could not be saved. Please try again.')
      setSaving(false)
      return
    }

    // The readiness/capability layer owns the marketplace capability records.
    // Refresh after the profile update so the UI reflects the authoritative rows.
    const { data: caps } = await supabase
      .from('professional_capabilities')
      .select('id,professional_id,capability,is_active,eligibility_status,eligible_for_listing')
      .eq('professional_id', user.id)
      .order('capability')

    setCapabilities(caps || [])
    setProfile(p => ({ ...p, active_tracks: draftPaths }))
    setMessage(`${draftPaths.length} capability ${draftPaths.length === 1 ? 'path' : 'paths'} saved.`)
    setSaving(false)
  }

  if (loading) return <div style={S.page}><div style={S.loading}>Loading profile settings…</div></div>

  return (
    <main style={S.page}>
      <header style={S.header}>
        <Link href={profile ? `/profile/${profile.id}` : '/dashboard'} style={S.back}>← Back to profile</Link>
        <div style={S.headerTitle}>PROFILE SETTINGS</div>
        <Link href="/dashboard" style={S.dashboard}>Dashboard →</Link>
      </header>

      <div style={S.container}>
        <section style={S.intro}>
          <div style={S.eyebrow}>YOUR VALORIA IDENTITY</div>
          <h1 style={S.h1}>One professional profile.<br /><em>Multiple capability paths.</em></h1>
          <p style={S.lead}>
            Your Valoria account represents <strong>one professional identity</strong>. Your capabilities sit underneath that identity and can be activated independently for the marketplace.
          </p>
          <div style={S.identityBar}>
            <div><span>PROFILE ID</span><strong>{profile?.atb_id || 'Not assigned'}</strong></div>
            <div><span>ACTIVE PATHS</span><strong>{activeCount}</strong></div>
            {profile?.valu_index != null && <div><span>VALU</span><strong>{profile.valu_index}/100</strong></div>}
          </div>
        </section>

        <section style={S.section}>
          <div style={S.sectionHead}>
            <div>
              <div style={S.eyebrow}>CAPABILITY PATHS</div>
              <h2 style={S.sectionTitle}>How you want to be engaged</h2>
              <p style={S.sectionCopy}>You can have one, two, or all three. Selecting more than one does not create another account or another person — it creates another capability under the same Profile ID.</p>
            </div>
            <span style={S.count}>{activeCount}/3 active</span>
          </div>

          <div style={S.pathGrid}>
            {PATHS.map(path => {
              const active = draftPaths.includes(path.key)
              const cap = capabilityByKey[path.key]
              const status = cap?.eligible_for_listing ? 'Marketplace eligible' : cap?.is_active ? 'Profile in development' : 'Not active'
              return (
                <button key={path.key} type="button" onClick={() => togglePath(path.key)} style={{ ...S.path, ...(active ? S.pathActive : {}) }} aria-pressed={active}>
                  <div style={S.pathTop}><span style={{ ...S.checkbox, ...(active ? S.checkboxActive : {}) }}>{active ? '✓' : ''}</span><span style={S.pathName}>{path.name}</span><span style={S.pathStatus}>{status}</span></div>
                  <div style={S.bureau}>{path.bureau}</div>
                  <p>{path.description}</p>
                  <div style={S.pathFooter}>{active ? 'ACTIVE CAPABILITY' : 'ACTIVATE PATH'} <span>→</span></div>
                </button>
              )
            })}
          </div>

          {message && <div style={S.success}>{message}</div>}
          {error && <div style={S.error}>{error}</div>}

          <div style={S.actions}>
            <button type="button" onClick={savePaths} disabled={saving} style={S.save}>{saving ? 'Saving…' : 'SAVE CAPABILITY PATHS'}</button>
            <span style={S.note}>Changing paths does not change your Profile ID, VALU result, or professional identity.</span>
          </div>
        </section>

        <section style={S.section}>
          <div style={S.eyebrow}>PATH-SPECIFIC INFORMATION</div>
          <h2 style={S.sectionTitle}>Each capability has its own profile requirements.</h2>
          <div style={S.requirements}>
            <div><strong>Talent</strong><span>Work history, skills, availability, notice period and salary expectations.</span><Link href="/profile/edit#talent">Manage Talent details →</Link></div>
            <div><strong>Speaker</strong><span>Topics, formats, audience sizes, speaking engagements, fee range and speaker reel.</span><Link href="/profile/edit#speaker">Manage Speaker details →</Link></div>
            <div><strong>Facilitator</strong><span>Programme types, past clients, facilitation information, fee range and credentials.</span><Link href="/profile/edit#facilitator">Manage Facilitator details →</Link></div>
          </div>
        </section>

        <section style={S.footerCard}>
          <div><div style={S.eyebrow}>PROFILE MANAGEMENT</div><strong>Edit your professional information</strong><p>Name, headline, bio, media, languages and other shared profile information live in one place.</p></div>
          <Link href="/profile/edit" style={S.secondary}>EDIT PROFILE →</Link>
        </section>
      </div>

      <style>{CSS}</style>
    </main>
  )
}

const S = {
  page: { minHeight:'100vh', background:T.dark, color:T.parchment, fontFamily:"'Raleway','Helvetica Neue',Arial,sans-serif", paddingBottom:80 },
  header: { height:64, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', background:T.midnight, borderBottom:`1px solid ${T.line}`, position:'sticky', top:0, zIndex:20 },
  back: { width:180, color:T.muted, textDecoration:'none', fontSize:12 },
  headerTitle: { color:T.gold, fontSize:12, fontWeight:700, letterSpacing:'.18em' },
  dashboard: { width:180, textAlign:'right', color:T.muted, textDecoration:'none', fontSize:12 },
  container: { maxWidth:1040, margin:'0 auto', padding:'56px 24px' },
  intro: { padding:'8px 0 36px' },
  eyebrow: { color:'rgba(201,168,76,.72)', fontSize:10, fontWeight:700, letterSpacing:'.22em', textTransform:'uppercase' },
  h1: { fontSize:'clamp(34px,5vw,62px)', lineHeight:1.02, letterSpacing:'-.035em', fontWeight:500, margin:'14px 0 18px' },
  lead: { maxWidth:720, color:T.muted, fontSize:16, lineHeight:1.75, margin:0 },
  identityBar: { display:'flex', flexWrap:'wrap', gap:1, marginTop:32, borderTop:`1px solid ${T.line}`, borderBottom:`1px solid ${T.line}` },
  section: { background:'rgba(255,255,255,.025)', border:`1px solid ${T.line}`, padding:'30px', marginBottom:20 },
  sectionHead: { display:'flex', justifyContent:'space-between', gap:24, alignItems:'flex-start', marginBottom:24 },
  sectionTitle: { fontSize:22, fontWeight:500, letterSpacing:'-.02em', margin:'8px 0 8px' },
  sectionCopy: { color:T.muted, fontSize:13, lineHeight:1.7, maxWidth:700, margin:0 },
  count: { color:T.gold, border:`1px solid ${T.line}`, borderRadius:999, padding:'7px 12px', fontSize:10, letterSpacing:'.12em', whiteSpace:'nowrap' },
  pathGrid: { display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:12 },
  path: { textAlign:'left', border:'1px solid rgba(247,244,238,.10)', background:'rgba(247,244,238,.025)', color:T.parchment, padding:20, minHeight:230, cursor:'pointer', fontFamily:'inherit', transition:'transform .2s,border-color .2s,background .2s', },
  pathActive: { border:`1px solid rgba(201,168,76,.65)`, background:'rgba(201,168,76,.07)', transform:'translateY(-2px)' },
  pathTop: { display:'flex', alignItems:'center', gap:10 },
  checkbox: { width:22, height:22, border:'1px solid rgba(201,168,76,.35)', display:'inline-flex', alignItems:'center', justifyContent:'center', color:T.dark, fontSize:12, flexShrink:0 },
  checkboxActive: { background:T.gold, borderColor:T.gold },
  pathName: { fontSize:20, fontWeight:600 },
  pathStatus: { marginLeft:'auto', color:T.faint, fontSize:9, letterSpacing:'.08em', textTransform:'uppercase', textAlign:'right' },
  bureau: { color:T.gold, fontSize:10, fontWeight:700, letterSpacing:'.16em', marginTop:18 },
  path: { textAlign:'left', border:'1px solid rgba(247,244,238,.10)', background:'rgba(247,244,238,.025)', color:T.parchment, padding:20, minHeight:230, cursor:'pointer', fontFamily:'inherit', transition:'transform .2s,border-color .2s,background .2s' },
  pathFooter: { marginTop:20, paddingTop:14, borderTop:'1px solid rgba(247,244,238,.08)', color:T.gold, fontSize:9, fontWeight:700, letterSpacing:'.15em', display:'flex', justifyContent:'space-between' },
  success: { marginTop:18, padding:12, border:'1px solid rgba(29,158,117,.35)', background:'rgba(29,158,117,.08)', color:'#7FD7B8', fontSize:12 },
  error: { marginTop:18, padding:12, border:'1px solid rgba(216,90,48,.35)', background:'rgba(216,90,48,.08)', color:'#F09595', fontSize:12 },
  actions: { display:'flex', alignItems:'center', gap:18, marginTop:22, flexWrap:'wrap' },
  save: { background:T.gold, color:T.dark, border:0, padding:'13px 20px', fontSize:10, fontWeight:800, letterSpacing:'.13em', cursor:'pointer', fontFamily:'inherit' },
  note: { color:T.faint, fontSize:11, lineHeight:1.5 },
  requirements: { display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:12, marginTop:20 },
  requirements: { display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:12, marginTop:20 },
  footerCard: { display:'flex', justifyContent:'space-between', alignItems:'center', gap:24, padding:'24px 28px', border:`1px solid ${T.line}`, background:'rgba(201,168,76,.04)' },
  secondary: { color:T.gold, textDecoration:'none', fontSize:10, fontWeight:700, letterSpacing:'.14em', whiteSpace:'nowrap' },
  loading: { minHeight:'100vh', display:'grid', placeItems:'center', color:T.muted, fontSize:13 },
}

const CSS = `
  * { box-sizing: border-box; }
  button:hover { filter: brightness(1.06); }
  a:hover { color: ${T.gold} !important; }
  @media (max-width: 800px) {
    .path-grid, .requirements { grid-template-columns: 1fr !important; }
  }
`
