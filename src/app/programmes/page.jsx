import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import ContactForm from '../contact-us/ContactForm'
import '../pages.css'

export const metadata = {
  title: 'Valoria Develop — PRIME-Based Programmes',
  description: 'PRIME-based development programmes for individuals and organisations, designed around capability gaps surfaced by the VALU Index.',
  keywords: ['Valoria Develop', 'PRIME development programmes', 'professional capability development'],
  openGraph: {
    title: 'Valoria Develop | Valoria Institute',
    description: 'Development that closes the capability gaps your assessment found.',
    url: 'https://valoriainstitute.com/programmes',
  },
  alternates: { canonical: 'https://valoriainstitute.com/programmes' },
}

const FORMATS = [
  { name: 'PRIME Sprint', duration: 'One day', detail: 'A focused workshop built around one skill.' },
  { name: 'PRIME Cluster Programme', duration: 'Six weeks', detail: 'A structured development programme focused on one PRIME cluster.' },
  { name: 'PRIME Certified Professional', duration: 'Six months', detail: 'A development pathway spanning all five PRIME clusters. The certification process is in development; participation in this pathway does not currently confer a Valoria certification.', status: 'IN DEVELOPMENT' },
  { name: 'Executive Immersion', duration: 'Three days', detail: 'An intensive experience for no more than 12 senior participants.' },
]

export default function ProgrammesPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">VALORIA DEVELOP</span></div>
            <h1 className="page-title">Development that<br /><em>closes the gap.</em></h1>
            <p className="page-sub">
              Valoria Develop runs PRIME-based programmes for individuals and organisations. Each one targets the capability areas where development can make a difference.
            </p>
            <div className="page-hero-actions">
              <a href="#programme-enquiry" className="btn-gold">ENQUIRE ABOUT A PROGRAMME</a>
              <a href="/prime" className="btn-outline">EXPLORE THE PRIME FRAMEWORK</a>
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">FOUR DEVELOPMENT FORMATS</span></div>
              <h2 className="section-title">A format for<br /><em>the work ahead.</em></h2>
            </Reveal>
            <div className="programmes-grid">
              {FORMATS.map((format, index) => (
                <Reveal key={format.name}>
                  <article className="card-gold programme-card">
                    <div className="facilitator-step">0{index + 1}</div>
                    <div className="cluster-name">{format.name}</div>
                    <div className="programme-label">{format.duration}</div>
                    {format.status && <div className="programme-label">{format.status}</div>}
                    <p className="cluster-desc">{format.detail}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="page-section alt">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">HOW IT IS TAUGHT</span></div>
              <h2 className="section-title">Learning through<br /><em>practice and people.</em></h2>
              <p className="page-copy">The proposed delivery model balances practical application, learning with others and focused formal instruction.</p>
            </Reveal>
            <Reveal>
              <div className="prime-tier-list">
                <article className="card-gold prime-tier"><div className="prime-tier-meta"><div>70% Experiential</div></div><p className="cluster-desc">Learning through practice, application and real work.</p></article>
                <article className="card-gold prime-tier"><div className="prime-tier-meta"><div>20% Social</div></div><p className="cluster-desc">Learning through peers, collaboration and shared reflection.</p></article>
                <article className="card-gold prime-tier"><div className="prime-tier-meta"><div>10% Formal</div></div><p className="cluster-desc">Focused instruction that supports the learning process.</p></article>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="page-section" id="programme-enquiry">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">PROGRAMME ENQUIRY</span></div>
              <h2 className="section-title">Tell us about<br /><em>your development need.</em></h2>
              <p className="page-copy">Share the team or audience, the PRIME cluster you want to focus on and your timeline. If you are not sure which cluster to select, tell us that in the form and we can clarify the scope with you.</p>
              <p className="page-copy">Facilitator certification, formal certification outcomes, remeasurement schedules and programme prices are not represented as available until confirmed.</p>
            </Reveal>
            <Reveal>
              <div className="info-card">
                <ContactForm initialInquiryType="training" />
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
