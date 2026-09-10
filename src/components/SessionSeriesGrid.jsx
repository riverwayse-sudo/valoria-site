'use client'

import { BRAND } from '@/lib/brand'

const sessions = [
  {
    id: '02',
    cluster: 'INTELLIGENCE',
    title: 'Strategic Thinking: You Are Solving the Wrong Problems',
    description: 'Distinguish problem-solving from problem-selection and use strategic trade-offs to focus on what matters.',
    date: 'SEPTEMBER 26, 2026',
    status: 'NEXT SESSION',
    action: 'REGISTER',
  },
  {
    id: '03',
    cluster: 'MASTERY',
    title: 'Execution Without Burnout: Why High Performers Plateau',
    description: 'Move from output to impact, escape the indispensability trap and build a more sustainable operating model.',
    date: 'OCTOBER 17, 2026',
    status: 'COMING SOON',
    action: 'COMING SOON',
  },
  {
    id: '04',
    cluster: 'RELATIONSHIPS',
    title: 'Emotional Intelligence Is Not About Being Nice',
    description: 'Treat emotional intelligence as a precision instrument for perception, regulation and strategic application.',
    date: 'NOVEMBER 14, 2026',
    status: 'COMING SOON',
    action: 'COMING SOON',
  },
  {
    id: '05',
    cluster: 'ENTERPRISE',
    title: 'Influence Without Authority: The Real Currency of Organisational Power',
    description: 'Understand authority versus influence and build a 90-day stakeholder influence map.',
    date: 'DECEMBER 05, 2026',
    status: 'COMING SOON',
    action: 'COMING SOON',
  },
]

export default function SessionSeriesGrid() {
  return (
    <section className="session-series" id="upcoming-sessions" aria-labelledby="session-series-title">
      <style>{`
        .session-series{position:relative;padding:clamp(76px,9vw,120px) var(--pad);background:var(--parchment);overflow:hidden}
        .session-series-inner{max-width:1240px;margin:0 auto;position:relative;z-index:1}
        .session-series-head{display:flex;align-items:flex-end;justify-content:space-between;gap:40px;margin-bottom:42px}
        .session-series-kicker{display:flex;align-items:center;gap:10px;font-size:9px;font-weight:800;letter-spacing:.22em;color:rgba(26,26,46,.5);text-transform:uppercase}
        .session-series-kicker:before{content:'';width:30px;height:1px;background:var(--gold)}
        .session-series-title{font-family:var(--font);font-size:clamp(38px,5vw,68px);font-weight:200;line-height:1.02;letter-spacing:-.03em;color:var(--navy);margin:15px 0 0;max-width:760px}
        .session-series-title em{font-style:italic;color:var(--gold);font-weight:300}
        .session-series-intro{max-width:330px;font-size:13px;line-height:1.7;font-weight:400;color:rgba(26,26,46,.52);margin:0}
        .session-series-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid rgba(26,26,46,.16);border-left:1px solid rgba(26,26,46,.16)}
        .session-series-card{min-height:490px;padding:28px 25px 24px;border-right:1px solid rgba(26,26,46,.16);border-bottom:1px solid rgba(26,26,46,.16);display:flex;flex-direction:column;position:relative;transition:transform .35s ease,background .35s ease}
        .session-series-card:hover{background:rgba(255,255,255,.42);transform:translateY(-4px)}
        .session-series-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:34px}
        .session-series-number{font-family:var(--font);font-size:12px;font-weight:800;letter-spacing:.14em;color:var(--gold)}
        .session-series-status{font-size:8px;font-weight:800;letter-spacing:.13em;color:rgba(26,26,46,.42);text-transform:uppercase;text-align:right}
        .session-series-cluster{font-size:8px;font-weight:800;letter-spacing:.18em;color:rgba(26,26,46,.48);text-transform:uppercase;margin-bottom:16px}
        .session-series-card h3{font-family:var(--font);font-size:clamp(23px,2.1vw,31px);font-weight:400;line-height:1.14;letter-spacing:-.025em;color:var(--navy);margin:0}
        .session-series-description{font-size:12px;line-height:1.7;color:rgba(26,26,46,.52);margin:20px 0 0}
        .session-series-bottom{margin-top:auto;padding-top:30px}
        .session-series-date{font-size:8px;font-weight:800;letter-spacing:.13em;color:rgba(26,26,46,.4);text-transform:uppercase;margin-bottom:15px}
        .session-series-actions{display:flex;gap:8px;align-items:center}
        .session-series-primary,.session-series-secondary{min-height:43px;padding:0 12px;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;text-transform:uppercase;letter-spacing:.11em;font-size:8px;font-weight:800;border-radius:2px;transition:all .2s ease}
        .session-series-primary{background:var(--navy);color:var(--parchment);border:1px solid var(--navy);flex:1}
        .session-series-primary:hover{background:var(--gold);border-color:var(--gold);color:var(--navy)}
        .session-series-secondary{border:1px solid rgba(26,26,46,.2);color:var(--navy);background:transparent;flex:1}
        .session-series-secondary:hover{border-color:var(--gold);color:var(--gold)}
        .session-series-footer{margin-top:18px;font-size:9px;line-height:1.6;color:rgba(26,26,46,.35);max-width:620px}
        @media(max-width:1000px){.session-series-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.session-series-card{min-height:430px}}
        @media(max-width:680px){.session-series-head{display:block}.session-series-intro{margin-top:18px}.session-series-grid{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}.session-series-grid::-webkit-scrollbar{display:none}.session-series-card{min-width:min(82vw,330px);scroll-snap-align:start}}
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
              <div className="session-series-top">
                <div className="session-series-number">SESSION {session.id}</div>
                <div className="session-series-status">{session.status}</div>
              </div>
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
