'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const GOLD = '#C9A84C'
const DARK = '#0F0F1A'
const MID = '#1A1A2E'
const PARCH = '#F7F4EE'
const DIM = 'rgba(247,244,238,.48)'

function ProfessionalSignupForm() {
  const params = useSearchParams()
  const tasterId = params.get('taster_id') || ''
  const name = params.get('name') || ''
  const role = params.get('role') || ''
  const experience = params.get('experience') || ''
  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [linked, setLinked] = useState(false)

  const valid = useMemo(() => tasterId && name && role && form.email && form.password.length >= 8 && form.password === form.confirm, [tasterId, name, role, form])

  async function submit(e) {
    e.preventDefault()
    if (!valid) return
    setLoading(true)
    setError('')
    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: { data: { display_name: name, full_name: name, user_type: 'professional', role } },
      })
      if (signupError) throw signupError
      if (!data?.user?.id) throw new Error('Account could not be created.')

      const linkRes = await fetch('/api/link-taster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taster_id: tasterId, user_id: data.user.id, name, role }),
      })
      const linkData = await linkRes.json().catch(() => ({}))
      if (!linkRes.ok) throw new Error(linkData.error || 'Your teaser result could not be linked to the account.')

      setLinked(true)
      setDone(true)
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!tasterId || !name || !role) {
    return <Shell><h1 style={S.title}>Your VALU journey needs a teaser result.</h1><p style={S.sub}>Start with the 15-question VALU snapshot. Your result is what unlocks this professional signup.</p><a href="https://assessment.valoriainstitute.com/" style={S.button}>TAKE THE 15-QUESTION SNAPSHOT →</a></Shell>
  }

  if (done) {
    const assessmentUrl = `https://assessment.valoriainstitute.com/?full=1&taster_id=${encodeURIComponent(tasterId)}&name=${encodeURIComponent(name)}&role=${encodeURIComponent(role)}&experience=${encodeURIComponent(experience)}`
    return <Shell>
      <div style={S.eyebrow}>VALORIA PROFESSIONAL ACCOUNT</div>
      <h1 style={S.title}>You’re in. <em>Now complete the standard.</em></h1>
      <p style={S.sub}>Your teaser result is linked to your account and your profile is temporarily listed as <strong style={{ color: GOLD }}>Basic · Incomplete</strong>. Your official VALU Index will only appear after the full assessment.</p>
      {!linked && <p style={S.error}>The account was created, but the teaser link still needs to be completed.</p>}
      <a href={assessmentUrl} style={S.button}>COMPLETE THE FULL VALU ASSESSMENT →</a>
      <Link href="/profile/setup" style={S.secondary}>COMPLETE MY PROFILE FIRST</Link>
      <p style={S.note}>You can return to your profile at any time. The temporary marketplace listing remains while your profile is incomplete.</p>
    </Shell>
  }

  return <Shell>
    <div style={S.eyebrow}>15-QUESTION SNAPSHOT COMPLETE</div>
    <h1 style={S.title}>Create your <em>Valoria account.</em></h1>
    <p style={S.sub}>Hi {name.split(/\s+/)[0]}. Your snapshot is saved. Create your account now and we’ll keep your result attached to your professional profile.</p>
    <div style={S.summary}><div><span>NAME</span>{name}</div><div><span>ROLE</span>{role}</div><div><span>STATUS</span>Basic · Incomplete</div></div>
    <form onSubmit={submit} style={S.form}>
      <label>Email<input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" style={S.input} /></label>
      <label>Password<input type="password" required minLength={8} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Minimum 8 characters" style={S.input} /></label>
      <label>Confirm password<input type="password" required minLength={8} value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} placeholder="Repeat your password" style={S.input} /></label>
      {error && <div style={S.error}>{error}</div>}
      <button type="submit" disabled={loading || !valid} style={{ ...S.button, opacity: loading || !valid ? .45 : 1 }}>{loading ? 'CREATING ACCOUNT…' : 'CREATE ACCOUNT →'}</button>
    </form>
    <p style={S.note}>Your official score is not created by the teaser. The full assessment establishes the official VALU Index.</p>
  </Shell>
}

function Shell({ children }) { return <main style={S.page}><div style={S.card}><div style={{ marginBottom: 24 }}><Link href="/" style={{ color: GOLD, textDecoration: 'none', fontSize: 11, letterSpacing: '.12em' }}>VALORIA INSTITUTE</Link></div>{children}</div></main> }

export default function ProfessionalSignupPage() {
  return <Suspense fallback={null}><ProfessionalSignupForm /></Suspense>
}

const S = {
  page: { minHeight: '100vh', background: DARK, color: PARCH, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 20px', fontFamily: "'Raleway',sans-serif" },
  card: { width: '100%', maxWidth: 560, background: 'rgba(26,26,46,.7)', border: '1px solid rgba(201,168,76,.18)', borderRadius: 14, padding: 'clamp(28px,6vw,56px)' },
  eyebrow: { color: GOLD, fontSize: 10, fontWeight: 700, letterSpacing: '.18em', marginBottom: 14 },
  title: { fontSize: 'clamp(32px,6vw,54px)', fontWeight: 300, lineHeight: 1.05, letterSpacing: '-.025em', margin: '0 0 18px' },
  sub: { color: DIM, fontSize: 14, lineHeight: 1.75, margin: '0 0 26px' },
  summary: { display: 'grid', gap: 10, padding: 18, background: 'rgba(201,168,76,.05)', border: '1px solid rgba(201,168,76,.14)', borderRadius: 8, marginBottom: 24, color: PARCH, fontSize: 13 },
  form: { display: 'grid', gap: 15 },
  input: { display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 7, padding: '13px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(247,244,238,.12)', borderRadius: 6, color: PARCH, outline: 'none' },
  button: { display: 'block', width: '100%', padding: '15px 18px', background: GOLD, color: DARK, border: 0, borderRadius: 999, fontWeight: 700, letterSpacing: '.12em', fontSize: 11, textAlign: 'center', textDecoration: 'none', cursor: 'pointer' },
  secondary: { display: 'block', marginTop: 12, padding: '14px 18px', border: '1px solid rgba(201,168,76,.25)', color: GOLD, borderRadius: 999, textAlign: 'center', textDecoration: 'none', fontSize: 11, letterSpacing: '.1em' },
  note: { color: 'rgba(247,244,238,.3)', fontSize: 11, lineHeight: 1.6, marginTop: 18 },
  error: { color: '#F09595', background: 'rgba(216,90,48,.1)', border: '1px solid rgba(216,90,48,.25)', padding: 12, borderRadius: 6, fontSize: 12 },
}
