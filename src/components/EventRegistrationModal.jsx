'use client'

import { useEffect, useMemo, useState } from 'react'
import { PROFESSIONAL_STANDARD_SERIES, getSessionState } from '@/lib/professionalStandardSeries'

function Countdown({ target, label }) {
  const [now, setNow] = useState(null)
  useEffect(() => { setNow(Date.now()); const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer) }, [])
  if (!target || now === null) return <div className="event-countdown" aria-live="polite"><span className="event-countdown-label">{label || 'COUNTDOWN'}</span><div className="event-countdown-units"><div className="event-countdown-unit"><strong>--</strong><span>DAYS</span></div><div className="event-countdown-unit"><strong>--</strong><span>HRS</span></div><div className="event-countdown-unit"><strong>--</strong><span>MIN</span></div><div className="event-countdown-unit"><strong>--</strong><span>SEC</span></div></div></div>
  const totalSeconds = Math.floor(Math.max(0, target - now) / 1000)
  const days = Math.floor(totalSeconds / 86400), hours = Math.floor((totalSeconds % 86400) / 3600), minutes = Math.floor((totalSeconds % 3600) / 60), seconds = totalSeconds % 60
  return <div className="event-countdown" aria-live="polite">{label && <span className="event-countdown-label">{label}</span>}<div className="event-countdown-units">{[[days, 'DAYS'], [hours, 'HRS'], [minutes, 'MIN'], [seconds, 'SEC']].map(([value, unit]) => <div className="event-countdown-unit" key={unit}><strong>{String(value).padStart(2, '0')}</strong><span>{unit}</span></div>)}</div></div>
}

const FORM_STYLES = `
.event-form-ui{background:#FAFAF7;color:#1A1A2E;border:1px solid rgba(26,26,46,.14);border-radius:8px;padding:clamp(24px,4vw,38px);box-shadow:0 20px 60px rgba(8,8,15,.18)}
.event-form-ui .event-modal-close{position:absolute;top:18px;right:18px;width:36px;height:36px;border:1px solid rgba(26,26,46,.12);border-radius:50%;background:#fff;color:#1A1A2E;font-size:20px;line-height:1;cursor:pointer}
.event-form-ui .event-modal-kicker{font-size:9px;font-weight:800;letter-spacing:.16em;color:#8f6c25;text-transform:uppercase;margin-bottom:12px;padding-right:42px}
.event-form-ui h2{font-family:var(--font);font-size:clamp(27px,4vw,38px);font-weight:400;line-height:1.08;letter-spacing:-.02em;margin:0 0 10px;color:#1A1A2E}.event-form-ui h2 em{font-style:italic;color:#8f6c25}.event-form-ui .event-modal-meta{font-size:12px;line-height:1.6;color:rgba(26,26,46,.52);margin:0 0 26px}
.event-form-ui form{display:flex;flex-direction:column;gap:16px}.event-form-ui .event-form-two{display:grid;grid-template-columns:1fr 1fr;gap:14px}.event-form-ui label{display:flex;flex-direction:column;gap:7px;font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:rgba(26,26,46,.58)}.event-form-ui label span{font-weight:500;letter-spacing:0;text-transform:none;color:rgba(26,26,46,.35)}
.event-form-ui input:not([type=checkbox]){width:100%;min-height:48px;padding:12px 13px;border:1px solid rgba(26,26,46,.16);border-radius:5px;background:#fff;color:#1A1A2E;font:400 14px var(--font);box-sizing:border-box;outline:none;transition:border-color .2s,box-shadow .2s}.event-form-ui input:not([type=checkbox])::placeholder{color:rgba(26,26,46,.28)}.event-form-ui input:not([type=checkbox]):focus{border-color:#C9A84C;box-shadow:0 0 0 3px rgba(201,168,76,.12)}
.event-form-ui .event-consent{display:grid;grid-template-columns:18px 1fr;gap:10px;align-items:start;padding:12px 0 2px;font-size:11px;line-height:1.55;font-weight:400;letter-spacing:0;text-transform:none;color:rgba(26,26,46,.50)}.event-form-ui .event-consent input{width:16px;height:16px;margin:1px 0;accent-color:#C9A84C}.event-form-ui .event-form-error{margin:0;padding:10px 12px;border-left:2px solid #D85A30;background:rgba(216,90,48,.06);font-size:12px;color:#A64224}.event-form-ui .event-submit{width:100%;min-height:52px;border:1px solid #C9A84C;border-radius:5px;background:#C9A84C;color:#1A1A2E;font:800 10px var(--font);letter-spacing:.13em;cursor:pointer;transition:transform .2s,box-shadow .2s}.event-form-ui .event-submit:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 22px rgba(26,26,46,.12)}.event-form-ui .event-submit:disabled{opacity:.5;cursor:not-allowed}.event-form-ui .event-form-note{font-size:10px;line-height:1.6;color:rgba(26,26,46,.38);margin:0}.event-form-ui .event-success{text-align:center;padding:30px 4px 6px}.event-form-ui .event-success-mark{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;margin:0 auto 18px;background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.35);color:#8f6c25;font-weight:800}.event-form-ui .event-success h3{font-family:var(--font);font-size:28px;font-weight:400;margin:0 0 8px}.event-form-ui .event-success p{font-size:13px;line-height:1.7;color:rgba(26,26,46,.52);margin:0 0 22px}.event-form-ui .event-success .event-submit{max-width:180px}
@media(max-width:600px){.event-form-ui{padding:24px 18px}.event-form-ui .event-form-two{grid-template-columns:1fr}.event-form-ui .event-modal-kicker{padding-right:38px}}
`

export default function EventRegistrationModal({ session, onClose }) {
  const [status, setStatus] = useState('idle'), [error, setError] = useState('')
  const [form, setForm] = useState({ full_name: '', email: '', role: '', organisation: '', whatsapp: '', consent: false })
  useEffect(() => { const onKeyDown = e => { if (e.key === 'Escape') onClose() }; document.addEventListener('keydown', onKeyDown); document.body.style.overflow = 'hidden'; return () => { document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = '' } }, [onClose])
  const sessionDate = useMemo(() => new Intl.DateTimeFormat('en-NG', { timeZone: 'Africa/Lagos', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(session.start)), [session.start])
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))
  async function submit(event) {
    event.preventDefault(); setStatus('submitting'); setError('')
    try {
      const response = await fetch('/api/session-registration', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, session_id: session.id }) })
      const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || 'Registration could not be completed.')
      setStatus('success')
    } catch (err) { setStatus('error'); setError(err.message || 'Something went wrong. Please try again.') }
  }
  return <div className="event-modal-backdrop" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <style>{FORM_STYLES}</style>
    <div className="event-modal event-form-ui" role="dialog" aria-modal="true" aria-labelledby="event-modal-title">
      <button className="event-modal-close" type="button" onClick={onClose} aria-label="Close registration form">×</button>
      <div className="event-modal-kicker">THE PROFESSIONAL STANDARD SERIES · SESSION {session.id}</div>
      <h2 id="event-modal-title">Register for <em>{session.title}</em></h2>
      <p className="event-modal-meta">{sessionDate} · 10:00 AM WAT · Virtual · 90 minutes</p>
      {status === 'success' ? <div className="event-success"><div className="event-success-mark">✓</div><h3>You are registered.</h3><p>Your registration is confirmed. Valoria will send the session details and event communications to your email.</p><button type="button" className="event-submit" onClick={onClose}>DONE</button></div> : <form onSubmit={submit}>
        <div className="event-form-two"><label>Full name *<input required autoComplete="name" placeholder="Your full name" value={form.full_name} onChange={e => update('full_name', e.target.value)} /></label><label>Email address *<input required type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} /></label></div>
        <div className="event-form-two"><label>WhatsApp number <span>optional</span><input type="tel" autoComplete="tel" placeholder="+234 …" value={form.whatsapp} onChange={e => update('whatsapp', e.target.value)} /></label><label>Role / professional title<input placeholder="Your current role" value={form.role} onChange={e => update('role', e.target.value)} /></label></div>
        <label>Organisation <span>optional</span><input autoComplete="organization" placeholder="Company or organisation" value={form.organisation} onChange={e => update('organisation', e.target.value)} /></label>
        <label className="event-consent"><input type="checkbox" required checked={form.consent} onChange={e => update('consent', e.target.checked)} /><span>I agree to receive essential event information and relevant Valoria communications by email.</span></label>
        {error && <p className="event-form-error" role="alert">{error}</p>}
        <button className="event-submit" type="submit" disabled={status === 'submitting'}>{status === 'submitting' ? 'SUBMITTING…' : 'CONFIRM REGISTRATION'} <span>→</span></button>
        <p className="event-form-note">Your registration is securely submitted through the Valoria website and synchronised with Brevo for event communication.</p>
      </form>}
    </div>
  </div>
}

export function SessionTimer({ session }) {
  const [now, setNow] = useState(null)
  useEffect(() => { setNow(Date.now()); const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer) }, [])
  if (now === null) return <div className="session-timer session-timer-open"><Countdown target={null} label="COUNTDOWN" /></div>
  const state = getSessionState(session, now), index = PROFESSIONAL_STANDARD_SERIES.findIndex(item => item.id === session.id), previous = index > 0 ? PROFESSIONAL_STANDARD_SERIES[index - 1] : null
  const target = state === 'locked' && previous ? new Date(previous.end).getTime() : state === 'registration-open' ? new Date(session.start).getTime() : state === 'live' ? new Date(session.end).getTime() : null
  if (state === 'coming-soon') return <div className="session-timer session-timer-open"><span>COMING SOON · DATE TO BE CONFIRMED</span></div>
  if (state === 'ended') return <div className="session-timer session-timer-ended">SESSION ENDED</div>
  if (state === 'live') return <div className="session-timer session-timer-live">● LIVE NOW <Countdown target={target} label="ENDS IN" /></div>
  return <div className={`session-timer ${state === 'locked' ? 'session-timer-locked' : 'session-timer-open'}`}><Countdown target={target} label={state === 'locked' ? 'REGISTRATION OPENS IN' : 'SESSION STARTS IN'} /></div>
}
