import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import '../pages.css'

export const metadata = {
  title: 'Become a PRIME-Certified Facilitator — Valoria Develop',
  description: 'Get PRIME-certified and deliver development programmes through Valoria Develop. Certification puts you in front of every training buyer commissioning programmes on the Valoria platform.',
  keywords: ['become facilitator Nigeria', 'PRIME certification', 'Valoria Develop facilitator', 'professional training certification Africa', 'facilitator marketplace'],
  openGraph: {
    title: 'Become a PRIME-Certified Facilitator | Valoria Institute',
    description: 'Certification against the framework that powers Africa\'s professional marketplace.',
    url: 'https://valoriainstitute.com/develop',
  },
  alternates: { canonical: 'https://valoriainstitute.com/develop' },
}

const WHY_CERTIFY = [
  { label: 'A credible credential.', desc: 'PRIME certification is grounded in the same assessed standard the VALU Index runs on — not a course completion badge. You earn it by demonstrating the clusters you intend to teach, not by watching videos.' },
  { label: 'A real commercial pipeline.', desc: 'Certified facilitators are listed on Valoria Develop and searchable by every training buyer on the platform. Commissioning happens through Valoria — you don\'t generate leads from scratch.' },
  { label: 'A measurable framework to teach from.', desc: 'The PRIME clusters have defined behavioural anchors, a scoring architecture, and a before/after measurement mechanism. You\'re not teaching abstract leadership concepts — you\'re teaching against a framework that shows up in the numbers.' },
  { label: 'Aligned development and assessment.', desc: 'Because what you teach is what the VALU Index measures, the organisations you work with can see capability movement directly. That closes the gap between "good training" and "demonstrable ROI" — which is what every L&D budget holder actually needs to justify spend.' },
]

const STEPS = [
  { step: '01', title: 'Take the VALU Index.', body: 'Certification starts with your own assessed baseline. You can\'t credibly teach a cluster you haven\'t demonstrated. The VALU Index establishes your five-cluster profile — and informs which cluster(s) you pursue certification in.' },
  { step: '02', title: 'Complete cluster certification.', body: 'Certification is cluster-specific. You can certify in one, several, or all five — depending on your own PRIME profile and where your facilitation experience sits. The programme is built around the PRIME behavioural anchors for your chosen cluster(s).' },
  { step: '03', title: 'Get listed on Valoria Develop.', body: 'Once certified, your facilitator profile is listed on Valoria Develop — searchable by training buyers commissioning programmes. Your listing shows your certified clusters, VALU Index score, and facilitation approach.' },
  { step: '04', title: 'Get commissioned.', body: 'Commissioning happens through the platform. Valoria matches you with training buyers based on the cluster they need, your specialisation, and the commercial context — so you spend your time delivering, not prospecting.' },
]

export default function DevelopPage() {
  return (
    <>
      <Nav />
      <main id="main-content">

        {/* HERO */}
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">FOR FACILITATORS &amp; TRAINERS</span></div>
            <h1 className="page-title">Get certified.<br /><em>Get commissioned.</em></h1>
            <p className="page-sub">
              Valoria Develop runs on PRIME-certified facilitators. Certification puts you in front of every training buyer on the platform — with a credible, independently grounded credential behind you, not a self-declared expertise tag.
            </p>
            <div className="page-hero-actions">
              <a href="/signup" className="btn-gold">START THE PROCESS</a>
              <a href="/prime" className="btn-outline">SEE THE PRIME FRAMEWORK</a>
            </div>
          </div>
        </section>

        {/* WHY CERTIFY */}
        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">WHY PRIME CERTIFICATION</span></div>
              <h2 className="section-title">Not a badge.<br /><em>A commercial signal.</em></h2>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px' }}>
                Most training certifications exist to fill a résumé line. PRIME certification exists to make you findable by the right buyers — and to give the organisations commissioning you a reason to trust the outcome before you&apos;ve delivered a single session.
              </p>
            </Reveal>
            <Reveal>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {WHY_CERTIFY.map((w, i) => (
                  <div key={i} style={{ borderLeft: '2px solid rgba(201,168,76,.3)', paddingLeft: '18px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--parchment)', marginBottom: '6px' }}>{w.label}</div>
                    <p style={{ fontSize: '13px', color: 'var(--dim)', fontWeight: 300, lineHeight: 1.6, margin: 0 }}>{w.desc}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* HOW CERTIFICATION WORKS */}
        <section className="page-section alt">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="eyebrow-line" /><span className="eyebrow-text">THE CERTIFICATION PROCESS</span><div className="eyebrow-line" /></div>
              <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Four steps to<br /><em>delivering on PRIME.</em></h2>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {STEPS.map(s => (
                <Reveal key={s.step}>
                  <div className="card-gold">
                    <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.16em', color: 'rgba(29,158,117,.6)', marginBottom: '12px' }}>{s.step}</div>
                    <div className="cluster-name" style={{ marginBottom: '10px' }}>{s.title}</div>
                    <p className="cluster-desc">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* WHO THIS IS FOR */}
        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">WHO SHOULD CERTIFY</span></div>
              <h2 className="section-title">Built for practitioners,<br /><em>not presenters.</em></h2>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px' }}>
                PRIME certification is for experienced facilitators and trainers who want a credible framework behind their practice — not for people starting from scratch in training delivery. You bring the facilitation experience. We bring the framework, the assessment architecture, and the commercial pipeline.
              </p>
            </Reveal>
            <Reveal>
              <ul className="checklist" role="list">
                {[
                  'Experienced facilitators, coaches, or trainers looking for a credible differentiator',
                  'L&D professionals building an independent practice alongside corporate roles',
                  'Consultants who want a structured, measurable development offering',
                  'Practitioners already working in any of the five PRIME cluster domains',
                  'Subject matter experts with facilitation capability across Influence, Enterprise, or other clusters',
                ].map((t, i) => (
                  <li key={i}>
                    <span className="dot"><svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="#1D9E75" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="page-section alt cta-banner">
          <Reveal>
            <h2 className="section-title">Ready to teach<br /><em>the framework?</em></h2>
            <p className="page-sub">Certification starts with your own VALU Index. Create an account, take the assessment, and the certification process opens from there.</p>
            <div className="page-hero-actions" style={{ justifyContent: 'center' }}>
              <a href="/signup" className="btn-gold">START THE PROCESS</a>
              <a href="/contact-us" className="btn-outline">SPEAK TO THE TEAM FIRST</a>
            </div>
          </Reveal>
        </section>

      </main>
      <Footer />
    </>
  )
}
