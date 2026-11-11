import Nav, { AssessmentStartLink } from '@/components/Nav'
import Footer from '@/components/Footer'
import { BRAND, PRIME_CLUSTERS } from '@/lib/brand'

export const metadata = {
  title: 'VALU Index | Valoria Institute',
  description: 'A structured assessment of professional capability for accomplished professionals and the institutions that make consequential talent decisions.',
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
          <h1>Understand your capability.<br /><em>With greater precision.</em></h1>
          <p className="valu-lede">Begin with the VALU Taster for an initial view of your professional capability. Create your Valoria account to continue to the separate full assessment and receive your official points-based VALU Index.</p>
          <div className="valu-actions">
            <AssessmentStartLink href={BRAND.assessmentUrl} className="valu-btn valu-btn-gold">START THE VALU TASTER <span>→</span></AssessmentStartLink>
            <a href="#how-it-works" className="valu-btn valu-btn-ghost">HOW VALU SUPPORTS YOUR GROWTH <span>↓</span></a>
          </div>
          <div className="valu-meta"><span>VALU TASTER</span><i>·</i><span>FULL ASSESSMENT</span><i>·</i><span>5 PRIME DIMENSIONS</span></div>
        </div>
      </section>

      <section className="valu-intro" id="how-it-works">
        <div className="valu-wrap valu-two">
          <div><div className="valu-kicker valu-dark"><span /> WHY VALU</div><h2>Capability extends beyond a job title.</h2></div>
          <div><p>Experience tells part of the story. VALU provides a structured assessment of professional capability across the five dimensions of PRIME, giving accomplished professionals a clearer basis for reflection and development.</p><p>It connects assessment insight to deliberate development and, where applicable, professional discovery. It is designed to inform decisions—not to replace professional judgment or independent verification.</p></div>
        </div>
      </section>

      <section className="valu-process">
        <div className="valu-wrap">
          <div className="valu-kicker"><span /> HOW IT WORKS</div>
          <h2>Start with insight.<br /><em>Develop with intent.</em></h2>
          <div className="valu-steps">
            <article><b>01</b><h3>Begin with the taster</h3><p>Begin with the VALU Taster. It offers an initial, directional view of capability and a clear next step. No Valoria account is required to begin.</p></article>
            <article><b>02</b><h3>Continue with the full assessment</h3><p>Create or confirm your Valoria account, then complete the separate full assessment. Your progress is saved, so you can return and continue.</p></article>
            <article><b>03</b><h3>Receive your VALU Index</h3><p>Once the full assessment is complete, receive your official points-based VALU Index across all five PRIME dimensions, your results and earned designation.</p></article>
          </div>
        </div>
      </section>

      <section className="valu-prime">
        <div className="valu-wrap">
          <div className="valu-prime-head"><div><div className="valu-kicker"><span /> THE PRIME FRAMEWORK</div><h2>Five dimensions.<br /><em>One professional picture.</em></h2></div><p>PRIME provides the framework through which Valoria interprets professional readiness, capability and development.</p></div>
          <div className="valu-dimensions">{dimensions.map((cluster) => <article key={cluster.letter}><div className="valu-letter">{cluster.letter}</div><h3>{cluster.name}</h3><p>{cluster.letter === 'E' ? 'How you create. Enterprise measures the capacity to generate value beyond a task — through commercial thinking, creative problem-solving, and the ability to influence and collaborate in new ways.' : cluster.subtitle}</p><p><strong>Skills:</strong> {cluster.skills.map((skill, index) => <span key={skill}>{skill}{['AI Fluency', 'Human-AI Collaboration'].includes(skill) ? ' ★' : ''}{index < cluster.skills.length - 1 ? ' · ' : ''}</span>)}</p></article>)}</div>
          <p className="valu-future-note">★ Future-Ready skill — critical for the professional talent market of 2025 to 2035.</p>
        </div>
      </section>

      <section className="valu-outcome">
        <div className="valu-wrap valu-outcome-grid">
          <div><div className="valu-kicker valu-dark"><span /> WHAT THE FULL ASSESSMENT ADDS</div><h2>Move from an initial signal to a considered assessment.</h2></div>
          <div><p>The taster offers an initial perspective on your professional capability. It is separate from the full assessment. Your official VALU Index is established only when you complete the full assessment.</p><p>The full assessment evaluates all 17 PRIME skills across Presence, Relationships, Intelligence, Mastery and Enterprise. It establishes your official VALU Index and PRIME results in points. Your professional profile and Registry access then reflect your completed assessment and the applicable eligibility requirements.</p><AssessmentStartLink href={BRAND.assessmentUrl} className="valu-inline">START THE VALU TASTER →</AssessmentStartLink></div>
        </div>
      </section>

      <section className="valu-outcome">
        <div className="valu-wrap valu-outcome-grid">
          <div><div className="valu-kicker valu-dark"><span /> WHAT VALU IS — AND IS NOT</div><h2>An assessment result, <em>not a credential.</em></h2></div>
          <div><p>Your designation is earned through the full assessment. It is not a professional certification, subscription tier or purchasable badge. The VALU Index does not independently verify qualifications, work history or professional competence.</p><p>A result below the listing threshold does not remove access to Valoria. It identifies development as the next step.</p></div>
        </div>
      </section>

      <section className="valu-final"><div className="valu-wrap"><div className="valu-kicker"><span /> {BRAND.tagline.toUpperCase()}</div><h2>Make capability clearer.<br /><em>Build what comes next.</em></h2><AssessmentStartLink href={BRAND.assessmentUrl} className="valu-btn valu-btn-gold">START THE VALU TASTER <span>→</span></AssessmentStartLink></div></section>
    </main>
    <Footer />
  </>
}
