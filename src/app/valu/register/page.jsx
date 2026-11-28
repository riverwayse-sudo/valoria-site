'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PASSWORD_POLICY, passwordPolicyMessage, validatePassword } from '@/lib/password-policy'
const GOLD = '#C9A84C'
const DARK = '#0F0F1A'
const MIDNIGHT = '#1A1A2E'
const PARCHMENT = '#F7F4EE'
const MUTED = 'rgba(247,244,238,.62)'
const EXPERIENCE = [
  ['0-3', '0–3 years'],
  ['4-8', '4–8 years'],
  ['9-15', '9–15 years'],
  ['16+', '16+ years'],
]

export default function ValuRegisterPage() {
  const [form, setForm] = useState({
    name: '', role: '', experience: '', email: '', password: '', confirmPassword: '',
    privacyAcknowledged: false, marketingConsent: false,
  })
  const [hasSession, setHasSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const valid = useMemo(() => {
    const identityValid = !!(form.name.trim() && form.role.trim() && form.experience && form.email.trim() && form.privacyAcknowledged)
    if (!identityValid) return false
    return hasSession || (
      form.password.length >= PASSWORD_POLICY.minLength &&
      form.password === form.confirmPassword
    )
  }, [form, hasSession])

  async function startTaster(accessToken) {
    const response = await fetch('/api/valu-taster/start', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data.url) {
      throw new Error(data.error || 'We could not securely prepare your Taster. Your account details remain saved; please retry.')
    }
    window.location.replace(data.url)
  }

  useEffect(() => {
    let active = true
    async function inspectAccount() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!active) return
        if (!session?.access_token) {
          setCheckingSession(false)
          return
        }
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) throw userError || new Error('Your Valoria session could not be verified.')
        if (!active) return
        setHasSession(true)
        const metadata = user.user_metadata || {}
        const next = {
          name: metadata.full_name || metadata.display_name || '',
          role: metadata.role || '',
          experience: metadata.experience || '',
          email: user.email || '',
          password: '',
          confirmPassword: '',
          privacyAcknowledged: metadata.privacy_acknowledged === true,
          marketingConsent: metadata.marketing_consent === true,
        }
        setForm(current => ({ ...current, ...next }))
        const ready = !!user.email_confirmed_at && metadata.valu_taster_signup === true &&
          metadata.privacy_acknowledged === true && next.name && next.role && next.experience
        if (ready) {
          setNotice('Your confirmed account is ready. Preparing your secure Taster access…')
          await startTaster(session.access_token)
        }
      } catch (reason) {
        if (active) setError(reason?.message || 'We could not verify your Valoria account. Please sign in again.')
      } finally {
        if (active) setCheckingSession(false)
      }
    }
    inspectAccount()
    return () => { active = false }
  }, [])

  async function submit(event) {
    event.preventDefault()
    if (!valid || loading) return
    setLoading(true)
    setError('')
    setNotice('')
    try {
      const passwordCheck = hasSession ? { valid: true, errors: [] } : validatePassword(form.password)
      if (!passwordCheck.valid) throw new Error(passwordCheck.errors.join(' '))
      const metadata = {
        display_name: form.name.trim(),
        full_name: form.name.trim(),
        user_type: 'professional',
        role: form.role.trim(),
        experience: form.experience,
        valu_taster_signup: true,
        privacy_acknowledged: true,
        privacy_notice_version: '2026-11-12',
        marketing_consent: form.marketingConsent,
      }

      if (hasSession) {
        const { data, error: updateError } = await supabase.auth.updateUser({ data: metadata })
        if (updateError) throw updateError
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token || !data?.user?.email_confirmed_at) {
          throw new Error('Sign in with a confirmed Valoria account to begin the Taster. New accounts can begin before email confirmation.')
        }
        await startTaster(session.access_token)
        return
      }

      const response = await fetch('/api/valu-taster/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          name: form.name.trim(),
          role: form.role.trim(),
          experience: form.experience,
          email: form.email.trim().toLowerCase(),
          password: form.password,
          privacyAcknowledged: form.privacyAcknowledged,
          marketingConsent: form.marketingConsent,
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result.url) {
        throw new Error(result.error || 'Your Valoria account could not be securely prepared.')
      }
      window.location.replace(result.url)
    } catch (reason) {
      setError(reason?.message || 'We could not create your Valoria account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return <main style={styles.page}><section style={styles.card}><div style={styles.eyebrow}>VALORIA INSTITUTE</div><h1 style={styles.title}>Preparing your account.</h1><p style={styles.copy}>Checking your secure Valoria session…</p></section></main>
  }

  return <main style={styles.page}>
    <section style={styles.card}>
      <Link href="/" style={styles.brand}>VALORIA INSTITUTE</Link>
      <div style={styles.eyebrow}>YOUR VALU INDEX JOURNEY</div>
      <h1 style={styles.title}>Your account comes first.</h1>
      <p style={styles.copy}>Create your Valoria account, complete your Taster, then confirm your email to access your dashboard and full VALU Index.</p>
      {hasSession && <p style={styles.notice}>You are signed in. Complete or confirm your professional details to begin.</p>}
      <form onSubmit={submit} style={styles.form}>
        <label style={styles.label}>FULL NAME
          <input required autoComplete="name" maxLength={200} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={styles.input} placeholder="Your full professional name" />
        </label>
        <label style={styles.label}>CURRENT ROLE
          <input required autoComplete="organization-title" maxLength={160} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={styles.input} placeholder="e.g. Managing Director" />
        </label>
        <label style={styles.label}>PROFESSIONAL EXPERIENCE
          <select className="vi-select" required value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} style={styles.input}>
            <option value="">Select your experience</option>
            {EXPERIENCE.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label style={styles.label}>EMAIL ADDRESS
          <input required type="email" autoComplete="email" maxLength={254} readOnly={hasSession} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ ...styles.input, opacity: hasSession ? .78 : 1 }} placeholder="you@example.com" />
        </label>
        {!hasSession && <>
          <label style={styles.label}>PASSWORD
            <input required type="password" autoComplete="new-password" minLength={PASSWORD_POLICY.minLength} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={styles.input} placeholder={`Minimum ${PASSWORD_POLICY.minLength} characters`} />
          </label>
          <p style={styles.small}>{passwordPolicyMessage()}</p>
          <label style={styles.label}>CONFIRM PASSWORD
            <input required type="password" autoComplete="new-password" minLength={PASSWORD_POLICY.minLength} value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} style={styles.input} placeholder="Enter your password again" />
          </label>
        </>}
        <label style={styles.consent}>
          <input type="checkbox" required checked={form.privacyAcknowledged} onChange={e => setForm({ ...form, privacyAcknowledged: e.target.checked })} />
          <span>I acknowledge that Valoria will process my information to administer my assessment and manage my account. I have read the <Link href="/privacypolicy" style={styles.inlineLink}>Privacy Notice</Link>.</span>
        </label>
        <label style={styles.consent}>
          <input type="checkbox" checked={form.marketingConsent} onChange={e => setForm({ ...form, marketingConsent: e.target.checked })} />
          <span>I would also like to receive relevant Valoria updates and opportunities by email. This is optional.</span>
        </label>
        {error && <p role="alert" style={styles.error}>{error}</p>}
        {notice && <p role="status" style={styles.notice}>{notice}</p>}
        <button type="submit" disabled={!valid || loading} style={{ ...styles.primary, opacity: !valid || loading ? .55 : 1 }}>{loading ? 'SAVING…' : hasSession ? 'SAVE DETAILS & BEGIN TASTER →' : 'CREATE ACCOUNT & BEGIN TASTER →'}</button>
      </form>
      <p style={styles.small}>Already have a Valoria account? <Link href="/login?returnTo=%2Fvalu%2Fregister%2F%3Fjourney%3Dvalu_taster" style={styles.inlineLink}>Sign in to continue.</Link></p>
    </section>
  </main>
}

const styles = {
  page: { minHeight: '100vh', background: DARK, color: PARCHMENT, display: 'grid', placeItems: 'center', padding: '32px 16px', fontFamily: "'Raleway', Arial, sans-serif" },
  card: { width: '100%', maxWidth: 560, padding: 'clamp(24px, 5vw, 44px)', borderRadius: 14, border: '1px solid rgba(201,168,76,.22)', background: MIDNIGHT, boxShadow: '0 24px 70px rgba(0,0,0,.28)' },
  brand: { display: 'inline-block', color: GOLD, textDecoration: 'none', fontSize: 11, fontWeight: 800, letterSpacing: '.18em', marginBottom: 28 },
  eyebrow: { color: GOLD, fontSize: 10, fontWeight: 800, letterSpacing: '.18em', marginBottom: 12 },
  title: { color: PARCHMENT, fontSize: 'clamp(36px, 7vw, 54px)', lineHeight: 1.08, fontWeight: 500, margin: '0 0 14px' },
  copy: { color: MUTED, fontSize: 14, lineHeight: 1.75, margin: '0 0 24px' },
  form: { display: 'grid', gap: 13 },
  label: { display: 'grid', gap: 7, color: 'rgba(247,244,238,.72)', fontSize: 9, fontWeight: 800, letterSpacing: '.12em' },
  input: { width: '100%', boxSizing: 'border-box', minHeight: 46, padding: '12px 13px', borderRadius: 7, border: '1px solid rgba(212,201,168,.22)', background: '#23233A', color: PARCHMENT, fontSize: 14, fontFamily: 'inherit', outline: 'none' },
  consent: { display: 'flex', alignItems: 'flex-start', gap: 10, color: MUTED, fontSize: 11, lineHeight: 1.65 },
  primary: { width: '100%', minHeight: 48, border: 0, borderRadius: 999, background: GOLD, color: DARK, fontSize: 10, fontWeight: 900, letterSpacing: '.12em', cursor: 'pointer', marginTop: 6 },
  secondary: { width: '100%', minHeight: 44, border: '1px solid rgba(201,168,76,.35)', borderRadius: 999, background: 'transparent', color: GOLD, fontSize: 10, fontWeight: 800, letterSpacing: '.1em', cursor: 'pointer' },
  inlineLink: { color: GOLD, textDecoration: 'underline' },
  small: { color: '#B8B6BF', fontSize: 11, lineHeight: 1.65, marginTop: 14 },
  error: { color: '#F0A5A5', fontSize: 12, lineHeight: 1.6 },
  notice: { color: '#D4C9A8', fontSize: 12, lineHeight: 1.6 },
}
