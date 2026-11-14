'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const INQUIRY_TYPES = [
  { id: 'hiring', label: 'Hiring enquiry — ATB Connect' },
  { id: 'speaker', label: 'Speaker booking — ATB Spotlight' },
  { id: 'training', label: 'Training enquiry — Valoria Develop' },
  { id: 'general', label: 'General question' },
]

export default function ContactForm() {
  const [currentUser, setCurrentUser] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', organisation: '', inquiryType: 'general', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    const requestedType = new URLSearchParams(window.location.search).get('type')
    const typeMap = {
      candidate: 'hiring', hiring: 'hiring', speaker: 'speaker',
      speaker_booking: 'speaker', facilitator: 'training',
      facilitator_commission: 'training', training: 'training', general: 'general',
    }
    const inquiryType = typeMap[requestedType]
    if (inquiryType) setForm(current => ({ ...current, inquiryType }))
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user))
  }, [])

  function update(field, value) {
    setForm(current => ({ ...current, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSending(true)
    setFormError('')
    try {
      const typeLabel = INQUIRY_TYPES.find(t => t.id === form.inquiryType)?.label || 'General question'
      const { error } = await supabase.from('messages').insert({
        sender_id: currentUser?.id || null,
        recipient_profile_id: null,
        subject: `${typeLabel} — ${form.name}${form.organisation ? ` (${form.organisation})` : ''}`,
        body: `From: ${form.name} (${form.email})\nOrganisation: ${form.organisation || '—'}\nType: ${typeLabel}\n\n${form.message}`,
      })
      if (error) throw error
      setSent(true)
    } catch (err) {
      setFormError(err.message || 'Something went wrong. Please try again, or email us directly.')
    } finally {
      setSending(false)
    }
  }

  if (sent) return (
    <div className="contact-success" role="status" aria-live="polite">
      <span aria-hidden="true">✓</span>
      <h3>Message received.</h3>
      <p>Thank you for reaching out. Our team will respond within 1–2 business days.</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <div className="contact-form-grid">
        <div className="contact-field"><label htmlFor="contact-name">Your full name <i>*</i></label><input id="contact-name" name="name" autoComplete="name" required value={form.name} onChange={e => update('name', e.target.value)} placeholder="Enter your full name" /></div>
        <div className="contact-field"><label htmlFor="contact-email">Email address <i>*</i></label><input id="contact-email" name="email" type="email" autoComplete="email" required value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" /></div>
      </div>
      <div className="contact-form-grid">
        <div className="contact-field"><label htmlFor="contact-organisation">Company or event name</label><input id="contact-organisation" name="organisation" autoComplete="organization" value={form.organisation} onChange={e => update('organisation', e.target.value)} placeholder="Enter company or event name (optional)" /></div>
        <div className="contact-field"><label htmlFor="contact-topic">What’s this about?</label><select id="contact-topic" name="inquiryType" value={form.inquiryType} onChange={e => update('inquiryType', e.target.value)}>{INQUIRY_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select></div>
      </div>
      <div className="contact-field"><label htmlFor="contact-message">Tell us what you need <i>*</i></label><textarea id="contact-message" name="message" required rows={5} value={form.message} onChange={e => update('message', e.target.value)} placeholder="Please share the details of your enquiry..." /></div>
      {formError && <div className="contact-error" role="alert">{formError}</div>}
      <div className="contact-form-bottom">
        <div className="contact-assurances"><span><b>✓</b> We value your time</span><span><b>✓</b> Your information is secure</span></div>
        <button type="submit" disabled={sending}>{sending ? 'SENDING…' : 'SEND MESSAGE'} <span aria-hidden="true">↗</span></button>
      </div>
    </form>
  )
}
