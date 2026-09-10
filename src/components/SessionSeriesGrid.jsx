'use client'

import { BRAND } from '@/lib/brand'

const sessions = [
  { id:'02', cluster:'INTELLIGENCE', title:'Strategic Thinking: You Are Solving the Wrong Problems', description:'Distinguish problem-solving from problem-selection and use strategic trade-offs to focus on what matters.', date:'SEPTEMBER 26, 2026', status:'NEXT SESSION', action:'REGISTER' },
  { id:'03', cluster:'MASTERY', title:'Execution Without Burnout: Why High Performers Plateau', description:'Move from output to impact, escape the indispensability trap and build a more sustainable operating model.', date:'OCTOBER 17, 2026', status:'COMING SOON', action:'COMING SOON' },
  { id:'04', cluster:'RELATIONSHIPS', title:'Emotional Intelligence Is Not About Being Nice', description:'Treat emotional intelligence as a precision instrument for perception, regulation and strategic application.', date:'NOVEMBER 14, 2026', status:'COMING SOON', action:'COMING SOON' },
  { id:'05', cluster:'ENTERPRISE', title:'Influence Without Authority: The Real Currency of Organisational Power', description:'Understand authority versus influence and build a 90-day stakeholder influence map.', date:'DECEMBER 05, 2026', status:'COMING SOON', action:'COMING SOON' },
]

export default function SessionSeriesGrid() {
  return (
    <section className="session-series" id="upcoming-sessions" aria-labelledby="session-series-title">
      <style>{`
        .session-series{position:relative;padding:clamp(88px,11vw,150px) var(--pad);background:var(--parchment);overflow:hidden}
        .session-series-inner{max-width:1360px;margin:0 auto;position:relative;z-index:1}
        .session-series-head{display:flex;align-items:flex-end;justify-content:space-between;gap:56px;margin-bottom:58px}
        .session-series-kicker{display:flex;align-items:center;gap:12px;font-size:12px;font-weight:800;letter-spacing:.18em;color:#535366;text-transform:uppercase}
        .session-series-kicker:before{content:'';width:38px;height:2px;background:var(--gold)}
        .session-series-title{font-family:var(--font);font-size:clamp(48px,6vw,82px);font-weight:400;line-height:1.02;letter-spacing:-.035em;color:#1A1A2E;margin:20px 0 0;max-width:850px}
        .session-series-title em{font-style:italic;color:#9a7428;font-weight:500}
        .session-series-intro{max-width:410px;font-size:clamp(17px,1.25vw,19px);line-height:1.7;font-weight:400;color:#343447;margin:0}
        .session-series-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid rgba(26,26,46,.24);border-left:1px solid rgba(26,26,46,.24)}
        .session-series-card{min-height:540px;padding:34px 28px 30px;border-right:1px solid rgba(26,26,46,.24);border-bottom:1px solid rgba(26,26,46,.24);display:flex;flex-direction:column;position:relative;transition:transform .35s ease,background .35s ease}
        .session-series-card:hover{background:rgba(255,255,255,.58);transform:translateY(-5px)}
        .session-series-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:42px}
        .session-series-number{font-family:var(--font);font-size:13px;font-weight:800;letter-spacing:.12em;color:#8f6c25}
        .session-series-status{font-size:10px;font-weight:800;letter-spacing:.11em;color:#414152;text-transform:uppercase;text-align:right}
        .session-series-cluster{font-size:11px;font-weight:800;letter-spacing:.18em;color:#4a4a5a;text-transform:uppercase;margin-bottom:20px}
        .session-series-card h3{font-family:var(--font);font-size:clamp(28px,2.2vw,38px);font-weight:500;line-height:1.12;letter-spacing:-.025em;color:#1A1A2E;margin:0}
        .session-series-description{font-size:17px;line-height:1.72;font-weight:400;color:#343447;margin:22px 0 0}
        .session-series-bottom{margin-top:auto;padding-top:34px}
        .session-series-date{font-size:11px;font-weight:800;letter-spacing:.1em;color:#4b4b5b;text-transform:uppercase;margin-bottom:18px;line-height:1.55}
        .session-series-actions{display:flex;gap:10px;align-items:center}
        .session-series-primary,.session-series-secondary{min-height:50px;padding:0 14px;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;text-transform:uppercase;letter-spacing:.09em;font-size:11px;font-weight:800;border-radius:2px;transition:all .2s ease}
        .session-series-primary{background:#1A1A2E;color:#F7F4EE;border:1px solid #1A1A2E;flex:1}
        .session-series-primary:hover{background:var(--gold);border-color:var(--gold);color:#1A1A2E}
        .session-series-secondary{border:1px solid rgba(26,26,46,.32);color:#1A1A2E;background:transparent;flex:1}
        .session-series-secondary:hover{border-color:var(--gold);color:#76591c}
        .session-series-footer{margin-top:24px;font-size:14px;line-height:1.7;color:#4b4b5b;max-width:760px}
        @media(max-width:1000px){.session-series-head{align-items:flex-start;flex-direction:column;gap:24px}.session-series-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.session-series-card{min-height:470px}.session-series-title{font-size:clamp(44px,8vw,68px)}}
        @media(max-width:680px){.session-series{padding-top:78px;padding-bottom:90px}.session-series-intro{font-size:17px}.session-series-grid{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}.session-series-grid::-webkit-scrollbar{display:none}.session-series-card{min-width:min(84vw,350px);scroll-snap-align:start;padding:30px 24px}.session-series-card h3{font-size:30px}.session-series-description{font-size:16px}}
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
          {sessions.map((session) => (
            <article className="session-series-card" key={session.id}>
              <div className="session-series-top"><div className="session-series-number">SESSION {session.id}</div><div className="session-series-status">{session.status}</div></div>
              <div className="session-series-cluster">{session.cluster}</div>
              <h3>{session.title}</h3>
              <p className="session-series-description">{session.description}</p>
              <div className="session-series-bottom">
                <div className="session-series-date">{session.date} · VIRTUAL · 90 MINUTES</div>
                <div className="session-series-actions">
                  <a className="session-series-primary" href="#events">{session.action} <span aria-hidden="true">&nbsp;→</span></a>
                  <a className="session-series-secondary" href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer">ASSESSMENT <span aria-hidden="true">&nbsp;→</span></a>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="session-series-footer">Sessions 02—05 are part of the same Professional Standard Series. Registration and session access follow the individual session lifecycle.</div>
      </div>
    </section>
  )
}
