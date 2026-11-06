import Link from 'next/link'
import Nav, { AssessmentStartLink } from '@/components/Nav'
import Footer from '@/components/Footer'
import { BRAND } from '@/lib/brand'

export const metadata = {
  title: 'Start the VALU Taster — Valoria Institute',
  description: 'Begin with a separate 9-question VALU taster. Then complete the independent 58-question formal assessment to receive your official VALU Index and PRIME points.',
}

const dimensions = [
  ['P', 'Presence'],
  ['R', 'Relationships'],
  ['I', 'Intelligence'],
  ['M', 'Mastery'],
  ['E', 'Enterprise'],
]

const faqs = [
  ['How does it work?', 'The VALU journey has two distinct instruments: a 9-question directional taster and a separate 58-question formal assessment. Taster responses are not included in formal assessment answers or scoring. After account confirmation, the formal assessment begins at Question 1.'],
  ['Do I need an account first?', 'No. Start with the 9-question taster first. Create or confirm your account before beginning the separate 58-question formal assessment.'],
  ['Who is it for?', 'It is designed for professionals across industries and markets—including leaders, speakers, facilitators, event organisers and organisations—who want credible insight, visibility and access to opportunity.'],
  ['Is it free?', 'Yes. The 9-question taster and the separate 58-question formal assessment are free to take. The wider Valoria ecosystem connects insight to development, visibility and opportunity.'],
  ['Does the result define me?', 'No. The taster is directional, not an official score or permanent label. Your official VALU Index is produced only after completing the separate 58-question formal assessment.'],
  ['What happens after I finish?', 'You create your professional account, complete your profile and, subject to Valoria’s normal governance checks, become discoverable through the professional marketplace.'],
  ['Can I pause part-way through?', 'Yes. Taster responses are saved separately. Progress in the formal 58-question assessment is also saved and can be resumed independently without restarting.'],
]

export default function ValuStartPage() {
  const assessmentUrl = BRAND.assessmentUrl

  return <>
    
    <Nav />
    <main className="valu-start">
      <section className="vs-hero" style={{ paddingBlock: "clamp(2rem, 4.5vw, 3.75rem)" }}>
        <div className="vs-shell">
          <div className="vs-kicker"><span /> THE VALU TASTER</div>
          <div className="vs-hero-grid" style={{ alignItems: "center", gap: "clamp(1.75rem, 4vw, 4rem)" }}>
            <div>
              <h1 style={{ maxWidth: "12.5ch", fontSize: "clamp(1.85rem, 3.1vw, 3.1rem)", lineHeight: 1.12, letterSpacing: "-0.045em", marginBlock: "0 1.1rem" }}>Your CV tells people what you’ve done.<br /><em>VALU shows what you can become.</em></h1>
              <p className="vs-lede">A professional diagnostic built around PRIME to give you a clearer starting point for understanding your capability, direction and professional presence.</p>
              <div className="vs-actions">
                <AssessmentStartLink href={assessmentUrl} className="vs-btn vs-primary">START THE 9-QUESTION TASTER <b>→</b></AssessmentStartLink>
                <a href="#how" className="vs-btn vs-secondary">SEE HOW IT WORKS <b>↓</b></a>
              </div>
              <div className="vs-proof"><span>9 QUESTIONS</span><i>·</i><span>FREE</span><i>·</i><span>BUILT AROUND PRIME</span></div>
            </div>
            <div className="vs-score" style={{ borderRadius: "22px", overflow: "hidden", minWidth: 0 }} aria-label="Illustrative VALU Index result">
              <div className="vs-score-top"><span>VALU INDEX</span><span>01</span></div>
              <div className="vs-ring"><strong>74</strong><small>INDEX</small></div>
              <div className="vs-bars">{dimensions.map(([letter, title], i) => <div key={letter} className="vs-bar"><span>{letter}</span><div><i className={`vs-bar-fill score-${i + 1}`} /></div><b>{title}</b></div>)}</div>
              <p>Illustrative result view</p>
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
          <h2>Start. Continue. Understand.<br /><em>Then become discoverable.</em></h2>
          <div className="vs-journey-grid">
            <article><span>01</span><h3>Start</h3><p>Answer nine separate taster questions for a directional starting point. No account needed.</p></article>
            <article><span>02</span><h3>Continue</h3><p>Create or confirm your account, then begin the separate 58-question formal assessment at Question 1.</p></article>
            <article><span>03</span><h3>Understand</h3><p>Complete all 58 formal questions to receive your official VALU Index in points and your PRIME capability profile.</p></article>
            <article><span>04</span><h3>Discover</h3><p>Subject to governance checks, become discoverable through the marketplace.</p></article>
          </div>
        </div>
      </section>

      <section className="vs-result">
        <div className="vs-shell">
          <div className="vs-result-grid">
            <div><div className="vs-kicker"><span /> YOUR RESULT</div><h2>A clear first signal.<br /><em>A complete formal picture.</em></h2></div>
            <div className="vs-result-copy"><p>The 9-question taster is a separate directional experience. The 58-question formal assessment begins at Question 1 after account confirmation. Completing the full assessment produces one official VALU Index in points.</p><ul><li><b>VALU Index</b><span>Your official result in points</span></li><li><b>PRIME profile</b><span>A view across five capability dimensions</span></li><li><b>Next pathway</b><span>A clearer basis for what to build next</span></li></ul></div>
          </div>
        </div>
      </section>

      <section className="vs-light vs-next">
        <div className="vs-shell">
          <div className="vs-next-grid">
            <div><div className="vs-kicker dark"><span /> AFTER VALU</div><h2>One assessment opens a much bigger professional journey.</h2></div>
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
        <div className="vs-shell"><div className="vs-kicker"><span /> WORTH. BUILT.</div><h2>Your capability deserves<br /><em>more than a CV.</em></h2><p>Start with the separate 9-question taster, then decide when to begin the formal assessment.</p><AssessmentStartLink href={assessmentUrl} className="vs-btn vs-primary">START THE 9-QUESTION TASTER <b>→</b></AssessmentStartLink><Link href="/valu" className="vs-back">Learn more about VALU →</Link></div>
      </section>
    </main>
    <Footer />
  </>
}
