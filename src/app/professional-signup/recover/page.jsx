'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PASSWORD_POLICY, passwordPolicyMessage, validatePassword } from '@/lib/password-policy'

const GOLD = '#C9A84C'
const DARK = '#0F0F1A'
const PARCH = '#F7F4EE'

export default function RecoverTasterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [existingAccount, setExistingAccount] = useState(false)
  const [error, setError] = useState('')

  const valid = form.name.trim().length >= 2
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    && form.password.length >= PASSWORD_POLICY.minLength
    && form.password === form.confirm

  async function submit(event) {
    event.preventDefault()
    if (!valid || loading) return
    const passwordCheck = validatePassword(form.password)
    if (!passwordCheck.valid) {
      setError(passwordCheck.errors.join(' '))
      return
    }

    setLoading(true)
    setError('')
    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?claim_taster=true`,
          data: {
            display_name: form.name.trim(),
            full_name: form.name.trim(),
            user_type: 'professional',
            role: 'professional',
          },
        },
      })
      if (signupError) throw signupError

      if (Array.isArray(data?.user?.identities) && data.user.identities.length === 0) {
        setExistingAccount(true)
        return
      }
      if (!data?.user?.id) throw new Error('Your account could not be created. Please try again.')
      setSent(true)
    } catch (err) {
      setError(err?.message || 'We could not start your recovery. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: DARK, color: PARCH, display: 'grid', placeItems: 'center', padding: 24, fontFamily: "'Raleway', Arial, sans-serif" }}>
      <section style={{ width: '100%', maxWidth: 560, padding: 'clamp(28px, 5vw, 52px)', border: '1px solid rgba(201,168,76,.24)', borderRadius: 16, background: '#1A1A2E' }}>
        <div style={{ color: GOLD, fontSize: 11, letterSpacing: '.22em', fontWeight: 800, marginBottom: 12 }}>VALORIA INSTITUTE</div>
        <h1 style={{ fontSize: 30, lineHeight: 1.2, fontWeight: 500, margin: '0 0 12px' }}>Reconnect your saved VALU taster</h1>
        <p style={{ color: 'rgba(247,244,238,.68)', fontSize: 14, lineHeight: 1.8, margin: '0 0 26px' }}>
          Create your professional account using the same email address and name you provided when completing your taster. Valoria will reconnect a saved record when the identity details match. Public listing requires a separate visibility choice.
        </p>

        {sent ? (
          <div role="status" style={{ border: '1px solid rgba(201,168,76,.3)', borderRadius: 12, padding: 20 }}>
            <h2 style={{ color: GOLD, fontSize: 16, margin: '0 0 10px' }}>Check your email</h2>
            <p style={{ fontSize: 13, lineHeight: 1.8, margin: '0 0 18px', color: 'rgba(247,244,238,.72)' }}>
              We sent a confirmation link to <strong>{form.email.trim()}</strong>. Confirm your email to securely reconnect any matching saved taster and open your dashboard.
            </p>
            <Link href="/login" style={{ color: GOLD, fontSize: 12, fontWeight: 700, letterSpacing: '.08em' }}>ALREADY CONFIRMED? SIGN IN →</Link>
          </div>
        ) : existingAccount ? (
          <div role="status" style={{ border: '1px solid rgba(201,168,76,.3)', borderRadius: 12, padding: 20 }}>
            <h2 style={{ color: GOLD, fontSize: 16, margin: '0 0 10px' }}>An account already exists</h2>
            <p style={{ fontSize: 13, lineHeight: 1.8, margin: '0 0 18px', color: 'rgba(247,244,238,.72)' }}>
              Sign in with this email address. Valoria will check for a saved taster that matches your confirmed account and profile name.
            </p>
            <Link href="/login" style={{ display: 'inline-block', padding: '12px 20px', borderRadius: 999, background: GOLD, color: '#1A1A2E', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textDecoration: 'none' }}>SIGN IN TO RECONNECT</Link>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
            <label style={{ display: 'grid', gap: 7, fontSize: 11, letterSpacing: '.08em', color: 'rgba(247,244,238,.65)' }}>
              NAME USED FOR YOUR TASTER
              <input required autoComplete="name" value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} style={fieldStyle} placeholder="Your full name" />
            </label>
            <label style={{ display: 'grid', gap: 7, fontSize: 11, letterSpacing: '.08em', color: 'rgba(247,244,238,.65)' }}>
              EMAIL USED FOR YOUR TASTER
              <input required type="email" autoComplete="email" value={form.email} onChange={e => setForm(v => ({ ...v, email: e.target.value }))} style={fieldStyle} placeholder="you@example.com" />
            </label>
            <label style={{ display: 'grid', gap: 7, fontSize: 11, letterSpacing: '.08em', color: 'rgba(247,244,238,.65)' }}>
              CREATE A PASSWORD
              <input required type="password" autoComplete="new-password" value={form.password} onChange={e => setForm(v => ({ ...v, password: e.target.value }))} style={fieldStyle} placeholder={passwordPolicyMessage()} />
            </label>
            <label style={{ display: 'grid', gap: 7, fontSize: 11, letterSpacing: '.08em', color: 'rgba(247,244,238,.65)' }}>
              CONFIRM PASSWORD
              <input required type="password" autoComplete="new-password" value={form.confirm} onChange={e => setForm(v => ({ ...v, confirm: e.target.value }))} style={fieldStyle} placeholder="Re-enter your password" />
            </label>
            {error && <p role="alert" style={{ color: '#E9A6A6', fontSize: 12, lineHeight: 1.6, margin: 0 }}>{error}</p>}
            <button disabled={!valid || loading} type="submit" style={{ marginTop: 8, padding: '15px 20px', border: 0, borderRadius: 999, background: GOLD, color: '#1A1A2E', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', cursor: valid && !loading ? 'pointer' : 'not-allowed', opacity: valid && !loading ? 1 : .55 }}>
              {loading ? 'SENDING CONFIRMATION…' : 'CREATE ACCOUNT & RECONNECT TASTER'}
            </button>
            <p style={{ color: 'rgba(247,244,238,.42)', fontSize: 11, lineHeight: 1.7, margin: 0 }}>{passwordPolicyMessage()}</p>
          </form>
        )}

        <div style={{ borderTop: '1px solid rgba(247,244,238,.1)', marginTop: 24, paddingTop: 18, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/login" style={{ color: 'rgba(247,244,238,.55)', fontSize: 11, textDecoration: 'none' }}>Back to sign in</Link>
          <Link href="/valu/assessment" style={{ color: GOLD, fontSize: 11, textDecoration: 'none' }}>Start a new VALU taster →</Link>
        </div>
      </section>
    </main>
  )
}

const fieldStyle = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'rgba(247,244,238,.06)',
  border: '1px solid rgba(201,168,76,.2)',
  borderRadius: 8,
  padding: '13px 14px',
  color: PARCH,
  fontSize: 14,
  outline: 'none',
}
