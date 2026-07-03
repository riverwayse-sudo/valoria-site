'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const GATE_KEY  = 'vi_waitlist_gate_v2'
const COOKIE_KEY = 'vi_waitlist_v2'

export default function WaitlistForm() {
  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [role,      setRole]      = useState('')
  const [interest,  setInterest]  = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  const valid = name.trim() && email.includes('@')

  async function handleSubmit() {
    if (!valid || loading) return
    setLoading(true)
    setError('')

    try {
      const { error: sbError } = await supabase
        .from('waitlist')
        .insert([{
          full_name: name.trim(),
          email:     email.trim().toLowerCase(),
          role:      role.trim() || null,
          interest:  interest || null,
          type:      'homepage',
          source:    'homepage_form',
        }])

      if (sbError && sbError.code !== '23505') throw sbError

      // Set cookie + localStorage so gate clears
      localStorage.setItem(GATE_KEY, 'submitted')
      document.cookie = `${COOKIE_KEY}=submitted; path=/; max-age=31536000`

      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="waitlist-card">
      <div className="eyebrow">
        <div className="eyebrow-line" />
        <span className="eyebrow-text">FOUNDING COHORT — NOW OPEN</span>
      </div>

      {submitted ? (
        <div className="wl-success">
          <strong>You're on the list.</strong>{' '}
          We'll reach out when it's ready for you.
        </div>
      ) : (
        <>
          <p className="waitlist-card-desc">
            We're building the marketplace for assessed African professionals. Join the list — we'll reach out when it's ready for you.
          </p>

          <label className="wl-field-label" htmlFor="wl-name">FULL NAME</label>
          <input id="wl-name" className="wl-field" type="text"
            placeholder="Your name" value={name}
            onChange={e => setName(e.target.value)} autoComplete="name" />

          <label className="wl-field-label" htmlFor="wl-email">EMAIL ADDRESS</label>
          <input id="wl-email" className="wl-field" type="email"
            placeholder="you@example.com" value={email}
            onChange={e => setEmail(e.target.value)} autoComplete="email" />

          <label className="wl-field-label" htmlFor="wl-role-title">YOUR ROLE / TITLE</label>
          <input id="wl-role-title" className="wl-field" type="text"
            placeholder="e.g. Head of People" value={role}
            onChange={e => setRole(e.target.value)} autoComplete="organization-title" />

          <label className="wl-field-label" htmlFor="wl-role">I AM A...</label>
          <select id="wl-role" className="wl-field"
            value={interest} onChange={e => setInterest(e.target.value)}>
            <option value="">Select one</option>
            <option value="professional">Professional / Talent</option>
            <option value="speaker">Speaker / Facilitator</option>
            <option value="employer">Employer / Recruiter</option>
            <option value="event_planner">Event Planner / Organiser</option>
            <option value="other">Other</option>
          </select>

          {error && (
            <div style={{ fontSize:'12px', color:'#D85A30', marginBottom:'12px', padding:'10px 12px', background:'rgba(216,90,48,.07)', borderLeft:'2px solid rgba(216,90,48,.5)' }}>
              {error}
            </div>
          )}

          <button className="wl-btn" onClick={handleSubmit} disabled={!valid || loading}>
            {loading ? 'JOINING...' : 'JOIN THE FOUNDING COHORT →'}
          </button>
        </>
      )}
    </div>
  )
}
