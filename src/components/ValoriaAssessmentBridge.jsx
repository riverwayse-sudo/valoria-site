'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

const GOLD = '#C9A84C'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'
const MIDNIGHT = '#1A1A2E'
const MUTED = 'rgba(247,244,238,.66)'

function getFailureMessage(status, message) {
  if (status === 401) return 'Your sign-in session could not be verified. Sign in again to continue your saved assessment.'
  if (status === 403) return message || 'Your account needs attention before this assessment can continue.'
  if (status === 404) return 'We could not find a completed VALU snapshot linked to this account. Return to your dashboard or contact Valoria support if you believe this is incorrect.'
  if (status === 409) return message || 'This assessment cannot be continued from the current account state.'
  if (status === 503) return message || 'Secure assessment access is temporarily unavailable. Your account and saved responses have not been changed.'
  if (status >= 500) return 'Valoria could not securely connect to the assessment service. Your saved responses have not been changed.'
  return message || 'We could not open your saved assessment. Please try again.'
}

export default function ValoriaAssessmentBridge() {
  const attemptRef = useRef(0)
  const handoffPromiseRef = useRef(null)
  const [status, setStatus] = useState('connecting')
  const [error, setError] = useState('')

  const beginHandoff = useCallback(async () => {
    const attempt = ++attemptRef.current
    setStatus('connecting')
    setError('')

    try {
      // Reuse the same in-flight request if React replays the effect in
      // development Strict Mode. This avoids issuing multiple one-time codes.
      if (!handoffPromiseRef.current) {
        handoffPromiseRef.current = (async () => {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          if (sessionError) throw new Error('Your sign-in session could not be read. Please sign in again.')
          if (!session?.access_token) {
            const authError = new Error('Your session has ended. Sign in to continue your saved assessment.')
            authError.status = 401
            throw authError
          }

          const response = await fetch('/api/valu-handoff', {
            method: 'POST',
            headers: { Authorization: `Bearer ${session.access_token}` },
            cache: 'no-store',
          })
          const data = await response.json().catch(() => ({}))

          if (response.status === 409 && data.already_completed) {
            return { alreadyCompleted: true }
          }
          if (!response.ok || !data.url) {
            const failure = new Error(getFailureMessage(response.status, data.error))
            failure.status = response.status
            throw failure
          }

          let destination
          try {
            destination = new URL(data.url)
          } catch {
            throw new Error('The assessment service returned an invalid destination. Please return to your dashboard.')
          }
          const isLocalDevelopment = destination.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(destination.hostname)
          if (destination.protocol !== 'https:' && !isLocalDevelopment) {
            throw new Error('The assessment destination is not secure. Please return to your dashboard.')
          }
          return { url: destination.toString() }
        })()
      }

      const result = await handoffPromiseRef.current
      if (attempt !== attemptRef.current) return

      if (result.alreadyCompleted) {
        window.location.replace('/dashboard')
        return
      }

      setStatus('redirecting')
      // Do not add an artificial delay: the one-time code expires after 60s.
      window.location.replace(result.url)
    } catch (cause) {
      if (attempt !== attemptRef.current) return
      handoffPromiseRef.current = null
      setStatus('error')
      setError(cause?.message || 'We could not open your saved assessment. Please try again.')
      if (cause?.status === 401) {
        window.location.replace('/login?returnTo=%2Fdashboard')
      }
    }
  }, [])

  useEffect(() => {
    beginHandoff()
    return () => { attemptRef.current += 1 }
  }, [beginHandoff])

  return (
    <main style={{ minHeight: '100vh', background: DARK, color: PARCHMENT, display: 'grid', placeItems: 'center', padding: 'clamp(18px,4vw,36px)', fontFamily: "'Raleway',Arial,sans-serif" }}>
      <section aria-labelledby="handover-title" style={{ width: '100%', maxWidth: 720, padding: 'clamp(24px,5vw,48px)', border: '1px solid rgba(201,168,76,.24)', borderRadius: 16, background: MIDNIGHT, boxShadow: '0 24px 80px rgba(0,0,0,.24)' }}>
        <header style={{ marginBottom: 30 }}>
          <div style={{ color: GOLD, fontSize: 10, letterSpacing: '.22em', fontWeight: 800 }}>VALORIA INSTITUTE</div>
          <div style={{ color: 'rgba(247,244,238,.7)', fontFamily: "Georgia,'Times New Roman',serif", fontSize: 14, marginTop: 7 }}>Worth, Built.</div>
          <h1 id="handover-title" style={{ fontSize: 'clamp(27px,5vw,40px)', fontWeight: 500, lineHeight: 1.15, margin: '24px 0 12px', maxWidth: 580 }}>
            {status === 'error' ? 'We could not open your assessment.' : 'Your VALU journey continues.'}
          </h1>
          <p role="status" aria-live="polite" style={{ color: MUTED, fontSize: 14, lineHeight: 1.8, margin: 0 }}>
            {status === 'connecting' && 'We are verifying your signed-in account and preparing a secure link to your saved assessment.'}
            {status === 'redirecting' && 'Your account has been verified. Taking you to your assessment now.'}
            {status === 'error' && error}
          </p>
        </header>

        {status !== 'error' ? (
          <>
            <div style={{ border: '1px solid rgba(201,168,76,.2)', background: 'rgba(201,168,76,.045)', borderRadius: 10, padding: '20px 22px', marginBottom: 24 }}>
              <div style={{ color: GOLD, fontSize: 9, fontWeight: 800, letterSpacing: '.16em', marginBottom: 12 }}>WHAT HAPPENS NEXT</div>
              <ol style={{ margin: 0, paddingLeft: 19, color: PARCHMENT, fontSize: 13, lineHeight: 2 }}>
                <li>Your account and saved VALU snapshot are verified.</li>
                <li>Your assessment resumes from the first unanswered question.</li>
                <li>Your progress is saved as you complete the remaining assessment.</li>
                <li>On completion, your official VALU Index and PRIME insights become available.</li>
              </ol>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, color: 'rgba(247,244,238,.62)', fontSize: 11, lineHeight: 1.6 }}>
              <span aria-hidden="true" style={{ display: 'inline-block', width: 8, height: 8, flex: '0 0 8px', borderRadius: '50%', background: GOLD, boxShadow: '0 0 0 4px rgba(201,168,76,.12)' }} />
              Your saved responses are not being restarted or replaced.
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 24 }}>
            <button type="button" onClick={beginHandoff} style={{ background: GOLD, color: MIDNIGHT, border: 0, borderRadius: 999, padding: '13px 21px', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', cursor: 'pointer' }}>TRY AGAIN</button>
            <button type="button" onClick={() => window.location.assign('/dashboard')} style={{ background: 'transparent', color: PARCHMENT, border: '1px solid rgba(201,168,76,.35)', borderRadius: 999, padding: '13px 21px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>RETURN TO DASHBOARD</button>
          </div>
        )}
        <div style={{ borderTop: '1px solid rgba(247,244,238,.09)', marginTop: 30, paddingTop: 16, color: 'rgba(247,244,238,.36)', fontSize: 9, letterSpacing: '.12em' }}>
          SECURE ACCOUNT HANDOVER · VALORIA INSTITUTE
        </div>
      </section>
    </main>
  )
}
