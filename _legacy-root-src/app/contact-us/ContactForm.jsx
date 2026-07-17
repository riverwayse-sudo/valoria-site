'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const GOLD = '#C9A84C'
const MIDNIGHT = '#1A1A2E'

const INQUIRY_TYPES = [
  { id: 'hiring', label: 'Hiring Enquiry — ATB Connect' },
  { id: 'speaker', label: 'Speaker Booking — ATB Spotlight' },
  { id: 'training', label: 'Training Enquiry — Valoria Develop' },
  { id: 'general', label: 'General Question' },
]

export default function ContactForm() {
  const [currentUser, setCurrentUser] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', organisation: '', inquiryType: 'general', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSending(true)
    setFormError('')
    try {
      const typeLabel = INQUIRY_TYPES.find(t => t.id === form.inquiryType)?.label || 'General Question'
      const { error } = await supabase.from('messages').insert({
        sender_id: currentUser?.id || null,
        recipient_profile_id: null,
        subject: `${typeLabel} — ${form.name}${form.organisation ? ` (${form.organisation})` : ''}`,
        body: `From: ${form.name} (${form.email})\nOrganisation: ${form.organisation || '—'}\nType: ${typeLabel}\n\n${form.message}`,
      })
      if (error) throw error
      setSent(true)
    } catch (err) {
      setFormError(err.message || 'Something went wrong. Please try again, or email us directly below.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div style={styles.successCard}>
        <div style={styles.successIcon}>✦</div>
        <h3 style={styles.successTitle}>Message sent.</h3>
        <p style={styles.successSub}>We respond within two business days.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>Name</label>
          <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={styles.input} placeholder="Your full name" />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={styles.input} placeholder="you@example.com" />
        </div>
      </div>
      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>Organisation</label>
          <input type="text" value={form.organisation} onChange={e => setForm({ ...form, organisation: e.target.value })} style={styles.input} placeholder="Company or event name" />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>What&apos;s this about</label>
          <select value={form.inquiryType} onChange={e => setForm({ ...form, inquiryType: e.target.value })} style={styles.input}>
            {INQUIRY_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
      </div>
      <div style={styles.field}>
        <label style={styles.label}>Message</label>
        <textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} style={{ ...styles.input, resize: 'vertical', fontFamily: "'Raleway', sans-serif" }} placeholder="Tell us what you need." />
      </div>

      {formError && <div style={styles.errorBox}>{formError}</div>}

      <button type="submit" disabled={sending} style={{ ...styles.btnGold, opacity: sending ? 0.7 : 1 }}>
        {sending ? 'SENDING...' : 'SEND MESSAGE'}
      </button>
    </form>
  )
}

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Raleway', sans-serif" },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', color: 'rgba(247,244,238,.5)', textTransform: 'uppercase' },
  input: { padding: '12px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(201,168,76,.2)', borderRadius: '6px', color: '#F7F4EE', fontSize: '14px', fontFamily: "'Raleway', sans-serif", outline: 'none', width: '100%', boxSizing: 'border-box' },
  btnGold: { padding: '16px', background: GOLD, color: MIDNIGHT, fontSize: '12px', fontWeight: 700, letterSpacing: '.14em', borderRadius: '999px', border: 'none', cursor: 'pointer', textAlign: 'center', marginTop: '8px' },
  errorBox: { padding: '12px 14px', background: 'rgba(216,90,48,.12)', border: '1px solid rgba(216,90,48,.3)', borderRadius: '6px', fontSize: '13px', color: '#F09595' },
  successCard: { textAlign: 'center', padding: '40px 20px' },
  successIcon: { fontSize: '32px', color: GOLD, marginBottom: '12px' },
  successTitle: { fontSize: '24px', fontWeight: 200, color: '#F7F4EE', marginBottom: '8px', fontFamily: "'Raleway', sans-serif" },
  successSub: { fontSize: '14px', color: 'rgba(247,244,238,.5)' },
}
