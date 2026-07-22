'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BRAND } from '@/lib/brand'
import { supabase } from '@/lib/supabase'

export default function Footer() {
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setAuthChecked(true)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  function handleSignOut() {
    supabase.auth.signOut().then(() => { window.location.href = '/' })
  }

  return (
    <>
      <style>{`
        footer.vi-footer {
          background: var(--dark-mid);
          border-top: 1px solid rgba(201,168,76,.15);
          padding: clamp(48px,6vw,80px) var(--pad) 32px;
        }
        .uf-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: clamp(24px,4vw,56px);
          margin-bottom: clamp(32px,4vw,52px);
        }
        .uf-name { font-family: var(--font); font-size: 22px; font-weight: 700; color: var(--gold); letter-spacing: .18em; line-height: 1; }
        .uf-sub { font-size: 8px; color: rgba(201,168,76,.4); letter-spacing: .3em; margin-top: 3px; margin-bottom: 16px; font-weight: 500; }
        .uf-desc { font-size: 13px; font-weight: 300; color: rgba(247,244,238,.35); line-height: 1.7; max-width: 260px; margin-bottom: 14px; }
        .uf-tagline { font-family: var(--font); font-size: 15px; font-style: italic; font-weight: 300; color: rgba(201,168,76,.45); letter-spacing: .06em; }
        .uf-col-title { font-size: 9px; font-weight: 700; color: rgba(201,168,76,.5); letter-spacing: .2em; margin-bottom: 14px; }
        .uf-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .uf-links a, .uf-links button { font-size: 13px; font-weight: 300; color: rgba(247,244,238,.45); text-decoration: none; transition: color .2s; letter-spacing: .02em; background: none; border: none; padding: 0; cursor: pointer; text-align: left; font-family: var(--font); }
        .uf-links a:hover, .uf-links button:hover { color: var(--gold); }
        .uf-cta { color: var(--gold) !important; font-weight: 600 !important; }
        .uf-bottom {
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 12px; padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,.05);
          font-size: 11px; font-weight: 300; color: rgba(247,244,238,.2); letter-spacing: .04em;
        }
        @media (max-width: 980px) {
          .uf-grid { grid-template-columns: 1fr 1fr; gap: 28px; }
          .uf-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 640px) {
          .uf-grid { grid-template-columns: 1fr; }
          .uf-bottom { flex-direction: column; text-align: center; }
        }
      `}</style>

      <footer className="vi-footer">
        <div className="container">
          <div className="uf-grid">
            <div className="uf-brand">
              <img src={BRAND.logo} alt="Valoria Institute" style={{ height: '52px', width: 'auto', display: 'block', marginBottom: '16px' }} />
              <p className="uf-desc">The marketplace where African professionals rise. One assessed standard. Three ways to engage.</p>
              <div className="uf-tagline">Worth. Built.</div>
            </div>

            <div>
              <div className="uf-col-title">Platform</div>
              <ul className="uf-links">
                <li><a href="https://assessment.valoriainstitute.com/" target="_blank" rel="noopener noreferrer">VALU Index</a></li>
                <li><Link href="/marketplace">Marketplace</Link></li>
                <li><Link href="/prime">PRIME Framework</Link></li>
                <li><Link href="/atb-connect">ATB Connect</Link></li>
                <li><Link href="/atb-spotlight">ATB Spotlight</Link></li>
                <li><Link href="/facilitators">Facilitators</Link></li>
              </ul>
            </div>

            <div>
              <div className="uf-col-title">Company</div>
              <ul className="uf-links">
                <li><Link href="/about-us">About Us</Link></li>
                <li><Link href="/programmes">Programmes</Link></li>
                <li><Link href="/develop">Develop</Link></li>
                <li><Link href="/contact-us">Contact</Link></li>
                <li><Link href="/waitlist">Founding Cohort</Link></li>
              </ul>
            </div>

            <div>
              <div className="uf-col-title">Legal</div>
              <ul className="uf-links">
                <li><Link href="/privacypolicy">Privacy Policy</Link></li>
                <li><Link href="/terms-of-use">Terms of Use</Link></li>
              </ul>
              <div className="uf-col-title" style={{ marginTop: '28px' }}>Get Started</div>
              <ul className="uf-links">
                <li><a href="https://assessment.valoriainstitute.com/" className="uf-cta" target="_blank" rel="noopener noreferrer">Take the VALU Index &rarr;</a></li>
                {authChecked && (
                  user ? (
                    <>
                      <li><Link href="/dashboard">Dashboard</Link></li>
                      <li><button onClick={handleSignOut}>Sign Out</button></li>
                    </>
                  ) : (
                    <>
                      <li><Link href="/signup">Create Account</Link></li>
                      <li><Link href="/login">Sign In</Link></li>
                    </>
                  )
                )}
              </ul>
            </div>
          </div>

          <div className="uf-bottom">
            <span>&copy; {new Date().getFullYear()} African Talent Bureau Ltd &middot; Valoria Institute &middot; Lagos, Nigeria</span>
            <span>NDPA 2023 Compliant</span>
            <span><a href="mailto:info@valoriainstitute.com" style={{ color: 'rgba(247,244,238,.2)', textDecoration: 'none' }}>info@valoriainstitute.com</a></span>
          </div>
        </div>
      </footer>
    </>
  )
}
