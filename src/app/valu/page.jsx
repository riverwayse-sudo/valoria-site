import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { BRAND } from '@/lib/brand'

export const metadata = {
  title: 'VALU Index — Valoria Institute',
  description: 'Understand where you stand as a professional through the VALU Index and the PRIME framework.',
}

const dimensions = [
  ['P', 'Professionalism', 'How consistently you demonstrate the standards, judgement and reliability expected of your role.'],
  ['R', 'Relationships', 'How effectively you build trust, collaborate and create value through professional relationships.'],
  ['I', 'Influence', 'How well you communicate, shape decisions and create movement beyond your formal authority.'],
  ['M', 'Motivation & Stamina', 'How you sustain performance, adaptability and purposeful progress over time.'],
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
            <article><b>03</b><h3>Build your presence</h3><p>Create your professional profile and make your capability discoverable.</p></article>
            <article><b>04</b><h3>Go deeper when ready</h3><p>Continue into deeper assessment, development and opportunity pathways when relevant.</p></article>
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
          <div><p>Once you complete the initial VALU Index, you can create your professional account and complete your profile. Subject to the normal governance checks, that profile can become part of the general professional marketplace.</p><p>The deeper VALU assessment remains available for advanced professional intelligence and opportunity pathways. It is deliberately separate from the initial marketplace entry point.</p><a href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer" className="valu-inline">START THE VALU INDEX →</a></div>
        </div>
      </section>

      <section className="valu-final"><div className="valu-wrap"><div className="valu-kicker"><span /> WORTH. BUILT.</div><h2>Start by understanding<br /><em>where you stand.</em></h2><a href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer" className="valu-btn valu-btn-gold">TAKE THE VALU INDEX <span>→</span></a></div></section>
    </main>
    <Footer />
    <style>{`*{box-sizing:border-box}.valu-page{background:#0F0F1A;color:#F7F4EE;overflow:hidden}.valu-wrap{width:min(1180px,calc(100% - 48px));margin:0 auto}.valu-hero{min-height:82vh;display:flex;align-items:center;padding:150px 0 100px;background:radial-gradient(circle at 76% 32%,rgba(201,168,76,.13),transparent 30%),#0F0F1A}.valu-kicker{display:flex;align-items:center;gap:11px;color:#C9A84C;font-size:10px;font-weight:800;letter-spacing:.2em}.valu-kicker span{width:30px;height:1px;background:#C9A84C}.valu-hero h1,.valu-process h2,.valu-prime h2,.valu-final h2{font-family:var(--font);font-weight:300;line-height:.98;letter-spacing:-.05em;font-size:clamp(56px,8vw,104px);margin:24px 0}.valu-hero h1 em,.valu-process h2 em,.valu-prime h2 em,.valu-final h2 em{color:#C9A84C;font-style:italic;font-weight:400}.valu-lede{max-width:760px;font-size:clamp(18px,2vw,23px);line-height:1.65;color:rgba(247,244,238,.65)}.valu-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:34px}.valu-btn{min-height:54px;padding:0 22px;display:inline-flex;align-items:center;gap:12px;text-decoration:none;font-size:10px;font-weight:800;letter-spacing:.12em}.valu-btn-gold{background:#C9A84C;color:#0F0F1A;border:1px solid #C9A84C}.valu-btn-ghost{border:1px solid rgba(247,244,238,.2);color:#F7F4EE}.valu-meta{display:flex;gap:12px;flex-wrap:wrap;margin-top:48px;color:rgba(247,244,238,.35);font-size:9px;font-weight:700;letter-spacing:.13em}.valu-meta i{color:#C9A84C;font-style:normal}.valu-intro,.valu-outcome{background:#F7F4EE;color:#1A1A2E;padding:110px 0}.valu-two,.valu-outcome-grid{display:grid;grid-template-columns:1fr 1fr;gap:90px;align-items:start}.valu-dark{color:#6d6d7b}.valu-intro h2,.valu-outcome h2{font-family:var(--font);font-size:clamp(42px,5vw,66px);font-weight:300;line-height:1.02;letter-spacing:-.04em;margin:20px 0}.valu-intro p,.valu-outcome p{font-size:18px;line-height:1.75;color:#4c4c5a;margin:0 0 22px}.valu-process{padding:120px 0;background:#1A1A2E}.valu-process h2{font-size:clamp(48px,6vw,78px);max-width:800px}.valu-steps{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid rgba(247,244,238,.16);border-left:1px solid rgba(247,244,238,.16);margin-top:65px}.valu-steps article{min-height:310px;padding:26px;border-right:1px solid rgba(247,244,238,.16);border-bottom:1px solid rgba(247,244,238,.16)}.valu-steps b{font-size:10px;letter-spacing:.15em;color:#C9A84C}.valu-steps h3{font-family:var(--font);font-size:27px;font-weight:400;line-height:1.1;margin:75px 0 14px}.valu-steps p,.valu-dimensions p{font-size:14px;line-height:1.7;color:rgba(247,244,238,.5)}.valu-prime{padding:120px 0;background:#0F0F1A}.valu-prime-head{display:flex;justify-content:space-between;gap:60px;align-items:end}.valu-prime-head p{max-width:410px;font-size:17px;line-height:1.7;color:rgba(247,244,238,.48)}.valu-prime h2{font-size:clamp(48px,6vw,78px)}.valu-dimensions{display:grid;grid-template-columns:repeat(5,1fr);border-top:1px solid rgba(247,244,238,.15);margin-top:60px}.valu-dimensions article{padding:26px 20px 10px;border-right:1px solid rgba(247,244,238,.15)}.valu-letter{font-family:var(--font);font-size:50px;color:#C9A84C}.valu-dimensions h3{font-size:17px;line-height:1.2;margin:18px 0 10px}.valu-dimensions p{margin:0}.valu-inline{display:inline-block;color:#8a6b27;font-size:10px;font-weight:800;letter-spacing:.12em;text-decoration:none;margin-top:12px}.valu-final{padding:130px 0;background:#0F0F1A}.valu-final h2{max-width:850px}.valu-final .valu-btn{margin-top:20px}@media(max-width:900px){.valu-two,.valu-outcome-grid{grid-template-columns:1fr;gap:40px}.valu-steps{grid-template-columns:1fr 1fr}.valu-dimensions{grid-template-columns:1fr 1fr}.valu-prime-head{display:block}.valu-prime-head p{margin-top:25px}.valu-steps article{min-height:270px}}@media(max-width:600px){.valu-wrap{width:min(100% - 32px,1180px)}.valu-hero{min-height:auto;padding:130px 0 80px}.valu-hero h1,.valu-process h2,.valu-prime h2,.valu-final h2{font-size:48px}.valu-intro,.valu-process,.valu-prime,.valu-outcome,.valu-final{padding:80px 0}.valu-steps,.valu-dimensions{grid-template-columns:1fr}.valu-steps article{min-height:auto}.valu-steps h3{margin-top:45px}.valu-dimensions article{border-bottom:1px solid rgba(247,244,238,.15)}.valu-two,.valu-outcome-grid{gap:20px}.valu-lede{font-size:17px}}`}</style>
  </>
}
