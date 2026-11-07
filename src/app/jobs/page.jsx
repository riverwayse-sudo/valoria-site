'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import './jobs.css'

const READ_ONLY_PREVIEW = process.env.NEXT_PUBLIC_VALU_PREVIEW === '1' && process.env.NEXT_PUBLIC_VALU_STAGING_API_ENABLED !== '1'

function formatClosingDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [employmentType, setEmploymentType] = useState('all')

  useEffect(() => {
    if (READ_ONLY_PREVIEW) {
      setLoading(false)
      return
    }
    let active = true
    fetch('/api/opportunities', { cache: 'no-store' })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(payload.error || 'Job listings could not be loaded.')
        return payload.opportunities || []
      })
      .then((items) => {
        if (active) setJobs(items.filter((item) => (item.opportunity_type || 'job').toLowerCase() === 'job'))
      })
      .catch((err) => { if (active) setError(err.message || 'Job listings could not be loaded.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase()
    const place = location.trim().toLowerCase()
    return jobs.filter((job) => {
      const searchable = [job.title, job.organisation_name, job.summary, job.industry, ...(job.skills || []), ...(job.capabilities || [])].filter(Boolean).join(' ').toLowerCase()
      const locationText = [job.location, job.work_mode].filter(Boolean).join(' ').toLowerCase()
      const matchesSearch = !term || searchable.includes(term)
      const matchesLocation = !place || locationText.includes(place)
      const matchesType = employmentType === 'all' || (job.employment_type || '').toLowerCase() === employmentType
      return matchesSearch && matchesLocation && matchesType
    })
  }, [jobs, search, location, employmentType])

  return <>
    <Nav />
    <main className="jobs-page">
      <section className="jobs-hero page-hero">
        <div className="page-hero-inner jobs-hero-inner">
          <p className="page-kicker">VALORIA · JOBS</p>
          <h1 className="page-title">Find work that meets <em>your capability.</em></h1>
          <p className="page-sub">Explore reviewed job opportunities from organisations seeking people who can make a meaningful contribution. Clear role details. A defined route to apply.</p>
          <div className="jobs-hero-actions">
            <a href="#job-listings" className="jobs-primary-link">EXPLORE OPEN ROLES <span aria-hidden="true">↓</span></a>
            <Link href="/opportunities/submit" className="jobs-secondary-link">POST A JOB</Link>
          </div>
        </div>
      </section>

      <section className="jobs-content" id="job-listings">
        <div className="jobs-content-inner">
          <div className="jobs-heading-row">
            <div>
              <p className="jobs-eyebrow">THE OPPORTUNITY BOARD</p>
              <h2>Current openings</h2>
              <p>Listings are published after Valoria review. Select a role to read the full description and application instructions.</p>
            </div>
            {!loading && <span className="jobs-count">{filteredJobs.length} {filteredJobs.length === 1 ? 'ROLE' : 'ROLES'}</span>}
          </div>

          {READ_ONLY_PREVIEW && <div className="jobs-notice" role="status">STAGING PREVIEW — Live job data and applications are not connected in this isolated preview. No production records are displayed or changed.</div>}
          {error && <div className="jobs-notice jobs-error" role="alert">{error}</div>}

          <div className="jobs-filters" aria-label="Filter job listings">
            <label>SEARCH ROLES<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Job title, organisation or skill" /></label>
            <label>LOCATION<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, country or remote" /></label>
            <label>EMPLOYMENT TYPE<select value={employmentType} onChange={(event) => setEmploymentType(event.target.value)}><option value="all">All arrangements</option><option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="contract">Contract</option><option value="temporary">Temporary</option><option value="internship">Internship</option></select></label>
          </div>

          {loading ? <p className="jobs-state">Loading current openings…</p>
            : filteredJobs.length === 0 ? <div className="jobs-empty">
                <span className="jobs-empty-index">01 / OPPORTUNITY BOARD</span>
                <h3>{jobs.length === 0 ? 'No open roles at the moment.' : 'No roles match those filters.'}</h3>
                <p>{jobs.length === 0 ? 'New positions will appear here once they have been reviewed and published. You can return to explore the wider professional opportunity board.' : 'Try a different title, location or employment arrangement.'}</p>
                {jobs.length > 0
                  ? <button type="button" onClick={() => { setSearch(''); setLocation(''); setEmploymentType('all') }}>CLEAR FILTERS</button>
                  : <Link href="/opportunities">EXPLORE ALL OPPORTUNITIES →</Link>}
              </div>
            : <div className="jobs-list">
                {filteredJobs.map((job, index) => {
                  const closing = formatClosingDate(job.closing_at)
                  return <Link href={'/opportunities/' + job.slug} className="jobs-card" key={job.id}>
                    <span className="jobs-card-number">{String(index + 1).padStart(2, '0')}</span>
                    <div className="jobs-card-main">
                      <div className="jobs-card-meta">{[job.industry, job.employment_type, job.work_mode].filter(Boolean).join(' · ') || 'PROFESSIONAL ROLE'}</div>
                      <h3>{job.title}</h3>
                      <p className="jobs-card-organisation">{job.organisation_name}</p>
                      <p className="jobs-card-summary">{job.summary || 'Open this listing to review the role description and application route.'}</p>
                    </div>
                    <div className="jobs-card-aside">
                      <span>{job.location || 'Location to be confirmed'}</span>
                      {job.compensation && <span>{job.compensation}</span>}
                      {closing && <span>Closes {closing}</span>}
                      <span className="jobs-card-open">VIEW ROLE <b aria-hidden="true">↗</b></span>
                    </div>
                  </Link>
                })}
              </div>}
        </div>
      </section>
    </main>
    <Footer />
  </>
}
