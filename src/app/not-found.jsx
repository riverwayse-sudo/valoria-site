import Link from 'next/link'

export const metadata = {
  title: '404 — Page Not Found | Valoria Institute',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0F0F1A',
      fontFamily: "'Raleway','Helvetica Neue',Arial,sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      color: '#F7F4EE',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.22em', color: 'rgba(201,168,76,.5)', marginBottom: '24px' }}>
        404
      </div>

      <div style={{ fontSize: '56px', color: '#C9A84C', marginBottom: '24px', lineHeight: 1 }}>◈</div>

      <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 200, lineHeight: 1.1, letterSpacing: '-.02em', marginBottom: '16px' }}>
        This page doesn't<br /><em style={{ fontStyle: 'italic', color: '#C9A84C' }}>exist.</em>
      </h1>

      <p style={{ fontSize: '15px', fontWeight: 300, color: 'rgba(247,244,238,.5)', lineHeight: 1.7, maxWidth: '420px', marginBottom: '40px' }}>
        The page you're looking for may have moved, been renamed, or never existed. Start from somewhere you know.
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" style={{
          padding: '14px 28px',
          background: '#C9A84C',
          color: '#0F0F1A',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '.14em',
          textDecoration: 'none',
        }}>
          GO HOME
        </Link>
        <Link href="/marketplace" style={{
          padding: '14px 28px',
          border: '1px solid rgba(201,168,76,.25)',
          color: '#C9A84C',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '.14em',
          textDecoration: 'none',
        }}>
          MARKETPLACE
        </Link>
      </div>

      <Link href="/" style={{ lineHeight: 0, marginTop: '60px', opacity: 0.4 }}>
        <img src="/logo.png" alt="Valoria Institute" style={{ height: '32px', width: 'auto' }} />
      </Link>
    </div>
  )
}
