'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ValoriaHandoverCards from '@/components/ValoriaHandoverCards'

export default function ValoriaAssessmentBridge() {
  const router = useRouter()
  const started = useRef(false)
  const [message, setMessage] = useState('Preparing your saved assessment securely…')
  const [error, setError] = useState('')

  useEffect(() => {
    if (started.current) return
    started.current = true
    let cancelled = false
    let redirectTimer

    async function openAssessment() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
          router.replace('/login?returnTo=%2Fdashboard')
          return
        }

        const response = await fetch('/api/valu-handoff', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok || !data.url) {
          if (data.already_completed) {
            router.replace('/dashboard')
            return
          }
          throw new Error(data.error || 'We could not securely open your saved assessment.')
        }

        if (cancelled) return
        setMessage('Your saved responses are ready. Taking you to your next question…')
        // Keep the short introduction visible long enough to read, while the
        // one-time handoff token remains comfortably inside its 60-second TTL.
        redirectTimer = window.setTimeout(() => {
          if (!cancelled) window.location.assign(data.url)
        }, 3200)
      } catch (cause) {
        if (!cancelled) setError(cause?.message || 'Your assessment could not be opened. Please try again.')
      }
    }

    openAssessment()
    return () => {
      cancelled = true
      if (redirectTimer) window.clearTimeout(redirectTimer)
    }
  }, [router])

  return (
    <main style={{ minHeight: '100vh', background: '#0F0F1A', color: '#F7F4EE', display: 'grid', placeItems: 'center', padding: 'clamp(16px,3vw,32px)', fontFamily: "'Raleway',Arial,sans-serif" }}>
      <section style={{ width: '100%', maxWidth: 1180, padding: 'clamp(18px,3vw,34px)', border: '1px solid rgba(201,168,76,.25)', borderRadius: 16, background: '#1A1A2E' }}>
        <header style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ color: '#C9A84C', fontSize: 11, letterSpacing: '.22em', fontWeight: 800 }}>VALORIA INSTITUTE</div>
          <div style={{ color: '#F7F4EE', fontFamily: "Georgia,'Times New Roman',serif", fontSize: 15, marginTop: 6 }}>Worth. Built.</div>
          <h1 style={{ fontSize: 'clamp(23px,3vw,32px)', fontWeight: 500, margin: '18px 0 8px' }}>Your next chapter starts here.</h1>
          <p role="status" aria-live="polite" style={{ color: 'rgba(247,244,238,.68)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{message}</p>
        </header>
        <ValoriaAssessmentBridgeCards />
        {error && (
          <div role="alert" style={{ marginTop: 18, padding: 16, border: '1px solid rgba(240,149,149,.4)', borderRadius: 10, color: '#F09595', textAlign: 'center' }}>
            <p style={{ margin: '0 0 12px' }}>{error}</p>
            <button onClick={() => window.location.reload()} style={{ background: '#C9A84C', color: '#1A1A2E', border: 0, borderRadius: 999, padding: '11px 20px', fontWeight: 800, cursor: 'pointer' }}>TRY AGAIN</button>
            <button onClick={() => router.push('/dashboard')} style={{ marginLeft: 10, background: 'transparent', color: '#F7F4EE', border: '1px solid rgba(201,168,76,.35)', borderRadius: 999, padding: '11px 20px', cursor: 'pointer' }}>BACK TO DASHBOARD</button>
          </div>
        )}
      </section>
    </main>
  )
}

function ValoriaAssessmentBridgeCards() {
  return <ValoriaHandoverCards />
}
