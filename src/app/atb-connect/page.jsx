import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import { COLORS } from '@/lib/brand'
import '../pages.css'

export const metadata = {
  title: 'ATB Connect — Search PRIME-Assessed African Talent',
  description: 'ATB Connect is Valoria Institute\'s candidate marketplace. Every professional has been independently assessed across five PRIME clusters. Filter by VALU Index score, sector, and tier — not by résumé.',
  keywords: ['hire African professionals', 'assessed candidates Nigeria', 'VALU Index hiring', 'talent search Lagos', 'ATB Connect', 'PRIME assessed talent'],
  openGraph: {
    title: 'ATB Connect — Search Assessed African Talent | Valoria Institute',
    description: 'Every candidate on ATB Connect has been independently assessed. Search by score, sector, and tier — not by résumé.',
    url: 'https://valoriainstitute.com/atb-connect',
  },
  alternates: { canonical: 'https://valoriainstitute.com/atb-connect' },
}

const color = COLORS.blue

const WHAT_YOU_GET = [
  { label: 'A VALU Index score', desc: 'Every candidate\'s total assessed score, updated with each reassessment.' },
  { label: 'A five-cluster breakdown', desc: 'Presence, Relationships, Influence, Mastery, Enterprise — visible individually, so you can match to what your role actually needs.' },
  { label: 'A tier designation', desc: 'Standard, Proficient, Distinguished, or Elite — comparable across every professional on the platform.' },
  { label: 'Sector and availability signals', desc: 'Industry background, work modality preferences, and whether they\'re open to engagement right now.' },
]

const OBJECTIONS = [
  { q: 'We already use recruitment agencies.', a: 'ATB Connect doesn\'t replace sourcing — it changes what you\'re sourcing from. Instead of filtering hundreds of résumés, you\'re starting from an independently assessed shortlist. It compresses the first two stages of any recruitment process.' },
  { q: 'We\'re not based in Nigeria.', a: 'The platform is built for African talent globally, not just Nigeria-based employers. Professionals list their location, work modality preferences, and openness to relocation — you filter accordingly.' },
  { q: 'How do we know the assessment is credible?', a: 'The VALU Index uses scenario-based questions scored against defined behavioural anchors — not self-reported skills. The PRIME framework is the same standard used in Valoria Develop training programmes, which means the assessment and development are built on the same architecture.' },
]

export default function AtbConnectPage() {
  return (
    <>
      <Nav />
      <main id="main-content">

        {/* HERO */}
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text" style={{ color }}>01 &nbsp;&middot;&nbsp; FOR EMPLOYERS</span></div>
            <h1 className="page-title">Hire on evidence,<br /><em>not on instinct.</em></h1>
            <p className="page-sub">
              ATB Connect is the candidate modality of the Valoria marketplace. Every professional you search has been independently assessed across five PRIME clusters — so you&apos;re comparing verified capability, not curated résumés.
            </p>
            <div className="page-hero-actions">
              <a href="/marketplace?mode=talent" className="btn-gold">SEARCH THE TALENT POOL</a>
              <a href="/prime" className="btn-outline">SEE THE PRIME FRAMEWORK</a>
            </div>
          </div>
        </section>

        {/* WHY ASSESSED > CURATED */}
        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">WHY ASSESSED, NOT CURATED</span></div>
              <h2 className="section-title">The CV tells you<br />what someone <em>claims.</em></h2>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px' }}>
                The VALU Index tells you what they can actually do. Across five defined capability clusters — measured by scenario-based questions scored against behavioural anchors, not self-reported skills and endorsements. Every profile on ATB Connect carries a live score, a cluster breakdown, and a tier designation. Shortlisting starts from evidence.
              </p>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px', marginTop: '16px' }}>
                The average hiring process wastes 30–40% of its time at the top of the funnel — filtering applicants who looked good on paper. ATB Connect moves that time into better conversations, faster, with candidates who have already proven the baseline.
              </p>
            </Reveal>
            <Reveal>
              <ul className="checklist" role="list">
                {[
                  'Filter by VALU Index score, cluster strength, sector, and tier designation',
                  'Every candidate independently assessed — no self-reported skill claims',
                  'Compare candidates on the same five-cluster standard, side by side',
                  'See where a candidate is strong before your first conversation, not after three rounds',
                  'Request an introduction through the platform — Valoria verifies intent on both sides',
                ].map((t, i) => (
                  <li key={i}>
                    <span className="dot"><svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* WHAT YOU SEE ON EACH PROFILE */}
        <section className="page-section alt">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="eyebrow-line" /><span className="eyebrow-text">WHAT EVERY PROFILE SHOWS YOU</span><div className="eyebrow-line" /></div>
              <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>More signal.<br /><em>Less noise.</em></h2>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {WHAT_YOU_GET.map((w, i) => (
                <Reveal key={i}>
                  <div className="card-gold">
                    <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.14em', color: 'rgba(55,138,221,.7)', marginBottom: '10px' }}>{'◈'.repeat(i + 1)}</div>
                    <div className="cluster-name" style={{ marginBottom: '10px' }}>{w.label}</div>
                    <p className="cluster-desc">{w.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* OBJECTION HANDLING */}
        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">COMMON QUESTIONS</span></div>
              <h2 className="section-title">Things employers<br /><em>usually ask first.</em></h2>
            </Reveal>
            <Reveal>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {OBJECTIONS.map((o, i) => (
                  <div key={i} style={{ borderLeft: `2px solid ${color}`, paddingLeft: '20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--parchment)', marginBottom: '8px' }}>{o.q}</div>
                    <p style={{ fontSize: '13px', color: 'var(--dim)', fontWeight: 300, lineHeight: 1.7, margin: 0 }}>{o.a}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="page-section alt cta-banner">
          <Reveal>
            <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="eyebrow-line" /><span className="eyebrow-text">FOR EMPLOYERS</span><div className="eyebrow-line" /></div>
            <h2 className="section-title">Start searching<br /><em>assessed talent.</em></h2>
            <p className="page-sub">Browse the talent pool free — no account required. Create an account when you&apos;re ready to reach out to a candidate directly.</p>
            <div className="page-hero-actions" style={{ justifyContent: 'center' }}>
              <a href="/marketplace?mode=talent" className="btn-gold">SEARCH THE TALENT POOL</a>
              <a href="/signup" className="btn-outline">CREATE EMPLOYER ACCOUNT</a>
            </div>
          </Reveal>
        </section>

      </main>
      <Footer />
    </>
  )
}
