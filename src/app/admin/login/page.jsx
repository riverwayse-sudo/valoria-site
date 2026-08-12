'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

// Dedicated admin login, per Femi's explicit request (11 Aug): /admin
// should have its own login rather than reusing the general one. Uses the
// same Supabase Auth under the hood (real password hashing, real sessions —
// no reason to hand-roll that), but is a completely separate page with its
// own branding, and the actual admin authorization now happens server-side
// in middleware.js against the admin_users table — this page's job is only
// to authenticate; it never decides who's allowed into /admin.

const GOLD = '#C9A84C'
const MIDNIGHT = '#1A1A2E'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (loginError) throw loginError
      // middleware.js checks admin_users on the next request and will
      // bounce back here if this account isn't actually an admin — this
      // page doesn't need its own admin_users check to redirect correctly.
      window.location.href = '/admin'
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Incorrect email or password.'
          : (err.message || 'Something went wrong. Please try again.')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.eyebrow}>
          <div style={styles.eyebrowLine} />
          <span style={styles.eyebrowText}>ADMIN ACCESS</span>
          <div style={styles.eyebrowLine} />
        </div>

        <h1 style={styles.title}>Valoria<br /><em style={{ color: GOLD, fontStyle: 'italic' }}>Operations.</em></h1>
        <p style={styles.sub}>Restricted to authorized Valoria Institute administrators.</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Admin Email</label>
            <input type="email" placeholder="you@valoriainstitute.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required style={styles.input} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input type="password" placeholder="Your password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required style={styles.input} />
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <button type="submit" disabled={loading} style={{ ...styles.btnGold, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        <p style={{ marginTop: '24px', fontSize: '12px', color: 'rgba(247,244,238,.3)', textAlign: 'center' }}>
          Not an admin? This is not the general Valoria Institute login.
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', fontFamily: "'Raleway', 'Helvetica Neue', Arial, sans-serif" },
  card: { width: '100%', maxWidth: '440px', background: 'rgba(26,26,46,.6)', border: '1px solid rgba(201,168,76,.15)', borderRadius: '12px', padding: 'clamp(32px, 5vw, 56px)' },
  eyebrow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' },
  eyebrowLine: { flex: 1, height: '1px', background: 'rgba(201,168,76,.3)' },
  eyebrowText: { fontSize: '10px', fontWeight: 700, letterSpacing: '.16em', color: GOLD },
  title: { fontSize: 'clamp(26px,4vw,38px)', fontWeight: 200, color: PARCHMENT, lineHeight: 1.1, marginBottom: '12px', letterSpacing: '-.02em' },
  sub: { fontSize: '13px', fontWeight: 300, color: 'rgba(247,244,238,.5)', marginBottom: '28px', lineHeight: 1.6 },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', color: 'rgba(247,244,238,.5)', textTransform: 'uppercase' },
  input: { padding: '12px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(201,168,76,.2)', borderRadius: '6px', color: PARCHMENT, fontSize: '14px', fontFamily: "'Raleway', sans-serif", outline: 'none' },
  btnGold: { display: 'block', width: '100%', padding: '16px', background: GOLD, color: MIDNIGHT, fontSize: '12px', fontWeight: 700, letterSpacing: '.14em', borderRadius: '999px', border: 'none', cursor: 'pointer', textAlign: 'center', fontFamily: "'Raleway', sans-serif", marginTop: '8px' },
  errorBox: { padding: '12px 14px', background: 'rgba(216,90,48,.12)', border: '1px solid rgba(216,90,48,.3)', borderRadius: '6px', fontSize: '13px', color: '#F09595' },
}
