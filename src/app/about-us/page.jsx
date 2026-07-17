import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import '../pages.css'

export const metadata = {
  title: 'About Valoria Institute — Where African Professionals Rise',
  description: 'Valoria Institute is the professional marketplace built on Africa\'s first independently assessed talent standard. One VALU Index score. Three ways to engage the continent\'s best professionals.',
  keywords: ['about Valoria Institute', 'African talent bureau', 'VALU Index', 'professional assessment Africa', 'Lagos talent marketplace'],
  openGraph: {
    title: 'About Valoria Institute',
    description: 'Built on one idea: capability should be visible, verifiable, and worth more than a polished CV.',
    url: 'https://valoriainstitute.com/about-us',
  },
  alternates: { canonical: 'https://valoriainstitute.com/about-us' },
}

const PRINCIPLES = [
  {
    num: '01',
    title: 'Assessment over assertion.',
    body: 'Every professional on the platform has been independently measured. Not self-reported. Not endorsed. Measured — across five defined capability clusters that don\'t change depending on who\'s reading the CV.',
  },
  {
    num: '02',
    title: 'Visibility is infrastructure.',
    body: 'The problem for most capable African professionals isn\'t capability — it\'s that their capability has no consistent, trusted signal attached to it. The VALU Index is that signal. One score, readable by anyone, regardless of where the professional studied or worked.',
  },
  {
    num: '03',
    title: 'One standard, three markets.',
    body: 'The same PRIME-assessed profile that makes a professional findable to an employer also makes them bookable as a speaker and commissionable as a facilitator. One assessment. Every commercial context.',
  },
]

const TIMELINE = [
  { year: 'The problem', label: 'The same names recirculate across hiring, speaking, and training — not because they\'re the most capable, but because they\'re the most visible. Genuinely capable professionals get passed over for lack of a recognisable signal.' },
  { year: 'The hypothesis', label: 'If capability could be independently assessed and consistently signalled — the same way a credit score makes creditworthiness readable — the market would move toward the most capable, not the most visible.' },
  { year: 'The build', label: 'Valoria Institute was built to test that hypothesis at scale. The VALU Index is the assessment. PRIME is the framework underneath it. ATB Connect, Spotlight, and Develop are the three market entry points it powers.' },
  { year: 'The standard', label: 'Every professional assessed through the VALU Index gets a score, a cluster breakdown, and a tier designation — and every buyer on the platform searches against that standard, not against a résumé.' },
]

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main id="main-content">

        {/* HERO */}
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">ABOUT VALORIA INSTITUTE</span></div>
            <h1 className="page-title">Worth, made<br /><em>impossible to miss.</em></h1>
            <p className="page-sub">
              Valoria Institute is an African Talent Bureau Ltd initiative. We build the infrastructure that lets African professionals prove what they can do — and lets the people hiring, booking, and commissioning them see it clearly, without having to already know their name.
            </p>
          </div>
        </section>

        {/* THE PROBLEM + WHAT WE BUILT */}
        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THE PROBLEM WE BUILT AGAINST</span></div>
              <h2 className="section-title">A great CV and a<br /><em>great hire</em> aren&apos;t the same thing.</h2>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px' }}>
                Across hiring, speaking, and training, the same names keep recirculating — not because they&apos;re the most capable, but because they&apos;re the most visible. Genuinely exceptional professionals get passed over daily for lack of a recognisable signal. Buyers default to familiarity. Supply defaults to networking harder. Neither produces the best outcome.
              </p>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px', marginTop: '16px' }}>
                Valoria Institute exists to fix the signal, not the people. African professionals are not underperforming. They are underrepresented in the systems that distribute professional opportunity — and that is an infrastructure problem, not a capability one.
              </p>
            </Reveal>
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">WHAT WE BUILT</span></div>
              <h2 className="section-title">One standard.<br /><em>Three ways in.</em></h2>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px' }}>
                The VALU Index assesses every professional across five PRIME clusters — Presence, Relationships, Intelligence, Mastery, Enterprise. That single assessed score then powers three distinct entry points into the professional market: ATB Connect for employers searching assessed candidates, ATB Spotlight for event organisers booking assessed speakers, and Valoria Develop for training buyers commissioning PRIME-certified facilitators.
              </p>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px', marginTop: '16px' }}>
                One assessment. One standard. Every professional context it serves.
              </p>
            </Reveal>
          </div>
        </section>

        {/* FOUNDING PRINCIPLES */}
        <section className="page-section alt">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="eyebrow-line" /><span className="eyebrow-text">WHAT WE OPERATE BY</span><div className="eyebrow-line" /></div>
              <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '48px' }}>Three principles that<br /><em>don&apos;t move.</em></h2>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
              {PRINCIPLES.map(p => (
                <Reveal key={p.num}>
                  <div className="card-gold">
                    <div className="vi-card-num">{p.num}</div>
                    <div className="vi-card-name" style={{ marginBottom: '12px' }}>{p.title}</div>
                    <p className="vi-card-body">{p.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ORIGIN STORY — narrative thread */}
        <section className="page-section">
          <div className="page-section-inner" style={{ maxWidth: '720px' }}>
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">HOW WE GOT HERE</span></div>
              <h2 className="section-title">Built on a<br /><em>provable hypothesis.</em></h2>
            </Reveal>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {TIMELINE.map((t, i) => (
                <Reveal key={i}>
                  <div style={{ display: 'flex', gap: '24px', padding: '28px 0', borderBottom: i < TIMELINE.length - 1 ? '1px solid rgba(201,168,76,.08)' : 'none' }}>
                    <div style={{ width: '110px', flexShrink: 0, fontSize: '10px', fontWeight: 700, letterSpacing: '.12em', color: 'rgba(201,168,76,.5)', paddingTop: '3px', textTransform: 'uppercase' }}>{t.year}</div>
                    <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px', margin: 0 }}>{t.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* WHO WE ARE + CTA */}
        <section className="page-section alt cta-banner">
          <Reveal>
            <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="eyebrow-line" /><span className="eyebrow-text">WHO WE ARE</span><div className="eyebrow-line" /></div>
            <h2 className="section-title">African Talent Bureau Ltd.<br /><em>Lagos, Nigeria.</em></h2>
            <p className="page-sub" style={{ margin: '0 auto 32px', maxWidth: '560px' }}>
              Valoria Institute is an initiative of African Talent Bureau Ltd, operating out of Lagos and building toward a continent-wide professional standard. We are NDPA 2023 compliant in how we handle every professional&apos;s assessment data.
            </p>
            <div className="page-hero-actions" style={{ justifyContent: 'center' }}>
              <a href="https://assessment.valoriainstitute.com/" className="btn-gold" target="_blank" rel="noopener noreferrer">BEGIN THE VALU INDEX — FREE</a>
              <a href="/contact-us" className="btn-outline">GET IN TOUCH</a>
            </div>
          </Reveal>
        </section>

      </main>
      <Footer />
    </>
  )
}
