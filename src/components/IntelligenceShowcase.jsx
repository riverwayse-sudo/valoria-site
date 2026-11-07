'use client'

import { useState } from 'react'
import styles from './IntelligenceShowcase.module.css'

const journeys = [
  {
    id: 'employer',
    label: 'For employers',
    eyebrow: 'TALENT INTELLIGENCE',
    title: 'Find capability, not just keywords.',
    description: 'Bring role requirements together with structured professional capability, verified credentials and relevant experience.',
    need: 'A team needs a professional who can lead complex stakeholder relationships and deliver enterprise-level work.',
    signals: ['PRIME capability evidence', 'Relevant credentials', 'Professional experience', 'Role-specific requirements'],
    outcome: 'A more informed shortlist, with the reasons for relevance made visible.',
    action: 'Explore ATB Connect',
    href: '/atb-connect',
  },
  {
    id: 'professional',
    label: 'For professionals',
    eyebrow: 'PROFESSIONAL INTELLIGENCE',
    title: 'Turn assessment into direction.',
    description: 'Connect a completed VALU assessment to a clearer picture of strengths, development priorities and possible next steps.',
    need: 'A professional wants to understand which capabilities to develop for their next career move.',
    signals: ['Official VALU Index', 'PRIME capability profile', 'Development priorities', 'Relevant learning pathways'],
    outcome: 'A development direction grounded in the person’s assessed capabilities.',
    action: 'Explore the VALU Index',
    href: '/valu',
  },
  {
    id: 'organiser',
    label: 'For event organisers',
    eyebrow: 'EXPERTISE INTELLIGENCE',
    title: 'Find the right expertise for the room.',
    description: 'Connect event themes and audience needs with relevant speaker and facilitator capabilities.',
    need: 'An organiser is curating a programme on leadership, organisational change and the future of work.',
    signals: ['Subject-matter expertise', 'Facilitation capability', 'Relevant experience', 'Programme context'],
    outcome: 'A more relevant route to speakers and facilitators for the programme.',
    action: 'Explore ATB Spotlight',
    href: '/atb-spotlight',
  },
  {
    id: 'institution',
    label: 'For institutions',
    eyebrow: 'WORKFORCE INTELLIGENCE',
    title: 'Understand capability at a wider level.',
    description: 'Use aggregated, appropriately protected insights to inform workforce development and institutional learning priorities.',
    need: 'An institution wants to understand capability development priorities across a participating workforce.',
    signals: ['Aggregated capability patterns', 'Learning participation', 'Development outcomes', 'Sector and role context'],
    outcome: 'A more evidence-informed view of workforce development needs.',
    action: 'Discuss an institutional partnership',
    href: '/contact-us',
  },
]

const steps = [
  ['01', 'Understand', 'PRIME provides a shared language for professional capability.'],
  ['02', 'Assess', 'VALU turns structured assessment into an official capability index.'],
  ['03', 'Develop', 'Learning pathways connect identified needs to purposeful development.'],
  ['04', 'Connect', 'The Marketplace makes relevant professional capability easier to discover.'],
]

export default function IntelligenceShowcase() {
  const [active, setActive] = useState('employer')
  const selected = journeys.find((item) => item.id === active) || journeys[0]

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.kicker}><span /> THE VALORIA INTELLIGENCE FRAMEWORK</div>
          <h1>Make professional capability <em>work harder.</em></h1>
          <p className={styles.heroLead}>Valoria connects assessment, development, credentials and talent discovery — giving professionals and organisations a clearer basis for their next decision.</p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#experience">Explore the experience <span aria-hidden="true">↓</span></a>
            <a className={styles.textLink} href="/about-us">Understand the institution <span aria-hidden="true">→</span></a>
          </div>
          <div className={styles.heroFoot}>
            <span>PRIME FRAMEWORK</span><i />
            <span>VALU INDEX</span><i />
            <span>CAPABILITY-LED MARKETPLACE</span>
          </div>
        </div>
        <div className={styles.heroVisual} aria-label="Illustration of connected capability intelligence">
          <div className={`${styles.orbit} ${styles.orbitOne}`} />
          <div className={`${styles.orbit} ${styles.orbitTwo}`} />
          <div className={styles.core}>
            <span>VALU</span>
            <strong>Capability</strong>
            <small>Evidence-led insight</small>
          </div>
          <div className={styles.node + ' ' + styles.nodeTop}><b>PRIME</b><small>Shared framework</small></div>
          <div className={styles.node + ' ' + styles.nodeRight}><b>DEVELOP</b><small>Learning pathways</small></div>
          <div className={styles.node + ' ' + styles.nodeBottom}><b>MARKETPLACE</b><small>Talent discovery</small></div>
          <div className={styles.node + ' ' + styles.nodeLeft}><b>CREDENTIALS</b><small>Verified records</small></div>
        </div>
      </section>

      <section className={styles.thesis} aria-label="The institutional proposition">
        <div className={styles.thesisLabel}>THE INSTITUTIONAL PROPOSITION</div>
        <p>One professional capability record can inform <strong>better development</strong>, <strong>more relevant discovery</strong> and <strong>clearer institutional decisions</strong> — while keeping assessment standards and credential decisions under Valoria’s control.</p>
      </section>

      <section className={styles.experience} id="experience">
        <div className={styles.sectionHeading}>
          <div className={styles.kicker}><span /> SEE THE VALUE IN PRACTICE</div>
          <h2>One connected system.<br /><em>Different decisions made clearer.</em></h2>
          <p>Choose the perspective that matters to you and explore how Valoria connects capability information to a practical outcome.</p>
        </div>

        <div className={styles.demoShell}>
          <div className={styles.demoTabs} role="tablist" aria-label="Choose an intelligence journey">
            {journeys.map((item) => (
              <button key={item.id} type="button" role="tab" aria-selected={active === item.id} className={active === item.id ? styles.activeTab : ''} onClick={() => setActive(item.id)}>{item.label}</button>
            ))}
          </div>
          <div className={styles.demoContent}>
            <div className={styles.demoMain}>
              <div className={styles.demoEyebrow}>{selected.eyebrow}</div>
              <h3>{selected.title}</h3>
              <p>{selected.description}</p>
              <div className={styles.needBox}>
                <span>THE DECISION TO BE MADE</span>
                <p>{selected.need}</p>
              </div>
              <a href={selected.href} className={styles.demoLink}>{selected.action} <span aria-hidden="true">→</span></a>
            </div>
            <div className={styles.signalPanel}>
              <div className={styles.signalHeader}><span>CONNECTED SIGNALS</span><span className={styles.liveDot}>ILLUSTRATIVE</span></div>
              {selected.signals.map((signal, index) => (
                <div className={styles.signalRow} key={signal}><span className={styles.signalNumber}>0{index + 1}</span><span>{signal}</span><span className={styles.signalMark}>↗</span></div>
              ))}
              <div className={styles.outcomeBox}><span>INTENDED OUTCOME</span><p>{selected.outcome}</p></div>
            </div>
          </div>
          <p className={styles.demoNote}>This is a product concept demonstration using illustrative scenarios, not live participant data, automated matching results or institutional performance statistics.</p>
        </div>
      </section>

      <section className={styles.method}>
        <div className={styles.sectionHeading}>
          <div className={styles.kicker}><span /> HOW THE SYSTEM CONNECTS</div>
          <h2>From a shared standard to <em>real-world application.</em></h2>
          <p>Each layer has a distinct responsibility. The integrity of the assessment and credential record is preserved throughout.</p>
        </div>
        <div className={styles.steps}>
          {steps.map(([number, title, body]) => <article className={styles.step} key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section className={styles.principles}>
        <div>
          <div className={styles.kicker}><span /> TRUST BY DESIGN</div>
          <h2>Intelligence should strengthen <em>institutional integrity.</em></h2>
          <p>Technology supports discovery and insight. It does not replace Valoria’s assessment methodology, professional judgement or certification governance.</p>
        </div>
        <div className={styles.principleList}>
          <div><b>01</b><span>Official VALU outcomes remain governed by the formal assessment.</span></div>
          <div><b>02</b><span>Private assessment responses are not exposed through talent search.</span></div>
          <div><b>03</b><span>Recommendations inform decisions; they do not determine eligibility or certification.</span></div>
          <div><b>04</b><span>Institutional insights use appropriate aggregation, consent and access controls.</span></div>
        </div>
      </section>

      <section className={styles.closing}>
        <div className={styles.kicker}><span /> THE NEXT CHAPTER</div>
        <h2>Build a clearer relationship between <em>capability and opportunity.</em></h2>
        <p>Explore the Valoria pathways or begin a conversation about an institutional application.</p>
        <div className={styles.heroActions}>
          <a className={styles.primaryButton} href="/marketplace">Explore the Marketplace <span aria-hidden="true">→</span></a>
          <a className={styles.textLink} href="/contact-us">Discuss a partnership <span aria-hidden="true">→</span></a>
        </div>
      </section>
    </main>
  )
}
