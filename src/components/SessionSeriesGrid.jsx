'use client'

import { useState } from 'react'
import { BRAND } from '@/lib/brand'
import EventRegistrationModal, { SessionTimer } from '@/components/EventRegistrationModal'
import FlyerLightbox from '@/components/FlyerLightbox'
import { PROFESSIONAL_STANDARD_SERIES, getSessionState, formatSessionDate } from '@/lib/professionalStandardSeries'
import { EVENT_FLYER_SPRITE } from '@/lib/eventFlyers'

const sessions = PROFESSIONAL_STANDARD_SERIES.slice(1)

export default function SessionSeriesGrid() {
  const [selectedSession, setSelectedSession] = useState(null)
  return <section className="session-series" id="upcoming-sessions" aria-labelledby="session-series-title">
    
    <div className="session-series-inner">
      <header className="session-series-head"><div><div className="session-series-kicker">THE PROFESSIONAL STANDARD SERIES · SESSIONS 02—05</div><h2 className="session-series-title" id="session-series-title">Four conversations. <em>One standard.</em></h2></div><p className="session-series-intro">A four-part progression across Intelligence, Mastery, Relationships and Enterprise — designed to move professional capability from insight to application.</p></header>
      <div className="session-series-grid">{sessions.map(session => { const state = getSessionState(session); const actionLabel = state === 'registration-open' ? 'REGISTER' : state === 'locked' ? 'LOCKED' : state === 'live' ? 'SESSION LIVE' : 'ENDED'; return <article className="session-series-card" key={session.id}>
        {session.flyerPosition && <FlyerLightbox src={EVENT_FLYER_SPRITE} position={session.flyerPosition} alt={`${session.title} flyer`} />}
        <div className="session-series-top"><div className="session-series-number">SESSION {session.id}</div><div className="session-series-status">{state === 'registration-open' ? 'REGISTRATION OPEN' : state === 'locked' ? 'OPENS AFTER PREVIOUS SESSION' : state.replace('-', ' ')}</div></div>
        <div className="session-series-cluster">{session.cluster}</div><h3>{session.title}</h3><p className="session-series-description">{session.description}</p>
        <div className="session-series-bottom"><div className="session-series-date">{formatSessionDate(session)} · 10:00 AM WAT · VIRTUAL · 90 MINUTES{session.speaker ? ` · ${session.speaker}` : ''}</div><SessionTimer session={session}/><div className="session-series-actions"><button className="session-series-primary" type="button" disabled={state !== 'registration-open'} onClick={() => state === 'registration-open' && setSelectedSession(session)}>{actionLabel} {state === 'registration-open' && <span aria-hidden="true">&nbsp;→</span>}</button><a className="session-series-secondary" href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer">ASSESSMENT <span aria-hidden="true">&nbsp;→</span></a></div></div>
      </article> })}</div>
      <div className="session-series-footer">Each session has its own registration window. The next registration form automatically unlocks when the previous 90-minute session ends.</div>
    </div>
    {selectedSession && <EventRegistrationModal session={selectedSession} onClose={() => setSelectedSession(null)} />}
  </section>
}
