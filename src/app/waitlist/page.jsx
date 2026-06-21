import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import WaitlistForm from '@/components/WaitlistForm'
import '../pages.css'

export const metadata = {
  title: 'Join the Founding Cohort — Valoria Institute',
  description: 'The founding cohort gets first access to the marketplace, priority placement in search, and a direct line to shape how Valoria develops. Applications close when the cohort fills.',
  keywords: ['Valoria Institute waitlist', 'founding cohort Africa', 'early access professional marketplace', 'ATB Connect early access'],
  openGraph: {
    title: 'Join the Founding Cohort | Valoria Institute',
    description: 'First access. Priority placement. A direct line to shape what the platform becomes.',
    url: 'https://valoriainstitute.com/waitlist',
  },
  alternates: { canonical: 'https://valoriainstitute.com/waitlist' },
}

const COHORT_BENEFITS = [
  { num: '01', title: 'First access.', desc: 'Founding cohort members get into the marketplace before it opens to general applicants. No queue. No wait.' },
  { num: '02', title: 'Priority placement.', desc: 'When general search opens, founding cohort profiles are weighted in results. Being first in means staying visible.' },
  { num: '03', title: 'Direct input.', desc: 'How ATB Connect, Spotlight, and Develop evolve will be shaped by what the founding cohort actually uses and needs. That input window closes when the cohort fills and the platform scales.' },
  { num: '04', title: 'Early intelligence.', desc: 'First to know when new sectors, geographies, and platform features go live — and first to benefit from them.' },
]

const WHO_FOR = [
  { type: 'Professionals', desc: 'You want your capability visible to the right employers and event organisers — and you want to be assessed, not just listed. The founding cohort gets priority placement once the marketplace opens to search.' },
  { type: 'Employers', desc: 'You want to search assessed African talent before the general market does. Founding employer accounts get early access to the talent pool and direct input into how search and filtering evolve.' },
  { type: 'Event Organisers', desc: 'You want speaker discovery beyond the names you already know. Founding organiser accounts get early access to the Spotlight roster and shape how the speaker marketplace develops.' },
]

export default function WaitlistPage() {
  return (
    <>
      <Nav />
      <main id="main-content">

        {/* HERO */}
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">FOUNDING COHORT</span></div>
            <h1 className="page-title">Get in before<br />the <em>marketplace fills up.</em></h1>
            <p className="page-sub">
              The founding cohort is a deliberately small group of professionals, employers, and event organisers who shape how the Valoria marketplace develops from the inside. The application window is open. It closes when the cohort is full.
            </p>
          </div>
        </section>

        {/* WHAT YOU GET */}
        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">WHAT FOUNDING COHORT MEANS</span></div>
              <h2 className="section-title">Not a waitlist.<br /><em>A head start.</em></h2>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px' }}>
                Most waitlists are a queue. This one is a deliberate design choice: we want the founding cohort to be the group that shapes the marketplace before it scales — not a long list of emails waiting to be told it&apos;s their turn. If you&apos;re in, you&apos;re in early, with full access and real input. If the cohort fills before your application is reviewed, you&apos;ll be notified and moved to general access priority.
              </p>
            </Reveal>
            <Reveal>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {COHORT_BENEFITS.map(b => (
                  <div key={b.num} style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.14em', color: 'rgba(201,168,76,.4)', flexShrink: 0, paddingTop: '3px', minWidth: '24px' }}>{b.num}</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--parchment)', marginBottom: '4px' }}>{b.title}</div>
                      <p style={{ fontSize: '13px', color: 'var(--dim)', fontWeight: 300, lineHeight: 1.6, margin: 0 }}>{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* WHO IT'S FOR */}
        <section className="page-section alt">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="eyebrow-line" /><span className="eyebrow-text">WHO THE COHORT IS FOR</span><div className="eyebrow-line" /></div>
              <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Three types of<br /><em>founding member.</em></h2>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {WHO_FOR.map((w, i) => (
                <Reveal key={i}>
                  <div className="card-gold">
                    <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.14em', color: 'rgba(201,168,76,.5)', marginBottom: '12px', textTransform: 'uppercase' }}>{w.type}</div>
                    <p className="cluster-desc" style={{ lineHeight: 1.7 }}>{w.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* THE FORM */}
        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">APPLY FOR THE COHORT</span></div>
              <h2 className="section-title">Applications take<br /><em>three minutes.</em></h2>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px' }}>
                We review every application and respond within five business days. If you&apos;re accepted, your access opens immediately. If the cohort fills before your application is reviewed, you&apos;ll be first in line for general access.
              </p>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px', marginTop: '12px' }}>
                Questions first? Email us at{' '}
                <a href="mailto:info@valoriainstitute.com" style={{ color: 'var(--gold)' }}>info@valoriainstitute.com</a>.
              </p>
            </Reveal>
            <Reveal>
              <WaitlistForm />
            </Reveal>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
