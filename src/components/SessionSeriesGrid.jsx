'use client'

import { useState } from 'react'
import { BRAND } from '@/lib/brand'
import EventRegistrationModal, { SessionTimer } from '@/components/EventRegistrationModal'
import { PROFESSIONAL_STANDARD_SERIES, getSessionState, formatSessionDate } from '@/lib/professionalStandardSeries'

const sessions = PROFESSIONAL_STANDARD_SERIES.slice(1)

export default function SessionSeriesGrid() {
  const [selectedSession, setSelectedSession] = useState(null)

  return (
    <section className="session-series" id="upcoming-sessions" aria-labelledby="session-series-title">
      <style>{`
        .session-series{position:relative;padding:clamp(88px,11vw,150px) var(--pad);background:var(--parchment);overflow:hidden}
        .session-series-inner{max-width:1360px;margin:0 auto;position:relative;z-index:1}
        .session-series-head{display:flex;align-items:flex-end;justify-content:space-between;gap:56px;margin-bottom:58px}
        .session-series-kicker{display:flex;align-items:center;gap:12px;font-size:12px;font-weight:800;letter-spacing:.18em;color:#535366;text-transform:uppercase}.session-series-kicker:before{content:'';width:38px;height:2px;background:var(--gold)}
        .session-series-title{font-family:var(--font);font-size:clamp(48px,6vw,82px);font-weight:400;line-height:1.02;letter-spacing:-.035em;color:#1A1A2E;margin:20px 0 0;max-width:850px}.session-series-title em{font-style:italic;color:#9a7428;font-weight:500}
        .session-series-intro{max-width:410px;font-size:clamp(17px,1.25vw,19px);line-height:1.7;font-weight:400;color:#343447;margin:0}
        .session-series-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid rgba(26,26,46,.24);border-left:1px solid rgba(26,26,46,.24)}
        .session-series-card{min-height:570px;padding:34px 28px 30px;border-right:1px solid rgba(26,26,46,.24);border-bottom:1px solid rgba(26,26,46,.24);display:flex;flex-direction:column;position:relative;transition:transform .35s ease,background .35s ease}.session-series-card:hover{background:rgba(255,255,255,.58);transform:translateY(-5px)}
        .session-series-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:30px}.session-series-number{font-family:var(--font);font-size:13px;font-weight:800;letter-spacing:.12em;color:#8f6c25}.session-series-status{font-size:10px;font-weight:800;letter-spacing:.11em;color:#414152;text-transform:uppercase;text-align:right}
        .session-series-cluster{font-size:11px;font-weight:800;letter-spacing:.18em;color:#4a4a5a;text-transform:uppercase;margin-bottom:18px}.session-series-card h3{font-family:var(--font);font-size:clamp(28px,2.2vw,38px);font-weight:500;line-height:1.12;letter-spacing:-.025em;color:#1A1A2E;margin:0}.session-series-description{font-size:17px;line-height:1.72;font-weight:400;color:#343447;margin:22px 0 0}
        .session-series-bottom{margin-top:auto;padding-top:28px}.session-series-date{font-size:11px;font-weight:800;letter-spacing:.1em;color:#4b4b5b;text-transform:uppercase;margin-bottom:16px;line-height:1.55}.session-series-actions{display:flex;gap:10px;align-items:center}.session-series-primary,.session-series-secondary{min-height:50px;padding:0 14px;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;text-transform:uppercase;letter-spacing:.09em;font-size:11px;font-weight:800;border-radius:2px;transition:all .2s ease;cursor:pointer}.session-series-primary{background:#1A1A2E;color:#F7F4EE;border:1px solid #1A1A2E;flex:1}.session-series-primary:hover{background:var(--gold);border-color:var(--gold);color:#1A1A2E}.session-series-secondary{border:1px solid rgba(26,26,46,.32);color:#1A1A2E;background:transparent;flex:1}.session-series-secondary:hover{border-color:var(--gold);color:#76591c}
        .session-series-footer{margin-top:24px;font-size:14px;line-height:1.7;color:#4b4b5b;max-width:760px}
        .session-timer{margin:0 0 18px;padding:13px 14px;border:1px solid rgba(26,26,46,.18);background:rgba(26,26,46,.035)}.session-timer-ended{font-size:10px;font-weight:800;letter-spacing:.14em;color:#656577}.session-timer-live{font-size:10px;font-weight:800;letter-spacing:.12em;color:#9a7428}.session-timer-locked{border-color:rgba(26,26,46,.16)}.session-timer-open{border-color:rgba(154,116,40,.32);background:rgba(201,168,76,.08)}.event-countdown-label{display:block;font-size:9px;font-weight:800;letter-spacing:.16em;color:#666679;text-transform:uppercase;margin-bottom:8px}.session-timer-open .event-countdown-label{color:#8f6c25}.event-countdown-units{display:flex;gap:7px;align-items:flex-end}.event-countdown-unit{display:flex;align-items:baseline;gap:3px}.event-countdown-unit strong{font-family:var(--font);font-size:18px;font-weight:600;line-height:1;color:#1A1A2E;font-variant-numeric:tabular-nums}.event-countdown-unit span{font-size:7px;font-weight:800;letter-spacing:.08em;color:#777789}.session-timer-live .event-countdown{display:inline}.session-timer-live .event-countdown-units{display:inline-flex;margin-left:7px}.session-timer-live .event-countdown-label{display:none}
        .event-modal-backdrop{position:fixed;inset:0;z-index:1000;background:rgba(8,8,15,.78);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:24px}.event-modal{position:relative;width:min(620px,100%);max-height:min(90vh,820px);overflow:auto;background:#F7F4EE;color:#1A1A2E;border:1px solid rgba(201,168,76,.45);box-shadow:0 30px 100px rgba(0,0,0,.4);padding:clamp(28px,5vw,54px)}.event-modal-close{position:absolute;top:15px;right:17px;width:38px;height:38px;border:1px solid rgba(26,26,46,.16);background:transparent;color:#1A1A2E;font-size:25px;line-height:1;cursor:pointer}.event-modal-kicker{font-size:10px;font-weight:800;letter-spacing:.18em;color:#9a7428;text-transform:uppercase;margin-bottom:15px}.event-modal h2{font-family:var(--font);font-size:clamp(34px,5vw,56px);font-weight:400;line-height:1.05;letter-spacing:-.03em;margin:0 38px 15px 0}.event-modal h2 em{color:#9a7428}.event-modal-meta{font-size:14px;color:#4b4b5b;line-height:1.6;margin:0 0 30px}.event-modal form{display:grid;gap:16px}.event-modal label{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#414152}.event-modal label span{font-weight:500;text-transform:none;letter-spacing:0;color:#777789}.event-modal input{display:block;width:100%;box-sizing:border-box;margin-top:8px;padding:14px 15px;border:1px solid rgba(26,26,46,.22);background:#fff;color:#1A1A2E;font:400 16px var(--font);outline:none}.event-modal input:focus{border-color:#9a7428;box-shadow:0 0 0 2px rgba(201,168,76,.12)}.event-submit{min-height:52px;border:1px solid #1A1A2E;background:#1A1A2E;color:#F7F4EE;padding:0 18px;font:800 11px var(--font);letter-spacing:.12em;cursor:pointer;margin-top:6px}.event-submit:hover{background:#C9A84C;color:#1A1A2E}.event-submit:disabled{opacity:.6;cursor:wait}.event-form-note{font-size:11px;line-height:1.6;color:#6a6a78;margin:0}.event-form-error{margin:0;padding:12px;border:1px solid rgba(170,55,55,.25);background:rgba(170,55,55,.06);color:#8d3030;font-size:13px}.event-success{text-align:center;padding:30px 0 10px}.event-success-mark{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;margin:0 auto 18px;background:#1A1A2E;color:#C9A84C;font-size:27px}.event-success h3{font-family:var(--font);font-size:34px;font-weight:400;margin:0 0 12px}.event-success p{font-size:16px;line-height:1.7;color:#4b4b5b;max-width:430px;margin:0 auto 24px}
        @media(max-width:1000px){.session-series-head{align-items:flex-start;flex-direction:column;gap:24px}.session-series-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.session-series-card{min-height:500px}.session-series-title{font-size:clamp(44px,8vw,68px)}}
        @media(max-width:680px){.session-series{padding-top:78px;padding-bottom:90px}.session-series-intro{font-size:17px}.session-series-grid{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}.session-series-grid::-webkit-scrollbar{display:none}.session-series-card{min-width:min(84vw,350px);scroll-snap-align:start;padding:30px 24px}.session-series-card h3{font-size:30px}.session-series-description{font-size:16px}.event-modal{padding:28px 22px}.event-modal h2{font-size:34px}.event-countdown-units{gap:5px}}
        @media(prefers-reduced-motion:reduce){.session-series-card{transition:none}}
      `}</style>
      <div className="session-series-inner">
        <header className="session-series-head">
          <div>
            <div className="session-series-kicker">THE PROFESSIONAL STANDARD SERIES · SESSIONS 02—05</div>
            <h2 className="session-series-title" id="session-series-title">Four conversations. <em>One standard.</em></h2>
          </div>
          <p className="session-series-intro">A four-part progression across Intelligence, Mastery, Relationships and Enterprise — designed to move professional capability from insight to application.</p>
        </header>
        <div className="session-series-grid">
          {sessions.map((session) => {
            const state = getSessionState(session)
            const actionLabel = state === 'registration-open' ? 'REGISTER' : state === 'locked' ? 'LOCKED' : state === 'live' ? 'SESSION LIVE' : 'ENDED'
            return (
              <article className="session-series-card" key={session.id}>
                <div className="session-series-top"><div className="session-series-number">SESSION {session.id}</div><div className="session-series-status">{state === 'registration-open' ? 'REGISTRATION OPEN' : state === 'locked' ? 'OPENS AFTER PREVIOUS SESSION' : state.replace('-', ' ')}</div></div>
                <div className="session-series-cluster">{session.cluster}</div>
                <h3>{session.title}</h3>
                <p className="session-series-description">{session.description}</p>
                <div className="session-series-bottom">
                  <div className="session-series-date">{formatSessionDate(session)} · 10:00 AM WAT · VIRTUAL · 90 MINUTES</div>
                  <SessionTimer session={session} />
                  <div className="session-series-actions">
                    <button className="session-series-primary" type="button" disabled={state !== 'registration-open'} onClick={() => state === 'registration-open' && setSelectedSession(session)}>{actionLabel} {state === 'registration-open' && <span aria-hidden="true">&nbsp;→</span>}</button>
                    <a className="session-series-secondary" href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer">ASSESSMENT <span aria-hidden="true">&nbsp;→</span></a>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
        <div className="session-series-footer">Each session has its own registration window. The next registration form automatically unlocks when the previous 90-minute session ends.</div>
      </div>
      {selectedSession && <EventRegistrationModal session={selectedSession} onClose={() => setSelectedSession(null)} />}
    </section>
  )
}
