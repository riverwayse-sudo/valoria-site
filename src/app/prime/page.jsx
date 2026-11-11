import Nav, { AssessmentStartLink } from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import { PRIME_CLUSTERS } from '@/lib/brand'
import '../pages.css'

export const metadata = {
  title: 'PRIME Framework — Valoria Institute',
  description: 'PRIME describes how professional capability shows up in the work. The VALU Index measures it across five clusters and seventeen skills.',
  keywords: ['PRIME framework', 'VALU Index', 'professional capability'],
  alternates: { canonical: 'https://valoriainstitute.com/prime' },
}


const DESIGNATIONS = [
  { name: 'Elite', range: '90–100 points', meaning: 'A distinguished level of assessed professional capability across the PRIME framework.' },
  { name: 'Distinguished', range: '75–89 points', meaning: 'Strong professional capability, supported by clear strengths across the PRIME dimensions.' },
  { name: 'Proficient', range: '55–74 points', meaning: 'A credible professional capability baseline with demonstrated strengths and focused development opportunities.' },
  { name: 'Standard', range: '35–54 points', meaning: 'An established starting baseline for structured professional development.' },
]

export default function PrimePage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THE PRIME FRAMEWORK</span></div>
            <h1 className="page-title">Five clusters.<br />Seventeen <em>skills.</em></h1>
            <p className="page-sub">PRIME describes how professional capability shows up in the work. The VALU Index measures it.</p>
            <div className="page-hero-actions">
              <a href="/valu" className="btn-gold">UNDERSTAND THE VALU INDEX</a>
              <AssessmentStartLink href="/valu/assessment/" className="btn-outline">TAKE THE VALU INDEX TASTER</AssessmentStartLink>
            </div>
          </div>
        </section>
        <section className="page-section">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THE FIVE CLUSTERS</span></div>
              <h2 className="section-title">How capability<br /><em>shows up in the work.</em></h2>
            </Reveal>
            {PRIME_CLUSTERS.map(cluster => (
              <Reveal key={cluster.letter}>
                <article className="prime-cluster">
                  <div className="cluster-letter prime-letter">{cluster.letter}</div>
                  <div>
                    <div className="cluster-name prime-name">{cluster.name}</div>
                    <div className="prime-subtitle">{cluster.subtitle}</div>
                    <p className="prime-body">{cluster.description}</p>
                    <ul className="prime-signals">
                      {cluster.skills.map(skill => <li key={skill} className="prime-signal"><span className="prime-signal-mark">✦</span>{skill}{['AI Fluency','Human-AI Collaboration'].includes(skill) && <sup aria-label="Future-Ready skill"> ★</sup>}</li>)}
                    </ul>
                  </div>
                </article>
              </Reveal>
            ))}
            <p className="prime-copy">★ Future-Ready skill — critical for the professional talent market of 2025 to 2035.</p>
          </div>
        </section>
        <section className="page-section alt">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow eyebrow-center"><div className="eyebrow-line" /><span className="eyebrow-text">THE VALU INDEX</span><div className="eyebrow-line" /></div>
              <h2 className="section-title section-title-centered">One framework.<br /><em>Scores in points.</em></h2>
              <p className="page-sub prime-centered-copy">The VALU Index provides a points-based capability profile across the five PRIME clusters. Results are reported in points, not percentages.</p>
            </Reveal>
          </div>
        </section>
        <section className="page-section">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">FOUR SCORE-BASED DESIGNATIONS</span></div>
              <h2 className="section-title">Progress is<br /><em>earned, not purchased.</em></h2>
            </Reveal>
            <div className="prime-tier-list">
              {DESIGNATIONS.map(item => (
                <article key={item.name} className="card-gold prime-tier">
                  <div className="prime-tier-meta"><div>{item.name}</div><small className="prime-tier-range">{item.range}</small></div>
                  <p className="cluster-desc prime-tier-copy">{item.meaning}</p>
                </article>
              ))}
            </div>
            <p className="prime-copy">The four merit designations are score-based. Scores below 35 points receive no merit designation. Designations cannot be purchased, upgraded by subscription, or transferred. A designation is not, by itself, a public-listing decision. Listing also depends on the applicable profile, capability evidence, consent and governance requirements. A lower score points to a development pathway; it does not block access to the platform.</p>
          </div>
        </section>
        <section className="page-section alt cta-banner">
          <Reveal>
            <div className="eyebrow eyebrow-center"><div className="eyebrow-line" /><span className="eyebrow-text">WORTH, BUILT.</span><div className="eyebrow-line" /></div>
            <h2 className="section-title">Take the taster.<br /><em>See your first signal.</em></h2>
            <div className="page-hero-actions eyebrow-center">
              <AssessmentStartLink href="/valu/assessment/" className="btn-gold">TAKE THE VALU INDEX TASTER</AssessmentStartLink>
              <a href="/valu" className="btn-outline">HOW VALU WORKS</a>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  )
}
