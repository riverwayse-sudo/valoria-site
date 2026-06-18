import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import '../pages.css'

export const metadata = {
  title: 'About Us',
  description: 'Valoria Institute is an African Talent Bureau initiative built on one idea: capability should be visible, verifiable, and worth more than a polished CV.',
}

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">ABOUT VALORIA INSTITUTE</span></div>
            <h1 className="page-title">Worth, made<br /><em>impossible to miss.</em></h1>
            <p className="page-sub">
              Valoria Institute is an African Talent Bureau Ltd initiative. We build the infrastructure that lets African professionals prove what they can do — and lets the people hiring, booking, and developing them see it clearly.
            </p>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THE PROBLEM WE BUILT AGAINST</span></div>
              <h2 className="section-title">A great CV and a<br /><em>great hire</em> aren&apos;t the same thing.</h2>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px' }}>
                Across hiring, speaking, and training, the same names keep recirculating — not because they&apos;re the most capable, but because they&apos;re the most visible. Genuinely capable professionals get passed over for lack of a recognisable signal. We built one.
              </p>
            </Reveal>
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">WHAT WE BUILT</span></div>
              <h2 className="section-title">One standard.<br /><em>Three ways in.</em></h2>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px' }}>
                The VALU Index assesses every professional against the PRIME framework. That single score then powers three entry points — ATB Connect for employers, ATB Spotlight for event organisers, and Valoria Develop for training buyers — so one assessment serves every way a professional gets engaged.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="page-section alt">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="eyebrow-line" /><span className="eyebrow-text">WHO WE ARE</span><div className="eyebrow-line" /></div>
              <h2 className="section-title" style={{ textAlign: 'center' }}>Built by African Talent Bureau Ltd.</h2>
              <p className="page-sub" style={{ margin: '0 auto', textAlign: 'center' }}>
                Valoria Institute operates out of Lagos, Nigeria, and is NDPA 2023 compliant in how it handles every professional&apos;s assessment data.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="page-section cta-banner">
          <Reveal>
            <h2 className="section-title">Ready to see<br /><em>where you stand?</em></h2>
            <p className="page-sub">Take the VALU Index — free, and valid for 12 months.</p>
            <a href="https://assessment.valoriainstitute.com/" className="btn-gold" target="_blank" rel="noopener noreferrer">BEGIN THE VALU INDEX</a>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  )
}
