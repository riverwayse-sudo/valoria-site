'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const GOLD = '#C9A84C'
const MIDNIGHT = '#1A1A2E'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'
const DIM = 'rgba(247,244,238,.45)'

// Talent and speakers sign up via the assessment platform.
// This page only handles employer and organiser accounts.
const BUYER_TYPES = [
  {
    id: 'employer',
    label: 'Employer',
    sub: 'ATB Connect',
    desc: 'You hire PRIME-assessed talent. Search the talent pool, request introductions, and track your pipeline.',
    icon: '◇',
  },
  {
    id: 'organiser',
    label: 'Event Organiser',
    sub: 'ATB Spotlight',
    desc: 'You book speakers and facilitators. Browse the Spotlight roster and submit event briefs.',
    icon: '◆',
  },
]

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState(null)
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', name: '', company: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSignup(e) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match — please check and try again.")
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { display_name: form.name, user_type: userType },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })
      if (signupError) throw signupError
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          display_name: form.name,
          user_type: userType,
          company_name: form.company,
        })
      }
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={S.page}>
        <div style={S.card}>
          <div style={{ fontSize: '28px', color: GOLD, textAlign: 'center', marginBottom: '16px' }}>✦</div>
          <h2 style={S.title}>Account created.</h2>
          <p style={S.sub}>
            Check your email and click the confirmation link to activate your account. Then sign in to access the marketplace.
          </p>
          <a href="/login" style={S.btnGold}>SIGN IN →</a>
          <a href="/marketplace" style={{ ...S.btnGold, background: 'transparent', border: '1px solid rgba(201,168,76,.3)', color: GOLD, marginTop: '10px', display: 'block', textAlign: 'center' }}>
            BROWSE THE MARKETPLACE
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={S.page}>
      <div style={S.card}>

        <div style={S.eyebrow}>
          <div style={S.eyebrowLine} />
          <span style={S.eyebrowText}>{step === 1 ? 'CREATE ACCOUNT' : 'YOUR DETAILS'}</span>
          <div style={S.eyebrowLine} />
        </div>

        {/* STEP 1 — account type */}
        {step === 1 && (
          <>
            <h1 style={S.title}>
              Who are<br /><em style={{ color: GOLD, fontStyle: 'italic' }}>you here for?</em>
            </h1>

            {/* Talent/speaker redirect notice */}
            <div style={S.noticeBox}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', color: GOLD, marginBottom: '8px' }}>
                TALENT & SPEAKERS
              </div>
              <p style={{ fontSize: '13px', color: DIM, lineHeight: 1.6, margin: '0 0 12px' }}>
                If you're a professional or speaker, your account is created through the VALU Index — the assessment is the entry point, not a separate signup.
              </p>
              <a
                href="https://assessment.valoriainstitute.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-block', padding: '10px 20px', background: GOLD, color: MIDNIGHT, fontSize: '11px', fontWeight: 700, letterSpacing: '.12em', borderRadius: '999px', textDecoration: 'none' }}
              >
                TAKE THE VALU INDEX — FREE →
              </a>
            </div>

            <div style={{ height: '1px', background: 'rgba(201,168,76,.12)', margin: '28px 0' }} />

            <p style={{ ...S.sub, marginBottom: '20px' }}>Employers and event organisers create accounts directly here.</p>

            <div style={S.typeGrid}>
              {BUYER_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setUserType(t.id)}
                  style={{
                    ...S.typeCard,
                    borderColor: userType === t.id ? GOLD : 'rgba(201,168,76,.15)',
                    background: userType === t.id ? 'rgba(201,168,76,.06)' : 'rgba(255,255,255,.02)',
                  }}
                >
                  <span style={S.typeIcon}>{t.icon}</span>
                  <div style={S.typeLabel}>{t.label}</div>
                  <div style={S.typeSub}>{t.sub}</div>
                  <div style={S.typeDesc}>{t.desc}</div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!userType}
              style={{ ...S.btnGold, opacity: userType ? 1 : 0.4, cursor: userType ? 'pointer' : 'not-allowed', border: 'none' }}
            >
              CONTINUE →
            </button>
          </>
        )}

        {/* STEP 2 — account details */}
        {step === 2 && (
          <>
            <h1 style={S.title}>
              Almost<br /><em style={{ color: GOLD, fontStyle: 'italic' }}>there.</em>
            </h1>

            <div style={S.selectedBadge}>
              {BUYER_TYPES.find(t => t.id === userType)?.icon}{' '}
              {BUYER_TYPES.find(t => t.id === userType)?.label}
              <button type="button" onClick={() => setStep(1)} style={S.changeBtn}>Change</button>
            </div>

            <form onSubmit={handleSignup} style={S.form}>
              {[
                { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
                { key: 'company', label: userType === 'organiser' ? 'Organisation / Event Company' : 'Company Name', type: 'text', placeholder: userType === 'organiser' ? 'e.g. Lagos Event Group' : 'e.g. Zenith Capital Ltd' },
                { key: 'email', label: 'Work Email Address', type: 'email', placeholder: 'you@company.com' },
                { key: 'password', label: 'Password', type: 'password', placeholder: 'Minimum 8 characters' },
                { key: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Re-enter your password' },
              ].map(field => (
                <div key={field.key} style={S.field}>
                  <label style={S.label}>{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    required
                    minLength={field.key === 'password' ? 8 : undefined}
                    style={{
                      ...S.input,
                      borderColor: field.key === 'confirmPassword' && form.confirmPassword
                        ? form.confirmPassword === form.password
                          ? 'rgba(29,158,117,.4)'
                          : 'rgba(216,90,48,.4)'
                        : 'rgba(201,168,76,.2)',
                    }}
                  />
                </div>
              ))}

              {error && <div style={S.errorBox}>{error}</div>}

              <button type="submit" disabled={loading}
                style={{ ...S.btnGold, opacity: loading ? 0.7 : 1, border: 'none', cursor: loading ? 'default' : 'pointer' }}>
                {loading ? 'CREATING ACCOUNT…' : 'CREATE ACCOUNT'}
              </button>

              <p style={S.terms}>
                By creating an account you agree to our{' '}
                <Link href="/terms-of-use" style={{ color: GOLD }}>Terms of Use</Link> and{' '}
                <Link href="/privacypolicy" style={{ color: GOLD }}>Privacy Policy</Link>.
              </p>
            </form>
          </>
        )}

        <p style={S.loginLink}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: GOLD }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', fontFamily: "'Raleway','Helvetica Neue',Arial,sans-serif" },
  card: { width: '100%', maxWidth: '560px', background: 'rgba(26,26,46,.6)', border: '1px solid rgba(201,168,76,.15)', borderRadius: '12px', padding: 'clamp(32px,5vw,56px)' },
  eyebrow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' },
  eyebrowLine: { flex: 1, height: '1px', background: 'rgba(201,168,76,.3)' },
  eyebrowText: { fontSize: '10px', fontWeight: 700, letterSpacing: '.16em', color: GOLD },
  title: { fontSize: 'clamp(28px,4vw,42px)', fontWeight: 200, color: PARCHMENT, lineHeight: 1.1, marginBottom: '16px', letterSpacing: '-.02em' },
  sub: { fontSize: '14px', fontWeight: 300, color: DIM, lineHeight: 1.6 },
  noticeBox: { background: 'rgba(201,168,76,.05)', border: '1px solid rgba(201,168,76,.15)', borderRadius: '10px', padding: '20px' },
  typeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' },
  typeCard: { padding: '20px', borderRadius: '8px', border: '1px solid', textAlign: 'left', cursor: 'pointer', transition: 'all .2s', fontFamily: 'Raleway' },
  typeIcon: { fontSize: '20px', color: GOLD, display: 'block', marginBottom: '8px' },
  typeLabel: { fontSize: '15px', fontWeight: 700, color: PARCHMENT, marginBottom: '2px' },
  typeSub: { fontSize: '10px', fontWeight: 700, letterSpacing: '.12em', color: GOLD, marginBottom: '8px' },
  typeDesc: { fontSize: '12px', fontWeight: 300, color: DIM, lineHeight: 1.5 },
  selectedBadge: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(201,168,76,.08)', border: '1px solid rgba(201,168,76,.2)', borderRadius: '6px', marginBottom: '24px', fontSize: '13px', fontWeight: 600, color: GOLD },
  changeBtn: { marginLeft: 'auto', background: 'none', border: 'none', color: DIM, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', color: DIM, textTransform: 'uppercase' },
  input: { padding: '12px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid', borderRadius: '6px', color: PARCHMENT, fontSize: '14px', fontFamily: "'Raleway',sans-serif", outline: 'none', width: '100%', boxSizing: 'border-box' },
  btnGold: { display: 'block', width: '100%', padding: '16px', background: GOLD, color: MIDNIGHT, fontSize: '12px', fontWeight: 700, letterSpacing: '.14em', borderRadius: '999px', textAlign: 'center', textDecoration: 'none', fontFamily: "'Raleway',sans-serif", marginTop: '8px', cursor: 'pointer' },
  errorBox: { padding: '12px 14px', background: 'rgba(216,90,48,.12)', border: '1px solid rgba(216,90,48,.3)', borderRadius: '6px', fontSize: '13px', color: '#F09595' },
  terms: { fontSize: '12px', color: 'rgba(247,244,238,.35)', textAlign: 'center', lineHeight: 1.6 },
  loginLink: { marginTop: '24px', fontSize: '13px', color: 'rgba(247,244,238,.4)', textAlign: 'center' },
}
