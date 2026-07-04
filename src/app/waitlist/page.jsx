'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

// ─── brand ───────────────────────────────────────────────────────────────────
const GOLD    = '#C9A84C'
const DARK    = '#0F0F1A'
const MID     = '#1A1A2E'
const PARCH   = '#F7F4EE'
const DIM     = 'rgba(247,244,238,.55)'
const FAINT   = 'rgba(247,244,238,.25)'
const GLINE   = 'rgba(201,168,76,.12)'
const GLINE2  = 'rgba(201,168,76,.28)'

const GATE_KEY   = 'vi_waitlist_gate_v2'
const COOKIE_KEY = 'vi_waitlist_v2'

// ─── Copy data ───────────────────────────────────────────────────────────────
const PAIN_POINTS = [
  { icon: '👔', headline: 'You applied for the job.', body: 'Someone with half your experience got it. Why? Because they knew the hiring manager.' },
  { icon: '🎤', headline: 'You should be on that stage.', body: "The same three speakers keep getting booked — not because they're the best, but because the organiser only has five contacts." },
  { icon: '📋', headline: "You've done the work.", body: 'But the training contract went to the big-name consultant everyone already knows. Your track record stayed invisible.' },
]

const HOW_IT_WORKS = [
  { num: '01', color: '#378ADD', title: 'Take the VALU Index', body: 'A 25-minute assessment that measures your professional capability across five dimensions. Not a quiz. An independent standard.' },
  { num: '02', color: GOLD,       title: 'Your profile goes live', body: 'Once assessed, your profile appears in our marketplace with your score, skills, and ATB ID. Buyers can find you. You stay in control.' },
  { num: '03', color: '#1D9E75', title: 'Valoria makes the introduction', body: 'Interested employers and organisers submit a request. We review it. Only then do we connect you — never the other way around.' },
]

const FOR_WHO = [
  { color: '#378ADD', tag: 'CANDIDATE', title: 'You want the right job.', body: "You're a professional looking for your next role, contract, or opportunity. You want employers to find you based on what you can do — not who you know." },
  { color: GOLD,       tag: 'SPEAKER',   title: 'You want to be booked.', body: 'You speak, train, or present. You want event organisers to discover you, verify your capability, and book you without three layers of referral.' },
  { color: '#1D9E75', tag: 'EMPLOYER',   title: 'You want the right person.', body: "You hire, organise events, or commission training. You're tired of the same recycled names. You want to find the genuinely best person — assessed, verified, ready." },
]

const SUCCESS_TRACKS = [
  { color:'#378ADD', label:'ATB CONNECT',   desc:'Employers find pre-assessed candidates by score, strength, and sector.' },
  { color: GOLD,      label:'ATB SPOTLIGHT', desc:'Event planners discover and book speakers whose capability is verified.' },
  { color:'#1D9E75', label:'ATB DEVELOP',   desc:'L&D leaders commission PRIME-certified facilitators with an assessed track record.' },
]

// ─── component ───────────────────────────────────────────────────────────────
export default function WaitlistPage() {
  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [role,      setRole]      = useState('')
  const [interest,  setInterest]  = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const formRef = useRef(null)

  const valid = name.trim().length > 1 && email.includes('@') && email.includes('.')

  async function handleSubmit() {
    if (!valid || loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: name.trim(),
          email:     email.trim().toLowerCase(),
          role:      role.trim() || null,
          interest:  interest || null,
          type:      'standalone',
          source:    'waitlist_page',
        }),
      })
      if (!res.ok && res.status !== 409) throw new Error('failed')
      // Set access cookie + localStorage
      localStorage.setItem(GATE_KEY, 'submitted')
      document.cookie = `${COOKIE_KEY}=submitted; path=/; max-age=31536000`
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Nav />
      <main style={{ background: DARK, color: PARCH, fontFamily: "var(--font,'Raleway','Helvetica Neue',Arial,sans-serif)", overflow: 'hidden' }}>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section style={{ padding: 'clamp(80px,10vw,140px) clamp(20px,5vw,80px) clamp(60px,8vw,100px)', borderBottom: `1px solid ${GLINE}`, position: 'relative', overflow: 'hidden' }}>
          {/* Background glow */}
          <div style={{ position:'absolute', top:'-20%', right:'-10%', width:'600px', height:'600px', borderRadius:'50%', background:`radial-gradient(circle, rgba(201,168,76,.1) 0%, transparent 70%)`, pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'-10%', left:'-5%', width:'400px', height:'400px', borderRadius:'50%', background:`radial-gradient(circle, rgba(55,138,221,.07) 0%, transparent 70%)`, pointerEvents:'none' }} />

          <div style={{ maxWidth:'760px', margin:'0 auto', textAlign:'center', position:'relative' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', marginBottom:'28px', padding:'7px 16px', border:`1px solid ${GLINE2}`, background:'rgba(201,168,76,.06)' }}>
              <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#1D9E75', animation:'vi-pulse 2s infinite' }} />
              <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.18em', color:GOLD }}>FOUNDING COHORT — NOW OPEN</span>
            </div>

            <h1 style={{ fontSize:'clamp(36px,6vw,72px)', fontWeight:200, lineHeight:1.0, letterSpacing:'-.03em', marginBottom:'24px', color:PARCH }}>
              The best person<br/>for the job keeps<br/>losing to the<br/>
              <em style={{ fontStyle:'italic', color:GOLD, fontWeight:300 }}>most connected one.</em>
            </h1>
            <p style={{ fontSize:'clamp(16px,2vw,20px)', fontWeight:300, color:DIM, lineHeight:1.75, maxWidth:'560px', margin:'0 auto 40px' }}>
              Valoria is where African professionals get assessed, verified, and put in front of the people who actually hire, book, and commission — based on what they can do, not who they know.
            </p>
            <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={() => formRef.current?.scrollIntoView({ behavior:'smooth' })}
                style={{ padding:'16px 36px', background:GOLD, color:DARK, fontSize:'12px', fontWeight:700, letterSpacing:'.14em', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                JOIN THE WAITLIST →
              </button>
              <Link href="/atb-connect?preview=vi2025" style={{ padding:'16px 36px', border:`1px solid ${GLINE2}`, color:PARCH, fontSize:'12px', fontWeight:700, letterSpacing:'.14em', textDecoration:'none' }}>
                SEE HOW IT WORKS
              </Link>
            </div>
          </div>
        </section>

        {/* ── THE PROBLEM ──────────────────────────────────────────────── */}
        <section style={{ padding:'clamp(60px,8vw,100px) clamp(20px,5vw,80px)', borderBottom:`1px solid ${GLINE}` }}>
          <div style={{ maxWidth:'900px', margin:'0 auto' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
              <div style={{ height:'1px', width:'32px', background:GLINE2 }} />
              <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.2em', color:'rgba(201,168,76,.5)' }}>THE PROBLEM</span>
            </div>
            <h2 style={{ fontSize:'clamp(28px,4vw,52px)', fontWeight:200, lineHeight:1.1, letterSpacing:'-.02em', marginBottom:'16px' }}>
              You already know<br/><em style={{ fontStyle:'italic', color:GOLD }}>this feeling.</em>
            </h2>
            <p style={{ fontSize:'clamp(15px,1.8vw,18px)', fontWeight:300, color:DIM, lineHeight:1.8, maxWidth:'640px', marginBottom:'56px' }}>
              Somewhere out there, a person less qualified than you just got the job, the stage, or the contract.
              Not because they were better. Because they were <strong style={{ color:PARCH, fontWeight:500 }}>more visible</strong> to the right person at the right moment.
            </p>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px,1fr))', gap:'1px', background:GLINE }}>
              {PAIN_POINTS.map((p, i) => (
                <div key={i} style={{ background:DARK, padding:'32px 28px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'16px' }}>{p.icon}</div>
                  <div style={{ fontSize:'15px', fontWeight:600, color:PARCH, marginBottom:'10px', lineHeight:1.3 }}>{p.headline}</div>
                  <p style={{ fontSize:'13px', fontWeight:300, color:DIM, lineHeight:1.75, margin:0 }}>{p.body}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop:'48px', padding:'28px 32px', background:'rgba(201,168,76,.04)', border:`1px solid ${GLINE2}` }}>
              <p style={{ fontSize:'clamp(18px,2.5vw,26px)', fontWeight:200, lineHeight:1.5, color:PARCH, textAlign:'center', margin:0, letterSpacing:'-.01em' }}>
                Across Africa, the talent is not the problem.<br/>
                <em style={{ fontStyle:'italic', color:GOLD }}>The system that surfaces it is.</em>
              </p>
            </div>
          </div>
        </section>

        {/* ── THE SOLUTION ─────────────────────────────────────────────── */}
        <section style={{ padding:'clamp(60px,8vw,100px) clamp(20px,5vw,80px)', borderBottom:`1px solid ${GLINE}`, background:MID }}>
          <div style={{ maxWidth:'900px', margin:'0 auto' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
              <div style={{ height:'1px', width:'32px', background:GLINE2 }} />
              <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.2em', color:'rgba(201,168,76,.5)' }}>THE SOLUTION</span>
            </div>
            <h2 style={{ fontSize:'clamp(28px,4vw,52px)', fontWeight:200, lineHeight:1.1, letterSpacing:'-.02em', marginBottom:'20px' }}>
              What if your work could<br/><em style={{ fontStyle:'italic', color:GOLD }}>speak for itself?</em>
            </h2>
            <p style={{ fontSize:'clamp(15px,1.8vw,18px)', fontWeight:300, color:DIM, lineHeight:1.8, maxWidth:'640px', marginBottom:'16px' }}>
              Valoria Institute is a professional marketplace for Africa. But before anyone can list on it, they go through one thing: the VALU Index.
            </p>
            <p style={{ fontSize:'clamp(15px,1.8vw,18px)', fontWeight:300, color:DIM, lineHeight:1.8, maxWidth:'640px', marginBottom:'56px' }}>
              The VALU Index is an independent assessment that measures your actual professional capability — not your job title, not your degree, not who vouched for you.
              It produces a score. A profile. A verified identity that any employer, organiser, or training buyer can trust.
            </p>

            {/* PRIME dimensions */}
            <div style={{ marginBottom:'48px' }}>
              <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.18em', color:'rgba(201,168,76,.45)', marginBottom:'20px' }}>THE VALU INDEX MEASURES FIVE THINGS</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {[
                  { letter:'P', color:'#1D9E75', name:'Presence',     desc:'How you show up — your visibility, credibility, and professional confidence.' },
                  { letter:'R', color:'#378ADD', name:'Resolve',       desc:'How you handle pressure, setbacks, and difficult decisions.' },
                  { letter:'I', color:'#7F77DD', name:'Intelligence',  desc:'How you think — your strategic thinking, problem-solving, and learning speed.' },
                  { letter:'M', color:'#BA7517', name:'Mastery',       desc:'How good you are at your actual work — depth of expertise and craft.' },
                  { letter:'E', color:'#D85A30', name:'Expression',    desc:'How well you communicate — written, verbal, and interpersonal.' },
                ].map(d => (
                  <div key={d.letter} style={{ display:'flex', alignItems:'center', gap:'20px', padding:'14px 20px', border:`1px solid ${GLINE}`, background:'rgba(255,255,255,.02)' }}>
                    <div style={{ width:'36px', height:'36px', borderRadius:'50%', border:`2px solid ${d.color}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:700, color:d.color, flexShrink:0 }}>{d.letter}</div>
                    <div>
                      <div style={{ fontSize:'13px', fontWeight:700, color:d.color, marginBottom:'3px', letterSpacing:'.04em' }}>{d.name}</div>
                      <div style={{ fontSize:'12px', fontWeight:300, color:DIM, lineHeight:1.6 }}>{d.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding:'28px 32px', background:'rgba(201,168,76,.04)', border:`1px solid ${GLINE2}` }}>
              <p style={{ fontSize:'clamp(15px,2vw,20px)', fontWeight:200, lineHeight:1.6, color:PARCH, margin:'0 0 8px' }}>
                Think of it like this: imagine if every professional had a verified report card that showed exactly how capable they are.
              </p>
              <p style={{ fontSize:'14px', fontWeight:300, color:DIM, lineHeight:1.7, margin:0 }}>
                That's what Valoria does. One score. Five dimensions. An identity that follows you across every opportunity on the platform.
              </p>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
        <section style={{ padding:'clamp(60px,8vw,100px) clamp(20px,5vw,80px)', borderBottom:`1px solid ${GLINE}` }}>
          <div style={{ maxWidth:'900px', margin:'0 auto' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
              <div style={{ height:'1px', width:'32px', background:GLINE2 }} />
              <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.2em', color:'rgba(201,168,76,.5)' }}>HOW IT WORKS</span>
            </div>
            <h2 style={{ fontSize:'clamp(28px,4vw,52px)', fontWeight:200, lineHeight:1.1, letterSpacing:'-.02em', marginBottom:'48px' }}>
              Three steps.<br/><em style={{ fontStyle:'italic', color:GOLD }}>One clean system.</em>
            </h2>

            <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
              {HOW_IT_WORKS.map((h, i) => (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'60px 4px 1fr', gap:'0 24px', alignItems:'stretch' }}>
                  {/* Number */}
                  <div style={{ display:'flex', alignItems:'flex-start', paddingTop:'28px', justifyContent:'flex-end' }}>
                    <span style={{ fontFamily:'var(--font,Raleway,sans-serif)', fontSize:'11px', fontWeight:700, letterSpacing:'.1em', color:h.color }}>{h.num}</span>
                  </div>
                  {/* Line */}
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                    <div style={{ width:'4px', height:'28px', background: i === 0 ? 'transparent' : GLINE }} />
                    <div style={{ width:'14px', height:'14px', borderRadius:'50%', border:`2px solid ${h.color}`, background:DARK, flexShrink:0 }} />
                    <div style={{ flex:1, width:'2px', background: i === HOW_IT_WORKS.length-1 ? 'transparent' : GLINE }} />
                  </div>
                  {/* Content */}
                  <div style={{ padding:'20px 0 32px' }}>
                    <div style={{ fontSize:'16px', fontWeight:600, color:PARCH, marginBottom:'8px' }}>{h.title}</div>
                    <p style={{ fontSize:'14px', fontWeight:300, color:DIM, lineHeight:1.75, margin:0, maxWidth:'560px' }}>{h.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHO IT'S FOR ─────────────────────────────────────────────── */}
        <section style={{ padding:'clamp(60px,8vw,100px) clamp(20px,5vw,80px)', borderBottom:`1px solid ${GLINE}`, background:MID }}>
          <div style={{ maxWidth:'900px', margin:'0 auto' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
              <div style={{ height:'1px', width:'32px', background:GLINE2 }} />
              <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.2em', color:'rgba(201,168,76,.5)' }}>WHO IT'S FOR</span>
            </div>
            <h2 style={{ fontSize:'clamp(28px,4vw,52px)', fontWeight:200, lineHeight:1.1, letterSpacing:'-.02em', marginBottom:'48px' }}>
              If any of these<br/><em style={{ fontStyle:'italic', color:GOLD }}>sound like you.</em>
            </h2>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px,1fr))', gap:'16px', marginBottom:'48px' }}>
              {FOR_WHO.map((f, i) => (
                <div key={i} style={{ padding:'28px', border:`1px solid ${GLINE}`, background:'rgba(255,255,255,.02)', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:f.color }} />
                  <div style={{ display:'inline-block', padding:'4px 12px', border:`1px solid ${f.color}`, fontSize:'10px', fontWeight:700, letterSpacing:'.14em', color:f.color, marginBottom:'16px' }}>{f.tag}</div>
                  <div style={{ fontSize:'18px', fontWeight:600, color:PARCH, lineHeight:1.3, marginBottom:'12px' }}>{f.title}</div>
                  <p style={{ fontSize:'13px', fontWeight:300, color:DIM, lineHeight:1.75, margin:0 }}>{f.body}</p>
                </div>
              ))}
            </div>

            {/* Three entry points */}
            <div style={{ padding:'32px', border:`1px solid ${GLINE2}`, background:'rgba(201,168,76,.04)' }}>
              <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.18em', color:'rgba(201,168,76,.5)', marginBottom:'20px' }}>THREE ENTRY POINTS INTO THE MARKETPLACE</div>
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

        {/* ── THE FOUNDING COHORT ──────────────────────────────────────── */}
        <section style={{ padding:'clamp(60px,8vw,100px) clamp(20px,5vw,80px)', borderBottom:`1px solid ${GLINE}` }}>
          <div style={{ maxWidth:'900px', margin:'0 auto', textAlign:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px', justifyContent:'center' }}>
              <div style={{ height:'1px', width:'32px', background:GLINE2 }} />
              <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.2em', color:'rgba(201,168,76,.5)' }}>THE FOUNDING COHORT</span>
              <div style={{ height:'1px', width:'32px', background:GLINE2 }} />
            </div>
            <h2 style={{ fontSize:'clamp(28px,4vw,52px)', fontWeight:200, lineHeight:1.1, letterSpacing:'-.02em', marginBottom:'20px' }}>
              The people who join first<br/><em style={{ fontStyle:'italic', color:GOLD }}>matter most.</em>
            </h2>
            <p style={{ fontSize:'clamp(15px,1.8vw,18px)', fontWeight:300, color:DIM, lineHeight:1.8, maxWidth:'580px', margin:'0 auto 40px' }}>
              We're building the founding cohort right now. The professionals who join before public launch get priority placement, early access to the marketplace, and a direct line to shape how Valoria develops.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:'1px', background:GLINE, marginBottom:'0', border:`1px solid ${GLINE}` }}>
              {[
                { stat:'1st access', label:'Before the public launch' },
                { stat:'Priority',   label:'Placement in search results' },
                { stat:'Founding',   label:'Cohort badge on your profile' },
                { stat:'Direct',     label:'Input into how Valoria grows' },
              ].map((b, i) => (
                <div key={i} style={{ background:DARK, padding:'28px 20px', textAlign:'center' }}>
                  <div style={{ fontSize:'22px', fontWeight:700, color:GOLD, marginBottom:'6px', letterSpacing:'-.01em' }}>{b.stat}</div>
                  <div style={{ fontSize:'12px', fontWeight:300, color:FAINT, lineHeight:1.5 }}>{b.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── THE FORM ─────────────────────────────────────────────────── */}
        <section ref={formRef} id="join" style={{ padding:'clamp(60px,8vw,100px) clamp(20px,5vw,80px)', background:MID }}>
          <div style={{ maxWidth:'560px', margin:'0 auto' }}>

            {submitted ? (
              /* ── SUCCESS STATE ── */
              <div>
                <div style={{ display:'flex', justifyContent:'center', marginBottom:'24px' }}>
                  <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:'rgba(29,158,117,.12)', border:'1px solid rgba(29,158,117,.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l5 5L20 7" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <h2 style={{ fontSize:'clamp(28px,4vw,44px)', fontWeight:200, color:PARCH, textAlign:'center', lineHeight:1.1, marginBottom:'12px', letterSpacing:'-.02em' }}>
                  You're on the list.
                </h2>
                <p style={{ fontSize:'14px', fontWeight:300, color:DIM, textAlign:'center', lineHeight:1.75, marginBottom:'40px' }}>
                  Something is being built that Africa has never had before.
                </p>
                <div style={{ borderTop:`1px solid ${GLINE}`, paddingTop:'32px' }}>
                  {[
                    { label:'THE PROBLEM', body:'Every day, exceptional African professionals are passed over — not because they lack capability, but because no one can prove it. The same names circulate. The same networks win. Everyone else waits.' },
                    { label:'THE SHIFT',   body:'Valoria changes the question employers and organisers ask. Not "who do I already know?" — but "who is genuinely the best for this?" One assessed standard. No guesswork. No gatekeeping.' },
                    { label:"WHAT'S COMING", body:'A marketplace where every profile is verified by the VALU Index. Where employers search by capability, not connection. Where speakers get booked on merit. Where facilitators earn trust before they walk into the room.' },
                  ].map((s, i) => (
                    <div key={i} style={{ marginBottom:'28px', paddingBottom:'28px', borderBottom:`1px solid ${GLINE}` }}>
                      <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'.2em', color:'rgba(201,168,76,.45)', marginBottom:'10px' }}>{s.label}</div>
                      <p style={{ fontSize:'14px', fontWeight:300, color:DIM, lineHeight:1.8, margin:0 }}>{s.body}</p>
                    </div>
                  ))}

                  <div style={{ marginBottom:'28px' }}>
                    <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'.2em', color:'rgba(201,168,76,.45)', marginBottom:'16px' }}>THREE WAYS IN</div>
                    {SUCCESS_TRACKS.map((t, i) => (
                      <div key={i} style={{ display:'flex', gap:'12px', marginBottom:'14px', alignItems:'flex-start' }}>
                        <div style={{ width:'3px', background:t.color, flexShrink:0, alignSelf:'stretch', borderRadius:'2px', minHeight:'32px' }} />
                        <div>
                          <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.14em', color:t.color, marginBottom:'3px' }}>{t.label}</div>
                          <div style={{ fontSize:'12px', color:FAINT, lineHeight:1.6 }}>{t.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop:`1px solid ${GLINE}`, paddingTop:'20px', textAlign:'center' }}>
                    <p style={{ fontSize:'14px', fontWeight:200, color:FAINT, lineHeight:1.8, fontStyle:'italic', marginBottom:'8px' }}>You're early. That matters more than you think.</p>
                    <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.18em', color:'rgba(201,168,76,.5)' }}>WE'LL BE IN TOUCH.</span>
                  </div>
                </div>
              </div>
            ) : (
              /* ── FORM ── */
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
                  <div style={{ height:'1px', width:'32px', background:GLINE2 }} />
                  <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.2em', color:'rgba(201,168,76,.5)' }}>SECURE YOUR SPOT</span>
                </div>
                <h2 style={{ fontSize:'clamp(28px,4vw,44px)', fontWeight:200, color:PARCH, lineHeight:1.1, letterSpacing:'-.02em', marginBottom:'12px' }}>
                  Join the<br/><em style={{ fontStyle:'italic', color:GOLD }}>founding cohort.</em>
                </h2>
                <p style={{ fontSize:'14px', fontWeight:300, color:DIM, lineHeight:1.75, marginBottom:'40px' }}>
                  We'll hold your spot and reach out when the marketplace opens for your cohort. No spam. One email to confirm. Then we build together.
                </p>

                <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                  {/* Full name */}
                  <label style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.16em', color:'rgba(201,168,76,.5)', marginBottom:'6px' }}>FULL NAME *</label>
                  <input
                    style={S.input}
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="name"
                  />

                  {/* Email */}
                  <label style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.16em', color:'rgba(201,168,76,.5)', margin:'16px 0 6px' }}>EMAIL ADDRESS *</label>
                  <input
                    style={S.input}
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                  />

                  {/* Role */}
                  <label style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.16em', color:'rgba(201,168,76,.5)', margin:'16px 0 6px' }}>YOUR ROLE / TITLE</label>
                  <input
                    style={S.input}
                    type="text"
                    placeholder="e.g. Head of Growth, Speaker, L&D Manager"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                  />

                  {/* Interest */}
                  <label style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.16em', color:'rgba(201,168,76,.5)', margin:'16px 0 6px' }}>I AM JOINING AS A...</label>
                  <select style={{ ...S.input, color: interest ? PARCH : DIM }} value={interest} onChange={e => setInterest(e.target.value)}>
                    <option value="" style={{ color:'#888' }}>Select one</option>
                    <option value="professional">Professional / Candidate</option>
                    <option value="speaker">Speaker</option>
                    <option value="facilitator">Facilitator / Trainer</option>
                    <option value="employer">Employer / Recruiter</option>
                    <option value="event_planner">Event Planner / Organiser</option>
                    <option value="other">Other</option>
                  </select>

                  {error && (
                    <div style={{ marginTop:'12px', padding:'12px 16px', background:'rgba(216,90,48,.08)', border:'1px solid rgba(216,90,48,.3)', fontSize:'13px', color:'#D85A30' }}>
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={!valid || loading}
                    style={{ marginTop:'24px', padding:'18px', background: valid && !loading ? GOLD : 'rgba(201,168,76,.2)', color: valid && !loading ? DARK : 'rgba(201,168,76,.4)', fontSize:'12px', fontWeight:700, letterSpacing:'.14em', border:'none', cursor: valid && !loading ? 'pointer' : 'not-allowed', fontFamily:'inherit', width:'100%' }}>
                    {loading ? 'JOINING…' : 'JOIN THE FOUNDING COHORT →'}
                  </button>

                  <p style={{ fontSize:'11px', fontWeight:300, color:FAINT, textAlign:'center', lineHeight:1.6, marginTop:'16px' }}>
                    No spam. We'll confirm your spot and reach out when the marketplace opens. You can unsubscribe any time. Read our{' '}
                    <Link href="/privacypolicy" style={{ color:'rgba(201,168,76,.55)', textDecoration:'none' }}>Privacy Policy</Link>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── ALIGNMENT PRINCIPLE ──────────────────────────────────────── */}
        <section style={{ padding:'clamp(60px,8vw,100px) clamp(20px,5vw,80px)', borderTop:`1px solid ${GLINE}`, textAlign:'center' }}>
          <div style={{ maxWidth:'720px', margin:'0 auto' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px', justifyContent:'center' }}>
              <div style={{ height:'1px', width:'32px', background:GLINE2 }} />
              <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.2em', color:'rgba(201,168,76,.5)' }}>THE ALIGNMENT PRINCIPLE</span>
              <div style={{ height:'1px', width:'32px', background:GLINE2 }} />
            </div>
            <blockquote style={{ fontSize:'clamp(18px,2.5vw,28px)', fontWeight:200, fontStyle:'italic', lineHeight:1.5, color:PARCH, margin:'0 0 24px', letterSpacing:'-.01em' }}>
              "When people encounter a person or institution, they place them in one of four categories. Forgotten. Used. <span style={{ color:GOLD }}>A force to align with.</span> Or one they submit to."
            </blockquote>
            <p style={{ fontSize:'14px', fontWeight:300, color:DIM, lineHeight:1.75, maxWidth:'560px', margin:'0 auto' }}>
              Valoria Institute exists to move African professionals from category two — used, deployed as a resource without development — to category three.
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
        select option { background: #1A1A2E; color: #F7F4EE; }
        @media (max-width: 640px) {
          .wl-hero-cta { flex-direction: column !important; }
        }
      `}</style>
      <Footer />
    </>
  )
}

const S = {
  input: {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(201,168,76,.2)',
    color: '#F7F4EE',
    fontSize: '14px',
    fontFamily: "var(--font,'Raleway','Helvetica Neue',Arial,sans-serif)",
    outline: 'none',
    boxSizing: 'border-box',
    WebkitAppearance: 'none',
  }
}
