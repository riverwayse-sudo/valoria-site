import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import { PRIME_CLUSTERS } from '@/lib/brand'
import '../pages.css'

export const metadata = {
  title: 'Development Programmes — Valoria Institute',
  description: 'Five PRIME-mapped development programmes delivered by certified facilitators. Each programme targets a specific cluster — so development closes the exact gaps your VALU Index assessment surfaced.',
  keywords: ['PRIME programmes', 'professional development Nigeria', 'capability training Africa', 'VALU Index development', 'Valoria Develop programmes'],
  openGraph: {
    title: 'Development Programmes | Valoria Institute',
    description: 'A programme for every cluster. Development that maps to the same standard you\'re measured against.',
    url: 'https://valoriainstitute.com/programmes',
  },
  alternates: { canonical: 'https://valoriainstitute.com/programmes' },
}

const CLUSTER_DETAIL = {
  P: { focus: 'Communication · Executive presence · Composure under scrutiny', outcome: 'Professionals who can carry their capability clearly into any room — without losing it to nerves, noise, or hierarchy.' },
  R: { focus: 'Trust-building · Collaborative intelligence · Network quality', outcome: 'Professionals who don\'t just work with others — they raise the output of everyone around them.' },
  I: { focus: 'Critical thinking · Analytical depth · Decision-making · Cognitive agility', outcome: 'Professionals who don\'t just consume information — they synthesise it into decisions that hold under scrutiny.' },
  M: { focus: 'Execution discipline · Accountability · Resilience · Adaptability', outcome: 'Professionals who finish what they start, improve while doing it, and don\'t externalise when things break.' },
  E: { focus: 'Commercial thinking · Systems building · Venture mindset', outcome: 'Professionals who can build structures that outlast them, not just work well inside ones others built.' },
}

const FORMAT_OPTIONS = [
  { label: 'Half-day intensive', desc: 'Single cluster focus. High-intensity, practical — suited to senior teams with limited time.' },
  { label: 'Two-day cohort workshop', desc: 'One or two clusters, full facilitation. Standard for graduate and mid-career cohorts.' },
  { label: 'Multi-week programme', desc: 'Full PRIME coverage or deep-dive into one cluster. Suited to organisational transformation contexts.' },
  { label: 'Custom format', desc: 'Built to your team size, delivery preference, and the specific cluster profile your VALU Index surfaced.' },
]

export default function ProgrammesPage() {
  return (
    <>
      <Nav />
      <main id="main-content">

        {/* HERO */}
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">DEVELOPMENT PROGRAMMES</span></div>
            <h1 className="page-title">A programme<br />for every <em>cluster.</em></h1>
            <p className="page-sub">
              Every Valoria Develop programme is built against one or more PRIME clusters — the same architecture the VALU Index measures against. So development closes real gaps, not hypothetical ones. And movement shows up in the next assessment, not just in feedback forms.
            </p>
            <div className="page-hero-actions">
              <a href="/contact-us" className="btn-gold">COMMISSION A PROGRAMME</a>
              <a href="/prime" className="btn-outline">SEE THE PRIME FRAMEWORK</a>
            </div>
          </div>
        </section>

        {/* THE FIVE PROGRAMMES */}
        <section className="page-section">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THE FIVE PROGRAMMES</span></div>
              <h2 className="section-title" style={{ marginBottom: '40px' }}>Built on PRIME.<br /><em>Measured against it too.</em></h2>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {PRIME_CLUSTERS.map((c) => {
                const detail = CLUSTER_DETAIL[c.letter]
                return (
                  <Reveal key={c.letter}>
                    <div className="card-gold" style={{ "--card-color": c.color }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div className="cluster-letter" style={{ color: c.color, fontSize: '28px', lineHeight: 1 }}>{c.letter}</div>
                        <div className="cluster-name">{c.name} Programme</div>
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', color: 'rgba(201,168,76,.5)', marginBottom: '8px', textTransform: 'uppercase' }}>Focus areas</div>
                      <p className="cluster-desc" style={{ marginBottom: '16px' }}>{detail?.focus}</p>
                      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', color: 'rgba(201,168,76,.5)', marginBottom: '8px', textTransform: 'uppercase' }}>Outcome</div>
                      <p className="cluster-desc">{detail?.outcome}</p>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        {/* HOW PROGRAMMES ARE MEASURED */}
        <section className="page-section alt">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">WHY MEASUREMENT MATTERS</span></div>
              <h2 className="section-title">Development that<br /><em>shows up in the numbers.</em></h2>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px' }}>
                Because Valoria Develop programmes run on the same PRIME framework as the VALU Index, the before-and-after measurement is built in. Teams take the VALU Index before the programme. They retake it 90 days after. The cluster score movement is your ROI — visible, specific, and comparable across the cohort.
              </p>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px', marginTop: '16px' }}>
                Most organisations spend training budgets and then rely on a Net Promoter Score to know if it worked. Valoria Develop gives you a five-cluster score instead.
              </p>
            </Reveal>
            <Reveal>
              <ul className="checklist" role="list">
                {[
                  'Pre-programme VALU Index establishes the baseline across all five clusters',
                  'Programme targets the specific cluster(s) where movement is needed most',
                  'Certified facilitators deliver against defined PRIME behavioural anchors',
                  'Post-programme VALU Index (90 days out) shows what actually moved',
                  'Cohort-level reporting available for organisational development leads',
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

        {/* FORMAT OPTIONS */}
        <section className="page-section">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="eyebrow-line" /><span className="eyebrow-text">DELIVERY FORMATS</span><div className="eyebrow-line" /></div>
              <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Built around<br /><em>your team, not ours.</em></h2>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {FORMAT_OPTIONS.map((f, i) => (
                <Reveal key={i}>
                  <div className="card-gold">
                    <div className="cluster-name" style={{ marginBottom: '10px', fontSize: '14px' }}>{f.label}</div>
                    <p className="cluster-desc">{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <p style={{ color: 'var(--faint)', fontSize: '12px', marginTop: '32px', textAlign: 'center' }}>
              Full programme outlines, facilitator profiles, and commercial terms are confirmed at commissioning.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="page-section alt cta-banner">
          <Reveal>
            <h2 className="section-title">Commission a programme<br /><em>against the standard.</em></h2>
            <p className="page-sub">Tell us which cluster your team needs to close, and we&apos;ll match you with the right certified facilitator.</p>
            <div className="page-hero-actions" style={{ justifyContent: 'center' }}>
              <a href="/contact-us" className="btn-gold">COMMISSION A PROGRAMME</a>
              <a href="/facilitators" className="btn-outline">HOW COMMISSIONING WORKS</a>
            </div>
          </Reveal>
        </section>

      </main>
      <Footer />
    </>
  )
}
