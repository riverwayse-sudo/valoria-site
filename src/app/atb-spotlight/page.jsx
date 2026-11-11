import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import '../pages.css'

export const metadata = {
  title: 'ATB Spotlight | Distinguished Speakers and Facilitators',
  description: 'Identify speakers and facilitators through capability-led profiles, subject expertise and relevant professional experience.',
  alternates: { canonical: 'https://valoriainstitute.com/atb-spotlight' },
}

export default function ATBSpotlightPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="decision-page">
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">ATB SPOTLIGHT · FOR EVENT AND INSTITUTIONAL LEADERS</span></div>
            <h1 className="page-title">Bring the right expertise<br /><em>to the moments that matter.</em></h1>
            <p className="page-sub">Identify speakers and facilitators for executive briefings, leadership forums and consequential institutional gatherings. Explore subject expertise and, where supplied and approved for public display, talks, sessions led and relevant experience.</p>
            <div className="page-hero-actions">
              <a href="/marketplace/speakers" className="btn-gold">FIND A SPEAKER</a>
              <a href="/marketplace/facilitators" className="btn-outline">FIND A FACILITATOR</a>
            </div>
          </div>
        </section>
        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">FOR EVENT ORGANIZERS</span></div>
              <h2 className="section-title">Put relevant expertise<br /><em>at the center of the conversation.</em></h2>
              <p className="page-copy">Explore speakers by professional focus, PRIME capability and relevant experience. Public profile information appears according to each professional's visibility choices and Valoria's listing requirements; availability and suitability are confirmed for each brief.</p>
            </Reveal>
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">FOR LEARNING AND DEVELOPMENT LEADERS</span></div>
              <h2 className="section-title">Design learning<br /><em>around the required outcome.</em></h2>
              <p className="page-copy">For organizational development and leadership engagements, Valoria Develop provides PRIME-mapped development pathways. Facilitator certification remains in development; no professional is described as certified unless and until the relevant process is complete.</p>
              <a href="/develop" className="text-link">EXPLORE VALORIA DEVELOP →</a>
            </Reveal>
          </div>
        </section>
        <section className="page-section alt">
          <Reveal>
            <h2 className="section-title">Have a defined<br /><em>institutional brief?</em></h2>
            <p className="page-sub">Share the audience, purpose, subject matter, format and expected contribution. The team can discuss suitability and currently available options.</p>
            <div className="page-hero-actions"><a href="/contact-us?topic=ATB%20Spotlight" className="btn-gold">DISCUSS A REQUIREMENT</a></div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  )
}
