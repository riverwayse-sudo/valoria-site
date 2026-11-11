import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import '../pages.css'

export const metadata = {
  title: 'About Valoria Institute | Professional Capability Institution',
  description: 'Valoria Institute is a professional capability institution with an international outlook. Its connected system brings together PRIME, the VALU Index, professional development, institutional standards and capability-led talent discovery. Operating availability and credential status are stated transparently.',
  keywords: ['Valoria Institute', 'professional capability', 'PRIME framework', 'VALU Index', 'professional development', 'talent marketplace'],
  openGraph: {
    title: 'About Valoria Institute',
    description: 'A professional capability institution connecting standards, assessment, development, certification pathways, visibility and opportunity.',
    url: 'https://valoriainstitute.com/about-us',
  },
  alternates: { canonical: 'https://valoriainstitute.com/about-us' },
}

const FOUNDING_STATEMENTS = [
  { title: 'Vision', body: 'A professional landscape where capability can be understood, developed, recognized and connected to opportunity.' },
  { title: 'Mission', body: "To build and operate a trusted professional capability institution: one that assesses capability with structure, supports development with purpose, and helps professionals and organizations connect capability to relevant opportunity." },
  { title: 'Purpose', body: 'To bridge the gap between latent brilliance and institutional scale. We exist because talent is not the problem. Infrastructure is. For every professional whose career has stalled not for lack of ability, but lack of access. Valoria Institute is the answer.' },
]

const PRINCIPLES = [
  { num: '01', title: 'Merit over familiarity.', body: 'Capability should be developed and assessed against a consistent standard. Visibility should follow merit rather than familiarity, network proximity or a polished presentation.' },
  { num: '02', title: 'Development before visibility.', body: 'Professional growth comes before public recognition. Valoria helps people strengthen capability before connecting that capability to relevant opportunities.' },
  { num: '03', title: 'One institution. Multiple pathways.', body: 'PRIME is the shared capability framework beneath assessment, development and professional visibility across Valoria.' },
]

const POSITIONING = [
  { title: 'Not a recruitment agency', body: 'Valoria does not recruit on behalf of employers. The Marketplace helps buyers discover professional profiles and assessment-led insight; hiring decisions and credential checks remain with the organizations making them.' },
  { title: 'Not a training company', body: 'Valoria Institute provides the capability framework and assessment. Valoria Develop supports PRIME-based development pathways for individuals and organizations.' },
  { title: 'Not a speaker bureau', body: 'ATB Spotlight helps event organizers and program buyers discover speakers and facilitators through capability-led profiles and relevant experience.' },
  { title: 'The VALU Index is not itself a certification', body: 'The VALU Index is an assessment result that informs capability development. It is distinct from a professional certification or credential. Valoria Institute’s institutional standards and any certification pathway must be described separately; no credential should be represented as awarded until the relevant approved process is operational and completed.' },
  { title: 'Not a jobs board', body: 'Valoria connects capability to relevant opportunities. An opportunity is presented as active only when real supply and a working application or enquiry route exist.' },
]

const TIMELINE = [
  { year: 'The challenge', label: 'Across hiring, speaking and training, buyers often make decisions with incomplete signals. Resumes, biographies and referrals describe parts of a person’s experience, but do not always provide a consistent view of capability.' },
  { year: 'The framework', label: 'PRIME establishes a shared language for professional capability across Presence, Relationships, Intelligence, Mastery and Enterprise.' },
  { year: 'The assessment', label: 'The VALU Index translates assessment into a structured view of capability, expressed in points and used to inform professional development.' },
  { year: 'The connection', label: 'The Valoria Marketplace creates pathways through which employers, event organizers and program teams can discover relevant professional expertise.' },
]

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="about-page">
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">ABOUT VALORIA INSTITUTE</span></div>
            <h1 className="page-title">Why Valoria <em>exists.</em></h1>
            <p className="page-sub">Talent is not the problem. The mechanisms that turn talent into opportunity are. Valoria is that mechanism.</p>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THE PROBLEM WE ADDRESS</span></div>
              <h2 className="section-title">A great CV and a <em>great decision</em> are not the same thing.</h2>
              <p className="page-copy">In hiring, speaking and training, buyers often have to make decisions with incomplete signals. A CV or biography can describe experience, but it may not show how a person thinks, works or contributes. Professionals can be overlooked when access and familiarity shape who gets considered.</p>
              <p className="page-copy page-copy-spaced">Valoria Institute exists to make professional capability easier to understand, develop and present. Its approach connects a shared framework, an assessment-led index, development pathways and a capability-led marketplace.</p>
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
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">VISION · MISSION · PURPOSE</span></div>
              <h2 className="section-title">The foundations <em>behind the work.</em></h2>
            </Reveal>
            <div className="about-principles-grid">
              {FOUNDING_STATEMENTS.map((item, i) => (
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
              <p className="page-sub">Valoria Institute is designed for professionals, employers and institutions navigating an international professional landscape. Its operating footprint, available services and institutional relationships are communicated transparently; no global accreditation or universal recognition is implied.</p>
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
