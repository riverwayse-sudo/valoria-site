import Link from 'next/link'
import Nav, { AssessmentStartLink } from '@/components/Nav'
import Footer from '@/components/Footer'
import { BRAND } from '@/lib/brand'

export const metadata = {
  title: 'Start the VALU Index Taster — Valoria Institute',
  description: 'Begin with the VALU Index Taster, then complete your full assessment to receive your official VALU Index and PRIME points.',
}

const dimensions = [
  ['P', 'Presence'],
  ['R', 'Relationships'],
  ['I', 'Intelligence'],
  ['M', 'Mastery'],
  ['E', 'Enterprise'],
]

const faqs = [
  ['How does it work?', 'Start with the VALU Index Taster, then complete the separate full assessment. Your official VALU Index and PRIME points are generated from the completed full assessment.'],
  ['Do I need an account first?', 'You do not need to create a Valoria account before starting. We will ask for a few details to save your taster progress. After you finish, you can create or connect your Valoria account and continue your professional journey.'],
  ['Who is it for?', 'It is designed for professionals across industries—including leaders, speakers, facilitators, event organisers and organisations—who want credible insight into their capabilities and a stronger professional presence.'],
    ['Does the result define me?', 'No. The taster is directional, not an official score or permanent label. Your official VALU Index is produced after completing your full assessment.'],
  ['What happens after I finish?', 'After your taster, create or connect your Valoria account. You can then complete your professional profile and continue with the full assessment. Your official VALU Index and PRIME points are based on the completed full assessment. You remain in control of whether your profile is made public.'],
  ['Can I pause part-way through?', 'Yes. Your progress is saved as you go, and you can return to your dashboard to continue without restarting.'],
]

export default function ValuStartPage() {
  const assessmentUrl = BRAND.assessmentUrl

  return <>
    
    <Nav />
    <main className="valu-start">
      <section className="vs-hero" style={{ paddingBlock: "clamp(2rem, 4.5vw, 3.75rem)" }}>
        <div className="vs-shell">
          <div className="vs-kicker"><span /> THE VALU INDEX TASTER</div>
          <div className="vs-hero-grid" style={{ alignItems: "center", gap: "clamp(1.75rem, 4vw, 4rem)" }}>
            <div>
              <h1 style={{ maxWidth: "12.5ch", fontSize: "clamp(1.85rem, 3.1vw, 3.1rem)", lineHeight: 1.12, letterSpacing: "-0.045em", marginBlock: "0 1.1rem" }}>Your CV tells people what you’ve done.<br /><em>VALU shows what you can become.</em></h1>
              <p className="vs-lede">A professional diagnostic built around PRIME to give you a clearer starting point for understanding your capability, direction and professional presence.</p>
              <div className="vs-actions">
                <AssessmentStartLink href={assessmentUrl} className="vs-btn vs-primary">START THE VALU INDEX TASTER <b>→</b></AssessmentStartLink>
                <a href="#how" className="vs-btn vs-secondary">SEE HOW IT WORKS <b>↓</b></a>
              </div>
              <div className="vs-proof"><span>A QUICK START</span><i>·</i><span>BUILT AROUND PRIME</span></div>
            </div>
            <div className="vs-score" style={{ borderRadius: "22px", overflow: "hidden", minWidth: 0 }} aria-label="Illustrative VALU Index Taster">
              <div className="vs-score-top"><span>VALU INDEX TASTER</span><span>directional</span></div>
              <div className="vs-ring"><strong>5</strong><small>DIMENSIONS</small></div>
              <div className="vs-bars">{dimensions.map(([letter, title], i) => <div key={letter} className="vs-bar"><span>{letter}</span><div><i className={`vs-bar-fill score-${i + 1}`} /></div><b>{title}</b></div>)}</div>
              <p>Illustrative VALU Index Taster — not an official VALU Index result.</p>
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
          <h2>Start with your taster.<br /><em>Then build your next step.</em></h2>
          <div className="vs-journey-grid">
            <article><span>01</span><h3>Share a few details</h3><p>Add the basic details needed to save your taster progress. You can create your Valoria account after you finish.</p></article>
            <article><span>02</span><h3>Take your taster</h3><p>Complete the guided directional taster. Your responses are saved against your registration.</p></article>
            <article><span>03</span><h3>Create your account</h3><p>After the taster, create or connect your secure Valoria account and confirm your email.</p></article>
            <article><span>04</span><h3>Complete your full assessment</h3><p>Continue when you are ready to establish your official VALU Index in points and your PRIME capability profile.</p></article>
            <article><span>05</span><h3>Build and discover</h3><p>Complete your professional profile. Your profile is made public only when it meets Valoria's listing requirements and you choose to publish it.</p></article>
          </div>
        </div>
      </section>

      <section className="vs-result">
        <div className="vs-shell">
          <div className="vs-result-grid">
            <div><div className="vs-kicker"><span /> YOUR RESULT</div><h2>A clear first signal.<br /><em>A complete formal picture.</em></h2></div>
            <div className="vs-result-copy"><p>The taster offers a directional starting point. Completing your full assessment produces your official VALU Index in points.</p><ul><li><b>VALU Index</b><span>Your official result in points</span></li><li><b>PRIME profile</b><span>A view across five capability dimensions</span></li><li><b>Next pathway</b><span>A clearer basis for what to build next</span></li></ul></div>
          </div>
        </div>
      </section>

      <section className="vs-light vs-next">
        <div className="vs-shell">
          <div className="vs-next-grid">
            <div><div className="vs-kicker dark"><span /> AFTER VALU</div><h2>One assessment opens a much bigger professional journey.</h2></div>
            <div className="vs-copy"><p>After the taster, create or connect your secure account and complete your professional profile. Your official VALU Index follows the separate full assessment. Your profile is made public only when it meets Valoria's listing requirements and you choose to publish it.</p><div className="vs-next-list"><div><b>01</b><span>Complete your professional profile</span></div><div><b>02</b><span>Make your capabilities discoverable</span></div><div><b>03</b><span>Explore deeper assessment and development pathways</span></div></div></div>
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
        <div className="vs-shell"><div className="vs-kicker"><span /> WORTH. BUILT.</div><h2>Your capability deserves<br /><em>more than a CV.</em></h2><p>Start with the VALU Index Taster, then decide when to continue your full assessment.</p><AssessmentStartLink href={assessmentUrl} className="vs-btn vs-primary">START THE VALU INDEX TASTER <b>→</b></AssessmentStartLink><p className="vs-back">Already completed a taster? <Link href="/professional-signup/recover">Recover your saved taster</Link>.</p><Link href="/valu" className="vs-back">Learn more about VALU →</Link></div>
      </section>
    </main>
    <Footer />
  </>
}
