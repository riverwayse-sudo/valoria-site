import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { BRAND, PRIME_CLUSTERS } from '@/lib/brand'

export const metadata = {
  title: 'VALU Index',
  description: 'Start with the VALU taster, then continue with the VALU Index to understand your professional capability in points.',
  alternates: { canonical: 'https://valoriainstitute.com/valu' },
}

const dimensions = PRIME_CLUSTERS.map(({ letter, name, description, skills }) => [letter, name, description, skills])

export default function ValuPage() {
  return <>
    <Nav />
    <main className="valu-page">
      <section className="valu-hero">
        <div className="valu-wrap">
          <div className="valu-kicker"><span /> THE VALU INDEX</div>
          <h1>Know where you stand,<br /><em>in points.</em></h1>
          <p className="valu-lede">Begin with the VALU taster. If you choose to continue, complete the VALU Index. It measures capability across the five PRIME clusters and reports your results in points.</p>
          <div className="valu-actions">
            <a href={BRAND.assessmentUrl} className="valu-btn valu-btn-gold">TAKE THE VALU TASTER <span>→</span></a>
            <a href="#how-it-works" className="valu-btn valu-btn-ghost">HOW IT WORKS <span>↓</span></a>
          </div>
          <div className="valu-meta"><span>VALU TASTER</span><i>·</i><span>FULL VALU INDEX</span><i>·</i><span>POINTS-BASED</span></div>
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
            <article><b>01</b><h3>Take the taster</h3><p>Complete the VALU taster with no account required. It gives a first read on professional capability.</p></article>
            <article><b>02</b><h3>Create your account</h3><p>Choose to continue, create your Valoria account and confirm your email. Your responses are saved as you go.</p></article>
            <article><b>03</b><h3>Complete the full assessment</h3><p>Complete the VALU Index. It takes about 15 to 20 minutes, and your progress is saved.</p></article>
            <article><b>04</b><h3>Build your profile and get found</h3><p>Complete your professional profile and choose public visibility. Discoverability follows consent, verification and the applicable listing rules.</p></article>
          </div>
        </div>
      </section>

      <section className="valu-prime">
        <div className="valu-wrap">
          <div className="valu-prime-head"><div><div className="valu-kicker"><span /> THE PRIME FRAMEWORK</div><h2>Five dimensions.<br /><em>One professional picture.</em></h2></div><p>PRIME provides the framework through which Valoria interprets professional readiness and development.</p></div>
          <div className="valu-dimensions">{dimensions.map(([letter,title,text,skills]) => <article key={letter}><div className="valu-letter">{letter}</div><h3>{title}</h3><p>{text}</p><ul className="valu-skill-list">{skills.map(skill => <li key={skill}>{skill}{['AI Fluency','Human-AI Collaboration'].includes(skill) && <sup aria-label="Future-Ready skill"> ★</sup>}</li>)}</ul></article>)}</div>
          <p className="valu-future-ready-note">★ Future-Ready skill — critical for the professional talent market of 2025 to 2035.</p>
        </div>
      </section>

      <section className="valu-outcome">
        <div className="valu-wrap valu-outcome-grid">
          <div><div className="valu-kicker valu-dark"><span /> WHAT YOU DO NEXT</div><h2>Your result is a starting point, not a label.</h2></div>
          <div><p>The taster offers an initial directional read. The VALU Index establishes your official result in points across five PRIME clusters.</p><p>The full assessment produces your official VALU Index in points, a designation and a profile valid for 12 months. The VALU Index is not a badge you buy, a subscription tier or a score that repeated attempts can inflate. A lower score points to a development pathway; it does not block access to the platform.</p><a href={BRAND.assessmentUrl} className="valu-inline">TAKE THE VALU TASTER →</a></div>
        </div>
      </section>

      <section className="valu-final"><div className="valu-wrap"><div className="valu-kicker"><span /> WORTH. BUILT.</div><h2>Start by understanding<br /><em>where you stand.</em></h2><a href={BRAND.assessmentUrl} className="valu-btn valu-btn-gold">TAKE THE VALU TASTER <span>→</span></a></div></section>
    </main>
    <Footer />
  </>
}
