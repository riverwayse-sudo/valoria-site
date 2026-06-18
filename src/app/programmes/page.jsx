import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import { PRIME_CLUSTERS } from '@/lib/brand'
import '../pages.css'

export const metadata = {
  title: 'Programmes',
  description: 'Development programmes mapped to the PRIME framework, delivered by certified facilitators through Valoria Develop.',
}

export default function ProgrammesPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">PROGRAMMES</span></div>
            <h1 className="page-title">A programme<br />for every <em>cluster.</em></h1>
            <p className="page-sub">
              Every Valoria Develop programme is built against one or more PRIME clusters, so a team&apos;s development maps directly onto how they&apos;ll be measured.
            </p>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-inner">
            <Reveal className="two-col" style={{ display: 'grid' }}>
              {PRIME_CLUSTERS.filter((c) => c.name !== 'TBD').map((c) => (
                <div className="card-gold" key={c.letter}>
                  <div className="cluster-letter" style={{ color: c.color, marginBottom: '16px' }}>{c.letter}</div>
                  <div className="cluster-name">{c.name} Programme</div>
                  <p className="cluster-desc">A facilitator-led programme building the {c.name.toLowerCase()} cluster, delivered by certified facilitators and benchmarked against the VALU Index.</p>
                </div>
              ))}
            </Reveal>
            <p style={{ color: 'var(--faint)', fontSize: '12px', marginTop: '32px' }}>
              Full programme outlines and durations are confirmed at commissioning. Contact us for a tailored proposal.
            </p>
          </div>
        </section>

        <section className="page-section alt cta-banner">
          <Reveal>
            <h2 className="section-title">Commission a<br /><em>programme.</em></h2>
            <p className="page-sub">Tell us which cluster your team needs to close, and we&apos;ll match you with a certified facilitator.</p>
            <a href="/contact-us" className="btn-gold">CONTACT US</a>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  )
}
