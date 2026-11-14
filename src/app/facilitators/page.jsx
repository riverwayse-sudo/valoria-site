import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import '../pages.css'

export const metadata = {
  title: 'Development Programmes — Valoria Develop',
  description: 'Explore PRIME-aligned development programmes for individuals and organisations, with scope, facilitator suitability and measurement agreed for each engagement.',
  keywords: ['facilitator commissioning', 'corporate development programmes', 'PRIME-aligned development', 'team capability development', 'Valoria Develop', 'capability development'],
  openGraph: {
    title: 'Commission Facilitators — Valoria Develop | Valoria Institute',
    description: 'Facilitator suitability confirmed for each engagement. Programmes mapped to the same clusters used by the VALU Index.',
    url: 'https://valoriainstitute.com/facilitators',
  },
  alternates: { canonical: 'https://valoriainstitute.com/facilitators' },
}

const HOW_IT_WORKS = [
  { step: '01', title: 'Tell us what you need.', body: 'Submit an enquiry through the platform or contact us directly. Tell us which cluster your team needs to close — Presence, Relationships, Intelligence, Mastery, or Enterprise — and the context: team size, delivery format, timeline.' },
  { step: '02', title: 'We identify a suitable facilitator.', body: 'We review available facilitator experience, declared capabilities and relevant qualifications against your programme requirements. Suitability and assessment status are confirmed before an engagement is agreed.' },
  { step: '03', title: 'The programme follows the framework.', body: 'Programmes are designed around the PRIME capability framework and the priorities agreed with your organisation. Delivery content and outcomes are defined for the engagement.' },
  { step: '04', title: 'Review progress against agreed measures.', body: 'Where assessment or follow-up measurement is included in the scope, the approach, timing and reporting are agreed before delivery.' },
]

const DIFF = [
  { label: 'PRIME-aligned programme delivery', desc: 'Programme design follows the PRIME capability framework and is scoped around the organisation’s development priorities.' },
  { label: 'Mapped to your VALU gaps', desc: 'If your team\'s Intelligence cluster scores are pulling the total down, that\'s where the programme targets. Not a generic leadership module.' },
  { label: 'Measurable by design', desc: 'Where included in the agreed scope, assessment before and after a programme can provide a structured view of progress.' },
  { label: 'One team, or a full cohort', desc: 'Commission for a single senior team, a graduate cohort, or a multi-site org. The framework scales — the delivery doesn\'t change.' },
]

export default function FacilitatorsPage() {
  return (
    <>
      <Nav />
      <main id="main-content">

        {/* HERO */}
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text" >03 &nbsp;&middot;&nbsp; FOR TRAINING BUYERS</span></div>
            <h1 className="page-title">Don&apos;t train on theory.<br /><em>Train on the framework.</em></h1>
            <p className="page-sub">
              Valoria Develop is Valoria Institute’s development pathway. Programmes are mapped to the PRIME capability architecture and designed to close defined development gaps with intention.
            </p>
            <div className="page-hero-actions">
              <a href="/contact-us" className="btn-gold">COMMISSION A PROGRAMME</a>
              <a href="/valoria-develop" className="btn-outline">DISCUSS A DEVELOPMENT PROGRAMME</a>
            </div>
          </div>
        </section>

        {/* THE PROBLEM WITH CORPORATE TRAINING */}
        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THE PROBLEM WITH MOST TRAINING</span></div>
              <h2 className="section-title">PRIME is the architecture.<br /><em>Facilitators are the delivery.</em></h2>
              <p className="page-copy">
                Most corporate training programmes fail the same way: they run on generic content, delivered by trainers who weren&apos;t assessed against the same standard being taught, and measured by attendance sheets rather than capability movement. Six weeks later, nothing has changed except the training budget.
              </p>
              <p className="page-copy page-copy-spaced">
                Valoria Develop programmes are designed around the five PRIME clusters used by the VALU Index. Facilitator suitability, programme scope and any assessment or follow-up measurement are confirmed for each engagement.
              </p>
            </Reveal>
            <Reveal>
              <ul className="checklist" role="list">
                {[
                  'Facilitator experience and relevant qualifications reviewed for each engagement',
                  'Programmes mapped to the same five clusters as the VALU Index',
                  'Commission for a single team or a full organisational cohort',
                  'Where agreed, use assessment to review capability development over time',
                  'In-person, virtual, or hybrid delivery — confirmed at commissioning',
                ].map((t, i) => (
                  <li key={i}>
                    <span className="dot"><svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="page-section alt">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow" className="eyebrow eyebrow-center"><div className="eyebrow-line" /><span className="eyebrow-text">HOW COMMISSIONING WORKS</span><div className="eyebrow-line" /></div>
              <h2 className="section-title" className="section-title section-title-centered">From capability priorities<br /><em>to intentional development.</em></h2>
            </Reveal>
            <div className="facilitator-grid">
              {HOW_IT_WORKS.map(s => (
                <Reveal key={s.step}>
                  <div className="card-gold">
                    <div className="facilitator-step">{s.step}</div>
                    <div className="cluster-name" className="cluster-name cluster-name-spaced">{s.title}</div>
                    <p className="cluster-desc">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* WHAT MAKES IT DIFFERENT */}
        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">WHAT MAKES IT DIFFERENT</span></div>
              <h2 className="section-title">Not a training programme.<br /><em>A development system.</em></h2>
              <p className="page-copy">
                The difference between a training programme and a development system is measurement. Valoria Develop is built around the same five PRIME clusters the VALU Index runs on — so there is a measurable standard before, during, and after.
              </p>
            </Reveal>
            <Reveal>
              <div className="facilitator-diff-list">
                {DIFF.map((d, i) => (
                  <div key={i} className="facilitator-diff">
                    <div className="facilitator-dot" />
                    <div>
                      <div className="facilitator-diff-title">{d.label}</div>
                      <p className="facilitator-diff-copy">{d.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="page-section alt cta-banner">
          <Reveal>
            <div className="eyebrow" className="eyebrow eyebrow-center"><div className="eyebrow-line" /><span className="eyebrow-text">FOR TRAINING BUYERS</span><div className="eyebrow-line" /></div>
            <h2 className="section-title">Commission a programme<br /><em>against the standard.</em></h2>
            <p className="page-sub">Valoria Develop runs through a direct conversation for now — tell us the cluster, the team, and the context, and we&apos;ll match you with the right facilitator.</p>
            <div className="page-hero-actions" className="eyebrow eyebrow-center">
              <a href="/contact-us" className="btn-gold">COMMISSION A PROGRAMME</a>
              <a href="/programmes" className="btn-outline">SEE PROGRAMMES BY CLUSTER</a>
            </div>
          </Reveal>
        </section>

      </main>
      <Footer />
    </>
  )
}
