import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import '../pages.css'

export const metadata = {
  title: 'Terms of Use | Valoria Institute',
  description: 'Draft terms for the Valoria Institute platform. Legal operator identity and final legal review are pending before production publication.',
  robots: process.env.NEXT_PUBLIC_VALU_PREVIEW === '1' ? { index: false, follow: false } : { index: true, follow: true },
  alternates: { canonical: 'https://valoriainstitute.com/terms-of-use' },
}

const GOLD = '#C9A84C'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'
const DIM = 'rgba(247,244,238,.55)'
const IS_PREVIEW = process.env.NEXT_PUBLIC_VALU_PREVIEW === '1'

const sections = [
  {
    title: '1. About these terms',
    body: `These Terms of Use govern your access to and use of the Valoria Institute website, professional Marketplace, VALU Index assessment experience and associated services. “Valoria Institute” is the public-facing service name used in these terms. The registered legal entity responsible for the service and its registered address are pending confirmation and must be inserted before production publication.\n\nBy creating an account or using the platform, you agree to the terms that are approved and published for the service.`,
  },
  {
    title: '2. Who can use the platform',
    body: `You must be 18 years or older to use Valoria Institute. By registering, you confirm that the information you provide is accurate and complete.\n\nThe platform serves four types of users:\n\n• Professionals — candidates, speakers, and facilitators who complete the VALU Index and may list on the marketplace.\n• Employers — organisations searching for assessed candidates through ATB Connect.\n• Event Organisers — individuals or organisations booking speakers through ATB Spotlight.\n• Training Buyers — L&D and HR professionals commissioning facilitators through Valoria Develop.`,
  },
  {
    title: '3. The VALU Index assessment',
    body: `The VALU taster is a separate, directional starting point and is not an official VALU Index. The formal assessment provides a comprehensive view of professional capability. Only completion of the formal assessment produces the official VALU Index and PRIME results.\n\n• Official VALU results are represented in points, not percentages. The result is valid for 12 months from the date of the full assessment.\n• You must complete the assessment honestly and independently. Attempts to manipulate assessment integrity may be reviewed under Valoria's assessment integrity procedures.\n• A completed assessment does not guarantee marketplace listing, employment, a speaking engagement or a commission.\n• The VALU Index is one structured input into a buyer's decision; it is not a guarantee of future performance or outcome.`,
  },
  {
    title: '4. Marketplace listing',
    body: `Marketplace listing is not automatic. Eligibility depends on the applicable assessment state, profile completeness, capability-specific requirements, evidence and governance checks. Public visibility also requires the relevant consent and visibility settings. Completing the taster or full assessment does not by itself guarantee listing.\n\nValoria may suspend or remove a listing that violates these terms, contains materially false information or presents a substantiated integrity concern. Private account contact details and raw assessment answers are not displayed as public profile fields. Information shared during a managed introduction is governed by the applicable request and consent process.`,
  },
  {
    title: '5. Buyer obligations',
    body: `If you are an employer, event organiser, or training buyer using the platform to find professionals, you agree that:\n\n• Enquiries are submitted in good faith and represent genuine intent to hire, book, or commission.\n• You will not attempt to contact professionals outside the platform's facilitated introduction process.\n• You will not use professional profiles, contact information, or assessment data for purposes other than the enquiry submitted.\n• Introduction requests are not offers of employment, contracts, or guaranteed bookings. They are requests for a facilitated introduction.`,
  },
  {
    title: '6. Content you provide',
    body: `By submitting content to Valoria Institute — including your profile information, bio, photos, video links, and assessment responses — you grant Valoria Institute a non-exclusive, royalty-free licence to display that content on the platform for the purposes described in these terms.\n\nYou warrant that you own or have the right to use all content you submit, and that it does not infringe any third party's rights.\n\nValoria Institute does not take ownership of your content. You may request deletion of your data at any time under the rights described in our Privacy Policy.`,
  },
  {
    title: '7. Prohibited conduct',
    body: `You may not:\n\n• Create false or misleading profiles, credentials, or assessment responses.\n• Attempt to reverse-engineer, scrape, or extract data from the platform.\n• Use the platform to send unsolicited communications to other users.\n• Impersonate another person or organisation.\n• Use automated tools, bots, or scripts to interact with the platform.\n• Circumvent any security, access control, or integrity measures.\n\nViolation of these prohibitions may result in immediate account suspension without notice.`,
  },
  {
    title: '8. AI-generated reports',
    body: `Your VALU report is generated using Anthropic's Claude. The report-generation request includes your name, professional role, overall VALU score, designation, PRIME cluster scores and skill scores. Raw assessment responses are not included in that report-generation request. Resend is used to deliver transactional messages and report emails, and may therefore process your email address, name, assessment score, designation and report content.\n\nAI reports are provided for informational purposes only. They do not constitute professional advice, coaching or psychological assessment. AI-generated content may require human review and should not be treated as a substitute for professional judgement. The processing details and consent wording must be reviewed before production publication.`,
  },
  {
    title: '9. Limitation of liability',
    body: `The platform is provided subject to applicable law. Availability, service levels, warranties, remedies and any limitation of liability must be set out in the final terms after review by Valoria's legal adviser. No unapproved liability cap is asserted in this staging draft.`,
  },
  {
    title: '10. Termination',
    body: `You may close your account at any time by contacting us at info@valoriainstitute.com. We may suspend or terminate your account if you violate these terms, without obligation to refund any fees paid.\n\nOn termination, your profile will be removed from the marketplace. Your assessment data is retained as described in our Privacy Policy unless you request deletion.`,
  },
  {
    title: '11. Governing law',
    body: `These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes arising from your use of Valoria Institute will be subject to the exclusive jurisdiction of the courts of Lagos State, Nigeria.`,
  },
  {
    title: '12. Changes to these terms',
    body: `We may update these terms from time to time. We will notify registered users of material changes by email at least 14 days before they take effect. Continued use of the platform after that date constitutes acceptance of the updated terms.`,
  },
  {
    title: '13. Contact',
    body: `Valoria Institute (public-facing service name)\nNigeria (current operating jurisdiction)\n\nRegistered legal entity and registered address: pending confirmation.\n\nEmail: info@valoriainstitute.com\nPrivacy enquiries: privacy@valoriainstitute.com`,
  },
]

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main id="main-content" style={{ minHeight: '100vh', background: DARK, fontFamily: "'Raleway','Helvetica Neue',Arial,sans-serif", color: PARCHMENT }}>

        {IS_PREVIEW && <div role="status" style={{maxWidth:'860px',margin:'24px auto 0',padding:'14px 20px',border:'1px solid rgba(201,168,76,.35)',background:'rgba(201,168,76,.07)',color:PARCHMENT,fontSize:'12px',lineHeight:1.7}}>LEGAL REVIEW REQUIRED — This staging draft must not be treated as final terms. Confirm the registered legal entity, assessment integrity rules, marketplace eligibility policy, liability provisions and contact details before production.</div>}
        {/* Hero */}
        <section style={{ padding: 'clamp(64px,8vw,120px) clamp(24px,5vw,80px) 48px', borderBottom: '1px solid rgba(201,168,76,.1)', maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ height: '1px', width: '40px', background: 'rgba(201,168,76,.4)' }} />
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.2em', color: GOLD }}>TERMS OF USE</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 200, lineHeight: 1.05, letterSpacing: '-.02em', marginBottom: '20px' }}>
            The rules of<br /><em style={{ fontStyle: 'italic', color: GOLD }}>the platform.</em>
          </h1>
          <p style={{ fontSize: '15px', fontWeight: 300, color: DIM, lineHeight: 1.8, maxWidth: '560px' }}>
            These terms govern your use of Valoria Institute — the marketplace, the VALU Index, and all associated services. They apply to all user types: professionals, employers, event organisers, and training buyers.
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(247,244,238,.3)', marginTop: '16px' }}>
            Draft for legal review · 7 November 2026 · Proposed governing law: Nigeria (subject to legal approval)
          </p>
        </section>

        {/* Sections */}
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px clamp(24px,5vw,80px) 100px' }}>
          {sections.map((s, i) => (
            <div key={i} style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: i < sections.length - 1 ? '1px solid rgba(201,168,76,.06)' : 'none' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: PARCHMENT, marginBottom: '16px' }}>{s.title}</h2>
              <div style={{ fontSize: '14px', fontWeight: 300, color: DIM, lineHeight: 1.9, whiteSpace: 'pre-line' }}>{s.body}</div>
            </div>
          ))}

          <div style={{ padding: '24px', background: 'rgba(201,168,76,.04)', border: '1px solid rgba(201,168,76,.12)', borderRadius: '10px', marginTop: '16px' }}>
            <p style={{ fontSize: '13px', color: DIM, lineHeight: 1.7, margin: 0 }}>
              Questions about these terms? Email <a href="mailto:info@valoriainstitute.com" style={{ color: GOLD }}>info@valoriainstitute.com</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
