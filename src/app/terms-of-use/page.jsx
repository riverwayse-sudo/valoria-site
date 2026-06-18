import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { BRAND } from '@/lib/brand'
import '../pages.css'

export const metadata = {
  title: 'Terms of Use',
  description: 'The terms governing your use of Valoria Institute.',
}

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <section className="page-hero" style={{ paddingBottom: '40px' }}>
          <div className="page-hero-inner">
            <h1 className="page-title" style={{ fontSize: 'clamp(30px,4.5vw,48px)' }}>Terms of Use</h1>
          </div>
        </section>

        <section className="page-section" style={{ paddingTop: 0 }}>
          <div className="page-section-inner legal-content" style={{ maxWidth: '720px' }}>
            <p className="legal-meta">Last updated: [DATE] &middot; DRAFT — pending legal review before publishing</p>

            <p>These terms govern your use of {BRAND.name}, operated by {BRAND.copyrightEntity} (&ldquo;Valoria,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;). By creating an account or taking the VALU Index, you agree to these terms.</p>

            <h2>The VALU Index</h2>
            <p>The VALU Index is an assessment of professional capability across the five PRIME clusters. Results are valid for 12 months from the date of assessment and reflect a point-in-time evaluation, not a guarantee of future performance.</p>

            <h2>Marketplace use</h2>
            <p>ATB Connect, ATB Spotlight, and Valoria Develop allow employers, event organisers, and training buyers to search and contact assessed professionals who have opted in to the relevant modality. Valoria facilitates discovery but is not a party to any resulting hiring, booking, or training agreement.</p>

            <h2>Account responsibilities</h2>
            <p>You are responsible for the accuracy of the information you provide and for keeping your account credentials secure. Misrepresenting your identity or assessment results is grounds for account suspension.</p>

            <h2>Limitation of liability</h2>
            <p>Valoria provides the assessment and marketplace &ldquo;as is.&rdquo; We do not guarantee employment, bookings, or commissions resulting from use of the platform.</p>

            <h2>Changes to these terms</h2>
            <p>We may update these terms from time to time. Continued use of the platform after changes take effect constitutes acceptance of the updated terms.</p>

            <h2>Contact</h2>
            <p>Questions about these terms can be sent to <a href={`mailto:${BRAND.email}`} style={{ color: 'var(--gold)' }}>{BRAND.email}</a>.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
