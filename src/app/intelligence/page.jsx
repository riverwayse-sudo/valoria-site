import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import IntelligenceShowcase from '@/components/IntelligenceShowcase'

export const metadata = {
  title: 'Capability Intelligence',
  description: 'Explore how Valoria connects professional assessment, development, credentials and talent discovery through one capability intelligence framework.',
  alternates: { canonical: 'https://valoriainstitute.com/intelligence' },
}

export default function IntelligencePage() {
  return (
    <>
      <Nav />
      <IntelligenceShowcase />
      <Footer />
    </>
  )
}
