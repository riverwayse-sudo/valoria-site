import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import '../pages.css'

export const metadata = {
  title: 'About Valoria Institute — Worth. Built.',
  description: 'Valoria Institute builds the infrastructure that develops, surfaces and connects African professional talent through a merit-based standard.',
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
    title: 'Merit over familiarity.',
    body: 'Capability should be developed and assessed against a consistent standard. Visibility should follow merit rather than familiarity, network proximity or a polished presentation.',
  },
  {
    num: '02',
    title: 'Development before visibility.',
    body: 'Valoria is development-first. The institution exists to help professionals build capability with architecture before that capability is surfaced and connected to opportunity.',
  },
  {
    num: '03',
    title: 'One institution. Multiple pathways.',
    body: 'PRIME is the shared intellectual architecture beneath development, professional visibility and precision matching across the Valoria ecosystem.',
  },
]

const TIMELINE = [
  { year: 'The problem', label: 'The same names recirculate across hiring, speaking, and training — not because they\'re the most capable, but because they\'re the most visible. Genuinely capable professionals get passed over for lack of a recognisable signal.' },
  { year: 'The hypothesis', label: 'If capability could be independently assessed and consistently signalled — the same way a credit score makes creditworthiness readable — the market would move toward the most capable, not the most visible.' },
  { year: 'The build', label: 'Valoria Institute was built as infrastructure. PRIME is the proprietary capability architecture beneath development and assessment. Valoria Develop builds capability; the African Talent Bureau creates structured visibility and precision connection.' },
  { year: 'The standard', label: 'The institution uses structured capability signals to make professional merit more legible. Score-based tiers are credentials, never paid upgrades.' },
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
            <h1 className="page-title">Worth.<br /><em>Built.</em></h1>
            <p className="page-sub">
              Valoria Institute builds and operates human capital infrastructure for African professional talent. We develop capability with architecture, surface merit with clarity and connect professionals to opportunity with precision.
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
              <h2 className="section-title">Develop.<br /><em>Surface. Connect.</em></h2>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px' }}>
                PRIME provides the capability architecture. Valoria Develop builds capability. The African Talent Bureau surfaces assessed professionals through ATB Connect and ATB Spotlight. These are institutional pathways—not separate identities competing for the definition of Valoria.
              </p>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px', marginTop: '16px' }}>
                One institution. One standard. Multiple pathways for professional merit.
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
            <h2 className="section-title">Valoria Institute.<br /><em>African in foundation. Global in ambition.</em></h2>
            <p className="page-sub" style={{ margin: '0 auto 32px', maxWidth: '560px' }}>
              Valoria Institute is building toward a continent-wide human capital standard while remaining proudly African in its point of view and globally ambitious in its operating standard. African Talent Bureau Ltd remains the legal operating entity where applicable.
            </p>
            <div className="page-hero-actions" style={{ justifyContent: 'center' }}>
              <a href="https://assessment.valoriainstitute.com/" className="btn-gold" target="_blank" rel="noopener noreferrer">BEGIN THE VALU SNAPSHOT</a>
              <a href="/contact-us" className="btn-outline">GET IN TOUCH</a>
            </div>
          </Reveal>
        </section>

      </main>
      <Footer />
    </>
  )
}
