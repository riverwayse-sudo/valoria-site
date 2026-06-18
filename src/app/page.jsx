import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import WaitlistForm from '@/components/WaitlistForm'
import { ENTRY_POINTS } from '@/lib/brand'
import './home.css'

export const metadata = {
  title: 'Valoria Institute — Where African Professionals Rise',
  description: "One marketplace. Three ways to engage Africa's best professionals. Search candidates, book speakers, commission facilitators — every profile underwritten by one assessed standard.",
}

export default function HomePage() {
  return (
    <>
      <Nav />

      <main id="main-content">
        {/* HERO */}
        <section className="hero" id="hero">
          <div className="hero-bg" aria-hidden="true" />
          <div className="hero-grid" aria-hidden="true" />
          <div className="container hero-inner">
            <div>
              <div className="hero-eyebrow au d1" aria-hidden="true">
                <div className="hero-eyebrow-line" />
                <span className="hero-eyebrow-text">THE AFRICAN PROFESSIONAL MARKETPLACE</span>
              </div>
              <h1 className="hero-title au d2">
                Valoria is where<br />African professionals<br /><em>rise.</em>
              </h1>
              <p className="hero-sub au d3">
                One marketplace. Three ways to engage Africa&apos;s best professionals. Search candidates, book speakers, commission facilitators — every profile underwritten by one independently assessed standard.
              </p>
              <div className="hero-actions au d4">
                <a href="https://assessment.valoriainstitute.com/" className="btn-gold" target="_blank" rel="noopener noreferrer">
                  EXPLORE THE PLATFORM
                </a>
                <a href="https://assessment.valoriainstitute.com/" className="btn-outline" target="_blank" rel="noopener noreferrer">
                  TAKE THE VALU INDEX
                </a>
              </div>

              <div className="hero-mobile-card au d5" aria-hidden="true">
                <div className="hmc-row">
                  <div className="hmc-score">84</div>
                  <div className="hmc-right">
                    <div className="hmc-desig">FORCE TO ALIGN WITH</div>
                    <div className="hmc-bars">
                      <div className="hmc-bar" style={{ background: '#1D9E75', width: '88%' }} />
                      <div className="hmc-bar" style={{ background: '#378ADD', width: '90%' }} />
                      <div className="hmc-bar" style={{ background: '#7F77DD', width: '82%' }} />
                      <div className="hmc-bar" style={{ background: '#BA7517', width: '80%' }} />
                      <div className="hmc-bar" style={{ background: '#D85A30', width: '75%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="valu-card au d4" aria-label="Sample VALU Index profile">
              <div className="vc-label">VALU INDEX &nbsp;&middot;&nbsp; ILLUSTRATIVE PROFILE</div>
              <div className="vc-score">
                <span className="vc-num">84</span>
                <span className="vc-denom">/ 100</span>
              </div>
              <div className="vc-desig">FORCE TO ALIGN WITH</div>
              <div className="vc-modalities">
                <span className="mod-pill" style={{ background: 'rgba(55,138,221,.12)', color: '#378ADD', border: '1px solid rgba(55,138,221,.25)' }}>CANDIDATE</span>
                <span className="mod-pill" style={{ background: 'rgba(201,168,76,.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,.25)' }}>SPEAKER</span>
              </div>
              <div className="vc-bars">
                <div className="vb"><span className="vb-l">P</span><div className="vb-bg"><div className="vb-fill" style={{ width: '88%', background: '#1D9E75' }} /></div><span className="vb-s">88</span></div>
                <div className="vb"><span className="vb-l">R</span><div className="vb-bg"><div className="vb-fill" style={{ width: '90%', background: '#378ADD' }} /></div><span className="vb-s">90</span></div>
                <div className="vb"><span className="vb-l">I</span><div className="vb-bg"><div className="vb-fill" style={{ width: '82%', background: '#7F77DD' }} /></div><span className="vb-s">82</span></div>
                <div className="vb"><span className="vb-l">M</span><div className="vb-bg"><div className="vb-fill" style={{ width: '80%', background: '#BA7517' }} /></div><span className="vb-s">80</span></div>
                <div className="vb"><span className="vb-l">E</span><div className="vb-bg"><div className="vb-fill" style={{ width: '75%', background: '#D85A30' }} /></div><span className="vb-s">75</span></div>
              </div>
              <div className="vc-foot">illustrative profile — one identity, two active modalities</div>
            </div>
          </div>
        </section>

        {/* ALIGNMENT PRINCIPLE */}
        <section className="alignment" id="alignment">
          <div className="alignment-numeral" aria-hidden="true">3</div>
          <div className="container">
            <Reveal className="alignment-inner">
              <div className="eyebrow" style={{ justifyContent: 'center' }}>
                <div className="eyebrow-line" />
                <span className="eyebrow-text">THE ALIGNMENT PRINCIPLE</span>
                <div className="eyebrow-line" />
              </div>
              <blockquote className="alignment-quote">
                &ldquo;When people encounter a person or institution, they place them in one of four categories. Forgotten. Used. <span className="highlight">A force to align with.</span> Or one they submit to.&rdquo;
              </blockquote>
              <p className="alignment-sub">
                Valoria Institute exists to move African professionals from category two — used, deployed as a resource without development — to category three. Every profile, every assessment, every programme is an act of infrastructure toward that one outcome.
              </p>
              <a href="https://assessment.valoriainstitute.com/" className="btn-gold" target="_blank" rel="noopener noreferrer">
                SEE HOW IT WORKS
              </a>
              <div className="alignment-cats" aria-label="The four categories">
                <div className="cat-item"><div className="cat-num">01</div><div className="cat-name">Forgotten</div></div>
                <div className="cat-item"><div className="cat-num">02</div><div className="cat-name">Used</div></div>
                <div className="cat-item cat-highlight"><div className="cat-num">03</div><div className="cat-name">Force to Align With</div></div>
                <div className="cat-item"><div className="cat-num">04</div><div className="cat-name">Submit to</div></div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ENTRY POINTS */}
        <section className="entry-points" id="entry-points">
          <div className="container">
            <Reveal className="ep-header">
              <div>
                <div className="eyebrow">
                  <div className="eyebrow-line" />
                  <span className="eyebrow-text">ONE MARKETPLACE &nbsp;&middot;&nbsp; THREE ENTRY POINTS</span>
                </div>
                <h2 style={{ fontFamily: 'var(--font)', fontSize: 'clamp(36px,5vw,64px)', fontWeight: 200, lineHeight: 1.05, letterSpacing: '-.02em' }}>
                  One professional.<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)', fontWeight: 300 }}>Three ways to engage.</em>
                </h2>
              </div>
              <p className="ep-desc">
                A professional on Valoria holds whichever modalities are true for them — candidate, speaker, facilitator, or any combination. Three types of buyer search through three entry points. Every search is underwritten by the same assessed standard.
              </p>
            </Reveal>

            <Reveal className="ep-grid" as="div">
              {ENTRY_POINTS.map((ep) => (
                <div className={`ep-card ep-${ep.num}`} key={ep.id} style={{ '--ep-color': ep.color }}>
                  <style>{`.ep-${ep.num}::before { background: ${ep.color}; }`}</style>
                  <div className="ep-num">{ep.num}</div>
                  <div className="ep-icon" style={{ background: `${ep.color}1A`, border: `1px solid ${ep.color}40` }}>
                    <EntryIcon id={ep.id} color={ep.color} />
                  </div>
                  <h3 className="ep-name" style={{ color: ep.color }} dangerouslySetInnerHTML={{ __html: ep.name.replace(' ', '<br/>') }} />
                  <div className="ep-buyer" style={{ color: ep.color }}>{ep.buyer}</div>
                  <p className="ep-desc-text">{ep.desc}</p>
                  <div className="ep-modality" style={{ background: `${ep.color}14`, color: ep.color, border: `1px solid ${ep.color}33` }}>
                    {ep.modality}
                  </div>
                  <a href={ep.href} className="ep-link" style={{ color: ep.color }}>
                    {ep.linkLabel} <span aria-hidden="true">→</span>
                  </a>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* VALU INDEX */}
        <section className="valu-section" id="valu">
          <div className="container valu-inner">
            <Reveal>
              <div className="eyebrow">
                <div className="eyebrow-line" />
                <span className="eyebrow-text">THE VALU INDEX</span>
              </div>
              <h2 className="valu-title">Know exactly<br />where you <em>stand.</em></h2>
              <p className="valu-desc">
                55 questions across five clusters. Designed to surface your genuine capability, not your best impression of it. The only verifiable professional credential of its kind on the African continent. Free to take. Valid for 12 months.
              </p>
              <ul className="valu-checklist" role="list">
                {[
                  'Score across all five PRIME clusters with full radar chart',
                  'Profile designation from Force to Align With to At the Starting Point',
                  'Declare your active modalities — candidate, speaker, facilitator, or any combination',
                  'Listed on the platform and searchable by the right buyers if your score qualifies',
                  '18 to 28 minutes — always free',
                ].map((text, i) => (
                  <li className="vc-item" key={i}>
                    <div className="vc-dot" aria-hidden="true">
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="#C9A84C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    {text}
                  </li>
                ))}
              </ul>
              <a href="https://assessment.valoriainstitute.com/" className="btn-gold" target="_blank" rel="noopener noreferrer">
                BEGIN THE VALU INDEX — FREE
              </a>
            </Reveal>

            <Reveal className="radar-card" aria-label="Sample radar chart output from VALU Index">
              <div className="rc-label">SAMPLE VALU INDEX RESULT</div>
              <svg className="rc-radar" viewBox="0 0 260 260" aria-hidden="true">
                <g opacity=".14" stroke="#C9A84C" strokeWidth=".5" fill="none">
                  <polygon points="130,22 222,80 192,188 68,188 38,80" />
                  <polygon points="130,50 196,98 172,174 88,174 64,98" />
                  <polygon points="130,78 170,116 152,160 108,160 90,116" />
                  <polygon points="130,106 144,134 132,146 128,146 116,134" />
                  <line x1="130" y1="22" x2="130" y2="188" />
                  <line x1="130" y1="22" x2="222" y2="80" />
                  <line x1="130" y1="22" x2="192" y2="188" />
                  <line x1="130" y1="22" x2="68" y2="188" />
                  <line x1="130" y1="22" x2="38" y2="80" />
                </g>
                <polygon points="130,36 214,88 186,178 74,178 46,88" fill="rgba(201,168,76,.12)" stroke="#C9A84C" strokeWidth="1.5" />
                <circle cx="130" cy="36" r="4" fill="#1D9E75" />
                <circle cx="214" cy="88" r="4" fill="#378ADD" />
                <circle cx="186" cy="178" r="4" fill="#7F77DD" />
                <circle cx="74" cy="178" r="4" fill="#BA7517" />
                <circle cx="46" cy="88" r="4" fill="#D85A30" />
                <text x="130" y="12" textAnchor="middle" fontFamily="Raleway,sans-serif" fontSize="10" fontWeight="600" fill="#1D9E75">P</text>
                <text x="234" y="88" textAnchor="start" fontFamily="Raleway,sans-serif" fontSize="10" fontWeight="600" fill="#378ADD">R</text>
                <text x="196" y="202" textAnchor="middle" fontFamily="Raleway,sans-serif" fontSize="10" fontWeight="600" fill="#7F77DD">I</text>
                <text x="62" y="202" textAnchor="middle" fontFamily="Raleway,sans-serif" fontSize="10" fontWeight="600" fill="#BA7517">M</text>
                <text x="22" y="88" textAnchor="end" fontFamily="Raleway,sans-serif" fontSize="10" fontWeight="600" fill="#D85A30">E</text>
              </svg>
              <div className="rc-bottom">
                <div>
                  <div className="rc-b-label">VALU INDEX</div>
                  <div style={{ fontFamily: 'var(--font)', fontSize: '40px', fontWeight: 200, color: 'var(--gold)', lineHeight: 1 }}>84</div>
                </div>
                <div>
                  <div className="rc-b-label">DESIGNATION</div>
                  <div className="rc-desig">FORCE TO ALIGN WITH</div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
        {/* FOUNDING COHORT WAITLIST */}
        <section className="waitlist-section" id="waitlist">
          <style>{`
            .waitlist-section {
              padding: clamp(72px,10vw,120px) var(--pad);
              background: linear-gradient(180deg, var(--dark) 0%, #0a0a14 100%);
              border-top: 1px solid rgba(201,168,76,.12);
              position: relative;
              overflow: hidden;
            }
            .waitlist-section::before {
              content: '';
              position: absolute;
              top: -120px; left: 50%; transform: translateX(-50%);
              width: 600px; height: 600px;
              background: radial-gradient(circle, rgba(201,168,76,.06) 0%, transparent 70%);
              pointer-events: none;
            }
            .waitlist-inner {
              max-width: 1100px; margin: 0 auto;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: clamp(32px,5vw,72px);
              align-items: center;
            }
            .waitlist-eyebrow { margin-bottom: 20px; }
            .waitlist-title {
              font-family: var(--font);
              font-size: clamp(32px,4vw,54px);
              font-weight: 200;
              line-height: 1.05;
              letter-spacing: -.02em;
              color: var(--parchment);
              margin-bottom: 20px;
            }
            .waitlist-title em { color: var(--gold); font-style: italic; font-weight: 300; }
            .waitlist-sub {
              font-size: 15px; font-weight: 300; color: rgba(247,244,238,.5);
              line-height: 1.7; margin-bottom: 28px;
            }
            .waitlist-checklist {
              list-style: none; padding: 0; margin: 0 0 32px;
              display: flex; flex-direction: column; gap: 12px;
            }
            .waitlist-checklist li {
              display: flex; align-items: flex-start; gap: 10px;
              font-size: 14px; font-weight: 300; color: rgba(247,244,238,.6);
              line-height: 1.5;
            }
            .waitlist-checklist .wl-dot {
              flex-shrink: 0; margin-top: 3px;
              width: 18px; height: 18px;
              border-radius: 50%;
              background: rgba(201,168,76,.1);
              border: 1px solid rgba(201,168,76,.3);
              display: flex; align-items: center; justify-content: center;
            }
            .waitlist-card {
              background: rgba(201,168,76,.04);
              border: 1px solid rgba(201,168,76,.18);
              border-radius: 12px;
              padding: clamp(28px,4vw,44px);
            }
            .waitlist-card .eyebrow { margin-bottom: 16px; }
            .waitlist-card-desc {
              font-size: 14px; font-weight: 300; color: rgba(247,244,238,.45);
              line-height: 1.7; margin-bottom: 20px;
            }
            .wl-field-label {
              display: block; font-size: 10px; font-weight: 600;
              letter-spacing: .14em; color: rgba(201,168,76,.6);
              margin-bottom: 7px;
            }
            .wl-field {
              display: block; width: 100%; box-sizing: border-box;
              background: rgba(255,255,255,.04);
              border: 1px solid rgba(201,168,76,.2);
              border-radius: 6px;
              padding: 11px 14px;
              font-size: 13px; font-weight: 300;
              color: var(--parchment);
              outline: none;
              transition: border-color .2s;
              margin-bottom: 14px;
              font-family: inherit;
              -webkit-appearance: none; appearance: none;
            }
            .wl-field:focus { border-color: rgba(201,168,76,.55); }
            .wl-field option { background: #1A1A2E; color: var(--parchment); }
            .wl-btn {
              display: block; width: 100%; text-align: center;
              padding: 14px 28px;
              background: var(--gold); color: var(--dark);
              font-size: 12px; font-weight: 700; letter-spacing: .14em;
              border-radius: var(--btn-radius);
              border: none; cursor: pointer;
              transition: opacity .2s;
              font-family: inherit;
            }
            .wl-btn:hover { opacity: .88; }
            .wl-btn:disabled { opacity: .5; cursor: not-allowed; }
            .wl-success {
              text-align: center; padding: 20px 0;
              font-size: 14px; font-weight: 300;
              color: rgba(247,244,238,.6); line-height: 1.7;
            }
            .wl-success strong { display: block; color: var(--gold); font-size: 20px; margin-bottom: 8px; font-family: var(--font); font-weight: 300; }
            @media (max-width: 780px) {
              .waitlist-inner { grid-template-columns: 1fr; }
            }
          `}</style>
          <div className="waitlist-inner">
            <Reveal>
              <div className="waitlist-eyebrow eyebrow">
                <div className="eyebrow-line" />
                <span className="eyebrow-text">FOUNDING COHORT</span>
              </div>
              <h2 className="waitlist-title">
                Get in before<br />the <em>marketplace fills up.</em>
              </h2>
              <p className="waitlist-sub">
                The founding cohort gets first access to the marketplace, priority placement once it opens to general search, and a direct line to shape how Valoria develops.
              </p>
              <ul className="waitlist-checklist" role="list">
                {[
                  'Early access ahead of general marketplace launch',
                  'Priority placement in search results once live',
                  'Direct input into how ATB Connect, Spotlight, and Develop evolve',
                  'First to know when new sectors and regions open',
                ].map((t, i) => (
                  <li key={i}>
                    <span className="wl-dot">
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
                        <path d="M1.5 4.5l2 2 4-4" stroke="#C9A84C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal>
              <WaitlistForm />
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

function EntryIcon({ id, color }) {
  if (id === 'atb-connect') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2" stroke={color} strokeWidth="1.5" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke={color} strokeWidth="1.5" />
        <circle cx="12" cy="14" r="2" stroke={color} strokeWidth="1.5" />
      </svg>
    )
  }
  if (id === 'spotlight') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.5" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M17 4l2 2-2 2M19 6h-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
