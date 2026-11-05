import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { BRAND } from '@/lib/brand'

export const metadata = {
  title: 'VALU Index',
  description: 'Start with a separate 9-question taster, then complete the full 58-question VALU Index to understand your professional capability in points.',
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
          <h1>Know where you stand,<br /><em>in points.</em></h1>
          <p className="valu-lede">Start with a separate 9-question taster. If you choose to continue, complete the full 58-question VALU Index: 54 scored questions and four validity checks. The full assessment measures capability across the five PRIME clusters and reports your results in points.</p>
          <div className="valu-actions">
            <a href={BRAND.assessmentUrl} className="valu-btn valu-btn-gold">TAKE THE 9-QUESTION TASTER <span>→</span></a>
            <a href="#how-it-works" className="valu-btn valu-btn-ghost">HOW IT WORKS <span>↓</span></a>
          </div>
          <div className="valu-meta"><span>9-QUESTION TASTER</span><i>·</i><span>SEPARATE 58-QUESTION FULL ASSESSMENT</span><i>·</i><span>POINTS-BASED</span></div>
        </div>
      </section>

      <section className="valu-intro" id="how-it-works">
        <div className="valu-wrap valu-two">
          <div><div className="valu-kicker valu-dark"><span /> WHY VALU</div><h2>Professional capability is bigger than a job title.</h2></div>
          <div><p>Experience tells part of the story. The VALU Index creates a structured view of how your capability shows up across the five PRIME clusters. The taster is a first step; the full assessment establishes your official VALU Index.</p><p>You do not need a perfect score to begin. The taster helps you decide whether to continue. Your full assessment produces a points score, a designation and a professional profile that remains valid for 12 months.</p></div>
        </div>
      </section>

      <section className="valu-process">
        <div className="valu-wrap">
          <div className="valu-kicker"><span /> THE JOURNEY</div>
          <h2>Four steps from<br /><em>assessment to opportunity.</em></h2>
          <div className="valu-steps">
            <article><b>01</b><h3>Take the taster</h3><p>Complete nine separate questions with no account required. The taster gives a first read on four Intelligence skills and introduces the other PRIME clusters.</p></article>
            <article><b>02</b><h3>Complete the full assessment</h3><p>Complete the separate 58-question VALU Index: 54 scored questions and four validity checks. It takes about 15 to 20 minutes and requires an account.</p></article>
            <article><b>03</b><h3>Build your profile</h3><p>Create your professional profile, add your declared capabilities and complete the required profile information.</p></article>
            <article><b>04</b><h3>Get found</h3><p>Public discoverability follows profile completeness, consent, verification and the applicable listing rules. Eligibility and actual discoverability are not the same state.</p></article>
          </div>
        </div>
      </section>

      <section className="valu-prime">
        <div className="valu-wrap">
          <div className="valu-prime-head"><div><div className="valu-kicker"><span /> THE PRIME FRAMEWORK</div><h2>Five dimensions.<br /><em>One professional picture.</em></h2></div><p>PRIME provides the framework through which Valoria interprets professional readiness and development.</p></div>
          <div className="valu-dimensions">{dimensions.map(([letter,title,text]) => <article key={letter}><div className="valu-letter">{letter}</div><h3>{title}</h3><p>{text}</p></article>)}</div>
        </div>
      </section>

      <section className="valu-outcome">
        <div className="valu-wrap valu-outcome-grid">
          <div><div className="valu-kicker valu-dark"><span /> WHAT YOU DO NEXT</div><h2>Your result is a starting point, not a label.</h2></div>
          <div><p>The 9-question taster is separate from the 58-question full assessment. The taster answers are not included in the full assessment and do not reduce its question count.</p><p>The full assessment produces your official VALU Index in points, a designation and a profile valid for 12 months. The VALU Index is not a badge you buy, a subscription tier or a score that repeated attempts can inflate. A lower score points to a development pathway; it does not block access to the platform.</p><a href={BRAND.assessmentUrl} className="valu-inline">TAKE THE 9-QUESTION TASTER →</a></div>
        </div>
      </section>

      <section className="valu-final"><div className="valu-wrap"><div className="valu-kicker"><span /> WORTH. BUILT.</div><h2>Start by understanding<br /><em>where you stand.</em></h2><a href={BRAND.assessmentUrl} className="valu-btn valu-btn-gold">TAKE THE 9-QUESTION TASTER <span>→</span></a></div></section>
    </main>
    <Footer />
  </>
}
