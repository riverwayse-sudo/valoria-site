'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
  { auth: { persistSession: true, autoRefreshToken: true } }
)

export default function EventCertificateImportPage() {
  const [session, setSession] = useState(null)
  const [access, setAccess] = useState('checking')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [uploaded, setUploaded] = useState([])

  useEffect(() => {
    let alive = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive) return
      const current = data?.session || null
      setSession(current)
      if (!current?.access_token) {
        setAccess('signed-out')
        return
      }
      const response = await fetch('/api/admin/event-certificate-deliveries', {
        headers: { Authorization: `Bearer ${current.access_token}` },
        cache: 'no-store',
      })
      if (!alive) return
      setAccess(response.ok ? 'admin' : response.status === 403 ? 'forbidden' : 'unavailable')
    })
    return () => { alive = false }
  }, [])

  const canSubmit = useMemo(() => Boolean(
    access === 'admin' && session?.access_token && name.trim() &&
    /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.trim()) && file && !busy
  ), [access, session, name, email, file, busy])

  async function upload(event) {
    event.preventDefault()
    if (!canSubmit) return
    setBusy(true)
    setError('')
    try {
      const form = new FormData()
      form.set('recipient_name', name.trim())
      form.set('recipient_email', email.trim().toLowerCase())
      form.set('file', file)
      const response = await fetch('/api/admin/event-certificate-deliveries', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: form,
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result?.error || 'Certificate upload failed.')
      setUploaded(items => [{ name: result.certificate.recipient_name, email: result.certificate.recipient_email, url: result.download_page }, ...items])
      setName('')
      setEmail('')
      setFile(null)
      event.target.reset()
    } catch (uploadError) {
      setError(uploadError.message || 'Certificate upload failed.')
    } finally {
      setBusy(false)
    }
  }

  const styles = {
    page: { minHeight: '100vh', background: '#1A1A2E', color: '#FAFAF7', fontFamily: 'Raleway, sans-serif', padding: '48px 20px' },
    panel: { maxWidth: 760, margin: '0 auto', padding: 'clamp(24px, 5vw, 48px)', background: '#24243A', border: '1px solid rgba(201,168,76,.28)' },
    label: { display: 'block', margin: '20px 0 8px', color: '#EDE8DC', fontSize: 13, fontWeight: 700 },
    input: { width: '100%', minHeight: 48, padding: '12px 14px', background: '#1A1A2E', border: '1px solid rgba(237,232,220,.2)', color: '#FAFAF7', font: 'inherit', borderRadius: 2 },
  }

  return (
    <main style={styles.page}>
      <section style={styles.panel}>
        <p style={{ color: '#C9A84C', letterSpacing: '.2em', fontSize: 11, fontWeight: 800 }}>VALORIA INSTITUTE · ADMIN</p>
        <h1 style={{ fontSize: 'clamp(30px, 5vw, 44px)', lineHeight: 1.15, margin: '18px 0 10px' }}>Event certificate delivery</h1>
        <p style={{ color: 'rgba(250,250,247,.66)', lineHeight: 1.7 }}>Upload one PDF at a time. Each upload creates a private, personalised download link for that attendee.</p>

        {access === 'checking' && <p role="status">Checking administrator access…</p>}
        {access === 'signed-out' && <p role="alert">Sign in to Valoria with an administrator account, then reload this page.</p>}
        {access === 'forbidden' && <p role="alert">This account does not have administrator access.</p>}
        {access === 'unavailable' && <p role="alert">Administrator access could not be verified. Refresh and try again.</p>}

        {access === 'admin' && (
          <form onSubmit={upload}>
            <label style={styles.label} htmlFor="recipient-name">Attendee name</label>
            <input id="recipient-name" style={styles.input} value={name} onChange={event => setName(event.target.value)} maxLength={120} required />
            <label style={styles.label} htmlFor="recipient-email">Attendee email</label>
            <input id="recipient-email" type="email" style={styles.input} value={email} onChange={event => setEmail(event.target.value)} maxLength={254} required />
            <label style={styles.label} htmlFor="certificate-pdf">Individual PDF certificate (max 5 MB)</label>
            <input id="certificate-pdf" type="file" accept="application/pdf,.pdf" style={{ ...styles.input, padding: 10 }} onChange={event => setFile(event.target.files?.[0] || null)} required />
            {error && <p role="alert" style={{ color: '#F3B6A8', marginTop: 18 }}>{error}</p>}
            <button type="submit" disabled={!canSubmit} style={{ marginTop: 24, width: '100%', minHeight: 52, border: 0, background: canSubmit ? '#C9A84C' : '#77736A', color: '#1A1A2E', fontWeight: 800, cursor: canSubmit ? 'pointer' : 'not-allowed' }}>
              {busy ? 'UPLOADING…' : 'UPLOAD & CREATE PRIVATE LINK'}
            </button>
          </form>
        )}

        {uploaded.length > 0 && (
          <section aria-live="polite" style={{ marginTop: 36, borderTop: '1px solid rgba(201,168,76,.2)', paddingTop: 24 }}>
            <h2 style={{ fontSize: 20 }}>Created download links</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {uploaded.map((item, index) => (
                <li key={item.url} style={{ padding: '16px 0', borderBottom: '1px solid rgba(237,232,220,.12)' }}>
                  <strong>{item.name}</strong><div style={{ color: 'rgba(250,250,247,.6)', fontSize: 13, margin: '4px 0 10px' }}>{item.email}</div>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: '#C9A84C', overflowWrap: 'anywhere' }}>Open attendee download page</a>
                  <button type="button" onClick={() => navigator.clipboard.writeText(item.url)} style={{ marginLeft: 14, border: 0, background: 'transparent', color: '#FAFAF7', textDecoration: 'underline', cursor: 'pointer' }}>Copy link</button>
                </li>
              ))}
            </ul>
          </section>
        )}
        <p style={{ marginTop: 32 }}><Link href="/events" style={{ color: '#C9A84C' }}>Return to Events →</Link></p>
      </section>
    </main>
  )
}
