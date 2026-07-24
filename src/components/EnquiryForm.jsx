'use client'
import { useState } from 'react'

const GOLD  = '#C9A84C'
const DARK  = '#0F0F1A'
const PARCH = '#F7F4EE'
const DIM   = 'rgba(247,244,238,.5)'
const GLINE = 'rgba(201,168,76,.28)'

// Replaces the old mailto: CTA. Writes a real row to `enquiries` (via
// /api/enquiries) instead of firing a client-side email with no record,
// then still sends the same email notification server-side.
export default function EnquiryForm({ professionalProfileId, atbId, enquiryType, ctaLabel, currentUser }) {
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    buyer_name: currentUser?.user_metadata?.full_name || '',
    buyer_email: currentUser?.email || '',
    buyer_company: '',
    message: '',
  })

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function submit(e) {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professional_profile_id: professionalProfileId,
          atb_id: atbId,
          enquiry_type: enquiryType,
          buyer_name: form.buyer_name,
          buyer_email: form.buyer_email,
          buyer_company: form.buyer_company,
          message: form.message,
          buyer_user_id: currentUser?.id || null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || 'Something went wrong. Please try again.')
        setSending(false)
        return
      }
      setSent(true)
      setSending(false)
    } catch {
      setError('Something went wrong. Please try again.')
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div style={{ padding: '18px 22px', background: 'rgba(29,158,117,.08)', border: '1px solid rgba(29,158,117,.3)', borderRadius: '6px', fontSize: '13px', color: PARCH, flexShrink: 0, maxWidth: '340px' }}>
        Sent — Valoria Institute will be in touch shortly.
      </div>
    )
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        style={{ padding: '14px 28px', background: GOLD, color: DARK, fontSize: '11px', fontWeight: 700, letterSpacing: '.14em', border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
        {ctaLabel}
      </button>
    )
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '380px' }}>
      <input required value={form.buyer_name} onChange={e => set('buyer_name', e.target.value)}
        placeholder="Your name" style={inputStyle} />
      <input required type="email" value={form.buyer_email} onChange={e => set('buyer_email', e.target.value)}
        placeholder="Your email" style={inputStyle} />
      <input value={form.buyer_company} onChange={e => set('buyer_company', e.target.value)}
        placeholder="Company / organisation (optional)" style={inputStyle} />
      <textarea required value={form.message} onChange={e => set('message', e.target.value)}
        placeholder="What would you like to discuss?" rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
      {error && <div style={{ fontSize: '12px', color: '#D85A30' }}>{error}</div>}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" disabled={sending}
          style={{ padding: '12px 24px', background: GOLD, color: DARK, fontSize: '11px', fontWeight: 700, letterSpacing: '.12em', border: 'none', cursor: sending ? 'default' : 'pointer', opacity: sending ? 0.6 : 1 }}>
          {sending ? 'SENDING…' : 'SEND'}
        </button>
        <button type="button" onClick={() => setOpen(false)}
          style={{ padding: '12px 20px', background: 'none', color: DIM, fontSize: '11px', border: `1px solid ${GLINE}`, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </form>
  )
}

const inputStyle = {
  padding: '11px 14px',
  background: 'rgba(255,255,255,.03)',
  border: `1px solid ${GLINE}`,
  borderRadius: '4px',
  color: PARCH,
  fontSize: '13px',
  fontFamily: 'inherit',
  outline: 'none',
}
