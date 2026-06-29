'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const GATE_KEY = 'vi_waitlist_gate_v1'

export default function WaitlistGate() {
  const [visible, setVisible]   = useState(false)
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [role, setRole]         = useState('')
  const [interest, setInterest] = useState('')
  const [status, setStatus]     = useState('idle')
  const [error, setError]       = useState('')

  useEffect(() => {
    const dismissed = sessionStorage.getItem(GATE_KEY)
    if (!dismissed) {
      const t = setTimeout(() => setVisible(true), 600)
      return () => clearTimeout(t)
    }
  }, [])

  function dismiss() {
    sessionStorage.setItem(GATE_KEY, 'dismissed')
    setVisible(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError('Please enter your name and email.')
      return
    }
    setStatus('submitting')
    setError('')
    try {
      const { error: sbError } = await supabase
        .from('waitlist')
        .insert([{
          full_name: name.trim(),
          email: email.trim().toLowerCase(),
          role: role.trim() || null,
          interest: interest || null,
          type: 'gate',
          source: 'site_gate',
        }])
      if (sbError && sbError.code !== '23505') {
        throw sbError
      }
      setStatus('done')
      sessionStorage.setItem(GATE_KEY, 'submitted')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setStatus('idle')
    }
  }

  if (!visible) return null

  return (
    <>
      <style>{`
        .vi-gate-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(10,10,20,0.92);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: gateIn 0.4s ease;
        }
        @keyframes gateIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .vi-gate-card {
          background: #0F0F1A;
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 16px;
          padding: clamp(32px,5vw,52px);
          max-width: 520px; width: 100%;
          position: relative;
          animation: gateUp 0.4s ease;
        }
        @keyframes gateUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .vi-gate-dismiss {
          position: absolute; top: 16px; right: 16px;
          background: none; border: none; color: rgba(247,244,238,0.3);
          font-size: 22px; cursor: pointer; line-height: 1;
          transition: color 0.2s; padding: 4px;
        }
        .vi-gate-dismiss:hover { color: rgba(247,244,238,0.7); }
        .vi-gate-stripe {
          display: flex; height: 3px; border-radius: 2px;
          overflow: hidden; margin-bottom: 28px;
        }
        .vi-gate-eyebrow {
          font-size: 9px; font-weight: 700; letter-spacing: 0.22em;
          color: rgba(201,168,76,0.5); text-transform: uppercase;
          margin-bottom: 12px; font-family: var(--font);
        }
        .vi-gate-title {
          font-family: var(--font);
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 200; line-height: 1.1;
          letter-spacing: -0.02em;
          color: #F7F4EE; margin-bottom: 12px;
        }
        .vi-gate-title em { color: #C9A84C; font-style: italic; font-weight: 300; }
        .vi-gate-sub {
          font-size: 13px; font-weight: 300;
          color: rgba(247,244,238,0.45); line-height: 1.7;
          margin-bottom: 28px;
        }
        .vi-gate-field { margin-bottom: 14px; }
        .vi-gate-label {
          display: block; font-size: 9px; font-weight: 700;
          color: rgba(201,168,76,0.45); letter-spacing: 0.2em;
          text-transform: uppercase; margin-bottom: 7px;
          font-family: var(--font);
        }
        .vi-gate-input, .vi-gate-select {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(247,244,238,0.1);
          border-radius: 6px; padding: 12px 14px;
          color: #F7F4EE; font-size: 13px; font-family: var(--font);
          transition: border-color 0.2s;
          -webkit-appearance: none; appearance: none;
          box-sizing: border-box;
        }
        .vi-gate-input::placeholder { color: rgba(247,244,238,0.2); }
        .vi-gate-input:focus, .vi-gate-select:focus {
          outline: none;
          border-color: rgba(201,168,76,0.45);
          box-shadow: 0 0 0 3px rgba(201,168,76,0.07);
        }
        .vi-gate-select { color: rgba(247,244,238,0.6); cursor: pointer; }
        .vi-gate-select option { background: #0F0F1A; color: #F7F4EE; }
        .vi-gate-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .vi-gate-error {
          font-size: 12px; color: #D85A30; margin-bottom: 12px;
          padding: 10px 12px; background: rgba(216,90,48,0.07);
          border-left: 2px solid rgba(216,90,48,0.5); border-radius: 0 4px 4px 0;
        }
        .vi-gate-btn {
          width: 100%; padding: 15px 24px;
          background: #C9A84C; color: #0F0F1A;
          font-size: 11px; font-weight: 700; letter-spacing: 0.16em;
          border: none; border-radius: 9999px; cursor: pointer;
          font-family: var(--font); transition: opacity 0.2s;
          margin-top: 6px;
        }
        .vi-gate-btn:hover { opacity: 0.88; }
        .vi-gate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .vi-gate-skip {
          text-align: center; margin-top: 14px;
          font-size: 11px; color: rgba(247,244,238,0.25);
          letter-spacing: 0.06em;
        }
        .vi-gate-skip button {
          background: none; border: none; cursor: pointer;
          color: rgba(247,244,238,0.35); font-size: 11px;
          text-decoration: underline; transition: color 0.2s;
          font-family: var(--font);
        }
        .vi-gate-skip button:hover { color: rgba(247,244,238,0.6); }
        .vi-gate-done {
          text-align: center; padding: 20px 0;
        }
        .vi-gate-done-icon {
          width: 56px; height: 56px; border-radius: 50%;
          background: rgba(29,158,117,0.12);
          border: 1px solid rgba(29,158,117,0.3);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
        }
        .vi-gate-done-title {
          font-family: var(--font); font-size: 24px;
          font-weight: 200; color: #F7F4EE; margin-bottom: 10px;
        }
        .vi-gate-done-sub {
          font-size: 13px; color: rgba(247,244,238,0.45);
          line-height: 1.7; margin-bottom: 24px;
        }
        @media (max-width: 480px) {
          .vi-gate-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="vi-gate-overlay" role="dialog" aria-modal="true" aria-label="Join the Valoria waitlist">
        <div className="vi-gate-card">
          <button className="vi-gate-dismiss" onClick={dismiss} aria-label="Close and browse site">×</button>

          <div className="vi-gate-stripe">
            {[['#1D9E75',20],['#378ADD',25],['#7F77DD',25],['#BA7517',20],['#D85A30',10]].map(([color, pct], i) => (
              <div key={i} style={{ flex: pct, background: color, opacity: 0.85 }} />
            ))}
          </div>

          {status === 'done' ? (
            <div className="vi-gate-done">
              <div className="vi-gate-done-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L20 7" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="vi-gate-done-title">You&apos;re on the list.</div>
              <p className="vi-gate-done-sub">
                We&apos;ll reach out when the marketplace opens and your profile is ready to be found. Take the VALU Index now to be ahead of the queue.
              </p>
              <button className="vi-gate-btn" onClick={dismiss}>
                EXPLORE THE PLATFORM →
              </button>
            </div>
          ) : (
            <>
              <div className="vi-gate-eyebrow">FOUNDING COHORT — NOW OPEN</div>
              <h2 className="vi-gate-title">
                Be first when<br />the <em>marketplace opens.</em>
              </h2>
              <p className="vi-gate-sub">
                We&apos;re building the marketplace for assessed African professionals. Join the list — we&apos;ll reach out when it&apos;s ready for you.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <div className="vi-gate-row">
                  <div className="vi-gate-field">
                    <label className="vi-gate-label" htmlFor="gate-name">Full Name</label>
                    <input
                      id="gate-name" className="vi-gate-input" type="text"
                      placeholder="Your name" value={name}
                      onChange={e => setName(e.target.value)} required
                    />
                  </div>
                  <div className="vi-gate-field">
                    <label className="vi-gate-label" htmlFor="gate-email">Email Address</label>
                    <input
                      id="gate-email" className="vi-gate-input" type="email"
                      placeholder="you@example.com" value={email}
                      onChange={e => setEmail(e.target.value)} required
                    />
                  </div>
                </div>

                <div className="vi-gate-row">
                  <div className="vi-gate-field">
                    <label className="vi-gate-label" htmlFor="gate-role">Your Role / Title</label>
                    <input
                      id="gate-role" className="vi-gate-input" type="text"
                      placeholder="e.g. Head of People" value={role}
                      onChange={e => setRole(e.target.value)}
                    />
                  </div>
                  <div className="vi-gate-field">
                    <label className="vi-gate-label" htmlFor="gate-interest">I am a...</label>
                    <select
                      id="gate-interest" className="vi-gate-select"
                      value={interest} onChange={e => setInterest(e.target.value)}
                    >
                      <option value="">Select one</option>
                      <option value="professional">Professional / Talent</option>
                      <option value="speaker">Speaker / Facilitator</option>
                      <option value="employer">Employer / Recruiter</option>
                      <option value="event_planner">Event Planner / Organiser</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {error && <div className="vi-gate-error">{error}</div>}

                <button
                  type="submit" className="vi-gate-btn"
                  disabled={status === 'submitting'}
                >
                  {status === 'submitting' ? 'JOINING...' : 'JOIN THE FOUNDING COHORT →'}
                </button>
              </form>

              <div className="vi-gate-skip">
                <button onClick={dismiss}>Browse the site first</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
