import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import { PRIME_CLUSTERS } from '@/lib/brand'
import '../pages.css'

export const metadata = {
  title: 'The PRIME Framework',
  description: 'Five capability clusters. One assessed standard. PRIME is the architecture behind the VALU Index and every Valoria Develop programme.',
}

const CLUSTER_DESCRIPTIONS = {
  P: 'How a professional shows up — composure, communication, and how clearly they carry their own expertise into a room.',
  R: 'How a professional works with others — collaboration, trust-building, and the quality of the relationships they sustain.',
  I: 'How a professional moves a decision — the ability to shift outcomes, not just contribute an opinion to them.',
  M: 'How a professional delivers — execution, accountability, resilience, and adaptability under pressure.',
  E: 'How a professional builds and operates — the structures, systems, and ventures they can stand up and run.',
}

export default function PrimePage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THE CAPABILITY ARCHITECTURE</span></div>
            <h1 className="page-title">Five clusters.<br />One <em>assessed standard.</em></h1>
            <p className="page-sub">
              PRIME is the framework underneath the VALU Index and every Valoria Develop programme. It defines what &ldquo;capable&rdquo; actually means across five dimensions — instead of leaving it to whoever&apos;s reading the résumé.
            </p>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-inner" style={{ maxWidth: '760px' }}>
            <Reveal>
              {PRIME_CLUSTERS.map((c) => (
                <div className="cluster-row" key={c.letter} style={{ color: c.color }}>
                  <div className="cluster-letter">{c.letter}</div>
                  <div>
                    <div className="cluster-name" style={{ color: 'var(--parchment)' }}>
                      {c.name}
                      {c.name === 'Mastery' && <span className="cluster-pending">}
                    </div>
                    <p className="cluster-desc">{CLUSTER_DESCRIPTIONS[c.letter]}</p>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        <section className="page-section alt cta-banner">
          <Reveal>
            <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="eyebrow-line" /><span className="eyebrow-text">SEE WHERE YOU SCORE</span><div className="eyebrow-line" /></div>
            <h2 className="section-title">Find out your<br /><em>own PRIME profile.</em></h2>
            <p className="page-sub">The VALU Index scores you across all five clusters in 18 to 28 minutes. Free, and valid for 12 months.</p>
            <a href="https://assessment.valoriainstitute.com/" className="btn-gold" target="_blank" rel="noopener noreferrer">BEGIN THE VALU INDEX — FREE</a>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  )
}
