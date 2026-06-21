import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import { PRIME_CLUSTERS } from '@/lib/brand'
import '../pages.css'

export const metadata = {
  title: 'The PRIME Framework — Five Clusters. One Assessed Standard.',
  description: 'PRIME defines what professional capability actually means across five dimensions: Presence, Relationships, Influence, Mastery, Enterprise. It is the architecture beneath the VALU Index and every Valoria programme.',
  keywords: ['PRIME framework', 'professional capability assessment', 'VALU Index clusters', 'African professional standard', 'Presence Relationships Influence Mastery Enterprise'],
  openGraph: {
    title: 'The PRIME Framework | Valoria Institute',
    description: 'Five clusters. One assessed standard. PRIME is the architecture beneath the VALU Index.',
    url: 'https://valoriainstitute.com/prime',
  },
  alternates: { canonical: 'https://valoriainstitute.com/prime' },
}

const CLUSTER_DATA = {
  P: {
    subtitle: 'How a professional shows up.',
    body: 'Presence is the cluster that determines whether capability lands. Composure under scrutiny, clarity of communication, and the ability to carry your own expertise into a room without losing it to nerves, noise, or hierarchy. A high Presence score means your thinking gets heard — not just submitted.',
    signals: ['Communicates with clarity and intention', 'Maintains composure under scrutiny', 'Projects credibility in high-stakes environments', 'Carries personal expertise without overstatement'],
    weight: 'High-weight for speakers, senior hires, and client-facing roles.',
  },
  R: {
    subtitle: 'How a professional works with others.',
    body: 'Relationships is the cluster that determines whether a professional can build the conditions for other people to do their best work. Trust-building, collaborative intelligence, and the quality of the networks a professional both maintains and creates. A high Relationships score means people choose to work with you again.',
    signals: ['Builds genuine trust across working relationships', 'Collaborates without losing individual accountability', 'Sustains networks that generate mutual value', 'Navigates conflict without destroying the relationship'],
    weight: 'High-weight for team leads, partnership roles, and collaborative environments.',
  },
  I: {
    subtitle: 'How a professional moves a decision.',
    body: 'Influence is the cluster that separates contributors from drivers. Critical thinking, strategic positioning, and the ability to shift outcomes — not just contribute an opinion to them. A high Influence score means your input changes what happens next, not just what gets discussed.',
    signals: ['Thinks critically rather than reactively', 'Positions arguments to land, not just to inform', 'Shapes decisions before they are made', 'Builds and uses credibility as strategic capital'],
    weight: 'High-weight for consulting, advisory, thought leadership, and senior leadership roles.',
  },
  M: {
    subtitle: 'How a professional delivers.',
    body: 'Mastery is the cluster that determines whether things actually get done. Execution discipline, accountability, resilience under pressure, and the ability to adapt without losing direction. A high Mastery score means you finish what you start — and you improve while doing it.',
    signals: ['Executes with discipline, not just intention', 'Holds accountability without externalising failure', 'Adapts under pressure without losing direction', 'Continuously builds depth within their domain'],
    weight: 'High-weight for operators, delivery leads, and roles where output is the primary measure.',
  },
  E: {
    subtitle: 'How a professional builds and operates.',
    body: 'Enterprise is the cluster that separates professionals who work inside systems from those who build them. Commercial thinking, venture mindset, and the ability to stand up and run structures — teams, products, or entire functions — that outlast the individual. A high Enterprise score means you can build something, not just contribute to one.',
    signals: ['Applies commercial logic to professional decisions', 'Builds systems and structures that scale', 'Identifies and pursues value creation opportunities', 'Operates effectively with incomplete information'],
    weight: 'High-weight for founders, senior operators, and entrepreneurs in residence.',
  },
}

const HOW_IT_WORKS = [
  { step: '01', title: 'You take the VALU Index.', body: '18 to 28 minutes of scenario-based questions, free. No self-reporting. No skill checklists. Situational responses that the framework scores against defined behavioural anchors.' },
  { step: '02', title: 'Your PRIME profile is generated.', body: 'A score across all five clusters, a total VALU Index score, and a tier designation (Standard, Proficient, Distinguished, or Elite) based on where your profile sits against the full assessed cohort.' },
  { step: '03', title: 'Your profile becomes your signal.', body: 'Employers, event organisers, and training buyers on the platform search against your PRIME profile — not your CV, not your job title, not who they already know.' },
]

export default function PrimePage() {
  return (
    <>
      <Nav />
      <main id="main-content">

        {/* HERO */}
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THE CAPABILITY ARCHITECTURE</span></div>
            <h1 className="page-title">Five clusters.<br />One <em>assessed standard.</em></h1>
            <p className="page-sub">
              PRIME is the framework underneath the VALU Index and every Valoria Develop programme. It defines what &ldquo;capable&rdquo; actually means across five dimensions — so assessments can be consistent, comparable, and impossible to game with a well-formatted résumé.
            </p>
            <div className="page-hero-actions">
              <a href="https://assessment.valoriainstitute.com/" className="btn-gold" target="_blank" rel="noopener noreferrer">SEE YOUR OWN PRIME PROFILE — FREE</a>
              <a href="/programmes" className="btn-outline">SEE PROGRAMMES BY CLUSTER</a>
            </div>
          </div>
        </section>

        {/* THE FIVE CLUSTERS — expanded */}
        <section className="page-section">
          <div className="page-section-inner" style={{ maxWidth: '820px' }}>
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THE FIVE CLUSTERS</span></div>
              <h2 className="section-title" style={{ marginBottom: '48px' }}>What PRIME<br /><em>actually measures.</em></h2>
            </Reveal>
            {PRIME_CLUSTERS.map((c) => {
              const data = CLUSTER_DATA[c.letter]
              return (
                <Reveal key={c.letter}>
                  <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: '32px', padding: '40px 0', borderBottom: '1px solid rgba(201,168,76,.08)', alignItems: 'start' }}>
                    <div>
                      <div className="cluster-letter" style={{ color: c.color, fontSize: '40px', lineHeight: 1 }}>{c.letter}</div>
                    </div>
                    <div>
                      <div className="cluster-name" style={{ color: 'var(--parchment)', marginBottom: '4px' }}>{c.name}</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: c.color, letterSpacing: '.06em', marginBottom: '16px' }}>{data?.subtitle}</div>
                      <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px', marginBottom: '20px' }}>{data?.body}</p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {data?.signals.map((s, i) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'var(--dim)', fontSize: '13px', fontWeight: 300 }}>
                            <span style={{ color: c.color, marginTop: '2px', flexShrink: 0 }}>
                              <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke={c.color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </span>
                            {s}
                          </li>
                        ))}
                      </ul>
                      <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.1em', color: 'rgba(201,168,76,.4)', textTransform: 'uppercase' }}>{data?.weight}</div>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </section>

        {/* HOW SCORING WORKS */}
        <section className="page-section alt">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="eyebrow-line" /><span className="eyebrow-text">HOW THE SCORING WORKS</span><div className="eyebrow-line" /></div>
              <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '48px' }}>From assessment<br /><em>to marketplace signal.</em></h2>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {HOW_IT_WORKS.map(s => (
                <Reveal key={s.step}>
                  <div className="card-gold">
                    <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.16em', color: 'rgba(201,168,76,.45)', marginBottom: '12px' }}>{s.step}</div>
                    <div className="cluster-name" style={{ marginBottom: '10px' }}>{s.title}</div>
                    <p className="cluster-desc">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* TIER DESIGNATIONS */}
        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">TIER DESIGNATIONS</span></div>
              <h2 className="section-title">Four tiers.<br /><em>One standard.</em></h2>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px' }}>
                PRIME scores roll up into a total VALU Index score and a tier designation that buyers use to filter the marketplace. Tiers are not permanent — professionals can reassess after 90 days, and scores update as the cohort grows.
              </p>
            </Reveal>
            <Reveal>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { tier: 'Elite', range: '90–100', desc: 'Top-percentile performance across all five clusters. Prioritised in search results.', color: '#C9A84C' },
                  { tier: 'Distinguished', range: '75–89', desc: 'Strong performance with clear cluster strengths. Visible across all three marketplace entry points.', color: '#7F77DD' },
                  { tier: 'Proficient', range: '55–74', desc: 'Solid assessed baseline. Listed and searchable, eligible for development through Valoria Develop.', color: '#378ADD' },
                  { tier: 'Standard', range: '35–54', desc: 'Assessed and on-platform. Eligible for cluster development to move up to Proficient.', color: '#1D9E75' },
                ].map(t => (
                  <div key={t.tier} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '16px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(201,168,76,.08)', borderRadius: '8px' }}>
                    <div style={{ flexShrink: 0, minWidth: '90px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: t.color }}>{t.tier}</div>
                      <div style={{ fontSize: '11px', color: 'var(--faint)', marginTop: '2px' }}>{t.range}</div>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--dim)', fontWeight: 300, lineHeight: 1.6, margin: 0 }}>{t.desc}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="page-section alt cta-banner">
          <Reveal>
            <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="eyebrow-line" /><span className="eyebrow-text">SEE WHERE YOU SCORE</span><div className="eyebrow-line" /></div>
            <h2 className="section-title">Find out your<br /><em>own PRIME profile.</em></h2>
            <p className="page-sub">The VALU Index scores you across all five clusters in 18 to 28 minutes. Free, and valid for 12 months.</p>
            <div className="page-hero-actions" style={{ justifyContent: 'center' }}>
              <a href="https://assessment.valoriainstitute.com/" className="btn-gold" target="_blank" rel="noopener noreferrer">BEGIN THE VALU INDEX — FREE</a>
              <a href="/programmes" className="btn-outline">SEE DEVELOPMENT PROGRAMMES</a>
            </div>
          </Reveal>
        </section>

      </main>
      <Footer />
    </>
  )
}
