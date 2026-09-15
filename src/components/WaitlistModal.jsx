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
    setStatus('submitting'); setError('')
    try {
      const endpoint = eventMode ? '/api/event-registration' : '/api/waitlist'
      const res = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
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
      .vi-gate-card{background:#0F0F1A;border:1px solid rgba(201,168,76,.22);border-radius:16px;padding:clamp(28px,5vw,48px);max-width:540px;width:100%;position:relative;animation:gateUp .4s ease;max-height:90vh;overflow-y:auto}
      @keyframes gateUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      .vi-gate-close{position:absolute;top:18px;right:18px;background:none;border:0;color:rgba(247,244,238,.4);font-size:20px;cursor:pointer;line-height:1;padding:4px}
      .vi-gate-stripe{height:3px;border-radius:2px;margin-bottom:24px;background:#C9A84C}.vi-gate-eyebrow{font-size:9px;font-weight:700;letter-spacing:.2em;color:rgba(201,168,76,.72);text-transform:uppercase;margin-bottom:12px}.vi-gate-title{font-family:var(--font);font-size:clamp(25px,4vw,38px);font-weight:300;line-height:1.08;letter-spacing:-.025em;color:#F7F4EE;margin:0 0 13px}.vi-gate-title em{color:#C9A84C;font-style:italic}.vi-gate-sub{font-size:13px;font-weight:300;color:rgba(247,244,238,.55);line-height:1.7;margin:0 0 22px}.vi-event-meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 22px;padding:14px;border:1px solid rgba(201,168,76,.14);background:rgba(247,244,238,.025);border-radius:8px}.vi-event-meta-label{font-size:8px;font-weight:700;letter-spacing:.18em;color:rgba(201,168,76,.55);text-transform:uppercase;margin-bottom:5px}.vi-event-meta-value{font-size:12px;color:#F7F4EE;line-height:1.45}.vi-gate-field{margin-bottom:12px}.vi-gate-label{display:block;font-size:9px;font-weight:700;color:rgba(201,168,76,.5);letter-spacing:.18em;text-transform:uppercase;margin-bottom:7px}.vi-gate-input,.vi-gate-select{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(247,244,238,.1);border-radius:6px;padding:12px 14px;color:#F7F4EE;font-size:13px;font-family:var(--font);box-sizing:border-box}.vi-gate-input::placeholder{color:rgba(247,244,238,.22)}.vi-gate-input:focus,.vi-gate-select:focus{outline:none;border-color:rgba(201,168,76,.5)}.vi-gate-select option{background:#0F0F1A;color:#F7F4EE}.vi-gate-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}.vi-gate-error{font-size:12px;color:#D85A30;margin-bottom:12px;padding:10px 12px;background:rgba(216,90,48,.07);border-left:2px solid rgba(216,90,48,.5)}.vi-gate-btn{width:100%;padding:15px 24px;background:#C9A84C;color:#0F0F1A;font-size:11px;font-weight:700;letter-spacing:.14em;border:0;border-radius:9999px;cursor:pointer;font-family:var(--font);margin-top:4px}.vi-gate-btn:disabled{opacity:.5;cursor:not-allowed}
      .vi-gate-done{text-align:center;padding:4px 0 2px}.vi-gate-done-icon{width:68px;height:68px;border-radius:50%;background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.42);display:flex;align-items:center;justify-content:center;margin:0 auto 18px;font-size:28px;color:#C9A84C;box-shadow:0 0 0 10px rgba(201,168,76,.035)}.vi-gate-done-eyebrow{font-size:9px;font-weight:700;letter-spacing:.2em;color:rgba(201,168,76,.7);text-transform:uppercase;margin-bottom:9px}.vi-gate-done-title{font-family:var(--font);font-size:clamp(28px,5vw,40px);font-weight:300;line-height:1.05;color:#F7F4EE;letter-spacing:-.03em;margin-bottom:12px}.vi-gate-done-title em{color:#C9A84C;font-style:italic}.vi-gate-done-sub{font-size:13px;color:rgba(247,244,238,.56);line-height:1.7;margin:0 auto 22px;max-width:420px}.vi-assessment-card{position:relative;text-align:left;padding:18px 18px 16px;border:1px solid rgba(201,168,76,.22);background:linear-gradient(135deg,rgba(201,168,76,.09),rgba(247,244,238,.025));border-radius:10px;margin:0 0 16px;overflow:hidden}.vi-assessment-card:before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:#C9A84C}.vi-assessment-kicker{font-size:8px;font-weight:700;letter-spacing:.18em;color:#C9A84C;text-transform:uppercase;margin-bottom:7px}.vi-assessment-title{font-family:var(--font);font-size:17px;color:#F7F4EE;margin:0 0 6px;font-weight:500}.vi-assessment-copy{font-size:11px;line-height:1.6;color:rgba(247,244,238,.5);margin:0 0 13px}.vi-assessment-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:42px;padding:0 18px;border-radius:9999px;background:#C9A84C;color:#0F0F1A;text-decoration:none;font-size:10px;font-weight:700;letter-spacing:.12em;transition:transform .2s ease,background .2s ease}.vi-assessment-btn:hover{transform:translateY(-1px);background:#D4B65D}.vi-gate-done-note{font-size:10px;color:rgba(247,244,238,.3);line-height:1.5;margin:0}.vi-gate-done-note strong{color:rgba(201,168,76,.65);font-weight:500}
      @media(max-width:480px){.vi-gate-row,.vi-event-meta{grid-template-columns:1fr}.vi-gate-card{padding:26px 20px}.vi-assessment-btn{width:100%}}
    `}</style>
    <div className="vi-gate-overlay" role="dialog" aria-modal="true" aria-label={eventMode ? 'Register for Valoria event' : 'Join the Valoria waitlist'} onClick={closeModal}>
      <div className="vi-gate-card" onClick={e => e.stopPropagation()}>
        <button className="vi-gate-close" onClick={closeModal} aria-label="Close">×</button>
        <div className="vi-gate-stripe" aria-hidden="true" />
        {status === 'done' ? <div className="vi-gate-done">
          <div className="vi-gate-done-icon" aria-hidden="true">✓</div>
          <div className="vi-gate-done-eyebrow">REGISTRATION CONFIRMED</div>
          <div className="vi-gate-done-title">You&apos;re in.<br/><em>Now discover where you stand.</em></div>
          <p className="vi-gate-done-sub">Your place for <strong style={{color:'#F7F4EE',fontWeight:400}}>Strategic Thinking: You Are Solving the Wrong Problems</strong> is reserved. Before the session, take the VALU assessment and get a directional view of your professional capability.</p>
          <div className="vi-assessment-card">
            <div className="vi-assessment-kicker">YOUR NEXT STEP · VALU</div>
            <h3 className="vi-assessment-title">Find your professional starting point.</h3>
            <p className="vi-assessment-copy">Begin with the 15-question directional assessment across Presence, Relationships, Intelligence, Mastery and Enterprise.</p>
            <a className="vi-assessment-btn" href="/valu">TAKE THE VALU ASSESSMENT <span aria-hidden="true">→</span></a>
          </div>
          <p className="vi-gate-done-note">This confirmation closes automatically in <strong>1 minute</strong>. You can also close it now.</p>
        </div> : eventMode ? <>
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
        </> : <><div className="vi-gate-eyebrow">FOUNDING COHORT · NOW OPEN</div><h2 className="vi-gate-title">Be first when<br/>the <em>marketplace opens.</em></h2><p className="vi-gate-sub">We&apos;re building the marketplace for assessed African professionals. Join the list and we&apos;ll reach out when it&apos;s ready for you.</p><form onSubmit={handleSubmit}><div className="vi-gate-row"><div className="vi-gate-field"><label className="vi-gate-label" htmlFor="gate-name">Full Name</label><input id="gate-name" className="vi-gate-input" value={name} onChange={e=>setName(e.target.value)} required/></div><div className="vi-gate-field"><label className="vi-gate-label" htmlFor="gate-email">Email Address</label><input id="gate-email" className="vi-gate-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div></div><div className="vi-gate-row"><div className="vi-gate-field"><label className="vi-gate-label" htmlFor="gate-role">Your Role / Title</label><input id="gate-role" className="vi-gate-input" value={role} onChange={e=>setRole(e.target.value)}/></div><div className="vi-gate-field"><label className="vi-gate-label" htmlFor="vi-interest">I am a...</label><select id="vi-interest" className="vi-gate-select" value={interest} onChange={e=>setInterest(e.target.value)}><option value="">Select one</option><option value="professional">Professional / Talent</option><option value="speaker">Speaker / Facilitator</option><option value="employer">Employer / Recruiter</option><option value="event_planner">Event Planner / Organiser</option><option value="other">Other</option></select></div></div><button type="submit" className="vi-gate-btn">JOIN THE FOUNDING COHORT →</button></form></>}
      </div>
    </div>
  </>
}
