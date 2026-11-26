'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function OpportunitiesPage() {
  const [items, setItems] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [matchesError, setMatchesError] = useState('')

  const loadOpportunities = useCallback(async () => {
    setLoading(true)
    setError('')
    setMatchesError('')
    try {
      const allRes = await fetch('/api/opportunities')
      const all = await allRes.json().catch(() => ({}))
      if (!allRes.ok) throw new Error(all.error || 'Opportunities could not be loaded.')
      if (!Array.isArray(all.opportunities)) throw new Error('Opportunity data could not be verified.')

      setItems(all.opportunities)

      try {
        const matchRes = await fetch('/api/opportunities/matches')
        const personal = await matchRes.json().catch(() => ({}))
        if (matchRes.ok) setMatches(Array.isArray(personal.matches) ? personal.matches : [])
        else if (matchRes.status !== 401) setMatchesError('Personalized matches are temporarily unavailable. The public opportunity list remains available.')
      } catch {
        setMatchesError('Personalized matches are temporarily unavailable. The public opportunity list remains available.')
      }
    } catch (e) {
      setItems([])
      setMatches([])
      setError(e.message || 'Opportunities could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadOpportunities() }, [loadOpportunities])

  return <><Nav /><main className="opportunities-page">
    <section className="opportunities-hero"><div className="opportunities-shell">
      <div className="opportunities-kicker">VALORIA OPPORTUNITIES</div>
      <h1 className="opportunities-title">Work that meets<br />your capability.</h1>
      <p className="opportunities-lede">Jobs, projects and professional opportunities reviewed through the Valoria platform.</p>
      <Link href="/opportunities/submit" className="opportunities-submit" data-opportunities-submit="true">POST AN OPPORTUNITY</Link>
    </div></section>
    <section className="opportunities-content">
      {matchesError && <p className="opportunities-match-error" role="status">{matchesError}</p>}
      {matches.length > 0 && <div className="opportunities-matches"><div className="opportunities-match-kicker">MATCHED FOR YOUR CAPABILITY</div><h2 className="opportunities-match-title">Opportunities with a relevant signal.</h2><div className="opportunities-grid opportunities-grid-match">{matches.map(o => <Link key={'m' + o.id} href={'/opportunities/' + o.slug} className="opportunity-card opportunity-card-match"><div className="opportunity-meta">{o.match_score}% MATCH SIGNAL</div><h3 className="opportunity-card-title">{o.title}</h3><p className="opportunity-card-copy">{o.match_reasons.join(' · ')}</p></Link>)}</div></div>}
      {loading ? <p>Loading opportunities…</p> : error ? (
        <div className="opportunities-error opportunities-error-state" data-opportunities-error="true" role="alert">
          <h2>Opportunities are temporarily unavailable.</h2>
          <p>{error}</p>
          <button type="button" className="opportunities-submit" onClick={loadOpportunities}>TRY AGAIN</button>
        </div>
      ) : items.length === 0 ? (
        <div className="opportunities-empty" data-opportunities-empty="true">
          <h2>No public opportunities yet.</h2>
          <p>New opportunities will appear here after Valoria review.</p>
        </div>
      ) : (
        <div className="opportunities-grid" data-opportunities-grid="true">
          {items.map(o => <Link key={o.id} href={'/opportunities/' + o.slug} className="opportunity-card"><div className="opportunity-meta">{(o.opportunity_type || 'job').toUpperCase()} · {o.work_mode || 'OPEN'}</div><h2 className="opportunity-card-title">{o.title}</h2><p className="opportunity-card-org">{o.organisation_name}</p><p className="opportunity-card-copy">{o.summary || o.description?.slice(0, 150)}</p></Link>)}
        </div>
      )}
    </section>
  </main><Footer /></>
}
