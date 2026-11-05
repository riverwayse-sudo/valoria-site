'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

function titleCase(value) {
  return String(value || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())
}

function closingLabel(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return 'Closes ' + new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

export default function HomepageOpportunities() {
  const [opportunities, setOpportunities] = useState([])
  const [state, setState] = useState('loading')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    setState('loading')
    fetch('/api/opportunities', { headers: { Accept: 'application/json' } })
      .then(async response => {
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(payload.error || 'Opportunity listings are temporarily unavailable.')
        return payload.opportunities || []
      })
      .then(items => {
        if (!active) return
        setOpportunities(items.slice(0, 3))
        setState(items.length ? 'ready' : 'empty')
      })
      .catch(() => { if (active) setState('error') })
    return () => { active = false }
  }, [refreshKey])

  return (
    <section className="home-opportunity-preview" aria-labelledby="home-opportunity-preview-title">
      <div className="container">
        <div className="home-section-heading">
          <div>
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">OPPORTUNITY DISCOVERY</span></div>
            <h2 id="home-opportunity-preview-title">See what is open.<br /><em>Find your next move.</em></h2>
          </div>
          <p>Explore public opportunities when they are available. Listings appear here only after publication and include a route to view the details.</p>
        </div>

        {state === 'loading' && <p className="home-opportunity-state" role="status">Loading current opportunities…</p>}
        {state === 'error' && <div className="home-opportunity-state" role="status"><p>Current opportunity listings could not be loaded.</p><button type="button" onClick={() => setRefreshKey(value => value + 1)}>TRY AGAIN</button> <Link href="/opportunities">OPEN OPPORTUNITIES →</Link></div>}
        {state === 'empty' && <div className="home-opportunity-state"><h3>No public opportunities are listed right now.</h3><p>Check the opportunities page for updates. Organisations can submit an opportunity for review.</p><div className="home-dual-actions"><Link href="/opportunities" className="text-link">VIEW OPPORTUNITIES</Link><Link href="/opportunities/submit" className="text-link">SUBMIT AN OPPORTUNITY</Link></div></div>}

        {state === 'ready' && (
          <>
            <div className="home-opportunity-grid">
              {opportunities.map(item => {
                const expertise = [...(Array.isArray(item.capabilities) ? item.capabilities : []), ...(Array.isArray(item.skills) ? item.skills : [])].filter(Boolean).slice(0, 3)
                return (
                  <article className="home-opportunity-card" key={item.id}>
                    <div className="home-opportunity-meta">
                      <span>{titleCase(item.opportunity_type || 'Opportunity')}</span>
                      {item.work_mode && <span>{titleCase(item.work_mode)}</span>}
                    </div>
                    <h3>{item.title}</h3>
                    <p className="home-opportunity-org">{item.organisation_name}</p>
                    {item.summary && <p className="home-opportunity-summary">{item.summary}</p>}
                    <div className="home-opportunity-details">
                      {item.location && <span>{item.location}</span>}
                      {item.compensation && <span>{item.compensation}</span>}
                      {closingLabel(item.closing_at) && <span>{closingLabel(item.closing_at)}</span>}
                    </div>
                    {expertise.length > 0 && <div className="home-opportunity-skills">{expertise.map(value => <span key={value}>{value}</span>)}</div>}
                    <Link href={'/opportunities/' + item.slug} className="home-opportunity-link">VIEW OPPORTUNITY →</Link>
                  </article>
                )
              })}
            </div>
            <div className="home-opportunity-footer"><Link href="/opportunities" className="btn-gold">VIEW ALL OPPORTUNITIES →</Link></div>
          </>
        )}
      </div>
    </section>
  )
}
