import Link from 'next/link'
import Nav, { AssessmentStartLink } from '@/components/Nav'
import Footer from '@/components/Footer'
import { BRAND } from '@/lib/brand'

export const metadata = {
  title: 'Start Your VALU Index — Valoria Institute',
  description: 'Take the VALU Index and get a clearer starting point for understanding your professional capability through PRIME.',
}

const dimensions = [
  ['P', 'Presence'],
  ['R', 'Relationships'],
  ['I', 'Intelligence'],
  ['M', 'Mastery'],
  ['E', 'Enterprise'],
]

const faqs = [
  ['How does it work?', 'Valoria has two separate assessment stages. Complete the 9-question taster first. If you choose to continue, create your account and complete the separate 58-question full VALU assessment, starting at Question 1.'],
  ['Do I need an account first?', 'No account is needed for the 9-question taster. An account is required before you start the separate 58-question full assessment.'],
  ['Who is it for?', 'It is designed for African professionals who want a clearer view of their current professional capability and a stronger foundation for development, visibility and opportunity.'],
  ['Is it free?', 'Yes. The VALU Index is free to take. It is the entry point into the wider Valoria professional ecosystem.'],
  ['Does the result define me?', 'No. Your VALU Index is directional, not a permanent label. It gives you a starting point for understanding where you are and deciding what to build next.'],
  ['What happens after the full assessment?', 'Complete your professional profile and choose whether it can be publicly visible. Discoverability depends on consent, verification and Valoria’s applicable listing requirements.'],
  ['Can I pause part-way through?', 'Yes. Progress in the full 58-question assessment is saved independently. Return to your dashboard to resume the full assessment at your saved position. Taster answers are stored separately.'],
]

export default function ValuStartPage() {
  const assessmentUrl = BRAND.assessmentUrl

  return <>
    
    <Nav />
    <main className="valu-start">
      <section className="vs-hero" style={{ paddingBlock: "clamp(2rem, 4.5vw, 3.75rem)" }}>
        <div className="vs-shell">
          <div className="vs-kicker"><span /> THE VALU INDEX</div>
          <div className="vs-hero-grid" style={{ alignItems: "center", gap: "clamp(1.75rem, 4vw, 4rem)" }}>
            <div>
              <h1 style={{ maxWidth: "12.5ch", fontSize: "clamp(1.85rem, 3.1vw, 3.1rem)", lineHeight: 1.12, letterSpacing: "-0.045em", marginBlock: "0 1.1rem" }}>Your CV tells people what you’ve done.<br /><em>VALU shows what you can become.</em></h1>
              <p className="vs-lede">A professional diagnostic built around PRIME to give you a clearer starting point for understanding your capability, direction and professional presence.</p>
              <div className="vs-actions">
                <AssessmentStartLink href={assessmentUrl} className="vs-btn vs-primary">TAKE THE 9-QUESTION TASTER <b>→</b></AssessmentStartLink>
                <a href="#how" className="vs-btn vs-secondary">SEE HOW IT WORKS <b>↓</b></a>
              </div>
              <div className="vs-proof"><span>9-QUESTION TASTER</span><i>·</i><span>FREE</span><i>·</i><span>BUILT AROUND PRIME</span></div>
            </div>
            <div className="vs-score" style={{ borderRadius: "22px", overflow: "hidden", minWidth: 0 }} aria-label="Illustrative full VALU Index result in points">
              <div className="vs-score-top"><span>VALU INDEX</span><span>01</span></div>
              <div className="vs-ring"><strong>74</strong><small>POINTS</small></div>
              <div className="vs-bars">{dimensions.map(([letter, title], i) => <div key={letter} className="vs-bar"><span>{letter}</span><div><i className={`vs-bar-fill score-${i + 1}`} /></div><b>{title}</b></div>)}</div>
              <p>Illustrative full VALU Index result</p>
            </div>
          </div>
        </div>
      </section>

      <section className="vs-light" id="how">
        <div className="vs-shell">
          <div className="vs-split">
            <div><div className="vs-kicker dark"><span /> WHY VALU</div><h2>The professional picture is bigger than your job title.</h2></div>
            <div className="vs-copy"><p>A CV records experience. A title records position. Neither gives you a structured view of the professional capabilities behind them.</p><p>VALU gives you a different starting point: a directional view of how you currently show up across five dimensions that shape professional growth, visibility and opportunity.</p></div>
          </div>
          <div className="vs-problems">
            <article><b>01</b><h3>Experience is not the whole story.</h3><p>What you have done matters. So does how you operate, influence, relate and create value.</p></article>
            <article><b>02</b><h3>Visibility needs better signals.</h3><p>Professionals need more than a list of roles to communicate what they can contribute next.</p></article>
            <article><b>03</b><h3>Development starts with clarity.</h3><p>You cannot deliberately build what you have not first understood.</p></article>
          </div>
        </div>
      </section>

      <section className="vs-dark-section">
        <div className="vs-shell">
          <div className="vs-kicker"><span /> WHAT VALU MEASURES</div>
          <div className="vs-heading-row"><h2>Five dimensions.<br /><em>One professional picture.</em></h2><p>PRIME is the capability architecture behind the VALU Index. The assessment turns the framework into a practical starting point for your professional journey.</p></div>
          <div className="vs-prime-line">{dimensions.map(([letter, title]) => <article key={letter}><span>{letter}</span><h3>{title}</h3><i /></article>)}</div>
        </div>
      </section>

      <section className="vs-light vs-journey">
        <div className="vs-shell">
          <div className="vs-kicker dark"><span /> HOW IT WORKS</div>
          <h2>Taster. Account. Full assessment.<br /><em>Then become discoverable.</em></h2>
          <div className="vs-journey-grid">
            <article><span>01</span><h3>Start</h3><p>Complete the separate 9-question taster. No account is needed.</p></article>
            <article><span>02</span><h3>Create your account</h3><p>Create your account and confirm your email. Your taster remains a separate snapshot.</p></article>
            <article><span>03</span><h3>Complete the full assessment</h3><p>Start the separate 58-question full VALU Index at Question 1. Receive your official result in points across the five PRIME dimensions.</p></article>
            <article><span>04</span><h3>Discover</h3><p>Subject to governance checks, become discoverable through the marketplace.</p></article>
          </div>
        </div>
      </section>

      <section className="vs-result">
        <div className="vs-shell">
          <div className="vs-result-grid">
            <div><div className="vs-kicker"><span /> YOUR RESULT</div><h2>Two separate assessments.<br /><em>One connected journey.</em></h2></div>
            <div className="vs-result-copy"><p>The 9-question taster is separate from the 58-question full VALU assessment. Taster answers are not included in the full assessment and do not reduce its question count. After the taster, create your account and start the full assessment at Question 1. Your full-assessment progress is saved independently and can be resumed from your dashboard.</p><ul><li><b>VALU Index</b><span>Your official result in points</span></li><li><b>PRIME profile</b><span>A view across five capability dimensions</span></li><li><b>Next pathway</b><span>A clearer basis for what to build next</span></li></ul></div>
          </div>
        </div>
      </section>

      <section className="vs-light vs-next">
        <div className="vs-shell">
          <div className="vs-next-grid">
            <div><div className="vs-kicker dark"><span /> AFTER VALU</div><h2>The full assessment opens a much bigger professional journey.</h2></div>
            <div className="vs-copy"><p>Once you complete the full VALU assessment, you create your professional profile. From there, Valoria connects capability with professional visibility and opportunity.</p><div className="vs-next-list"><div><b>01</b><span>Complete your professional profile</span></div><div><b>02</b><span>Make your capabilities discoverable</span></div><div><b>03</b><span>Explore deeper assessment and development pathways</span></div></div></div>
          </div>
        </div>
      </section>

      <section className="vs-faq">
        <div className="vs-shell">
          <div className="vs-kicker"><span /> QUESTIONS</div><h2>Before you begin.</h2>
          <div className="vs-faq-grid">{faqs.map(([q, a]) => <details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div>
        </div>
      </section>

      <section className="vs-final">
        <div className="vs-shell"><div className="vs-kicker"><span /> WORTH. BUILT.</div><h2>Your capability deserves<br /><em>more than a CV.</em></h2><p>Start with a clearer understanding of where you stand.</p><AssessmentStartLink href={assessmentUrl} className="vs-btn vs-primary">TAKE THE 9-QUESTION TASTER <b>→</b></AssessmentStartLink><Link href="/valu" className="vs-back">Learn more about VALU →</Link></div>
      </section>
    </main>
    <Footer />
  </>
}
