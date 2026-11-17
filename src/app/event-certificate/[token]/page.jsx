import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { hashEventCertificateToken } from '@/lib/event-certificate-token'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata() {
  return {
    title: 'Your Valoria Event Certificate',
    robots: { index: false, follow: false },
  }
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null
}

export default async function EventCertificatePage({ params }) {
  const { token } = await params
  const tokenHash = await hashEventCertificateToken(token)
  const supabase = getSupabase()
  let certificate = null

  if (tokenHash && supabase) {
    const { data } = await supabase
      .from('event_certificate_deliveries')
      .select('recipient_name, revoked_at')
      .eq('token_hash', tokenHash)
      .is('revoked_at', null)
      .maybeSingle()
    certificate = data
  }

  const shell = {
    minHeight: '100vh',
    background: '#1A1A2E',
    color: '#FAFAF7',
    fontFamily: 'Raleway, sans-serif',
    padding: 'clamp(32px, 7vw, 88px) 22px',
  }
  const panel = {
    width: '100%',
    maxWidth: 760,
    margin: '0 auto',
    padding: 'clamp(30px, 7vw, 72px)',
    border: '1px solid rgba(201,168,76,.38)',
    background: '#24243A',
    textAlign: 'center',
  }

  if (!certificate) {
    return (
      <main style={{ ...shell, display: 'grid', placeItems: 'center' }}>
        <section style={panel}>
          <p style={{ color: '#C9A84C', letterSpacing: '.2em', fontSize: 11, fontWeight: 700 }}>VALORIA INSTITUTE</p>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 52px)', margin: '24px 0 14px' }}>Certificate link unavailable</h1>
          <p style={{ color: 'rgba(250,250,247,.72)', lineHeight: 1.8 }}>This link may be invalid or the certificate may have been withdrawn. Please contact Valoria Institute if you need assistance.</p>
          <Link href="/events" style={{ display: 'inline-block', marginTop: 28, color: '#C9A84C' }}>Explore Valoria events</Link>
        </section>
      </main>
    )
  }

  return (
    <main style={shell}>
      <section style={panel}>
        <p style={{ color: '#C9A84C', letterSpacing: '.2em', fontSize: 11, fontWeight: 700 }}>VALORIA INSTITUTE</p>
        <p style={{ marginTop: 30, color: 'rgba(250,250,247,.62)', letterSpacing: '.13em', fontSize: 10 }}>INFLUENCE WITHOUT AUTHORITY</p>
        <h1 style={{ fontSize: 'clamp(34px, 6vw, 56px)', lineHeight: 1.12, fontWeight: 600, margin: '18px 0' }}>Your participation is recognised.</h1>
        <p style={{ fontSize: 19, lineHeight: 1.6, margin: '28px 0 8px' }}>{certificate.recipient_name}</p>
        <p style={{ color: 'rgba(250,250,247,.68)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
          Thank you for joining <strong>Influence Without Authority: The Real Currency of Organisational Power</strong> on 14 November 2026.
        </p>
        <a
          href={`/api/event-certificates/${token}/download`}
          style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', marginTop: 34, minHeight: 54, padding: '0 28px', background: '#C9A84C', color: '#1A1A2E', textDecoration: 'none', fontWeight: 800, letterSpacing: '.04em' }}
        >
          DOWNLOAD MY CERTIFICATE
        </a>
        <p style={{ marginTop: 16, fontSize: 12, color: 'rgba(250,250,247,.48)' }}>Your certificate opens as a private download. No account is required.</p>
        <div style={{ margin: '44px 0 30px', borderTop: '1px solid rgba(201,168,76,.2)' }} />
        <p style={{ color: '#C9A84C', letterSpacing: '.15em', fontSize: 10, fontWeight: 700 }}>CONTINUE YOUR DEVELOPMENT</p>
        <h2 style={{ fontSize: 25, lineHeight: 1.3, margin: '14px 0' }}>Build the capabilities behind your professional value.</h2>
        <p style={{ color: 'rgba(250,250,247,.68)', lineHeight: 1.8, maxWidth: 540, margin: '0 auto' }}>
          Explore Valoria's professional conversations and development pathways, and continue building the judgement, influence and capability that move your work forward.
        </p>
        <Link href="/events" style={{ display: 'inline-block', marginTop: 22, color: '#C9A84C', fontWeight: 700 }}>Explore professional development →</Link>
        <div style={{ marginTop: 24 }}>
          <a href="https://youtu.be/Ae9N59SlR_8" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(250,250,247,.72)', fontSize: 13 }}>Watch the event replay ↗</a>
        </div>
        <div style={{ marginTop: 18 }}>
          <Link href="/marketplace" style={{ color: 'rgba(250,250,247,.55)', fontSize: 13 }}>Discover the Valoria talent marketplace</Link>
        </div>
      </section>
    </main>
  )
}
