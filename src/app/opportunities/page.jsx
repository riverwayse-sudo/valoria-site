'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import './opportunities.css'

function titleCase(value) {
  return String(value || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())
}

function formatDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

function OpportunityCard({ opportunity }) {
  const expertise = [...(opportunity.capabilities || []), ...(opportunity.skills || [])].filter(Boolean).slice(0, 4)
  return (
    <article className="op-listing-card">
      <div className="op-listing-meta">
        <span>{titleCase(opportunity.opportunity_type || 'Opportunity')}</span>
        {opportunity.work_mode && <span>{titleCase(opportunity.work_mode)}</span>}
      </div>
      <h2><Link href={'/opportunities/' + opportunity.slug}>{opportunity.title}</Link></h2>
      <p className="op-listing-org">{opportunity.organisation_name}</p>
      {opportunity.summary && <p className="op-listing-summary">{opportunity.summary}</p>}
      <div className="op-listing-details">
        {opportunity.location && <span>{opportunity.location}</span>}
        {opportunity.employment_type && <span>{titleCase(opportunity.employment_type)}</span>}
        {opportunity.experience_level && <span>{titleCase(opportunity.experience_level)}</span>}
        {opportunity.compensation && <span>{opportunity.compensation}</span>}
        {formatDate(opportunity.closing_at) && <span>Closes {formatDate(opportunity.closing_at)}</span>}
      </div>
      {expertise.length > 0 && <div className="op-listing-expertise">{expertise.map(value => <span key={value}>{value}</span>)}</div>}
      <Link href={'/opportunities/' + opportunity.slug} className="op-listing-action">VIEW OPPORTUNITY →</Link>
    </article>
  )
}

export default function OpportunitiesPage() {
  const [items, setItems] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [matchError, setMatchError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    setMatchError('')
    try {
      const response = await fetch('/api/opportunities', { headers: { Accept: 'application/json' } })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Opportunities could not be loaded.')
      setItems(payload.opportunities || [])
    } catch (err) {
      setError(err.message || 'Opportunities could not be loaded.')
    } finally {
      setLoading(false)
    }

    try {
      const response = await fetch('/api/opportunities/matches', { headers: { Accept: 'application/json' } })
      if (response.status === 401) {
        setMatches([])
        return
      }
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Personalised relevance signals are unavailable.')
      setMatches(payload.matches || [])
    } catch (err) {
      setMatchError(err.message || 'Personalised relevance signals are unavailable.')
    }
  }, [])

  useEffect(() => { load() }, [load, refreshKey])

  return (
    <>
      <Nav />
      <main className="opportunities-page">
        <section className="opportunities-hero">
          <div className="opportunities-shell">
            <div className="opportunities-kicker">VALORIA OPPORTUNITIES</div>
            <h1 className="opportunities-title">Work that meets<br />your capability.</h1>
            <p className="opportunities-lede">Explore public opportunities by expertise, engagement type and work arrangement. Listings appear here after review and include a route to view or apply.</p>
            <Link href="/opportunities/submit" className="opportunities-submit">SUBMIT AN OPPORTUNITY FOR REVIEW</Link>
          </div>
        </section>

        <section className="opportunities-content">
          {matches.length > 0 && (
            <div className="opportunities-matches">
              <div className="opportunities-match-kicker">PERSONALISED DISCOVERY</div>
              <h2 className="opportunities-match-title">Opportunities with relevant signals.</h2>
              <p className="opportunities-match-intro">These listings share capability, industry or skill signals with your professional profile. They are discovery cues, not a guarantee of suitability.</p>
              <div className="opportunities-grid opportunities-grid-match">
                {matches.map(item => (
                  <Link key={'match-' + item.id} href={'/opportunities/' + item.slug} className="opportunity-card opportunity-card-match">
                    <div className="opportunity-meta">RELEVANT SIGNALS</div>
                    <h3 className="opportunity-card-title">{item.title}</h3>
                    <p className="opportunity-card-org">{item.organisation_name}</p>
                    <p className="opportunity-card-copy">{(item.match_reasons || []).join(' · ')}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {matchError && <p className="opportunities-match-note" role="status">{matchError}</p>}

          {loading ? (
            <p className="opportunities-state" role="status">Loading public opportunities…</p>
          ) : error ? (
            <div className="opportunities-empty">
              <h2>Opportunity listings are temporarily unavailable.</h2>
              <p>{error}</p>
              <button type="button" onClick={() => setRefreshKey(value => value + 1)}>TRY AGAIN</button>
            </div>
          ) : items.length === 0 ? (
            <div className="opportunities-empty">
              <h2>No public opportunities yet.</h2>
              <p>New listings appear here after Valoria review. Organisations can submit an opportunity for review while professionals can return to check for new listings.</p>
              <Link href="/opportunities/submit" className="opportunities-submit">SUBMIT AN OPPORTUNITY</Link>
            </div>
          ) : (
            <>
              <div className="opportunities-list-head"><h2>{items.length} {items.length === 1 ? 'public opportunity' : 'public opportunities'}</h2><span>REVIEWED PUBLIC LISTINGS</span></div>
              <div className="opportunities-grid">{items.map(item => <OpportunityCard key={item.id} opportunity={item} />)}</div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
