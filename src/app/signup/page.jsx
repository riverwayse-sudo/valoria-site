'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const GOLD = '#C9A84C'
const MIDNIGHT = '#1A1A2E'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'

const USER_TYPES = [
  {
    id: 'talent',
    label: 'Talent',
    sub: 'ATB Connect',
    desc: 'You are a professional seeking visibility and precision-matched opportunities.',
    icon: '◈',
  },
  {
    id: 'speaker',
    label: 'Speaker',
    sub: 'ATB Spotlight',
    desc: 'You are a speaker seeking merit-based placement and direct bookings.',
    icon: '◉',
  },
  {
    id: 'employer',
    label: 'Employer',
    sub: 'ATB Connect',
    desc: 'You source and hire PRIME-assessed professional talent.',
    icon: '◇',
  },
  {
    id: 'organiser',
    label: 'Event Organiser',
    sub: 'ATB Spotlight',
    desc: 'You discover and book verified speakers for events.',
    icon: '◆',
  },
]

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState(null)
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { display_name: form.name, user_type: userType } },
      })
      if (signupError) throw signupError

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          display_name: form.name,
          user_type: userType,
          tier: userType === 'speaker' ? 'emerging' : null,
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
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✦</div>
          <h2 style={styles.successTitle}>Account created.</h2>
          <p style={styles.successSub}>
            Check your email to confirm your address, then complete your profile.
          </p>
          <a href="/profile/edit" style={styles.btnGold}>COMPLETE YOUR PROFILE</a>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.eyebrow}>
          <div style={styles.eyebrowLine} />
          <span style={styles.eyebrowText}>CREATE ACCOUNT</span>
          <div style={styles.eyebrowLine} />
        </div>

        <h1 style={styles.title}>
          {step === 1 ? <>Your worth.<br /><em style={{ color: GOLD, fontStyle: 'italic' }}>Deserves a platform.</em></> : <>Almost<br /><em style={{ color: GOLD, fontStyle: 'italic' }}>there.</em></>}
        </h1>

        {step === 1 && (
          <>
            <p style={styles.sub}>Choose your entry point into the Valoria ecosystem.</p>
            <div style={styles.typeGrid}>
              {USER_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setUserType(t.id)}
                  style={{
                    ...styles.typeCard,
                    borderColor: userType === t.id ? GOLD : 'rgba(201,168,76,.15)',
                    background: userType === t.id ? 'rgba(201,168,76,.06)' : 'rgba(255,255,255,.02)',
                  }}
                >
                  <span style={styles.typeIcon}>{t.icon}</span>
                  <div style={styles.typeLabel}>{t.label}</div>
                  <div style={styles.typeSub}>{t.sub}</div>
                  <div style={styles.typeDesc}>{t.desc}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!userType}
              style={{ ...styles.btnGold, opacity: userType ? 1 : 0.4, cursor: userType ? 'pointer' : 'not-allowed' }}
            >
              CONTINUE
            </button>
          </>
        )}

        {step === 2 && (
          <form onSubmit={handleSignup} style={styles.form}>
            <div style={styles.selectedBadge}>
              {USER_TYPES.find(t => t.id === userType)?.icon}{' '}
              {USER_TYPES.find(t => t.id === userType)?.label}
              <button type="button" onClick={() => setStep(1)} style={styles.changeBtn}>Change</button>
            </div>

            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
              { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
              { key: 'password', label: 'Password', type: 'password', placeholder: 'Minimum 8 characters' },
            ].map(field => (
              <div key={field.key} style={styles.field}>
                <label style={styles.label}>{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  required
                  minLength={field.key === 'password' ? 8 : undefined}
                  style={styles.input}
                />
              </div>
            ))}

            {error && <div style={styles.errorBox}>{error}</div>}

            <button type="submit" disabled={loading} style={{ ...styles.btnGold, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>

            <p style={styles.terms}>
              By creating an account you agree to our{' '}
              <Link href="/terms-of-use" style={{ color: GOLD }}>Terms of Use</Link> and{' '}
              <Link href="/privacypolicy" style={{ color: GOLD }}>Privacy Policy</Link>.
            </p>
          </form>
        )}

        <p style={styles.loginLink}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: GOLD }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: DARK,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    fontFamily: "'Raleway', 'Helvetica Neue', Arial, sans-serif",
  },
  card: {
    width: '100%',
    maxWidth: '640px',
    background: 'rgba(26,26,46,.6)',
    border: '1px solid rgba(201,168,76,.15)',
    borderRadius: '12px',
    padding: 'clamp(32px, 5vw, 56px)',
  },
  eyebrow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' },
  eyebrowLine: { flex: 1, height: '1px', background: 'rgba(201,168,76,.3)' },
  eyebrowText: { fontSize: '10px', fontWeight: 700, letterSpacing: '.16em', color: GOLD },
  title: { fontSize: 'clamp(28px,4vw,42px)', fontWeight: 200, color: PARCHMENT, lineHeight: 1.1, marginBottom: '16px', letterSpacing: '-.02em' },
  sub: { fontSize: '14px', fontWeight: 300, color: 'rgba(247,244,238,.5)', marginBottom: '28px', lineHeight: 1.6 },
  typeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' },
  typeCard: { padding: '20px', borderRadius: '8px', border: '1px solid', textAlign: 'left', cursor: 'pointer', transition: 'all .2s' },
  typeIcon: { fontSize: '20px', color: GOLD, display: 'block', marginBottom: '8px' },
  typeLabel: { fontSize: '15px', fontWeight: 700, color: PARCHMENT, marginBottom: '2px', fontFamily: "'Raleway', sans-serif" },
  typeSub: { fontSize: '10px', fontWeight: 700, letterSpacing: '.12em', color: GOLD, marginBottom: '8px' },
  typeDesc: { fontSize: '12px', fontWeight: 300, color: 'rgba(247,244,238,.5)', lineHeight: 1.5 },
  selectedBadge: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(201,168,76,.08)', border: '1px solid rgba(201,168,76,.2)', borderRadius: '6px', marginBottom: '24px', fontSize: '13px', fontWeight: 600, color: GOLD },
  changeBtn: { marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(247,244,238,.4)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', color: 'rgba(247,244,238,.5)', textTransform: 'uppercase' },
  input: { padding: '12px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(201,168,76,.2)', borderRadius: '6px', color: PARCHMENT, fontSize: '14px', fontFamily: "'Raleway', sans-serif", outline: 'none' },
  btnGold: { display: 'block', width: '100%', padding: '16px', background: GOLD, color: MIDNIGHT, fontSize: '12px', fontWeight: 700, letterSpacing: '.14em', borderRadius: '999px', border: 'none', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', fontFamily: "'Raleway', sans-serif', marginTop: '8px'" },
  errorBox: { padding: '12px 14px', background: 'rgba(216,90,48,.12)', border: '1px solid rgba(216,90,48,.3)', borderRadius: '6px', fontSize: '13px', color: '#F09595' },
  terms: { fontSize: '12px', color: 'rgba(247,244,238,.35)', textAlign: 'center', lineHeight: 1.6 },
  loginLink: { marginTop: '24px', fontSize: '13px', color: 'rgba(247,244,238,.4)', textAlign: 'center' },
  successIcon: { fontSize: '32px', color: GOLD, textAlign: 'center', marginBottom: '16px' },
  successTitle: { fontSize: '28px', fontWeight: 200, color: PARCHMENT, textAlign: 'center', marginBottom: '12px' },
  successSub: { fontSize: '14px', color: 'rgba(247,244,238,.5)', textAlign: 'center', marginBottom: '28px', lineHeight: 1.6 },
}
