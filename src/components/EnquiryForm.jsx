'use client'
import { useState } from 'react'
import premium from './PremiumInteractions.module.css'

const GOLD  = '#C9A84C'
const DARK  = '#0F0F1A'
const MIDNIGHT = '#1A1A2E'
const PARCH = '#F7F4EE'
const DIM   = 'rgba(247,244,238,.5)'
const GLINE = 'rgba(201,168,76,.28)'

export default function EnquiryForm({ professionalProfileId, atbId, enquiryType, ctaLabel, currentUser, disabled, disabledLabel, triggerStyle }) {
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

  function closeAndReset() {
    setOpen(false)
    setTimeout(() => { setSent(false); setError('') }, 200)
  }

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

  if (disabled) {
    return (
      <button type="button" disabled
        style={{ padding: '14px 28px', background: 'rgba(255,255,255,.06)', color: 'rgba(247,244,238,.3)', fontSize: '11px', fontWeight: 700, letterSpacing: '.14em', border: 'none', cursor: 'not-allowed', flexShrink: 0, whiteSpace: 'nowrap', ...triggerStyle }}>
        {disabledLabel || 'SAMPLE — NOT AVAILABLE'}
      </button>
    )
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        style={{ padding: '14px 28px', background: GOLD, color: DARK, fontSize: '11px', fontWeight: 700, letterSpacing: '.14em', border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', ...triggerStyle }}>
        {ctaLabel}
      </button>

      {open && (
        <div onClick={closeAndReset}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: MIDNIGHT, border: `1px solid ${GLINE}`, borderRadius: '10px', padding: '28px', width: '420px', maxWidth: '100%', position: 'relative' }}>
            <button type="button" onClick={closeAndReset} aria-label="Close"
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: DIM, fontSize: '18px', cursor: 'pointer', lineHeight: 1, padding: '4px' }}>
              ✕
            </button>

            {sent ? (
              <div style={{ padding: '12px 0 4px' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: PARCH, marginBottom: '8px' }}>Sent</div>
                <p style={{ fontSize: '13px', color: DIM, lineHeight: 1.6, margin: 0 }}>
                  Valoria Institute will review and be in touch shortly.
                </p>
                <button type="button" onClick={closeAndReset}
                  style={{ marginTop: '20px', padding: '10px 20px', background: GOLD, color: DARK, fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', border: 'none', cursor: 'pointer' }}>
                  CLOSE
                </button>
              </div>
            ) : (
              <>
                <div style={{ fontSize: '15px', fontWeight: 600, color: GOLD, marginBottom: '4px' }}>{ctaLabel}</div>
                <p style={{ fontSize: '12px', color: DIM, marginBottom: '18px', lineHeight: 1.5 }}>
                  Valoria Institute facilitates all introductions — your details stay protected.
                </p>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input required value={form.buyer_name} onChange={e => set('buyer_name', e.target.value)} placeholder="Your name" style={inputStyle} />
                  <input required type="email" value={form.buyer_email} onChange={e => set('buyer_email', e.target.value)} placeholder="Your email" style={inputStyle} />
                  <input value={form.buyer_company} onChange={e => set('buyer_company', e.target.value)} placeholder="Company / organisation (optional)" style={inputStyle} />
                  <textarea required value={form.message} onChange={e => set('message', e.target.value)} placeholder="What would you like to discuss?" rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
                  {error && <div style={{ fontSize: '12px', color: '#D85A30' }}>{error}</div>}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button type="submit" disabled={sending} style={{ flex: 1, padding: '12px 24px', background: GOLD, color: DARK, fontSize: '11px', fontWeight: 700, letterSpacing: '.12em', border: 'none', cursor: sending ? 'default' : 'pointer', opacity: sending ? 0.6 : 1 }}>
                      {sending ? 'SENDING…' : 'SEND'}
                    </button>
                    <button type="button" onClick={closeAndReset} style={{ padding: '12px 20px', background: 'none', color: DIM, fontSize: '11px', border: `1px solid ${GLINE}`, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
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
