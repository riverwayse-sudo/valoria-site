'use client'
import { useEffect, useState } from 'react'

const GATE_KEY = 'vi_waitlist_gate_v2'
const COOKIE_KEY = 'vi_waitlist_v2'
const CONFIRMATION_TIMEOUT = 60_000

export default function WaitlistModal({ open, onClose, source = 'site_gate', autoOpen = false, eventMode = false }) {
  const [internalOpen, setInternalOpen] = useState(Boolean(open))
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('')
  const [interest, setInterest] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  useEffect(() => { setInternalOpen(Boolean(open)) }, [open])

  useEffect(() => {
    if (!autoOpen) return
    const forceShow = new URLSearchParams(window.location.search).get('waitlist') === 'show'
    const submitted = localStorage.getItem(GATE_KEY) === 'submitted' || document.cookie.split('; ').some(c => c.startsWith(`${COOKIE_KEY}=submitted`))
    if (submitted && !forceShow) return
    const timer = window.setTimeout(() => setInternalOpen(true), 1500)
    return () => window.clearTimeout(timer)
  }, [autoOpen])

  useEffect(() => {
    if (status !== 'done') return
    const timer = window.setTimeout(() => { setInternalOpen(false); onClose?.() }, CONFIRMATION_TIMEOUT)
    return () => window.clearTimeout(timer)
  }, [status, onClose])

  const isOpen = autoOpen ? internalOpen : Boolean(open) && internalOpen
  const closeModal = () => { setInternalOpen(false); onClose?.() }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || (eventMode && !phone.trim())) {
      setError(eventMode ? 'Please enter your name, email and contact number.' : 'Please enter your name and email.')
      return
    }
    setStatus('submitting')
    setError('')
    try {
      const endpoint = eventMode ? '/api/event-registration' : '/api/waitlist'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim() || null, role: role.trim() || null, interest: interest || null, type: eventMode ? 'event' : 'gate', source }),
      })
      if (!res.ok && res.status !== 409) throw new Error('signup_failed')
      setStatus('done')
      localStorage.setItem(GATE_KEY, 'submitted')
      document.cookie = `${COOKIE_KEY}=submitted; path=/; max-age=31536000`
    } catch {
      setError('Something went wrong. Please try again.')
      setStatus('idle')
    }
  }

  if (!isOpen) return null

  return <>
    <style>{`
      .vi-gate-overlay{position:fixed;inset:0;z-index:9999;background:rgba(10,10,20,.92);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);display:flex;align-items:center;justify-content:center;padding:20px;animation:gateIn .4s ease}
      @keyframes gateIn{from{opacity:0}to{opacity:1}}
      .vi-gate-card{background:#0F0F1A;border:1px solid rgba(201,168,76,.22);border-radius:16px;padding:clamp(28px,5vw,48px);max-width:560px;width:100%;position:relative;animation:gateUp .4s ease;max-height:90vh;overflow-y:auto}
      @keyframes gateUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      .vi-gate-close{position:absolute;top:18px;right:18px;background:none;border:0;color:rgba(247,244,238,.4);font-size:20px;cursor:pointer;line-height:1;padding:4px;z-index:2}.vi-gate-close:hover{color:#F7F4EE}
      .vi-gate-stripe{height:3px;border-radius:2px;margin-bottom:24px;background:#C9A84C}.vi-gate-eyebrow{font-size:9px;font-weight:700;letter-spacing:.2em;color:rgba(201,168,76,.72);text-transform:uppercase;margin-bottom:12px}.vi-gate-title{font-family:var(--font);font-size:clamp(25px,4vw,38px);font-weight:300;line-height:1.08;letter-spacing:-.025em;color:#F7F4EE;margin:0 0 13px}.vi-gate-title em{color:#C9A84C;font-style:italic}.vi-gate-sub{font-size:13px;font-weight:300;color:rgba(247,244,238,.55);line-height:1.7;margin:0 0 22px}.vi-event-meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 22px;padding:14px;border:1px solid rgba(201,168,76,.14);background:rgba(247,244,238,.025);border-radius:8px}.vi-event-meta-label{font-size:8px;font-weight:700;letter-spacing:.18em;color:rgba(201,168,76,.55);text-transform:uppercase;margin-bottom:5px}.vi-event-meta-value{font-size:12px;color:#F7F4EE;line-height:1.45}.vi-gate-field{margin-bottom:12px}.vi-gate-label{display:block;font-size:9px;font-weight:700;color:rgba(201,168,76,.5);letter-spacing:.18em;text-transform:uppercase;margin-bottom:7px}.vi-gate-input,.vi-gate-select{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(247,244,238,.1);border-radius:6px;padding:12px 14px;color:#F7F4EE;font-size:13px;font-family:var(--font);box-sizing:border-box}.vi-gate-input::placeholder{color:rgba(247,244,238,.22)}.vi-gate-input:focus,.vi-gate-select:focus{outline:none;border-color:rgba(201,168,76,.5)}.vi-gate-select option{background:#0F0F1A;color:#F7F4EE}.vi-gate-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}.vi-gate-error{font-size:12px;color:#D85A30;margin-bottom:12px;padding:10px 12px;background:rgba(216,90,48,.07);border-left:2px solid rgba(216,90,48,.5)}.vi-gate-btn{width:100%;padding:15px 24px;background:#C9A84C;color:#0F0F1A;font-size:11px;font-weight:700;letter-spacing:.14em;border:0;border-radius:9999px;cursor:pointer;font-family:var(--font);margin-top:4px}.vi-gate-btn:disabled{opacity:.5;cursor:not-allowed}
      .vi-gate-done{text-align:left;padding:2px 0 0}.vi-done-hero{position:relative;overflow:hidden;border:1px solid rgba(201,168,76,.18);border-radius:14px;padding:24px 22px 22px;margin-bottom:14px;background:radial-gradient(circle at 85% 10%,rgba(201,168,76,.16),transparent 34%),linear-gradient(145deg,rgba(201,168,76,.08),rgba(247,244,238,.02));text-align:center}.vi-done-hero:after{content:'';position:absolute;width:140px;height:140px;border:1px solid rgba(201,168,76,.1);border-radius:50%;right:-55px;top:-75px}.vi-gate-done-icon{position:relative;z-index:1;width:62px;height:62px;border-radius:50%;background:#C9A84C;color:#0F0F1A;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:25px;font-weight:700;box-shadow:0 0 0 8px rgba(201,168,76,.08)}.vi-gate-done-eyebrow{font-size:8px;font-weight:700;letter-spacing:.2em;color:rgba(201,168,76,.78);text-transform:uppercase;margin-bottom:8px}.vi-gate-done-title{font-family:var(--font);font-size:clamp(28px,5vw,42px);font-weight:300;line-height:1.02;color:#F7F4EE;letter-spacing:-.035em;margin:0 0 11px}.vi-gate-done-title em{color:#C9A84C;font-style:italic}.vi-gate-done-sub{font-size:12px;color:rgba(247,244,238,.57);line-height:1.65;margin:0 auto;max-width:430px}.vi-seat-pill{display:inline-flex;align-items:center;gap:7px;margin-top:15px;padding:7px 11px;border:1px solid rgba(201,168,76,.18);border-radius:999px;color:rgba(247,244,238,.62);font-size:8px;font-weight:700;letter-spacing:.13em;text-transform:uppercase}.vi-seat-dot{width:6px;height:6px;border-radius:50%;background:#C9A84C;box-shadow:0 0 0 4px rgba(201,168,76,.08)}
      .vi-next-label{font-size:8px;font-weight:700;letter-spacing:.18em;color:rgba(247,244,238,.34);text-transform:uppercase;margin:17px 0 9px}.vi-assessment-card{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:center;text-align:left;padding:19px 18px 18px;border:1px solid rgba(201,168,76,.3);background:#F7F4EE;border-radius:11px;margin:0 0 13px;overflow:hidden}.vi-assessment-card:before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:#C9A84C}.vi-assessment-content{min-width:0}.vi-assessment-kicker{font-size:8px;font-weight:800;letter-spacing:.17em;color:#8B702B;text-transform:uppercase;margin-bottom:7px}.vi-assessment-title{font-family:var(--font);font-size:20px;line-height:1.08;color:#1A1A2E;margin:0 0 7px;font-weight:700;letter-spacing:-.02em}.vi-assessment-copy{font-size:11px;line-height:1.58;color:rgba(26,26,46,.62);margin:0}.vi-assessment-side{width:82px;height:82px;border-radius:50%;border:1px solid rgba(201,168,76,.4);background:#EDE8DC;display:flex;flex-direction:column;align-items:center;justify-content:center;flex:none}.vi-assessment-number{font-family:var(--font);font-size:25px;line-height:1;color:#1A1A2E;font-weight:800}.vi-assessment-small{font-size:7px;font-weight:800;letter-spacing:.1em;color:#8B702B;text-transform:uppercase;margin-top:4px}.vi-assessment-clusters{display:flex;flex-wrap:wrap;gap:5px;margin-top:12px}.vi-cluster{padding:5px 7px;border:1px solid rgba(26,26,46,.1);border-radius:999px;font-size:7px;font-weight:700;letter-spacing:.08em;color:#2E2E4A;text-transform:uppercase}.vi-assessment-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:40px;margin-top:14px;padding:0 17px;border-radius:9999px;background:#1A1A2E;color:#F7F4EE;text-decoration:none;font-size:9px;font-weight:700;letter-spacing:.12em;transition:transform .2s ease,background .2s ease}.vi-assessment-btn:hover{transform:translateY(-1px);background:#2E2E4A}.vi-done-footer{display:flex;align-items:center;justify-content:space-between;gap:12px}.vi-gate-done-note{font-size:9px;color:rgba(247,244,238,.3);line-height:1.5;margin:0}.vi-gate-done-note strong{color:rgba(201,168,76,.65);font-weight:500}.vi-close-link{background:none;border:0;color:rgba(247,244,238,.5);font:inherit;font-size:9px;cursor:pointer;text-decoration:underline;text-underline-offset:3px}.vi-close-link:hover{color:#F7F4EE}
      @media(max-width:480px){.vi-gate-row,.vi-event-meta{grid-template-columns:1fr}.vi-gate-card{padding:26px 20px}.vi-assessment-card{grid-template-columns:1fr}.vi-assessment-side{display:none}.vi-assessment-btn{width:100%}.vi-done-footer{align-items:flex-start;flex-direction:column}.vi-gate-done-title{font-size:34px}}
      @media(prefers-reduced-motion:reduce){.vi-gate-overlay,.vi-gate-card{animation:none}.vi-assessment-btn{transition:none}}
    `}</style>
    <div className="vi-gate-overlay" role="dialog" aria-modal="true" aria-label={eventMode ? 'Register for Valoria event' : 'Join the Valoria waitlist'} onClick={closeModal}>
      <div className="vi-gate-card" onClick={e => e.stopPropagation()}>
        <button className="vi-gate-close" onClick={closeModal} aria-label="Close">×</button>
        <div className="vi-gate-stripe" aria-hidden="true" />
        {status === 'done' ? (
          <div className="vi-gate-done">
            <div className="vi-done-hero">
              <div className="vi-gate-done-icon" aria-hidden="true">✓</div>
              <div className="vi-gate-done-eyebrow">REGISTRATION CONFIRMED</div>
              <h2 className="vi-gate-done-title">You&apos;re in.<br/><em>Now find your edge.</em></h2>
              <p className="vi-gate-done-sub">Your place for <strong style={{color:'#F7F4EE',fontWeight:500}}>Strategic Thinking: You Are Solving the Wrong Problems</strong> is secured. There is one useful thing you can do before the session.</p>
              <div className="vi-seat-pill"><span className="vi-seat-dot"/>Seat reserved · 26 September · 10:00 WAT</div>
            </div>
            <div className="vi-next-label">MAKE YOUR REGISTRATION WORK HARDER FOR YOU</div>
            <div className="vi-assessment-card">
              <div className="vi-assessment-content">
                <div className="vi-assessment-kicker">THE VALU INDEX · 15 QUESTIONS</div>
                <h3 className="vi-assessment-title">Know exactly where you stand.</h3>
                <p className="vi-assessment-copy">Get a directional view of your capability across the five PRIME clusters — then use the result as your starting point with Valoria.</p>
                <div className="vi-assessment-clusters" aria-label="VALU PRIME clusters">
                  <span className="vi-cluster">Presence</span><span className="vi-cluster">Relationships</span><span className="vi-cluster">Intelligence</span><span className="vi-cluster">Mastery</span><span className="vi-cluster">Enterprise</span>
                </div>
                <a className="vi-assessment-btn" href="/valu">TAKE THE 15-QUESTION ASSESSMENT <span aria-hidden="true">→</span></a>
              </div>
              <div className="vi-assessment-side" aria-hidden="true"><span className="vi-assessment-number">15</span><span className="vi-assessment-small">questions</span></div>
            </div>
            <div className="vi-done-footer">
              <p className="vi-gate-done-note">Confirmation closes automatically in <strong>1 minute</strong>.</p>
              <button className="vi-close-link" onClick={closeModal}>Close confirmation</button>
            </div>
          </div>
        ) : eventMode ? (
          <>
            <div className="vi-gate-eyebrow">THE PROFESSIONAL STANDARD SERIES · SESSION 02</div>
            <h2 className="vi-gate-title">Strategic thinking.<br/><em>Choose better problems.</em></h2>
            <p className="vi-gate-sub">You may be solving problems efficiently. The harder question is whether you are solving the problems that matter. Join Valoria Institute for a focused conversation on strategic thinking, trade-offs and better problem selection.</p>
            <div className="vi-event-meta"><div><div className="vi-event-meta-label">Date</div><div className="vi-event-meta-value">Saturday, 26 September 2026</div></div><div><div className="vi-event-meta-label">Time</div><div className="vi-event-meta-value">10:00–11:30 AM WAT</div></div><div><div className="vi-event-meta-label">Speaker</div><div className="vi-event-meta-value">Temi Adetokunbo</div></div><div><div className="vi-event-meta-label">Cluster</div><div className="vi-event-meta-value">INTELLIGENCE</div></div></div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="vi-gate-row"><div className="vi-gate-field"><label className="vi-gate-label" htmlFor="gate-name">Full Name</label><input id="gate-name" className="vi-gate-input" type="text" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} required/></div><div className="vi-gate-field"><label className="vi-gate-label" htmlFor="gate-email">Email Address</label><input id="gate-email" className="vi-gate-input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required/></div></div>
              <div className="vi-gate-row"><div className="vi-gate-field"><label className="vi-gate-label" htmlFor="gate-phone">Contact Number</label><input id="gate-phone" className="vi-gate-input" type="tel" inputMode="tel" autoComplete="tel" placeholder="+234 801 234 5678" value={phone} onChange={e=>setPhone(e.target.value)} required/></div><div className="vi-gate-field"><label className="vi-gate-label" htmlFor="gate-role">Your Role / Title</label><input id="gate-role" className="vi-gate-input" type="text" placeholder="e.g. Head of People" value={role} onChange={e=>setRole(e.target.value)}/></div></div>
              <div className="vi-gate-field"><label className="vi-gate-label" htmlFor="gate-interest">I am a...</label><select id="gate-interest" className="vi-gate-select" value={interest} onChange={e=>setInterest(e.target.value)}><option value="">Select one</option><option value="professional">Professional / Talent</option><option value="speaker">Speaker / Facilitator</option><option value="employer">Employer / Recruiter</option><option value="event_planner">Event Planner / Organiser</option><option value="other">Other</option></select></div>
              {error && <div className="vi-gate-error">{error}</div>}<button type="submit" className="vi-gate-btn" disabled={status==='submitting'}>{status==='submitting'?'REGISTERING...':'RESERVE MY PLACE →'}</button>
            </form>
          </>
        ) : (
          <><div className="vi-gate-eyebrow">FOUNDING COHORT · NOW OPEN</div><h2 className="vi-gate-title">Be first when<br/>the <em>marketplace opens.</em></h2><p className="vi-gate-sub">We&apos;re building the marketplace for assessed African professionals. Join the list and we&apos;ll reach out when it&apos;s ready for you.</p><form onSubmit={handleSubmit} noValidate><div className="vi-gate-row"><div className="vi-gate-field"><label className="vi-gate-label" htmlFor="gate-name">Full Name</label><input id="gate-name" className="vi-gate-input" value={name} onChange={e=>setName(e.target.value)} required/></div><div className="vi-gate-field"><label className="vi-gate-label" htmlFor="gate-email">Email Address</label><input id="gate-email" className="vi-gate-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div></div><div className="vi-gate-row"><div className="vi-gate-field"><label className="vi-gate-label" htmlFor="gate-role">Your Role / Title</label><input id="gate-role" className="vi-gate-input" value={role} onChange={e=>setRole(e.target.value)}/></div><div className="vi-gate-field"><label className="vi-gate-label" htmlFor="vi-interest">I am a...</label><select id="vi-interest" className="vi-gate-select" value={interest} onChange={e=>setInterest(e.target.value)}><option value="">Select one</option><option value="professional">Professional / Talent</option><option value="speaker">Speaker / Facilitator</option><option value="employer">Employer / Recruiter</option><option value="other">Other</option></select></div></div>{error && <div className="vi-gate-error">{error}</div>}<button type="submit" className="vi-gate-btn" disabled={status==='submitting'}>{status==='submitting'?'JOINING...':'JOIN THE LIST →'}</button></form></>
        )}
      </div>
    </div>
  </>
}
