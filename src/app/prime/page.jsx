import Nav from '@/components/Nav'
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
  { name: 'Force to Align With', range: '80–100 points', meaning: 'Operating at the highest expression of professional capability.' },
  { name: 'Emerging Force', range: '65–79 points', meaning: 'Strong assessed capability with clear cluster strengths.' },
  { name: 'Developing Professional', range: '50–64 points', meaning: 'A developing professional capability baseline with areas ready for further strengthening.' },
  { name: 'Building Foundations', range: '35–49 points', meaning: 'An emerging capability baseline with clear opportunities for structured development.' },
  { name: 'At the Starting Point', range: 'Below 35 points', meaning: 'An early capability baseline. A structured development pathway can help establish the next steps.' },
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
              <a href="/valu/assessment/" className="btn-outline">TAKE THE VALU TASTER</a>
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
                      {cluster.skills.map(skill => <li key={skill} className="prime-signal"><span className="prime-signal-mark">✦</span>{skill}</li>)}
                    </ul>
                  </div>
                </article>
              </Reveal>
            ))}
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
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">FIVE SCORE-BASED DESIGNATIONS</span></div>
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
            <p className="prime-copy">Designations are score-based. They cannot be purchased, upgraded by subscription, or transferred. A designation is not, by itself, a public-listing decision. Listing also depends on the applicable profile, capability evidence, consent and governance requirements. A lower score points to a development pathway; it does not block access to the platform.</p>
          </div>
        </section>
        <section className="page-section alt cta-banner">
          <Reveal>
            <div className="eyebrow eyebrow-center"><div className="eyebrow-line" /><span className="eyebrow-text">WORTH. BUILT.</span><div className="eyebrow-line" /></div>
            <h2 className="section-title">Take the taster.<br /><em>See your first signal.</em></h2>
            <div className="page-hero-actions eyebrow-center">
              <a href="/valu/assessment/" className="btn-gold">TAKE THE VALU TASTER</a>
              <a href="/valu" className="btn-outline">HOW VALU WORKS</a>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  )
}
