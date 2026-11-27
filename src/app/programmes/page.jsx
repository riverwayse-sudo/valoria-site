import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import { PRIME_CLUSTERS } from '@/lib/brand'
import '../pages.css'

export const metadata = {
  title: 'Development Programmes',
  description: 'PRIME-aligned development for individuals and organisations. Programme scope, facilitator suitability, delivery format and any follow-up measurement are confirmed for each engagement.',
  keywords: ['PRIME programmes', 'professional capability development', 'VALU Index development', 'Valoria Develop programmes', 'organisational development'],
  openGraph: {
    title: 'Development Programmes | Valoria Institute',
    description: 'A programme for every cluster. Development that maps to the same standard you\'re measured against.',
    url: 'https://valoriainstitute.com/programmes',
  },
  alternates: { canonical: 'https://valoriainstitute.com/programmes' },
}

const CLUSTER_DETAIL = {
  P: { outcome: 'Professionals who can carry their capability clearly into any room — without losing it to nerves, noise, or hierarchy.' },
  R: { outcome: 'Professionals who don\'t just work with others — they raise the output of everyone around them.' },
  I: { outcome: 'Professionals who don\'t just consume information — they synthesise it into decisions that hold under scrutiny.' },
  M: { outcome: 'Professionals who finish what they start, improve while doing it, and don\'t externalise when things break.' },
  E: { outcome: 'Professionals who can build structures that outlast them, not just work well inside ones others built.' },
}


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
              Every Valoria Develop programme is built against one or more PRIME clusters — the same framework used by the VALU Index. Programme scope and follow-up measurement are agreed with each organisation.
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
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THE FIVE PRIME CLUSTERS</span></div>
              <h2 className="section-title programmes-clusters-title">Built on PRIME.<br /><em>Scoped to the need.</em></h2>
            </Reveal>
            <div className="programmes-grid">
              {PRIME_CLUSTERS.map((c) => {
                const detail = CLUSTER_DETAIL[c.letter]
                return (
                  <Reveal key={c.letter}>
                    <div className="card-gold programme-card">
                      <div className="programme-head">
                        <div className="cluster-letter programme-letter">{c.letter}</div>
                        <div className="cluster-name">{c.name} Programme</div>
                      </div>
                      <div className="programme-label">Focus areas</div>
                      <p className="cluster-desc programme-focus">{c.skills.join(' · ')}</p>
                      <div className="programme-label">Outcome</div>
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
              <h2 className="section-title">Development guided by<br /><em>a clearer standard.</em></h2>
              <p className="page-copy">
                Because Valoria Develop programmes use the same PRIME framework as the VALU Index, baseline and follow-up measurement can be included where agreed. The timing and reporting approach are confirmed in the programme scope. Cluster score movement can then provide a structured view of progress.
              </p>
              <p className="page-copy page-copy-spaced">
                Training activity alone does not establish capability movement. Where included in the agreed scope, a follow-up VALU Index can provide a structured view of progress against the PRIME framework.
              </p>
            </Reveal>
            <Reveal>
              <ul className="checklist" role="list">
                {[
                  'Where included, a pre-programme VALU Index can establish a baseline across all five clusters',
                  'Programme targets the specific cluster(s) where movement is needed most',
                  'Programme delivery is scoped against relevant PRIME behavioural anchors',
                  'Where included, a follow-up VALU Index provides a structured view of progress; timing is agreed in the programme scope',
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

        {/* FACILITATOR FIT AND COMMISSIONING */}
        <section className="page-section" id="commissioning">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow eyebrow-center"><div className="eyebrow-line" /><span className="eyebrow-text">FACILITATOR FIT &amp; COMMISSIONING</span><div className="eyebrow-line" /></div>
              <h2 className="section-title section-title-centered">The right scope.<br /><em>The right delivery.</em></h2>
              <p className="page-copy" style={{ maxWidth: '760px', margin: '0 auto 36px', textAlign: 'center' }}>
                Valoria Develop engagements are scoped around the capability priorities, audience and context. Facilitator experience and relevant qualifications are reviewed against the brief before an engagement is confirmed.
              </p>
            </Reveal>
            <div className="facilitator-grid">
              {[
                { step: '01', title: 'Define the capability priority.', body: 'Tell us which PRIME cluster or development need matters, who the programme is for, and the context in which the capability will be used.' },
                { step: '02', title: 'Scope the engagement.', body: 'We review the programme objective, participant group, delivery approach, timeline and the evidence or measurement required.' },
                { step: '03', title: 'Confirm facilitator suitability.', body: 'Relevant experience, declared capabilities and qualifications are reviewed against the agreed programme requirements.' },
                { step: '04', title: 'Agree delivery and review.', body: 'Delivery format, duration, commercial terms and any follow-up measurement are documented before the programme begins.' },
              ].map(s => (
                <Reveal key={s.step}>
                  <div className="card-gold">
                    <div className="facilitator-step">{s.step}</div>
                    <div className="cluster-name cluster-name-spaced">{s.title}</div>
                    <p className="cluster-desc">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <p className="page-copy page-copy-spaced" style={{ maxWidth: '760px', margin: '28px auto 0', textAlign: 'center' }}>
              Follow-up VALU measurement is included only where agreed in the programme scope. No facilitator is described as certified unless the relevant certification has been formally awarded.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="page-section alt cta-banner">
          <Reveal>
            <h2 className="section-title">Commission a programme<br /><em>against the standard.</em></h2>
            <p className="page-sub">Tell us which cluster your team needs to address. We&apos;ll review your requirements and confirm facilitator suitability for the engagement.</p>
            <div className="page-hero-actions" style={{ justifyContent: 'center' }}>
              <a href="/contact-us" className="btn-gold">COMMISSION A PROGRAMME</a>
              <a href="#commissioning" className="btn-outline">HOW COMMISSIONING WORKS</a>
            </div>
          </Reveal>
        </section>

      </main>
      <Footer />
    </>
  )
}
