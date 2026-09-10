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
      <style>{`
        .session-showcase{position:relative;overflow:hidden;padding:clamp(72px,9vw,118px) var(--pad);background:linear-gradient(180deg,#0d0d18 0%,#1a1a2e 100%);border-top:1px solid rgba(201,168,76,.14)}
        .session-showcase:before{content:'';position:absolute;inset:0;pointer-events:none;opacity:.035;background-image:linear-gradient(rgba(201,168,76,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.7) 1px,transparent 1px);background-size:54px 54px}
        .session-showcase-inner{position:relative;z-index:1;max-width:1240px;margin:0 auto}.session-showcase-head{display:flex;justify-content:space-between;align-items:flex-end;gap:40px;margin-bottom:34px}.session-showcase-kicker{display:flex;align-items:center;gap:10px;font-size:9px;font-weight:700;letter-spacing:.22em;color:rgba(201,168,76,.7);text-transform:uppercase;font-family:var(--font)}.session-showcase-kicker:before{content:'';width:30px;height:1px;background:rgba(201,168,76,.55)}.session-showcase-title{font-family:var(--font);font-size:clamp(38px,5.2vw,70px);font-weight:200;line-height:1.02;letter-spacing:-.025em;color:var(--parchment);margin:15px 0 0;max-width:760px}.session-showcase-title em{font-style:italic;color:var(--gold);font-weight:300}.session-showcase-count{font-size:10px;font-weight:700;letter-spacing:.16em;color:rgba(247,244,238,.35);white-space:nowrap;text-transform:uppercase}
        .session-showcase-stage{position:relative;min-height:clamp(470px,48vw,610px);border:1px solid rgba(201,168,76,.16);border-radius:18px;overflow:hidden;background:radial-gradient(circle at 78% 18%,rgba(201,168,76,.13),transparent 30%),linear-gradient(135deg,rgba(255,255,255,.035),rgba(255,255,255,.012))}.session-showcase-stage:after{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(10,10,18,.12),rgba(10,10,18,.62) 72%,rgba(10,10,18,.82))}.session-showcase-glow{position:absolute;width:420px;height:420px;border:1px solid rgba(201,168,76,.12);border-radius:50%;right:-130px;top:-130px;box-shadow:0 0 0 80px rgba(201,168,76,.018),0 0 0 160px rgba(201,168,76,.012)}.session-showcase-card{position:relative;z-index:2;display:grid;grid-template-columns:1.25fr .75fr;min-height:inherit}.session-showcase-copy{display:flex;flex-direction:column;justify-content:center;padding:clamp(34px,6vw,78px);max-width:820px}.session-showcase-label{font-size:9px;font-weight:700;letter-spacing:.2em;color:var(--gold);text-transform:uppercase;margin-bottom:18px}.session-showcase-cluster{display:inline-flex;align-self:flex-start;padding:7px 11px;border:1px solid rgba(201,168,76,.22);border-radius:999px;font-size:9px;font-weight:700;letter-spacing:.16em;color:rgba(247,244,238,.52);margin-bottom:22px}.session-showcase-card h3{font-family:var(--font);font-size:clamp(34px,4.5vw,66px);font-weight:200;line-height:1.04;letter-spacing:-.025em;color:var(--parchment);margin:0 0 22px;max-width:760px}.session-showcase-description{font-size:clamp(14px,1.35vw,17px);font-weight:300;line-height:1.75;color:rgba(247,244,238,.56);max-width:650px;margin:0 0 24px}.session-showcase-meta{font-size:10px;font-weight:700;letter-spacing:.14em;color:rgba(247,244,238,.38);text-transform:uppercase;margin-bottom:18px}.session-showcase-actions{display:flex;flex-wrap:wrap;gap:10px}.session-showcase-actions button,.session-showcase-actions a{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 19px;border-radius:4px;text-decoration:none;font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;transition:transform .2s ease,background .2s ease,border-color .2s ease;cursor:pointer}.session-showcase-actions button:disabled{opacity:.45;cursor:not-allowed}.session-showcase-primary{background:var(--gold);color:#10101d;border:1px solid var(--gold)}.session-showcase-secondary{background:transparent;color:var(--parchment);border:1px solid rgba(247,244,238,.2)}.session-showcase-actions button:not(:disabled):hover,.session-showcase-actions a:hover{transform:translateY(-2px)}.session-showcase-secondary:hover{border-color:rgba(201,168,76,.55);color:var(--gold)}.session-showcase-index{display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-end;padding:40px;position:relative}.session-showcase-index-number{font-family:var(--font);font-size:clamp(150px,20vw,280px);font-weight:100;line-height:.72;color:rgba(201,168,76,.09);letter-spacing:-.08em}.session-showcase-index-word{font-size:9px;font-weight:700;letter-spacing:.24em;color:rgba(201,168,76,.38);text-transform:uppercase;margin-top:22px}.session-showcase-controls{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:18px}.session-showcase-dots{display:flex;align-items:center;gap:8px}.session-showcase-dot{width:34px;height:3px;padding:0;border:0;border-radius:3px;background:rgba(247,244,238,.14);cursor:pointer;transition:width .25s ease,background .25s ease}.session-showcase-dot.active{width:64px;background:var(--gold)}.session-showcase-nav{display:flex;gap:8px}.session-showcase-nav button{width:42px;height:38px;border:1px solid rgba(201,168,76,.18);background:transparent;color:var(--parchment);cursor:pointer;border-radius:3px;font-size:16px}.session-showcase-nav button:hover{border-color:rgba(201,168,76,.55);color:var(--gold)}.session-showcase-progress{height:1px;background:rgba(247,244,238,.08);margin-top:14px;overflow:hidden}.session-showcase-progress span{display:block;height:100%;background:var(--gold);transition:width .4s ease}.session-showcase-note{margin-top:24px;font-size:11px;font-weight:300;color:rgba(247,244,238,.28);line-height:1.6}
        .session-showcase-timer{margin-bottom:20px}.session-showcase .session-timer{max-width:430px;margin-bottom:18px;padding:12px 14px;border:1px solid rgba(201,168,76,.18);background:rgba(201,168,76,.035)}.session-showcase .event-countdown-label{color:rgba(201,168,76,.55)}.session-showcase .event-countdown-units{display:flex;gap:9px}.session-showcase .event-countdown-unit strong{color:var(--parchment);font-size:19px}.session-showcase .event-countdown-unit span{color:rgba(247,244,238,.35)}.session-showcase .session-timer-ended{font-size:9px;letter-spacing:.16em;color:rgba(247,244,238,.35)}
        .event-modal-backdrop{position:fixed;inset:0;z-index:1000;background:rgba(8,8,15,.78);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:24px}.event-modal{position:relative;width:min(620px,100%);max-height:min(90vh,820px);overflow:auto;background:#F7F4EE;color:#1A1A2E;border:1px solid rgba(201,168,76,.45);box-shadow:0 30px 100px rgba(0,0,0,.4);padding:clamp(28px,5vw,54px)}.event-modal-close{position:absolute;top:15px;right:17px;width:38px;height:38px;border:1px solid rgba(26,26,46,.16);background:transparent;color:#1A1A2E;font-size:25px;line-height:1;cursor:pointer}.event-modal-kicker{font-size:10px;font-weight:800;letter-spacing:.18em;color:#9a7428;text-transform:uppercase;margin-bottom:15px}.event-modal h2{font-family:var(--font);font-size:clamp(34px,5vw,56px);font-weight:400;line-height:1.05;letter-spacing:-.03em;margin:0 38px 15px 0}.event-modal h2 em{color:#9a7428}.event-modal-meta{font-size:14px;color:#4b4b5b;line-height:1.6;margin:0 0 30px}.event-modal form{display:grid;gap:16px}.event-modal label{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#414152}.event-modal label span{font-weight:500;text-transform:none;letter-spacing:0;color:#777789}.event-modal input{display:block;width:100%;box-sizing:border-box;margin-top:8px;padding:14px 15px;border:1px solid rgba(26,26,46,.22);background:#fff;color:#1A1A2E;font:400 16px var(--font);outline:none}.event-modal input:focus{border-color:#9a7428;box-shadow:0 0 0 2px rgba(201,168,76,.12)}.event-submit{min-height:52px;border:1px solid #1A1A2E;background:#1A1A2E;color:#F7F4EE;padding:0 18px;font:800 11px var(--font);letter-spacing:.12em;cursor:pointer;margin-top:6px}.event-submit:hover{background:#C9A84C;color:#1A1A2E}.event-submit:disabled{opacity:.6;cursor:wait}.event-form-note{font-size:11px;line-height:1.6;color:#6a6a78;margin:0}.event-form-error{margin:0;padding:12px;border:1px solid rgba(170,55,55,.25);background:rgba(170,55,55,.06);color:#8d3030;font-size:13px}.event-success{text-align:center;padding:30px 0 10px}.event-success-mark{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;margin:0 auto 18px;background:#1A1A2E;color:#C9A84C;font-size:27px}.event-success h3{font-family:var(--font);font-size:34px;font-weight:400;margin:0 0 12px}.event-success p{font-size:16px;line-height:1.7;color:#4b4b5b;max-width:430px;margin:0 auto 24px}
        @media(max-width:800px){.session-showcase-head{align-items:flex-start;flex-direction:column;gap:14px}.session-showcase-card{grid-template-columns:1fr}.session-showcase-index{display:none}.session-showcase-stage{min-height:540px}.session-showcase-copy{padding:34px 26px}.session-showcase-stage:after{background:linear-gradient(180deg,rgba(10,10,18,.15),rgba(10,10,18,.75))}}
        @media(max-width:520px){.session-showcase{padding-left:var(--pad);padding-right:var(--pad)}.session-showcase-title{font-size:38px}.session-showcase-card h3{font-size:36px}.session-showcase-actions{display:grid;grid-template-columns:1fr}.session-showcase-actions button,.session-showcase-actions a{width:100%}.session-showcase-controls{margin-top:14px}}
        @media(prefers-reduced-motion:reduce){.session-showcase-actions button,.session-showcase-actions a{transition:none}.session-showcase-dot{transition:none}.session-showcase-progress span{transition:none}}
      `}</style>
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
