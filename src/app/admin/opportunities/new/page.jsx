'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const initial = { title: '', organisation_name: '', summary: '', description: '', location: '', work_mode: 'hybrid', employment_type: 'full-time', experience_level: '', industry: '', compensation: '', application_url: '', closing_at: '' }

export default function AdminCreateOpportunity() {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [published, setPublished] = useState(null)
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }))

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/admin/login'; return }
      const response = await fetch('/api/admin/opportunities/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
        body: JSON.stringify(form),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'The job could not be published.')
      setPublished(result)
    } catch (err) {
      setError(err.message || 'The job could not be published.')
    } finally {
      setSaving(false)
    }
  }

  const field = (key, label, required = false, type = 'text') => <label className="vi-job-field" key={key}>{label}{required && <span> *</span>}<input required={required} type={type} value={form[key]} onChange={event => set(key, event.target.value)} /></label>

  if (published) return <main className="vi-job-admin"><section className="vi-job-admin-card"><div className="vi-job-kicker">VALORIA · JOB PUBLISHED</div><h1>Your job listing is live.</h1><p>The listing is now available on the public Jobs page and has been recorded in the administrator review history.</p><div className="vi-job-actions"><Link href={'/opportunities/' + published.slug}>VIEW LISTING ↗</Link><Link href="/admin/opportunities">RETURN TO OPPORTUNITY ADMIN</Link><button onClick={() => { setForm(initial); setPublished(null) }}>ADD ANOTHER JOB</button></div></section><style jsx>{`
    .vi-job-admin{min-height:100vh;background:#0F0F1A;color:#F7F4EE;font-family:Raleway,Arial,sans-serif;padding-bottom:70px}
    .vi-job-admin-card{max-width:900px;margin:55px auto;padding:clamp(24px,5vw,54px);background:#1A1A2E;border:1px solid rgba(201,168,76,.18);border-radius:16px}
    .vi-job-kicker{font-size:10px;font-weight:800;letter-spacing:.18em;color:#C9A84C}
    h1{font-size:clamp(34px,5vw,54px);font-weight:500;margin:16px 0}
    p{color:rgba(247,244,238,.65);line-height:1.75}
    .vi-job-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:25px}
    .vi-job-actions a,.vi-job-actions button{border:0;border-radius:999px;background:#C9A84C;color:#0F0F1A;padding:14px 22px;font:800 10px Raleway,Arial,sans-serif;letter-spacing:.12em;text-decoration:none;cursor:pointer}
    .vi-job-actions a:nth-child(2),.vi-job-actions button{background:transparent;color:#F7F4EE;border:1px solid rgba(247,244,238,.3)}
  `}</style></main>

  return <main className="vi-job-admin">
    <header className="vi-job-admin-header"><Link href="/admin/opportunities">← Opportunity management</Link><span>VALORIA INSTITUTE · ADMIN</span></header>
    <section className="vi-job-admin-card">
      <div className="vi-job-kicker">VALORIA · ADMINISTRATOR PUBLISHING</div>
      <h1>Add a job listing.</h1>
      <p>Valoria administrators can publish verified job opportunities directly. Employer and recruiter submissions continue through the separate review process.</p>
      <form onSubmit={submit}>
        <div className="vi-job-admin-grid">
          {field('title', 'JOB TITLE', true)}
          {field('organisation_name', 'ORGANISATION', true)}
          <label className="vi-job-field">EMPLOYMENT TYPE<select value={form.employment_type} onChange={event => set('employment_type', event.target.value)}>{['full-time','part-time','contract','temporary','internship'].map(x => <option key={x}>{x}</option>)}</select></label>
          {field('location', 'LOCATION')}
          <label className="vi-job-field">WORK MODE<select value={form.work_mode} onChange={event => set('work_mode', event.target.value)}>{['onsite','hybrid','remote'].map(x => <option key={x}>{x}</option>)}</select></label>
          {field('industry', 'INDUSTRY')}
          {field('experience_level', 'EXPERIENCE LEVEL')}
          {field('compensation', 'COMPENSATION / SALARY')}
          {field('application_url', 'EXTERNAL APPLICATION URL', false, 'url')}
          {field('closing_at', 'APPLICATION DEADLINE', false, 'date')}
        </div>
        <label className="vi-job-field vi-job-wide">SHORT SUMMARY<textarea rows="3" maxLength="500" value={form.summary} onChange={event => set('summary', event.target.value)} /></label>
        <label className="vi-job-field vi-job-wide">FULL JOB DESCRIPTION <span>*</span><textarea required rows="10" maxLength="10000" value={form.description} onChange={event => set('description', event.target.value)} /></label>
        <div className="vi-job-publish-note">Publishing this listing makes it publicly visible immediately. Confirm the employer, role details, deadline and application destination before publishing.</div>
        {error && <p className="vi-job-error" role="alert">{error}</p>}
        <button className="vi-job-publish" type="submit" disabled={saving}>{saving ? 'PUBLISHING…' : 'PUBLISH JOB LISTING'}</button>
      </form>
    </section>
    <style jsx>{`
      .vi-job-admin{min-height:100vh;background:#0F0F1A;color:#F7F4EE;font-family:Raleway,Arial,sans-serif;padding-bottom:70px}
      .vi-job-admin-header{height:68px;padding:0 5vw;border-bottom:1px solid rgba(201,168,76,.2);display:flex;align-items:center;justify-content:space-between;font-size:10px;letter-spacing:.14em}
      .vi-job-admin-header a{color:#C9A84C;text-decoration:none}
      .vi-job-admin-card{max-width:900px;margin:55px auto;padding:clamp(24px,5vw,54px);background:#1A1A2E;border:1px solid rgba(201,168,76,.18);border-radius:16px}
      .vi-job-kicker{font-size:10px;font-weight:800;letter-spacing:.18em;color:#C9A84C}
      h1{font-size:clamp(34px,5vw,54px);font-weight:500;letter-spacing:-.035em;margin:16px 0}
      .vi-job-admin-card>p{color:rgba(247,244,238,.65);line-height:1.75;max-width:700px;margin-bottom:32px}
      .vi-job-admin-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
      .vi-job-field{display:flex;flex-direction:column;gap:8px;margin:0 0 18px;font-size:9px;font-weight:800;letter-spacing:.12em;color:rgba(247,244,238,.75)}
      .vi-job-field span{color:#C9A84C}
      .vi-job-field input,.vi-job-field select,.vi-job-field textarea{width:100%;box-sizing:border-box;border:1px solid rgba(201,168,76,.25);border-radius:8px;padding:13px;background:#11111D;color:#F7F4EE;font:500 14px Raleway,Arial,sans-serif;letter-spacing:0}
      .vi-job-field input,.vi-job-field select{min-height:46px}
      .vi-job-field textarea{resize:vertical;line-height:1.65}
      .vi-job-wide{margin-top:4px}
      .vi-job-publish-note{padding:15px 18px;margin:16px 0 22px;background:rgba(201,168,76,.08);border-left:3px solid #C9A84C;font-size:12px;line-height:1.7;color:rgba(247,244,238,.75)}
      .vi-job-error{color:#F0A48E;font-size:13px}
      .vi-job-publish,.vi-job-actions a,.vi-job-actions button{border:0;border-radius:999px;background:#C9A84C;color:#0F0F1A;padding:14px 22px;font:800 10px Raleway,Arial,sans-serif;letter-spacing:.12em;text-decoration:none;cursor:pointer}
      .vi-job-publish:disabled{opacity:.6;cursor:wait}
      @media(max-width:650px){.vi-job-admin-header{padding:0 18px}.vi-job-admin-card{margin:25px 14px}.vi-job-admin-grid{grid-template-columns:1fr}}
    `}</style>
  </main>
}
