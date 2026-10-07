import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Insights — Valoria Institute',
  description: 'Perspectives on professional capability, leadership, influence and opportunity from Valoria Institute.',
}

const pieces = [
  ['PROFESSIONAL CAPABILITY', 'Good work is only the beginning.', 'Capability has to be understood, developed and made legible before it can consistently translate into opportunity.'],
  ['VISIBILITY', 'Being seen is not the same as being understood.', 'Professional visibility becomes more valuable when the signal behind the profile is structured, credible and useful to the person making the decision.'],
  ['INFLUENCE', 'Authority is not the only currency in the room.', 'The ability to move people, decisions and outcomes increasingly depends on influence — and influence can be developed deliberately.'],
]

export default function InsightsPage() {
  return (
    <>
      <Nav />
      <main className="insights-page">
        <section className="page-hero insights-hero">
          <div className="page-hero-inner">
            <div className="page-kicker">VALORIA INSTITUTE · INSIGHTS</div>
            <h1 className="page-title">Ideas worth carrying<br /><em>into the room.</em></h1>
            <p className="page-sub">Perspectives on professional capability, leadership, influence, work and the systems that determine who gets seen.</p>
          </div>
        </section>

        <section className="page-section insights-list">
          <div className="page-section-inner">
            <div className="insights-grid">
              {pieces.map(([k, t, b], i) => (
                <article className="insight-card" key={k}>
                  <div className="insight-kicker">{k}</div>
                  <h2>{t}</h2>
                  <p>{b}</p>
                  <div className="insight-index">VALORIA EDITORIAL · {String(i + 1).padStart(2, '0')}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="page-section insights-bridge">
          <div className="page-section-inner">
            <div className="bridge-card">
              <div className="page-kicker">TURN INSIGHT INTO DIRECTION</div>
              <h2 className="section-title">Know where you stand.</h2>
              <p className="page-sub">Start with VALU and turn a clearer picture of your capability into your next professional move.</p>
              <a className="btn-gold" href="/valu">START MY VALU SNAPSHOT</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
