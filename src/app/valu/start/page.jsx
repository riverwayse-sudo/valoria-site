import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { BRAND } from '@/lib/brand'

export const metadata = {
  title: 'Start Your VALU Index — Valoria Institute',
  description: 'Take the VALU Index and get a clearer starting point for understanding your professional capability through PRIME.',
}

const dimensions = [
  ['P', 'Professionalism'],
  ['R', 'Relationships'],
  ['I', 'Influence'],
  ['M', 'Motivation & Stamina'],
  ['E', 'Enterprise'],
]

const faqs = [
  ['How long does it take?', 'The initial VALU Index is a focused 15-question assessment designed to give you directional insight without asking you to spend a long time completing a diagnostic.'],
  ['Who is it for?', 'It is designed for African professionals who want a clearer view of their current professional capability and a stronger foundation for development, visibility and opportunity.'],
  ['Is it free?', 'Yes. The initial VALU Index is free to take. It is the entry point into the wider Valoria professional ecosystem.'],
  ['Does the result define me?', 'No. Your initial result is directional, not a permanent label. It gives you a starting point for understanding where you are and deciding what to build next.'],
  ['What happens after I finish?', 'You can create your professional account, complete your profile and, subject to Valoria’s normal governance checks, become discoverable through the professional marketplace.'],
  ['Is there a deeper assessment?', 'Yes. The initial assessment is the acquisition and orientation layer. A deeper VALU assessment is available for more advanced professional intelligence and opportunity pathways.'],
]

export default function ValuStartPage() {
  const assessmentUrl = BRAND.assessmentUrl

  return <>
    <Nav />
    <main className="valu-start">
      <section className="vs-hero">
        <div className="vs-shell">
          <div className="vs-kicker"><span /> THE VALU INDEX</div>
          <div className="vs-hero-grid">
            <div>
              <h1>Your CV tells people what you’ve done.<br /><em>VALU shows what you can become.</em></h1>
              <p className="vs-lede">A professional diagnostic built around PRIME to give you a clearer starting point for understanding your capability, direction and professional presence.</p>
              <div className="vs-actions">
                <a href={assessmentUrl} className="vs-btn vs-primary">START YOUR VALU INDEX <b>→</b></a>
                <a href="#how" className="vs-btn vs-secondary">SEE HOW IT WORKS <b>↓</b></a>
              </div>
              <div className="vs-proof"><span>15 QUESTIONS</span><i>·</i><span>FREE</span><i>·</i><span>BUILT AROUND PRIME</span></div>
            </div>
            <div className="vs-score" aria-label="Illustrative VALU Index result">
              <div className="vs-score-top"><span>VALU INDEX</span><span>01</span></div>
              <div className="vs-ring"><strong>74</strong><small>INDEX</small></div>
              <div className="vs-bars">{dimensions.map(([letter, title], i) => <div key={letter} className="vs-bar"><span>{letter}</span><div><i style={{ width: `${86 - i * 9}%` }} /></div><b>{title}</b></div>)}</div>
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
          <h2>Assess. Understand. Build.<br /><em>Then become discoverable.</em></h2>
          <div className="vs-journey-grid">
            <article><span>01</span><h3>Assess</h3><p>Complete the initial 15-question VALU Index assessment.</p></article>
            <article><span>02</span><h3>Understand</h3><p>Receive directional insight through the PRIME framework.</p></article>
            <article><span>03</span><h3>Build</h3><p>Create your professional profile and define what you bring.</p></article>
            <article><span>04</span><h3>Discover</h3><p>Subject to governance checks, become discoverable through the marketplace.</p></article>
          </div>
        </div>
      </section>

      <section className="vs-result">
        <div className="vs-shell">
          <div className="vs-result-grid">
            <div><div className="vs-kicker"><span /> YOUR RESULT</div><h2>Your result is a starting point,<br /><em>not a label.</em></h2></div>
            <div className="vs-result-copy"><p>The initial VALU Index gives you a directional view of your professional profile. It is designed to create clarity and momentum — not to reduce your potential to one number.</p><ul><li><b>VALU Index</b><span>A concise directional signal</span></li><li><b>PRIME profile</b><span>A view across five capability dimensions</span></li><li><b>Next pathway</b><span>A clearer basis for what to build next</span></li></ul></div>
          </div>
        </div>
      </section>

      <section className="vs-light vs-next">
        <div className="vs-shell">
          <div className="vs-next-grid">
            <div><div className="vs-kicker dark"><span /> AFTER VALU</div><h2>One assessment can open a much bigger professional journey.</h2></div>
            <div className="vs-copy"><p>Once you complete the initial VALU Index, you can create your professional account and complete your profile. From there, Valoria connects capability with professional visibility and opportunity.</p><div className="vs-next-list"><div><b>01</b><span>Complete your professional profile</span></div><div><b>02</b><span>Make your capabilities discoverable</span></div><div><b>03</b><span>Explore deeper assessment and development pathways</span></div></div></div>
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
        <div className="vs-shell"><div className="vs-kicker"><span /> WORTH. BUILT.</div><h2>Your capability deserves<br /><em>more than a CV.</em></h2><p>Start with a clearer understanding of where you stand.</p><a href={assessmentUrl} className="vs-btn vs-primary">START YOUR VALU INDEX <b>→</b></a><Link href="/valu" className="vs-back">Learn more about VALU →</Link></div>
      </section>
    </main>
    <Footer />
    <style>{`*{box-sizing:border-box}.valu-start{background:#0F0F1A;color:#F7F4EE;overflow:hidden}.vs-shell{width:min(1180px,calc(100% - 48px));margin:0 auto}.vs-hero{min-height:88vh;display:flex;align-items:center;padding:145px 0 90px;background:radial-gradient(circle at 78% 28%,rgba(201,168,76,.15),transparent 31%),#0F0F1A}.vs-kicker{display:flex;align-items:center;gap:11px;color:#C9A84C;font-size:10px;font-weight:800;letter-spacing:.2em}.vs-kicker span{width:30px;height:1px;background:#C9A84C}.vs-kicker.dark{color:#777786}.vs-kicker.dark span{background:#C9A84C}.vs-hero-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(300px,.65fr);gap:80px;align-items:center;margin-top:25px}.vs-hero h1,.vs-dark-section h2,.vs-result h2,.vs-final h2{font-family:var(--font);font-weight:300;letter-spacing:-.055em;line-height:.98;font-size:clamp(52px,6.5vw,92px);margin:20px 0 28px}.vs-hero h1 em,.vs-dark-section h2 em,.vs-result h2 em,.vs-final h2 em,.vs-light h2 em{color:#C9A84C;font-style:italic;font-weight:400}.vs-lede{max-width:720px;color:rgba(247,244,238,.63);font-size:clamp(18px,1.8vw,22px);line-height:1.65;margin:0}.vs-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:34px}.vs-btn{min-height:54px;padding:0 22px;display:inline-flex;align-items:center;justify-content:center;gap:13px;text-decoration:none;font-size:10px;font-weight:800;letter-spacing:.12em;transition:transform .3s ease,box-shadow .3s ease}.vs-btn b{font-size:17px;font-weight:400}.vs-primary{background:#C9A84C;color:#0F0F1A;border:1px solid #C9A84C}.vs-secondary{border:1px solid rgba(247,244,238,.2);color:#F7F4EE}.vs-btn:hover{transform:translateY(-2px);box-shadow:0 10px 25px rgba(0,0,0,.18)}.vs-proof{display:flex;flex-wrap:wrap;gap:12px;margin-top:44px;color:rgba(247,244,238,.34);font-size:9px;font-weight:800;letter-spacing:.14em}.vs-proof i{color:#C9A84C;font-style:normal}.vs-score{border:1px solid rgba(201,168,76,.35);padding:25px;background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.012));box-shadow:0 25px 70px rgba(0,0,0,.2)}.vs-score-top{display:flex;justify-content:space-between;font-size:9px;letter-spacing:.16em;color:rgba(247,244,238,.42)}.vs-ring{width:170px;height:170px;border:1px solid rgba(201,168,76,.55);outline:8px solid rgba(201,168,76,.07);border-radius:50%;margin:42px auto 35px;display:flex;flex-direction:column;align-items:center;justify-content:center}.vs-ring strong{font-family:var(--font);font-size:66px;font-weight:300;line-height:.9}.vs-ring small{font-size:8px;letter-spacing:.2em;color:#C9A84C;margin-top:8px}.vs-bars{display:grid;gap:12px}.vs-bar{display:grid;grid-template-columns:15px 1fr 92px;gap:10px;align-items:center;font-size:9px}.vs-bar>span{color:#C9A84C;font-weight:800}.vs-bar>div{height:2px;background:rgba(247,244,238,.12)}.vs-bar i{display:block;height:2px;background:#C9A84C}.vs-bar b{font-size:8px;letter-spacing:.06em;font-weight:600;color:rgba(247,244,238,.4)}.vs-score>p{text-align:center;color:rgba(247,244,238,.25);font-size:8px;margin:22px 0 0;letter-spacing:.1em}.vs-light{background:#F7F4EE;color:#1A1A2E;padding:115px 0}.vs-split,.vs-next-grid{display:grid;grid-template-columns:1fr 1fr;gap:100px}.vs-light h2{font-family:var(--font);font-size:clamp(44px,5vw,68px);font-weight:300;line-height:1.02;letter-spacing:-.045em;margin:20px 0}.vs-copy{padding-top:38px}.vs-copy p{font-size:18px;line-height:1.75;color:#4c4c5a;margin:0 0 22px}.vs-problems{display:grid;grid-template-columns:repeat(3,1fr);margin-top:90px;border-top:1px solid rgba(26,26,46,.16);border-left:1px solid rgba(26,26,46,.16)}.vs-problems article{padding:28px 26px 35px;border-right:1px solid rgba(26,26,46,.16);border-bottom:1px solid rgba(26,26,46,.16);min-height:280px}.vs-problems b,.vs-journey-grid span,.vs-next-list b{color:#9a792a;font-size:9px;letter-spacing:.15em}.vs-problems h3{font-family:var(--font);font-size:25px;line-height:1.12;font-weight:400;margin:68px 0 13px}.vs-problems p{color:#626271;font-size:14px;line-height:1.65}.vs-dark-section{padding:120px 0;background:#1A1A2E}.vs-heading-row{display:grid;grid-template-columns:1.2fr .8fr;gap:80px;align-items:end}.vs-heading-row>p{max-width:430px;color:rgba(247,244,238,.48);font-size:17px;line-height:1.7;margin:0 0 12px}.vs-prime-line{display:grid;grid-template-columns:repeat(5,1fr);margin-top:70px;border-top:1px solid rgba(247,244,238,.15)}.vs-prime-line article{position:relative;padding:25px 18px 15px;border-right:1px solid rgba(247,244,238,.15);min-height:205px}.vs-prime-line article span{font-family:var(--font);font-size:52px;color:#C9A84C}.vs-prime-line h3{font-size:15px;line-height:1.25;font-weight:600;margin:16px 0}.vs-prime-line i{display:block;width:18px;height:1px;background:#C9A84C}.vs-journey{padding-top:110px}.vs-journey>div>h2{max-width:850px}.vs-journey-grid{display:grid;grid-template-columns:repeat(4,1fr);margin-top:65px;border-top:1px solid rgba(26,26,46,.16);border-left:1px solid rgba(26,26,46,.16)}.vs-journey-grid article{padding:25px;border-right:1px solid rgba(26,26,46,.16);border-bottom:1px solid rgba(26,26,46,.16);min-height:250px}.vs-journey-grid h3{font-family:var(--font);font-size:28px;font-weight:400;margin:70px 0 12px}.vs-journey-grid p{font-size:14px;line-height:1.65;color:#626271}.vs-result{padding:120px 0;background:#0F0F1A}.vs-result-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:100px}.vs-result-copy{padding-top:35px}.vs-result-copy>p{font-size:18px;line-height:1.7;color:rgba(247,244,238,.55)}.vs-result-copy ul{list-style:none;padding:0;margin:35px 0 0;border-top:1px solid rgba(247,244,238,.15)}.vs-result-copy li{display:flex;flex-direction:column;gap:5px;padding:18px 0;border-bottom:1px solid rgba(247,244,238,.15)}.vs-result-copy li b{font-size:13px;font-weight:600}.vs-result-copy li span{font-size:12px;color:rgba(247,244,238,.42)}.vs-next{padding:115px 0}.vs-next-list{margin-top:35px;border-top:1px solid rgba(26,26,46,.16)}.vs-next-list div{display:flex;gap:22px;align-items:center;padding:19px 0;border-bottom:1px solid rgba(26,26,46,.16);font-size:14px}.vs-next-list span{color:#4c4c5a}.vs-faq{padding:115px 0;background:#1A1A2E}.vs-faq h2{font-family:var(--font);font-size:clamp(44px,5vw,66px);font-weight:300;letter-spacing:-.04em;margin:20px 0 55px}.vs-faq-grid{max-width:920px;border-top:1px solid rgba(247,244,238,.15)}.vs-faq details{border-bottom:1px solid rgba(247,244,238,.15)}.vs-faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;gap:20px;padding:22px 0;font-family:var(--font);font-size:19px;font-weight:400}.vs-faq summary::-webkit-details-marker{display:none}.vs-faq summary span{color:#C9A84C;font-size:22px;font-weight:300}.vs-faq details[open] summary span{transform:rotate(45deg)}.vs-faq details p{max-width:780px;color:rgba(247,244,238,.5);font-size:14px;line-height:1.75;padding:0 35px 25px 0;margin:0}.vs-final{padding:135px 0;background:radial-gradient(circle at 80% 30%,rgba(201,168,76,.12),transparent 30%),#0F0F1A}.vs-final h2{max-width:900px}.vs-final>div>p{font-size:18px;color:rgba(247,244,238,.48);margin:0 0 30px}.vs-back{display:inline-block;margin-left:22px;color:rgba(247,244,238,.5);font-size:10px;font-weight:800;letter-spacing:.1em;text-decoration:none}.vs-back:hover{color:#C9A84C}@media(max-width:900px){.vs-hero-grid,.vs-split,.vs-next-grid,.vs-heading-row,.vs-result-grid{grid-template-columns:1fr;gap:45px}.vs-score{max-width:520px}.vs-problems{grid-template-columns:1fr}.vs-prime-line{grid-template-columns:1fr 1fr}.vs-journey-grid{grid-template-columns:1fr 1fr}.vs-copy,.vs-result-copy{padding-top:0}}@media(max-width:600px){.vs-shell{width:calc(100% - 32px)}.vs-hero{padding:125px 0 75px}.vs-hero h1,.vs-dark-section h2,.vs-result h2,.vs-final h2{font-size:48px}.vs-light,.vs-dark-section,.vs-result,.vs-faq,.vs-final{padding:80px 0}.vs-hero-grid{gap:35px}.vs-score{padding:20px}.vs-ring{width:145px;height:145px;margin:35px auto}.vs-bars{gap:10px}.vs-bar{grid-template-columns:14px 1fr 76px}.vs-bar b{font-size:7px}.vs-prime-line,.vs-journey-grid{grid-template-columns:1fr}.vs-prime-line article{min-height:auto;border-bottom:1px solid rgba(247,244,238,.15)}.vs-journey-grid article{min-height:auto}.vs-journey-grid h3{margin-top:45px}.vs-actions{display:grid}.vs-btn{width:100%}.vs-back{display:block;margin:22px 0 0;text-align:center}.vs-proof{line-height:1.8}.vs-problems{margin-top:55px}.vs-problems article{min-height:auto}.vs-problems h3{margin-top:45px}}@media(prefers-reduced-motion:reduce){.vs-btn{transition:none}}`}</style>
  </>
}
