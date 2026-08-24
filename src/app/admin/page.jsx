'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import MarketplaceCTA from '@/components/MarketplaceCTA'

const GOLD = '#C9A84C'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'
const MIDNIGHT = '#1A1A2E'
const DIM = 'rgba(247,244,238,.55)'
const STATUS_OPTIONS = ['pending', 'reviewing', 'introduced', 'declined', 'completed']
const STATUS_COLORS = {
  pending: '#BA7517', reviewing: '#378ADD', introduced: '#1D9E75', declined: '#D85A30', completed: GOLD,
}

export default function AdminPage() {
  const [tab, setTab] = useState('queue')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [profiles, setProfiles] = useState([])
  const [buyers, setBuyers] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [admins, setAdmins] = useState([])
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')

  async function token() {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || ''
  }

  async function load() {
    setError('')
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) { window.location.href = '/admin/login'; return }
    setUser(currentUser)

    const [msg, prof, buyer] = await Promise.all([
      supabase.from('enquiries').select('*, recipient:professional_profile_id(id,display_name,headline,active_tracks,photo_url)').order('created_at', { ascending: false }),
      supabase.from('professional_profiles').select('id,display_name,headline,active_tracks,listing_status,industry,availability,created_at,profile_complete,valu_index').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id,user_type'),
    ])
    setMessages((msg.data || []).map(x => ({ ...x, recipient_profile_id: x.professional_profile_id })))
    setProfiles(prof.data || [])
    setBuyers(buyer.data || [])

    try {
      const t = await token()
      const [a, ad] = await Promise.all([
        fetch('/api/admin/analytics', { headers: { Authorization: `Bearer ${t}` } }),
        fetch('/api/admin/create-admin', { headers: { Authorization: `Bearer ${t}` } }),
      ])
      if (a.ok) setAnalytics(await a.json())
      if (ad.ok) setAdmins((await ad.json()).admins || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    load()
    const interval = setInterval(() => fetch('/api/admin/analytics').catch(() => {}), 45000)
    return () => clearInterval(interval)
  }, [])

  async function updateStatus(id, status) {
    setBusy(id); setError('')
    try {
      const t = await token()
      const res = await fetch('/api/admin/enquiries/status', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ enquiryId: id, status }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not update enquiry.')
      setMessages(xs => xs.map(x => x.id === id ? { ...x, status } : x))
    } catch (e) { setError(e.message) }
    setBusy(null)
  }

  async function introduce(id) {
    setBusy(id); setError('')
    try {
      const t = await token()
      const res = await fetch('/api/admin/introduce', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }, body: JSON.stringify({ enquiryId: id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not make introduction.')
      setMessages(xs => xs.map(x => x.id === id ? { ...x, status: 'introduced' } : x))
    } catch (e) { setError(e.message) }
    setBusy(null)
  }

  async function toggleListing(p) {
    setBusy(p.id)
    const next = p.listing_status === 'listed' ? 'unlisted' : 'listed'
    const { error: e } = await supabase.from('professional_profiles').update({ listing_status: next }).eq('id', p.id)
    if (e) setError(e.message); else setProfiles(xs => xs.map(x => x.id === p.id ? { ...x, listing_status: next } : x))
    setBusy(null)
  }

  const filtered = useMemo(() => messages.filter(m => {
    const status = m.status || 'pending'
    const q = search.toLowerCase()
    return (!filterStatus || status === filterStatus) && (!q || `${m.subject || ''} ${m.body || ''} ${m.recipient?.display_name || ''}`.toLowerCase().includes(q))
  }), [messages, filterStatus, search])

  const stats = {
    enquiries: messages.length,
    pending: messages.filter(x => !x.status || x.status === 'pending').length,
    introduced: messages.filter(x => x.status === 'introduced').length,
    listed: profiles.filter(x => x.listing_status === 'listed').length,
    complete: profiles.filter(x => x.profile_complete).length,
    talent: profiles.filter(x => (x.active_tracks || []).includes('candidate')).length,
    speakers: profiles.filter(x => (x.active_tracks || []).includes('speaker')).length,
    facilitators: profiles.filter(x => (x.active_tracks || []).includes('facilitator')).length,
  }

  if (loading) return <div style={styles.loading}>Loading Valoria Admin…</div>

  return (
    <main style={styles.root}>
      <style jsx global>{`\n        .vi-admin-card{transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease}\n        .vi-admin-card:hover{transform:translateY(-3px);border-color:rgba(201,168,76,.3)!important;box-shadow:0 18px 38px -24px rgba(0,0,0,.7)}\n        .vi-admin-control{transition:border-color .2s ease,background .2s ease,color .2s ease}\n        .vi-admin-control:hover{border-color:rgba(201,168,76,.5)!important;color:${PARCHMENT}!important}\n        .vi-admin-control:focus-visible,.vi-admin-tab:focus-visible{outline:2px solid ${GOLD};outline-offset:3px}\n        @media(max-width:760px){.vi-admin-page{padding:22px 14px 50px!important}.vi-admin-header{padding:0 14px!important}.vi-admin-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.vi-admin-nav{overflow:auto}.vi-admin-nav button{white-space:nowrap}.vi-admin-row{grid-template-columns:1fr!important}.vi-admin-actions{align-items:flex-start!important;flex-wrap:wrap}}\n        @media(prefers-reduced-motion:reduce){.vi-admin-card,.vi-admin-control{transition:none!important}}\n      `}</style>

      <header className="vi-admin-header" style={styles.header}>
        <div style={styles.brand}><Link href="/"><img src="/logo.png" alt="Valoria Institute" style={{height:40,width:'auto'}} /></Link><span style={styles.divider}/><span style={styles.adminLabel}>ADMIN</span></div>
        <div style={styles.headerActions}><MarketplaceCTA style={styles.navLink}>Marketplace</MarketplaceCTA><button className="vi-admin-control" style={styles.signOut} onClick={() => supabase.auth.signOut().then(() => window.location.href='/')}>Sign Out</button></div>
      </header>

      <section className="vi-admin-page" style={styles.page}>
        <div style={styles.heading}><div><div style={styles.eyebrow}>VALORIA INSTITUTE · CONTROL CENTRE</div><h1 style={styles.h1}>Administration</h1><p style={styles.sub}>Review the talent bureau, enquiries, marketplace listings and platform signals.</p></div><div style={styles.user}>{user?.email}</div></div>

        <div className="vi-admin-grid" style={styles.statsGrid}>{[['Enquiries',stats.enquiries],['Pending',stats.pending],['Introduced',stats.introduced],['Listed',stats.listed],['Complete profiles',stats.complete],['Talent',stats.talent],['Speakers',stats.speakers],['Facilitators',stats.facilitators]].map(([label,value]) => <div className="vi-admin-card" key={label} style={styles.card}><div style={styles.cardLabel}>{label}</div><div style={styles.cardValue}>{value}</div></div>)}</div>

        <nav className="vi-admin-nav" style={styles.tabs}>{[['queue','Enquiry Queue'],['profiles','Profiles'],['reports','Reports'],['admins','Administrators']].map(([id,label]) => <button className="vi-admin-tab vi-admin-control" key={id} onClick={() => setTab(id)} style={{...styles.tab, ...(tab===id?styles.activeTab:{})}}>{label}</button>)}</nav>

        {error && <div style={styles.error}>{error}</div>}

        {tab==='queue' && <section>
          <div style={styles.toolbar}><input className="vi-admin-control" style={styles.input} placeholder="Search enquiries…" value={search} onChange={e=>setSearch(e.target.value)}/><select className="vi-admin-control" style={styles.input} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="">All statuses</option>{STATUS_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
          <div style={styles.list}>{filtered.map(m => <article className="vi-admin-card vi-admin-row" key={m.id} style={styles.row}><div><div style={styles.rowTitle}>{m.subject || 'Introduction request'}</div><div style={styles.muted}>{m.buyer_name || 'Unknown buyer'} · {m.buyer_email || ''}</div><p style={styles.body}>{m.body || 'No message supplied.'}</p><div style={styles.muted}>{m.recipient?.display_name || 'Professional'} · {m.recipient?.headline || ''}</div></div><div className="vi-admin-actions" style={styles.actions}><span style={{...styles.status,color:STATUS_COLORS[m.status||'pending']}}>{m.status || 'pending'}</span><select className="vi-admin-control" style={styles.smallInput} disabled={busy===m.id} value={m.status||'pending'} onChange={e=>updateStatus(m.id,e.target.value)}>{STATUS_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select>{(m.status!=='introduced')&&<button className="vi-admin-control" style={styles.goldBtn} disabled={busy===m.id} onClick={()=>introduce(m.id)}>{busy===m.id?'Working…':'Make Introduction'}</button>}</div></article>)}</div>
          {!filtered.length && <div style={styles.empty}>No enquiries match the current filters.</div>}
        </section>}

        {tab==='profiles' && <section style={styles.list}>{profiles.map(p=><article className="vi-admin-card vi-admin-row" key={p.id} style={styles.row}><div><div style={styles.rowTitle}>{p.display_name || 'Unnamed professional'}</div><div style={styles.muted}>{p.headline || 'No headline'} · {p.industry || 'Industry not specified'}</div><div style={styles.tags}>{(p.active_tracks||[]).map(t=><span key={t} style={styles.tag}>{t}</span>)}<span style={styles.tag}>{p.profile_complete?'Complete':'Incomplete'}</span></div></div><div style={styles.actions}><span style={{...styles.status,color:p.listing_status==='listed'?'#1D9E75':'#888'}}>{p.listing_status || 'unlisted'}</span><button className="vi-admin-control" style={styles.goldBtn} disabled={busy===p.id} onClick={()=>toggleListing(p)}>{p.listing_status==='listed'?'Unlist':'List'}</button><Link className="vi-admin-control" style={styles.outlineBtn} href={`/profile/${p.id}`}>View</Link></div></article>)}</section>}

        {tab==='reports' && <section style={styles.reportGrid}><div style={styles.panel}><h2 style={styles.panelTitle}>Marketplace funnel</h2>{[['Waitlist signups',analytics?.careerTypes?.length ?? '—'],['Assessments completed',analytics?.totalAssessments ?? '—'],['Profiles complete',stats.complete],['Listed on marketplace',stats.listed]].map(([l,v])=><div key={l} style={styles.metric}><span>{l}</span><strong>{v}</strong></div>)}</div><div style={styles.panel}><h2 style={styles.panelTitle}>Training priorities</h2>{(analytics?.trainingPriorities||[]).map(x=><div key={x.cluster} style={styles.metric}><span>{x.label}</span><strong>{x.average}</strong></div>)}{!analytics?.trainingPriorities?.length&&<div style={styles.empty}>Analytics will appear once assessment data is available.</div>}</div><div style={styles.panel}><h2 style={styles.panelTitle}>Score distribution</h2>{(analytics?.scoreDistribution||[]).map(x=><div key={x.label} style={styles.metric}><span>{x.label}</span><strong>{x.count}</strong></div>)}</div></section>}

        {tab==='admins' && <section style={styles.panel}><h2 style={styles.panelTitle}>Administrators</h2>{admins.map(a=><div className="vi-admin-row" key={a.id} style={styles.adminRow}><div><strong>{a.full_name || 'Administrator'}</strong><div style={styles.muted}>{a.email}</div></div><span style={styles.muted}>{a.id===user?.id?'You':''}</span></div>)}{!admins.length&&<div style={styles.empty}>No administrator records returned.</div>}</section>}
      </section>
    </main>
  )
}

const styles={
 root:{minHeight:'100vh',background:DARK,color:PARCHMENT,fontFamily:"Raleway,'Helvetica Neue',Arial,sans-serif"},
 loading:{minHeight:'100vh',background:DARK,color:GOLD,display:'grid',placeItems:'center',fontFamily:'Raleway'},
 header:{height:64,padding:'0 32px',display:'flex',justifyContent:'space-between',alignItems:'center',background:MIDNIGHT,borderBottom:'1px solid rgba(201,168,76,.12)',position:'sticky',top:0,zIndex:20},
 brand:{display:'flex',alignItems:'center',gap:16},divider:{width:1,height:28,background:'rgba(201,168,76,.2)'},adminLabel:{fontSize:10,fontWeight:700,letterSpacing:'.18em',color:'rgba(201,168,76,.65)'},
 headerActions:{display:'flex',alignItems:'center',gap:14},navLink:{fontSize:12,color: PARCHMENT},signOut:{background:'transparent',border:'1px solid rgba(247,244,238,.16)',color:DIM,padding:'8px 12px',borderRadius:5,cursor:'pointer'},
 page:{maxWidth:1240,margin:'0 auto',padding:'42px 28px 80px'},heading:{display:'flex',justifyContent:'space-between',gap:24,alignItems:'end',marginBottom:30},eyebrow:{fontSize:10,letterSpacing:'.18em',color:GOLD,fontWeight:700},h1:{fontFamily:'Georgia,serif',fontWeight:400,fontSize:'clamp(30px,4vw,48px)',margin:'8px 0'},sub:{fontSize:14,color:DIM,maxWidth:680,lineHeight:1.7},user:{fontSize:11,color:DIM},
 statsGrid:{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:12,marginBottom:30},card:{background:'rgba(26,26,46,.55)',border:'1px solid rgba(201,168,76,.1)',borderRadius:10,padding:17},cardLabel:{fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',color:DIM},cardValue:{fontSize:27,color:GOLD,marginTop:8,fontWeight:500},
 tabs:{display:'flex',gap:8,borderBottom:'1px solid rgba(247,244,238,.08)',marginBottom:22},tab:{background:'transparent',border:0,borderBottom:'2px solid transparent',color:DIM,padding:'12px 14px',cursor:'pointer',fontSize:12},activeTab:{color:PARCHMENT,borderBottomColor:GOLD},
 toolbar:{display:'flex',gap:10,marginBottom:14},input:{background:MIDNIGHT,border:'1px solid rgba(247,244,238,.12)',color:PARCHMENT,padding:'10px 12px',borderRadius:6,minWidth:180},list:{display:'grid',gap:10},row:{display:'grid',gridTemplateColumns:'minmax(0,1fr) auto',gap:20,background:'rgba(26,26,46,.5)',border:'1px solid rgba(201,168,76,.1)',borderRadius:10,padding:18},rowTitle:{fontSize:15,fontWeight:600},muted:{fontSize:11,color:DIM,lineHeight:1.6},body:{fontSize:13,lineHeight:1.6,color:'rgba(247,244,238,.72)',margin:'10px 0'},actions:{display:'flex',alignItems:'center',gap:8,alignSelf:'start'},status:{fontSize:10,textTransform:'uppercase',letterSpacing:'.08em',fontWeight:700},smallInput:{background:MIDNIGHT,border:'1px solid rgba(247,244,238,.12)',color:PARCHMENT,padding:'7px 8px',borderRadius:5,fontSize:11},goldBtn:{background:GOLD,color:DARK,border:0,borderRadius:5,padding:'8px 11px',fontSize:11,fontWeight:700,cursor:'pointer'},outlineBtn:{border:'1px solid rgba(201,168,76,.3)',color:GOLD,borderRadius:5,padding:'7px 10px',fontSize:11,textDecoration:'none'},error:{background:'rgba(216,90,48,.12)',border:'1px solid rgba(216,90,48,.3)',color:'#F0A48E',padding:12,borderRadius:7,marginBottom:16,fontSize:12},empty:{padding:40,textAlign:'center',color:DIM,border:'1px dashed rgba(247,244,238,.1)',borderRadius:8},tags:{display:'flex',gap:6,flexWrap:'wrap',marginTop:10},tag:{fontSize:9,textTransform:'uppercase',letterSpacing:'.08em',padding:'4px 7px',border:'1px solid rgba(201,168,76,.2)',color:'rgba(247,244,238,.6)',borderRadius:20},reportGrid:{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:12},panel:{background:'rgba(26,26,46,.5)',border:'1px solid rgba(201,168,76,.1)',borderRadius:10,padding:20},panelTitle:{fontFamily:'Georgia,serif',fontWeight:400,fontSize:20,margin:'0 0 18px'},metric:{display:'flex',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid rgba(247,244,238,.06)',fontSize:12,color:DIM},adminRow:{display:'flex',justifyContent:'space-between',padding:'14px 0',borderBottom:'1px solid rgba(247,244,238,.06)'}
}
