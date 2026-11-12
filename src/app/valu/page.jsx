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
          <p className="valu-lede">The VALU Index Taster introduces the PRIME framework and gives you an initial view of your professional capability. Create and confirm your Valoria account first, then complete the separate Taster with your responses saved to your account. Continue from your dashboard to the separate full VALU Index for your official points result and PRIME profile.</p>
          <div className="valu-actions">
            <AssessmentStartLink href="/valu/register/" className="valu-btn valu-btn-gold">START THE VALU INDEX TASTER <span>→</span></AssessmentStartLink>
            <a href="#how-it-works" className="valu-btn valu-btn-ghost">HOW THE VALU INDEX SUPPORTS YOUR GROWTH <span>↓</span></a>
          </div>
          <div className="valu-meta"><span>VALU INDEX TASTER</span><i>·</i><span>FULL VALU INDEX</span><i>·</i><span>5 PRIME DIMENSIONS</span></div>
        </div>
      </section>

      <section className="valu-intro" id="how-it-works">
        <div className="valu-wrap valu-two">
          <div><div className="valu-kicker valu-dark"><span /> WHY THE VALU INDEX</div><h2>Professional capability is bigger than a job title.</h2></div>
          <div><p>Experience tells part of the story. The VALU Index creates a structured way to understand how you currently show up across the professional dimensions that influence development, visibility and opportunity.</p><p>It connects professional assessment to a practical next step: build a credible record, strengthen your capabilities and become discoverable for relevant opportunities.</p></div>
        </div>
      </section>

      <section className="valu-process">
        <div className="valu-wrap">
          <div className="valu-kicker"><span /> A CLEAR PROFESSIONAL STARTING POINT</div>
          <h2>A clear starting point.<br /><em>A fuller professional picture.</em></h2>
          <div className="valu-steps">
            <article><b>01</b><h3>Create and confirm your account</h3><p>Set up your Valoria account and confirm your email before beginning. Your account protects your saved Taster journey.</p></article>
            <article><b>02</b><h3>Complete your guided Taster</h3><p>Begin with a free, guided view of your professional capability. Your responses are saved to your confirmed account.</p></article>
            <article><b>03</b><h3>Continue to your dashboard</h3><p>Your completed Taster is connected to your account. Continue from your dashboard to the separate full VALU Index.</p></article>
            <article><b>04</b><h3>Complete the full VALU Index</h3><p>The full VALU Index covers all 17 PRIME skills. Completion establishes your official VALU Index in points and your earned designation. Results remain valid for 12 months.</p></article>
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
          <div><div className="valu-kicker valu-dark"><span /> WHAT THE FULL VALU INDEX ESTABLISHES</div><h2>Move from a directional taster to an official professional record.</h2></div>
          <div><p>The taster offers an initial perspective on your professional capability. Your official VALU Index is established when you complete the full VALU Index.</p><p>The full VALU Index covers all 17 PRIME skills across Presence, Relationships, Intelligence, Mastery and Enterprise. It establishes your official points result and PRIME profile, with a 12-month validity period. Your professional profile and marketplace access then reflect your completed VALU Index and the applicable eligibility requirements.</p><AssessmentStartLink href="/valu/register/" className="valu-inline">START THE VALU INDEX TASTER →</AssessmentStartLink></div>
        </div>
      </section>

      <section className="valu-final"><div className="valu-wrap"><div className="valu-kicker"><span /> {BRAND.tagline.toUpperCase()}</div><h2>Start with a clearer view<br /><em>of your capability.</em></h2><AssessmentStartLink href="/valu/register/" className="valu-btn valu-btn-gold">START THE VALU INDEX TASTER <span>→</span></AssessmentStartLink></div></section>
    </main>
    <Footer />
  </>
}
