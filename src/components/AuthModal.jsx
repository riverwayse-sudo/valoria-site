'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PASSWORD_POLICY, passwordPolicyMessage, validatePassword } from '@/lib/password-policy'

const GOLD = '#C9A84C'
const PARCHMENT = '#F7F4EE'

export default function AuthModal({ open, onClose, initialMode = 'signin' }) {
  const [mode, setMode] = useState(initialMode)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!open) return
    setMode(initialMode)
    setError('')
    setNotice('')
  }, [open, initialMode])

  useEffect(() => {
    if (!open) return
    const onKeyDown = event => { if (event.key === 'Escape' && !loading) onClose?.() }
    document.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, loading, onClose])

  if (!open) return null

  function switchMode(next) {
    setMode(next)
    setError('')
    setNotice('')
  }

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')
    try {
      if (mode === 'signup') {
        if (form.password !== form.confirmPassword) throw new Error("Your passwords don't match.")
        const check = validatePassword(form.password)
        if (!check.valid) throw new Error(check.errors.join(' '))
        const { data, error: authError } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: { display_name: form.name.trim() },
            emailRedirectTo: 'https://valoriainstitute.com/auth/callback',
          },
        })
        if (authError) throw authError
        if (data.session) {
          window.location.assign('/dashboard')
          return
        }
        setNotice('Your account has been created. Check your email and confirm your address to open your Valoria dashboard.')
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password })
        if (authError) throw authError
        document.cookie = 'vi_waitlist_v2=submitted; path=/; max-age=31536000; samesite=lax'
        window.location.assign('/dashboard')
      }
    } catch (err) {
      setError(err?.message || 'We could not complete that request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function resetPassword() {
    if (!form.email.trim()) { setError('Enter your email address first, then request a password reset.'); return }
    setLoading(true)
    setError('')
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(form.email.trim(), {
        redirectTo: 'https://valoriainstitute.com/reset-password',
      })
      if (resetError) throw resetError
      setNotice('If an account exists for that email, a password reset link will be sent.')
    } catch (err) {
      setError(err?.message || 'We could not send the reset email. Please try again.')
    } finally { setLoading(false) }
  }

  const signup = mode === 'signup'
  return (
    <div className="vi-auth-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !loading) onClose?.() }}>
      <section className="vi-auth-modal" role="dialog" aria-modal="true" aria-labelledby="vi-auth-title">
        <button type="button" className="vi-auth-close" onClick={onClose} aria-label="Close account dialog" disabled={loading}>×</button>
        <div className="vi-auth-eyebrow">VALORIA INSTITUTE</div>
        <h2 id="vi-auth-title">{notice && signup ? 'Check your email.' : signup ? 'Create your account.' : 'Welcome back.'}</h2>
        <p className="vi-auth-copy">{signup ? 'Create your account first. You’ll choose your Valoria pathway after confirming your email.' : 'Sign in to continue to your Valoria dashboard.'}</p>
        {notice ? <div className="vi-auth-notice" role="status">{notice}</div> : (
          <form onSubmit={submit} className="vi-auth-form">
            {signup && <label>Full name<input autoComplete="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Your full name" /></label>}
            <label>Email address<input type="email" autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" /></label>
            <label>Password<span className="vi-auth-password"><input type={showPassword ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={signup ? PASSWORD_POLICY.minLength : 1} placeholder={signup ? 'Create a secure password' : 'Your password'} /><button type="button" onClick={() => setShowPassword(v => !v)}>{showPassword ? 'Hide' : 'Show'}</button></span></label>
            {signup && <>
              <label>Confirm password<input type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required minLength={PASSWORD_POLICY.minLength} placeholder="Re-enter your password" /></label>
              <p className="vi-auth-hint">{passwordPolicyMessage()}</p>
            </>}
            {error && <div className="vi-auth-error" role="alert">{error}</div>}
            <button className="vi-auth-submit" type="submit" disabled={loading}>{loading ? 'PLEASE WAIT…' : signup ? 'CREATE ACCOUNT' : 'SIGN IN'}</button>
            {!signup && <button className="vi-auth-link" type="button" onClick={resetPassword} disabled={loading}>Forgot password?</button>}
          </form>
        )}
        {error && notice && <div className="vi-auth-error" role="alert">{error}</div>}
        <div className="vi-auth-switch">
          {signup ? <>Already have an account? <button type="button" onClick={() => switchMode('signin')}>Sign in</button></> : <>New to Valoria? <button type="button" onClick={() => switchMode('signup')}>Create an account</button></>}
        </div>
        <p className="vi-auth-legal">By continuing, you agree to our <Link href="/terms-of-use" onClick={onClose}>Terms</Link> and <Link href="/privacypolicy" onClick={onClose}>Privacy Policy</Link>.</p>
      </section>
      <style jsx>{`
        .vi-auth-backdrop{position:fixed;inset:0;z-index:10050;background:rgba(5,5,12,.82);backdrop-filter:blur(8px);display:grid;place-items:center;padding:20px;overflow-y:auto}
        .vi-auth-modal{position:relative;width:min(100%,480px);max-height:calc(100dvh - 40px);overflow-y:auto;background:#1A1A2E;border:1px solid rgba(201,168,76,.28);border-radius:16px;padding:clamp(26px,5vw,44px);color:#F7F4EE;box-shadow:0 24px 90px rgba(0,0,0,.45)}
        .vi-auth-close{position:absolute;right:16px;top:12px;background:transparent;border:0;color:rgba(247,244,238,.7);font-size:30px;cursor:pointer}
        .vi-auth-eyebrow{color:#C9A84C;font-size:10px;font-weight:800;letter-spacing:.2em;margin-bottom:18px}
        h2{font-size:clamp(26px,5vw,34px);line-height:1.15;margin:0 30px 10px 0;color:#F7F4EE}
        .vi-auth-copy{font-size:13px;line-height:1.65;color:rgba(247,244,238,.65);margin:0 0 24px}
        .vi-auth-form{display:grid;gap:15px}.vi-auth-form label{display:grid;gap:7px;color:rgba(247,244,238,.72);font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
        .vi-auth-form input{width:100%;min-width:0;padding:13px 14px;border:1px solid rgba(201,168,76,.22);border-radius:7px;background:rgba(255,255,255,.045);color:#F7F4EE;font:14px Raleway,sans-serif;outline:none}
        .vi-auth-form input:focus{border-color:#C9A84C;box-shadow:0 0 0 2px rgba(201,168,76,.12)}
        .vi-auth-password{display:flex;gap:8px}.vi-auth-password button{padding:0 10px;background:transparent;border:1px solid rgba(201,168,76,.25);border-radius:6px;color:#C9A84C;font-size:11px}
        .vi-auth-hint{font-size:11px;color:rgba(247,244,238,.48);line-height:1.5;margin:-7px 0 0}
        .vi-auth-submit{width:100%;padding:15px;background:#C9A84C;border:0;border-radius:999px;color:#1A1A2E;font-size:11px;font-weight:800;letter-spacing:.12em;cursor:pointer}
        .vi-auth-submit:disabled{opacity:.65;cursor:wait}.vi-auth-link,.vi-auth-switch button{background:none;border:0;color:#C9A84C;text-decoration:underline;cursor:pointer;font:inherit}
        .vi-auth-switch{text-align:center;margin-top:22px;color:rgba(247,244,238,.6);font-size:12px}.vi-auth-legal{text-align:center;color:rgba(247,244,238,.35);font-size:10px;line-height:1.6;margin:16px 0 0}.vi-auth-legal a{color:#C9A84C}
        .vi-auth-error,.vi-auth-notice{padding:12px;border-radius:7px;font-size:12px;line-height:1.6}.vi-auth-error{background:rgba(216,90,48,.12);border:1px solid rgba(216,90,48,.3);color:#F09595}.vi-auth-notice{background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.25);color:#F7F4EE}
        @media(max-width:520px){.vi-auth-backdrop{padding:0;place-items:stretch}.vi-auth-modal{width:100%;max-height:100dvh;min-height:100dvh;border-radius:0;padding:64px 24px 30px}}
      `}</style>
    </div>
  )
}
