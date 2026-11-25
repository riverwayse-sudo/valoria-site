'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

async function resolveAssessmentDestination() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw new Error('We could not verify your Valoria session. Please sign in again.')
  if (!session?.access_token || !session.user?.email_confirmed_at) {
    return '/login?returnTo=%2Fassessment%2Fcontinue'
  }

  // Complete a pending Taster claim only after the server verifies the
  // authenticated account, exact email evidence and saved snapshot identity.
  const pendingTasterId = window.localStorage.getItem('pending_taster_id')
  if (pendingTasterId) {
    const linkResponse = await fetch('/api/link-taster', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ taster_id: pendingTasterId }),
      cache: 'no-store',
    })
    const linkData = await linkResponse.json().catch(() => ({}))
    if (!linkResponse.ok) {
      throw new Error(linkData.error || 'Your saved Taster could not be connected. Your responses remain saved.')
    }
    window.localStorage.removeItem('pending_taster_id')
    window.localStorage.removeItem('pending_taster_name')
    window.localStorage.removeItem('pending_taster_role')
    window.localStorage.removeItem('valu_taster_first_resume_token')
  }

  const accessResponse = await fetch('/api/valu-handoff', {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: 'no-store',
  })
  const access = await accessResponse.json().catch(() => ({}))
  if (!accessResponse.ok) {
    if (accessResponse.status === 401 || accessResponse.status === 403) {
      return '/login?returnTo=%2Fassessment%2Fcontinue'
    }
    throw new Error(access.error || 'We could not verify your assessment status. Please retry.')
  }

  if (access.assessment_completed) return '/dashboard'
  if (!access.can_continue) return '/valu/register/'

  const handoffResponse = await fetch('/api/valu-handoff', {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: 'no-store',
  })
  const handoff = await handoffResponse.json().catch(() => ({}))
  if (handoff.already_completed) return '/dashboard'
  if (!handoffResponse.ok || !handoff.url) {
    throw new Error(handoff.error || 'We could not securely open your saved assessment. Please retry.')
  }

  const destination = new URL(handoff.url, window.location.origin)
  if (destination.protocol !== 'https:') {
    throw new Error('The assessment destination could not be verified.')
  }
  return destination.toString()
}

export default function AssessmentContinuePage() {
  const attemptRef = useRef(null)
  const [message, setMessage] = useState('Verifying your saved VALU Index journey…')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    if (!attemptRef.current) attemptRef.current = resolveAssessmentDestination()
    attemptRef.current.then(destination => {
      if (!cancelled) {
        setMessage('Your next step is ready. Opening it securely…')
        window.location.assign(destination)
      }
    }).catch(reason => {
      if (!cancelled) {
        setError(reason?.message || 'We could not open your assessment. Your saved responses have not been changed.')
      }
    })
    return () => { cancelled = true }
  }, [])

  function retry() {
    attemptRef.current = null
    setError('')
    setMessage('Verifying your saved VALU Index journey…')
    // A state update remounts the resolver effect without changing any saved data.
    window.location.reload()
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0F0F1A', color: '#F7F4EE', display: 'grid', placeItems: 'center', padding: 24, fontFamily: "'Raleway', Arial, sans-serif" }}>
      <section style={{ width: '100%', maxWidth: 560, padding: 'clamp(28px, 5vw, 48px)', border: '1px solid rgba(201,168,76,.25)', borderRadius: 14, background: '#1A1A2E' }}>
        <div style={{ color: '#C9A84C', fontSize: 11, fontWeight: 800, letterSpacing: '.2em' }}>VALORIA INSTITUTE</div>
        <h1 style={{ fontSize: 28, lineHeight: 1.25, fontWeight: 600, margin: '18px 0 12px' }}>Continue your VALU Index.</h1>
        <p role={error ? 'alert' : 'status'} style={{ color: 'rgba(247,244,238,.76)', fontSize: 14, lineHeight: 1.8 }}>{error || message}</p>
        {error && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 22 }}>
            <button type="button" onClick={retry} style={{ border: 0, borderRadius: 999, padding: '13px 20px', background: '#C9A84C', color: '#1A1A2E', fontWeight: 800, cursor: 'pointer' }}>TRY AGAIN</button>
            <a href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', padding: '13px 20px', border: '1px solid rgba(201,168,76,.35)', borderRadius: 999, color: '#F7F4EE', textDecoration: 'none', fontWeight: 700 }}>DASHBOARD</a>
          </div>
        )}
      </section>
    </main>
  )
}
