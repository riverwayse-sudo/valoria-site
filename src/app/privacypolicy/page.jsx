import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { BRAND } from '@/lib/brand'
import '../pages.css'

export const metadata = {
  title: 'Privacy Policy',
  description: 'How Valoria Institute collects, uses, and protects your data.',
}

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <section className="page-hero" style={{ paddingBottom: '40px' }}>
          <div className="page-hero-inner">
            <h1 className="page-title" style={{ fontSize: 'clamp(30px,4.5vw,48px)' }}>Privacy Policy</h1>
          </div>
        </section>

        <section className="page-section" style={{ paddingTop: 0 }}>
          <div className="page-section-inner legal-content" style={{ maxWidth: '720px' }}>
            <p className="legal-meta">Last updated: [DATE] &middot; DRAFT — pending legal review before publishing</p>

            <p>{BRAND.copyrightEntity}, operating {BRAND.name} (&ldquo;Valoria,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;), is committed to protecting your privacy and handling your data in line with the Nigeria Data Protection Act, 2023 (NDPA).</p>

            <h2>Information we collect</h2>
            <ul>
              <li>Account information: name, email, location, and professional details you provide.</li>
              <li>VALU Index responses and the resulting scores, cluster breakdowns, and tier designation.</li>
              <li>Usage data: how you interact with the marketing site and assessment platform.</li>
            </ul>

            <h2>How we use it</h2>
            <ul>
              <li>To generate and display your VALU Index profile and PRIME cluster breakdown.</li>
              <li>To make your profile searchable by employers, event organisers, or training buyers, if you opt in.</li>
              <li>To communicate with you about your account, assessment results, and relevant opportunities.</li>
            </ul>

            <h2>Your rights under the NDPA</h2>
            <p>You have the right to access, correct, or request deletion of your personal data, and to withdraw consent for your profile to be searchable at any time. Contact us at {BRAND.email} to exercise any of these rights.</p>

            <h2>Data sharing</h2>
            <p>We do not sell personal data. Profile information is only made visible to employers, organisers, or training buyers if you have opted in to the relevant marketplace modality.</p>

            <h2>Contact</h2>
            <p>Questions about this policy can be sent to <a href={`mailto:${BRAND.email}`} style={{ color: 'var(--gold)' }}>{BRAND.email}</a>.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
