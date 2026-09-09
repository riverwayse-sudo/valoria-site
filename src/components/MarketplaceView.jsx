'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import EnquiryForm from '@/components/EnquiryForm'
import { PRIME_CLUSTERS } from '@/lib/brand'

const GOLD = '#C9A84C'
const MIDNIGHT = '#1A1A2E'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'
const BLUE = '#378ADD'
const TEAL = '#1D9E75'
const DIM = 'rgba(247,244,238,.58)'

const TRACKS = {
  all: { label: 'All Professionals', short: 'All', color: GOLD, intro: 'Discover assessed professionals across Talent, Speaking and Facilitation.' },
  candidate: { label: 'Talent', short: 'Talent', color: BLUE, intro: 'Find assessed professionals for opportunity, placement and strategic introduction.' },
  speaker: { label: 'Speakers', short: 'Speakers', color: GOLD, intro: 'Discover speakers whose expertise, perspective and professional record are ready for the room.' },
  facilitator: { label: 'Facilitators', short: 'Facilitators', color: TEAL, intro: 'Find facilitators aligned to PRIME-based capability development and organisational outcomes.' },
}

const PATHS = [['all','/marketplace'],['candidate','/marketplace/talent'],['speaker','/marketplace/speakers'],['facilitator','/marketplace/facilitators']]
const SORTS = [['recommended','Recommended'],['valu','Highest VALU'],['availability','Available first'],['name','Name A–Z']]

export default function MarketplaceView({ forcedTrack = 'all' }) {
  const params = useSearchParams()
  const track = TRACKS[forcedTrack] ? forcedTrack : 'all'
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(() => params.get('q') || '')
  const [industry, setIndustry] = useState(() => params.get('industry') || '')
  const [availability, setAvailability] = useState(() => params.get('availability') || '')
  const [cluster, setCluster] = useState(() => params.get('prime') || '')
  const [sort, setSort] = useState(() => params.get('sort') || 'recommended')
  const [mobileFilters, setMobileFilters] = useState(false)
  const [compare, setCompare] = useState([])
  const [session, setSession] = useState(null)

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

  useEffect(() => {
    const next = new URLSearchParams()
    if (search) next.set('q', search)
    if (industry) next.set('industry', industry)
    if (availability) next.set('availability', availability)
    if (cluster) next.set('prime', cluster)
    if (sort !== 'recommended') next.set('sort', sort)
    const query = next.toString()
    window.history.replaceState(null, '', query ? `${window.location.pathname}?${query}` : window.location.pathname)
  }, [search, industry, availability, cluster, sort])

  const counts = useMemo(() => {
    const r = { all: 0, candidate: 0, speaker: 0, facilitator: 0 }
    const people = new Set()
    listings.forEach(p => { people.add(p.professional_id); if (r[p.track] != null) r[p.track] += 1 })
    r.all = people.size
    return r
  }, [listings])

  const industries = useMemo(() => [...new Set(listings.map(x => x.industry).filter(Boolean))].sort(), [listings])

  const filtered = useMemo(() => {
    const rows = listings.filter(p => {
      if (track !== 'all' && p.track !== track) return false
      const q = search.trim().toLowerCase()
      const tags = [...(p.skills || []), ...(p.topics || []), ...(p.programme_types || [])]
      if (q && ![p.atb_id,p.full_name,p.headline,p.bio,p.industry,...tags].some(v => String(v || '').toLowerCase().includes(q))) return false
      if (industry && p.industry !== industry) return false
      const a = Array.isArray(p.availability) ? p.availability[0] : p.availability
      if (availability && a !== availability) return false
      if (cluster && (!p.cluster_scores || Number(p.cluster_scores[cluster]) < 75)) return false
      return true
    })
    return [...rows].sort((a,b) => {
      if (sort === 'name') return String(a.full_name || '').localeCompare(String(b.full_name || ''))
      if (sort === 'availability') return Number((b.availability || '').includes('open')) - Number((a.availability || '').includes('open'))
      if (sort === 'valu') return Number(b.valu_index || 0) - Number(a.valu_index || 0)
      return Number(b.valu_index || 0) - Number(a.valu_index || 0)
    })
  }, [listings, track, search, industry, availability, cluster, sort])

  const clear = () => { setSearch(''); setIndustry(''); setAvailability(''); setCluster(''); setSort('recommended') }
  const activeFilterCount = [industry, availability, cluster].filter(Boolean).length
  const toggleCompare = id => setCompare(current => current.includes(id) ? current.filter(x => x !== id) : current.length >= 3 ? current : [...current, id])

  return (
    <main style={S.page}>
      <header className="marketplace-header" style={S.header}>
        <Link href="/" style={{ lineHeight: 0 }}><img src="/logo.png" alt="Valoria Institute" style={{ height: 42 }} /></Link>
        <div style={S.brandBlock}><div style={S.headerLabel}>VALORIA MARKETPLACE</div><div className="marketplace-brand-sub" style={S.headerSub}>One professional identity · Multiple capabilities</div></div>
        <Link href="/dashboard" style={S.nav}>Dashboard →</Link>
      </header>

      <section style={S.hero}>
        <div className="marketplace-hero-inner" style={S.heroInner}>
          <div style={S.eyebrow}>THE AFRICAN TALENT BUREAU</div>
          <h1 style={S.heroTitle}>{track === 'all' ? <>Find capability. <em>Engage confidently.</em></> : <>{TRACKS[track].label} <em>on Valoria.</em></>}</h1>
          <p style={S.heroCopy}>{TRACKS[track].intro} Each listing is connected to a professional identity and Valoria's VALU/PRIME standard.</p>
          <nav style={S.pathNav} aria-label="Marketplace categories">
            {PATHS.map(([id,href]) => <Link key={id} href={href} style={{...S.path,...(track === id ? S.pathActive : {})}}>{TRACKS[id].short}<span>{counts[id]}</span></Link>)}
          </nav>
        </div>
      </section>

      <section className="marketplace-toolbar" style={S.toolbar}>
        <div style={S.searchWrap}><span aria-hidden="true" style={S.searchIcon}>⌕</span><input aria-label="Search professionals" style={S.search} placeholder="Search by name, skill, industry or topic…" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <button className="mobile-filter-btn" style={S.mobileFilter} onClick={() => setMobileFilters(true)}>Filters {activeFilterCount ? `(${activeFilterCount})` : ''}</button>
        <label style={S.sortLabel}>Sort<select aria-label="Sort listings" style={S.sort} value={sort} onChange={e => setSort(e.target.value)}>{SORTS.map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      </section>

      <section className="marketplace-workspace" style={S.workspace}>
        <aside className="marketplace-filters" style={S.filters}>
          <div style={S.filterTop}><div style={S.eyebrow}>REFINE DISCOVERY</div><button className="mobile-close" onClick={() => setMobileFilters(false)} aria-label="Close filters">×</button></div>
          <label style={S.label}>Industry<select style={S.input} value={industry} onChange={e => setIndustry(e.target.value)}><option value="">All industries</option>{industries.map(i => <option key={i}>{i}</option>)}</select></label>
          <label style={S.label}>Availability<select style={S.input} value={availability} onChange={e => setAvailability(e.target.value)}><option value="">Any availability</option><option value="open">Open to opportunities</option><option value="contract_only">Contract</option></select></label>
          <div style={S.label}>PRIME strength<div style={S.clusterRow}>{PRIME_CLUSTERS.map(c => <button type="button" key={c.letter} aria-pressed={cluster === c.letter} onClick={() => setCluster(cluster === c.letter ? '' : c.letter)} style={{...S.cluster,borderColor:cluster === c.letter ? c.color:'rgba(201,168,76,.2)',color:cluster === c.letter ? c.color:DIM}}>{c.letter}</button>)}</div></div>
          <div style={S.filterHint}>Strength filters show professionals scoring 75+ in the selected PRIME dimension.</div>
          {(search || industry || availability || cluster || sort !== 'recommended') && <button style={S.clear} onClick={clear}>Clear all filters</button>}
        </aside>

        <section className="marketplace-results" style={S.results}>
          <div className="marketplace-results-head" style={S.resultsHead}>
            <div><div style={S.resultsKicker}>{track === 'all' ? 'ALL CAPABILITIES' : `ATB · ${TRACKS[track].short.toUpperCase()}`}</div><h2 style={S.resultsTitle}>{TRACKS[track].label}</h2><p style={S.resultsCopy}>{loading ? 'Loading verified listings…' : `${filtered.length} ${filtered.length === 1 ? 'listing' : 'listings'} available`}</p></div>
            <div className="marketplace-standard" style={S.standard}><strong style={{color:GOLD}}>VALU</strong> <span>×</span> <strong style={{color:PARCHMENT}}>PRIME</strong><small>Institutional standard</small></div>
          </div>

          {loading ? <div style={S.loadingGrid}>{[1,2,3].map(i => <div key={i} style={S.skeleton}><div style={S.skeletonAvatar}/><div style={S.skeletonLine}/><div style={{...S.skeletonLine,width:'70%'}}/><div style={{...S.skeletonLine,width:'45%'}}/></div>)}</div> : filtered.length === 0 ? <EmptyState onClear={clear} hasFilters={Boolean(search || industry || availability || cluster)} /> : <div style={S.grid}>{filtered.map(p => <CapabilityCard key={`${p.id}-${p.track}`} profile={p} currentUser={session?.user} selected={compare.includes(p.id)} onCompare={() => toggleCompare(p.id)} />)}</div>}
        </section>
      </section>

      {compare.length > 0 && <CompareBar profiles={listings.filter(p => compare.includes(p.id))} onClear={() => setCompare([])} />}
      {mobileFilters && <div className="filter-overlay" style={S.overlay} onClick={() => setMobileFilters(false)}><aside className="filter-sheet" style={S.sheet} onClick={e => e.stopPropagation()}>{/* same controls are rendered by CSS layout below on mobile */}<div style={S.sheetHead}><strong>Refine discovery</strong><button onClick={() => setMobileFilters(false)}>Done</button></div><label style={S.label}>Industry<select style={S.input} value={industry} onChange={e => setIndustry(e.target.value)}><option value="">All industries</option>{industries.map(i => <option key={i}>{i}</option>)}</select></label><label style={S.label}>Availability<select style={S.input} value={availability} onChange={e => setAvailability(e.target.value)}><option value="">Any availability</option><option value="open">Open to opportunities</option><option value="contract_only">Contract</option></select></label><div style={S.label}>PRIME strength<div style={S.clusterRow}>{PRIME_CLUSTERS.map(c => <button type="button" key={c.letter} onClick={() => setCluster(cluster === c.letter ? '' : c.letter)} style={{...S.cluster,borderColor:cluster === c.letter ? c.color:'rgba(201,168,76,.2)',color:cluster === c.letter ? c.color:DIM}}>{c.letter}</button>)}</div></div></aside></div>}
      <style>{CSS}</style>
    </main>
  )
}

function EmptyState({ onClear, hasFilters }) {
  return <div style={S.empty}><div style={S.emptyMark}>⌕</div><div style={S.emptyTitle}>No matching professionals</div><p>{hasFilters ? 'Try widening your search or clearing one of the filters.' : 'This capability category is still growing. More assessed professionals will appear here as they qualify.'}</p>{hasFilters && <button style={S.clearEmpty} onClick={onClear}>Clear search</button>}</div>
}

function CapabilityCard({ profile:p, currentUser, selected, onCompare }) {
  const meta = TRACKS[p.track] || TRACKS.candidate
  const availability = Array.isArray(p.availability) ? p.availability[0] : p.availability
  const tags = [...new Set([...(p.skills || []), ...(p.topics || []), ...(p.programme_types || [])])].slice(0,4)
  const initials = p.display_initials || (p.full_name || '?').split(' ').map(x => x[0]).slice(0,2).join('')
  const enquiryType = p.track === 'facilitator' ? 'facilitator_commission' : p.track === 'speaker' ? 'speaker_booking' : 'candidate'
  const cta = p.track === 'facilitator' ? 'REQUEST FACILITATOR' : p.track === 'speaker' ? 'BOOK SPEAKER' : 'REQUEST INTRO'
  const score = Number(p.valu_index || 0)
  const status = availability === 'open' ? 'Open' : availability === 'contract_only' ? 'Contract' : null
  const topStrengths = PRIME_CLUSTERS.filter(c => p.cluster_scores?.[c.letter] != null).sort((a,b) => Number(p.cluster_scores[b.letter]) - Number(p.cluster_scores[a.letter])).slice(0,2)
  return <article className="capability-card" style={S.card}>
    <div style={S.cardAccent} />
    <div style={S.cardTop}><div style={S.avatar}>{p.photo_url ? <img src={p.photo_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : initials}</div><div style={S.cardIdentity}><div style={S.name}>{p.full_name || p.atb_id || 'Valoria Professional'}</div><div style={S.verified}>✓ VALORIA ASSESSED</div><div style={S.headline}>{p.headline || p.designation || 'Valoria Professional'}</div>{p.location && <div style={S.location}>{p.location}</div>}</div>{p.valu_index != null && <div style={S.valu}><span>VALU</span><strong>{score}</strong><small>/100</small></div>}</div>
    <div style={S.metaRow}><span style={{...S.track,color:meta.color,borderColor:meta.color}}>{meta.label}</span>{status && <span style={S.status}><i/> {status}</span>}</div>
    {topStrengths.length > 0 && <div style={S.strengths}><span>PRIME strengths</span>{topStrengths.map(c => <b key={c.letter} title={`${c.letter}: ${p.cluster_scores[c.letter]}`}>{c.letter}</b>)}</div>}
    {tags.length > 0 && <div style={S.tags}>{tags.map(t => <span key={t} style={S.tag}>{t}</span>)}</div>}
    {p.bio && <p style={S.bio}>{p.bio.slice(0,155)}{p.bio.length > 155 ? '…' : ''}</p>}
    <div style={S.actions}><Link href={`/profile/${p.id}?track=${p.track}`} style={S.view}>VIEW PROFILE <span>→</span></Link><button type="button" style={{...S.compare, ...(selected ? S.compareActive : {})}} onClick={onCompare}>{selected ? '✓ Comparing' : 'Compare'}</button></div>
    <div style={S.engage}><EnquiryForm professionalProfileId={p.id} atbId={p.atb_id} enquiryType={enquiryType} ctaLabel={cta} currentUser={currentUser} triggerStyle={S.action} /></div>
  </article>
}

function CompareBar({ profiles, onClear }) {
  return <div style={S.compareBar}><div><strong>{profiles.length}</strong> professional{profiles.length > 1 ? 's' : ''} selected</div><div style={S.comparePills}>{profiles.map(p => <span key={p.id}>{p.full_name || p.atb_id}</span>)}</div><button style={S.compareAction} onClick={() => { if (profiles.length < 2) return; const el = document.getElementById('valoria-compare-panel'); if (el) el.scrollIntoView({behavior:'smooth'}) }}>COMPARE</button><button style={S.clearCompare} onClick={onClear}>Clear</button></div>
}

const S = {
  page:{minHeight:'100vh',background:DARK,color:PARCHMENT,fontFamily:"'Raleway','Helvetica Neue',Arial,sans-serif",paddingBottom:80},
  header:{height:72,padding:'0 32px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:24,background:MIDNIGHT,borderBottom:'1px solid rgba(201,168,76,.2)',position:'sticky',top:0,zIndex:20},
  brandBlock:{textAlign:'center'},headerLabel:{color:GOLD,fontSize:13,fontWeight:700,letterSpacing:'.14em'},headerSub:{color:DIM,fontSize:10,marginTop:4},nav:{color:DIM,textDecoration:'none',fontSize:12},
  hero:{borderBottom:'1px solid rgba(201,168,76,.12)',background:'radial-gradient(circle at 50% 0%,rgba(201,168,76,.10),transparent 52%)'},heroInner:{maxWidth:1180,margin:'0 auto',padding:'70px 28px 34px'},eyebrow:{color:GOLD,fontSize:9,letterSpacing:'.18em',fontWeight:700,marginBottom:15},heroTitle:{fontFamily:'var(--font)',fontSize:'clamp(42px,6vw,76px)',fontWeight:200,lineHeight:1.02,letterSpacing:'-.035em',margin:0,maxWidth:900},heroCopy:{maxWidth:700,color:DIM,fontSize:14,lineHeight:1.8,fontWeight:300,margin:'20px 0 28px'},pathNav:{display:'flex',flexWrap:'wrap',gap:8},path:{display:'flex',alignItems:'center',gap:10,padding:'10px 15px',border:'1px solid rgba(247,244,238,.12)',borderRadius:999,color:DIM,textDecoration:'none',fontSize:10,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase'},pathActive:{background:GOLD,color:MIDNIGHT,borderColor:GOLD},
  toolbar:{maxWidth:1180,margin:'0 auto',padding:'18px 28px',display:'flex',gap:12,alignItems:'center',borderBottom:'1px solid rgba(247,244,238,.08)'},searchWrap:{flex:1,position:'relative'},searchIcon:{position:'absolute',left:14,top:9,color:GOLD,fontSize:20},search:{width:'100%',boxSizing:'border-box',padding:'13px 15px 13px 40px;borderRadius:7,border:'1px solid rgba(201,168,76,.2)',background:'rgba(255,255,255,.035)',color:PARCHMENT,fontFamily:'inherit',outline:'none'},sortLabel:{color:DIM,fontSize:9,textTransform:'uppercase',letterSpacing:'.1em'},sort:{marginLeft:8,padding:'11px 30px 11px 12px',borderRadius:7,border:'1px solid rgba(201,168,76,.2)',background:MIDNIGHT,color:PARCHMENT,fontFamily:'inherit'},mobileFilter:{display:'none'},
  workspace:{display:'grid',gridTemplateColumns:'240px 1fr',maxWidth:1180,margin:'0 auto'},filters:{padding:'30px 24px',borderRight:'1px solid rgba(201,168,76,.08)'},filterTop:{display:'flex',justifyContent:'space-between'},label:{display:'block',color:DIM,fontSize:9,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:20},input:{display:'block',width:'100%',boxSizing:'border-box',marginTop:8,padding:'11px 12px',borderRadius:6,border:'1px solid rgba(201,168,76,.16)',background:'rgba(255,255,255,.04)',color:PARCHMENT,fontFamily:'inherit'},clusterRow:{display:'flex',gap:6,marginTop:8},cluster:{flex:1,padding:'9px 4px',background:'transparent',border:'1px solid',borderRadius:6,cursor:'pointer',fontWeight:700},filterHint:{fontSize:10,color:'rgba(247,244,238,.35)',lineHeight:1.6,marginTop:-8,marginBottom:20},clear:{width:'100%',padding:10,background:'transparent',border:'1px solid rgba(201,168,76,.22)',borderRadius:6,color:DIM,cursor:'pointer'},
  results:{padding:'32px 28px'},resultsHead:{display:'flex',justifyContent:'space-between',gap:30,alignItems:'flex-end',marginBottom:26},resultsKicker:{fontSize:9,color:GOLD,fontWeight:700,letterSpacing:'.15em'},resultsTitle:{fontFamily:'var(--font)',fontSize:'clamp(30px,4vw,48px)',fontWeight:200,lineHeight:1.05,margin:'6px 0 0'},resultsCopy:{fontSize:12,color:DIM,margin:'7px 0 0'},standard:{display:'flex',flexDirection:'column',gap:4,borderLeft:'1px solid rgba(201,168,76,.2)',paddingLeft:16,fontSize:10,color:DIM,whiteSpace:'nowrap'},standardSmall:{fontSize:9},grid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:16},
  card:{position:'relative',background:PARCHMENT,color:MIDNIGHT,padding:'22px',border:'1px solid rgba(201,168,76,.16)',overflow:'hidden',display:'flex',flexDirection:'column',minHeight:370},cardAccent:{position:'absolute',left:0,top:0,right:0,height:3,background:GOLD,transform:'scaleX(0)',transformOrigin:'left',transition:'transform .35s'},cardTop:{display:'flex',gap:13,alignItems:'flex-start'},avatar:{width:62,height:62,flexShrink:0,background:MIDNIGHT,color:GOLD,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:600,overflow:'hidden',borderRadius:4},cardIdentity:{minWidth:0,flex:1},name:{fontSize:17,fontWeight:600,lineHeight:1.2},verified:{fontSize:8,color:'#8A6D25',fontWeight:700,letterSpacing:'.12em',marginTop:5},headline:{fontSize:11,color:'#4E4A43',marginTop:5,lineHeight:1.4},location:{fontSize:10,color:'#77736B',marginTop:3},valu:{display:'flex',flexDirection:'column',alignItems:'flex-end',minWidth:44},valuSpan:{fontSize:8},metaRow:{display:'flex',alignItems:'center',gap:8,marginTop:18},track:{display:'inline-flex',padding:'5px 8px',border:'1px solid',fontSize:8,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase'},status:{fontSize:9,color:'#54735E'},strengths:{display:'flex',alignItems:'center',gap:6,marginTop:14,fontSize:8,color:'#77736B',textTransform:'uppercase',letterSpacing:'.08em'},strengthsB:{},tags:{display:'flex',gap:5,flexWrap:'wrap',marginTop:13},tag:{fontSize:9,padding:'4px 7px',background:'rgba(26,26,46,.07)',color:'#4E4A43'},bio:{fontSize:11,color:'#625E57',lineHeight:1.6,margin:'14px 0 16px'},actions:{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,marginTop:'auto',paddingTop:14,borderTop:'1px solid rgba(26,26,46,.10)'},view:{color:MIDNIGHT,textDecoration:'none',fontSize:9,fontWeight:700,letterSpacing:'.1em'},compare:{background:'transparent',border:0,color:'#77736B',fontSize:9,cursor:'pointer'},compareActive:{color:'#8A6D25',fontWeight:700},engage:{marginTop:10},action:{width:'100%',padding:'10px 12px',background:MIDNIGHT,color:PARCHMENT,border:0,borderRadius:2,fontFamily:'inherit',fontSize:9,fontWeight:700,letterSpacing:'.1em',cursor:'pointer'},
  empty:{padding:'90px 20px',textAlign:'center',color:DIM,border:'1px dashed rgba(201,168,76,.15)'},emptyMark:{fontSize:26,color:GOLD,marginBottom:12},emptyTitle:{fontSize:18,color:PARCHMENT},clearEmpty:{marginTop:18,padding:'9px 14px',background:'transparent',border:'1px solid rgba(201,168,76,.3)',color:GOLD,cursor:'pointer'},loadingGrid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:16},skeleton:{background:PARCHMENT,padding:22,minHeight:325,animation:'valoriaPulse 1.4s ease-in-out infinite'},skeletonAvatar:{width:62,height:62,borderRadius:4,background:'rgba(26,26,46,.10)',marginBottom:20},skeletonLine:{height:10,width:'85%',background:'rgba(26,26,46,.10)',marginBottom:12,borderRadius:2},
  compareBar:{position:'fixed',left:20,right:20,bottom:20,zIndex:40,background:MIDNIGHT,border:'1px solid rgba(201,168,76,.35)',boxShadow:'0 18px 60px rgba(0,0,0,.35)',padding:'12px 16px',display:'flex',alignItems:'center',gap:14,fontSize:10},comparePills:{display:'flex',gap:5,flex:1,overflow:'hidden'},comparePill:{},compareAction:{background:GOLD,color:MIDNIGHT,border:0,padding:'9px 13px',fontSize:9,fontWeight:700,cursor:'pointer'},clearCompare:{background:'transparent',color:DIM,border:0,cursor:'pointer'},overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,.65)',zIndex:60,display:'flex',alignItems:'flex-end'},sheet:{width:'100%',background:MIDNIGHT,padding:'24px 20px 32px',borderTop:'1px solid rgba(201,168,76,.25)'},sheetHead:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:25,color:PARCHMENT},mobileClose:{display:'none'}
}

const CSS = `
@keyframes valoriaPulse{0%,100%{opacity:.55}50%{opacity:1}}
.capability-card:hover .capability-card{transform:none}.capability-card:hover{box-shadow:0 18px 45px rgba(0,0,0,.24)}.capability-card:hover > div:first-child{transform:scaleX(1)}
.marketplace-toolbar input:focus{border-color:rgba(201,168,76,.6)!important;box-shadow:0 0 0 3px rgba(201,168,76,.08)}
.marketplace-toolbar select:focus,.marketplace-filters select:focus{outline:1px solid rgba(201,168,76,.55)}
@media(max-width:760px){
 .marketplace-header{padding:0 16px!important}.marketplace-brand-sub{display:none}.marketplace-header img{height:34px!important}.marketplace-hero-inner{padding:52px 20px 30px!important}.marketplace-hero-inner h1{font-size:clamp(38px,12vw,58px)!important}.marketplace-toolbar{padding:14px 16px!important;flex-wrap:wrap}.marketplace-toolbar .searchWrap{flex-basis:100%}.mobile-filter-btn{display:block!important;background:transparent;color:#F7F4EE;border:1px solid rgba(201,168,76,.3);padding:10px 13px;border-radius:7px;font-family:inherit;font-size:10px}.marketplace-toolbar label{margin-left:auto}.marketplace-workspace{display:block!important}.marketplace-filters{display:none}.marketplace-results{padding:28px 16px!important}.marketplace-results-head{align-items:flex-start!important;flex-direction:column}.marketplace-standard{border-left:0!important;border-top:1px solid rgba(201,168,76,.2);padding:10px 0 0!important}.grid,.loadingGrid{grid-template-columns:1fr!important}.compareBar{left:10px!important;right:10px!important;bottom:10px!important;flex-wrap:wrap}.comparePills{order:3;flex-basis:100%}
}
@media(min-width:761px){.filter-overlay{display:none!important}}
` 
