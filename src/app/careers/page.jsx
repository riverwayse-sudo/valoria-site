import './careers.css'
import Link from 'next/link'
import CareerApplicationForm from './CareerApplicationForm'

export const metadata = {
  title: 'Careers | Partnerships Executive',
  description: 'Join Valoria Institute as Partnerships Executive. Build strategic relationships that connect African professional merit to opportunity.',
  alternates: { canonical: 'https://valoriainstitute.com/careers' },
  openGraph: { title: 'Careers at Valoria Institute | Partnerships Executive', description: 'Help build partnerships that develop, surface and connect African professional merit.', url: 'https://valoriainstitute.com/careers', type: 'website' },
}

const responsibilities = [
  'Identify, research and develop relationships with corporate organisations, institutions, professional bodies and strategic partners.',
  'Build and manage a pipeline of partnership prospects, from first contact through negotiation, activation and relationship growth.',
  'Develop partnership proposals, presentations and tailored value propositions with the Valoria team.',
  'Coordinate partner onboarding, activation plans, follow-ups and relationship reporting.',
  'Work across Valoria’s talent, speaker, facilitator and professional-development offerings to identify shared-value opportunities.',
  'Maintain accurate CRM records, pipeline updates, meeting notes and measurable partnership outcomes.',
]
const profile = [
  'Demonstrable experience in partnerships, business development, relationship management, sales or a closely related role.',
  'Strong communication, presentation, negotiation and stakeholder-management skills.',
  'Evidence of building relationships and progressing opportunities from outreach to concrete outcomes.',
  'A structured, self-directed approach to pipeline management, follow-up and reporting.',
  'Comfort working with senior stakeholders and representing an ambitious, mission-led institution.',
]

export default function CareersPage() {
  return <main className="careers-page">
    <section className="page-hero careers-hero">
      <div className="page-hero-inner">
        <p className="page-kicker">CAREERS · BUILD WHAT MATTERS</p>
        <h1 className="page-title">Do meaningful work. Build <em>lasting opportunity.</em></h1>
        <p className="page-sub">Valoria Institute is building the infrastructure through which African professional merit is developed, surfaced and connected to opportunity. Explore the open role below and reveal the application instructions when you are ready.</p>
        <div className="careers-meta"><span>Current opportunities</span><span>Applications open</span></div>
      </div>
    </section>

    <section className="page-section careers-content">
      <div className="page-section-inner careers-roles">
        <div className="careers-list-heading">
          <p className="page-kicker">OPEN POSITION</p>
          <h2 className="section-title">Find your place at <em>Valoria.</em></h2>
          <p className="careers-copy">Each role has its own application details. Select a card to review the opportunity and submit your CV.</p>
        </div>

        <details className="career-role-card" id="partnerships-executive">
          <summary className="career-role-summary">
            <span className="career-role-main">
              <span className="career-role-eyebrow">PARTNERSHIPS · BUSINESS DEVELOPMENT</span>
              <span className="career-role-title">Partnerships Executive</span>
              <span className="career-role-description">Build strategic relationships that connect organisations, institutions and African professional merit to opportunity.</span>
              <span className="career-role-tags"><span>Full-time opportunity</span><span>Applications open</span></span>
            </span>
            <span className="career-role-toggle"><span className="career-role-toggle-open">View role &amp; apply</span><span className="career-role-toggle-close">Close details</span><span aria-hidden="true" className="career-role-chevron">↗</span></span>
          </summary>

          <div className="career-role-expanded">
            <div className="career-role-detail-grid">
              <article className="careers-description">
                <p className="page-kicker">THE OPPORTUNITY</p>
                <h3>Build relationships that <em>move work forward.</em></h3>
                <p className="careers-copy">The Partnerships Executive will help expand Valoria’s network of organisations, institutions and collaborators. This role is for a relationship-builder who combines commercial judgement with disciplined execution: opening doors, understanding partner priorities and converting conversations into durable collaborations.</p>
                <h4>What you will do</h4>
                <ul className="careers-list">{responsibilities.map(x => <li key={x}><span>✦</span>{x}</li>)}</ul>
                <h4>What you bring</h4>
                <ul className="careers-list">{profile.map(x => <li key={x}><span>✦</span>{x}</li>)}</ul>
                <div className="careers-note"><strong>How applications are assessed</strong><p>We look for relevant experience, examples of partnership or business-development outcomes, clear communication and reliable follow-through. Show what you have built, who you have worked with and what changed as a result.</p></div>
              </article>

              <aside className="careers-form-panel" id="apply">
                <div className="careers-form-heading">
                  <p className="page-kicker">APPLICATION FORMAT</p>
                  <h3>Submit your CV</h3>
                  <p>Complete the application form and upload your CV as a PDF, DOC or DOCX file (maximum 4 MB). All required fields must be completed before submission.</p>
                </div>
                <CareerApplicationForm />
              </aside>
            </div>
          </div>
        </details>
      </div>
    </section>

    <section className="careers-bottom"><p>Not ready to apply? Learn more about <Link href="/about-us">Valoria Institute</Link> or <Link href="/contact-us">contact our team</Link>.</p></section>
  </main>
}
