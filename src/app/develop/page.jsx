import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import { PRIME_CLUSTERS } from '@/lib/brand'
import '../pages.css'

export const metadata = {
  title: 'Valoria Develop | Executive and Institutional Development',
  description: 'Explore considered, PRIME-based development pathways for accomplished professionals, leadership teams and institutions.',
  alternates: { canonical: 'https://valoriainstitute.com/develop' },
}

const FORMATS = [
  { name: 'PRIME Sprint', duration: 'One day', focus: 'A focused workshop built around one professional skill.', status: 'Enquiry-led' },
  { name: 'PRIME Cluster Programme', duration: 'Six weeks', focus: 'A structured development journey centred on one PRIME cluster.', status: 'Enquiry-led' },
  { name: 'PRIME Certified Professional', duration: 'Six months', focus: 'A pathway designed to cover all five PRIME clusters.', status: 'In development' },
  { name: 'Executive Immersion', duration: 'Three days', focus: 'A focused experience for senior participants, with a maximum cohort of 12.', status: 'Enquiry-led' },
]

export default function DevelopPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="decision-page">
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">VALORIA DEVELOP</span></div>
            <h1 className="page-title">Development for<br /><em>work that carries consequence.</em></h1>
            <p className="page-sub">Valoria Develop translates the PRIME framework into focused development experiences for accomplished professionals, leadership teams and institutions. Each engagement begins with the work, judgment and capability the organization needs to strengthen—not a generic training catalogue.</p>
            <div className="page-hero-actions">
              <a href="/contact-us?topic=Valoria%20Develop" className="btn-gold">ENQUIRE ABOUT DEVELOPMENT</a>
              <a href="/prime" className="btn-outline">EXPLORE PRIME</a>
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THE DEVELOPMENT FRAMEWORK</span></div>
              <h2 className="section-title">Five dimensions.<br /><em>A disciplined basis for growth.</em></h2>
              <p className="page-copy">PRIME provides a shared language for professional development across Presence, Relationships, Intelligence, Mastery and Enterprise. Development priorities are scoped around the professional or institution's context. Programme scope, faculty and availability are confirmed during the enquiry process.</p>
            </Reveal>
            <div className="programmes-grid">
              {PRIME_CLUSTERS.map(cluster => (
                <Reveal key={cluster.letter}>
                  <article className="card-gold programme-card">
                    <div className="programme-head">
                      <div className="cluster-letter programme-letter">{cluster.letter}</div>
                      <div className="cluster-name">{cluster.name}</div>
                    </div>
                    <p className="cluster-desc programme-focus">{cluster.subtitle}</p>
                    <p className="cluster-desc">{cluster.skills.join(' · ')}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="page-section alt">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">PROGRAMME FORMATS</span></div>
              <h2 className="section-title">Designed around<br /><em>the work that matters.</em></h2>
            </Reveal>
            <div className="programmes-grid">
              {FORMATS.map(format => (
                <Reveal key={format.name}>
                  <article className="card-gold programme-card">
                    <div className="programme-label">{format.duration}</div>
                    <h3 className="cluster-name">{format.name}</h3>
                    <p className="cluster-desc">{format.focus}</p>
                    <p className="programme-label">{format.status}</p>
                  </article>
                </Reveal>
              ))}
            </div>
            <p className="page-copy page-copy-spaced">The PRIME Certified Professional pathway remains in development and is not currently offered as a completed certification. No participant should represent participation in a development programme as a professional certification.</p>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">HOW DEVELOPMENT IS DESIGNED</span></div>
              <h2 className="section-title">Learn through<br /><em>application.</em></h2>
              <p className="page-copy">The proposed learning mix places the greatest emphasis on experiential practice, supported by peer learning and focused instruction. The appropriate design is confirmed against the engagement's objectives and delivery scope.</p>
            </Reveal>
            <Reveal>
              <div className="facilitator-diff-list">
                <div className="facilitator-diff"><div className="facilitator-dot" /><div><div className="facilitator-diff-title">70% experiential</div><p className="facilitator-diff-copy">Practice, application and reflection in realistic professional contexts.</p></div></div>
                <div className="facilitator-diff"><div className="facilitator-dot" /><div><div className="facilitator-diff-title">20% social</div><p className="facilitator-diff-copy">Peer learning, discussion and shared problem-solving.</p></div></div>
                <div className="facilitator-diff"><div className="facilitator-dot" /><div><div className="facilitator-diff-title">10% formal</div><p className="facilitator-diff-copy">Focused instruction and supporting concepts.</p></div></div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="page-section alt">
          <Reveal>
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">START A CONVERSATION</span><div className="eyebrow-line" /></div>
            <h2 className="section-title">Bring us the<br /><em>real development brief.</em></h2>
            <p className="page-sub">Share the leadership or capability challenge, the people involved and the outcome that matters. Valoria will discuss whether a PRIME-based engagement is appropriate; scope, faculty, timing and commercial terms are confirmed directly.</p>
            <div className="page-hero-actions">
              <a href="/contact-us?topic=Valoria%20Develop" className="btn-gold">ENQUIRE ABOUT DEVELOPMENT</a>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  )
}
