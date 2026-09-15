'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { PROFESSIONAL_STANDARD_SERIES, getSessionState } from '@/lib/professionalStandardSeries'

function Countdown({ target, label, live = false }) {
  const [now, setNow] = useState(null)

  useEffect(() => {
    setNow(Date.now())
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const totalSeconds = target && now !== null ? Math.max(0, Math.floor((target - now) / 1000)) : null
  const days = totalSeconds === null ? '--' : Math.floor(totalSeconds / 86400)
  const hours = totalSeconds === null ? '--' : Math.floor((totalSeconds % 86400) / 3600)
  const minutes = totalSeconds === null ? '--' : Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds === null ? '--' : totalSeconds % 60

  return (
    <div className={`event-modal-countdown ${live ? 'is-live' : ''}`} aria-live="polite">
      <div className="event-modal-countdown-heading">
        <span className="event-modal-countdown-dot" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <div className="event-modal-countdown-units">
        {[[days, 'DAYS'], [hours, 'HRS'], [minutes, 'MIN'], [seconds, 'SEC']].map(([value, unit]) => (
          <div className="event-modal-countdown-unit" key={unit}>
            <strong>{typeof value === 'number' ? String(value).padStart(2, '0') : value}</strong>
            <span>{unit}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function EventRegistrationModal({ session, onClose }) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ full_name: '', email: '', role: '', organisation: '', whatsapp: '', consent: false })
  const modalRef = useRef(null)
  const firstInputRef = useRef(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const frame = window.requestAnimationFrame(() => firstInputRef.current?.focus())

    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !modalRef.current) return
      const focusable = modalRef.current.querySelectorAll('button:not([disabled]), input, a[href]')
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  const sessionDate = useMemo(() => new Intl.DateTimeFormat('en-NG', {
    timeZone: 'Africa/Lagos', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  }).format(new Date(session.start)), [session.start])

  const sessionTime = useMemo(() => new Intl.DateTimeFormat('en-NG', {
    timeZone: 'Africa/Lagos', hour: 'numeric', minute: '2-digit', hour12: true
  }).format(new Date(session.start)), [session.start])

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))

  async function submit(event) {
    event.preventDefault()
    if (!form.consent) return
    setStatus('submitting')
    setError('')
    try {
      const response = await fetch('/api/session-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, session_id: session.id })
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Registration could not be completed.')
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(err.message || 'Something went wrong. Please try again.')
    }
  }

  const state = getSessionState(session)
  const isLive = state === 'live'
  const isEnded = state === 'ended'
  const target = isLive ? new Date(session.end).getTime() : new Date(session.start).getTime()

  return (
    <>
      <style>{`
        .event-modal-backdrop{position:fixed;inset:0;z-index:2000;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(7,7,15,.82);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);animation:eventModalBackdropIn .32s ease both}
        .event-modal{position:relative;width:min(920px,100%);max-height:min(92vh,900px);overflow:auto;display:grid;grid-template-columns:minmax(280px,.86fr) minmax(360px,1.14fr);background:#F7F4EE;color:#1A1A2E;border:1px solid rgba(201,168,76,.5);box-shadow:0 36px 120px rgba(0,0,0,.5);animation:eventModalIn .52s cubic-bezier(.16,1,.3,1) both;isolation:isolate}
        .event-modal:before{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(135deg,rgba(201,168,76,.07),transparent 35%);z-index:-1}
        .event-modal-event-panel{position:relative;display:flex;flex-direction:column;justify-content:space-between;min-height:100%;padding:clamp(28px,4vw,46px);background:#1A1A2E;color:#F7F4EE;overflow:hidden}
        .event-modal-event-panel:after{content:'';position:absolute;width:320px;height:320px;border:1px solid rgba(201,168,76,.15);border-radius:50%;right:-190px;bottom:-150px;box-shadow:0 0 0 70px rgba(201,168,76,.025),0 0 0 140px rgba(201,168,76,.018);pointer-events:none}
        .event-modal-panel-content{position:relative;z-index:1}
        .event-modal-kicker{font-size:9px;font-weight:800;letter-spacing:.2em;color:rgba(201,168,76,.8);text-transform:uppercase;margin-bottom:22px}
        .event-modal-session-no{display:flex;align-items:center;gap:9px;font-size:9px;font-weight:800;letter-spacing:.16em;color:rgba(247,244,238,.42);text-transform:uppercase;margin-bottom:18px}
        .event-modal-session-no:before{content:'';width:24px;height:1px;background:rgba(201,168,76,.6)}
        .event-modal-event-panel h2{font-family:var(--font);font-size:clamp(30px,4vw,48px);font-weight:300;line-height:1.06;letter-spacing:-.025em;margin:0 0 20px;color:var(--parchment)}
        .event-modal-event-panel h2 em{font-style:italic;color:var(--gold);font-weight:300}
        .event-modal-description{font-size:13px;font-weight:300;line-height:1.75;color:rgba(247,244,238,.56);margin:0;max-width:430px}
        .event-modal-event-meta{display:grid;gap:11px;margin-top:28px;padding-top:22px;border-top:1px solid rgba(201,168,76,.14)}
        .event-modal-event-meta-row{display:flex;gap:11px;align-items:flex-start;font-size:11px;line-height:1.5;color:rgba(247,244,238,.6)}
        .event-modal-event-meta-row strong{font-weight:700;color:rgba(247,244,238,.86)}
        .event-modal-event-meta-row span:first-child{width:58px;flex-shrink:0;color:rgba(201,168,76,.55);font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;padding-top:2px}
        .event-modal-speaker{margin-top:28px;font-size:10px;font-weight:700;letter-spacing:.14em;color:rgba(247,244,238,.36);text-transform:uppercase}
        .event-modal-speaker strong{display:block;margin-top:6px;color:var(--gold);font-size:13px;letter-spacing:.04em}
        .event-modal-countdown{margin-top:30px;padding:16px 0 0;border-top:1px solid rgba(201,168,76,.14)}
        .event-modal-countdown-heading{display:flex;align-items:center;gap:7px;font-size:8px;font-weight:800;letter-spacing:.2em;color:rgba(201,168,76,.7);text-transform:uppercase;margin-bottom:12px}
        .event-modal-countdown-dot{width:5px;height:5px;border-radius:50%;background:var(--gold);box-shadow:0 0 0 4px rgba(201,168,76,.1);animation:eventCountdownPulse 1.8s ease-in-out infinite}
        .event-modal-countdown-units{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
        .event-modal-countdown-unit{padding:9px 4px;background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.12);text-align:center}
        .event-modal-countdown-unit strong{display:block;font-family:var(--font);font-size:clamp(20px,2.4vw,29px);font-weight:300;line-height:1;color:var(--parchment);font-variant-numeric:tabular-nums;letter-spacing:-.03em}
        .event-modal-countdown-unit span{display:block;margin-top:5px;font-size:7px;font-weight:800;letter-spacing:.12em;color:rgba(247,244,238,.3)}
        .event-modal-countdown.is-live .event-modal-countdown-dot{animation:eventLivePulse 1s ease-in-out infinite}
        .event-modal-countdown.is-live .event-modal-countdown-heading{color:#8ed0a2}
        .event-modal-form-panel{position:relative;padding:clamp(30px,4vw,50px);background:#F7F4EE}
        .event-modal-close{position:absolute;z-index:3;top:16px;right:16px;width:38px;height:38px;border:1px solid rgba(247,244,238,.18);background:rgba(26,26,46,.7);color:#F7F4EE;font-size:21px;line-height:1;cursor:pointer;display:grid;place-items:center;transition:background .2s ease,border-color .2s ease,transform .2s ease}
        .event-modal-close:hover{background:#C9A84C;border-color:#C9A84C;color:#1A1A2E;transform:rotate(4deg)}
        .event-modal-form-kicker{font-size:9px;font-weight:800;letter-spacing:.18em;color:#9A7428;text-transform:uppercase;margin-bottom:10px}
        .event-modal-form-title{font-family:var(--font);font-size:clamp(27px,3vw,38px);font-weight:400;line-height:1.08;letter-spacing:-.02em;margin:0 42px 8px;color:#1A1A2E}
        .event-modal-form-intro{font-size:13px;line-height:1.65;color:#626273;margin:0 0 24px;max-width:480px}
        .event-modal form{display:grid;gap:15px}
        .event-modal-field-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .event-modal-field{display:block;font-size:9px;font-weight:800;letter-spacing:.11em;text-transform:uppercase;color:#414152}
        .event-modal-field span{display:inline;font-weight:500;text-transform:none;letter-spacing:0;color:#777789}
        .event-modal input:not([type=checkbox]){display:block;width:100%;box-sizing:border-box;margin-top:7px;height:50px;padding:0 14px;border:1px solid rgba(26,26,46,.18);border-radius:2px;background:#fff;color:#1A1A2E;font:400 15px var(--font);outline:none;transition:border-color .2s ease,box-shadow .2s ease,transform .2s ease}
        .event-modal input:not([type=checkbox]):hover{border-color:rgba(26,26,46,.32)}
        .event-modal input:not([type=checkbox]):focus{border-color:#9A7428;box-shadow:0 0 0 3px rgba(201,168,76,.12);transform:translateY(-1px)}
        .event-modal input:not([type=checkbox])::placeholder{color:#9a9aa7}
        .event-consent{display:flex;align-items:flex-start;gap:10px;padding:13px 14px;border:1px solid rgba(26,26,46,.1);background:rgba(255,255,255,.48);font-size:10px;font-weight:500;line-height:1.55;color:#5f5f6e;cursor:pointer;text-transform:none;letter-spacing:0}
        .event-consent input{width:16px;height:16px;flex:0 0 16px;margin:1px 0 0;accent-color:#C9A84C}
        .event-submit{width:100%;min-height:54px;border:1px solid #1A1A2E;background:#1A1A2E;color:#F7F4EE;padding:0 18px;border-radius:2px;font:800 10px var(--font);letter-spacing:.15em;cursor:pointer;margin-top:2px;transition:transform .2s ease,background .2s ease,color .2s ease,box-shadow .2s ease}
        .event-submit:hover:not(:disabled){background:#C9A84C;color:#1A1A2E;transform:translateY(-2px);box-shadow:0 10px 24px rgba(26,26,46,.14)}
        .event-submit:disabled{opacity:.6;cursor:wait}
        .event-form-note{font-size:10px;line-height:1.6;color:#777789;margin:0}
        .event-form-error{margin:0;padding:11px 12px;border-left:2px solid #9A3030;background:rgba(154,48,48,.06);color:#8d3030;font-size:12px;line-height:1.5}
        .event-success{text-align:center;display:flex;flex-direction:column;justify-content:center;min-height:420px;padding:20px 0}
        .event-success-mark{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;margin:0 auto 20px;background:#1A1A2E;color:#C9A84C;font-size:28px;animation:eventSuccessIn .5s cubic-bezier(.16,1,.3,1) both}
        .event-success h3{font-family:var(--font);font-size:36px;font-weight:400;margin:0 0 12px;color:#1A1A2E}
        .event-success p{font-size:14px;line-height:1.7;color:#4b4b5b;max-width:400px;margin:0 auto 26px}
        @keyframes eventModalBackdropIn{from{opacity:0}to{opacity:1}}
        @keyframes eventModalIn{from{opacity:0;transform:translateY(24px) scale(.97)}60%{opacity:1;transform:translateY(-3px) scale(1.005)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes eventCountdownPulse{0%,100%{opacity:.45;transform:scale(.9)}50%{opacity:1;transform:scale(1)}}
        @keyframes eventLivePulse{0%,100%{box-shadow:0 0 0 3px rgba(142,208,162,.08)}50%{box-shadow:0 0 0 6px rgba(142,208,162,.14)}}
        @keyframes eventSuccessIn{from{opacity:0;transform:scale(.75) rotate(-8deg)}to{opacity:1;transform:scale(1) rotate(0)}}
        @media(max-width:720px){.event-modal{display:block;max-height:94vh}.event-modal-event-panel{min-height:auto;padding:28px 24px 24px}.event-modal-event-panel h2{font-size:34px}.event-modal-description{font-size:12px}.event-modal-event-meta{margin-top:20px}.event-modal-speaker{margin-top:20px}.event-modal-countdown{margin-top:22px}.event-modal-form-panel{padding:28px 24px 30px}.event-modal-form-title{font-size:30px}.event-modal-field-grid{grid-template-columns:1fr}.event-modal-close{background:#1A1A2E}.event-modal form{gap:13px}}
        @media(max-width:430px){.event-modal-backdrop{padding:0}.event-modal{width:100%;max-height:100dvh;border:none}.event-modal-event-panel{padding-top:24px}.event-modal-event-panel h2{font-size:31px}.event-modal-form-panel{padding:25px 20px 28px}.event-modal-countdown-unit{padding:8px 2px}.event-modal-countdown-unit strong{font-size:19px}}
        @media(prefers-reduced-motion:reduce){.event-modal-backdrop,.event-modal,.event-success-mark,.event-modal-countdown-dot{animation:none!important}.event-modal-close,.event-modal input:not([type=checkbox]),.event-submit{transition:none}.event-modal input:not([type=checkbox]):focus{transform:none}.event-submit:hover:not(:disabled){transform:none}}
      `}</style>
      <div className="event-modal-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
        <div className="event-modal" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="event-modal-title" aria-describedby="event-modal-description">
          <button className="event-modal-close" type="button" onClick={onClose} aria-label="Close registration form">×</button>
          <section className="event-modal-event-panel">
            <div className="event-modal-panel-content">
              <div className="event-modal-kicker">THE PROFESSIONAL STANDARD SERIES</div>
              <div className="event-modal-session-no">SESSION {session.id} · {session.cluster}</div>
              <h2 id="event-modal-title">{session.title}</h2>
              <p id="event-modal-description" className="event-modal-description">{session.description}</p>
              <div className="event-modal-event-meta">
                <div className="event-modal-event-meta-row"><span>WHEN</span><div><strong>{sessionDate}</strong><br/>{sessionTime} WAT</div></div>
                <div className="event-modal-event-meta-row"><span>FORMAT</span><div><strong>Virtual conversation</strong><br/>90 minutes</div></div>
              </div>
              {session.speaker && <div className="event-modal-speaker">Featuring<strong>{session.speaker}</strong></div>}
            </div>
            {!isEnded && <Countdown target={target} label={isLive ? 'SESSION ENDS IN' : 'SESSION STARTS IN'} live={isLive} />}
          </section>

          <section className="event-modal-form-panel">
            {status === 'success' ? <div className="event-success"><div className="event-success-mark">✓</div><h3>You are registered.</h3><p>Your place for <strong>{session.title}</strong> has been recorded. A confirmation will be sent to your email with the event details.</p><button type="button" className="event-submit" onClick={onClose}>DONE</button></div> : (
              <>
                <div className="event-modal-form-kicker">Reserve your place</div>
                <h3 className="event-modal-form-title">Be in the room.</h3>
                <p className="event-modal-form-intro">Register once and we will send the essential information you need before the conversation begins.</p>
                <form onSubmit={submit} noValidate>
                  <div className="event-modal-field-grid">
                    <label className="event-modal-field">Full name<input ref={firstInputRef} required autoComplete="name" value={form.full_name} onChange={event => update('full_name', event.target.value)} placeholder="Your full name" /></label>
                    <label className="event-modal-field">Email address<input required type="email" autoComplete="email" value={form.email} onChange={event => update('email', event.target.value)} placeholder="you@example.com" /></label>
                  </div>
                  <div className="event-modal-field-grid">
                    <label className="event-modal-field">WhatsApp number <span>(optional)</span><input type="tel" autoComplete="tel" value={form.whatsapp} onChange={event => update('whatsapp', event.target.value)} placeholder="+234 …" /></label>
                    <label className="event-modal-field">Role / professional title<input autoComplete="organization-title" value={form.role} onChange={event => update('role', event.target.value)} placeholder="e.g. Strategy Lead" /></label>
                  </div>
                  <label className="event-modal-field">Organisation <span>(optional)</span><input autoComplete="organization" value={form.organisation} onChange={event => update('organisation', event.target.value)} placeholder="Company or organisation" /></label>
                  <label className="event-consent"><input type="checkbox" required checked={form.consent} onChange={event => update('consent', event.target.checked)} /><span>I agree to receive essential event information and relevant Valoria communications by email.</span></label>
                  {error && <p className="event-form-error" role="alert">{error}</p>}
                  <button className="event-submit" type="submit" disabled={status === 'submitting'}>{status === 'submitting' ? 'SECURING YOUR PLACE…' : 'CONFIRM MY REGISTRATION →'}</button>
                  <p className="event-form-note">Your details are securely submitted through Valoria and synchronised with Brevo for event communication.</p>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </>
  )
}

export function SessionTimer({ session }) {
  const [now, setNow] = useState(null)
  useEffect(() => { setNow(Date.now()); const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer) }, [])
  if (now === null) return <div className="session-timer session-timer-open"><Countdown target={null} label="COUNTDOWN" /></div>
  const state = getSessionState(session, now), index = PROFESSIONAL_STANDARD_SERIES.findIndex(item => item.id === session.id), previous = index > 0 ? PROFESSIONAL_STANDARD_SERIES[index - 1] : null
  const target = state === 'locked' && previous ? new Date(previous.end).getTime() : state === 'registration-open' ? new Date(session.start).getTime() : state === 'live' ? new Date(session.end).getTime() : null
  if (state === 'coming-soon') return <div className="session-timer session-timer-open"><span>COMING SOON · DATE TO BE CONFIRMED</span></div>
  if (state === 'ended') return <div className="session-timer session-timer-ended">SESSION ENDED</div>
  if (state === 'live') return <div className="session-timer session-timer-live">● LIVE NOW <Countdown target={target} label="ENDS IN" live /></div>
  return <div className={`session-timer ${state === 'locked' ? 'session-timer-locked' : 'session-timer-open'}`}><Countdown target={target} label={state === 'locked' ? 'REGISTRATION OPENS IN' : 'SESSION STARTS IN'} /></div>
}
