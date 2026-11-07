'use client'

import { useRef, useState } from 'react'

const GOLD = '#C9A84C'
const DARK = '#1A1A2E'
const PARCH = '#F7F4EE'
const IS_READ_ONLY_PREVIEW = process.env.NEXT_PUBLIC_VALU_PREVIEW === '1' && process.env.NEXT_PUBLIC_VALU_STAGING_API_ENABLED !== '1'

export default function SubmitOpportunity() {
  const [form, setForm] = useState({
    opportunity_type: 'job',
    work_mode: 'hybrid',
    employment_type: 'full-time'
  })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const submissionKey = useRef(null)
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }))

  async function submit(event) {
    event.preventDefault()
    if (IS_READ_ONLY_PREVIEW) {
      setError('Read-only preview: submissions are disabled. No data will be sent or saved.')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (!submissionKey.current) submissionKey.current = window.crypto.randomUUID()
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, submission_key: submissionKey.current })
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Could not submit the opportunity.')
      setSent(true)
    } catch (err) {
      setError(err.message || 'Could not submit the opportunity.')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = { display: 'block', width: '100%', boxSizing: 'border-box', padding: 14, marginTop: 7, border: '1px solid #D4C9A8', background: '#FAFAF7', color: DARK }
  const labelStyle = { display: 'block', margin: '18px 0', fontSize: 12, fontWeight: 700, textAlign: 'left' }
  const fields = ['submitter_name', 'submitter_email', 'organisation_name', 'title', 'location', 'experience_level', 'industry', 'compensation', 'application_url']

  if (sent) {
    return <main style={{ minHeight: '100vh', background: DARK, color: PARCH, display: 'grid', placeItems: 'center', padding: 30, fontFamily: 'Raleway,Arial' }}>
      <div style={{ maxWidth: 620, textAlign: 'left' }}>
        <div style={{ color: GOLD, fontWeight: 800, letterSpacing: '.15em', fontSize: 11 }}>SUBMISSION RECEIVED</div>
        <h1>Valoria will review your opportunity.</h1>
        <p style={{ opacity: .7, lineHeight: 1.7 }}>It will not be published until it passes review. We will use the contact details you provided if clarification is required.</p>
      </div>
    </main>
  }

  return <main style={{ minHeight: '100vh', background: PARCH, color: DARK, padding: '80px 7vw', fontFamily: 'Raleway,Arial', textAlign: 'left' }}>
    <form onSubmit={submit} style={{ maxWidth: 760, margin: '0 auto', textAlign: 'left' }}>
      <div style={{ color: GOLD, fontSize: 11, fontWeight: 800, letterSpacing: '.16em' }}>POST AN OPPORTUNITY</div>
      <h1 style={{ fontSize: 48, textAlign: 'left' }}>Submit an opportunity for review.</h1>
      <p style={{ opacity: .65, lineHeight: 1.6, textAlign: 'left' }}>Employers, recruiters and partners can submit opportunities. Valoria reviews every submission before publication.</p>
      {IS_READ_ONLY_PREVIEW && <p role="status" style={{ padding: 14, border: '1px solid rgba(201,168,76,.55)', background: 'rgba(201,168,76,.08)', lineHeight: 1.6, textAlign: 'left' }}>STAGING PREVIEW — Submission is disabled. This form is available for layout review only; no data will be sent or saved.</p>}

      {fields.map(key => <label key={key} style={labelStyle}>
        {key.replaceAll('_', ' ').toUpperCase()}
        <input
          type={key === 'submitter_email' ? 'email' : key === 'application_url' ? 'url' : 'text'}
          required={['submitter_name', 'submitter_email', 'organisation_name', 'title'].includes(key)}
          value={form[key] || ''}
          onChange={event => set(key, event.target.value)}
          maxLength={key === 'application_url' ? 2048 : undefined}
          style={inputStyle}
        />
      </label>)}

      <label style={labelStyle}>OPPORTUNITY TYPE
        <select value={form.opportunity_type} onChange={event => set('opportunity_type', event.target.value)} style={inputStyle}>
          {['job', 'contract', 'consulting', 'speaking', 'facilitation', 'coaching', 'project'].map(value => <option key={value}>{value}</option>)}
        </select>
      </label>
      <label style={labelStyle}>EMPLOYMENT TYPE
        <select value={form.employment_type} onChange={event => set('employment_type', event.target.value)} style={inputStyle}>
          {['full-time', 'part-time', 'contract', 'temporary', 'internship'].map(value => <option key={value}>{value}</option>)}
        </select>
      </label>
      <label style={labelStyle}>WORK MODE
        <select value={form.work_mode} onChange={event => set('work_mode', event.target.value)} style={inputStyle}>
          {['onsite', 'hybrid', 'remote'].map(value => <option key={value}>{value}</option>)}
        </select>
      </label>
      <label style={labelStyle}>APPLICATION DEADLINE
        <input type="date" value={form.closing_at || ''} onChange={event => set('closing_at', event.target.value)} style={inputStyle} />
      </label>
      <label style={labelStyle}>SHORT SUMMARY
        <textarea rows={3} maxLength={500} value={form.summary || ''} onChange={event => set('summary', event.target.value)} style={inputStyle} />
      </label>
      <label style={labelStyle}>FULL DESCRIPTION
        <textarea required value={form.description || ''} onChange={event => set('description', event.target.value)} rows={8} maxLength={10000} style={inputStyle} />
      </label>

      {error && <p role="alert" style={{ color: '#a33', textAlign: 'left' }}>{error}</p>}
      <button type="submit" disabled={saving || IS_READ_ONLY_PREVIEW} style={{ padding: '15px 24px', background: GOLD, border: 0, fontWeight: 800, opacity: IS_READ_ONLY_PREVIEW ? 0.55 : 1, cursor: IS_READ_ONLY_PREVIEW ? 'not-allowed' : 'pointer' }}>
        {IS_READ_ONLY_PREVIEW ? 'SUBMISSIONS DISABLED IN PREVIEW' : saving ? 'SUBMITTING…' : 'SUBMIT FOR REVIEW'}
      </button>
    </form>
  </main>
}
