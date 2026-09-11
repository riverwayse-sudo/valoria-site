import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { PROFESSIONAL_STANDARD_SERIES } from '@/lib/professionalStandardSeries'
import { BRAND } from '@/lib/brand'

export const metadata = {
  title: 'Events — Valoria Institute',
  description: 'Conversations, sessions and professional standards from Valoria Institute.',
}

export default function EventsPage() {
  return (
    <>
      <Nav />
      <main className="events-page">
        <section className="events-hero"><div className="events-wrap"><div className="events-kicker">VALORIA INSTITUTE · EVENTS</div><h1>Conversations that shape<br /><em>professional standard.</em></h1><p>Live sessions, recorded conversations and practical ideas for professionals building capability, influence and opportunity.</p></div></section>
        <section className="events-list"><div className="events-wrap"><div className="events-list-head"><div><span>UPCOMING</span><h2>What is next.</h2></div><p>Event dates are published only after the Valoria calendar is confirmed.</p></div>
          <div className="events-grid">
            {PROFESSIONAL_STANDARD_SERIES.filter(s => !s.replay).map(session => (
              <article className="event-card" id={`session-${session.id}`} key={session.id}>
                <div className="event-card-top"><span>SESSION {session.id}</span><b>COMING SOON</b></div>
                <small>{session.cluster}</small><h3>{session.title}</h3><p>{session.description}</p>
                <div className="event-card-meta"><strong>DATE TO BE CONFIRMED</strong><span>VIRTUAL · 90 MINUTES</span></div>
              </article>
            ))}
          </div>
        </div></section>
        <section className="events-replay" id="session-01"><div className="events-wrap replay-grid"><div><div className="events-kicker">SESSION 01 · REPLAY</div><h2>Why being good at your job is no longer <em>enough.</em></h2><p>The opening Valoria conversation on professional worth, visibility, influence and the infrastructure required to turn capability into recognised opportunity.</p><a href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer">START YOUR VALU INDEX →</a></div><div className="replay-video"><iframe src="https://www.youtube.com/embed/B9dD22vTErI" title="Valoria Institute Session 01 replay" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div></div></section>
      </main>
      <Footer />
      <style>{` .events-page{background:#F7F4EE;color:#1A1A2E}.events-wrap{width:min(1240px,calc(100% - 48px));margin:0 auto}.events-hero{padding:170px 0 105px;background:#0F0F1A;color:#F7F4EE}.events-kicker{font-size:10px;font-weight:800;letter-spacing:.2em;color:#C9A84C;text-transform:uppercase}.events-hero h1,.events-replay h2{font-family:var(--font);font-size:clamp(54px,7vw,92px);font-weight:300;line-height:.98;letter-spacing:-.045em;margin:22px 0}.events-hero em,.events-replay em{font-style:italic;color:#C9A84C}.events-hero p{font-size:19px;line-height:1.7;color:rgba(247,244,238,.55);max-width:700px}.events-list{padding:105px 0}.events-list-head{display:flex;justify-content:space-between;align-items:end;gap:40px;margin-bottom:50px}.events-list-head span{font-size:10px;font-weight:800;letter-spacing:.2em;color:#8a6b27}.events-list-head h2{font-family:var(--font);font-size:56px;font-weight:300;line-height:1;margin:15px 0 0}.events-list-head p{max-width:400px;color:#5b5b6a;line-height:1.6}.events-grid{display:grid;grid-template-columns:repeat(2,1fr);border-top:1px solid rgba(26,26,46,.2);border-left:1px solid rgba(26,26,46,.2)}.event-card{min-height:380px;padding:30px;border-right:1px solid rgba(26,26,46,.2);border-bottom:1px solid rgba(26,26,46,.2);display:flex;flex-direction:column}.event-card-top{display:flex;justify-content:space-between;font-size:9px;font-weight:800;letter-spacing:.12em}.event-card-top b{color:#9a7428}.event-card small{font-size:10px;font-weight:800;letter-spacing:.17em;color:#6b6b79;margin:52px 0 14px}.event-card h3{font-family:var(--font);font-size:34px;font-weight:500;line-height:1.1;margin:0}.event-card p{font-size:15px;line-height:1.7;color:#555565}.event-card-meta{margin-top:auto;padding-top:24px;display:flex;justify-content:space-between;gap:15px;font-size:9px;letter-spacing:.1em;color:#666676}.events-replay{padding:115px 0;background:#0F0F1A;color:#F7F4EE}.replay-grid{display:grid;grid-template-columns:.8fr 1.2fr;gap:70px;align-items:center}.events-replay h2{font-size:clamp(44px,5vw,68px)}.events-replay p{font-size:17px;line-height:1.75;color:rgba(247,244,238,.5)}.events-replay a{display:inline-block;margin-top:20px;color:#C9A84C;text-decoration:none;font-size:10px;font-weight:800;letter-spacing:.12em}.replay-video{aspect-ratio:16/9;border:1px solid rgba(201,168,76,.2)}.replay-video iframe{width:100%;height:100%;border:0}@media(max-width:800px){.events-wrap{width:min(100% - 36px,1240px)}.events-hero{padding:135px 0 80px}.events-list,.events-replay{padding:80px 0}.events-list-head,.replay-grid{display:block}.events-list-head p{margin-top:20px}.events-grid{grid-template-columns:1fr}.replay-video{margin-top:40px}.events-hero h1,.events-replay h2{font-size:50px}}`}</style>
    </>
  )
}
