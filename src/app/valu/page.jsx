import Nav, { AssessmentStartLink } from '@/components/Nav'
import Footer from '@/components/Footer'
import { BRAND } from '@/lib/brand'

export const metadata = {
  title: 'VALU Index | Valoria Institute',
  description: 'Understand your professional capability through the VALU Index and the five dimensions of PRIME.',
  alternates: { canonical: 'https://valoriainstitute.com/valu' },
}

const dimensions = [
  ['P', 'Presence', 'How you show up with clarity, credibility and professional presence.'],
  ['R', 'Relationships', 'How effectively you build trust, collaborate and create value through professional relationships.'],
  ['I', 'Intelligence', 'How you think, interpret complexity and exercise sound professional judgement.'],
  ['M', 'Mastery', 'How consistently you deliver, deepen capability and maintain professional standards.'],
  ['E', 'Enterprise', 'How you create value, recognise opportunity and think beyond the immediate task.'],
]

export default function ValuPage() {
  return <>
    <Nav />
    <main className="valu-page">
      <section className="valu-hero">
        <div className="valu-wrap">
          <div className="valu-kicker"><span /> THE VALU INDEX</div>
          <h1>Make your capability<br /><em>visible and actionable.</em></h1>
          <p className="valu-lede">The VALU Index gives professionals a structured view of capability across the five dimensions of PRIME. Start with a short directional snapshot, then complete your full assessment to establish your official VALU Index.</p>
          <div className="valu-actions">
            <AssessmentStartLink href={BRAND.assessmentUrl} className="valu-btn valu-btn-gold">START THE VALU TASTER <span>→</span></AssessmentStartLink>
            <a href="#how-it-works" className="valu-btn valu-btn-ghost">UNDERSTAND THE TWO ASSESSMENTS <span>↓</span></a>
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
          <div className="valu-kicker"><span /> TWO DISTINCT ASSESSMENTS</div>
          <h2>A clear starting point.<br /><em>A fuller professional picture.</em></h2>
          <div className="valu-steps">
            <article><b>01</b><h3>VALU taster</h3><p>A standalone, free directional snapshot. It introduces the PRIME dimensions and helps you understand where to focus next.</p></article>
            <article><b>02</b><h3>Create your account</h3><p>Save your journey and enter your Valoria dashboard. Your account keeps your professional record and next steps together.</p></article>
            <article><b>03</b><h3>full assessment</h3><p>A comprehensive assessment that establishes your official VALU Index and PRIME results in points.</p></article>
            <article><b>04</b><h3>Build visibility</h3><p>Complete your professional profile. Marketplace discoverability and capability eligibility follow the applicable assessment and governance rules.</p></article>
          </div>
        </div>
      </section>

      <section className="valu-prime">
        <div className="valu-wrap">
          <div className="valu-prime-head"><div><div className="valu-kicker"><span /> THE PRIME FRAMEWORK</div><h2>Five dimensions.<br /><em>One professional picture.</em></h2></div><p>PRIME provides the framework through which Valoria interprets professional readiness, capability and development.</p></div>
          <div className="valu-dimensions">{dimensions.map(([letter,title,text]) => <article key={letter}><div className="valu-letter">{letter}</div><h3>{title}</h3><p>{text}</p></article>)}</div>
        </div>
      </section>

      <section className="valu-outcome">
        <div className="valu-wrap valu-outcome-grid">
          <div><div className="valu-kicker valu-dark"><span /> WHAT THE FULL ASSESSMENT ADDS</div><h2>Move from a directional snapshot to an official professional record.</h2></div>
          <div><p>The VALU taster offers a directional starting point. Your official VALU Index is established after completing the full assessment.</p><p>Your completed full assessment establishes your official VALU Index and PRIME dimension results in points. Your professional profile and marketplace access then reflect your completed assessment and the applicable eligibility requirements.</p><AssessmentStartLink href={BRAND.assessmentUrl} className="valu-inline">START THE VALU TASTER →</AssessmentStartLink></div>
        </div>
      </section>

      <section className="valu-final"><div className="valu-wrap"><div className="valu-kicker"><span /> WORTH. BUILT.</div><h2>Start with a clearer view<br /><em>of your capability.</em></h2><AssessmentStartLink href={BRAND.assessmentUrl} className="valu-btn valu-btn-gold">START THE VALU TASTER <span>→</span></AssessmentStartLink></div></section>
    </main>
    <Footer />
  </>
}
