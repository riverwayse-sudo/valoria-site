'use client'

import { useEffect, useRef, useState } from 'react'

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
  const closeRef = useRef(null)

  useEffect(() => { setInternalOpen(Boolean(open)) }, [open])

  useEffect(() => {
    if (!autoOpen) return
    const forceShow = new URLSearchParams(window.location.search).get('waitlist') === 'show'
    const submitted = localStorage.getItem(GATE_KEY) === 'submitted' || document.cookie.split('; ').some(c => c.startsWith(\`\${COOKIE_KEY}=submitted\`))
    if (submitted && !forceShow) return
    const timer = window.setTimeout(() => setInternalOpen(true), 1500)
    return () => window.clearTimeout(timer)
  }, [autoOpen])

  const isOpen = autoOpen ? internalOpen : Boolean(open) && internalOpen

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKeyDown = event => {
      if (event.key === 'Escape' && status !== 'submitting') closeModal()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, status])

  useEffect(() => {
    if (status !== 'done') return
    const timer = window.setTimeout(() => { setInternalOpen(false); onClose?.() }, CONFIRMATION_TIMEOUT)
    return () => window.clearTimeout(timer)
  }, [status, onClose])

  function closeModal() {
    setInternalOpen(false)
    onClose?.()
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!name.trim() || !email.trim() || !email.includes('@') || (eventMode && !phone.trim())) {
      setError(eventMode ? 'Enter your name, a valid email address and contact number.' : 'Enter your name and a valid email address.')
      return
    }
    setStatus('submitting')
    setError('')
    try {
      const endpoint = eventMode ? '/api/event-registration' : '/api/waitlist'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || null,
          role: role.trim() || null,
          interest: interest || null,
          type: eventMode ? 'event' : 'gate',
          source,
        }),
      })
      if (!response.ok && response.status !== 409) throw new Error('signup_failed')
      setStatus('done')
      localStorage.setItem(GATE_KEY, 'submitted')
      document.cookie = \`\${COOKIE_KEY}=submitted; path=/; max-age=31536000; SameSite=Lax\`
    } catch {
      setError('We could not complete your request. Please check your connection and try again.')
      setStatus('idle')
    }
  }

  if (!isOpen) return null

  return (
    <div className="vi-gate-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && status !== 'submitting') closeModal() }}>
      <section className={\`vi-gate-dialog\${status === 'done' ? ' is-confirmed' : ''}\`} role="dialog" aria-modal="true" aria-labelledby="vi-gate-title">
        <button ref={closeRef} className="vi-gate-close" type="button" onClick={closeModal} aria-label="Close dialog" disabled={status === 'submitting'}>×</button>

        {status === 'done' ? (
          <div className="vi-gate-confirmation">
            <div className="vi-confirmation-mark" aria-hidden="true">✓</div>
            <p className="vi-gate-kicker">VALORIA INSTITUTE · CONFIRMED</p>
            <h2 id="vi-gate-title">You’re on the list.<br/><em>We’ll take it from here.</em></h2>
            <p className="vi-confirmation-copy">{eventMode ? 'Your registration has been received. Event information and any next steps will be shared using the email address you provided.' : 'Thank you for your interest in Valoria. We have received your details and will contact you when the next relevant opportunity is available.'}</p>
            <div className="vi-confirmation-detail">
              <span>REGISTERED EMAIL</span>
              <strong>{email.trim().toLowerCase()}</strong>
            </div>
            <button className="vi-gate-secondary" type="button" onClick={closeModal}>Close confirmation</button>
            <p className="vi-confirmation-footnote">This window will close automatically in one minute.</p>
          </div>
        ) : (
          <div className="vi-gate-layout">
            <aside className="vi-gate-editorial">
              <div className="vi-gate-brand">
                <span className="vi-gate-brand-mark">V</span>
                <span>VALORIA<br/>INSTITUTE</span>
              </div>
              <div className="vi-gate-editorial-copy">
                <p className="vi-gate-kicker">{eventMode ? 'THE PROFESSIONAL STANDARD SERIES' : 'WORTH. BUILT.'}</p>
                <h2 id="vi-gate-title">{eventMode ? <>Make room for<br/><em>better thinking.</em></> : <>Capability deserves<br/><em>to be recognised.</em></>}</h2>
                <p>{eventMode
                  ? 'Register your interest and receive the information you need to take part in the Valoria session.'
                  : 'A more considered way to understand professional capability, make it visible and connect it to opportunity.'}</p>
              </div>
              <div className="vi-gate-editorial-footer">
                <span>01</span>
                <span className="vi-gate-editorial-rule"/>
                <span>{eventMode ? 'SESSION REGISTRATION' : 'EARLY ACCESS & UPDATES'}</span>
              </div>
              <div className="vi-gate-orbit" aria-hidden="true"/>
            </aside>

            <div className="vi-gate-form-panel">
              <div className="vi-gate-form-heading">
                <p className="vi-gate-kicker">{eventMode ? 'RESERVE YOUR PLACE' : 'STAY CONNECTED'}</p>
                <h3>{eventMode ? 'Register your interest.' : 'Be part of what comes next.'}</h3>
                <p>{eventMode ? 'Share your details below. We’ll use them to follow up about this session.' : 'Leave your details and we’ll contact you with relevant Valoria updates and opportunities.'}</p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="vi-gate-field">
                  <label htmlFor="vi-gate-name">Full name</label>
                  <input id="vi-gate-name" name="name" type="text" autoComplete="name" placeholder="Enter your full name" value={name} onChange={event => setName(event.target.value)} required/>
                </div>
                <div className="vi-gate-field">
                  <label htmlFor="vi-gate-email">Email address</label>
                  <input id="vi-gate-email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={event => setEmail(event.target.value)} required/>
                </div>
                {eventMode && <div className="vi-gate-field">
                  <label htmlFor="vi-gate-phone">Contact number</label>
                  <input id="vi-gate-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+234 800 000 0000" value={phone} onChange={event => setPhone(event.target.value)} required/>
                </div>}
                <div className="vi-gate-field">
                  <label htmlFor="vi-gate-role">Role or professional title <span>Optional</span></label>
                  <input id="vi-gate-role" name="role" type="text" autoComplete="organization-title" placeholder="e.g. Strategy Lead" value={role} onChange={event => setRole(event.target.value)}/>
                </div>
                <div className="vi-gate-field">
                  <label htmlFor="vi-gate-interest">I’m here as <span>Optional</span></label>
                  <select id="vi-gate-interest" name="interest" value={interest} onChange={event => setInterest(event.target.value)}>
                    <option value="">Select the closest fit</option>
                    <option value="professional">Professional / Talent</option>
                    <option value="speaker">Speaker</option>
                    <option value="facilitator">Facilitator</option>
                    <option value="employer">Employer / Recruiter</option>
                    <option value="event_planner">Event organiser</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {error && <p className="vi-gate-error" role="alert">{error}</p>}
                <button className="vi-gate-submit" type="submit" disabled={status === 'submitting'}>
                  <span>{status === 'submitting' ? 'SUBMITTING…' : eventMode ? 'COMPLETE REGISTRATION' : 'KEEP ME INFORMED'}</span>
                  <span aria-hidden="true">↗</span>
                </button>
              </form>
              <p className="vi-gate-privacy">Your details are used to respond to this request and share relevant Valoria information. We do not publish your contact details.</p>
            </div>
          </div>
        )}
      </section>

      <style>{\`
        .vi-gate-overlay{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:clamp(12px,3vw,32px);background:rgba(10,11,20,.78);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);animation:viGateFade .24s ease both}
        .vi-gate-dialog{position:relative;width:min(980px,100%);max-height:min(92dvh,860px);overflow:auto;background:#F7F4EE;color:#1A1A2E;border:1px solid rgba(201,168,76,.42);box-shadow:0 34px 110px rgba(0,0,0,.38);animation:viGateRise .38s cubic-bezier(.2,.8,.2,1) both}
        .vi-gate-layout{display:grid;grid-template-columns:minmax(0,.88fr) minmax(0,1.12fr);min-height:610px}
        .vi-gate-close{position:absolute;z-index:4;top:16px;right:16px;width:40px;height:40px;display:grid;place-items:center;border:1px solid rgba(26,26,46,.14);border-radius:50%;background:rgba(247,244,238,.9);color:#1A1A2E;font-size:25px;font-weight:300;line-height:1;cursor:pointer;transition:background .2s,border-color .2s,transform .2s}
        .vi-gate-close:hover{background:#C9A84C;border-color:#C9A84C;transform:rotate(90deg)}
        .vi-gate-close:focus-visible,.vi-gate-submit:focus-visible,.vi-gate-secondary:focus-visible{outline:3px solid rgba(201,168,76,.65);outline-offset:3px}
        .vi-gate-editorial{position:relative;isolation:isolate;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;padding:clamp(30px,4vw,54px);background:#1A1A2E;color:#FAFAF7}
        .vi-gate-editorial:before{content:"";position:absolute;inset:0;z-index:-1;background:radial-gradient(ellipse at 15% 82%,rgba(201,168,76,.13),transparent 43%),linear-gradient(155deg,rgba(46,46,74,.78),transparent 62%)}
        .vi-gate-brand{position:relative;z-index:1;display:flex;align-items:center;gap:12px;font-size:9px;font-weight:800;letter-spacing:.2em;line-height:1.55}
        .vi-gate-brand-mark{display:grid;place-items:center;width:38px;height:38px;border:1px solid rgba(201,168,76,.7);color:#C9A84C;font-family:Georgia,serif;font-size:24px;font-weight:400}
        .vi-gate-editorial-copy{position:relative;z-index:1;margin:70px 0 54px}
        .vi-gate-kicker{margin:0 0 16px;color:#9A7A35;font-size:9px;font-weight:800;letter-spacing:.2em;text-transform:uppercase}
        .vi-gate-editorial .vi-gate-kicker{color:#D4B96F}
        .vi-gate-editorial h2{max-width:470px;margin:0;color:#FAFAF7;font-family:var(--font),Arial,sans-serif;font-size:clamp(36px,4.4vw,58px);font-weight:400;line-height:1.02;letter-spacing:-.045em}
        .vi-gate-editorial h2 em{color:#C9A84C;font-family:Georgia,serif;font-weight:400}
        .vi-gate-editorial-copy>p:last-child{max-width:350px;margin:22px 0 0;color:rgba(250,250,247,.64);font-size:14px;line-height:1.8}
        .vi-gate-editorial-footer{position:relative;z-index:1;display:flex;align-items:center;gap:12px;color:rgba(250,250,247,.48);font-size:8px;font-weight:800;letter-spacing:.16em}
        .vi-gate-editorial-footer span:first-child{color:#C9A84C}
        .vi-gate-editorial-rule{width:38px;height:1px;background:rgba(201,168,76,.6)}
        .vi-gate-orbit{position:absolute;right:-180px;bottom:40px;width:360px;height:360px;border:1px solid rgba(201,168,76,.12);border-radius:50%;box-shadow:0 0 0 42px rgba(201,168,76,.025),0 0 0 84px rgba(201,168,76,.02);pointer-events:none}
        .vi-gate-form-panel{display:flex;flex-direction:column;justify-content:center;padding:clamp(34px,5vw,64px);background:#F7F4EE}
        .vi-gate-form-heading{max-width:470px;margin:0 0 26px}
        .vi-gate-form-heading h3{margin:0 0 10px;color:#1A1A2E;font-family:var(--font),Arial,sans-serif;font-size:clamp(26px,3vw,36px);font-weight:700;line-height:1.08;letter-spacing:-.035em}
        .vi-gate-form-heading>p:last-child{margin:0;color:#686879;font-size:13px;line-height:1.7}
        .vi-gate-form-panel form{display:grid;gap:15px}
        .vi-gate-field{display:grid;gap:7px}
        .vi-gate-field label{color:#414152;font-size:9px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}
        .vi-gate-field label span{margin-left:5px;color:#9292A0;font-size:9px;font-weight:500;letter-spacing:0;text-transform:none}
        .vi-gate-field input,.vi-gate-field select{box-sizing:border-box;width:100%;height:49px;padding:0 14px;border:1px solid rgba(26,26,46,.16);border-radius:2px;background:#FFFEFC;color:#1A1A2E;font:400 14px var(--font),Arial,sans-serif;transition:border-color .18s,box-shadow .18s}
        .vi-gate-field input::placeholder{color:#A0A0AA}
        .vi-gate-field input:hover,.vi-gate-field select:hover{border-color:rgba(26,26,46,.34)}
        .vi-gate-field input:focus,.vi-gate-field select:focus{outline:none;border-color:#A48235;box-shadow:0 0 0 3px rgba(201,168,76,.13)}
        .vi-gate-submit{display:flex;align-items:center;justify-content:space-between;gap:16px;width:100%;min-height:54px;margin-top:4px;padding:0 20px;border:1px solid #1A1A2E;background:#1A1A2E;color:#FAFAF7;font-size:10px;font-weight:800;letter-spacing:.15em;text-align:left;cursor:pointer;transition:background .2s,border-color .2s,transform .2s}
        .vi-gate-submit span:last-child{color:#C9A84C;font-size:19px;transition:transform .2s}
        .vi-gate-submit:hover:not(:disabled){border-color:#2E2E4A;background:#2E2E4A;transform:translateY(-1px)}
        .vi-gate-submit:hover:not(:disabled) span:last-child{transform:translate(3px,-3px)}
        .vi-gate-submit:disabled{opacity:.58;cursor:wait}
        .vi-gate-error{margin:0;padding:11px 13px;border-left:2px solid #B34F3C;background:rgba(179,79,60,.07);color:#913D30;font-size:12px;line-height:1.5}
        .vi-gate-privacy{max-width:420px;margin:16px 0 0;color:#9292A0;font-size:10px;line-height:1.6}
        .vi-gate-confirmation{max-width:650px;margin:auto;padding:clamp(34px,7vw,76px);text-align:left}
        .vi-confirmation-mark{display:grid;place-items:center;width:54px;height:54px;margin-bottom:28px;border:1px solid rgba(201,168,76,.55);border-radius:50%;background:rgba(201,168,76,.12);color:#8B702B;font-size:25px}
        .vi-gate-confirmation h2{margin:0;color:#1A1A2E;font-family:var(--font),Arial,sans-serif;font-size:clamp(34px,5vw,54px);font-weight:500;line-height:1.04;letter-spacing:-.04em}
        .vi-gate-confirmation h2 em{color:#9A7428;font-family:Georgia,serif;font-weight:400}
        .vi-confirmation-copy{max-width:520px;margin:18px 0 28px;color:#626273;font-size:14px;line-height:1.8}
        .vi-confirmation-detail{display:grid;gap:7px;padding:16px 0;border-top:1px solid rgba(26,26,46,.13);border-bottom:1px solid rgba(26,26,46,.13)}
        .vi-confirmation-detail span{color:#8B702B;font-size:8px;font-weight:800;letter-spacing:.17em}
        .vi-confirmation-detail strong{overflow-wrap:anywhere;color:#1A1A2E;font-size:14px;font-weight:600}
        .vi-gate-secondary{min-height:44px;margin-top:26px;padding:0 22px;border:1px solid #1A1A2E;background:#1A1A2E;color:#FAFAF7;font-size:9px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;cursor:pointer}
        .vi-confirmation-footnote{margin:14px 0 0;color:#9292A0;font-size:10px}
        @keyframes viGateFade{from{opacity:0}to{opacity:1}}
        @keyframes viGateRise{from{opacity:0;transform:translateY(14px) scale(.99)}to{opacity:1;transform:translateY(0) scale(1)}}
        @media(max-width:720px){.vi-gate-overlay{padding:10px;align-items:center}.vi-gate-dialog{max-height:94dvh}.vi-gate-layout{grid-template-columns:1fr;min-height:0}.vi-gate-editorial{min-height:220px;padding:26px 26px 24px}.vi-gate-brand{font-size:8px}.vi-gate-brand-mark{width:32px;height:32px;font-size:20px}.vi-gate-editorial-copy{margin:34px 0 22px}.vi-gate-editorial h2{max-width:420px;font-size:clamp(31px,8vw,43px)}.vi-gate-editorial-copy>p:last-child{max-width:460px;margin-top:12px;font-size:12px}.vi-gate-editorial-footer{font-size:7px}.vi-gate-orbit{right:-210px;bottom:-210px}.vi-gate-form-panel{padding:28px 26px 30px}.vi-gate-form-heading{margin-bottom:20px}.vi-gate-form-heading h3{font-size:27px}.vi-gate-form-panel form{gap:12px}.vi-gate-field input,.vi-gate-field select{height:46px}.vi-gate-close{top:12px;right:12px;width:35px;height:35px}}
        @media(max-width:390px){.vi-gate-editorial{min-height:196px;padding:22px 20px}.vi-gate-editorial-copy{margin:28px 0 18px}.vi-gate-form-panel{padding:24px 20px}.vi-gate-editorial h2{font-size:30px}.vi-gate-form-heading h3{font-size:24px}}
        @media(prefers-reduced-motion:reduce){.vi-gate-overlay,.vi-gate-dialog{animation:none}.vi-gate-close,.vi-gate-submit,.vi-gate-submit span:last-child{transition:none}}
      \`}</style>
    </div>
  )
}
