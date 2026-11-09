import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import '../pages.css'

export const metadata = {
  title: 'About Valoria Institute | Professional Capability Institution',
  description: 'Valoria Institute is a professional capability institution that assesses, develops and connects professional capability through PRIME, the VALU Index and Valoria Marketplace. Nigeria is its current operating market.',
  keywords: ['Valoria Institute', 'professional capability', 'PRIME framework', 'VALU Index', 'professional development', 'talent marketplace'],
  openGraph: {
    title: 'About Valoria Institute',
    description: 'A professional capability institution connecting understanding, development and opportunity.',
    url: 'https://valoriainstitute.com/about-us',
  },
  alternates: { canonical: 'https://valoriainstitute.com/about-us' },
}

const PRINCIPLES = [
  { num: '01', title: 'Merit over familiarity.', body: 'Capability should be developed and assessed against a consistent standard. Visibility should follow merit rather than familiarity, network proximity or a polished presentation.' },
  { num: '02', title: 'Development before visibility.', body: 'Professional growth comes before public recognition. Valoria helps people strengthen capability before connecting that capability to relevant opportunities.' },
  { num: '03', title: 'One institution. Multiple pathways.', body: 'PRIME is the shared capability framework beneath assessment, development and professional visibility across Valoria.' },
]

const FOUNDATIONS = [
  { title: 'Mission', body: 'Develop professional capability, make merit more visible, and connect people to meaningful opportunity.' },
  { title: 'Vision', body: 'An Africa where professional capability is recognised, developed and connected to opportunity.' },
  { title: 'Purpose', body: 'Build the institutional infrastructure that helps people and organisations understand, strengthen and mobilise capability.' },
]

const POSITIONING = [
  { title: 'Not a conventional recruitment agency', body: 'The Valoria Marketplace supports capability-led discovery. Hiring decisions remain with the organisations making them.' },
  { title: 'More than a training catalogue', body: 'Valoria Institute provides the institutional framework. Valoria Develop translates PRIME into structured development pathways.' },
  { title: 'More than a speaker directory', body: 'ATB Spotlight helps event organisers and programme teams discover speakers and facilitators through capability-led professional profiles.' },
  { title: 'Credentials are governed, not implied', body: 'Certification pathways are being developed. No professional is described as certified until the relevant assessment, approval and issuance process is operational.' },
  { title: 'Not simply a jobs board', body: 'Opportunities are presented as active only when there is real supply and a working application or enquiry route.' },
]

const TIMELINE = [
  { year: 'The challenge', label: 'Across hiring, speaking and training, buyers often make decisions with incomplete signals. CVs, biographies and referrals describe parts of a person’s experience, but do not always provide a consistent view of capability.' },
  { year: 'The framework', label: 'PRIME establishes a shared language for professional capability across Presence, Relationships, Intelligence, Mastery and Enterprise.' },
  { year: 'The assessment', label: 'The VALU Index translates assessment into a structured view of capability, expressed in points and used to inform professional development.' },
  { year: 'The connection', label: 'The Valoria Marketplace creates pathways through which employers, event organisers and programme teams can discover relevant professional expertise.' },
]

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="about-page">
        <section className="page-hero about-cinematic-hero">
          <div className="about-cinematic-image" aria-hidden="true">
            <img src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=2200&q=90" alt="" fetchPriority="high" />
          </div>
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">ABOUT VALORIA INSTITUTE</span></div>
            <h1 className="page-title">A professional capability institution.<br /><em>Built for what comes next.</em></h1>
            <p className="page-sub">Valoria Institute helps professionals understand and strengthen their capabilities, and helps organisations discover and engage expertise. We bring together a shared capability framework, structured assessment, professional development and a Registry for discovery. Our initial operating market is Nigeria, with an international outlook.</p>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THE PROBLEM WE ADDRESS</span></div>
              <h2 className="section-title">A great CV and a <em>great decision</em> are not the same thing.</h2>
              <p className="page-copy">In hiring, speaking and training, buyers often have to make decisions with incomplete signals. A CV or biography can describe experience, but it may not show how a person thinks, works or contributes. Professionals can be overlooked when access and familiarity shape who gets considered.</p>
              <p className="page-copy page-copy-spaced">Valoria Institute exists to make professional capability easier to understand, develop and present. Its approach connects a shared framework, an assessment-led index, development pathways and a capability-led talent bureau.</p>
            </Reveal>
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THE INSTITUTIONAL RESPONSE</span></div>
              <h2 className="section-title">Develop.<br /><em>Surface. Connect.</em></h2>
              <p className="page-copy">PRIME provides the capability framework. The VALU Index provides an assessment-led view of capability. Valoria Develop supports structured growth. The Valoria Marketplace connects employers, event organisers and programme teams with relevant professional expertise.</p>
              <p className="page-copy page-copy-spaced">One institution. One connected system. Distinct pathways for professional merit.</p>
            </Reveal>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">MISSION, VISION & PURPOSE</span></div>
              <h2 className="section-title">The conviction <em>behind the institution.</em></h2>
            </Reveal>
            <div className="about-principles-grid">
              {FOUNDATIONS.map((item, i) => (
                <Reveal key={item.title}>
                  <div className="card-gold">
                    <div className="vi-card-num">0{i + 1}</div>
                    <div className="vi-card-name about-principle-name">{item.title}</div>
                    <p className="vi-card-body">{item.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="page-section alt">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">WHAT WE OPERATE BY</span></div>
              <h2 className="section-title">Three principles that <em>do not move.</em></h2>
            </Reveal>
            <div className="about-principles-grid">
              {PRINCIPLES.map((item) => (
                <Reveal key={item.num}>
                  <div className="card-gold">
                    <div className="vi-card-num">{item.num}</div>
                    <div className="vi-card-name about-principle-name">{item.title}</div>
                    <p className="vi-card-body">{item.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">A DISTINCT INSTITUTIONAL ROLE</span></div>
              <h2 className="section-title">What Valoria is.<br /><em>And how it is different.</em></h2>
            </Reveal>
            <div className="about-principles-grid">
              {POSITIONING.map((item, i) => (
                <Reveal key={item.title}>
                  <div className="card-gold">
                    <div className="vi-card-num">0{i + 1}</div>
                    <div className="vi-card-name about-principle-name">{item.title}</div>
                    <p className="vi-card-body">{item.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-inner about-story">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THE INSTITUTIONAL MODEL</span></div>
              <h2 className="section-title">From capability <em>to opportunity.</em></h2>
            </Reveal>
            <div className="about-timeline">
              {TIMELINE.map((item, i) => (
                <Reveal key={item.year}>
                  <div className={`about-timeline-row${i < TIMELINE.length - 1 ? ' has-divider' : ''}`}>
                    <div className="about-timeline-label">{item.year}</div>
                    <p className="about-timeline-copy">{item.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="page-section alt">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">WORK WITH VALORIA</span></div>
              <h2 className="section-title">Build a stronger <em>capability infrastructure.</em></h2>
              <p className="page-sub">Valoria Institute is rooted in African professional experience and designed for continental growth. Nigeria is its current operating market, with broader expansion guided by institutional readiness and partnerships.</p>
              <div className="page-hero-actions">
                <a href="/contact-us" className="btn-gold">DISCUSS A PARTNERSHIP</a>
                <a href="/valu" className="btn-outline">EXPLORE THE VALU INDEX</a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
