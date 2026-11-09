import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import '../pages.css'
import '../audience-hero-imagery.css'

export const metadata = {
  title: 'ATB Spotlight | Speakers and Facilitators',
  description: 'Discover speakers and facilitators through capability-led professional profiles and relevant experience.',
  alternates: { canonical: 'https://valoriainstitute.com/atb-spotlight' },
}

export default function ATBSpotlightPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="decision-page">
        <section className="page-hero atb-spotlight-cinematic-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">ATB SPOTLIGHT · FOR EVENT ORGANISERS & TRAINING BUYERS</span></div>
            <h1 className="page-title">Find a speaker or facilitator<br /><em>who can hold a room.</em></h1>
            <p className="page-sub">Discover professionals through capability-led profiles. Explore their areas of expertise and, where supplied and approved for public display, their talks, sessions led and client experience.</p>
            <div className="page-hero-actions">
              <a href="/marketplace/speakers" className="btn-gold">FIND A SPEAKER</a>
              <a href="/marketplace/facilitators" className="btn-outline">FIND A FACILITATOR</a>
            </div>
          </div>
        </section>
        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">FOR EVENT ORGANISERS</span></div>
              <h2 className="section-title">Bring the right<br /><em>expertise into the room.</em></h2>
              <p className="page-copy">Explore speakers by professional focus, PRIME capability and relevant experience. Public profile information is shown according to each professional's visibility choices and Valoria's listing requirements.</p>
            </Reveal>
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">FOR TRAINING BUYERS</span></div>
              <h2 className="section-title">Design learning<br /><em>with intention.</em></h2>
              <p className="page-copy">For organisational development and training enquiries, Valoria Develop provides PRIME-mapped programme pathways. Facilitator certification remains in development; no professional is described as certified until that process is complete.</p>
              <a href="/develop" className="text-link">EXPLORE VALORIA DEVELOP →</a>
            </Reveal>
          </div>
        </section>
        <section className="page-section alt">
          <Reveal>
            <h2 className="section-title">Have a specific<br /><em>brief in mind?</em></h2>
            <p className="page-sub">Share your event, audience, subject area or development requirement and the team can discuss the available options.</p>
            <div className="page-hero-actions"><a href="/contact-us?topic=ATB%20Spotlight" className="btn-gold">DISCUSS A REQUIREMENT</a></div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  )
}
