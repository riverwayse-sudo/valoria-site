'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import EnquiryForm from '@/components/EnquiryForm'
import ValoriaAvatar from '@/components/ValoriaAvatar'
import { toPublicProfile, PUBLIC_PROFILE_SELECT } from '@/lib/public-profile'
import { getValuTier } from '@/lib/brand'

// ─── helpers ─────────────────────────────────────────────
function getInitials(name) {
  if (!name) return '??'
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return words.slice(0, 3).map(w => w[0].toUpperCase()).join('.') + '.'
}
function getAvatarLetters(name) {
  if (!name) return '?'
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}
function getYouTubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}
const CLUSTER_NAMES = { P:'Presence', R:'Relationships', I:'Intelligence', M:'Mastery', E:'Enterprise' }
// Canonical PRIME cluster labels used to present report-backed point scores.

// ─── brand tokens ─────────────────────────────────────────────
const GOLD    = '#C9A84C'
const DARK    = '#0F0F1A'
const MID     = '#1A1A2E'
const PARCH   = '#F7F4EE'
const DIM     = 'rgba(247,244,238,.5)'
const FAINT   = 'rgba(247,244,238,.15)'
const GLINE   = 'rgba(201,168,76,.12)'
const GLINE2  = 'rgba(201,168,76,.28)'
const PRIME   = [
  { letter: 'P', color: '#C9A84C', label: 'Presence' },
  { letter: 'R', color: '#C9A84C', label: 'Relationships' },
  { letter: 'I', color: '#C9A84C', label: 'Intelligence' },
  { letter: 'M', color: '#C9A84C', label: 'Mastery' },
  { letter: 'E', color: '#C9A84C', label: 'Enterprise' },
]

// Returns the three highest-scoring PRIME clusters, ordered by points.
function rankedClusterStrengths(clusterScores) {
  if (!clusterScores) return []
  return Object.entries(clusterScores)
    .filter(([, v]) => v != null)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([letter, score]) => ({
      letter, score,
      name: CLUSTER_NAMES[letter] || letter,
      color: PRIME.find(c => c.letter === letter)?.color || GOLD,
    }))
}

// Spider/radar chart of the 5 PRIME cluster scores — same visualization
// shown on the VALU Index "Find My Report" results page (assessment app),
// requested here so a profile's PRIME breakdown reads the same way in
// both places instead of the old plain bar list.
function PrimeRadarChart({ scores, size = 260 }) {
  const center = size / 2
  const maxR = size * 0.36
  const n = PRIME.length
  const angleFor = i => (-90 + i * (360 / n)) * (Math.PI / 180)
  const pointAt = (i, frac) => {
    const a = angleFor(i)
    return [center + maxR * frac * Math.cos(a), center + maxR * frac * Math.sin(a)]
  }
  const ringLevels = [0.25, 0.5, 0.75, 1]
  const dataPoints = PRIME.map((c, i) => pointAt(i, (scores[c.letter] ?? 0) / 100))
  const dataPath = dataPoints.map(p => p.join(',')).join(' ')

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: `${size}px`, display: 'block', margin: '0 auto' }}>
      {/* concentric grid rings */}
      {ringLevels.map(level => (
        <polygon key={level}
          points={PRIME.map((_, i) => pointAt(i, level).join(',')).join(' ')}
          fill="none" stroke="rgba(201,168,76,.14)" strokeWidth="1" />
      ))}
      {/* axis spokes */}
      {PRIME.map((c, i) => {
        const [x, y] = pointAt(i, 1)
        return <line key={c.letter} x1={center} y1={center} x2={x} y2={y} stroke="rgba(201,168,76,.14)" strokeWidth="1" />
      })}
      {/* data shape */}
      <polygon points={dataPath} fill="rgba(201,168,76,.18)" stroke={GOLD} strokeWidth="1.5" strokeLinejoin="round" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill={PRIME[i].color} stroke={DARK} strokeWidth="1.5" />
      ))}
      {/* axis labels + scores */}
      {PRIME.map((c, i) => {
        const [lx, ly] = pointAt(i, 1.24)
        const score = scores[c.letter]
        return (
          <g key={c.letter}>
            <text x={lx} y={ly - 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={c.color} fontFamily="inherit">{c.letter}</text>
            {score != null && (
              <text x={lx} y={ly + 9} textAnchor="middle" fontSize="9" fill="rgba(247,244,238,.5)" fontFamily="inherit">{score}</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ─── component ─────────────────────────────────────────────
export default function ProfileClient({ id, searchParams, initialProfile = null, previewUnavailable = false, profileContentNotReady = false }) {
  const [profile, setProfile]     = useState(initialProfile)
  const [loading, setLoading]     = useState(!initialProfile)
  const [notFound, setNotFound]   = useState(false)
  const [activeVideo, setActiveVideo] = useState(null)
  const [copied, setCopied] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [certificates, setCertificates] = useState([])

  useEffect(() => {
    let cancelled = false

    async function recordView(professionalId, user) {
      const dedupeKey = `viewed_${professionalId}`
      try {
        if (sessionStorage.getItem(dedupeKey)) return
        sessionStorage.setItem(dedupeKey, '1')
        const { error } = await supabase.from('profile_views').insert({
          professional_profile_id: professionalId,
          viewer_id: user?.id || null,
        })
        if (error) console.error('profile_views insert failed:', error)
      } catch (error) {
        console.warn('profile view could not be recorded:', error)
      }
    }

    async function loadCertificates(professionalId) {
      const { data, error } = await supabase
        .from('professional_certificates')
        .select('id,certificate_number,title,event_title,event_date,issuer,issued_at,verification_token')
        .eq('professional_id', professionalId)
        .is('revoked_at', null)
        .order('issued_at', { ascending: false })
      if (error) console.error('professional certificates fetch failed:', error)
      if (!cancelled) setCertificates(data || [])
    }

    async function load() {
      if (previewUnavailable) {
        setLoading(false)
        return
      }

      let user = null
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) console.warn('profile viewer auth state unavailable:', error.message)
        user = data?.user || null
      } catch (error) {
        console.warn('profile viewer auth state unavailable:', error)
      }
      if (cancelled) return
      setCurrentUser(user)

      if (profileContentNotReady) {
        if (user && user.id === id) {
          window.location.href = '/profile/setup'
          return
        }
        if (!cancelled) {
          setNotFound(true)
          setLoading(false)
        }
        return
      }

      if (initialProfile) {
        await loadCertificates(initialProfile.id)
        if (cancelled) return
        if (!user || user.id !== initialProfile.id) await recordView(initialProfile.id, user)
        if (!cancelled) setLoading(false)
        return
      }

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
      const { data: row, error } = await supabase
        .from('marketplace_public_roster')
        .select(PUBLIC_PROFILE_SELECT)
        .eq(isUuid ? 'professional_id' : 'atb_id', id)
        .maybeSingle()

      if (error) console.error('public Marketplace profile fetch failed:', error)
      const real = toPublicProfile(row)

      if (real) {
        if (cancelled) return
        setProfile(real)
        await loadCertificates(real.id)
        if (!user || user.id !== real.id) await recordView(real.id, user)
        if (!cancelled) setLoading(false)
        return
      }

      if (user && user.id === id) {
        window.location.href = '/profile/setup'
        return
      }

      if (!cancelled) {
        setNotFound(true)
        setLoading(false)
      }
    }

    load().catch(error => {
      console.error('public Marketplace profile could not be loaded:', error)
      if (!cancelled) {
        setNotFound(true)
        setLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [id, initialProfile, previewUnavailable, profileContentNotReady])

  function copyLink() {
    if (typeof window === 'undefined') return
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  if (previewUnavailable) return (
    <>
      <Nav />
      <main style={{minHeight:'70vh',background:DARK,color:PARCH,display:'grid',placeItems:'center',padding:'60px 24px',textAlign:'center'}}>
        <div style={{maxWidth:620}}>
          <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.16em',color:GOLD,marginBottom:18}}>STAGING PREVIEW</div>
          <h1 style={{fontSize:'clamp(26px,4vw,40px)',lineHeight:1.2}}>Public profile data is not connected yet.</h1>
          <p style={{color:DIM,lineHeight:1.8}}>This preview does not use production member records. Public profiles will appear here after the isolated staging database and synthetic test profiles are configured.</p>
          <Link href="/marketplace" style={{display:'inline-block',marginTop:18,color:GOLD,textDecoration:'none'}}>← BACK TO THE MARKETPLACE</Link>
        </div>
      </main>
      <Footer />
    </>
  )

  if (loading) return (
    <div style={{ minHeight:'100vh', background: DARK, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font,Raleway,sans-serif)', color: DIM, fontSize:'13px', letterSpacing:'.08em' }}>
      Loading…
    </div>
  )

  if (notFound) return (
    <>
      <Nav />
      <div style={{ minHeight:'100vh', background: DARK, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'16px', fontFamily:'var(--font,Raleway,sans-serif)', color: PARCH }}>
        <div style={{ fontSize:'32px', color: GOLD }}>◈</div>
        <p style={{ fontSize:'14px', fontWeight:300, color: DIM }}>Profile not found</p>
        <Link href="/marketplace" style={{ fontSize:'12px', color: GOLD, textDecoration:'none', letterSpacing:'.08em' }}>← Back to marketplace</Link>
      </div>
      <Footer />
    </>
  )

  const p           = profile
  const tracks        = p.active_tracks || (p.user_type ? [p.user_type] : [])
  const isSpeaker     = tracks.includes('speaker')
  const isFacilitator = tracks.includes('facilitator')
  const isCandidate   = tracks.includes('candidate')
  const initials    = getInitials(p.display_name)
  const avatarLetters = getAvatarLetters(p.display_name)
  const atbId       = p.atb_id || '—'
  const videos      = (p.youtube_links || []).filter(v => v && !v.includes('dQw4w9WgXcQ'))
  const compensation = (isSpeaker || isFacilitator) ? (p.fee_range || p.salary_expectation || null) : (p.salary_expectation || p.fee_range || null)
  const compLabel   = (isSpeaker || isFacilitator) ? 'Fee Range' : 'Salary Range'
  // Which track's framing (headline placeholder, CTA copy, tags shown) to
  // display. If the marketplace page someone clicked in from tells us which
  // track they were browsing (?track=speaker etc.), honour that — otherwise
  // fall back to a fixed priority. Previously this always showed
  // facilitator-first for anyone with multiple tracks, so a profile that was
  // both Speaker and Facilitator showed "Request Facilitator" even when
  // reached from the Speaker marketplace.
  const requestedTrack = searchParams?.track
  const displayTrack = (requestedTrack && tracks.includes(requestedTrack))
    ? requestedTrack
    : (isFacilitator ? 'facilitator' : isSpeaker ? 'speaker' : 'candidate')
  const canRequest = tracks.includes(displayTrack)
  const browseHref = !canRequest ? '/marketplace' : displayTrack === 'facilitator' ? '/marketplace/facilitators' : displayTrack === 'speaker' ? '/marketplace/speakers' : '/marketplace/talent'
  const browseLabel = !canRequest ? 'BACK TO MARKETPLACE' : displayTrack === 'facilitator' ? 'MORE FACILITATORS' : displayTrack === 'speaker' ? 'MORE SPEAKERS' : 'MORE TALENT'
  const tags        = displayTrack === 'facilitator' ? (p.programme_types || []) : displayTrack === 'speaker' ? (p.topics || []) : (p.skills || [])
  const isOwnProfile = !!(currentUser && currentUser.id === p.id)
  const displayDesignation = p.valu_score != null ? (getValuTier(p.valu_score, 'full')?.name || p.designation) : null

  const stats = [
    { label:'Location',   value: p.location || '—' },
    { label:'Industry',   value: p.industry || '—' },
    { label:'Experience', value: p.years_experience ? `${p.years_experience} yrs` : '—' },
    { label:'VALU Index', value: p.valu_score != null ? `${p.valu_score} points` : 'VALU Taster', href: p.valu_score != null ? '#valu-card' : null },
  ]

  return (
    <>
      <Nav />

      <div style={{ minHeight:'100vh', background: DARK, color: PARCH, fontFamily:'var(--font,Raleway,sans-serif)', paddingTop:'67px' }}>

        {/* PRIME stripe */}
        <div style={{ position:'fixed', top:0, left:0, right:0, height:'3px', display:'flex', zIndex:201, pointerEvents:'none' }}>
          {[['#C9A84C',20],['#C9A84C',25],['#C9A84C',25],['#C9A84C',20],['#C9A84C',10]].map(([c,p],i) => (
            <div key={i} style={{ flex:p, background:c, opacity:.85 }} />
          ))}
        </div>

        {/* COVER BANNER */}
        <div style={{ position:'relative', height:'280px', overflow:'hidden', background:`radial-gradient(ellipse 800px 400px at 10% 30%, rgba(201,168,76,.22), transparent 60%), radial-gradient(ellipse 600px 400px at 90% 70%, rgba(201,168,76,.1), transparent 55%), linear-gradient(155deg, ${MID} 0%, ${DARK} 70%)` }}>
          <svg viewBox="0 0 1200 280" preserveAspectRatio="none" style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:.45 }}>
            <g stroke="#C9A84C" strokeOpacity=".18" strokeWidth="1" fill="none">
              <path d="M0,240 C300,160 500,280 800,180 S1100,240 1200,160"/>
              <path d="M0,180 C300,100 500,220 800,120 S1100,180 1200,100"/>
              <path d="M0,120 C300,40 500,160 800,60 S1100,120 1200,40"/>
              <path d="M0,280 C200,220 400,260 600,200 S900,240 1200,200"/>
            </g>
            <polygon points="1060,50 1110,140 1060,110 1010,140" fill="rgba(201,168,76,.15)"/>
            <polygon points="80,200 120,260 80,240 40,260" fill="rgba(201,168,76,.08)"/>
          </svg>
          {/* availability chip — only shown when the person actually has a
              value saved. The onboarding question was removed 31 Jul 2026,
              so most profiles now have none; showing "Not Available" for
              everyone by default would misrepresent them. */}
          {p.availability && (
            <div style={{ position:'absolute', top:'20px', right:'28px', display:'flex', alignItems:'center', gap:'7px', background:'rgba(26,26,46,.75)', border:`1px solid ${GLINE2}`, padding:'7px 16px 7px 12px', borderRadius:'999px', fontSize:'11px', letterSpacing:'.1em', textTransform:'uppercase', color: GOLD, backdropFilter:'blur(8px)' }}>
              <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#C9A84C', boxShadow:'0 0 0 0 rgba(29,158,117,.6)', animation:'vi-pulse 2s infinite' }} />
              {p.availability === 'open' ? 'Open to Introductions' : p.availability === 'contract_only' ? 'Contract Only' : 'Not Available'}
            </div>
          )}
          <div style={{ position:'absolute', inset:0, background:`linear-gradient(180deg, transparent 35%, ${DARK} 100%)` }} />
        </div>

        {/* HEADER BLOCK */}
        <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'0 clamp(20px,4vw,40px)' }}>
          <div className="vi-header-block" style={{ display:'flex', alignItems:'flex-end', gap:'24px', marginTop:'-80px', position:'relative', zIndex:5, flexWrap:'wrap' }}>

            {/* Avatar — static ring, no longer spins the photo */}
            <div className="vi-avatar-frame" style={{ width:'148px', height:'148px', borderRadius:'50%', padding:'3px', background:`conic-gradient(from 180deg, ${GOLD}, #8a6420, ${GOLD})`, flexShrink:0, boxShadow:'0 10px 30px rgba(0,0,0,.5), 0 0 0 1px rgba(201,168,76,.08)' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', background: DARK, padding:'3px' }}>
                <div style={{ width:'100%', height:'100%', borderRadius:'50%', overflow:'hidden' }}>
                  <ValoriaAvatar src={p.photo_url} seed={p.id || p.atb_id || p.display_name} alt={p.display_name ? `${p.display_name}'s profile avatar` : 'Profile avatar'} size={136} />
                </div>             </div>
            </div>

            {/* ID block */}
            <div style={{ paddingBottom:'16px', flex:1, minWidth:'200px' }}>
              <div style={{ fontSize:'clamp(22px,3.5vw,32px)', fontWeight:700, letterSpacing:'.02em', lineHeight:1.1, marginBottom:'7px', color: PARCH }}>
                {p.display_name}
              </div>
              <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.12em', color: DIM, marginBottom:'10px', fontVariantNumeric:'tabular-nums' }}>
                ATB PROFILE ID · {atbId}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
                <span style={{ fontSize:'14px', fontWeight:400, color: GOLD, letterSpacing:'.04em' }}>
                  {p.headline || (displayTrack === 'facilitator' ? 'Valoria Facilitator' : displayTrack === 'speaker' ? 'Valoria Speaker' : 'Valoria Professional')}
                </span>
                <span style={{ fontSize:'10px', letterSpacing:'.06em', background: MID, border:`1px solid ${GLINE2}`, padding:'4px 9px', borderRadius:'4px', color: DIM }}>
                  MARKETPLACE PROFILE
                </span>
                {p.valu_score != null && <span style={{ fontSize:'10px', letterSpacing:'.06em', background:'rgba(201,168,76,.12)', border:`1px solid ${GLINE2}`, padding:'4px 9px', borderRadius:'4px', color: GOLD, fontWeight:700 }}>{p.valu_score} VALU POINTS</span>}
                {displayDesignation && <span style={{ fontSize:'10px', letterSpacing:'.06em', color: GOLD }}>{displayDesignation}</span>}
              </div>
              {tracks.length > 0 && (
                <div style={{ display:'flex', gap:'7px', flexWrap:'wrap', marginTop:'10px' }}>
                  {tracks.map(track => <span key={track} style={{fontSize:'9px',fontWeight:700,letterSpacing:'.1em',padding:'5px 8px',border:`1px solid ${GLINE}`,color:DIM,textTransform:'uppercase'}}>{track === 'candidate' ? 'Talent' : track === 'speaker' ? 'Speaker' : 'Facilitator'}</span>)}
                </div>
              )}
              {p.current_job_title && (
                <div style={{ fontSize:'12px', fontWeight:300, color: DIM, marginTop:'7px' }}>{p.current_job_title}</div>
              )}
            </div>

            {/* CTAs — the "request an intro to yourself" bug: this row never
                checked isOwnProfile, so a professional viewing their own
                public listing saw MORE TALENT / REQUEST INTRO (a mailto
                addressed to their own ATB ID) instead of an edit action.
                The isOwnProfile branch below is the fix; the public-facing
                branch is unchanged. */}
            <div style={{ display:'flex', gap:'10px', paddingBottom:'16px', flexShrink:0, flexWrap:'wrap' }}>
              <button onClick={copyLink}
                style={{ padding:'12px 18px', background:'transparent', border:`1px solid ${GLINE}`, color: DIM, fontSize:'11px', fontWeight:700, letterSpacing:'.12em', cursor:'pointer', fontFamily:'inherit' }}>
                {copied ? 'LINK COPIED' : 'SHARE'}
              </button>
              {isOwnProfile ? (
                <Link href="/profile/edit"
                  style={{ padding:'12px 22px', background: GOLD, color: DARK, fontSize:'11px', fontWeight:700, letterSpacing:'.12em', textDecoration:'none' }}>
                  EDIT PROFILE
                </Link>
              ) : (
                <>
                  <Link href={browseHref}
                    style={{ padding:'12px 22px', background:'transparent', border:`1px solid ${GLINE2}`, color: PARCH, fontSize:'11px', fontWeight:700, letterSpacing:'.12em', textDecoration:'none' }}>
                    {browseLabel}
                  </Link>
                  {p.is_dummy ? (
                    <button type="button" disabled
                      style={{ padding:'12px 22px', background:'rgba(255,255,255,.06)', color:'rgba(247,244,238,.3)', fontSize:'11px', fontWeight:700, letterSpacing:'.12em', border:'none', cursor:'not-allowed' }}>
                      SAMPLE — NOT AVAILABLE
                    </button>
                  ) : canRequest ? (
                    <EnquiryForm
                      professionalProfileId={p.id}
                      atbId={atbId}
                      enquiryType={displayTrack === 'facilitator' ? 'facilitator_commission' : displayTrack === 'speaker' ? 'speaker_booking' : 'candidate'}
                      ctaLabel={displayTrack === 'facilitator' ? 'REQUEST FACILITATOR' : displayTrack === 'speaker' ? 'REQUEST SPEAKER' : 'REQUEST INTRO'}
                      currentUser={currentUser}
                      triggerStyle={{ padding:'12px 22px', background: GOLD, color: DARK, fontSize:'11px', fontWeight:700, letterSpacing:'.12em', border:'none', textDecoration:'none' }}
                    />
                  ) : (
                    <span style={{fontSize:'10px',letterSpacing:'.1em',color:DIM}}>INTRODUCTIONS NOT AVAILABLE</span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* STAT STRIP */}
        <div style={{ maxWidth:'1100px', margin:'32px auto 0', padding:'0 clamp(20px,4vw,40px)' }}>
          <div className="vi-stat-strip" style={{ display:'flex', borderTop:`1px solid ${GLINE}`, borderBottom:`1px solid ${GLINE}`, flexWrap:'wrap' }}>
            {stats.map((s, i, arr) => {
              const itemStyle = {
                flex:'1 1 140px', padding:'16px 16px 16px 0',
                borderRight: i < arr.length - 1 ? `1px solid ${GLINE}` : 'none',
                paddingLeft: i > 0 ? '16px' : 0,
                textDecoration:'none', display:'block',
                transition:'background .15s ease',
              }
              const inner = (
                <>
                  <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'.16em', textTransform:'uppercase', color:'rgba(201,168,76,.45)', marginBottom:'6px' }}>{s.label}</div>
                  <div style={{ fontSize:'14px', fontWeight:500, color: PARCH, letterSpacing:'.02em' }}>{s.value}</div>
                </>
              )
              return s.href
                ? <a key={s.label} href={s.href} style={itemStyle}>{inner}</a>
                : <div key={s.label} style={itemStyle}>{inner}</div>
            })}
          </div>
        </div>

        {/* VIDEO HIGHLIGHTS ROW */}
        {videos.length > 0 && (
          <div style={{ maxWidth:'1100px', margin:'32px auto 0', padding:'0 clamp(20px,4vw,40px)' }}>
            <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase', color:'rgba(201,168,76,.45)', marginBottom:'14px' }}>Highlights</div>
            <div style={{ display:'flex', gap:'16px', overflowX:'auto', paddingBottom:'6px' }}>
              {videos.map((url, i) => {
                const ytId = getYouTubeId(url)
                const labels = ['Intro reel','Case study','Keynote clip','Panel talk']
                const isActive = activeVideo === i
                return (
                  <button key={i} type="button" onClick={() => setActiveVideo(isActive ? null : i)}
                    aria-label={`${isActive ? 'Close' : 'Play'} ${labels[i] || `Video ${i+1}`}`}
                    aria-pressed={isActive}
                    style={{ flexShrink:0, width:'84px', textAlign:'center', cursor:'pointer', border:0, padding:0, color:'inherit', background:'transparent', font: 'inherit' }}>
                    <div style={{ width:'72px', height:'72px', borderRadius:'50%', margin:'0 auto 8px', padding:'2.5px', background: isActive ? `conic-gradient(${GOLD}, rgba(201,168,76,.2) 40%, rgba(201,168,76,.05) 41%)` : 'rgba(201,168,76,.15)', border: isActive ? `none` : `1px solid ${GLINE}` }}>
                      <div style={{ width:'100%', height:'100%', borderRadius:'50%', background: MID, display:'flex', alignItems:'center', justifyContent:'center', color: GOLD, fontSize:'18px', border:`2px solid ${DARK}`, overflow:'hidden' }}>
                        {ytId
                          ? <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
                          : '▶'}
                      </div>
                    </div>
                    <div style={{ fontSize:'10px', color: DIM, letterSpacing:'.04em' }}>{labels[i] || `Video ${i+1}`}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* MAIN GRID */}
        <div className="vi-profile-grid" style={{ maxWidth:'1100px', margin:'36px auto 80px', padding:'0 clamp(20px,4vw,40px)', display:'grid', gridTemplateColumns:'280px minmax(0, 1fr)', gap:'40px' }}>

          {/* SIDEBAR */}
          <div style={{ minWidth:0 }}>

            {/* VALU Index */}
            <div id="valu-card" style={{ background: MID, border:`1px solid ${GLINE}`, padding:'22px', marginBottom:'16px', scrollMarginTop:'96px' }}>
              <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase', color:'rgba(201,168,76,.5)', marginBottom:'14px' }}>VALU Index</div>
              {p.valu_score != null ? (
                <>
                  <div style={{ fontSize:'52px', fontWeight:700, color: GOLD, lineHeight:1, marginBottom:'4px' }}>{p.valu_score}<span style={{ fontSize:'16px', color: DIM, fontWeight:400 }}> points</span></div>
                  {displayDesignation && <div style={{ fontSize:'11px', fontWeight:700, color: GOLD, marginBottom:'20px', letterSpacing:'.08em', textTransform:'uppercase' }}>{displayDesignation}</div>}
                  {p.cluster_scores && (
                    <div style={{ marginTop:'8px' }}>
                      <PrimeRadarChart scores={p.cluster_scores} />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p style={{ fontSize:'13px', fontWeight:300, color: DIM, lineHeight:1.7, marginBottom:'16px' }}>
                    This is a Basic snapshot listing. The separate full VALU assessment establishes official points and the assessment-based capability summary.
                  </p>
                  <a href="/valu"
                    style={{ display:'block', padding:'11px', background:'transparent', border:`1px solid ${GLINE2}`, color: GOLD, fontSize:'10px', fontWeight:700, letterSpacing:'.12em', textAlign:'center', textDecoration:'none' }}>
                    ABOUT THE VALU INDEX
                  </a>
                </>
              )}
            </div>

            {/* Profile ID verification */}
            <div style={{ background: MID, border:`1px solid ${GLINE}`, padding:'22px', marginBottom:'16px' }}>
              <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase', color:'rgba(201,168,76,.5)', marginBottom:'12px' }}>Profile ID</div>
              <div style={{ fontSize:'13px', fontWeight:700, color: PARCH, letterSpacing:'.06em', marginBottom:'8px', fontVariantNumeric:'tabular-nums' }}>{atbId}</div>
              <div style={{ fontSize:'11px', fontWeight:300, color: DIM, lineHeight:1.6 }}>Listed on the Valoria Marketplace.</div>
            </div>

            {/* Links — gated */}
            <div style={{ background: MID, border:`1px solid ${GLINE}`, padding:'22px' }}>
              <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase', color:'rgba(201,168,76,.5)', marginBottom:'12px' }}>Contact & Links</div>
              {p.phone || p.linkedin_url || p.website_url || compensation ? (
                <>
                  {compensation && (
                    <div style={{ fontSize:'13px', fontWeight:300, color: DIM, padding:'10px 0', borderTop:`1px solid ${GLINE}` }}>
                      💰&ensp;{compLabel} — visible after introduction
                    </div>
                  )}
                  {p.phone && (
                    <div style={{ fontSize:'13px', fontWeight:300, color: DIM, padding:'10px 0', borderTop:`1px solid ${GLINE}` }}>
                      ☎&ensp;Phone — visible after introduction
                    </div>
                  )}
                  {p.linkedin_url && (
                    <div style={{ fontSize:'13px', fontWeight:300, color: DIM, padding:'10px 0', borderTop:`1px solid ${GLINE}` }}>
                      in&ensp;LinkedIn — visible after introduction
                    </div>
                  )}
                  {p.website_url && (
                    <div style={{ fontSize:'13px', fontWeight:300, color: DIM, padding:'10px 0', borderTop:`1px solid ${GLINE}` }}>
                      ↗&ensp;Website — visible after introduction
                    </div>
                  )}
                </>
              ) : (
                <p style={{ fontSize:'12px', fontWeight:300, color:'rgba(247,244,238,.3)', fontStyle:'italic' }}>No links added yet.</p>
              )}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div style={{ minWidth:0 }}>

            {/* Expanded video player */}
            {activeVideo !== null && videos[activeVideo] && (() => {
              const ytId = getYouTubeId(videos[activeVideo])
              return ytId ? (
                <div style={{ marginBottom:'32px' }}>
                  <div style={{ position:'relative', paddingBottom:'56.25%', height:0, background:'#000', overflow:'hidden' }}>
                    <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                      title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
                      style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none' }} />
                  </div>
                  <button onClick={() => setActiveVideo(null)}
                    style={{ fontSize:'12px', color: DIM, background:'none', border:'none', cursor:'pointer', padding:'10px 0', fontFamily:'var(--font,Raleway,sans-serif)', letterSpacing:'.04em' }}>
                    ← Close video
                  </button>
                </div>
              ) : null
            })()}

            {/* Report-backed capability summary takes precedence; a self-reported overview is only a fallback. */}
            <Section label={p.assessment_summary ? 'VALU Capability Summary' : 'Professional Overview'}>
              {p.assessment_summary
                ? <p style={{ fontSize:'15px', fontWeight:300, color: DIM, lineHeight:1.8 }}>{p.assessment_summary}</p>
                : p.bio
                  ? <><p style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.12em', color:'rgba(201,168,76,.6)', marginBottom:'10px' }}>SELF-REPORTED OVERVIEW</p><p style={{ fontSize:'15px', fontWeight:300, color: DIM, lineHeight:1.8 }}>{p.bio}</p></>
                  : <p style={{ fontSize:'13px', fontWeight:300, color:'rgba(247,244,238,.45)', lineHeight:1.7 }}>This Basic snapshot profile does not include an official VALU capability summary. That summary is established after the separate full assessment.</p>}
            </Section>

            {/* Highest-scoring PRIME clusters are shown as report-backed points, without inferred personality claims. */}
            {p.cluster_scores && (
              <div style={{ background: GOLD, padding:'22px', marginBottom:'32px' }}>
                <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase', color:'rgba(15,15,26,.55)', marginBottom:'16px' }}>Highest-Scoring PRIME Clusters</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                  {rankedClusterStrengths(p.cluster_scores).map(({ letter, name, score }) => (
                    <div key={letter} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px', borderBottom:'1px solid rgba(15,15,26,.14)', paddingBottom:'10px' }}>
                      <div style={{ fontSize:'13px', fontWeight:600, color: DARK }}>{letter} · {name}</div>
                      <div style={{ fontSize:'13px', fontWeight:700, color: DARK, fontVariantNumeric:'tabular-nums' }}>{score} points</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills / Topics */}
            {tags.length > 0 && (
              <Section label={displayTrack === 'facilitator' ? 'Program Types' : displayTrack === 'speaker' ? 'Speaking Topics' : 'Core Skills'}>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'10px' }}>
                  {tags.map(t => (
                    <span key={t} style={{ padding:'8px 16px', border:`1px solid ${GLINE2}`, fontSize:'12px', fontWeight:400, color: DIM, letterSpacing:'.04em' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Verified participation — certificates are issued only from verified attendance.
                They are intentionally part of the professional record, not a temporary event page. */}
            {certificates.length > 0 && (
              <Section label={`Participation & Certificates · ${certificates.length} verified event${certificates.length === 1 ? '' : 's'}`}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'12px' }}>
                  {certificates.map(cert => {
                    const eventDate = new Intl.DateTimeFormat('en-NG', { day:'numeric', month:'short', year:'numeric', timeZone:'Africa/Lagos' }).format(new Date(cert.event_date))
                    return (
                      <article key={cert.id} style={{ background:MID, border:`1px solid ${GLINE}`, padding:'20px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px', marginBottom:'14px' }}>
                          <span style={{ fontSize:'8px', fontWeight:700, letterSpacing:'.16em', color:GOLD }}>VERIFIED ATTENDANCE</span>
                          <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#C9A84C', flexShrink:0 }} aria-label="Verified" />
                        </div>
                        <h3 style={{ fontSize:'18px', fontWeight:500, color:PARCH, lineHeight:1.3, margin:'0 0 8px' }}>{cert.event_title}</h3>
                        <div style={{ fontSize:'11px', color:DIM, lineHeight:1.7 }}>{eventDate} · {cert.issuer}</div>
                        <div style={{ marginTop:'16px', paddingTop:'12px', borderTop:`1px solid ${GLINE}`, display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px' }}>
                          <span style={{ fontSize:'9px', color:'rgba(247,244,238,.38)', letterSpacing:'.06em', fontVariantNumeric:'tabular-nums' }}>{cert.certificate_number}</span>
                          <Link href={`/certificate/${cert.verification_token}`} style={{ color:GOLD, fontSize:'9px', fontWeight:700, letterSpacing:'.1em', textDecoration:'none', whiteSpace:'nowrap' }}>VERIFY →</Link>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </Section>
            )}

            {/* Video grid (when no video expanded) */}
            {videos.length > 0 && activeVideo === null && (
              <Section label={(isSpeaker || isFacilitator) ? 'Speaker Reel & Videos' : 'Videos'}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:'12px' }}>
                  {videos.slice(0,4).map((url, i) => {
                    const ytId = getYouTubeId(url)
                    return (
                      <button key={i} type="button" onClick={() => setActiveVideo(i)}
                        aria-label={`Play ${['Intro reel','Case study','Keynote clip','Panel talk'][i] || `Video ${i+1}`}`}
                        style={{ aspectRatio:'16/10', position:'relative', width:'100%', padding:0, color:'inherit', font:'inherit', background:`linear-gradient(145deg,${MID},${DARK})`, border:`1px solid ${GLINE}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden' }}>
                        {ytId && <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.5 }} />}
                        <span aria-hidden="true" style={{ width:'44px', height:'44px', borderRadius:'50%', background:'rgba(201,168,76,.9)', display:'flex', alignItems:'center', justifyContent:'center', color: DARK, fontSize:'15px', position:'relative', zIndex:1 }}>▶</span>
                      </button>
                    )
                  })}
                </div>
              </Section>
            )}

            {/* Introduction CTA — anchor target for the capability-specific enquiry
                links on /marketplace/talent and /marketplace/speakers, which point to
                this page as #contact. scrollMarginTop accounts for the fixed nav. */}
            {p.is_dummy && (
              <div style={{ padding:'14px 18px', background:'rgba(154,106,0,.1)', border:'1px solid rgba(154,106,0,.35)', borderRadius:'6px', fontSize:'12px', fontWeight:600, color:'#D9A441', marginBottom:'12px', letterSpacing:'.02em' }}>
                ⚠ Sample profile — not a real person. Real professionals are still joining; this placeholder can't receive introductions.
              </div>
            )}
            <div id="contact" className="vi-cta-intro" style={{ background:`linear-gradient(135deg, rgba(201,168,76,.06), rgba(26,26,46,.3))`, border:`1px solid ${GLINE2}`, padding:'28px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'24px', flexWrap:'wrap', marginTop:'8px', scrollMarginTop:'96px' }}>
              <div>
                <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase', color:'rgba(201,168,76,.5)', marginBottom:'8px' }}>
                  {isOwnProfile ? 'This Is Your Profile' : !canRequest ? 'Introductions Not Available' : displayTrack === 'facilitator' ? 'Commission This Facilitator' : displayTrack === 'speaker' ? 'Request This Speaker' : 'Get in Touch'}
                </div>
                <p style={{ fontSize:'13px', fontWeight:300, color: DIM, maxWidth:'380px', lineHeight:1.7 }}>
                  {isOwnProfile
                    ? 'This is what others see when they view your profile. Keep it up to date so the right people can reach you.'
                    : !canRequest
                    ? 'This profile is visible in the Marketplace, but no capability is currently open for enquiries.'
                    : displayTrack === 'facilitator'
                    ? 'Interested in commissioning this facilitator? Send an enquiry through Valoria.'
                    : displayTrack === 'speaker'
                    ? 'Interested in engaging this speaker for your event? Send an enquiry through Valoria.'
                    : 'Want to connect with this professional? Send an enquiry through Valoria; private contact details are not displayed on this profile.'}
                </p>
              </div>
              {p.is_dummy ? (
                <button type="button" disabled
                  style={{ padding:'14px 28px', background:'rgba(255,255,255,.06)', color:'rgba(247,244,238,.3)', fontSize:'11px', fontWeight:700, letterSpacing:'.14em', border:'none', cursor:'not-allowed', flexShrink:0, whiteSpace:'nowrap' }}>
                  SAMPLE — NOT AVAILABLE
                </button>
              ) : isOwnProfile ? (
                <Link href="/profile/edit" style={{ padding:'14px 28px', background:GOLD, color:DARK, fontSize:'11px', fontWeight:700, letterSpacing:'.14em', textDecoration:'none', flexShrink:0, whiteSpace:'nowrap' }}>
                  EDIT YOUR PROFILE
                </Link>
              ) : canRequest ? (
                <EnquiryForm
                  professionalProfileId={p.id}
                  atbId={atbId}
                  enquiryType={displayTrack === 'facilitator' ? 'facilitator_commission' : displayTrack === 'speaker' ? 'speaker_booking' : 'candidate'}
                  ctaLabel={displayTrack === 'facilitator' ? 'REQUEST FACILITATOR' : displayTrack === 'speaker' ? 'REQUEST SPEAKER' : 'SEND INTRODUCTION'}
                  currentUser={currentUser}
                />
              ) : (
                <span style={{fontSize:'10px',letterSpacing:'.1em',color:DIM}}>INTRODUCTIONS NOT AVAILABLE</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes vi-pulse {
          0%{box-shadow:0 0 0 0 rgba(29,158,117,.55);}
          70%{box-shadow:0 0 0 6px rgba(29,158,117,0);}
          100%{box-shadow:0 0 0 0 rgba(29,158,117,0);}
        }
        .vi-stat-strip {
          flex-wrap: nowrap !important;
          min-width: 0;
          overflow-x: auto;
          overscroll-behavior-x: contain;
          scrollbar-width: thin;
          -webkit-overflow-scrolling: touch;
        }
        .vi-stat-strip > * {
          flex: 0 0 150px !important;
          min-width: 150px !important;
          box-sizing: border-box;
        }
        .vi-profile-grid > * { min-width: 0; }
        .vi-stat-strip a:hover, .vi-stat-strip div:hover {
          background: rgba(201,168,76,.04);
        }
        @media (max-width: 860px) {
          .vi-profile-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 28px !important;
          }
        }
        @media (max-width: 640px) {
          .vi-stat-strip { flex-wrap: nowrap !important; }
          .vi-stat-strip > * { flex: 0 0 138px !important; min-width: 138px !important; }
          .vi-header-block {
            margin-top: -36px !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          .vi-avatar-frame {
            width: 104px !important;
            height: 104px !important;
          }
          .vi-header-block > div:nth-child(2) {
            flex: 1 1 calc(100% - 120px) !important;
            min-width: 0 !important;
            padding-bottom: 0 !important;
            align-self: center !important;
          }
          .vi-header-block > div:nth-child(2) > div:first-child {
            overflow-wrap: anywhere;
            font-size: clamp(18px, 5vw, 24px) !important;
          }
          .vi-header-block > div:nth-child(2) span {
            max-width: 100%;
            overflow-wrap: anywhere;
          }
          .vi-profile-grid {
            margin-top: 28px !important;
            margin-bottom: 48px !important;
            padding-left: 18px !important;
            padding-right: 18px !important;
          }
          .vi-cta-intro {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 20px !important;
            gap: 16px !important;
          }
          .vi-cta-intro button,
          .vi-cta-intro a {
            max-width: 100%;
            white-space: normal !important;
            text-align: center;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .vi-header-block *, .vi-stat-strip * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </>
  )
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom:'36px', paddingBottom:'36px', borderBottom:`1px solid ${GLINE}` }}>
      <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase', color:'rgba(201,168,76,.45)', marginBottom:'16px' }}>{label}</div>
      {children}
    </div>
  )
}
