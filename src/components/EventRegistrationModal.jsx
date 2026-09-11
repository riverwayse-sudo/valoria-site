'use client'

import { useEffect, useMemo, useState } from 'react'
import { PROFESSIONAL_STANDARD_SERIES, getSessionState } from '@/lib/professionalStandardSeries'

function Countdown({ target, label }) {
  const [now, setNow] = useState(null)

  useEffect(() => {
    setNow(Date.now())
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  if (!target || now === null) {
    return <div className="event-countdown" aria-live="polite"><span className="event-countdown-label">{label || 'COUNTDOWN'}</span><div className="event-countdown-units"><div className="event-countdown-unit"><strong>--</strong><span>DAYS</span></div><div className="event-countdown-unit"><strong>--</strong><span>HRS</span></div><div className="event-countdown-unit"><strong>--</strong><span>MIN</span></div><div className="event-countdown-unit"><strong>--</strong><span>SEC</span></div></div></div>
  }

  const remaining = Math.max(0, target - now)
  const totalSeconds = Math.floor(remaining / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return (
    <div className="event-countdown" aria-live="polite">
      {label && <span className="event-countdown-label">{label}</span>}
      <div className="event-countdown-units">
        {[[days, 'DAYS'], [hours, 'HRS'], [minutes, 'MIN'], [seconds, 'SEC']].map(([value, unit]) => (
          <div className="event-countdown-unit" key={unit}>
            <strong>{String(value).padStart(2, '0')}</strong>
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
  const [form, setForm] = useState({ full_name: '', email: '', role: '', organisation: '' })

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const sessionDate = useMemo(() => new Intl.DateTimeFormat('en-NG', {
    timeZone: 'Africa/Lagos', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).format(new Date(session.start)), [session.start])

  async function submit(event) {
    event.preventDefault()
    setStatus('submitting')
    setError('')
    try {
      const response = await fetch('/api/session-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, session_id: session.id }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Registration could not be completed.')
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(err.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="event-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="event-modal" role="dialog" aria-modal="true" aria-labelledby="event-modal-title">
        <button className="event-modal-close" type="button" onClick={onClose} aria-label="Close registration form">×</button>
        <div className="event-modal-kicker">THE PROFESSIONAL STANDARD SERIES · SESSION {session.id}</div>
        <h2 id="event-modal-title">Register for <em>{session.title}</em></h2>
        <p className="event-modal-meta">{sessionDate} · 10:00 AM WAT · Virtual · 90 minutes</p>

        {status === 'success' ? (
          <div className="event-success">
            <div className="event-success-mark">✓</div>
            <h3>You are registered.</h3>
            <p>We have received your registration for Session {session.id}. Further session access details will be sent to your email.</p>
            <button type="button" className="event-submit" onClick={onClose}>DONE</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label>Full name<input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></label>
            <label>Email address<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label>Role / professional title<input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></label>
            <label>Organisation <span>(optional)</span><input value={form.organisation} onChange={(e) => setForm({ ...form, organisation: e.target.value })} /></label>
            {error && <p className="event-form-error" role="alert">{error}</p>}
            <button className="event-submit" type="submit" disabled={status === 'submitting'}>{status === 'submitting' ? 'REGISTERING…' : 'CONFIRM REGISTRATION →'}</button>
            <p className="event-form-note">By registering, you agree to receive essential information about this Valoria session.</p>
          </form>
        )}
      </div>
    </div>
  )
}

export function SessionTimer({ session }) {
  const [now, setNow] = useState(null)

  useEffect(() => {
    setNow(Date.now())
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  if (now === null) return <div className="session-timer session-timer-open"><Countdown target={null} label="COUNTDOWN" /></div>

  const state = getSessionState(session, now)
  const index = PROFESSIONAL_STANDARD_SERIES.findIndex((item) => item.id === session.id)
  const previous = index > 0 ? PROFESSIONAL_STANDARD_SERIES[index - 1] : null
  const target = state === 'locked' && previous
    ? new Date(previous.end).getTime()
    : state === 'registration-open'
      ? new Date(session.start).getTime()
      : state === 'live'
        ? new Date(session.end).getTime()
        : null

  if (state === 'coming-soon') return <div className="session-timer session-timer-open"><span className="session-timer-coming">COMING SOON · DATE TO BE CONFIRMED</span></div>
  if (state === 'ended') return <div className="session-timer session-timer-ended">SESSION ENDED</div>
  if (state === 'live') return <div className="session-timer session-timer-live">● LIVE NOW <Countdown target={target} label="ENDS IN" /></div>
  return <div className={`session-timer ${state === 'locked' ? 'session-timer-locked' : 'session-timer-open'}`}><Countdown target={target} label={state === 'locked' ? 'REGISTRATION OPENS IN' : 'SESSION STARTS IN'} /></div>
}
