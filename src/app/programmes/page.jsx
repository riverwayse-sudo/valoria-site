import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import ContactForm from '../contact-us/ContactForm'
import '../pages.css'

export const metadata = {
  title: 'Valoria Develop — PRIME-Based Development',
  description: 'Explore development pathways connected to PRIME capability insights from the VALU Index. Discuss the needs, scope and delivery options for your audience.',
  keywords: ['Valoria Develop', 'PRIME development', 'professional capability development'],
  openGraph: {
    title: 'Valoria Develop | Valoria Institute',
    description: 'Development pathways shaped around professional capability.',
    url: 'https://valoriainstitute.com/programmes',
  },
  alternates: { canonical: 'https://valoriainstitute.com/programmes' },
}

const DEVELOPMENT_STEPS = [
  {
    name: 'Understand capability',
    detail: 'Use the VALU Index and PRIME cluster insights to identify strengths and the capability areas that may need further development.',
  },
  {
    name: 'Agree the development focus',
    detail: 'Define the audience, intended outcomes, relevant PRIME skills and the context in which the learning needs to be applied.',
  },
  {
    name: 'Shape the pathway',
    detail: 'Discuss an appropriate learning format, scope, timing and delivery arrangements with Valoria before a programme is confirmed.',
  },
]

export default function ProgrammesPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">VALORIA DEVELOP</span></div>
            <h1 className="page-title">Development built<br /><em>around capability.</em></h1>
            <p className="page-sub">
              Valoria Develop connects PRIME capability insights to development pathways for professionals and organisations. The focus, format, scope and delivery arrangements are agreed through an enquiry; availability is confirmed before any programme is offered.
            </p>
            <div className="page-hero-actions">
              <a href="#programme-enquiry" className="btn-gold">DISCUSS A DEVELOPMENT NEED</a>
              <a href="/prime" className="btn-outline">EXPLORE THE PRIME FRAMEWORK</a>
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">A CAPABILITY-LED APPROACH</span></div>
              <h2 className="section-title">From insight<br /><em>to development.</em></h2>
              <p className="page-copy">A VALU result can help identify where to focus. Development begins by understanding the need, agreeing the intended outcomes and confirming a suitable pathway.</p>
            </Reveal>
            <div className="programmes-grid">
              {DEVELOPMENT_STEPS.map((step, index) => (
                <Reveal key={step.name}>
                  <article className="card-gold programme-card">
                    <div className="facilitator-step">0{index + 1}</div>
                    <div className="cluster-name">{step.name}</div>
                    <p className="cluster-desc">{step.detail}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="page-section alt">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">WHAT WE CLARIFY</span></div>
              <h2 className="section-title">A clear scope<br /><em>before delivery.</em></h2>
              <p className="page-copy">Every development enquiry should establish what the audience needs, what progress should look like and what can realistically be delivered.</p>
            </Reveal>
            <Reveal>
              <div className="prime-tier-list">
                <article className="card-gold prime-tier"><div className="prime-tier-meta"><div>Audience and context</div></div><p className="cluster-desc">Who the pathway is intended for and the professional or organisational context.</p></article>
                <article className="card-gold prime-tier"><div className="prime-tier-meta"><div>Capability priorities</div></div><p className="cluster-desc">The PRIME skills and development areas the work is intended to address.</p></article>
                <article className="card-gold prime-tier"><div className="prime-tier-meta"><div>Scope and availability</div></div><p className="cluster-desc">The appropriate format, timing, delivery arrangements and commercial terms, confirmed before commitment.</p></article>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="page-section" id="programme-enquiry">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">DEVELOPMENT ENQUIRY</span></div>
              <h2 className="section-title">Tell us what<br /><em>needs to change.</em></h2>
              <p className="page-copy">Share the individual or team, the capability area you want to strengthen and the outcome you are working towards. If you are unsure which PRIME cluster is most relevant, describe the need and Valoria can clarify the scope with you.</p>
              <p className="page-copy">A development enquiry is a conversation, not confirmation that a programme, date or facilitator is already available.</p>
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
