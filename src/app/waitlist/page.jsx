'use client'
import { useState, useRef, useEffect } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import WaitlistModal from '@/components/WaitlistModal'

// ─── brand ───────────────────────────────────────────────────────────────────
const GOLD    = '#C9A84C'
const DARK    = '#0F0F1A'
const MID     = '#1A1A2E'
const PARCH   = '#F7F4EE'
const DIM     = 'rgba(247,244,238,.55)'
const FAINT   = 'rgba(247,244,238,.25)'
const GLINE   = 'rgba(201,168,76,.12)'
const GLINE2  = 'rgba(201,168,76,.28)'
const CARD    = '#161624'   // matches --dark-card, the site's card surface everywhere else
const PLINE   = 'rgba(247,244,238,.2)'  // matches .btn-outline / card border elsewhere on the site

// ─── copy data ───────────────────────────────────────────────────────────────
const FOR_WHO = [
  {
    color: '#378ADD', tag: 'CANDIDATE', title: 'You want the right job.',
    body: "You're a professional looking for your next role, contract, or opportunity. You want employers to find you based on what you can do, not who you know.",
    icon: (c) => <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M4 8h16v11a1 1 0 01-1 1H5a1 1 0 01-1-1V8z" stroke={c} strokeWidth="1.5"/><path d="M9 8V6a2 2 0 012-2h2a2 2 0 012 2v2" stroke={c} strokeWidth="1.5"/><path d="M4 12h16" stroke={c} strokeWidth="1.5"/></svg>
  },
  {
    color: GOLD, tag: 'SPEAKER', title: 'You want to be booked.',
    body: 'You speak, train, or present. You want event organisers to discover you, verify your capability, and book you without three layers of referral.',
    icon: (c) => <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3z" stroke={c} strokeWidth="1.5"/><path d="M6 11a6 6 0 0012 0M12 17v4M9 21h6" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>
  },
  {
    color: '#1D9E75', tag: 'EMPLOYER', title: 'You want the right person.',
    body: "You hire, organise events, or commission training. You're tired of the same recycled names. You want to find the genuinely best person: assessed, verified, ready.",
    icon: (c) => <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.5"/><circle cx="12" cy="12" r="5" stroke={c} strokeWidth="1.5"/><circle cx="12" cy="12" r="1" fill={c}/></svg>
  },
]

const PAIN_POINTS = [
  { icon: '👔', headline: 'You applied for the job.', body: 'Someone with half your experience got it. Why? Because they knew the hiring manager.' },
  { icon: '🎤', headline: 'You should be on that stage.', body: "The same three speakers keep getting booked, not because they're the best, but because the organiser only has five contacts." },
  { icon: '📋', headline: "You've done the work.", body: 'But the training contract went to the big-name consultant everyone already knows. Your track record stayed invisible.' },
]

const SUCCESS_TRACKS = [
  { color:'#378ADD', label:'ATB CONNECT',   desc:'Employers find pre-assessed candidates by score, strength, and sector.' },
  { color: GOLD,      label:'ATB SPOTLIGHT', desc:'Event planners discover and book speakers whose capability is verified.' },
  { color:'#1D9E75', label:'ATB DEVELOP',   desc:'L&D leaders commission PRIME-certified facilitators with an assessed track record.' },
]

// Real per-persona journey maps, shown under "How It Works"
const JOURNEYS = {
  candidate: {
    color: '#378ADD', label: 'AS A CANDIDATE',
    steps: [
      { title: 'Take the VALU Index', body: 'A 25 minute assessment that measures your capability across five dimensions. Not a quiz. An independent standard.' },
      { title: 'Your profile goes live', body: 'Your score, strengths, and ATB ID appear in the marketplace, visible to verified employers.' },
      { title: 'Employers find you', body: 'Hiring teams search by capability, not connections, and reach out directly.' },
      { title: 'You choose who to talk to', body: 'Every introduction comes to you first. You stay in control of every conversation.' },
    ]
  },
  speaker: {
    color: GOLD, label: 'AS A SPEAKER',
    steps: [
      { title: 'Take the VALU Index', body: 'The same rigorous assessment, adapted to measure presence, expression, and delivery.' },
      { title: 'Earn your speaker badge', body: 'Emerging, Established, or Elite, based on your verified track record.' },
      { title: 'Appear in ATB Spotlight', body: 'Event organisers browse speakers by topic, tier, and audience fit.' },
      { title: 'Get booked on merit', body: 'Organisers reach out with real bookings, not vague speaking invites.' },
    ]
  },
  employer: {
    color: '#1D9E75', label: 'AS AN EMPLOYER',
    steps: [
      { title: 'Create your account', body: 'Set up an organisation profile on ATB Connect in a few minutes.' },
      { title: 'Search verified profiles', body: 'Filter candidates by score, strength, sector, and role, not just keywords.' },
      { title: 'Request an introduction', body: 'Send a request through the platform. We review it before anything moves forward.' },
      { title: 'Meet the right person', body: 'We make the connection once both sides are ready. No cold outreach, no guesswork.' },
    ]
  },
}

// Short CTA strips dropped between sections
const NUDGES = [
  { eyebrow: 'FOUNDING COHORT', line: "Don't just read about it.", sub: 'Secure your spot in 20 seconds.', color: '#378ADD' },
  { eyebrow: 'STILL WITH US?',   line: 'This is happening.',        sub: 'Join before you scroll past it.', color: GOLD },
  { eyebrow: 'ALMOST THERE',     line: 'Your name could be first.', sub: 'The founding cohort is filling up.', color: '#1D9E75' },
]

function CtaStrip({ nudge, onClick }) {
  return (
    <div style={{ borderBottom: `1px solid ${GLINE}`, background: 'rgba(255,255,255,.015)' }}>
      <div style={{
        maxWidth: '620px', margin: '0 auto', textAlign: 'center',
        padding: 'clamp(28px,4vw,40px) clamp(20px,5vw,80px)',
      }}>
        <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.2em', color: nudge.color, marginBottom: '10px' }}>{nudge.eyebrow}</div>
        <div style={{ fontSize: 'clamp(17px,2vw,22px)', fontWeight: 300, color: PARCH, marginBottom: '6px' }}>{nudge.line}</div>
        <div style={{ fontSize: '13px', fontWeight: 300, color: DIM, marginBottom: '22px' }}>{nudge.sub}</div>
        <button onClick={onClick} style={{
          padding: '13px 30px', background: GOLD, color: DARK, fontSize: '11px',
          fontWeight: 600, letterSpacing: '.16em', border: 'none', borderRadius: '9999px', cursor: 'pointer',
          fontFamily: 'inherit',
        }}>
          JOIN NOW →
        </button>
      </div>
    </div>
  )
}

function SectionIntro({ eyebrow }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px', justifyContent:'center' }}>
      <div style={{ height:'1px', width:'32px', background:GLINE2 }} />
      <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.2em', color:'rgba(201,168,76,.5)' }}>{eyebrow}</span>
      <div style={{ height:'1px', width:'32px', background:GLINE2 }} />
    </div>
  )
}

// ─── component ───────────────────────────────────────────────────────────────
export default function WaitlistPage() {
  const [showSticky, setShowSticky] = useState(false)
  const [showPopup, setShowPopup]   = useState(false)
  const [joinOpen, setJoinOpen]     = useState(false)
  const [persona, setPersona]       = useState('candidate')
  const popupShownRef = useRef(false)
  const howItWorksRef  = useRef(null)

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const trigger = () => {
      if (popupShownRef.current || joinOpen) return
      popupShownRef.current = true
      setShowPopup(true)
    }
    const onScrollProgress = () => {
      const doc = document.documentElement
      const scrolled = window.scrollY / (doc.scrollHeight - doc.clientHeight)
      if (scrolled >= 0.5) trigger()
    }
    const onMouseOut = (e) => { if (e.clientY <= 0) trigger() }

    window.addEventListener('scroll', onScrollProgress, { passive: true })
    document.addEventListener('mouseout', onMouseOut)
    return () => {
      window.removeEventListener('scroll', onScrollProgress)
      document.removeEventListener('mouseout', onMouseOut)
    }
  }, [joinOpen])

  const openJoin = () => { setShowPopup(false); setJoinOpen(true) }
  const scrollToJourney = () => howItWorksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  // ── Desktop side-nav: tracks which section is in view ──
  const NAV_SECTIONS = [
    { id: 'who',           label: "Who it's for" },
    { id: 'problem',       label: 'The problem' },
    { id: 'solution',      label: 'The solution' },
    { id: 'how-it-works',  label: 'How it works' },
    { id: 'founding',      label: 'Founding cohort' },
    { id: 'join-cta',      label: 'Join' },
  ]
  const [activeSection, setActiveSection] = useState('who')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    )
    NAV_SECTIONS.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const scrollToSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <>
      <Nav />

      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 500,
        transform: showSticky ? 'translateY(0)' : 'translateY(120%)',
        transition: 'transform 0.35s ease',
        background: '#0F0F1A', borderTop: `1px solid ${GLINE2}`,
        padding: '14px clamp(16px,4vw,32px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        boxShadow: '0 -8px 24px rgba(0,0,0,.35)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#1D9E75', flexShrink: 0, animation: 'vi-pulse 2s infinite' }} />
          <span style={{ fontSize: 'clamp(11px,1.6vw,13px)', color: PARCH, fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Founding cohort is <strong style={{ color: GOLD, fontWeight: 700 }}>open now.</strong>
          </span>
        </div>
        <button onClick={openJoin} style={{
          padding: '11px 22px', background: GOLD, color: DARK, fontSize: '11px',
          fontWeight: 600, letterSpacing: '.16em', border: 'none', borderRadius: '9999px', cursor: 'pointer',
          fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          JOIN THE WAITLIST →
        </button>
      </div>

      {/* ── DESKTOP SIDE NAV — hidden on mobile, tracks scroll position ── */}
      <nav className="wl-side-nav" aria-label="Page sections">
        {NAV_SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => scrollToSection(s.id)}
            className={`wl-side-nav-item${activeSection === s.id ? ' active' : ''}`}
          >
            <span className="wl-side-nav-dot" />
            <span className="wl-side-nav-label">{s.label}</span>
          </button>
        ))}
      </nav>

      {showPopup && (
        <div
          role="dialog" aria-modal="true" aria-label="Join the Valoria waitlist"
          style={{
            position: 'fixed', inset: 0, zIndex: 900,
            background: 'rgba(10,10,20,.85)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            animation: 'vi-popup-in .3s ease',
          }}
          onClick={() => setShowPopup(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: CARD, border: `1px solid ${GLINE2}`, borderRadius: '16px',
              padding: 'clamp(28px,5vw,44px)', maxWidth: '440px', width: '100%',
              position: 'relative', textAlign: 'center',
            }}
          >
            <button
              onClick={() => setShowPopup(false)}
              aria-label="Close"
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'none', border: 'none', color: FAINT,
                fontSize: '20px', cursor: 'pointer', lineHeight: 1, padding: '4px',
              }}
            >
              ×
            </button>

            <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.22em', color: GOLD, marginBottom: '16px' }}>
              STILL DECIDING?
            </div>
            <h3 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 200, color: PARCH, lineHeight: 1.2, letterSpacing: '-.02em', marginBottom: '14px' }}>
              You've seen what's coming.<br/><em style={{ fontStyle: 'italic', color: GOLD }}>Now make it yours.</em>
            </h3>
            <p style={{ fontSize: '13px', fontWeight: 300, color: DIM, lineHeight: 1.75, marginBottom: '28px' }}>
              The founding cohort closes before the marketplace opens. Join now and you'll be in the first group assessed, verified, and seen.
            </p>
            <button onClick={openJoin} style={{
              width: '100%', padding: '15px 24px', background: GOLD, color: DARK,
              fontSize: '11px', fontWeight: 600, letterSpacing: '.16em', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', marginBottom: '12px', borderRadius: '9999px',
            }}>
              JOIN THE FOUNDING COHORT →
            </button>
            <button
              onClick={() => setShowPopup(false)}
              style={{ background: 'none', border: 'none', color: FAINT, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Not right now
            </button>
          </div>
        </div>
      )}

      <WaitlistModal open={joinOpen} onClose={() => setJoinOpen(false)} source="waitlist_page" />

      <main style={{ background: DARK, color: PARCH, fontFamily: "var(--font,'Raleway','Helvetica Neue',Arial,sans-serif)", overflow: 'hidden' }}>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section style={{ padding: 'clamp(60px,8vw,110px) clamp(20px,5vw,80px) clamp(48px,6vw,80px)', borderBottom: `1px solid ${GLINE}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position:'absolute', top:'-20%', right:'-10%', width:'600px', height:'600px', borderRadius:'50%', background:`radial-gradient(circle, rgba(201,168,76,.1) 0%, transparent 70%)`, pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'-10%', left:'-5%', width:'400px', height:'400px', borderRadius:'50%', background:`radial-gradient(circle, rgba(55,138,221,.07) 0%, transparent 70%)`, pointerEvents:'none' }} />

          <div className="wl-hero-grid" style={{ position:'relative' }}>
            <div className="wl-hero-text">
              <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', marginBottom:'28px', padding:'7px 16px', border:`1px solid ${GLINE2}`, background:'rgba(201,168,76,.06)' }}>
                <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#1D9E75', animation:'vi-pulse 2s infinite' }} />
                <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.18em', color:GOLD }}>FOUNDING COHORT. NOW OPEN.</span>
              </div>

              <h1 style={{ fontSize:'clamp(32px,5vw,58px)', fontWeight:200, lineHeight:1.15, letterSpacing:'-.03em', marginBottom:'24px', color:PARCH }}>
                The best person for the job keeps losing to the{' '}
                <em style={{ fontStyle:'italic', color:GOLD, fontWeight:300 }}>most connected one.</em>
              </h1>
              <p style={{ fontSize:'clamp(16px,2vw,20px)', fontWeight:300, color:DIM, lineHeight:1.75, marginBottom:'40px' }}>
                Valoria is where African professionals get assessed, verified, and put in front of the people who actually hire, book, and commission, based on what they can do, not who they know.
              </p>
              <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }} className="wl-hero-cta">
                <button onClick={openJoin}
                  style={{ padding:'15px 36px', background:GOLD, color:DARK, fontSize:'12px', fontWeight:600, letterSpacing:'.16em', border:'none', borderRadius:'9999px', cursor:'pointer', fontFamily:'inherit' }}>
                  JOIN THE WAITLIST →
                </button>
                <button onClick={scrollToJourney}
                  style={{ padding:'14px 30px', border:`1px solid ${PLINE}`, color:DIM, fontSize:'12px', fontWeight:400, letterSpacing:'.14em', background:'transparent', borderRadius:'9999px', cursor:'pointer', fontFamily:'inherit' }}>
                  SEE HOW IT WORKS
                </button>
              </div>
            </div>

            {/* Desktop-only visual: a preview of what a VALU Index profile looks like */}
            <div className="wl-hero-visual">
              <div style={{ background:CARD, border:`1px solid ${GLINE2}`, borderRadius:'18px', padding:'32px', width:'100%', maxWidth:'380px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'22px' }}>
                  <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.16em', color:FAINT }}>VALU INDEX PROFILE</span>
                  <span style={{ fontSize:'9px', fontWeight:700, letterSpacing:'.12em', color:'#1D9E75', padding:'3px 9px', border:'1px solid rgba(29,158,117,.35)', borderRadius:'9999px' }}>VERIFIED</span>
                </div>
                <div style={{ display:'flex', alignItems:'baseline', gap:'8px', marginBottom:'26px' }}>
                  <span style={{ fontSize:'52px', fontWeight:200, color:GOLD, letterSpacing:'-.02em', lineHeight:1 }}>91</span>
                  <span style={{ fontSize:'13px', fontWeight:300, color:DIM }}>/ 100 overall score</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                  {[
                    { name:'Presence', color:'#1D9E75', pct:88 },
                    { name:'Resolve', color:'#378ADD', pct:94 },
                    { name:'Intelligence', color:'#7F77DD', pct:90 },
                    { name:'Mastery', color:'#BA7517', pct:85 },
                    { name:'Expression', color:'#D85A30', pct:96 },
                  ].map(d => (
                    <div key={d.name}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                        <span style={{ fontSize:'11px', fontWeight:500, color:PARCH }}>{d.name}</span>
                        <span style={{ fontSize:'11px', fontWeight:600, color:d.color }}>{d.pct}</span>
                      </div>
                      <div style={{ height:'4px', borderRadius:'2px', background:'rgba(255,255,255,.06)', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${d.pct}%`, borderRadius:'2px', background:d.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHO IT'S FOR — the next thing you see after the hero ─────── */}
        <section id="who" style={{ padding:'clamp(60px,8vw,100px) clamp(20px,5vw,80px)', borderBottom:`1px solid ${GLINE}`, background:MID }}>
          <div style={{ maxWidth:'900px', margin:'0 auto', textAlign:'center' }}>
            <SectionIntro eyebrow="WHO IT'S FOR" />
            <h2 style={{ fontSize:'clamp(28px,4vw,52px)', fontWeight:200, lineHeight:1.1, letterSpacing:'-.02em', marginBottom:'48px' }}>
              If any of these<br/><em style={{ fontStyle:'italic', color:GOLD }}>sound like you.</em>
            </h2>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px,1fr))', gap:'16px', marginBottom:'48px', textAlign:'left' }}>
              {FOR_WHO.map((f, i) => (
                <div key={i} style={{ padding:'28px', border:`1px solid ${GLINE}`, borderRadius:'14px', background:CARD, position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:f.color }} />
                  <div style={{ marginBottom:'14px' }}>{f.icon(f.color)}</div>
                  <div style={{ display:'inline-block', padding:'4px 12px', border:`1px solid ${f.color}`, fontSize:'10px', fontWeight:700, letterSpacing:'.14em', color:f.color, marginBottom:'16px' }}>{f.tag}</div>
                  <div style={{ fontSize:'18px', fontWeight:600, color:PARCH, lineHeight:1.3, marginBottom:'12px' }}>{f.title}</div>
                  <p style={{ fontSize:'13px', fontWeight:300, color:DIM, lineHeight:1.75, margin:0 }}>{f.body}</p>
                </div>
              ))}
            </div>

            <div style={{ padding:'32px', border:`1px solid ${GLINE2}`, borderRadius:'14px', background:'rgba(201,168,76,.04)', textAlign:'left' }}>
              <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.18em', color:'rgba(201,168,76,.5)', marginBottom:'20px', textAlign:'center' }}>THREE ENTRY POINTS INTO THE MARKETPLACE</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                {SUCCESS_TRACKS.map((t, i) => (
                  <div key={i} style={{ display:'flex', gap:'16px', alignItems:'flex-start' }}>
                    <div style={{ width:'3px', background:t.color, flexShrink:0, alignSelf:'stretch', borderRadius:'2px', minHeight:'36px' }} />
                    <div>
                      <div style={{ fontSize:'11px', fontWeight:700, letterSpacing:'.14em', color:t.color, marginBottom:'4px' }}>{t.label}</div>
                      <div style={{ fontSize:'13px', fontWeight:300, color:DIM, lineHeight:1.65 }}>{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PROBLEM (P) ──────────────────────────────────────────────── */}
        <section id="problem" style={{ padding:'clamp(60px,8vw,100px) clamp(20px,5vw,80px)', borderBottom:`1px solid ${GLINE}` }}>
          <div style={{ maxWidth:'900px', margin:'0 auto', textAlign:'center' }}>
            <SectionIntro eyebrow="THE PROBLEM" />
            <h2 style={{ fontSize:'clamp(28px,4vw,52px)', fontWeight:200, lineHeight:1.1, letterSpacing:'-.02em', marginBottom:'16px' }}>
              You already know<br/><em style={{ fontStyle:'italic', color:GOLD }}>this feeling.</em>
            </h2>
            <p style={{ fontSize:'clamp(15px,1.8vw,18px)', fontWeight:300, color:DIM, lineHeight:1.8, maxWidth:'640px', margin:'0 auto 56px' }}>
              Somewhere out there, a person less qualified than you just got the job, the stage, or the contract.
              Not because they were better. Because they were <strong style={{ color:PARCH, fontWeight:500 }}>more visible</strong> to the right person at the right moment.
            </p>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px,1fr))', gap:'1px', background:GLINE, borderRadius:'14px', overflow:'hidden', textAlign:'left' }}>
              {PAIN_POINTS.map((p, i) => (
                <div key={i} style={{ background:CARD, padding:'32px 28px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'16px' }}>{p.icon}</div>
                  <div style={{ fontSize:'15px', fontWeight:600, color:PARCH, marginBottom:'10px', lineHeight:1.3 }}>{p.headline}</div>
                  <p style={{ fontSize:'13px', fontWeight:300, color:DIM, lineHeight:1.75, margin:0 }}>{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AGITATE (A) ──────────────────────────────────────────────── */}
        <section style={{ padding:'clamp(50px,7vw,80px) clamp(20px,5vw,80px)', borderBottom:`1px solid ${GLINE}`, background:MID }}>
          <div style={{ maxWidth:'720px', margin:'0 auto', textAlign:'center' }}>
            <div style={{ padding:'32px', background:'rgba(201,168,76,.05)', border:`1px solid ${GLINE2}`, borderRadius:'14px' }}>
              <p style={{ fontSize:'clamp(18px,2.5vw,26px)', fontWeight:200, lineHeight:1.5, color:PARCH, margin:'0 0 16px', letterSpacing:'-.01em' }}>
                And it keeps happening. Every week you wait, someone less capable gets seen first, simply because they were standing closer to the door.
              </p>
              <p style={{ fontSize:'14px', fontWeight:300, color:DIM, lineHeight:1.8, margin:0 }}>
                Across Africa, the talent is not the problem. The system that surfaces it is.
              </p>
            </div>
          </div>
        </section>

        {/* ── SOLUTION (S) ─────────────────────────────────────────────── */}
        <section id="solution" style={{ padding:'clamp(60px,8vw,100px) clamp(20px,5vw,80px)', borderBottom:`1px solid ${GLINE}` }}>
          <div style={{ maxWidth:'900px', margin:'0 auto', textAlign:'center' }}>
            <SectionIntro eyebrow="THE SOLUTION" />
            <h2 style={{ fontSize:'clamp(28px,4vw,52px)', fontWeight:200, lineHeight:1.1, letterSpacing:'-.02em', marginBottom:'20px' }}>
              What if your work could<br/><em style={{ fontStyle:'italic', color:GOLD }}>speak for itself?</em>
            </h2>
            <p style={{ fontSize:'clamp(15px,1.8vw,18px)', fontWeight:300, color:DIM, lineHeight:1.8, maxWidth:'640px', margin:'0 auto 16px' }}>
              Valoria Institute is a professional marketplace for Africa. Before anyone can list on it, they go through one thing: the VALU Index.
            </p>
            <p style={{ fontSize:'clamp(15px,1.8vw,18px)', fontWeight:300, color:DIM, lineHeight:1.8, maxWidth:'640px', margin:'0 auto 56px' }}>
              The VALU Index is an independent assessment that measures your actual professional capability. Not your job title, not your degree, not who vouched for you.
              It produces a score, a profile, a verified identity that any employer, organiser, or training buyer can trust.
            </p>

            <div style={{ marginBottom:'48px', textAlign:'left' }}>
              <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.18em', color:'rgba(201,168,76,.45)', marginBottom:'20px', textAlign:'center' }}>THE VALU INDEX MEASURES FIVE THINGS</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {[
                  { letter:'P', color:'#1D9E75', name:'Presence',     desc:'How you show up: your visibility, credibility, and professional confidence.' },
                  { letter:'R', color:'#378ADD', name:'Resolve',       desc:'How you handle pressure, setbacks, and difficult decisions.' },
                  { letter:'I', color:'#7F77DD', name:'Intelligence',  desc:'How you think: your strategic thinking, problem-solving, and learning speed.' },
                  { letter:'M', color:'#BA7517', name:'Mastery',       desc:'How good you are at your actual work: depth of expertise and craft.' },
                  { letter:'E', color:'#D85A30', name:'Expression',    desc:'How well you communicate, written, verbal, and interpersonal.' },
                ].map(d => (
                  <div key={d.letter} style={{ display:'flex', alignItems:'center', gap:'20px', padding:'14px 20px', border:`1px solid ${GLINE}`, borderRadius:'10px', background:CARD }}>
                    <div style={{ width:'36px', height:'36px', borderRadius:'50%', border:`2px solid ${d.color}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:700, color:d.color, flexShrink:0 }}>{d.letter}</div>
                    <div>
                      <div style={{ fontSize:'13px', fontWeight:700, color:d.color, marginBottom:'3px', letterSpacing:'.04em' }}>{d.name}</div>
                      <div style={{ fontSize:'12px', fontWeight:300, color:DIM, lineHeight:1.6 }}>{d.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding:'28px 32px', background:'rgba(201,168,76,.04)', border:`1px solid ${GLINE2}`, borderRadius:'14px' }}>
              <p style={{ fontSize:'clamp(15px,2vw,20px)', fontWeight:200, lineHeight:1.6, color:PARCH, margin:'0 0 8px' }}>
                Think of it like a verified report card for professionals. One that shows exactly how capable you are.
              </p>
              <p style={{ fontSize:'14px', fontWeight:300, color:DIM, lineHeight:1.7, margin:0 }}>
                That is what Valoria does. One score. Five dimensions. An identity that follows you across every opportunity on the platform.
              </p>
            </div>
          </div>
        </section>

        <CtaStrip nudge={NUDGES[0]} onClick={openJoin} />

        {/* ── HOW IT WORKS / YOUR JOURNEY ──────────────────────────────── */}
        <section ref={howItWorksRef} id="how-it-works" style={{ padding:'clamp(60px,8vw,100px) clamp(20px,5vw,80px)', borderBottom:`1px solid ${GLINE}`, background:MID }}>
          <div style={{ maxWidth:'1000px', margin:'0 auto', textAlign:'center' }}>
            <SectionIntro eyebrow="HOW IT WORKS" />
            <h2 style={{ fontSize:'clamp(28px,4vw,52px)', fontWeight:200, lineHeight:1.1, letterSpacing:'-.02em', marginBottom:'16px' }}>
              Your journey,<br/><em style={{ fontStyle:'italic', color:GOLD }}>mapped out.</em>
            </h2>
            <p style={{ fontSize:'14px', fontWeight:300, color:DIM, lineHeight:1.8, maxWidth:'560px', margin:'0 auto 40px' }}>
              What happens next looks a little different depending on why you are here. Pick the path that matches you.
            </p>

            <div className="wl-journey-grid">
              <div className="wl-journey-tabs">
                {Object.entries(JOURNEYS).map(([key, j]) => (
                  <button key={key} onClick={() => setPersona(key)} style={{
                    padding:'11px 22px', fontSize:'11px', fontWeight:600, letterSpacing:'.12em', borderRadius:'9999px',
                    border: persona === key ? `1px solid ${j.color}` : `1px solid ${GLINE}`,
                    background: persona === key ? `${j.color}1A` : 'transparent',
                    color: persona === key ? j.color : FAINT,
                    cursor:'pointer', fontFamily:'inherit', textAlign:'left',
                  }}>
                    {j.label}
                  </button>
                ))}
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'2px', textAlign:'left' }}>
                {JOURNEYS[persona].steps.map((h, i) => (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'60px 4px 1fr', gap:'0 24px', alignItems:'stretch' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', paddingTop:'28px', justifyContent:'flex-end' }}>
                      <span style={{ fontFamily:'var(--font,Raleway,sans-serif)', fontSize:'11px', fontWeight:700, letterSpacing:'.1em', color:JOURNEYS[persona].color }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                      <div style={{ width:'4px', height:'28px', background: i === 0 ? 'transparent' : GLINE }} />
                      <div style={{ width:'14px', height:'14px', borderRadius:'50%', border:`2px solid ${JOURNEYS[persona].color}`, background:MID, flexShrink:0 }} />
                      <div style={{ flex:1, width:'2px', background: i === JOURNEYS[persona].steps.length - 1 ? 'transparent' : GLINE }} />
                    </div>
                    <div style={{ padding:'20px 0 32px' }}>
                      <div style={{ fontSize:'16px', fontWeight:600, color:PARCH, marginBottom:'8px' }}>{h.title}</div>
                      <p style={{ fontSize:'14px', fontWeight:300, color:DIM, lineHeight:1.75, margin:0, maxWidth:'560px' }}>{h.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <CtaStrip nudge={NUDGES[1]} onClick={openJoin} />

        <section id="founding" style={{ padding:'clamp(60px,8vw,100px) clamp(20px,5vw,80px)', borderBottom:`1px solid ${GLINE}` }}>
          <div style={{ maxWidth:'900px', margin:'0 auto', textAlign:'center' }}>
            <SectionIntro eyebrow="THE FOUNDING COHORT" />
            <h2 style={{ fontSize:'clamp(28px,4vw,52px)', fontWeight:200, lineHeight:1.1, letterSpacing:'-.02em', marginBottom:'20px' }}>
              The people who join first<br/><em style={{ fontStyle:'italic', color:GOLD }}>matter most.</em>
            </h2>
            <p style={{ fontSize:'clamp(15px,1.8vw,18px)', fontWeight:300, color:DIM, lineHeight:1.8, maxWidth:'580px', margin:'0 auto 40px' }}>
              We are building the founding cohort right now. The professionals who join before public launch get priority placement, early access to the marketplace, and a direct line to shape how Valoria develops.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:'1px', background:GLINE, border:`1px solid ${GLINE}`, borderRadius:'14px', overflow:'hidden' }}>
              {[
                { stat:'1st access', label:'Before the public launch' },
                { stat:'Priority',   label:'Placement in search results' },
                { stat:'Founding',   label:'Cohort badge on your profile' },
                { stat:'Direct',     label:'Input into how Valoria grows' },
              ].map((b, i) => (
                <div key={i} style={{ background:CARD, padding:'28px 20px', textAlign:'center' }}>
                  <div style={{ fontSize:'22px', fontWeight:700, color:GOLD, marginBottom:'6px', letterSpacing:'-.01em' }}>{b.stat}</div>
                  <div style={{ fontSize:'12px', fontWeight:300, color:FAINT, lineHeight:1.5 }}>{b.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CtaStrip nudge={NUDGES[2]} onClick={openJoin} />

        {/* ── FINAL CALL ────────────────────────────────────────────────── */}
        <section id="join-cta" style={{ padding:'clamp(70px,9vw,120px) clamp(20px,5vw,80px)', background:MID, textAlign:'center' }}>
          <div style={{ maxWidth:'620px', margin:'0 auto' }}>
            <h2 style={{ fontSize:'clamp(28px,4vw,46px)', fontWeight:200, color:PARCH, lineHeight:1.15, marginBottom:'16px', letterSpacing:'-.02em' }}>
              Join the<br/><em style={{ fontStyle:'italic', color:GOLD }}>founding cohort.</em>
            </h2>
            <p style={{ fontSize:'14px', fontWeight:300, color:DIM, lineHeight:1.75, marginBottom:'32px' }}>
              We will hold your spot and reach out when the marketplace opens for your cohort. No spam. One email to confirm. Then we build together.
            </p>
            <button onClick={openJoin} style={{
              padding:'16px 44px', background:GOLD, color:DARK, fontSize:'12px', fontWeight:600,
              letterSpacing:'.16em', border:'none', borderRadius:'9999px', cursor:'pointer', fontFamily:'inherit',
            }}>
              JOIN THE FOUNDING COHORT →
            </button>
          </div>
        </section>

        {/* ── ALIGNMENT PRINCIPLE ──────────────────────────────────────── */}
        <section style={{ padding:'clamp(60px,8vw,100px) clamp(20px,5vw,80px)', borderTop:`1px solid ${GLINE}`, textAlign:'center' }}>
          <div style={{ maxWidth:'720px', margin:'0 auto' }}>
            <SectionIntro eyebrow="THE ALIGNMENT PRINCIPLE" />
            <p style={{ fontSize:'clamp(18px,2.5vw,28px)', fontWeight:200, fontStyle:'italic', lineHeight:1.5, color:PARCH, margin:'0 0 24px', letterSpacing:'-.01em' }}>
              When people encounter a person or institution, they place them in one of four categories. Forgotten. Used. <span style={{ color:GOLD }}>A force to align with.</span> Or one they submit to.
            </p>
            <p style={{ fontSize:'14px', fontWeight:300, color:DIM, lineHeight:1.75, maxWidth:'560px', margin:'0 auto' }}>
              Valoria Institute exists to move African professionals from category two, used and deployed as a resource without development, to category three.
              Every profile, every assessment, every programme is an act of infrastructure toward that one outcome.
            </p>
          </div>
        </section>

      </main>

      <style>{`
        @keyframes vi-pulse {
          0%  { box-shadow: 0 0 0 0 rgba(29,158,117,.55); }
          70% { box-shadow: 0 0 0 6px rgba(29,158,117,0); }
          100%{ box-shadow: 0 0 0 0 rgba(29,158,117,0); }
        }
        @keyframes vi-popup-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (max-width: 640px) {
          .wl-hero-cta { flex-direction: column !important; }
        }

        /* ── Mobile-first defaults (this is exactly what you have today) ── */
        .wl-hero-grid { max-width: 760px; margin: 0 auto; text-align: center; }
        .wl-hero-text { }
        .wl-hero-visual { display: none; }

        .wl-journey-grid { display: block; max-width: 900px; margin: 0 auto; }
        .wl-journey-tabs { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 48px; }

        .wl-side-nav { display: none; }

        /* ── Real desktop experience, 1024px and up ── */
        @media (min-width: 1024px) {
          .wl-hero-grid {
            max-width: 1160px; text-align: left;
            display: grid; grid-template-columns: 1.05fr .95fr; gap: 64px; align-items: center;
          }
          .wl-hero-cta { justify-content: flex-start; }
          .wl-hero-visual { display: flex; justify-content: center; }

          .wl-journey-grid {
            max-width: 1000px;
            display: grid; grid-template-columns: 200px 1fr; gap: 8px 48px; align-items: start;
          }
          .wl-journey-tabs {
            flex-direction: column; justify-content: flex-start; margin-bottom: 0;
            position: sticky; top: 120px;
          }
        }

        /* ── Sticky side-nav, only once there's real room beside the content ── */
        @media (min-width: 1440px) {
          .wl-side-nav {
            display: flex; flex-direction: column; gap: 18px;
            position: fixed; left: 40px; top: 50%; transform: translateY(-50%);
            z-index: 400;
          }
          .wl-side-nav-item {
            display: flex; align-items: center; gap: 10px;
            background: none; border: none; cursor: pointer; padding: 2px 0;
            font-family: inherit;
          }
          .wl-side-nav-dot {
            width: 7px; height: 7px; border-radius: 50%;
            background: rgba(247,244,238,.2);
            transition: background .25s, transform .25s;
            flex-shrink: 0;
          }
          .wl-side-nav-label {
            font-size: 11px; font-weight: 400; letter-spacing: .04em;
            color: rgba(247,244,238,.3);
            white-space: nowrap;
            opacity: 0; transform: translateX(-6px);
            transition: opacity .2s, transform .2s;
          }
          .wl-side-nav:hover .wl-side-nav-label { opacity: 1; transform: translateX(0); }
          .wl-side-nav-item.active .wl-side-nav-dot { background: #C9A84C; transform: scale(1.3); }
          .wl-side-nav-item.active .wl-side-nav-label { color: #C9A84C; opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <Footer />
    </>
  )
}
