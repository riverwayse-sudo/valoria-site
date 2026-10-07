'use client'

import { useEffect, useMemo, useState } from 'react'
import { BRAND } from '@/lib/brand'
import EventRegistrationModal, { SessionTimer } from '@/components/EventRegistrationModal'
import { PROFESSIONAL_STANDARD_SERIES, getSessionState, formatSessionDate } from '@/lib/professionalStandardSeries'

const sessions = PROFESSIONAL_STANDARD_SERIES.slice(0, 3)

export default function SessionShowcase() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const current = sessions[active]
  const currentState = getSessionState(current)

  useEffect(() => {
    if (paused) return undefined
    const timer = window.setInterval(() => setActive((index) => (index + 1) % sessions.length), 8500)
    return () => window.clearInterval(timer)
  }, [paused])

  const progress = useMemo(() => `${((active + 1) / sessions.length) * 100}%`, [active])
  const actionLabel = current.replay ? 'WATCH SESSION' : currentState === 'registration-open' ? 'REGISTER' : currentState === 'locked' ? 'LOCKED' : currentState === 'live' ? 'SESSION LIVE' : 'ENDED'

  function handlePrimaryAction() {
    if (current.replay) {
      document.querySelector('#webinar')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    if (currentState === 'registration-open') setSelectedSession(current)
  }

  return (
    <section className="session-showcase" id="sessions" aria-label="Valoria Sessions">
      
      <div className="session-showcase-inner">
        <header className="session-showcase-head"><div><div className="session-showcase-kicker">THE PROFESSIONAL STANDARD SERIES · 2026</div><h2 className="session-showcase-title">Conversations that define the <em>professional standard.</em></h2></div><div className="session-showcase-count">{current.id} / {String(sessions.length).padStart(2, '0')}</div></header>
        <div className="session-showcase-stage" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="session-showcase-glow" aria-hidden="true" />
          <article className="session-showcase-card" key={current.id}>
            <div className="session-showcase-copy">
              <div className="session-showcase-label">{current.replay ? 'SESSION 01 · AVAILABLE NOW' : `SESSION ${current.id} · ${currentState === 'registration-open' ? 'REGISTRATION OPEN' : currentState.replace('-', ' ').toUpperCase()}`}</div>
              <div className="session-showcase-cluster">{current.cluster}</div>
              <h3>{current.title}</h3>
              <p className="session-showcase-description">{current.description}</p>
              <div className="session-showcase-meta">{current.replay ? 'AVAILABLE NOW · FULL REPLAY' : `${formatSessionDate(current)} · 10:00 AM WAT · VIRTUAL · 90 MINUTES`}</div>
              {!current.replay && <div className="session-showcase-timer"><SessionTimer session={current} /></div>}
              <div className="session-showcase-actions">
                <button className="session-showcase-primary" type="button" disabled={!current.replay && currentState !== 'registration-open'} onClick={handlePrimaryAction}>{actionLabel} <span aria-hidden="true">&nbsp;→</span></button>
                <a className="session-showcase-secondary" href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer">TAKE THE ASSESSMENT <span aria-hidden="true">&nbsp;→</span></a>
              </div>
              <p className="session-showcase-note">Every session connects the conversation back to the VALU Index — Valoria's framework for understanding professional capability and worth.</p>
            </div>
            <div className="session-showcase-index" aria-hidden="true"><div className="session-showcase-index-number">{current.id}</div><div className="session-showcase-index-word">VALORIA SESSIONS</div></div>
          </article>
        </div>
        <div className="session-showcase-controls"><div className="session-showcase-dots" aria-label="Choose session">{sessions.map((session, index) => <button key={session.id} type="button" className={`session-showcase-dot ${index === active ? 'active' : ''}`} aria-label={`Show session ${session.id}`} aria-current={index === active ? 'true' : undefined} onClick={() => setActive(index)} />)}</div><div className="session-showcase-nav"><button type="button" aria-label="Previous session" onClick={() => setActive((active - 1 + sessions.length) % sessions.length)}>←</button><button type="button" aria-label="Next session" onClick={() => setActive((active + 1) % sessions.length)}>→</button></div></div>
        <div className="session-showcase-progress" aria-hidden="true"><span style={{ width: progress }} /></div>
      </div>
      {selectedSession && <EventRegistrationModal session={selectedSession} onClose={() => setSelectedSession(null)} />}
    </section>
  )
}
