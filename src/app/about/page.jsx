import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import { PRIME_CLUSTERS } from '@/lib/brand'
import '../pages.css'

export const metadata = {
  title: 'About Valoria Institute — Worth. Built.',
  description: 'Valoria Institute is a capability and opportunity platform connecting professional assessment, development and visibility through the PRIME framework and VALU Index.',
  alternates: { canonical: 'https://valoriainstitute.com/about' },
}

const PATHWAYS = [
  { number: '01', title: 'Assess', body: 'The VALU Index measures professional capability across the PRIME framework. The full assessment contains 58 questions: 54 scored questions and four validity checks. Results are expressed in points.' },
  { number: '02', title: 'Develop', body: 'Valoria Develop offers structured learning formats designed around the capability areas professionals and organisations want to strengthen.' },
  { number: '03', title: 'Connect', body: 'The marketplace and opportunities layer helps professionals become easier to understand and discover when their profile meets the applicable listing and visibility requirements.' },
]

const AUDIENCES = [
  { title: 'Professionals', body: 'Understand your capability, identify development priorities and build a professional profile.' },
  { title: 'Employers', body: 'Explore public professional profiles through declared roles, skills, sectors and VALU evidence.' },
  { title: 'Event organisers', body: 'Find speakers and facilitators by expertise and declared capability.' },
  { title: 'Training buyers', body: 'Scope PRIME-based development around a team, capability cluster and timeline.' },
]

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">ABOUT VALORIA INSTITUTE</span></div>
            <h1 className="page-title">Worth.<br /><em>Built.</em></h1>
            <p className="page-sub">Valoria Institute is a capability and opportunity platform. It helps professionals understand their capability, develop what matters and become discoverable for relevant opportunities through a shared standard.</p>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THE PROBLEM</span></div>
              <h2 className="section-title">Capability can be<br /><em>hard to see.</em></h2>
            </Reveal>
            <Reveal>
              <p className="page-copy">Talent is not the problem. The mechanisms that turn talent into opportunity are. Valoria is that mechanism. Professional decisions still rely on job titles, polished CVs, familiar names and existing networks. Those signals do not always make a person’s actual capability clear.</p>
              <p className="page-copy page-copy-spaced">Professionals need a consistent way to understand and communicate their strengths. Employers, event organisers and training buyers need clearer context when they evaluate people for work and opportunity.</p>
            </Reveal>
          </div>
        </section>

        <section className="page-section alt">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow eyebrow-center"><div className="eyebrow-line" /><span className="eyebrow-text">WHAT VALORIA DOES</span><div className="eyebrow-line" /></div>
              <h2 className="section-title section-title-centered">Assess.<br /><em>Develop. Connect.</em></h2>
            </Reveal>
            <div className="about-principles-grid">
              {PATHWAYS.map(item => <Reveal key={item.number}><article className="card-gold"><div className="vi-card-num">{item.number}</div><div className="vi-card-name about-principle-name">{item.title}</div><p className="vi-card-body">{item.body}</p></article></Reveal>)}
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">WHO WE SERVE</span></div>
              <h2 className="section-title">One standard.<br /><em>Different needs.</em></h2>
            </Reveal>
            <div className="about-principles-grid">
              {AUDIENCES.map((item,index) => <Reveal key={item.title}><article className="card-gold"><div className="vi-card-num">0{index+1}</div><div className="vi-card-name about-principle-name">{item.title}</div><p className="vi-card-body">{item.body}</p></article></Reveal>)}
            </div>
          </div>
        </section>

        <section className="page-section alt">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow eyebrow-center"><div className="eyebrow-line" /><span className="eyebrow-text">THE PRIME FRAMEWORK</span><div className="eyebrow-line" /></div>
              <h2 className="section-title section-title-centered">Five clusters.<br /><em>Seventeen skills.</em></h2>
              <p className="page-sub about-cta-copy">PRIME provides the shared language for the capabilities the VALU Index measures.</p>
            </Reveal>
            <div className="about-principles-grid">
              {PRIME_CLUSTERS.map(cluster => <Reveal key={cluster.letter}><article className="card-gold"><div className="vi-card-num">{cluster.letter}</div><div className="vi-card-name about-principle-name">{cluster.name}</div><p className="vi-card-body">{cluster.skills.join(' · ')}</p></article></Reveal>)}
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">WHAT VALORIA IS — AND IS NOT</span></div>
              <h2 className="section-title">A standard for<br /><em>capability and opportunity.</em></h2>
            </Reveal>
            <Reveal>
              <div className="page-copy about-boundaries">
                <p>Valoria is not a recruitment agency; it does not recruit or employ professionals on behalf of organisations.</p>
                <p>Valoria is not a training company; Valoria Develop provides defined PRIME-based development programmes.</p>
                <p>Valoria is not a speaker bureau; ATB Spotlight supports discovery of speakers and facilitators by declared capability.</p>
                <p>Valoria is not a certification body; certification remains a separate programme and must not be claimed before it is complete.</p>
                <p>Valoria is not a jobs board; public opportunities must have verified supply and a working application or enquiry route.</p>
                <p>Valoria provides a structured capability framework, a points-based assessment, development pathways and a platform for professional visibility and opportunity.</p>
              </div>
              <p className="page-copy page-copy-spaced">Assessment completion, listing eligibility and public discoverability are distinct. A profile becomes public only when the applicable requirements and the professional’s visibility choice are in place.</p>
            </Reveal>
          </div>
        </section>

        <section className="page-section alt">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">WHERE WE WORK</span></div>
              <h2 className="section-title">African in origin.<br /><em>Built to travel.</em></h2>
            </Reveal>
            <Reveal>
              <p className="page-copy">Africa is Valoria’s first market, with Nigeria as its jurisdiction. Continental expansion beyond Nigeria is a 2028 priority.</p>
              <p className="page-copy page-copy-spaced">The platform is designed to be understandable to professionals and buyers internationally. Its current market, opportunity availability and eligibility must remain clear; the site does not imply access to markets where Valoria is not yet operating.</p>
            </Reveal>
          </div>
        </section>

        <section className="page-section alt cta-banner">
          <Reveal>
            <div className="eyebrow eyebrow-center"><div className="eyebrow-line" /><span className="eyebrow-text">WORTH. BUILT.</span><div className="eyebrow-line" /></div>
            <h2 className="section-title">Make your capability<br /><em>easier to see.</em></h2>
            <p className="page-sub about-cta-copy">Start with the separate 9-question taster, then decide whether to complete the full VALU Index.</p>
            <div className="page-hero-actions eyebrow-center">
              <a href="https://assessment.valoriainstitute.com/" className="btn-gold">TAKE THE 9-QUESTION TASTER</a>
              <a href="/contact-us" className="btn-outline">GET IN TOUCH</a>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  )
}
