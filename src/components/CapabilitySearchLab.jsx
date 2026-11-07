'use client'

import { useState } from 'react'
import styles from './CapabilitySearchLab.module.css'

const capabilities = [
  { value: '', label: 'All capabilities' },
  { value: 'talent', label: 'Talent' },
  { value: 'speaker', label: 'Speaker' },
  { value: 'facilitator', label: 'Facilitator' },
]

export default function CapabilitySearchLab() {
  const [query, setQuery] = useState('')
  const [capability, setCapability] = useState('')
  const [location, setLocation] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [directoryCount, setDirectoryCount] = useState(null)

  async function search(event) {
    event.preventDefault()
    setStatus('loading')
    setMessage('')
    try {
      const response = await fetch('/api/intelligence/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, capability, location }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Search could not be completed.')
      setResults(payload.results || [])
      setDirectoryCount(payload.directoryCount ?? null)
      setMessage(payload.note || '')
      setStatus(payload.status || 'no_match')
    } catch (error) {
      setResults([])
      setMessage(error.message || 'Search could not be completed.')
      setStatus('error')
    }
  }

  return (
    <section className={styles.section} id="capability-search">
      <div className={styles.heading}>
        <div className={styles.kicker}><span /> WORKING DIRECTORY CONNECTION</div>
        <h2>Search capability against <em>approved records.</em></h2>
        <p>Describe the capability, expertise or programme requirement. The search reads Valoria’s public marketplace roster and returns only profiles that have passed the existing listing controls.</p>
      </div>
      <form className={styles.form} onSubmit={search}>
        <label className={styles.queryLabel} htmlFor="capability-query">What capability or expertise do you need?</label>
        <textarea id="capability-query" value={query} onChange={event => setQuery(event.target.value)} placeholder="Example: organisational change, stakeholder engagement and leadership facilitation" rows={3} minLength={3} maxLength={240} required />
        <div className={styles.filters}>
          <label>Capability
            <select value={capability} onChange={event => setCapability(event.target.value)}>
              {capabilities.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label>Location (optional)
            <input value={location} onChange={event => setLocation(event.target.value)} placeholder="e.g. Lagos, Abuja, Remote" maxLength={80} />
          </label>
          <button type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Searching…' : 'Search approved capabilities'} <span aria-hidden="true">→</span></button>
        </div>
        <p className={styles.formNote}>Search is limited to approved public profile information. Private assessment answers, personal documents and non-public VALU records are not searched or returned.</p>
      </form>
      {status !== 'idle' && (
        <div className={styles.results} aria-live="polite">
          <div className={styles.resultsHeader}>
            <div><span>DIRECTORY RESPONSE</span><strong>{status === 'matches_found' ? `${results.length} relevant profile${results.length === 1 ? '' : 's'}` : status === 'directory_empty' ? 'Directory awaiting approved listings' : status === 'no_match' ? 'No close matches found' : status === 'error' ? 'Search unavailable' : 'Searching'}</strong></div>
            {directoryCount !== null && <small>{directoryCount} approved records checked</small>}
          </div>
          {message && <p className={styles.message}>{message}</p>}
          {results.length > 0 && <div className={styles.cards}>{results.map(person => (
            <article className={styles.person} key={person.id}>
              <div className={styles.personTop}>
                {person.photoUrl ? <img src={person.photoUrl} alt="" /> : <span className={styles.initials}>{person.initials || 'VI'}</span>}
                <div><h3>{person.name || 'Valoria professional'}</h3><p>{person.headline || person.currentRole || person.designation || 'Approved professional profile'}</p></div>
              </div>
              <div className={styles.meta}>{[person.capability, person.industry, person.location].filter(Boolean).join(' · ')}</div>
              {person.assessmentSummary && <p className={styles.summary}>{person.assessmentSummary}</p>}
              {person.matchedTerms.length > 0 && <p className={styles.matched}>Relevant signals: {person.matchedTerms.join(', ')}</p>}
              {person.atbId && <small className={styles.id}>Valoria ID · {person.atbId}</small>}
            </article>
          ))}</div>}
          <small className={styles.disclaimer}>Relevance is a keyword-based discovery aid, not a ranking of human worth, a hiring recommendation or a certification decision. Employers remain responsible for their selection process.</small>
        </div>
      )}
    </section>
  )
}
