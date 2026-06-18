'use client'
import { useState } from 'react'

export default function WaitlistForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const valid = name.trim() && email.includes('@') && role

  function handleSubmit() {
    if (!valid || loading) return
    setLoading(true)
    // Compose and open mailto — no backend needed at this stage
    const subject = encodeURIComponent('Founding Cohort Waitlist')
    const body = encodeURIComponent(
      `Name: ${name.trim()}\nEmail: ${email.trim()}\nEntry Point: ${role}\n\nI'd like to join the Valoria Institute founding cohort.`
    )
    window.location.href = `mailto:info@valoriainstitute.com?subject=${subject}&body=${body}`
    setTimeout(() => {
      setSubmitted(true)
      setLoading(false)
    }, 800)
  }

  return (
    <div className="waitlist-card">
      <div className="eyebrow">
        <div className="eyebrow-line" />
        <span className="eyebrow-text">JOIN THE WAITLIST</span>
      </div>
      {submitted ? (
        <div className="wl-success">
          <strong>You&rsquo;re on the list.</strong>
          Your email client opened with a pre-filled message — send it to confirm your spot in the founding cohort. If nothing opened, email{' '}
          <a href="mailto:info@valoriainstitute.com" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
            info@valoriainstitute.com
          </a>{' '}
          with &ldquo;Founding Cohort&rdquo; in the subject.
        </div>
      ) : (
        <>
          <p className="waitlist-card-desc">
            Tell us who you are and how you&apos;d like to engage — we&apos;ll hold your spot in the founding cohort.
          </p>

          <label className="wl-field-label" htmlFor="wl-name">FULL NAME</label>
          <input
            id="wl-name"
            className="wl-field"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            autoComplete="name"
          />

          <label className="wl-field-label" htmlFor="wl-email">EMAIL ADDRESS</label>
          <input
            id="wl-email"
            className="wl-field"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />

          <label className="wl-field-label" htmlFor="wl-role">I AM JOINING AS A</label>
          <select
            id="wl-role"
            className="wl-field"
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="" disabled>Select your entry point…</option>
            <option value="Candidate (Professional)">Candidate — Professional</option>
            <option value="Speaker">Speaker</option>
            <option value="Facilitator">Facilitator</option>
            <option value="Employer">Employer</option>
            <option value="Event Organiser">Event Organiser</option>
          </select>

          <button
            className="wl-btn"
            onClick={handleSubmit}
            disabled={!valid || loading}
          >
            {loading ? 'SENDING…' : 'JOIN THE WAITLIST'}
          </button>
        </>
      )}
    </div>
  )
}
