'use client'

import { useState } from 'react'

const GOLD = '#C9A84C'
const DARK = '#1A1A2E'
const PARCH = '#F7F4EE'
const IS_READ_ONLY_PREVIEW = process.env.NEXT_PUBLIC_VALU_PREVIEW === '1' && process.env.NEXT_PUBLIC_VALU_STAGING_API_ENABLED !== '1'

const initialForm = {
  opportunity_type: 'job',
  work_mode: 'hybrid',
  employment_type: 'full-time',
}

const inputStyle = {
  display: 'block',
  width: '100%',
  minHeight: 48,
  boxSizing: 'border-box',
  padding: '12px 14px',
  marginTop: 8,
  border: '1px solid #D4C9A8',
  borderRadius: 8,
  background: '#FAFAF7',
  color: DARK,
  font: '500 15px Raleway, Arial, sans-serif',
}

const labelStyle = {
  display: 'block',
  margin: '18px 0',
  color: '#514F55',
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '.08em',
  textAlign: 'left',
}

function Field({ label, name, value, onChange, required = false, type = 'text', placeholder = '', maxLength }) {
  return (
    <label htmlFor={name} style={labelStyle}>
      {label}{required ? ' *' : ''}
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        maxLength={maxLength}
        value={value || ''}
        placeholder={placeholder}
        onChange={event => onChange(name, event.target.value)}
        style={inputStyle}
      />
    </label>
  )
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label htmlFor={name} style={labelStyle}>
      {label}
      <select id={name} name={name} value={value} onChange={event => onChange(name, event.target.value)} style={inputStyle}>
        {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  )
}

function TextAreaField({ label, name, value, onChange, required = false, maxLength, rows = 5, hint }) {
  return (
    <label htmlFor={name} style={labelStyle}>
      {label}{required ? ' *' : ''}
      {hint && <span style={{ display: 'block', marginTop: 5, color: '#77727A', fontSize: 12, fontWeight: 400, letterSpacing: 0, lineHeight: 1.6 }}>{hint}</span>}
      <textarea
        id={name}
        name={name}
        required={required}
        maxLength={maxLength}
        rows={rows}
        value={value || ''}
        onChange={event => onChange(name, event.target.value)}
        style={{ ...inputStyle, minHeight: rows * 24, resize: 'vertical' }}
      />
    </label>
  )
}

export default function SubmitOpportunity() {
  const [form, setForm] = useState(initialForm)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function set(name, value) {
    setForm(current => ({ ...current, [name]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    if (IS_READ_ONLY_PREVIEW) {
      setError('Read-only preview: submissions are disabled. No data will be sent or saved.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Could not submit this opportunity.')
      setSent(true)
    } catch (submissionError) {
      setError(submissionError.message || 'Could not submit this opportunity.')
    } finally {
      setSaving(false)
    }
  }

  if (sent) {
    return (
      <main style={{ minHeight: '100vh', background: DARK, color: PARCH, display: 'grid', placeItems: 'center', padding: 30, fontFamily: 'Raleway, Arial' }}>
        <div style={{ maxWidth: 620, width: '100%', textAlign: 'left' }}>
          <div style={{ color: GOLD, fontWeight: 800, letterSpacing: '.15em', fontSize: 11 }}>SUBMISSION RECEIVED</div>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 400 }}>Valoria will review your opportunity.</h1>
          <p style={{ opacity: .75, lineHeight: 1.7 }}>Your submission is pending review. It will not be published until Valoria approves it. We will use the contact details you provided if clarification is required.</p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: PARCH, color: DARK, padding: 'clamp(48px, 8vw, 88px) 7vw', fontFamily: 'Raleway, Arial' }}>
      <form onSubmit={submit} style={{ maxWidth: 760, width: '100%', margin: '0 auto', textAlign: 'left' }}>
        <div style={{ color: '#80672B', fontSize: 11, fontWeight: 800, letterSpacing: '.16em' }}>VALORIA OPPORTUNITIES</div>
        <h1 style={{ fontSize: 'clamp(34px, 6vw, 52px)', lineHeight: 1.08, fontWeight: 400, margin: '16px 0' }}>Submit an opportunity for review.</h1>
        <p style={{ color: '#5C5B68', lineHeight: 1.7, maxWidth: 680 }}>Employers, recruiters and partners can submit opportunities. Valoria reviews every submission before publication. Provide clear role details and a working application or enquiry route.</p>

        {IS_READ_ONLY_PREVIEW && <p role="status" style={{ padding: 14, border: '1px solid rgba(201,168,76,.55)', background: 'rgba(201,168,76,.08)', lineHeight: 1.6 }}>STAGING PREVIEW — Submission is disabled. This form is available for layout review only; no data will be sent or saved.</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', columnGap: 20 }}>
          <Field label="YOUR NAME" name="submitter_name" value={form.submitter_name} onChange={set} required maxLength={140} />
          <Field label="WORK EMAIL" name="submitter_email" type="email" value={form.submitter_email} onChange={set} required maxLength={254} />
          <Field label="ORGANISATION" name="organisation_name" value={form.organisation_name} onChange={set} required maxLength={180} />
          <Field label="OPPORTUNITY TITLE" name="title" value={form.title} onChange={set} required maxLength={180} />
          <SelectField label="OPPORTUNITY TYPE" name="opportunity_type" value={form.opportunity_type} onChange={set} options={[
            { value: 'job', label: 'Job' }, { value: 'contract', label: 'Contract' }, { value: 'consulting', label: 'Consulting' },
            { value: 'speaking', label: 'Speaking' }, { value: 'facilitation', label: 'Facilitation' }, { value: 'coaching', label: 'Coaching' }, { value: 'project', label: 'Project' },
          ]} />
          <SelectField label="WORK ARRANGEMENT" name="work_mode" value={form.work_mode} onChange={set} options={[
            { value: 'onsite', label: 'On-site' }, { value: 'hybrid', label: 'Hybrid' }, { value: 'remote', label: 'Remote' },
          ]} />
          <SelectField label="EMPLOYMENT TYPE" name="employment_type" value={form.employment_type} onChange={set} options={[
            { value: 'full-time', label: 'Full-time' }, { value: 'part-time', label: 'Part-time' }, { value: 'contract', label: 'Contract' }, { value: 'temporary', label: 'Temporary' }, { value: 'internship', label: 'Internship' },
          ]} />
          <Field label="LOCATION" name="location" value={form.location} onChange={set} placeholder="City, country or remote" maxLength={160} />
          <Field label="INDUSTRY" name="industry" value={form.industry} onChange={set} maxLength={120} />
          <Field label="EXPERIENCE LEVEL" name="experience_level" value={form.experience_level} onChange={set} placeholder="e.g. Mid-level, Senior" maxLength={80} />
          <Field label="COMPENSATION" name="compensation" value={form.compensation} onChange={set} placeholder="Optional; include currency and basis" maxLength={120} />
          <Field label="APPLICATION DEADLINE" name="closing_at" type="date" value={form.closing_at} onChange={set} />
        </div>

        <TextAreaField label="SHORT SUMMARY" name="summary" value={form.summary} onChange={set} maxLength={400} rows={3} hint="A concise description shown on the opportunity card." />
        <TextAreaField label="FULL DESCRIPTION" name="description" value={form.description} onChange={set} required maxLength={10000} rows={8} hint="Describe the responsibilities, requirements, location and what a suitable applicant should provide." />
        <Field label="APPLICATION URL" name="application_url" type="url" value={form.application_url} onChange={set} placeholder="https://…" maxLength={2048} />

        {error && <p role="alert" style={{ color: '#9A3F34', lineHeight: 1.6 }}>{error}</p>}
        <button type="submit" disabled={saving || IS_READ_ONLY_PREVIEW} style={{ minHeight: 48, padding: '14px 24px', background: GOLD, color: DARK, border: 0, borderRadius: 999, fontWeight: 800, letterSpacing: '.1em', opacity: IS_READ_ONLY_PREVIEW ? .55 : 1, cursor: IS_READ_ONLY_PREVIEW ? 'not-allowed' : 'pointer' }}>
          {IS_READ_ONLY_PREVIEW ? 'SUBMISSIONS DISABLED IN PREVIEW' : saving ? 'SUBMITTING…' : 'SUBMIT FOR REVIEW'}
        </button>
        <p style={{ color: '#77727A', fontSize: 12, lineHeight: 1.6, marginTop: 18 }}>All submissions remain private until reviewed. Publication is not guaranteed, and Valoria may request clarification before approval.</p>
      </form>
    </main>
  )
}
