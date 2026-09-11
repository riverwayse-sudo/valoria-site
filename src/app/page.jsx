import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import LiveProfilesScroll from '@/components/LiveProfilesScroll'
import { BRAND } from '@/lib/brand'
import { PROFESSIONAL_STANDARD_SERIES } from '@/lib/professionalStandardSeries'
import './home.css'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Valoria Institute — Worth. Built.',
  description: 'Valoria Institute develops professional capability, makes merit visible and connects people to better opportunities.',
}

const pathways = [
  { n: '01', title: 'Professionals', text: 'Build a verified professional presence, understand your capability through the VALU Index and become discoverable for relevant opportunities.', href: BRAND.assessmentUrl, cta: 'Start your VALU Index' },
  { n: '02', title: 'Employers & organisations', text: 'Find professionals through a structured marketplace built around capability, evidence and professional identity — not just a CV.', href: '/marketplace?track=candidate', cta: 'Find talent' },
  { n: '03', title: 'Event organisers', text: 'Discover speakers and facilitators whose professional profile, capabilities and positioning fit the brief.', href: '/marketplace?track=speaker', cta: 'Find speakers' },
  { n: '04', title: 'Professionals seeking deeper opportunity', text: 'Move beyond visibility into deeper professional intelligence and opportunity pathways as your profile develops.', href: BRAND.assessmentUrl, cta: 'Explore VALU' },
]

const upcoming = PROFESSIONAL_STANDARD_SERIES.filter((session) => !session.replay).slice(0, 3)

export default function HomePage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="vi-home">
        <section className="vi-home-hero">
          <div className="vi-hero-grid" aria-hidden="true" />
          <div className="vi-hero-orbit" aria-hidden="true" />
          <div className="vi-home-hero-inner">
            <div className="vi-eyebrow"><span /> VALORIA INSTITUTE</div>
            <h1>Professional worth<br /><em>should be visible.</em></h1>
            <p className="vi-hero-lede">Valoria develops professional capability, makes merit visible and connects people to the opportunities they have earned.</p>
            <div className="vi-hero-actions">
              <a href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer" className="vi-btn vi-btn-gold">START YOUR VALU INDEX <span>→</span></a>
              <a href="/marketplace" className="vi-btn vi-btn-ghost">EXPLORE THE MARKETPLACE <span>→</span></a>
            </div>
            <div className="vi-hero-proof">
              <span>VALU INDEX</span><b>·</b><span>PROFESSIONAL MARKETPLACE</span><b>·</b><span>EVENTS & INSIGHTS</span>
            </div>
          </div>
        </section>

        <section className="vi-decision" aria-labelledby="vi-decision-title">
          <div className="vi-section-wrap">
            <div className="vi-decision-copy">
              <div className="vi-eyebrow vi-eyebrow-dark"><span /> THE VALORIA SYSTEM</div>
              <h2 id="vi-decision-title">One institution.<br /><em>Clearer professional value.</em></h2>
              <p>Valoria is the infrastructure between capability and opportunity. We help professionals develop, employers discover with greater confidence, and organisations connect with people whose capability fits the need.</p>
            </div>
            <div className="vi-system-list">
              <div><strong>DEVELOP</strong><span>Structured learning and professional standards.</span></div>
              <div><strong>SURFACE</strong><span>A verified professional identity built for discovery.</span></div>
              <div><strong>CONNECT</strong><span>Better matching between capability and opportunity.</span></div>
            </div>
          </div>
        </section>

        <section className="vi-pathways" aria-labelledby="vi-pathways-title">
          <div className="vi-section-wrap">
            <div className="vi-section-head">
              <div><div className="vi-eyebrow"><span /> FIND YOUR PATH</div><h2 id="vi-pathways-title">What are you here<br /><em>to accomplish?</em></h2></div>
              <p>Choose the decision you need to make. Valoria keeps the experience simple on the surface while the institution does the structured work underneath.</p>
            </div>
            <div className="vi-pathway-grid">
              {pathways.map((path) => (
                <article className="vi-pathway" key={path.n}>
                  <div className="vi-pathway-number">{path.n}</div>
                  <h3>{path.title}</h3>
                  <p>{path.text}</p>
                  <a href={path.href} target={path.href.startsWith('http') ? '_blank' : undefined} rel={path.href.startsWith('http') ? 'noopener noreferrer' : undefined}>{path.cta} <span>→</span></a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <LiveProfilesScroll />

        <section className="vi-valu" id="valu" aria-labelledby="vi-valu-title">
          <div className="vi-section-wrap vi-valu-grid">
            <Reveal>
              <div className="vi-eyebrow"><span /> THE VALU INDEX</div>
              <h2 id="vi-valu-title">Start with 15 questions.<br /><em>Leave with direction.</em></h2>
              <p>The VALU Index begins with a 15-question directional assessment across the five PRIME clusters. Complete it, build your professional profile and you can enter the general marketplace when the normal governance checks are satisfied.</p>
              <p className="vi-valu-note">The deeper assessment remains available for advanced professional intelligence and opportunity pathways. It is not a prerequisite for initial general marketplace listing.</p>
              <a href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer" className="vi-btn vi-btn-gold">BEGIN THE VALU INDEX <span>→</span></a>
            </Reveal>
            <Reveal className="vi-valu-visual">
              <div className="vi-valu-ring"><span>VALU</span><strong>INDEX</strong><small>PRIME · P · R · I · M · E</small></div>
              <div className="vi-valu-legend"><span>PROFESSIONALISM</span><span>RELATIONSHIPS</span><span>INFLUENCE</span><span>MASTERY</span><span>ENTERPRISE</span></div>
            </Reveal>
          </div>
        </section>

        <section className="vi-events" id="events" aria-labelledby="vi-events-title">
          <div className="vi-section-wrap">
            <div className="vi-section-head">
              <div><div className="vi-eyebrow"><span /> EVENTS</div><h2 id="vi-events-title">The conversations shaping<br /><em>the professional standard.</em></h2></div>
              <a className="vi-text-link" href="/events">VIEW ALL EVENTS →</a>
            </div>
            <div className="vi-event-grid">
              {upcoming.map((session) => (
                <article className="vi-event-card" key={session.id}>
                  <div className="vi-event-top"><span>SESSION {session.id}</span><b>COMING SOON</b></div>
                  <div className="vi-event-cluster">{session.cluster}</div>
                  <h3>{session.title}</h3>
                  <p>{session.description}</p>
                  <div className="vi-event-bottom"><span>DATE TO BE CONFIRMED</span><a href="/events">EVENT DETAILS →</a></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="vi-replay" aria-labelledby="vi-replay-title">
          <div className="vi-section-wrap vi-replay-grid">
            <div>
              <div className="vi-eyebrow"><span /> SESSION 01 · REPLAY</div>
              <h2 id="vi-replay-title">Why being good at your job is no longer <em>enough.</em></h2>
              <p>The opening Valoria conversation on professional worth, visibility, influence and the infrastructure required to turn capability into recognised opportunity.</p>
              <a href="/events#session-01" className="vi-text-link">VIEW SESSION →</a>
            </div>
            <div className="vi-video"><iframe src="https://www.youtube.com/embed/B9dD22vTErI" title="Valoria Institute — Session 01 replay" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
          </div>
        </section>

        <section className="vi-insights" aria-labelledby="vi-insights-title">
          <div className="vi-section-wrap vi-insights-inner">
            <div><div className="vi-eyebrow vi-eyebrow-dark"><span /> INSIGHTS</div><h2 id="vi-insights-title">Ideas worth carrying<br /><em>into the room.</em></h2></div>
            <div><p>Perspectives on professional capability, leadership, influence, work and the systems that determine who gets seen.</p><a href="/insights" className="vi-text-link vi-text-link-dark">EXPLORE INSIGHTS →</a></div>
          </div>
        </section>

        <section className="vi-final-cta">
          <div className="vi-section-wrap">
            <div className="vi-eyebrow"><span /> WORTH. BUILT.</div>
            <h2>Your capability deserves<br /><em>the right infrastructure.</em></h2>
            <div className="vi-hero-actions"><a href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer" className="vi-btn vi-btn-gold">START YOUR VALU INDEX <span>→</span></a><a href="/marketplace" className="vi-btn vi-btn-ghost">EXPLORE THE MARKETPLACE <span>→</span></a></div>
          </div>
        </section>
      </main>
      <Footer />
      <style>{`
        .vi-home{background:#0F0F1A;color:#F7F4EE;overflow:hidden}.vi-section-wrap{width:min(1240px,calc(100% - 48px));margin:0 auto}.vi-home-hero{min-height:88vh;display:flex;align-items:center;position:relative;padding:140px 0 100px;background:radial-gradient(circle at 74% 38%,rgba(201,168,76,.13),transparent 30%),#0F0F1A}.vi-home-hero-inner{width:min(1240px,calc(100% - 48px));margin:0 auto;position:relative;z-index:2}.vi-eyebrow{display:flex;align-items:center;gap:11px;color:rgba(201,168,76,.75);font-size:10px;font-weight:800;letter-spacing:.2em;text-transform:uppercase}.vi-eyebrow span{width:32px;height:1px;background:#C9A84C}.vi-eyebrow-dark{color:#8a8a98}.vi-home-hero h1{font-family:var(--font);font-size:clamp(58px,8vw,112px);font-weight:300;line-height:.96;letter-spacing:-.05em;max-width:1000px;margin:25px 0}.vi-home-hero h1 em,.vi-section-head h2 em,.vi-valu h2 em,.vi-events h2 em,.vi-replay h2 em,.vi-insights h2 em,.vi-final-cta h2 em,.vi-decision h2 em{font-style:italic;color:#C9A84C;font-weight:400}.vi-hero-lede{font-size:clamp(18px,1.8vw,24px);line-height:1.6;color:rgba(247,244,238,.68);max-width:760px;margin:0}.vi-hero-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:34px}.vi-btn{min-height:54px;padding:0 22px;display:inline-flex;align-items:center;justify-content:center;gap:12px;text-decoration:none;font-size:10px;font-weight:800;letter-spacing:.12em}.vi-btn-gold{background:#C9A84C;color:#0F0F1A;border:1px solid #C9A84C}.vi-btn-ghost{background:transparent;color:#F7F4EE;border:1px solid rgba(247,244,238,.22)}.vi-btn:hover{transform:translateY(-2px)}.vi-hero-proof{display:flex;gap:12px;flex-wrap:wrap;margin-top:52px;font-size:9px;font-weight:700;letter-spacing:.12em;color:rgba(247,244,238,.3)}.vi-hero-proof b{color:#C9A84C}.vi-hero-grid{position:absolute;inset:0;opacity:.035;background-image:linear-gradient(rgba(201,168,76,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.7) 1px,transparent 1px);background-size:64px 64px}.vi-hero-orbit{position:absolute;width:620px;height:620px;border:1px solid rgba(201,168,76,.1);border-radius:50%;right:-180px;top:12%;box-shadow:0 0 0 90px rgba(201,168,76,.025),0 0 0 180px rgba(201,168,76,.015)}
        .vi-decision{background:#F7F4EE;color:#1A1A2E;padding:110px 0}.vi-decision .vi-section-wrap{display:grid;grid-template-columns:1.2fr .8fr;gap:100px;align-items:end}.vi-decision h2,.vi-section-head h2,.vi-valu h2,.vi-events h2,.vi-replay h2,.vi-insights h2,.vi-final-cta h2{font-family:var(--font);font-size:clamp(44px,6vw,76px);font-weight:300;line-height:1.02;letter-spacing:-.04em;margin:20px 0}.vi-decision p,.vi-section-head>p,.vi-insights p{font-size:18px;line-height:1.75;color:#3f3f4e;max-width:720px}.vi-system-list{border-top:1px solid rgba(26,26,46,.2)}.vi-system-list div{display:grid;grid-template-columns:120px 1fr;gap:20px;padding:22px 0;border-bottom:1px solid rgba(26,26,46,.2)}.vi-system-list strong{font-size:10px;letter-spacing:.14em}.vi-system-list span{font-size:14px;line-height:1.6;color:#555567}
        .vi-pathways{padding:120px 0;background:#0F0F1A}.vi-section-head{display:flex;justify-content:space-between;align-items:flex-end;gap:60px;margin-bottom:52px}.vi-section-head>p{color:rgba(247,244,238,.48);max-width:440px}.vi-pathway-grid{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid rgba(247,244,238,.15);border-left:1px solid rgba(247,244,238,.15)}.vi-pathway{min-height:360px;padding:28px;border-right:1px solid rgba(247,244,238,.15);border-bottom:1px solid rgba(247,244,238,.15);display:flex;flex-direction:column}.vi-pathway-number{font-size:10px;letter-spacing:.14em;color:#C9A84C}.vi-pathway h3{font-family:var(--font);font-size:29px;font-weight:400;line-height:1.1;margin:72px 0 15px}.vi-pathway p{font-size:14px;line-height:1.7;color:rgba(247,244,238,.48);margin:0}.vi-pathway a{margin-top:auto;padding-top:26px;color:#C9A84C;text-decoration:none;font-size:10px;font-weight:800;letter-spacing:.12em}
        .vi-valu{padding:130px 0;background:#1A1A2E}.vi-valu-grid{display:grid;grid-template-columns:1fr 1fr;gap:90px;align-items:center}.vi-valu p{font-size:17px;line-height:1.75;color:rgba(247,244,238,.58);max-width:650px}.vi-valu-note{font-size:13px!important;color:rgba(247,244,238,.36)!important;border-left:1px solid rgba(201,168,76,.35);padding-left:15px}.vi-valu-visual{display:flex;flex-direction:column;align-items:center}.vi-valu-ring{width:min(390px,72vw);aspect-ratio:1;border:1px solid rgba(201,168,76,.35);border-radius:50%;display:flex;flex-direction:column;justify-content:center;align-items:center;box-shadow:0 0 0 45px rgba(201,168,76,.025),0 0 0 90px rgba(201,168,76,.012)}.vi-valu-ring span{font-size:11px;letter-spacing:.3em;color:#C9A84C}.vi-valu-ring strong{font-family:var(--font);font-size:clamp(50px,6vw,82px);font-weight:300;letter-spacing:-.04em}.vi-valu-ring small{font-size:8px;letter-spacing:.18em;color:rgba(247,244,238,.3);margin-top:14px}.vi-valu-legend{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:28px}.vi-valu-legend span{font-size:8px;letter-spacing:.1em;color:rgba(247,244,238,.35);border:1px solid rgba(247,244,238,.08);padding:7px 9px}
        .vi-events{padding:120px 0;background:#F7F4EE;color:#1A1A2E}.vi-events .vi-eyebrow,.vi-insights .vi-eyebrow-dark{color:#686878}.vi-events .vi-eyebrow span,.vi-insights .vi-eyebrow-dark span{background:#9a7428}.vi-text-link{color:#C9A84C;text-decoration:none;font-size:10px;font-weight:800;letter-spacing:.12em;white-space:nowrap}.vi-event-grid{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid rgba(26,26,46,.2);border-left:1px solid rgba(26,26,46,.2)}.vi-event-card{min-height:390px;padding:28px;border-right:1px solid rgba(26,26,46,.2);border-bottom:1px solid rgba(26,26,46,.2);display:flex;flex-direction:column}.vi-event-top{display:flex;justify-content:space-between;gap:10px;font-size:9px;font-weight:800;letter-spacing:.12em}.vi-event-top b{color:#9a7428}.vi-event-cluster{font-size:10px;font-weight:800;letter-spacing:.16em;color:#656576;margin:44px 0 15px}.vi-event-card h3{font-family:var(--font);font-size:29px;font-weight:500;line-height:1.13;margin:0}.vi-event-card p{font-size:14px;line-height:1.7;color:#515161;margin:18px 0}.vi-event-bottom{display:flex;justify-content:space-between;gap:12px;margin-top:auto;padding-top:22px;font-size:9px;font-weight:800;letter-spacing:.1em;color:#666676}.vi-event-bottom a{color:#1A1A2E;text-decoration:none}
        .vi-replay{padding:120px 0;background:#0F0F1A}.vi-replay-grid{display:grid;grid-template-columns:.85fr 1.15fr;gap:70px;align-items:center}.vi-replay h2{font-size:clamp(42px,5vw,68px)}.vi-replay p{font-size:17px;line-height:1.75;color:rgba(247,244,238,.5);max-width:560px}.vi-video{aspect-ratio:16/9;border:1px solid rgba(201,168,76,.2);background:#08080f}.vi-video iframe{width:100%;height:100%;border:0}
        .vi-insights{padding:105px 0;background:#F7F4EE;color:#1A1A2E}.vi-insights-inner{display:grid;grid-template-columns:1fr 1fr;gap:100px;align-items:end}.vi-text-link-dark{color:#1A1A2E;border-bottom:1px solid rgba(26,26,46,.25);padding-bottom:5px}.vi-final-cta{padding:120px 0;background:#0F0F1A;border-top:1px solid rgba(201,168,76,.12)}
        @media(max-width:900px){.vi-decision .vi-section-wrap,.vi-valu-grid,.vi-replay-grid,.vi-insights-inner{grid-template-columns:1fr;gap:50px}.vi-pathway-grid{grid-template-columns:repeat(2,1fr)}.vi-event-grid{grid-template-columns:1fr}.vi-section-head{align-items:flex-start;flex-direction:column;gap:10px}.vi-system-list{margin-top:10px}}
        @media(max-width:600px){.vi-section-wrap,.vi-home-hero-inner{width:min(100% - 36px,1240px)}.vi-home-hero{min-height:80vh;padding-top:125px}.vi-home-hero h1{font-size:52px}.vi-pathways,.vi-valu,.vi-events,.vi-replay,.vi-insights,.vi-final-cta,.vi-decision{padding:82px 0}.vi-pathway-grid{grid-template-columns:1fr}.vi-pathway{min-height:300px}.vi-pathway h3{margin-top:48px}.vi-decision .vi-section-wrap{gap:36px}.vi-system-list div{grid-template-columns:1fr;gap:7px}.vi-hero-actions{display:grid}.vi-btn{width:100%;box-sizing:border-box}.vi-hero-proof{line-height:1.7}.vi-section-head h2,.vi-decision h2,.vi-valu h2,.vi-events h2,.vi-replay h2,.vi-insights h2,.vi-final-cta h2{font-size:43px}}
        @media(prefers-reduced-motion:reduce){.vi-btn{transition:none}}
      `}</style>
    </>
  )
}
