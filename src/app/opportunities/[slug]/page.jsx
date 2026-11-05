'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import './detail.css'

function formatDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

function DetailItem({ label, value }) {
  if (!value) return null
  return <div className="op-detail-item"><span>{label}</span><strong>{value}</strong></div>
}

export default function OpportunityDetail({ params }) {
  const [opportunity, setOpportunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [session, setSession] = useState(null)
  const [coverNote, setCoverNote] = useState('')
  const [applied, setApplied] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [response, sessionResult] = await Promise.all([
          fetch('/api/opportunities', { headers: { Accept: 'application/json' } }),
          supabase.auth.getSession(),
        ])
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(payload.error || 'Opportunities could not be loaded.')
        if (active) {
          setOpportunity((payload.opportunities || []).find(item => item.slug === params.slug) || null)
          setSession(sessionResult.data?.session || null)
        }
      } catch (err) {
        if (active) setError(err.message || 'Opportunity could not be loaded.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [params.slug])

  async function apply() {
    setApplyError('')
    if (!session) {
      window.location.href = '/login?returnTo=' + encodeURIComponent(window.location.pathname)
      return
    }
    setApplying(true)
    try {
      const response = await fetch('/api/opportunities/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
        body: JSON.stringify({ opportunity_id: opportunity.id, cover_note: coverNote }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Application could not be submitted.')
      setApplied(true)
    } catch (err) {
      setApplyError(err.message || 'Application could not be submitted.')
    } finally {
      setApplying(false)
    }
  }

  return (
    <>
      <Nav />
      <main className="op-detail-page">
        {loading ? (
          <section className="op-detail-state" role="status">Loading opportunity…</section>
        ) : error ? (
          <section className="op-detail-state"><h1>We could not load this opportunity.</h1><p>{error}</p><Link href="/opportunities">Back to opportunities</Link></section>
        ) : !opportunity ? (
          <section className="op-detail-state"><h1>Opportunity not found.</h1><p>This listing may have closed or may no longer be public.</p><Link href="/opportunities">Back to opportunities</Link></section>
        ) : (
          <>
            <section className="op-detail-hero">
              <div className="op-detail-shell">
                <div className="op-detail-kicker">{String(opportunity.opportunity_type || 'opportunity').replace(/[_-]+/g, ' ').toUpperCase()}</div>
                <h1>{opportunity.title}</h1>
                <p className="op-detail-org">{opportunity.organisation_name}</p>
                <div className="op-detail-meta">
                  {[opportunity.location, opportunity.work_mode, opportunity.employment_type, opportunity.experience_level].filter(Boolean).map(value => <span key={value}>{value}</span>)}
                </div>
              </div>
            </section>

            <section className="op-detail-content">
              <div className="op-detail-main">
                <div className="op-detail-section">
                  <div className="op-detail-label">OPPORTUNITY DETAILS</div>
                  <div className="op-detail-description">{opportunity.description || opportunity.summary}</div>
                </div>
                {(opportunity.capabilities?.length > 0 || opportunity.skills?.length > 0) && (
                  <div className="op-detail-section">
                    <div className="op-detail-label">REQUIRED EXPERTISE</div>
                    <div className="op-detail-tags">{[...(opportunity.capabilities || []), ...(opportunity.skills || [])].filter(Boolean).map(value => <span key={value}>{value}</span>)}</div>
                  </div>
                )}
                {opportunity.application_method === 'external' && opportunity.application_url && (
                  <div className="op-detail-apply-card">
                    <h2>Apply with the organisation.</h2>
                    <p>This opportunity uses an external application route. Your application will be handled by the organisation listed above.</p>
                    <a className="op-detail-primary" href={opportunity.application_url}>CONTINUE TO APPLICATION →</a>
                  </div>
                )}
                {opportunity.application_method !== 'external' && (
                  <div className="op-detail-apply-card">
                    {applied ? (
                      <>
                        <h2>Application received.</h2>
                        <p>Your application is saved. You can follow its status from your applications area.</p>
                        <Link href="/profile/applications" className="op-detail-primary">OPEN MY APPLICATIONS →</Link>
                      </>
                    ) : (
                      <>
                        <div className="op-detail-label">VALORIA APPLICATION</div>
                        <h2>Express your interest.</h2>
                        <p>Apply through your Valoria professional record. You must meet the platform’s listing requirements to apply.</p>
                        <label className="op-detail-note-label" htmlFor="opportunity-cover-note">Cover note (optional)</label>
                        <textarea id="opportunity-cover-note" value={coverNote} onChange={event => setCoverNote(event.target.value)} maxLength={5000} placeholder="Briefly explain your interest and relevant experience." />
                        {applyError && <p className="op-detail-error" role="alert">{applyError}</p>}
                        <button className="op-detail-primary" onClick={apply} disabled={applying}>{applying ? 'SUBMITTING…' : 'APPLY THROUGH VALORIA →'}</button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <aside className="op-detail-sidebar">
                <div className="op-detail-label">AT A GLANCE</div>
                <DetailItem label="Organisation" value={opportunity.organisation_name} />
                <DetailItem label="Location" value={opportunity.location} />
                <DetailItem label="Work arrangement" value={opportunity.work_mode} />
                <DetailItem label="Engagement" value={opportunity.employment_type} />
                <DetailItem label="Experience" value={opportunity.experience_level} />
                <DetailItem label="Industry" value={opportunity.industry} />
                <DetailItem label="Compensation" value={opportunity.compensation} />
                <DetailItem label="Application deadline" value={formatDate(opportunity.closing_at)} />
                <Link href="/opportunities" className="op-detail-back">← ALL OPPORTUNITIES</Link>
              </aside>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  )
}
