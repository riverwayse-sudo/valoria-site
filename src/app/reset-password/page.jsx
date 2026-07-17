'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const GOLD = '#C9A84C'
const MIDNIGHT = '#1A1A2E'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'
const DIM = 'rgba(247,244,238,.45)'

export default function ResetPasswordPage() {
  const [password, setPassword]         = useState('')
  const [confirm, setConfirm]           = useState('')
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [done, setDone]                 = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [noSession, setNoSession]       = useState(false)

  useEffect(() => {
    // Supabase sends the user back here with a token in the URL hash.
    // onAuthStateChange fires with PASSWORD_RECOVERY event when the
    // token is valid — that gives us a live session to update against.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
    })
    // Also check if there's already an active session (user arrived via
    // email link on the same device they're already logged in on)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true)
    })
    // If after 3 seconds there's still no session, the link is invalid/expired
    const timer = setTimeout(() => {
      if (!sessionReady) setNoSession(true)
    }, 4000)
    return () => {
      listener.subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  async function handleReset(e) {
    e.preventDefault()
    if (password !== confirm) {
      setError("Passwords don't match — please check and try again.")
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setDone(true)
      // Sign out so they log back in cleanly with the new password
      setTimeout(() => supabase.auth.signOut(), 2000)
    } catch (err) {
      setError(err.message || 'Could not update password. Please try again or request a new reset link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={S.page}>
      <div style={S.card}>

        <div style={S.eyebrow}>
          <div style={S.eyebrowLine} />
          <span style={S.eyebrowText}>RESET PASSWORD</span>
          <div style={S.eyebrowLine} />
        </div>

        <Link href="/" style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <img src="/logo.png" alt="Valoria Institute" style={{ height: '44px', width: 'auto' }} />
        </Link>

        {done ? (
          <>
            <div style={{ fontSize: '28px', color: '#1D9E75', textAlign: 'center', marginBottom: '16px' }}>✓</div>
            <h2 style={{ ...S.title, fontSize: '24px' }}>Password updated.</h2>
            <p style={S.sub}>You'll be signed out in a moment. Sign in with your new password.</p>
            <Link href="/login" style={S.btnGold}>SIGN IN →</Link>
          </>
        ) : noSession && !sessionReady ? (
          <>
            <div style={{ fontSize: '28px', color: '#D85A30', textAlign: 'center', marginBottom: '16px' }}>⚠</div>
            <h2 style={{ ...S.title, fontSize: '22px' }}>Link expired or invalid.</h2>
            <p style={S.sub}>Password reset links are single-use and expire after 1 hour. Request a new one from the sign-in page.</p>
            <Link href="/login" style={S.btnGold}>BACK TO SIGN IN →</Link>
          </>
        ) : !sessionReady ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: '13px', color: DIM }}>Verifying reset link…</div>
          </div>
        ) : (
          <>
            <h1 style={S.title}>
              Set your<br /><em style={{ color: GOLD, fontStyle: 'italic' }}>new password.</em>
            </h1>
            <p style={S.sub}>Choose a strong password of at least 8 characters.</p>

            <form onSubmit={handleReset} style={S.form}>
              <div style={S.field}>
                <label style={S.label}>New Password</label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoFocus
                  style={S.input}
                />
              </div>
              <div style={S.field}>
                <label style={S.label}>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-enter your new password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  style={{
                    ...S.input,
                    borderColor: confirm
                      ? confirm === password
                        ? 'rgba(29,158,117,.5)'
                        : 'rgba(216,90,48,.5)'
                      : 'rgba(201,168,76,.2)',
                  }}
                />
                {confirm && confirm !== password && (
                  <span style={{ fontSize: '11px', color: '#F09595', marginTop: '4px' }}>Passwords don't match</span>
                )}
                {confirm && confirm === password && (
                  <span style={{ fontSize: '11px', color: '#7FD9B8', marginTop: '4px' }}>✓ Passwords match</span>
                )}
              </div>

              {error && <div style={S.errorBox}>{error}</div>}

              <button
                type="submit"
                disabled={loading || (confirm && confirm !== password)}
                style={{ ...S.btnGold, border: 'none', cursor: loading ? 'default' : 'pointer', opacity: loading || (confirm && confirm !== password) ? 0.6 : 1 }}
              >
                {loading ? 'UPDATING…' : 'SET NEW PASSWORD'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', fontFamily: "'Raleway','Helvetica Neue',Arial,sans-serif" },
  card: { width: '100%', maxWidth: '440px', background: 'rgba(26,26,46,.6)', border: '1px solid rgba(201,168,76,.15)', borderRadius: '12px', padding: 'clamp(32px,5vw,52px)' },
  eyebrow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' },
  eyebrowLine: { flex: 1, height: '1px', background: 'rgba(201,168,76,.3)' },
  eyebrowText: { fontSize: '10px', fontWeight: 700, letterSpacing: '.16em', color: GOLD },
  title: { fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 200, color: PARCHMENT, lineHeight: 1.1, marginBottom: '12px', letterSpacing: '-.02em' },
  sub: { fontSize: '14px', fontWeight: 300, color: DIM, marginBottom: '28px', lineHeight: 1.6 },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', color: DIM, textTransform: 'uppercase' },
  input: { padding: '12px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(201,168,76,.2)', borderRadius: '6px', color: PARCHMENT, fontSize: '14px', fontFamily: "'Raleway',sans-serif", outline: 'none', transition: 'border-color .2s' },
  btnGold: { display: 'block', width: '100%', padding: '16px', background: GOLD, color: MIDNIGHT, fontSize: '12px', fontWeight: 700, letterSpacing: '.14em', borderRadius: '999px', textAlign: 'center', textDecoration: 'none', fontFamily: "'Raleway',sans-serif", marginTop: '4px' },
  errorBox: { padding: '12px 14px', background: 'rgba(216,90,48,.12)', border: '1px solid rgba(216,90,48,.3)', borderRadius: '6px', fontSize: '13px', color: '#F09595' },
}
