'use client'

import { useEffect, useState } from 'react'
import { BRAND } from '@/lib/brand'
import MarketplaceCTA from './MarketplaceCTA'
import EventRegistrationModal, { SessionTimer } from './EventRegistrationModal'
import { PROFESSIONAL_STANDARD_SERIES, getSessionState, formatSessionDate } from '@/lib/professionalStandardSeries'

export default function HeroSlider() {
  const bars = [88, 90, 82, 80, 75]
  const scores = [['P', 88], ['R', 90], ['I', 82], ['M', 80], ['E', 75]]
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)

  const upcomingSession = PROFESSIONAL_STANDARD_SERIES.find((session) => getSessionState(session) !== 'ended' && session.id !== '01') || PROFESSIONAL_STANDARD_SERIES[1]
  const upcomingState = getSessionState(upcomingSession)
  const canRegister = upcomingState === 'registration-open'

  useEffect(() => {
    if (paused || selectedSession) return undefined
    const timer = window.setInterval(() => setActive((index) => (index + 1) % 2), 9000)
    return () => window.clearInterval(timer)
  }, [paused, selectedSession])

  const goTo = (index) => setActive(index)
  const openRegistration = () => {
    if (canRegister) setSelectedSession(upcomingSession)
  }

  return (
    <section className="hero hero-slider" id="hero" aria-label="Valoria Institute introduction">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />

      <div className="hero-slides" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className={`hero-slide ${active === 0 ? 'is-active' : ''}`} aria-hidden={active !== 0}>
          <div className="container hero-inner">
            <div>
              <div className="hero-eyebrow au d1"><div className="hero-eyebrow-line" /><span className="hero-eyebrow-text">AFRICA'S PROFESSIONAL CAPABILITY MARKETPLACE</span></div>
              <h1 className="hero-title au d2">Talent is not<br />the problem.<br /><em>Infrastructure is.</em></h1>
              <p className="hero-sub au d3">Valoria Institute builds the infrastructure through which African professional merit is developed, surfaced and connected to opportunity with precision.</p>
              <div className="hero-actions au d4"><a href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer" className="btn-gold">START THE VALU INDEX</a><MarketplaceCTA className="btn-outline">EXPLORE THE BUREAU</MarketplaceCTA></div>
              <div className="hero-mobile-card au d5" aria-hidden="true"><div className="hmc-row"><div className="hmc-score">84</div><div className="hmc-right"><div className="hmc-desig">FORCE TO ALIGN WITH · ✦✦✦</div><div className="hmc-bars">{bars.map((w, i) => <div key={i} className={`hmc-bar score-${w}`} />)}</div></div></div></div>
            </div>
            <div className="valu-card au d4" aria-label="Illustrative VALU profile">
              <div className="vc-label">VALU INDEX · ILLUSTRATIVE PROFILE</div><div className="vc-score"><span className="vc-num">84</span><span className="vc-denom">/ 100</span></div><div className="vc-desig">DISTINGUISHED · ✦✦</div>
              <div className="vc-modalities"><span className="mod-pill" >CANDIDATE</span><span className="mod-pill" >SPEAKER</span></div>
              <div className="vc-bars">{scores.map(([l, s]) => <div className="vb" key={l}><span className="vb-l">{l}</span><div className="vb-bg"><div className={`vb-fill score-${s}`} /></div><span className="vb-s">{s}</span></div>)}</div><div className="vc-foot">illustrative profile · merit made visible</div>
            </div>
          </div>
        </div>

        <div className={`hero-slide hero-event-slide ${active === 1 ? 'is-active' : ''}`} aria-hidden={active !== 1}>
          <div className="container hero-inner">
            <div>
              <div className="hero-event-kicker">UPCOMING AT VALORIA</div>
              <h1 className="hero-title">The next conversation<br />on the <em>professional standard.</em></h1>
              <p className="hero-event-copy">The Professional Standard Series brings practical conversations on the capabilities that turn professional performance into recognised opportunity.</p>
              <div className="hero-event-meta">{formatSessionDate(upcomingSession)} · 10:00 AM WAT · VIRTUAL · 90 MINUTES</div>
              <div className="hero-actions">
                <button type="button" className="btn-gold hero-register-cta" onClick={openRegistration} disabled={!canRegister}>REGISTER FOR THIS SESSION →</button>
                <a href="/events" className="btn-outline">VIEW ALL EVENTS →</a>
              </div>
            </div>
            <aside className="hero-event-panel" aria-label={`Upcoming event: ${upcomingSession.title}`}>
              <div className="hero-event-number">{upcomingSession.id}</div>
              <div className="hero-event-cluster">{upcomingSession.cluster}</div>
              <h2>{upcomingSession.title}</h2>
              <p>{upcomingSession.description}</p>
              <div className="hero-event-status">{upcomingState === 'coming-soon' ? 'COMING SOON · DATE TO BE CONFIRMED' : formatSessionDate(upcomingSession)}</div>
              {upcomingState !== 'coming-soon' && <SessionTimer session={upcomingSession} />}
            </aside>
          </div>
        </div>
      </div>

      <div className="hero-slider-controls" aria-label="Homepage slides">
        <button type="button" className={`hero-slider-dot ${active === 0 ? 'is-active' : ''}`} onClick={() => goTo(0)} aria-label="Show Valoria introduction slide" aria-pressed={active === 0} />
        <button type="button" className={`hero-slider-dot ${active === 1 ? 'is-active' : ''}`} onClick={() => goTo(1)} aria-label="Show upcoming event slide" aria-pressed={active === 1} />
        <span className="hero-slider-index">0{active + 1} / 02</span>
      </div>
      <div className="hero-scroll-cue" aria-hidden="true"><span>Scroll</span><svg width="14" height="8" viewBox="0 0 14 8" fill="none"><path d="M1 1l6 6 6-6" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div>

      {selectedSession && <EventRegistrationModal session={selectedSession} onClose={() => setSelectedSession(null)} />}
    </section>
  )
}
