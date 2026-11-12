'use client'

import Link from 'next/link'

const GOLD = '#C9A84C'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'
const MUTED = 'rgba(247,244,238,.62)'

export default function RecoverTasterPage() {
  return (
    <main style={{ minHeight: '100vh', background: DARK, color: PARCHMENT, display: 'grid', placeItems: 'center', padding: 24, fontFamily: "'Raleway', sans-serif" }}>
      <section style={{ width: '100%', maxWidth: 560, padding: 'clamp(24px, 5vw, 42px)', background: '#1A1A2E', border: '1px solid rgba(201,168,76,.2)', borderRadius: 14 }}>
        <Link href="/" style={{ color: GOLD, textDecoration: 'none', fontSize: 11, letterSpacing: '.14em', fontWeight: 700 }}>VALORIA INSTITUTE</Link>
        <p style={{ color: GOLD, fontSize: 10, fontWeight: 700, letterSpacing: '.18em', margin: '28px 0 12px' }}>VALU INDEX TASTER RECOVERY</p>
        <h1 style={{ fontSize: 'clamp(30px, 5vw, 42px)', fontWeight: 400, lineHeight: 1.08, margin: '0 0 16px' }}>Your saved work should stay <em>with you.</em></h1>
        <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7, margin: '0 0 18px' }}>
          Sign in with the same email address you used for your VALU Index Taster. If your saved responses are available, they will be connected to your account.
        </p>
        <p style={{ color: MUTED, fontSize: 12, lineHeight: 1.65, margin: '0 0 24px' }}>
          If you do not have an account yet, create one with that same email address, confirm your email, then sign in. If you need help, contact Valoria support.
        </p>
        <Link href="/login?returnTo=%2Fdashboard" style={{ display: 'block', padding: '14px 18px', background: GOLD, color: DARK, borderRadius: 999, textAlign: 'center', textDecoration: 'none', fontWeight: 800, fontSize: 11, letterSpacing: '.1em' }}>
          SIGN IN AND RECOVER MY TASTER →
        </Link>
        <p style={{ color: 'rgba(247,244,238,.68)', fontSize: 11, lineHeight: 1.65, margin: '18px 0 0' }}>
          Need an account first? <Link href="/signup" style={{ color: GOLD, textDecoration: 'underline' }}>Create an account</Link>. For assistance, email <a href="mailto:info@valoriainstitute.com" style={{ color: GOLD }}>Valoria support</a>.
        </p>
      </section>
    </main>
  )
}
