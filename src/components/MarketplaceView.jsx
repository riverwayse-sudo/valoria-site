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
const BLUE = '#378ADD'
const TEAL = '#1D9E75'
const DIM = 'rgba(247,244,238,.48)'

const TRACKS = {
  all: { label: 'All Professionals', short: 'All', color: GOLD, intro: 'Discover assessed professionals across the Valoria ecosystem.' },
  candidate: { label: 'Talent', short: 'Talent', color: BLUE, intro: 'Discover assessed African professionals available for opportunity, placement and introduction.' },
  speaker: { label: 'Speakers', short: 'Speakers', color: GOLD, intro: 'Discover speakers whose expertise, perspective and professional record are ready for the room.' },
  facilitator: { label: 'Facilitators', short: 'Facilitators', color: TEAL, intro: 'Discover facilitators aligned to PRIME-based capability development and organisational outcomes.' },
}

const PATHS = [
  ['all', '/marketplace'],
  ['candidate', '/marketplace/talent'],
  ['speaker', '/marketplace/speakers'],
  ['facilitator', '/marketplace/facilitators'],
]

export default function MarketplaceView({ forcedTrack = 'all' }) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState('')
  const [availability, setAvailability] = useState('')
  const [cluster, setCluster] = useState('')
  const [session, setSession] = useState(null)

  const track = TRACKS[forcedTrack] ? forcedTrack : 'all'

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const [{ data, error }, { data: auth }] = await Promise.all([
        supabase.from('marketplace_professionals').select('professional_id, full_name, bio, location, languages, headline, capability, track, atb_id, display_initials, photo_url, industry, skills, topics, programme_types, availability, valu_index, cluster_scores, designation, fee_range, salary_expectation').order('valu_index', { ascending: false, nullsFirst: false }).order('full_name', { ascending: true }),
        supabase.auth.getSession(),
      ])
      if (error) console.error('Marketplace query failed:', error)
      if (!cancelled) {
        setListings((data || []).map(row => ({ ...row, id: row.professional_id, is_dummy: false })))
        setSession(auth?.session || null)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const counts = useMemo(() => {
    const r = { all: listings.length, candidate: 0, speaker: 0, facilitator: 0 }
    listings.forEach(p => { if (r[p.track] != null) r[p.track] += 1 })
    return r
  }, [listings])

  const industries = useMemo(() => [...new Set(listings.map(x => x.industry).filter(Boolean))].sort(), [listings])

  const filtered = useMemo(() => listings.filter(p => {
    if (track !== 'all' && p.track !== track) return false
    const q = search.trim().toLowerCase()
    const tags = [...(p.skills || []), ...(p.topics || []), ...(p.programme_types || [])]
    if (q && ![p.atb_id, p.full_name, p.headline, p.bio, p.industry, ...tags].some(v => String(v || '').toLowerCase().includes(q))) return false
    if (industry && p.industry !== industry) return false
    const currentAvailability = Array.isArray(p.availability) ? p.availability[0] : p.availability
    if (availability && currentAvailability !== availability) return false
    if (cluster && (!p.cluster_scores || Number(p.cluster_scores[cluster]) < 75)) return false
    return true
  }), [listings, track, search, industry, availability, cluster])

  const clear = () => { setSearch(''); setIndustry(''); setAvailability(''); setCluster('') }

  return (
    <main style={S.page}>
      <header style={S.header}>
        <Link href="/" style={{ lineHeight: 0 }}><img src="/logo.png" alt="Valoria Institute" style={{ height: 42 }} /></Link>
        <div style={S.brandBlock}>
          <div style={S.headerLabel}>VALORIA MARKETPLACE</div>
          <div style={S.headerSub}>One professional identity · Multiple capabilities</div>
        </div>
        <Link href="/dashboard" style={S.nav}>Dashboard →</Link>
      </header>

      <section style={S.hero}>
        <div style={S.heroInner}>
          <div style={S.eyebrow}>THE AFRICAN TALENT BUREAU</div>
          <h1 style={S.heroTitle}>{track === 'all' ? <>Capability made <em>visible.</em></> : <>{TRACKS[track].label} <em>on Valoria.</em></>}</h1>
          <p style={S.heroCopy}>{TRACKS[track].intro}</p>
          <div style={S.pathNav} aria-label="Marketplace categories">
            {PATHS.map(([id, href]) => (
              <Link key={id} href={href} style={{ ...S.path, ...(track === id ? S.pathActive : {}) }}>
                {TRACKS[id].short}<span>{counts[id]}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={S.workspace}>
        <aside style={S.filters}>
          <div style={S.eyebrow}>REFINE DISCOVERY</div>
          <label style={S.label}>Search<input style={S.input} placeholder="Name, skill, keyword…" value={search} onChange={e => setSearch(e.target.value)} /></label>
          <label style={S.label}>Industry<select style={S.input} value={industry} onChange={e => setIndustry(e.target.value)}><option value="">All industries</option>{industries.map(i => <option key={i}>{i}</option>)}</select></label>
          <label style={S.label}>Availability<select style={S.input} value={availability} onChange={e => setAvailability(e.target.value)}><option value="">Any</option><option value="open">Open</option><option value="contract_only">Contract</option></select></label>
          <div style={S.label}>PRIME strength<div style={S.clusterRow}>{PRIME_CLUSTERS.map(c => <button key={c.letter} onClick={() => setCluster(cluster === c.letter ? '' : c.letter)} style={{ ...S.cluster, borderColor: cluster === c.letter ? c.color : 'rgba(201,168,76,.2)', color: cluster === c.letter ? c.color : DIM }}>{c.letter}</button>)}</div></div>
          {(search || industry || availability || cluster) && <button style={S.clear} onClick={clear}>Clear filters</button>}
        </aside>

        <section style={S.results}>
          <div style={S.resultsHead}>
            <div><div style={S.resultsKicker}>{track === 'all' ? 'ALL CAPABILITIES' : `ATB · ${TRACKS[track].short.toUpperCase()}`}</div><h2 style={S.resultsTitle}>{TRACKS[track].label}</h2><p style={S.resultsCopy}>{loading ? 'Loading verified listings…' : `${filtered.length} ${filtered.length === 1 ? 'listing' : 'listings'} available`}</p></div>
            <div style={S.standard}>VALU <strong>PRIME</strong><span>Institutional standard</span></div>
          </div>

          {loading ? <div style={S.empty}>Loading marketplace…</div> : filtered.length === 0 ? <div style={S.empty}><div style={S.emptyTitle}>No matching listings</div><p>Try another search or clear your filters.</p></div> : <div style={S.grid}>{filtered.map(p => <CapabilityCard key={`${p.id}-${p.track}`} profile={p} currentUser={session?.user} />)}</div>}
        </section>
      </section>
    </main>
  )
}

function CapabilityCard({ profile: p, currentUser }) {
  const meta = TRACKS[p.track] || TRACKS.candidate
  const availability = Array.isArray(p.availability) ? p.availability[0] : p.availability
  const tags = [...new Set([...(p.skills || []), ...(p.topics || []), ...(p.programme_types || [])])].slice(0, 4)
  const initials = p.display_initials || (p.full_name || '?').split(' ').map(x => x[0]).slice(0, 2).join('')
  const enquiryType = p.track === 'facilitator' ? 'facilitator_commission' : p.track === 'speaker' ? 'speaker_booking' : 'candidate'
  const cta = p.track === 'facilitator' ? 'REQUEST FACILITATOR' : p.track === 'speaker' ? 'BOOK SPEAKER' : 'REQUEST INTRO'

  return <article style={S.card}>
    <div style={S.cardTop}>
      <div style={S.avatar}>{p.photo_url ? <img src={p.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}</div>
      <div style={S.cardIdentity}><div style={S.name}>{p.atb_id || p.full_name || 'Valoria Professional'}</div><div style={S.verified}>{initials} · Verified</div><div style={S.headline}>{p.headline || p.designation || 'Valoria Professional'}</div>{p.location && <div style={S.location}>{p.location}</div>}</div>
      {p.valu_index != null && <div style={S.valu}>VALU<strong>{p.valu_index}</strong><span>/100</span></div>}
    </div>
    <div><span style={{ ...S.track, color: meta.color, borderColor: meta.color }}>{meta.label}</span></div>
    {tags.length > 0 && <div style={S.tags}>{tags.map(t => <span key={t} style={S.tag}>{t}</span>)}</div>}
    {p.industry && <div style={S.industry}>{p.industry}</div>}
    {p.cluster_scores && <div style={S.clusterBar} aria-label="PRIME cluster scores">{PRIME_CLUSTERS.map(c => p.cluster_scores[c.letter] != null && <span key={c.letter} title={`${c.letter}: ${p.cluster_scores[c.letter]}`} style={{ ...S.clusterDot, background: c.color, opacity: Math.max(.28, Number(p.cluster_scores[c.letter]) / 100 }} />)}</div>}
    {p.bio && <p style={S.bio}>{p.bio.slice(0, 145)}{p.bio.length > 145 ? '…' : ''}</p>}
    {availability && <div style={S.availability}>● {availability === 'contract_only' ? 'Contract' : availability === 'open' ? 'Open to opportunities' : availability}</div>}
    <div style={S.actions}><Link href={`/profile/${p.id}?track=${p.track}`} style={S.view}>VIEW PROFILE →</Link><EnquiryForm professionalProfileId={p.id} atbId={p.atb_id} enquiryType={enquiryType} ctaLabel={cta} currentUser={currentUser} triggerStyle={S.action} /></div>
  </article>
}

const S = {
  page:{minHeight:'100vh',background:DARK,color:PARCHMENT,fontFamily:"'Raleway','Helvetica Neue',Arial,sans-serif"},
  header:{height:72,padding:'0 32px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:24,background:MIDNIGHT,borderBottom:'1px solid rgba(201,168,76,.2)',position:'sticky',top:0,zIndex:20},
  brandBlock:{textAlign:'center'},headerLabel:{color:GOLD,fontSize:13,fontWeight:700,letterSpacing:'.14em'},headerSub:{color:DIM,fontSize:10,marginTop:4},nav:{color:DIM,textDecoration:'none',fontSize:12},
  hero:{borderBottom:'1px solid rgba(201,168,76,.12)',background:'radial-gradient(circle at 50% 0%,rgba(201,168,76,.09),transparent 48%)'},heroInner:{maxWidth:1180,margin:'0 auto',padding:'72px 28px 38px'},eyebrow:{color:GOLD,fontSize:9,letterSpacing:'.18em',fontWeight:700,marginBottom:16},heroTitle:{fontFamily:'var(--font)',fontSize:'clamp(42px,6vw,76px)',fontWeight:200,lineHeight:1.02,letterSpacing:'-.035em',margin:0,maxWidth:850},heroCopy:{maxWidth:650,color:DIM,fontSize:14,lineHeight:1.8,fontWeight:300,margin:'22px 0 30px'},pathNav:{display:'flex',flexWrap:'wrap',gap:8},path:{display:'flex',alignItems:'center',gap:10,padding:'10px 15px',border:'1px solid rgba(247,244,238,.12)',borderRadius:999,color:DIM,textDecoration:'none',fontSize:10,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase'},pathActive:{background:GOLD,color:MIDNIGHT,borderColor:GOLD},
  workspace:{display:'grid',gridTemplateColumns:'240px 1fr',minHeight:'calc(100vh - 270px)'},filters:{padding:'30px 24px',borderRight:'1px solid rgba(201,168,76,.08)',background:'rgba(26,26,46,.42)'},label:{display:'block',color:DIM,fontSize:9,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:20},input:{display:'block',width:'100%',boxSizing:'border-box',marginTop:8,padding:'11px 12px',borderRadius:6,border:'1px solid rgba(201,168,76,.16)',background:'rgba(255,255,255,.04)',color:PARCHMENT,fontFamily:'inherit'},clusterRow:{display:'flex',gap:6,marginTop:8},cluster:{flex:1,padding:'9px 4px',background:'transparent',border:'1px solid',borderRadius:6,cursor:'pointer',fontWeight:700},clear:{width:'100%',padding:10,background:'transparent',border:'1px solid rgba(201,168,76,.22)',borderRadius:6,color:DIM,cursor:'pointer'},
  results:{padding:'34px clamp(20px,4vw,52px)'},resultsHead:{display:'flex',justifyContent:'space-between',gap:30,alignItems:'flex-end',marginBottom:28},resultsKicker:{fontSize:9,color:GOLD,fontWeight:700,letterSpacing:'.15em'},resultsTitle:{fontFamily:'var(--font)',fontSize:'clamp(30px,4vw,48px)',fontWeight:200,lineHeight:1.05,margin:'6px 0 0'},resultsCopy:{fontSize:12,color:DIM,margin:'7px 0 0'},standard:{borderLeft:'1px solid rgba(201,168,76,.2)',paddingLeft:16,fontSize:10,color:DIM,whiteSpace:'nowrap'},standard strong:{color:GOLD},standard span:{display:'block',marginTop:4,fontSize:8,letterSpacing:'.08em',textTransform:'uppercase'},grid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16},empty:{padding:'90px 20px',textAlign:'center',color:DIM},emptyTitle:{fontSize:18,color:PARCHMENT},
  card:{background:PARCHMENT,color:MIDNIGHT,borderRadius:10,padding:20,border:'1px solid #D4C9A8',display:'flex',flexDirection:'column',gap:11,minHeight:330},cardTop:{display:'flex',alignItems:'flex-start',gap:12},avatar:{width:58,height:58,borderRadius:'50%',overflow:'hidden',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:MIDNIGHT,color:PARCHMENT,border:`2px solid ${GOLD}`,fontWeight:700},cardIdentity:{flex:1,minWidth:0},name:{fontSize:13,fontWeight:700,letterSpacing:'.02em'},verified:{fontSize:8,color:'rgba(26,26,46,.52)',marginTop:3},headline:{fontSize:11,color:'rgba(26,26,46,.7)',lineHeight:1.4,marginTop:5},location:{fontSize:9,color:'rgba(26,26,46,.52)',marginTop:4},valu:{minWidth:55,textAlign:'right',fontSize:7,letterSpacing:'.1em',color:'rgba(26,26,46,.5)',paddingLeft:10,borderLeft:'1px solid rgba(26,26,46,.12)'},'valu strong':{display:'block',fontFamily:'var(--font)',fontSize:28,fontWeight:300,color:GOLD,lineHeight:1.05,letterSpacing:'-.04em'},'valu span':{fontSize:7},track:{display:'inline-block',padding:'5px 8px',border:'1px solid',borderRadius:999,fontSize:8,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase'},tags:{display:'flex',flexWrap:'wrap',gap:5},tag:{fontSize:8,padding:'4px 7px',borderRadius:999,background:'rgba(26,26,46,.07)',color:'rgba(26,26,46,.7)'},industry:{fontSize:9,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:'rgba(26,26,46,.5)'},clusterBar:{display:'flex',gap:5,alignItems:'center'},clusterDot:{width:8,height:8,borderRadius:'50%',display:'inline-block'},bio:{fontSize:10,lineHeight:1.65,color:'rgba(26,26,46,.65)',margin:'0',flex:1},availability:{fontSize:9,color:'rgba(26,26,46,.58)'},actions:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:'auto'},view:{display:'flex',alignItems:'center',justifyContent:'center',minHeight:38,border:'1px solid rgba(26,26,46,.25)',borderRadius:5,color:MIDNIGHT,textDecoration:'none',fontSize:9,fontWeight:700,letterSpacing:'.07em'},action:{minHeight:38,width:'100%',padding:'0 8px',background:MIDNIGHT,color:PARCHMENT,border:'1px solid '+MIDNIGHT,borderRadius:5,fontSize:9,fontWeight:700,letterSpacing:'.07em',cursor:'pointer'},
}

export { TRACKS }
