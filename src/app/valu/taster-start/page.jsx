'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ValuTasterStartPage() {
  const [message, setMessage] = useState('Verifying your Valoria account and preparing your taster…')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function start() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
          window.location.replace('/login?returnTo=%2Fvalu%2Ftaster-start')
          return
        }
        const { data: { user } } = await supabase.auth.getUser()
        if (!user?.email_confirmed_at) {
          window.location.replace('/login?returnTo=%2Fvalu%2Ftaster-start')
          return
        }
        const response = await fetch('/api/valu-taster-start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        })
        const payload = await response.json().catch(() => ({}))
        if (!response.ok || !payload.url) throw new Error(payload.error || 'Your taster could not be opened securely.')
        if (!cancelled) window.location.replace(payload.url)
      } catch (error) {
        if (cancelled) return
        setFailed(true)
        setMessage(error?.message || 'We could not verify your account. Please sign in and try again.')
      }
    }
    start()
    return () => { cancelled = true }
  }, [])

  return (
    <main style={{ minHeight: '100vh', background: '#1A1A2E', color: '#F7F4EE', display: 'grid', placeItems: 'center', padding: 24, fontFamily: "'Raleway', Arial, sans-serif" }}>
      <section style={{ width: '100%', maxWidth: 520, padding: 36, border: '1px solid rgba(201,168,76,.22)', borderRadius: 16, textAlign: 'center' }}>
        <div style={{ color: '#C9A84C', fontSize: 11, letterSpacing: '.2em', fontWeight: 800, marginBottom: 24 }}>VALORIA INSTITUTE</div>
        <h1 style={{ fontSize: 30, fontWeight: 500, margin: '0 0 14px' }}>{failed ? 'Your taster is not ready yet.' : 'Preparing your taster.'}</h1>
        <p role={failed ? 'alert' : 'status'} style={{ color: '#EDE8DC', lineHeight: 1.7, fontSize: 14 }}>{message}</p>
        {failed && <a href="/login?returnTo=%2Fvalu%2Ftaster-start" style={{ display: 'inline-block', marginTop: 12, padding: '13px 22px', background: '#C9A84C', color: '#1A1A2E', borderRadius: 999, textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>SIGN IN AND TRY AGAIN</a>}
      </section>
    </main>
  )
}
