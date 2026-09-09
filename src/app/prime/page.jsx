import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import { PRIME_CLUSTERS } from '@/lib/brand'
import '../pages.css'

export const metadata = {
  title: 'The PRIME Framework — Valoria Institute',
  description: 'PRIME is Valoria Institute’s proprietary capability architecture: Presence, Relationships, Intelligence, Mastery and Enterprise.',
  keywords: ['PRIME framework', 'VALU Index', 'African professional capability', 'Presence Relationships Intelligence Mastery Enterprise'],
  alternates: { canonical: 'https://valoriainstitute.com/prime' },
}

const CLUSTER_DATA = {
  P: { body: 'How you show up. Presence measures whether professional capability is communicated with clarity, credibility and composure when the stakes are real.', signals: ['Communication', 'Executive Presence', 'Composure Under Scrutiny'] },
  R: { body: 'How you connect. Relationships measures the ability to build trust, work intelligently with others and sustain networks that create mutual value.', signals: ['Trust-Building', 'Collaborative Intelligence', 'Network Quality'] },
  I: { body: 'How you think. Intelligence measures the quality of professional judgment: critical thinking, analytical depth, decision-making and cognitive agility.', signals: ['Critical Thinking', 'Analytical Depth', 'Decision-Making', 'Cognitive Agility'] },
  M: { body: 'How you deliver. Mastery measures disciplined execution, ownership, resilience and adaptability in the work itself.', signals: ['Execution Discipline', 'Accountability', 'Resilience', 'Adaptability'] },
  E: { body: 'How you build. Enterprise measures the capacity to create value beyond a task: commercial thinking, systems building and venture mindset.', signals: ['Commercial Thinking', 'Systems Building', 'Venture Mindset'] },
}

export default function PrimePage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THE PROPRIETARY CAPABILITY ARCHITECTURE</span></div>
            <h1 className="page-title">Five clusters.<br />Seventeen <em>skills.</em></h1>
            <p className="page-sub">PRIME is the intellectual architecture beneath Valoria Institute. It powers professional assessment, development and structured talent visibility across the ecosystem.</p>
            <div className="page-hero-actions">
              <a href="https://assessment.valoriainstitute.com/" className="btn-gold" target="_blank" rel="noopener noreferrer">BEGIN THE VALU SNAPSHOT</a>
              <a href="/programmes" className="btn-outline">EXPLORE DEVELOPMENT</a>
            </div>
          </div>
        </section>

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
                  <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: '32px', padding: '40px 0', borderBottom: '1px solid rgba(212,201,168,.5)', alignItems: 'start' }}>
                    <div className="cluster-letter" style={{ color: 'var(--gold)', fontSize: '40px', lineHeight: 1 }}>{c.letter}</div>
                    <div>
                      <div className="cluster-name" style={{ color: 'var(--parchment)', marginBottom: '4px' }}>{c.name}</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '.08em', marginBottom: '16px', textTransform: 'uppercase' }}>{c.subtitle}</div>
                      <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px', marginBottom: '20px' }}>{data.body}</p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {data.signals.map((s) => <li key={s} style={{ display: 'flex', gap: '10px', color: 'var(--dim)', fontSize: '13px' }}><span style={{ color: 'var(--gold)' }}>✦</span>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </section>

        <section className="page-section alt">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="eyebrow-line" /><span className="eyebrow-text">THE VALU INDEX</span><div className="eyebrow-line" /></div>
              <h2 className="section-title" style={{ textAlign: 'center' }}>One architecture.<br /><em>One standard.</em></h2>
              <p className="page-sub" style={{ margin: '0 auto', textAlign: 'center' }}>The current public entry experience is a 15-question directional capability snapshot across all five PRIME clusters. It is an entry signal—not a substitute for the full controlled assessment methodology.</p>
            </Reveal>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">MERIT MADE VISIBLE</span></div>
              <h2 className="section-title">Advancement is<br /><em>earned.</em></h2>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px' }}>The Valoria tier system is score-based. It is a trust credential, never a subscription tier or a paid upgrade.</p>
            </Reveal>
            <Reveal>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { tier: 'Elite', range: '90–100', desc: 'Top-percentile performance across all five PRIME clusters.', stars: '✦✦✦' },
                  { tier: 'Distinguished', range: '75–89', desc: 'Strong performance with clear cluster strengths.', stars: '✦✦' },
                  { tier: 'Proficient', range: '55–74', desc: 'Solid assessed baseline and eligible for continued development.', stars: '✦' },
                ].map(t => <div key={t.tier} className="card-gold" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}><div style={{ minWidth: '110px', color: 'var(--gold)', fontWeight: 700 }}><div>{t.stars}</div><div>{t.tier}</div><small style={{ color: 'var(--faint)' }}>{t.range}</small></div><p className="cluster-desc" style={{ margin: 0 }}>{t.desc}</p></div>)}
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
