'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// This page is itself under /admin, so middleware.js already guarantees
// only a signed-in admin can reach it — no separate check needed here.
// It invites a NEW admin (via Supabase's own secure invite-link email),
// it does not let a stranger self-register as one. See
// api/admin/create-admin/route.js for the reasoning.

const GOLD = '#C9A84C'
const MIDNIGHT = '#1A1A2E'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'

export default function AdminSignupPage() {
  const [form, setForm] = useState({ email: '', fullName: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [admins, setAdmins] = useState([])
  const [selfId, setSelfId] = useState(null)
  const [revokingId, setRevokingId] = useState(null)

  useEffect(() => { fetchAdmins() }, [])

  async function fetchAdmins() {
    const { data: { session } } = await supabase.auth.getSession()
    try {
      const res = await fetch('/api/admin/create-admin', {
        headers: { Authorization: `Bearer ${session?.access_token || ''}` },
      })
      const data = await res.json()
      if (res.ok) { setAdmins(data.admins); setSelfId(data.selfId) }
    } catch (err) {
      console.error('Fetching admin list failed:', err)
    }
  }

  async function handleRevoke(adminId, email) {
    if (!confirm(`Remove admin access for ${email}? Their account stays active for the rest of the platform — this only removes /admin access.`)) return
    setRevokingId(adminId)
    const { data: { session } } = await supabase.auth.getSession()
    try {
      const res = await fetch('/api/admin/revoke-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
        body: JSON.stringify({ adminId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not revoke access.')
      setAdmins(prev => prev.filter(a => a.id !== adminId))
    } catch (err) {
      alert(err.message)
    } finally {
      setRevokingId(null)
    }
  }

  async function handleInvite(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
        body: JSON.stringify({ email: form.email, fullName: form.fullName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not send invite.')
      setResult(data)
      setForm({ email: '', fullName: '' })
      fetchAdmins()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link href="/admin" style={styles.backLink}>&larr; Back to admin</Link>
        <div style={styles.eyebrow}>
          <div style={styles.eyebrowLine} />
          <span style={styles.eyebrowText}>INVITE ADMIN</span>
          <div style={styles.eyebrowLine} />
        </div>
        <h1 style={styles.title}>Add a new admin.</h1>
        <p style={styles.sub}>They'll get an email to set their own password. If the email already has an account, admin access is granted directly instead.</p>

        <form onSubmit={handleInvite} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name (optional)</label>
            <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} style={styles.input} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={styles.input} />
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}
          {result && (
            <div style={styles.successBox}>
              {result.promoted ? result.note : 'Invite sent — they\u2019ll receive an email to set their password.'}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ ...styles.btnGold, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'SENDING...' : 'SEND INVITE'}
          </button>
        </form>

        {admins.length > 0 && (
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(201,168,76,.12)' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', color: 'rgba(247,244,238,.4)', textTransform: 'uppercase', marginBottom: '14px' }}>
              Current Admins ({admins.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {admins.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: PARCHMENT, padding: '8px 0' }}>
                  <div>
                    <div>{a.full_name || a.email}</div>
                    {a.full_name && <div style={{ fontSize: '11px', color: 'rgba(247,244,238,.4)' }}>{a.email}</div>}
                  </div>
                  {a.id === selfId ? (
                    <span style={{ fontSize: '11px', color: 'rgba(247,244,238,.3)' }}>You</span>
                  ) : (
                    <button onClick={() => handleRevoke(a.id, a.email)} disabled={revokingId === a.id}
                      style={{ background: 'none', border: 'none', color: '#F09595', fontSize: '11px', fontWeight: 700, letterSpacing: '.06em', cursor: 'pointer', opacity: revokingId === a.id ? 0.5 : 1 }}>
                      {revokingId === a.id ? 'REMOVING...' : 'REVOKE'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', fontFamily: "'Raleway', 'Helvetica Neue', Arial, sans-serif" },
  card: { width: '100%', maxWidth: '440px', background: 'rgba(26,26,46,.6)', border: '1px solid rgba(201,168,76,.15)', borderRadius: '12px', padding: 'clamp(32px, 5vw, 56px)' },
  backLink: { fontSize: '12px', color: 'rgba(247,244,238,.4)', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' },
  eyebrow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' },
  eyebrowLine: { flex: 1, height: '1px', background: 'rgba(201,168,76,.3)' },
  eyebrowText: { fontSize: '10px', fontWeight: 700, letterSpacing: '.16em', color: GOLD },
  title: { fontSize: 'clamp(24px,3.5vw,32px)', fontWeight: 300, color: PARCHMENT, lineHeight: 1.1, marginBottom: '10px' },
  sub: { fontSize: '13px', fontWeight: 300, color: 'rgba(247,244,238,.5)', marginBottom: '28px', lineHeight: 1.6 },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', color: 'rgba(247,244,238,.5)', textTransform: 'uppercase' },
  input: { padding: '12px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(201,168,76,.2)', borderRadius: '6px', color: PARCHMENT, fontSize: '14px', fontFamily: "'Raleway', sans-serif", outline: 'none' },
  btnGold: { display: 'block', width: '100%', padding: '16px', background: GOLD, color: MIDNIGHT, fontSize: '12px', fontWeight: 700, letterSpacing: '.14em', borderRadius: '999px', border: 'none', cursor: 'pointer', textAlign: 'center', fontFamily: "'Raleway', sans-serif", marginTop: '8px' },
  errorBox: { padding: '12px 14px', background: 'rgba(216,90,48,.12)', border: '1px solid rgba(216,90,48,.3)', borderRadius: '6px', fontSize: '13px', color: '#F09595' },
  successBox: { padding: '12px 14px', background: 'rgba(29,158,117,.12)', border: '1px solid rgba(29,158,117,.3)', borderRadius: '6px', fontSize: '13px', color: '#7FD9B8' },
}
