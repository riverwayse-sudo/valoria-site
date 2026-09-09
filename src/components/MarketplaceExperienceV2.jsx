'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import EnquiryForm from '@/components/EnquiryForm'
import { PRIME_CLUSTERS } from '@/lib/brand'

const COLORS = { gold: '#C9A84C', navy: '#1A1A2E', paper: '#F7F4EE', dark: '#0F0F1A', slate: '#2E2E4A', linen: '#EDE8DC', brass: '#D4C9A8', ivory: '#FAFAF7', blue: '#378ADD', teal: '#1D9E75', muted: 'rgba(247,244,238,.58)' }
const TRACKS = {
  all: { label: 'All Professionals', short: 'All', color: COLORS.gold, intro: 'Discover assessed professionals across Talent, Speaking and Facilitation.' },
  candidate: { label: 'Talent', short: 'Talent', color: COLORS.gold, intro: 'Find assessed professionals for opportunity, placement and strategic introduction.' },
  speaker: { label: 'Speakers', short: 'Speakers', color: COLORS.gold, intro: 'Discover speakers whose expertise and professional record are ready for the room.' },
  facilitator: { label: 'Facilitators', short: 'Facilitators', color: COLORS.gold, intro: 'Find facilitators aligned to PRIME-based capability development and organisational outcomes.' },
}
const ROUTES = [['all','/marketplace'],['candidate','/marketplace/talent'],['speaker','/marketplace/speakers'],['facilitator','/marketplace/facilitators']]

export default function MarketplaceExperienceV2({ forcedTrack = 'all' }) {
  const track = TRACKS[forcedTrack] ? forcedTrack : 'all'
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [industry, setIndustry] = useState('')
  const [availability, setAvailability] = useState('')
  const [prime, setPrime] = useState('')
  const [sort, setSort] = useState('recommended')
  const [session, setSession] = useState(null)
  const [mobileFilters, setMobileFilters] = useState(false)
  const [selected, setSelected] = useState([])
  const [compareOpen, setCompareOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [{ data, error }, { data: auth }] = await Promise.all([
        supabase.from('marketplace_professionals').select('professional_id,full_name,bio,location,languages,headline,capability,track,atb_id,display_initials,photo_url,industry,skills,topics,programme_types,availability,valu_index,cluster_scores,designation,fee_range,salary_expectation').order('valu_index', { ascending: false, nullsFirst: false }).order('full_name', { ascending: true }),
        supabase.auth.getSession(),
      ])
      if (error) console.error('Marketplace query failed:', error)
      if (!cancelled) {
        setRows((data || []).map(row => ({ ...row, id: row.professional_id })))
        setSession(auth?.session || null)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (industry) params.set('industry', industry)
    if (availability) params.set('availability', availability)
    if (prime) params.set('prime', prime)
    if (sort !== 'recommended') params.set('sort', sort)
    const qs = params.toString()
    window.history.replaceState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname)
  }, [query, industry, availability, prime, sort])

  const counts = useMemo(() => {
    const count = { all: new Set(rows.map(row => row.professional_id)).size, candidate: 0, speaker: 0, facilitator: 0 }
    rows.forEach(row => { if (count[row.track] !== undefined) count[row.track] += 1 })
    return count
  }, [rows])

  const industries = useMemo(() => [...new Set(rows.map(row => row.industry).filter(Boolean))].sort(), [rows])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = rows.filter(profile => {
      if (track !== 'all' && profile.track !== track) return false
      const tags = [...(profile.skills || []), ...(profile.topics || []), ...(profile.programme_types || [])]
      const textMatches = ['atb_id','full_name','headline','bio','industry'].some(key => String(profile[key] || '').toLowerCase().includes(q)) || tags.some(tag => String(tag).toLowerCase().includes(q))
      if (q && !textMatches) return false
      if (industry && profile.industry !== industry) return false
      const currentAvailability = Array.isArray(profile.availability) ? profile.availability[0] : profile.availability
      if (availability && currentAvailability !== availability) return false
      if (prime && Number(profile.cluster_scores?.[prime] || 0) < 75) return false
      return true
    })
    return filtered.sort((a, b) => {
      if (sort === 'name') return String(a.full_name || '').localeCompare(String(b.full_name || ''))
      if (sort === 'availability') return Number(String(b.availability || '').includes('open')) - Number(String(a.availability || '').includes('open'))
      return Number(b.valu_index || 0) - Number(a.valu_index || 0)
    })
  }, [rows, track, query, industry, availability, prime, sort])

  const clear = () => { setQuery(''); setIndustry(''); setAvailability(''); setPrime(''); setSort('recommended') }
  const toggleCompare = id => setSelected(current => current.includes(id) ? current.filter(value => value !== id) : current.length < 3 ? [...current, id] : current)
  const selectedRows = rows.filter(row => selected.includes(row.id))
  const activeFilters = [industry, availability, prime].filter(Boolean).length

  return (
    <main style={S.page}>
      <header style={S.header} className="marketplace-header">
        <Link href="/" aria-label="Valoria Institute home"><img src="/logo.png" alt="Valoria Institute" style={{ height: 42 }} /></Link>
        <div style={S.brand}><b>VALORIA MARKETPLACE</b><span>One professional identity · Multiple capabilities</span></div>
        <Link href="/dashboard" style={S.nav}>Dashboard →</Link>
      </header>

      <section style={S.hero}>
        <div style={S.heroInner} className="marketplace-hero-inner">
          <div style={S.eyebrow}>THE AFRICAN TALENT BUREAU</div>
          <h1 style={S.h1}>{track === 'all' ? <>Find capability. <em>Engage confidently.</em></> : <>{TRACKS[track].label} <em>on Valoria.</em></>}</h1>
          <p style={S.heroCopy}>{TRACKS[track].intro} Each listing is connected to a professional identity and the VALU/PRIME standard.</p>
          <nav style={S.routes} aria-label="Marketplace categories">
            {ROUTES.map(([id, href]) => <Link key={id} href={href} style={{ ...S.route, ...(track === id ? S.routeActive : {}) }}>{TRACKS[id].short}<span>{counts[id]}</span></Link>)}
          </nav>
        </div>
      </section>

      <section style={S.toolbar} className="marketplace-toolbar">
        <div style={S.searchWrap} className="marketplace-search"><span style={S.searchIcon} aria-hidden="true">⌕</span><input aria-label="Search professionals" style={S.search} placeholder="Search by profile ID, skill, industry or topic…" value={query} onChange={event => setQuery(event.target.value)} /></div>
        <button className="mobile-filter-btn" style={S.mobileFilter} onClick={() => setMobileFilters(true)}>Filters{activeFilters ? ` (${activeFilters})` : ''}</button>
        <label style={S.sortLabel}>Sort<select aria-label="Sort listings" style={S.sort} value={sort} onChange={event => setSort(event.target.value)}><option value="recommended">Recommended</option><option value="valu">Highest VALU</option><option value="availability">Available first</option><option value="name">Profile ID A–Z</option></select></label>
      </section>

      <section style={S.workspace} className="marketplace-workspace">
        <aside style={S.filters} className="marketplace-filters"><FilterControls {...{ industry, setIndustry, availability, setAvailability, prime, setPrime, industries, clear }} /></aside>
        <section style={S.results} className="marketplace-results">
          <div style={S.resultsHead} className="marketplace-results-head"><div><div style={S.kicker}>{track === 'all' ? 'ALL CAPABILITIES' : `ATB · ${TRACKS[track].short.toUpperCase()}`}</div><h2 style={S.h2}>{TRACKS[track].label}</h2><p style={S.resultsCopy}>{loading ? 'Loading verified listings…' : `${results.length} ${results.length === 1 ? 'listing' : 'listings'} available`}</p></div><div style={S.standard}><strong style={{ color: COLORS.gold }}>VALU</strong><span>×</span><strong>PRIME</strong><small>Institutional standard</small></div></div>
          {loading ? <Skeleton /> : results.length ? <div style={S.grid}>{results.map(profile => <ProfileCard key={`${profile.id}-${profile.track}`} profile={profile} currentUser={session?.user} selected={selected.includes(profile.id)} onCompare={() => toggleCompare(profile.id)} />)}</div> : <Empty hasFilters={Boolean(query || industry || availability || prime)} clear={clear} />}
        </section>
      </section>

      {selected.length > 0 && <div style={S.compareBar}><b>{selected.length}</b><span>selected</span><div style={S.compareNames}>{selectedRows.map(profile => <span key={profile.id}>{profile.atb_id || 'PROFILE ID'}</span>)}</div><button style={S.compareButton} disabled={selected.length < 2} onClick={() => setCompareOpen(true)}>COMPARE</button><button style={S.clearCompare} onClick={() => setSelected([])}>Clear</button></div>}
      {compareOpen && <CompareModal profiles={selectedRows} close={() => setCompareOpen(false)} />}
      {mobileFilters && <div style={S.overlay} onClick={() => setMobileFilters(false)}><div style={S.sheet} onClick={event => event.stopPropagation()}><div style={S.sheetHead}><b>Refine discovery</b><button onClick={() => setMobileFilters(false)}>Done</button></div><FilterControls {...{ industry, setIndustry, availability, setAvailability, prime, setPrime, industries, clear }} /></div></div>}
      <style>{CSS}</style>
    </main>
  )
}

function FilterControls({ industry, setIndustry, availability, setAvailability, prime, setPrime, industries, clear }) {
  return <><div style={S.eyebrow}>REFINE DISCOVERY</div><label style={S.label}>Industry<select style={S.input} value={industry} onChange={event => setIndustry(event.target.value)}><option value="">All industries</option>{industries.map(value => <option key={value}>{value}</option>)}</select></label><label style={S.label}>Availability<select style={S.input} value={availability} onChange={event => setAvailability(event.target.value)}><option value="">Any availability</option><option value="open">Open to opportunities</option><option value="contract_only">Contract</option></select></label><div style={S.label}>PRIME strength<div style={S.primeRow}>{PRIME_CLUSTERS.map(cluster => <button type="button" key={cluster.letter} aria-pressed={prime === cluster.letter} onClick={() => setPrime(prime === cluster.letter ? '' : cluster.letter)} style={{ ...S.prime, borderColor: prime === cluster.letter ? COLORS.gold : COLORS.brass, color: prime === cluster.letter ? COLORS.gold : COLORS.muted }}>{cluster.letter}</button>)}</div></div><p style={S.hint}>75+ in the selected PRIME dimension.</p>{(industry || availability || prime) && <button style={S.clear} onClick={clear}>Clear all filters</button>}</>
}

function Skeleton() { return <div style={S.grid}>{[1,2,3].map(value => <div key={value} style={S.skeleton}><div style={S.skeletonAvatar}/><div style={S.skeletonLine}/><div style={{ ...S.skeletonLine, width: '68%' }}/><div style={{ ...S.skeletonLine, width: '42%' }}/></div>)}</div> }
function Empty({ hasFilters, clear }) { return <div style={S.empty}><div style={S.emptyMark}>⌕</div><strong>{hasFilters ? 'No matching professionals' : 'This category is growing'}</strong><p>{hasFilters ? 'Try widening your search or clearing a filter.' : 'More assessed professionals will appear as they qualify for this capability.'}</p>{hasFilters && <button style={S.clearEmpty} onClick={clear}>Clear search</button>}</div> }

function ProfileCard({ profile: p, currentUser, selected, onCompare }) {
  const meta = TRACKS[p.track] || TRACKS.candidate
  const availability = Array.isArray(p.availability) ? p.availability[0] : p.availability
  const tags = [...new Set([...(p.skills || []), ...(p.topics || []), ...(p.programme_types || [])])].slice(0, 4)
  const initials = p.display_initials || (p.full_name || '?').split(' ').map(value => value[0]).slice(0, 2).join('')
  const profileId = p.atb_id || p.professional_id || p.id || 'UNASSIGNED'
  const enquiryType = p.track === 'facilitator' ? 'facilitator_commission' : p.track === 'speaker' ? 'speaker_booking' : 'candidate'
  const cta = p.track === 'facilitator' ? 'REQUEST FACILITATOR' : p.track === 'speaker' ? 'BOOK SPEAKER' : 'REQUEST INTRO'
  const strengths = PRIME_CLUSTERS.map(cluster => ({ cluster, value: Number(p.cluster_scores?.[cluster.letter] || 0) })).filter(item => item.value > 0).sort((a, b) => b.value - a.value).slice(0, 2)
  return <article className="capability-card" style={S.card}><div style={S.cardAccent}/><div style={S.cardTop}><div style={S.avatar}>{p.photo_url ? <img src={p.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}</div><div style={S.identity}><div style={S.idLabel}>PROFILE ID</div><div style={S.name}>{profileId}</div><div style={S.verified}>✓ VALORIA ASSESSED</div><div style={S.headline}>{p.headline || p.designation || 'Valoria Professional'}</div>{p.location && <div style={S.location}>{p.location}</div>}</div>{p.valu_index != null && <div style={S.valu}><span>VALU</span><strong>{p.valu_index}</strong><small>/100</small></div>}</div><div style={S.metaRow}><span style={S.track}>{meta.label}</span>{availability && <span style={S.status}>● {availability === 'open' ? 'Open' : availability === 'contract_only' ? 'Contract' : availability}</span>}</div>{strengths.length > 0 && <div style={S.strengths}><span>PRIME</span>{strengths.map(item => <b key={item.cluster.letter} title={`${item.cluster.letter}: ${item.value}`}>{item.cluster.letter}</b>)}</div>}{tags.length > 0 && <div style={S.tags}>{tags.map(tag => <span key={tag} style={S.tag}>{tag}</span>)}</div>}{p.bio && <p style={S.bio}>{p.bio.slice(0, 150)}{p.bio.length > 150 ? '…' : ''}</p>}<div style={S.actions}><Link href={`/profile/${p.id}?track=${p.track}`} style={S.view}>VIEW PROFILE →</Link><button type="button" style={{ ...S.compare, ...(selected ? S.compareActive : {}) }} onClick={onCompare}>{selected ? '✓ Comparing' : 'Compare'}</button></div><div style={S.engage}><EnquiryForm professionalProfileId={p.id} atbId={p.atb_id} enquiryType={enquiryType} ctaLabel={cta} currentUser={currentUser} triggerStyle={S.action} /></div></article>
}

function CompareModal({ profiles, close }) { return <div style={S.modalOverlay} onClick={close}><section style={S.modal} onClick={event => event.stopPropagation()}><header style={S.modalHead}><div><div style={S.kicker}>DECISION SUPPORT</div><h2 style={{ margin: '6px 0', fontWeight: 300 }}>Compare professionals</h2></div><button style={S.modalClose} onClick={close} aria-label="Close comparison">×</button></header><div style={S.compareGrid}>{profiles.map(profile => <div key={profile.id} style={S.compareCard}><div style={S.avatar}>{profile.photo_url ? <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (profile.display_initials || '?')}</div><small style={S.idLabel}>PROFILE ID</small><strong style={S.compareId}>{profile.atb_id || profile.id}</strong><span>{profile.headline || profile.designation || 'Valoria Professional'}</span><b style={{ fontSize: 28, color: COLORS.gold }}>{profile.valu_index ?? '—'}</b><small>VALU Index</small><span style={{ color: COLORS.muted }}>{profile.industry || 'Professional'} · {TRACKS[profile.track]?.label || 'Talent'}</span></div>)}</div><p style={{ color: COLORS.muted, fontSize: 11, lineHeight: 1.7 }}>Review each full profile for experience, PRIME strengths and engagement details before deciding.</p></section></div> }

const S={page:{minHeight:'100vh',background:COLORS.dark,color:COLORS.paper,fontFamily:"'Raleway','Helvetica Neue',Arial,sans-serif",paddingBottom:100},header:{height:80,padding:'0 32px',display:'flex',alignItems:'center',justifyContent:'space-between',background:COLORS.navy,borderBottom:`1px solid ${COLORS.brass}`,position:'sticky',top:0,zIndex:20},brand:{display:'flex',flexDirection:'column',alignItems:'center',gap:4},nav:{color:COLORS.ivory,textDecoration:'none',fontSize:11,fontWeight:600},hero:{borderBottom:`1px solid ${COLORS.brass}`,background:COLORS.navy},heroInner:{maxWidth:1180,margin:'0 auto',padding:'64px 28px 32px'},eyebrow:{color:COLORS.gold,fontSize:9,letterSpacing:'.2em',fontWeight:700,marginBottom:14},h1:{fontSize:'clamp(40px,6vw,72px)',fontWeight:800,lineHeight:1.03,letterSpacing:'-.025em',margin:0,maxWidth:900},heroCopy:{maxWidth:700,color:'rgba(250,250,247,.72)',fontSize:13,lineHeight:1.7,margin:'18px 0 26px'},routes:{display:'flex',flexWrap:'wrap',gap:8},route:{display:'flex',gap:10,padding:'10px 15px',border:`1px solid ${COLORS.brass}`,borderRadius:999,color:COLORS.ivory,textDecoration:'none',fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em'},routeActive:{background:COLORS.gold,color:COLORS.navy,borderColor:COLORS.gold},toolbar:{maxWidth:1180,margin:'0 auto',padding:'18px 28px',display:'flex',gap:12,alignItems:'center',borderBottom:`1px solid ${COLORS.brass}`,background:COLORS.parchment},searchWrap:{flex:1,position:'relative'},searchIcon:{position:'absolute',left:14,top:8,color:COLORS.gold,fontSize:20},search:{width:'100%',padding:'12px 15px 12px 40px',boxSizing:'border-box',borderRadius:8,border:`1px solid ${COLORS.brass}`,background:COLORS.parchment,color:COLORS.slate,fontFamily:'inherit',outline:'none'},sortLabel:{color:COLORS.slate,fontSize:9,textTransform:'uppercase',letterSpacing:'.1em',fontWeight:700},sort:{marginLeft:8,padding:'10px 30px 10px 12px',borderRadius:8,border:`1px solid ${COLORS.brass}`,background:COLORS.parchment,color:COLORS.slate,fontFamily:'inherit'},mobileFilter:{display:'none'},workspace:{display:'grid',gridTemplateColumns:'240px 1fr',maxWidth:1180,margin:'0 auto',background:COLORS.parchment},filters:{padding:'30px 24px',borderRight:`1px solid ${COLORS.brass}`},label:{display:'block',color:COLORS.slate,fontSize:9,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:20,fontWeight:700},input:{display:'block',width:'100%',marginTop:8,padding:'10px 12px',boxSizing:'border-box',borderRadius:8,border:`1px solid ${COLORS.brass}`,background:COLORS.parchment,color:COLORS.slate,fontFamily:'inherit'},primeRow:{display:'flex',gap:6,marginTop:8},prime:{flex:1,padding:'9px 4px',background:'transparent',border:'1px solid',borderRadius:999,cursor:'pointer',fontWeight:700},hint:{fontSize:10,color:'#6F6A60',lineHeight:1.6,margin:'-8px 0 20px'},clear:{width:'100%',padding:10,background:COLORS.linen,border:`1px solid ${COLORS.brass}`,borderRadius:999,color:COLORS.slate,cursor:'pointer',fontWeight:700},results:{padding:'32px 28px',background:COLORS.parchment},resultsHead:{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:30,marginBottom:26},kicker:{fontSize:9,color:COLORS.gold,fontWeight:700,letterSpacing:'.18em'},h2:{fontSize:'clamp(28px,4vw,44px)',fontWeight:700,lineHeight:1.05,margin:'6px 0 0',color:COLORS.navy},resultsCopy:{fontSize:12,color:COLORS.slate,margin:'7px 0 0'},standard:{display:'flex',flexDirection:'column',gap:4,borderLeft:`1px solid ${COLORS.brass}`,paddingLeft:16,fontSize:10,color:COLORS.slate},grid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:16},card:{position:'relative',background:COLORS.parchment,color:COLORS.slate,padding:22,border:`1px solid ${COLORS.brass}`,borderRadius:8,boxShadow:'none',overflow:'hidden',display:'flex',flexDirection:'column',minHeight:375},cardAccent:{position:'absolute',left:0,top:0,right:0,height:3,background:COLORS.gold,transform:'scaleX(0)',transformOrigin:'left',transition:'transform .25s'},cardTop:{display:'flex',gap:13,alignItems:'flex-start'},avatar:{width:62,height:62,flexShrink:0,background:COLORS.navy,color:COLORS.gold,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700,overflow:'hidden',borderRadius:'50%',border:`2px solid ${COLORS.gold}`},identity:{minWidth:0,flex:1},idLabel:{display:'block',fontSize:8,color:COLORS.slate,fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',marginBottom:4},name:{fontSize:15,fontWeight:700,lineHeight:1.25,color:COLORS.navy,letterSpacing:'.04em'},verified:{fontSize:8,color:COLORS.gold,fontWeight:700,letterSpacing:'.14em',marginTop:6},headline:{fontSize:11,color:COLORS.slate,marginTop:6,lineHeight:1.45},location:{fontSize:10,color:'#6F6A60',marginTop:3},valu:{display:'flex',flexDirection:'column',alignItems:'flex-end',minWidth:44,color:COLORS.navy},metaRow:{display:'flex',alignItems:'center',gap:8,marginTop:18},track:{display:'inline-flex',padding:'5px 9px',border:`1px solid ${COLORS.brass}`,borderRadius:999,fontSize:8,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:COLORS.slate,background:COLORS.linen},status:{fontSize:9,color:COLORS.slate},strengths:{display:'flex',alignItems:'center',gap:6,marginTop:14,fontSize:8,color:'#6F6A60',textTransform:'uppercase',letterSpacing:'.08em'},tags:{display:'flex',gap:5,flexWrap:'wrap',marginTop:13},tag:{fontSize:9,padding:'5px 8px',background:COLORS.linen,color:COLORS.slate,borderRadius:999},bio:{fontSize:11,color:COLORS.slate,lineHeight:1.6,margin:'14px 0 16px'},actions:{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,marginTop:'auto',paddingTop:14,borderTop:`1px solid ${COLORS.brass}`},view:{color:COLORS.navy,textDecoration:'none',fontSize:9,fontWeight:700,letterSpacing:'.1em'},compare:{background:'transparent',border:0,color:COLORS.slate,fontSize:9,cursor:'pointer',fontFamily:'inherit'},compareActive:{color:COLORS.gold,fontWeight:700},engage:{marginTop:10},action:{width:'100%',padding:'10px 12px',background:COLORS.gold,color:COLORS.navy,border:0,borderRadius:999,fontFamily:'inherit',fontSize:9,fontWeight:700,letterSpacing:'.1em',cursor:'pointer'},empty:{padding:'90px 20px',textAlign:'center',color:COLORS.slate,border:`1px dashed ${COLORS.brass}`},emptyMark:{fontSize:26,color:COLORS.gold,marginBottom:12},clearEmpty:{marginTop:18,padding:'9px 14px',background:COLORS.linen,border:`1px solid ${COLORS.brass}`,borderRadius:999,color:COLORS.slate,cursor:'pointer',fontWeight:700},skeleton:{background:COLORS.parchment,padding:22,minHeight:325,animation:'valoriaPulse 1.4s ease-in-out infinite',border:`1px solid ${COLORS.brass}`,borderRadius:8},skeletonAvatar:{width:62,height:62,borderRadius:'50%',background:COLORS.linen,marginBottom:20,border:`2px solid ${COLORS.brass}`},skeletonLine:{height:10,width:'85%',background:COLORS.linen,marginBottom:12,borderRadius:999},compareBar:{position:'fixed',left:20,right:20,bottom:20,zIndex:40,background:COLORS.navy,border:`1px solid ${COLORS.brass}`,padding:'12px 16px',display:'flex',alignItems:'center',gap:12,fontSize:10},compareNames:{display:'flex',gap:6,flex:1,overflow:'hidden'},compareButton:{background:COLORS.gold,color:COLORS.navy,border:0,borderRadius:999,padding:'9px 13px',fontSize:9,fontWeight:700,cursor:'pointer'},clearCompare:{background:'transparent',color:COLORS.ivory,border:0,cursor:'pointer'},compareId:{fontSize:14,fontWeight:700,letterSpacing:'.06em',color:COLORS.navy},overlay:{position:'fixed',inset:0,zIndex:60,background:'rgba(0,0,0,.65)',display:'flex',alignItems:'flex-end'},sheet:{width:'100%',background:COLORS.navy,padding:'24px 20px 32px',borderTop:`1px solid ${COLORS.brass}`},sheetHead:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:25,color:COLORS.paper},modalOverlay:{position:'fixed',inset:0,zIndex:70,background:'rgba(0,0,0,.72)',display:'flex',alignItems:'center',justifyContent:'center',padding:20},modal:{width:'min(900px,100%)',maxHeight:'90vh',overflow:'auto',background:COLORS.navy,color:COLORS.paper,border:`1px solid ${COLORS.brass}`,padding:28},modalHead:{display:'flex',justifyContent:'space-between'},modalClose:{background:'transparent',border:0,color:COLORS.muted,fontSize:28,cursor:'pointer'},compareGrid:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,margin:'22px 0'},compareCard:{background:COLORS.parchment,border:`1px solid ${COLORS.brass}`,borderRadius:8,padding:18,display:'flex',flexDirection:'column',gap:7,color:COLORS.slate}}
const CSS=`@keyframes valoriaPulse{0%,100%{opacity:.55}50%{opacity:1}}.capability-card:hover{box-shadow:none}.capability-card:hover>div:first-child{transform:scaleX(1)}.marketplace-toolbar input:focus{border-color:${COLORS.gold}!important;box-shadow:0 0 0 3px rgba(201,168,76,.08)}@media(max-width:760px){.marketplace-header{padding:0 16px!important}.marketplace-header img{height:34px!important}.marketplace-brand-sub{display:none}.marketplace-hero-inner{padding:52px 20px 30px!important}.marketplace-hero-inner h1{font-size:clamp(38px,12vw,58px)!important}.marketplace-toolbar{padding:14px 16px!important;flex-wrap:wrap}.marketplace-search{flex-basis:100%}.mobile-filter-btn{display:block!important;background:transparent;color:#F7F4EE;border:1px solid rgba(201,168,76,.3);padding:10px 13px;border-radius:999px;font-family:inherit;font-size:10px}.marketplace-toolbar label{margin-left:auto}.marketplace-workspace{display:block!important}.marketplace-filters{display:none}.marketplace-results{padding:28px 16px!important}.marketplace-results-head{align-items:flex-start!important;flex-direction:column}.marketplace-standard{border-left:0!important;border-top:1px solid rgba(201,168,76,.2);padding:10px 0 0!important}.grid{grid-template-columns:1fr!important}.compareBar{left:10px!important;right:10px!important;bottom:10px!important;flex-wrap:wrap}.compareNames{order:3;flex-basis:100%}.compareGrid{grid-template-columns:1fr!important}}
`