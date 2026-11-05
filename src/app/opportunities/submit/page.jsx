'use client'

import { useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import '../opportunities.css'

const initialForm = {
  opportunity_type: '',
  work_mode: '',
  employment_type: '',
  experience_level: '',
  industry: '',
  location: '',
  compensation: '',
  closing_at: '',
  application_url: '',
  summary: '',
  description: '',
  skills_text: '',
  capabilities: [],
  submitter_name: '',
  submitter_email: '',
  organisation_name: '',
  website: '',
}

const CAPABILITIES = [
  ['talent', 'Talent / candidate'],
  ['speaker', 'Speaker'],
  ['facilitator', 'Facilitator'],
]

export default function SubmitOpportunity() {
  const [form, setForm] = useState(initialForm)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const toggleCapability = capability => setForm(current => ({
    ...current,
    capabilities: current.capabilities.includes(capability)
      ? current.capabilities.filter(value => value !== capability)
      : [...current.capabilities, capability],
  }))

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        skills: form.skills_text.split(',').map(value => value.trim()).filter(Boolean),
        closing_at: form.closing_at ? new Date(form.closing_at + 'T23:59:00').toISOString() : null,
      }
      delete payload.skills_text
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  return (
    <>
      <Nav />
      <main className="opportunities-page">
        <section className="opportunities-hero">
          <div className="opportunities-shell">
            <div className="opportunities-kicker">VALORIA OPPORTUNITIES</div>
            <h1 className="opportunities-title">Submit an opportunity<br /><em>for review.</em></h1>
            <p className="opportunities-lede">Employers, recruiters and partners can submit a professional opportunity. Valoria reviews each submission before it becomes public.</p>
            <Link href="/opportunities" className="op-listing-action">← BACK TO OPPORTUNITIES</Link>
          </div>
        </section>

        <section className="opportunities-content">
          {sent ? (
            <div className="opportunities-empty" role="status">
              <h2>Submission received.</h2>
              <p>Your opportunity is pending review. It will not appear publicly until it has been reviewed and published.</p>
              <Link href="/opportunities" className="opportunities-submit">RETURN TO OPPORTUNITIES</Link>
            </div>
          ) : (
            <form className="op-submit-form" onSubmit={submit}>
              <div className="op-submit-grid">
                <label>Organisation
                  <input required maxLength={180} value={form.organisation_name} onChange={event => set('organisation_name', event.target.value)} />
                </label>
                <label>Opportunity title
                  <input required maxLength={180} value={form.title || ''} onChange={event => set('title', event.target.value)} />
                </label>
                <label>Your name
                  <input required maxLength={140} value={form.submitter_name} onChange={event => set('submitter_name', event.target.value)} />
                </label>
                <label>Your email
                  <input required type="email" value={form.submitter_email} onChange={event => set('submitter_email', event.target.value)} />
                </label>
                <label>Opportunity category
                  <select required value={form.opportunity_type} onChange={event => set('opportunity_type', event.target.value)}>
                    <option value="">Select category</option>
                    {['job','contract','consulting','speaking','facilitation','coaching','project'].map(value => <option key={value} value={value}>{value.replaceAll('_',' ').replace(/^\w/, letter => letter.toUpperCase())}</option>)}
                  </select>
                </label>
                <label>Work arrangement
                  <select required value={form.work_mode} onChange={event => set('work_mode', event.target.value)}>
                    <option value="">Select arrangement</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="on-site">On-site</option>
                  </select>
                </label>
                <label>Employment / engagement type
                  <input value={form.employment_type} onChange={event => set('employment_type', event.target.value)} placeholder="e.g. Full-time, contract, one-off engagement" />
                </label>
                <label>Experience level
                  <input value={form.experience_level} onChange={event => set('experience_level', event.target.value)} placeholder="Describe the level required" />
                </label>
                <label>Industry
                  <input value={form.industry} onChange={event => set('industry', event.target.value)} />
                </label>
                <label>Location
                  <input value={form.location} onChange={event => set('location', event.target.value)} placeholder="City, country or remote" />
                </label>
                <label>Compensation / engagement terms
                  <input value={form.compensation} onChange={event => set('compensation', event.target.value)} placeholder="Share only confirmed terms" />
                </label>
                <label>Application deadline
                  <input type="date" value={form.closing_at} onChange={event => set('closing_at', event.target.value)} />
                </label>
                <label className="op-submit-full">Required skills (comma-separated)
                  <input value={form.skills_text} onChange={event => set('skills_text', event.target.value)} placeholder="e.g. Strategic thinking, stakeholder management" />
                </label>
                <fieldset className="op-submit-full">
                  <legend>Professional role(s) sought</legend>
                  <div className="op-submit-checks">
                    {CAPABILITIES.map(([value, label]) => <label key={value}><input type="checkbox" checked={form.capabilities.includes(value)} onChange={() => toggleCapability(value)} />{label}</label>)}
                  </div>
                </fieldset>
                <label className="op-submit-full">Short summary
                  <textarea rows={3} maxLength={500} value={form.summary} onChange={event => set('summary', event.target.value)} placeholder="A concise description for the public listing." />
                </label>
                <label className="op-submit-full">Full description
                  <textarea required rows={8} maxLength={10000} value={form.description} onChange={event => set('description', event.target.value)} placeholder="Describe the work, responsibilities, requirements and engagement terms." />
                </label>
                <label className="op-submit-full">Application URL (optional)
                  <input type="url" value={form.application_url} onChange={event => set('application_url', event.target.value)} placeholder="https://" />
                  <small>If supplied, applicants will be directed to the organisation’s external application route. Otherwise, applications are handled through Valoria where enabled.</small>
                </label>
                <div className="op-submit-honeypot" aria-hidden="true">
                  <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={event => set('website', event.target.value)} /></label>
                </div>
              </div>
              {error && <p className="op-submit-error" role="alert">{error}</p>}
              <button className="opportunities-submit" type="submit" disabled={saving}>{saving ? 'SUBMITTING…' : 'SUBMIT FOR REVIEW'}</button>
            </form>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
