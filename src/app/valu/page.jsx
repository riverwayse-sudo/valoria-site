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
          <h1>Make your capability<br /><em>visible and actionable.</em></h1>
          <p className="valu-lede">The VALU Index gives professionals a structured view of capability across the 17 skills in PRIME. Begin with a short, guided taster, then continue to the formal assessment when you are ready to establish your official VALU Index in points.</p>
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
          <div className="valu-kicker"><span /> A CLEAR PROFESSIONAL STARTING POINT</div>
          <h2>A clear starting point.<br /><em>A fuller professional picture.</em></h2>
          <div className="valu-steps">
            <article><b>01</b><h3>Begin with insight</h3><p>Start with a short, guided reflection that introduces the PRIME framework and gives you an initial perspective on your professional capability.</p></article>
            <article><b>02</b><h3>Build your professional record</h3><p>Create your account and develop a professional profile that brings your experience, expertise and ambitions into context.</p></article>
            <article><b>03</b><h3>Complete your assessment</h3><p>Continue to the formal assessment when you are ready. Your progress is preserved, so you can return and complete it without losing your place.</p></article>
            <article><b>04</b><h3>Make capability visible</h3><p>Your completed assessment establishes your official VALU Index in points and informs the next steps in your professional development and visibility.</p></article>
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
          <div><div className="valu-kicker valu-dark"><span /> WHAT THE FULL ASSESSMENT ADDS</div><h2>Move from a directional snapshot to an official professional record.</h2></div>
          <div><p>The taster is a free starting point, not an official score. The official VALU Index is established only after completing the separate full assessment.</p><p>Your completed full assessment establishes your official VALU Index and PRIME results in points, with a 12-month validity period. Your professional profile and marketplace access then reflect your completed assessment and the applicable eligibility requirements.</p><AssessmentStartLink href={BRAND.assessmentUrl} className="valu-inline">START THE VALU TASTER →</AssessmentStartLink></div>
        </div>
      </section>

      <section className="valu-final"><div className="valu-wrap"><div className="valu-kicker"><span /> WORTH. BUILT.</div><h2>Start with a clearer view<br /><em>of your capability.</em></h2><AssessmentStartLink href={BRAND.assessmentUrl} className="valu-btn valu-btn-gold">START THE VALU TASTER <span>→</span></AssessmentStartLink></div></section>
    </main>
    <Footer />
  </>
}
