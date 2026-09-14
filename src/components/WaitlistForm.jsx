'use client'

import { useEffect, useState } from 'react'

const GATE_KEY = 'vi_waitlist_gate_v2'
const COOKIE_KEY = 'vi_waitlist_v2'

export default function WaitlistForm({ compact = false }) {
  const [form, setForm] = useState({ name: '', email: '', role: '', interest: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [utm, setUtm] = useState({ source: null, medium: null, campaign: null })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setUtm({ source: params.get('utm_source'), medium: params.get('utm_medium'), campaign: params.get('utm_campaign') })
  }, [])

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const valid = form.name.trim().length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())

  async function handleSubmit(event) {
    event.preventDefault()
    if (!valid || loading) return
    setLoading(true)
    setError('')

    let source = 'homepage_form'
    let type = 'homepage'
    try {
      const webinarSource = sessionStorage.getItem('vi_signup_source')
      if (webinarSource) {
        source = webinarSource
        type = 'webinar'
        sessionStorage.removeItem('vi_signup_source')
      }
    } catch {}

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          role: form.role.trim() || null,
          interest: form.interest || null,
          type,
          source,
          utm_source: utm.source,
          utm_medium: utm.medium,
          utm_campaign: utm.campaign,
        }),
      })
      if (!response.ok && response.status !== 409) throw new Error('Unable to complete your registration.')
      localStorage.setItem(GATE_KEY, 'submitted')
      document.cookie = `${COOKIE_KEY}=submitted; path=/; max-age=31536000`
      setSubmitted(true)
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') window.fbq('track', 'Lead')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return (
    <div className={`waitlist-card ${compact ? 'waitlist-card-compact' : ''}`}>
      <div className="wl-success-mark" aria-hidden="true">✓</div>
      <div className="wl-success-kicker">REGISTRATION COMPLETE</div>
      <h3>You&apos;re on the list.</h3>
      <p>We&apos;ll keep you informed as Valoria opens the next stage of the professional standard.</p>
    </div>
  )

  return (
    <div className={`waitlist-card ${compact ? 'waitlist-card-compact' : ''}`}>
      <div className="wl-card-head">
        <div className="wl-kicker"><span /> JOIN THE FOUNDING COHORT</div>
        <h3>Start with Valoria.</h3>
        <p>A short form. The right next step. No noise.</p>
      </div>

      <form className="wl-form" onSubmit={handleSubmit} noValidate>
        <div className="wl-form-grid">
          <label className="wl-field-wrap">
            <span>FULL NAME <b>*</b></span>
            <input className="wl-field" type="text" autoComplete="name" placeholder="Your full name" value={form.name} onChange={e => update('name', e.target.value)} required />
          </label>
          <label className="wl-field-wrap">
            <span>EMAIL ADDRESS <b>*</b></span>
            <input className="wl-field" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} required />
          </label>
          <label className="wl-field-wrap">
            <span>ROLE / TITLE</span>
            <input className="wl-field" type="text" placeholder="e.g. People Director" value={form.role} onChange={e => update('role', e.target.value)} />
          </label>
          <label className="wl-field-wrap">
            <span>I AM A...</span>
            <select className="wl-field" value={form.interest} onChange={e => update('interest', e.target.value)}>
              <option value="">Select your pathway</option>
              <option value="professional">Professional / Talent</option>
              <option value="speaker">Speaker / Facilitator</option>
              <option value="employer">Employer / Recruiter</option>
              <option value="event_planner">Event Planner / Organiser</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>
        {error && <div className="wl-error" role="alert">{error}</div>}
        <div className="wl-submit-row">
          <button className="wl-btn" type="submit" disabled={!valid || loading}>{loading ? 'JOINING…' : 'JOIN THE FOUNDING COHORT'} <span>→</span></button>
          <small>Your details are securely submitted and synced for Valoria communications.</small>
        </div>
      </form>
    </div>
  )
}
