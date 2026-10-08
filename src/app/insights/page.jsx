import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { INSIGHTS } from '@/content/insights'

export const metadata = {
  title: 'Insights — Valoria Institute',
  description: 'Perspectives on professional capability, development, visibility, leadership and opportunity from Valoria Institute.',
  alternates: { canonical: 'https://valoriainstitute.com/insights' },
}

export default function InsightsPage() {
  return <>
    <Nav />
    <main className="insights-page">
      <section className="page-hero insights-hero">
        <div className="page-hero-inner">
          <div className="page-kicker">VALORIA INSTITUTE · INSIGHTS</div>
          <h1 className="page-title">Ideas worth carrying<br /><em>into the room.</em></h1>
          <p className="page-sub">Perspectives on professional capability, development, visibility, leadership and the systems that determine how value gets seen and applied.</p>
        </div>
      </section>
      <section className="page-section insights-list">
        <div className="page-section-inner">
          <div className="insights-grid">
            {INSIGHTS.map(item => (
              <article className="insight-card insight-card--linked" key={item.slug}>
                <div className="insight-kicker">{item.category}</div>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <div className="insight-card-footer">
                  <span>{item.readTime}</span>
                  <Link href={`/insights/${item.slug}`}>READ INSIGHT →</Link>
                </div>
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
            <Link className="btn-gold" href="/valu">START MY VALU SNAPSHOT</Link>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </>
}
