import Link from 'next/link'
import styles from './ExperiencePreview.module.css'

const dimensions = ['Presence', 'Relationships', 'Intelligence', 'Mastery', 'Enterprise']

export default function DashboardExperiencePreview() {
  return (
    <main className={styles.page}>
      <div className={styles.notice}>STAGING PREVIEW · ILLUSTRATIVE INTERFACE · NOT PRODUCTION</div>
      <header className={styles.header}>
        <Link href="/" className={styles.wordmark}>VALORIA <span>INSTITUTE</span></Link>
        <nav className={styles.nav} aria-label="Preview navigation">
          <Link href="/valu">VALU INDEX</Link>
          <Link href="/marketplace">REGISTRY</Link>
          <Link href="/programmes">PROGRAMMES</Link>
        </nav>
        <span className={styles.memberLabel}>MEMBER WORKSPACE</span>
      </header>

      <div className={styles.shell}>
        <section className={styles.welcome}>
          <div>
            <p className={styles.eyebrow}>YOUR PROFESSIONAL WORKSPACE</p>
            <h1>Your next move<br/><em>starts with clarity.</em></h1>
            <p className={styles.intro}>A single place to understand your capability, build a credible professional presence and move closer to relevant opportunities.</p>
          </div>
          <div className={styles.identity}>
            <div className={styles.avatar}>V</div>
            <div><span>PREVIEW MEMBER</span><strong>Professional profile</strong><small>Illustrative account state</small></div>
          </div>
        </section>

        <section className={styles.nextStep} aria-labelledby="next-step-title">
          <div className={styles.nextCopy}>
            <p className={styles.eyebrow}>RECOMMENDED NEXT STEP</p>
            <h2 id="next-step-title">Complete your full VALU assessment.</h2>
            <p>The 58-question full assessment is separate from the 9-question taster. It establishes your official VALU Index and PRIME results in points.</p>
            <Link href="/valu" className={styles.primaryAction}>UNDERSTAND THE ASSESSMENT <span>→</span></Link>
          </div>
          <div className={styles.assessmentMeta}>
            <span className={styles.metaNumber}>58</span>
            <span className={styles.metaUnit}>QUESTIONS</span>
            <span className={styles.metaRule}>Separate full assessment</span>
          </div>
        </section>

        <section className={styles.metrics} aria-label="Professional status overview">
          <article className={styles.metric}>
            <span>VALU INDEX</span>
            <strong>Not established</strong>
            <small>Complete the full assessment to receive your official points result.</small>
          </article>
          <article className={styles.metric}>
            <span>PROFESSIONAL PROFILE</span>
            <strong>In progress</strong>
            <small>Your professional record and selected capabilities will appear here.</small>
          </article>
          <article className={styles.metric}>
            <span>VISIBILITY</span>
            <strong>Not yet active</strong>
            <small>Discoverability follows profile completion and applicable eligibility rules.</small>
          </article>
        </section>

        <section className={styles.contentGrid}>
          <article className={styles.panel}>
            <div className={styles.panelHead}><div><p className={styles.eyebrow}>THE PRIME FRAMEWORK</p><h2>Your capability profile</h2></div><span>5 DIMENSIONS</span></div>
            <p className={styles.panelIntro}>Your full VALU Index will organise professional capability across five connected dimensions.</p>
            <div className={styles.dimensions}>
              {dimensions.map((name, index) => <div className={styles.dimension} key={name}><b>0{index + 1}</b><span>{name}</span><small>Awaiting assessment</small></div>)}
            </div>
            <Link href="/prime" className={styles.textAction}>EXPLORE PRIME <span>→</span></Link>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHead}><div><p className={styles.eyebrow}>OPPORTUNITY DISCOVERY</p><h2>Move from profile to possibility.</h2></div></div>
            <p className={styles.panelIntro}>Explore the Registry and understand how professional capability is presented to employers, organisers and collaborators.</p>
            <div className={styles.emptyState}>
              <span className={styles.emptyMark}>↗</span>
              <strong>Your opportunity feed will appear here.</strong>
              <small>Listings and recommendations require the relevant live platform data.</small>
            </div>
            <Link href="/marketplace" className={styles.textAction}>EXPLORE THE REGISTRY <span>→</span></Link>
          </article>
        </section>

        <section className={styles.bottomGrid}>
          <article className={styles.bottomPanel}>
            <p className={styles.eyebrow}>YOUR DEVELOPMENT</p>
            <h2>Build capability with direction.</h2>
            <p>Discover programmes and learning pathways connected to the PRIME framework.</p>
            <Link href="/programmes" className={styles.textAction}>EXPLORE PROGRAMMES <span>→</span></Link>
          </article>
          <article className={styles.bottomPanel}>
            <p className={styles.eyebrow}>YOUR PROFESSIONAL RECORD</p>
            <h2>Make your experience visible.</h2>
            <p>Your profile will bring together your professional identity, selected capabilities and assessment-backed insight.</p>
            <Link href="/marketplace" className={styles.textAction}>VIEW THE REGISTRY <span>→</span></Link>
          </article>
        </section>

        <footer className={styles.footer}>WORTH. BUILT. <span>VALORIA INSTITUTE · EXPERIENCE PREVIEW</span></footer>
      </div>
    </main>
  )
}
