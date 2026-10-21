import './careers.css'
import Link from 'next/link'
import CareerApplicationForm from './CareerApplicationForm'

export const metadata = {
  title: 'Careers | Partnerships Executive',
  description: 'Explore the Partnerships Executive opportunity at Valoria Institute and submit your CV.',
  alternates: { canonical: 'https://valoriainstitute.com/careers' },
  openGraph: { title: 'Careers at Valoria Institute', description: 'Build strategic relationships that connect African professional merit to opportunity.', url: 'https://valoriainstitute.com/careers', type: 'website' },
}

export default function CareersPage() {
  return <main className="careers-page careers-page-compact">
    <section className="page-hero careers-hero careers-hero-compact">
      <div className="page-hero-inner">
        <p className="page-kicker">CAREERS AT VALORIA</p>
        <h1 className="page-title">Do work that creates <em>opportunity.</em></h1>
        <p className="page-sub">Explore our open role. Read the job description or open the application when you are ready.</p>
      </div>
    </section>

    <section className="page-section careers-content careers-content-compact">
      <div className="page-section-inner careers-roles careers-roles-compact">
        <div className="career-role-card career-role-card-compact">
          <div className="career-role-summary career-role-summary-compact">
            <span className="career-role-main">
              <span className="career-role-eyebrow">PARTNERSHIPS · BUSINESS DEVELOPMENT</span>
              <span className="career-role-title">Partnerships Executive</span>
              <span className="career-role-description">Build relationships with organisations and partners to expand Valoria’s reach and impact.</span>
              <span className="career-role-tags"><span>Full-time opportunity</span><span>Applications open</span></span>
            </span>
          </div>

          <details className="career-disclosure career-description-disclosure">
            <summary><span>Read job description</span><span className="career-disclosure-icon" aria-hidden="true">+</span></summary>
            <div className="career-description-content">
              <p>The Partnerships Executive develops relationships with companies, institutions and professional bodies, turning promising conversations into practical collaborations that connect people and organisations to Valoria’s work.</p>
              <h3>What you’ll do</h3>
              <ul>
                <li>Identify and build relationships with potential partners.</li>
                <li>Manage outreach, follow-ups and partnership opportunities.</li>
                <li>Prepare proposals and coordinate partner onboarding.</li>
                <li>Track progress and report on partnership outcomes.</li>
              </ul>
              <h3>What you’ll bring</h3>
              <ul>
                <li>Experience in partnerships, business development, sales or relationship management.</li>
                <li>Strong communication, negotiation and stakeholder skills.</li>
                <li>A reliable, organised approach to follow-through and reporting.</li>
              </ul>
              <p className="career-description-assessment">In your application, share relevant experience and specific results you have helped achieve.</p>
            </div>
          </details>

          <details className="career-disclosure career-apply-disclosure" id="apply">
            <summary><span>Apply for this role <small>CV required · PDF, DOC or DOCX · Max 4 MB</small></span><span className="career-disclosure-icon" aria-hidden="true">+</span></summary>
            <div className="career-apply-content">
              <p className="career-apply-intro">Complete the short form and attach your CV. Fields marked required must be completed.</p>
              <CareerApplicationForm />
            </div>
          </details>
        </div>
        <p className="career-no-openings-note">Only the role shown above is currently listed. Check back for future opportunities.</p>
      </div>
    </section>

    <section className="careers-bottom"><p>Learn more about <Link href="/about-us">Valoria Institute</Link> or <Link href="/contact-us">contact our team</Link>.</p></section>
  </main>
}
