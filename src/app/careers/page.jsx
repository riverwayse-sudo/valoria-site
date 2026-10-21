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
  <section className="page-hero careers-hero"><div className="page-hero-inner">
   <p className="page-kicker">CAREERS · BUILD WHAT MATTERS</p>
   <h1 className="page-title">Turn meaningful relationships into <em>lasting opportunity.</em></h1>
   <p className="page-sub">Valoria Institute is building the infrastructure through which African professional merit is developed, surfaced and connected to opportunity. We are looking for a Partnerships Executive to help make that infrastructure matter to more organisations and people.</p>
   <div className="careers-meta"><span>Partnerships Executive</span><span>Full-time opportunity</span><span>Applications open</span></div>
   <a className="careers-apply-button" href="#apply">Apply for this role <span aria-hidden="true">↗</span></a>
  </div></section>
  <section className="page-section careers-content"><div className="page-section-inner careers-grid">
   <article className="careers-description">
    <p className="page-kicker">THE OPPORTUNITY</p><h2 className="section-title">Build relationships that <em>move work forward.</em></h2>
    <p className="careers-copy">The Partnerships Executive will help expand Valoria’s network of organisations, institutions and collaborators. This role is for a relationship-builder who combines commercial judgement with disciplined execution: opening doors, understanding partner priorities and converting conversations into durable collaborations.</p>
    <h3>What you will do</h3><ul className="careers-list">{responsibilities.map(x=><li key={x}><span>✦</span>{x}</li>)}</ul>
    <h3>What you bring</h3><ul className="careers-list">{profile.map(x=><li key={x}><span>✦</span>{x}</li>)}</ul>
    <div className="careers-note"><strong>How we will assess applications</strong><p>We will look for relevant experience, examples of partnerships or business-development outcomes, clear communication and evidence of reliable follow-through. Please use your application to show what you have built, who you have worked with and what changed as a result.</p></div>
    <p className="careers-copy">Interested? Submit the form with your CV. Shortlisted candidates will be contacted with details of the next stage.</p>
   </article>
   <aside className="careers-form-panel" id="apply"><div className="careers-form-heading"><p className="page-kicker">YOUR NEXT STEP</p><h2>Apply for the role</h2><p>Complete the form below. Fields marked required must be completed, and a CV is required to submit.</p></div><CareerApplicationForm /></aside>
  </div></section>
  <section className="careers-bottom"><p>Not ready to apply? Learn more about <Link href="/about-us">Valoria Institute</Link> or <Link href="/contact-us">contact our team</Link>.</p></section>
 </main>
}