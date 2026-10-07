import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { BRAND } from '@/lib/brand'

export const metadata = {
  title: 'VALU Index — Valoria Institute',
  description: 'Understand where you stand as a professional through the VALU Index and the PRIME framework.',
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
          <h1>Where do you stand<br /><em>as a professional?</em></h1>
          <p className="valu-lede">The VALU Index is Valoria's professional readiness diagnostic. It gives you a structured starting point for understanding your professional profile across the five dimensions of PRIME.</p>
          <div className="valu-actions">
            <a href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer" className="valu-btn valu-btn-gold">TAKE THE VALU INDEX <span>→</span></a>
            <a href="#how-it-works" className="valu-btn valu-btn-ghost">HOW IT WORKS <span>↓</span></a>
          </div>
          <div className="valu-meta"><span>15 QUESTIONS</span><i>·</i><span>INITIAL ASSESSMENT</span><i>·</i><span>BUILT AROUND PRIME</span></div>
        </div>
      </section>

      <section className="valu-intro" id="how-it-works">
        <div className="valu-wrap valu-two">
          <div><div className="valu-kicker valu-dark"><span /> WHY VALU</div><h2>Professional capability is bigger than a job title.</h2></div>
          <div><p>Experience tells part of the story. The VALU Index creates a clearer starting point for understanding how you currently show up across the professional dimensions that influence development, visibility and opportunity.</p><p>You do not need a perfect score to begin. The purpose of the initial assessment is direction: understand where you stand, then decide what to do next.</p></div>
        </div>
      </section>

      <section className="valu-process">
        <div className="valu-wrap">
          <div className="valu-kicker"><span /> THE JOURNEY</div>
          <h2>Four steps from<br /><em>assessment to opportunity.</em></h2>
          <div className="valu-steps">
            <article><b>01</b><h3>Take the assessment</h3><p>Answer the initial 15-question VALU Index assessment.</p></article>
            <article><b>02</b><h3>Understand your profile</h3><p>See your directional result through the PRIME framework.</p></article>
            <article><b>03</b><h3>Create your record</h3><p>Create your professional account and complete the authoritative VALU assessment.</p></article>
            <article><b>04</b><h3>Become discoverable</h3><p>Complete your professional profile, clear the governance gates and enter the relevant marketplace.</p></article>
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
          <div><p>The initial 15-question VALU snapshot gives you directional insight. To establish the authoritative marketplace record, create your professional account, complete the full VALU assessment and finish your professional profile. Subject to the normal governance checks, your eligible capability can then enter the marketplace.</p><p>The full VALU assessment establishes the authoritative marketplace score. Deeper assessment, development and opportunity pathways remain available afterwards.</p><a href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer" className="valu-inline">START THE VALU INDEX →</a></div>
        </div>
      </section>

      <section className="valu-final"><div className="valu-wrap"><div className="valu-kicker"><span /> WORTH. BUILT.</div><h2>Start by understanding<br /><em>where you stand.</em></h2><a href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer" className="valu-btn valu-btn-gold">TAKE THE VALU INDEX <span>→</span></a></div></section>
    </main>
    <Footer />
  </>
}
