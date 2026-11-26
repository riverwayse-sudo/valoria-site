'use client'

import Link from 'next/link'

const GOLD = '#C9A84C'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'
const MUTED = 'rgba(247,244,238,.62)'

export default function RecoverTasterPage() {
  return (
    <main style={{ minHeight: '100vh', background: DARK, color: PARCHMENT, display: 'grid', placeItems: 'center', padding: 24, fontFamily: "'Raleway', sans-serif" }}>
      <section style={{ width: '100%', maxWidth: 560, padding: 'clamp(28px, 6vw, 56px)', background: '#1A1A2E', border: '1px solid rgba(201,168,76,.2)', borderRadius: 14 }}>
        <Link href="/" style={{ color: GOLD, textDecoration: 'none', fontSize: 11, letterSpacing: '.14em', fontWeight: 700 }}>VALORIA INSTITUTE</Link>
        <p style={{ color: GOLD, fontSize: 10, fontWeight: 700, letterSpacing: '.18em', margin: '34px 0 12px' }}>VALU TASTER RECOVERY</p>
        <h1 style={{ fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 400, lineHeight: 1.08, margin: '0 0 18px' }}>Your saved work should stay <em>with you.</em></h1>
        <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.8, margin: '0 0 22px' }}>
          Sign in with the same email address you used when registering for your VALU taster. After sign-in, Valoria will securely look for saved taster records associated with that verified email and connect eligible records to your account.
        </p>
        <p style={{ color: MUTED, fontSize: 12, lineHeight: 1.7, margin: '0 0 26px' }}>
          If you have not created an account yet, create one with that same email address, confirm it, then sign in. Records with conflicting identity evidence are held for support review rather than linked automatically.
        </p>
        <Link href="/login?returnTo=%2Fdashboard" style={{ display: 'block', padding: '15px 18px', background: GOLD, color: DARK, borderRadius: 999, textAlign: 'center', textDecoration: 'none', fontWeight: 800, fontSize: 11, letterSpacing: '.12em' }}>
          SIGN IN AND RECOVER MY TASTER →
        </Link>
        <p style={{ color: 'rgba(247,244,238,.42)', fontSize: 11, lineHeight: 1.7, margin: '22px 0 0' }}>
          Need an account first? <Link href="/signup" style={{ color: GOLD, textDecoration: 'underline' }}>Create an account</Link>. If the email or saved identity details no longer match, contact <a href="mailto:info@valoriainstitute.com" style={{ color: GOLD }}>Valoria support</a>.
        </p>
      </section>
    </main>
  )
}
