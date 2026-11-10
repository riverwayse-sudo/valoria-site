import Nav, { AssessmentStartLink } from '@/components/Nav'
import Footer from '@/components/Footer'
import { BRAND, PRIME_CLUSTERS } from '@/lib/brand'

export const metadata = {
  title: 'VALU Index | Valoria Institute',
  description: 'Understand your professional capability through the VALU Index and the five dimensions of PRIME.',
  alternates: { canonical: 'https://valoriainstitute.com/valu' },
}

const dimensions = PRIME_CLUSTERS

export default function ValuPage() {
  return <>
    <Nav />
    <main className="valu-page">
      <section className="valu-hero">
        <div className="valu-wrap">
          <div className="valu-kicker"><span /> THE VALU INDEX</div>
          <h1>Know where you stand,<br /><em>in points.</em></h1>
          <p className="valu-lede">Begin with a short VALU Taster to gain an initial view of your professional capability. Create your Valoria account to continue to the separate full assessment and receive your official points-based VALU Index.</p>
          <div className="valu-actions">
            <AssessmentStartLink href={BRAND.assessmentUrl} className="valu-btn valu-btn-gold">START THE VALU TASTER <span>→</span></AssessmentStartLink>
            <a href="#how-it-works" className="valu-btn valu-btn-ghost">HOW VALU SUPPORTS YOUR GROWTH <span>↓</span></a>
          </div>
          <div className="valu-meta"><span>VALU TASTER</span><i>·</i><span>FULL ASSESSMENT</span><i>·</i><span>5 PRIME DIMENSIONS</span></div>
        </div>
      </section>

      <section className="valu-intro" id="how-it-works">
        <div className="valu-wrap valu-two">
          <div><div className="valu-kicker valu-dark"><span /> WHY VALU</div><h2>Professional capability is bigger than a job title.</h2></div>
          <div><p>Experience tells part of the story. The VALU Index creates a structured way to understand how you currently show up across the professional dimensions that influence development, visibility and opportunity.</p><p>It connects professional assessment to a practical next step: build a credible record, strengthen your capabilities and become discoverable for relevant opportunities.</p></div>
        </div>
      </section>

      <section className="valu-process">
        <div className="valu-wrap">
          <div className="valu-kicker"><span /> HOW IT WORKS</div>
          <h2>Start with insight.<br /><em>Continue with evidence.</em></h2>
          <div className="valu-steps">
            <article><b>01</b><h3>Begin with the taster</h3><p>Start with nine questions across four Intelligence skills. No Valoria account is required for the taster; it gives you an initial signal and a clear next step.</p></article>
            <article><b>02</b><h3>Continue with the full assessment</h3><p>Create or confirm your Valoria account, then complete the separate 58-question full assessment: 54 scored questions and four validity checks. Allow 15 to 20 minutes. Your progress is saved so you can return and continue.</p></article>
            <article><b>03</b><h3>Receive your VALU Index</h3><p>Once the full assessment is complete, receive your official points-based VALU Index across all five PRIME clusters, your results and earned designation. Results remain valid for 12 months.</p></article>
          </div>
        </div>
      </section>

      <section className="valu-prime">
        <div className="valu-wrap">
          <div className="valu-prime-head"><div><div className="valu-kicker"><span /> THE PRIME FRAMEWORK</div><h2>Five dimensions.<br /><em>One professional picture.</em></h2></div><p>PRIME provides the framework through which Valoria interprets professional readiness, capability and development.</p></div>
          <div className="valu-dimensions">{dimensions.map((cluster) => <article key={cluster.letter}><div className="valu-letter">{cluster.letter}</div><h3>{cluster.name}</h3><p>{cluster.subtitle}</p><p><strong>Skills:</strong> {cluster.skills.join(' · ')}</p></article>)}</div>
        </div>
      </section>

      <section className="valu-outcome">
        <div className="valu-wrap valu-outcome-grid">
          <div><div className="valu-kicker valu-dark"><span /> WHAT THE FULL ASSESSMENT ADDS</div><h2>Move from a directional taster to an official professional record.</h2></div>
          <div><p>The taster offers an initial perspective on your professional capability. Your official VALU Index is established when you complete the assessment journey.</p><p>The formal assessment covers all 17 PRIME skills across Presence, Relationships, Intelligence, Mastery and Enterprise. It establishes your official VALU Index and PRIME results in points, with a 12-month validity period. Your professional profile and marketplace access then reflect your completed assessment and the applicable eligibility requirements.</p><AssessmentStartLink href={BRAND.assessmentUrl} className="valu-inline">START THE VALU TASTER →</AssessmentStartLink></div>
        </div>
      </section>

      <section className="valu-final"><div className="valu-wrap"><div className="valu-kicker"><span /> {BRAND.tagline.toUpperCase()}</div><h2>Start with a clearer view<br /><em>of your capability.</em></h2><AssessmentStartLink href={BRAND.assessmentUrl} className="valu-btn valu-btn-gold">START THE VALU TASTER <span>→</span></AssessmentStartLink></div></section>
    </main>
    <Footer />
  </>
}
