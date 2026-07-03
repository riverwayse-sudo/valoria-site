'use client';

import { useState } from 'react';

const ROLES = [
  'HR / People Professional',
  'L&D / Talent Development',
  'Recruiter / Talent Acquisition',
  'Business Leader / Executive',
  'Consultant / Coach',
  'Student / Early Career',
  'Other',
];

export default function WaitlistPage() {
  const [form, setForm] = useState({ full_name: '', email: '', role: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      // Set access cookie so they can browse after signing up
      localStorage.setItem('vi_waitlist_gate_v2', 'submitted')
      document.cookie = 'vi_waitlist_v2=submitted; path=/; max-age=31536000'
      setStatus('success');
    } catch {
      setErrorMsg('Network error. Please check your connection.');
      setStatus('error');
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Raleway', sans-serif;
          background: #0F0F1A;
          color: #F7F4EE;
          min-height: 100vh;
        }

        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          position: relative;
          overflow: hidden;
        }

        /* Ambient background glow */
        .page::before {
          content: '';
          position: absolute;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .logo-wrap {
          margin-bottom: 48px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-mark {
          width: 36px;
          height: 36px;
          border: 2px solid #C9A84C;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-mark span {
          font-size: 18px;
          font-weight: 800;
          color: #C9A84C;
          letter-spacing: -1px;
        }

        .logo-name {
          font-size: 18px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: #F7F4EE;
          text-transform: uppercase;
        }

        .card {
          width: 100%;
          max-width: 520px;
          background: #1A1A2E;
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 16px;
          padding: 48px 40px;
          position: relative;
          z-index: 1;
        }

        .eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #C9A84C;
          margin-bottom: 16px;
        }

        .headline {
          font-size: 32px;
          font-weight: 800;
          line-height: 1.2;
          color: #F7F4EE;
          margin-bottom: 16px;
        }

        .headline em {
          font-style: normal;
          color: #C9A84C;
        }

        .subtext {
          font-size: 15px;
          font-weight: 400;
          line-height: 1.7;
          color: rgba(247,244,238,0.65);
          margin-bottom: 36px;
        }

        .divider {
          height: 1px;
          background: rgba(201,168,76,0.15);
          margin-bottom: 32px;
        }

        .field {
          margin-bottom: 20px;
        }

        label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(247,244,238,0.5);
          margin-bottom: 8px;
        }

        input, select {
          width: 100%;
          background: rgba(15,15,26,0.8);
          border: 1px solid rgba(201,168,76,0.25);
          border-radius: 8px;
          padding: 14px 16px;
          font-family: 'Raleway', sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: #F7F4EE;
          outline: none;
          transition: border-color 0.2s;
          appearance: none;
        }

        input::placeholder { color: rgba(247,244,238,0.25); }

        input:focus, select:focus {
          border-color: #C9A84C;
        }

        select option {
          background: #1A1A2E;
          color: #F7F4EE;
        }

        .select-wrap {
          position: relative;
        }

        .select-wrap::after {
          content: '▾';
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #C9A84C;
          pointer-events: none;
          font-size: 14px;
        }

        .submit-btn {
          width: 100%;
          background: #C9A84C;
          color: #0F0F1A;
          border: none;
          border-radius: 8px;
          padding: 16px;
          font-family: 'Raleway', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          margin-top: 8px;
          transition: opacity 0.2s, transform 0.1s;
        }

        .submit-btn:hover { opacity: 0.9; }
        .submit-btn:active { transform: scale(0.98); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .error-msg {
          background: rgba(220,60,60,0.12);
          border: 1px solid rgba(220,60,60,0.3);
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 13px;
          color: #ff8080;
          margin-top: 16px;
        }

        .success-state {
          text-align: center;
          padding: 16px 0;
        }

        .success-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(201,168,76,0.12);
          border: 2px solid #C9A84C;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          font-size: 28px;
        }

        .success-title {
          font-size: 24px;
          font-weight: 800;
          color: #F7F4EE;
          margin-bottom: 12px;
        }

        .success-sub {
          font-size: 15px;
          color: rgba(247,244,238,0.6);
          line-height: 1.7;
        }

        .footer-note {
          margin-top: 24px;
          text-align: center;
          font-size: 12px;
          color: rgba(247,244,238,0.3);
          letter-spacing: 0.04em;
        }

        @media (max-width: 560px) {
          .card { padding: 36px 24px; }
          .headline { font-size: 26px; }
        }
      `}</style>

      <div className="page">
        {/* Logo */}
        <div className="logo-wrap">
          <div className="logo-mark"><span>V</span></div>
          <span className="logo-name">Valoria Institute</span>
        </div>

        <div className="card">
          {status === 'success' ? (
            <div className="success-state">
              <div className="success-icon">✦</div>
              <div className="success-title">You're on the list.</div>
              <p className="success-sub">
                We'll reach out when Valoria opens for your cohort.<br />
                Keep building — your PRIME score awaits.
              </p>
            </div>
          ) : (
            <>
              <div className="eyebrow">Early Access</div>
              <h1 className="headline">
                Africa's <em>professional capability</em> platform is almost ready.
              </h1>
              <p className="subtext">
                Valoria Institute is building the definitive tool for measuring, developing,
                and showcasing professional excellence across Africa. Join the waitlist to be
                first in.
              </p>

              <div className="divider" />

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label htmlFor="full_name">Full Name</label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="Your full name"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="email">Work Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="role">Your Role</label>
                  <div className="select-wrap">
                    <select
                      id="role"
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                    >
                      <option value="">Select your role</option>
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? 'Joining…' : 'Join the Waitlist →'}
                </button>

                {status === 'error' && (
                  <div className="error-msg">{errorMsg}</div>
                )}
              </form>
            </>
          )}
        </div>

        <p className="footer-note">© {new Date().getFullYear()} Valoria Institute · valoriainstitute.com</p>
      </div>
    </>
  );
}
