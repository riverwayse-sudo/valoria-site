import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import HeroSlider from '@/components/HeroSlider'
import EntryPointsGrid from '@/components/EntryPointsGrid'
import LiveProfilesScroll from '@/components/LiveProfilesScroll'
import { BRAND } from '@/lib/brand'
import './home.css'

export const metadata = {
  title: 'Valoria Institute — Worth. Built.',
  description: "Valoria Institute builds the infrastructure that develops, surfaces and connects African professional merit.",
}

export default function HomePage() {
  return (
    <>
      <Nav />

      <main id="main-content">
        <HeroSlider />
        <LiveProfilesScroll />

        <section className="alignment" id="alignment">
          <div className="container">
            <Reveal className="alignment-inner">
              <div className="eyebrow" style={{ justifyContent: 'center' }}>
                <div className="eyebrow-line" />
                <span className="eyebrow-text">THE VALORIA PROMISE</span>
                <div className="eyebrow-line" />
              </div>
              <blockquote className="alignment-quote">
                &ldquo;We will <span className="highlight">develop you, surface you, and connect you</span> to the opportunity you have earned.&rdquo;
              </blockquote>
              <p className="alignment-sub">
                Valoria Institute builds the infrastructure through which capability is developed, merit becomes visible and opportunity can be matched with precision.
              </p>
              <a href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer" className="btn-gold">BEGIN THE VALU SNAPSHOT</a>
              <div className="alignment-cats" aria-label="The Valoria promise">
                <div className="cat-item"><div className="cat-num">01</div><div className="cat-name">Develop</div></div>
                <div className="cat-item cat-highlight"><div className="cat-num">02</div><div className="cat-name">Surface</div></div>
                <div className="cat-item"><div className="cat-num">03</div><div className="cat-name">Connect</div></div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="webinar-replay" id="webinar">
          <div className="container">
            <Reveal className="wr-inner">
              <div className="eyebrow" style={{ justifyContent: 'center' }}>
                <div className="eyebrow-line" />
                <span className="eyebrow-text">WATCH THE REPLAY</span>
                <div className="eyebrow-line" />
              </div>
              <h2 className="wr-title">
                Why being good at your job<br />is no longer <em>enough.</em>
              </h2>
              <p className="wr-sub">
                Watch the full session on the VALU Index, the PRIME framework and Valoria’s belief that talent is not the problem— infrastructure is.
              </p>
              <div className="wr-video">
                <iframe src="https://www.youtube.com/embed/B9dD22vTErI" title="Valoria Institute — Launch Webinar Replay" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
              </div>
              <a href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer" className="btn-gold" style={{ marginTop: 'clamp(28px,4vw,40px)' }}>
                BEGIN THE VALU SNAPSHOT
              </a>
            </Reveal>
          </div>
        </section>

        <section className="entry-points" id="entry-points">
          <div className="container">
            <Reveal className="ep-header">
              <div>
                <div className="eyebrow">
                  <div className="eyebrow-line" />
                  <span className="eyebrow-text">ONE INSTITUTION &nbsp;&middot;&nbsp; MULTIPLE PATHWAYS</span>
                </div>
                <h2 style={{ fontFamily: 'var(--font)', fontSize: 'clamp(36px,5vw,64px)', fontWeight: 200, lineHeight: 1.05, letterSpacing: '-.02em' }}>
                  One institution.<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)', fontWeight: 300 }}>Develop. Surface. Connect.</em>
                </h2>
              </div>
              <p className="ep-desc">
                Valoria Develop builds capability. The African Talent Bureau surfaces professionals through structured pathways for employers and event organisers. Every pathway is connected by the same institutional standard.
              </p>
            </Reveal>
            <Reveal className="ep-grid" as="div"><EntryPointsGrid /></Reveal>
          </div>
        </section>

        <section className="valu-section" id="valu">
          <div className="container valu-inner">
            <Reveal>
              <div className="eyebrow">
                <div className="eyebrow-line" />
                <span className="eyebrow-text">THE VALU INDEX</span>
              </div>
              <h2 className="valu-title">Know exactly<br />where you <em>stand.</em></h2>
              <p className="valu-desc">
                Start with a 15-question directional capability snapshot across the five PRIME clusters. After you sign up, complete the remaining assessment to establish your official VALU Index and become eligible for marketplace listing where your score qualifies.
              </p>
              <ul className="valu-checklist" role="list">
                {[
                  'Directional insight across all five PRIME clusters',
                  'A five-cluster snapshot that shows where your capability is strongest',
                  'Declare your active modalities — candidate, speaker, facilitator, or any combination',
                  'Complete the full assessment to establish your official VALU Index',
                  '15 questions — directional and immediate',
                ].map((text, i) => (
                  <li className="vc-item" key={i}>
                    <div className="vc-dot" aria-hidden="true"><svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="#C9A84C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                    {text}
                  </li>
                ))}
              </ul>
              <a href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer" className="btn-gold">BEGIN THE VALU SNAPSHOT →</a>
            </Reveal>

            <Reveal className="radar-card" aria-label="Illustrative radar chart for the VALU Index">
              <div className="rc-label">ILLUSTRATIVE VALU PROFILE</div>
              <svg className="rc-radar" viewBox="0 0 260 260" aria-hidden="true">
                <g opacity=".35" stroke="#D4C9A8" strokeWidth=".5" fill="none">
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
                <polygon points="130,36 214,88 186,178 74,178 46,88" fill="rgba(201,168,76,.40)" stroke="#C9A84C" strokeWidth="1.5" />
                <circle cx="130" cy="36" r="4" fill="#C9A84C" />
                <circle cx="214" cy="88" r="4" fill="#C9A84C" />
                <circle cx="186" cy="178" r="4" fill="#C9A84C" />
                <circle cx="74" cy="178" r="4" fill="#C9A84C" />
                <circle cx="46" cy="88" r="4" fill="#C9A84C" />
                <text x="130" y="12" textAnchor="middle" fontFamily="Raleway,sans-serif" fontSize="10" fontWeight="700" fill="#C9A84C">P</text>
                <text x="234" y="88" textAnchor="start" fontFamily="Raleway,sans-serif" fontSize="10" fontWeight="700" fill="#C9A84C">R</text>
                <text x="196" y="202" textAnchor="middle" fontFamily="Raleway,sans-serif" fontSize="10" fontWeight="700" fill="#C9A84C">I</text>
                <text x="62" y="202" textAnchor="middle" fontFamily="Raleway,sans-serif" fontSize="10" fontWeight="700" fill="#C9A84C">M</text>
                <text x="22" y="88" textAnchor="end" fontFamily="Raleway,sans-serif" fontSize="10" fontWeight="700" fill="#C9A84C">E</text>
              </svg>
              <div className="rc-bottom">
                <div>
                  <div className="rc-b-label">EXAMPLE ONLY</div>
                  <div style={{ fontFamily: 'var(--font)', fontSize: '40px', fontWeight: 800, color: 'var(--gold)', lineHeight: 1 }}>84</div>
                </div>
                <div>
                  <div className="rc-b-label">DESIGNATION</div>
                  <div className="rc-desig">ILLUSTRATIVE · NOT AN ASSESSMENT</div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
