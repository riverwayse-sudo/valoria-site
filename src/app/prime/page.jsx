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

const CLUSTER_COPY = {
  P: 'Presence is how you show up: communicate with clarity, negotiate with intention and make your professional value understood.',
  R: 'Relationships are how you connect: build trust, resolve conflict, develop people and manage stakeholders.',
  I: 'Intelligence is how you think: apply critical and strategic thinking, business judgement and AI fluency.',
  M: 'Mastery is how you deliver: take accountability, lead yourself through challenge and adapt your execution.',
  E: 'Enterprise is how you create: generate commercial value, influence without authority and collaborate with AI.',
}

const DESIGNATIONS = [
  { name: 'Force to Align With', range: '80–100 points', meaning: 'Operating at the highest expression of professional capability.' },
  { name: 'Emerging Force', range: '65–79 points', meaning: 'Strong assessed capability with clear cluster strengths.' },
  { name: 'Developing Professional', range: '50–64 points', meaning: 'Solid assessed baseline. Eligible for marketplace listing.' },
  { name: 'Building Foundations', range: '35–49 points', meaning: 'Early-stage capability. Development pathway recommended.' },
  { name: 'At the Starting Point', range: 'Below 35 points', meaning: 'Not yet listed. Development is the first step.' },
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
              <a href="/valu/assessment/" className="btn-outline">TAKE THE TASTER</a>
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
                    <p className="prime-body">{CLUSTER_COPY[cluster.letter]}</p>
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
              <p className="page-sub prime-centered-copy">The full VALU Index contains 58 questions: 54 scored questions and four validity checks. Results run from 0 to 100 points across the five PRIME clusters.</p>
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
            <p className="prime-copy">Designations are score-based. They cannot be purchased, upgraded by subscription, or transferred. A lower score points to a development pathway; it does not block access to the platform.</p>
          </div>
        </section>
        <section className="page-section alt cta-banner">
          <Reveal>
            <div className="eyebrow eyebrow-center"><div className="eyebrow-line" /><span className="eyebrow-text">WORTH. BUILT.</span><div className="eyebrow-line" /></div>
            <h2 className="section-title">Take the taster.<br /><em>See your first signal.</em></h2>
            <div className="page-hero-actions eyebrow-center">
              <a href="/valu/assessment/" className="btn-gold">TAKE THE 9-QUESTION TASTER</a>
              <a href="/valu" className="btn-outline">HOW VALU WORKS</a>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  )
}
