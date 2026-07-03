'use client';

import { useState } from 'react';

export default function WaitlistPage() {
  const [form, setForm] = useState({ full_name: '', email: '', role: '', interest: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) {
      setErrorMsg('Please enter your name and email.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong.');
        setStatus('error');
        return;
      }

      // Same cookie key the gate and homepage form use — one submission clears all three
      localStorage.setItem('vi_waitlist_gate_v2', 'submitted');
      document.cookie = 'vi_waitlist_v2=submitted; path=/; max-age=31536000';
      setStatus('success');
    } catch {
      setErrorMsg('Network error. Please check your connection.');
      setStatus('error');
    }
  };

  return (
    <>
      <style>{`
        .vi-page-overlay {
          min-height: 100vh;
          background: #0a0a14;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .vi-page-card {
          background: #0F0F1A;
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 16px;
          padding: clamp(32px,5vw,52px);
          max-width: 520px; width: 100%;
        }
        .vi-page-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
        .vi-page-stripe {
          display: flex; height: 3px; border-radius: 2px;
          overflow: hidden; margin-bottom: 28px;
        }
        .vi-page-eyebrow {
          font-size: 9px; font-weight: 700; letter-spacing: 0.22em;
          color: rgba(201,168,76,0.5); text-transform: uppercase;
          margin-bottom: 12px; font-family: var(--font);
        }
        .vi-page-title {
          font-family: var(--font);
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 200; line-height: 1.1;
          letter-spacing: -0.02em;
          color: #F7F4EE; margin-bottom: 12px;
        }
        .vi-page-title em { color: #C9A84C; font-style: italic; font-weight: 300; }
        .vi-page-sub {
          font-size: 13px; font-weight: 300;
          color: rgba(247,244,238,0.45); line-height: 1.7;
          margin-bottom: 28px;
        }
        .vi-page-field { margin-bottom: 14px; }
        .vi-page-label {
          display: block; font-size: 9px; font-weight: 700;
          color: rgba(201,168,76,0.45); letter-spacing: 0.2em;
          text-transform: uppercase; margin-bottom: 7px;
          font-family: var(--font);
        }
        .vi-page-input, .vi-page-select {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(247,244,238,0.1);
          border-radius: 6px; padding: 12px 14px;
          color: #F7F4EE; font-size: 13px; font-family: var(--font);
          transition: border-color 0.2s;
          -webkit-appearance: none; appearance: none;
          box-sizing: border-box;
        }
        .vi-page-input::placeholder { color: rgba(247,244,238,0.2); }
        .vi-page-input:focus, .vi-page-select:focus {
          outline: none;
          border-color: rgba(201,168,76,0.45);
          box-shadow: 0 0 0 3px rgba(201,168,76,0.07);
        }
        .vi-page-select { color: rgba(247,244,238,0.6); cursor: pointer; }
        .vi-page-select option { background: #0F0F1A; color: #F7F4EE; }
        .vi-page-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .vi-page-error {
          font-size: 12px; color: #D85A30; margin-bottom: 12px;
          padding: 10px 12px; background: rgba(216,90,48,0.07);
          border-left: 2px solid rgba(216,90,48,0.5); border-radius: 0 4px 4px 0;
        }
        .vi-page-btn {
          width: 100%; padding: 15px 24px;
          background: #C9A84C; color: #0F0F1A;
          font-size: 11px; font-weight: 700; letter-spacing: 0.16em;
          border: none; border-radius: 9999px; cursor: pointer;
          font-family: var(--font); transition: opacity 0.2s;
          margin-top: 6px;
        }
        .vi-page-btn:hover { opacity: 0.88; }
        .vi-page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .vi-page-done-icon {
          width: 56px; height: 56px; border-radius: 50%;
          background: rgba(29,158,117,0.12);
          border: 1px solid rgba(29,158,117,0.3);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
        }
        .vi-page-done-title {
          font-family: var(--font); font-size: 24px;
          font-weight: 200; color: #F7F4EE; margin-bottom: 10px;
          text-align: center;
        }
        .vi-page-done-sub {
          font-size: 13px; color: rgba(247,244,238,0.45);
          line-height: 1.7; margin-bottom: 0;
          text-align: center;
        }
        @media (max-width: 480px) {
          .vi-page-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="vi-page-overlay">
        <div className="vi-page-card">

          <div className="vi-page-logo">
            <img src="/logo.png" alt="Valoria Institute" style={{ height: '32px', width: 'auto' }} />
          </div>

          <div className="vi-page-stripe">
            {[['#1D9E75',20],['#378ADD',25],['#7F77DD',25],['#BA7517',20],['#D85A30',10]].map(([color, pct], i) => (
              <div key={i} style={{ flex: pct, background: color, opacity: 0.85 }} />
            ))}
          </div>

          {status === 'success' ? (
            <div>
              <div className="vi-page-done-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L20 7" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="vi-page-done-title">You&apos;re on the list.</div>
              <p className="vi-page-done-sub">
                We&apos;ll reach out when it&apos;s ready for you.
              </p>
            </div>
          ) : (
            <>
              <div className="vi-page-eyebrow">FOUNDING COHORT — NOW OPEN</div>
              <h1 className="vi-page-title">
                Be first when<br />the <em>marketplace opens.</em>
              </h1>
              <p className="vi-page-sub">
                We&apos;re building the marketplace for assessed African professionals. Join the list — we&apos;ll reach out when it&apos;s ready for you.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <div className="vi-page-row">
                  <div className="vi-page-field">
                    <label className="vi-page-label" htmlFor="full_name">Full Name</label>
                    <input id="full_name" name="full_name" className="vi-page-input" type="text"
                      placeholder="Your name" value={form.full_name}
                      onChange={handleChange} required />
                  </div>
                  <div className="vi-page-field">
                    <label className="vi-page-label" htmlFor="email">Email Address</label>
                    <input id="email" name="email" className="vi-page-input" type="email"
                      placeholder="you@example.com" value={form.email}
                      onChange={handleChange} required />
                  </div>
                </div>

                <div className="vi-page-row">
                  <div className="vi-page-field">
                    <label className="vi-page-label" htmlFor="role">Your Role / Title</label>
                    <input id="role" name="role" className="vi-page-input" type="text"
                      placeholder="e.g. Head of People" value={form.role}
                      onChange={handleChange} />
                  </div>
                  <div className="vi-page-field">
                    <label className="vi-page-label" htmlFor="interest">I am a...</label>
                    <select id="interest" name="interest" className="vi-page-select"
                      value={form.interest} onChange={handleChange}>
                      <option value="">Select one</option>
                      <option value="professional">Professional / Talent</option>
                      <option value="speaker">Speaker / Facilitator</option>
                      <option value="employer">Employer / Recruiter</option>
                      <option value="event_planner">Event Planner / Organiser</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {status === 'error' && errorMsg && <div className="vi-page-error">{errorMsg}</div>}

                <button type="submit" className="vi-page-btn" disabled={status === 'loading'}>
                  {status === 'loading' ? 'JOINING...' : 'JOIN THE FOUNDING COHORT →'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}

