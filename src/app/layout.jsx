import '../styles/globals.css'
import '../styles/brand-standard.css'
import '../styles/card-system.css'
import '../styles/homepage-actions.css'
import Script from 'next/script'
import SmoothScroll from '../components/SmoothScroll'
import PremiumMotion from '../components/PremiumMotion'
import ValuCompletionNudge from '../components/ValuCompletionNudge'
import MarketingInstrumentation from '../components/MarketingInstrumentation'

const SITE_URL = 'https://valoriainstitute.com'
const SITE_NAME = 'Valoria Institute'
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-63M4SRXQKM'
const DESCRIPTION = 'Valoria Institute develops, assesses and connects African professional capability through the VALU Index, PRIME framework and assessed talent marketplace.'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Valoria Institute — Professional Capability, Assessment & Opportunity',
    template: '%s | Valoria Institute',
  },
  description: DESCRIPTION,
  keywords: [
    'professional capability assessment',
    'VALU Index',
    'PRIME framework',
    'African professionals',
    'African talent marketplace',
    'professional assessment Nigeria',
    'assessed professionals Nigeria',
    'African speakers',
    'corporate facilitators Nigeria',
    'skills-based hiring',
  ],
  authors: [{ name: 'Valoria Institute' }],
  publisher: 'Valoria Institute',
  applicationName: SITE_NAME,
  category: 'Business',
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_NG',
    title: 'Valoria Institute — Professional Capability, Assessment & Opportunity',
    description: DESCRIPTION,
    images: [{ url: '/valoria-original.png?v=20260922-2', width: 1200, height: 630, alt: 'Valoria Institute — Worth. Built.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Valoria Institute — Professional Capability, Assessment & Opportunity',
    description: DESCRIPTION,
    images: ['/valoria-original.png?v=20260922-2'],
  },
  icons: {
    icon: '/valoria-original.png',
    shortcut: '/valoria-original.png',
    apple: '/valoria-original.png',
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Valoria Institute',
  alternateName: 'African Talent Bureau',
  url: SITE_URL,
  logo: { '@type': 'ImageObject', url: `${SITE_URL}/valoria-original.png` },
  description: DESCRIPTION,
  slogan: 'Worth. Built.',
  areaServed: { '@type': 'Place', name: 'Africa' },
  address: { '@type': 'PostalAddress', addressLocality: 'Lagos', addressCountry: 'NG' },
  sameAs: [],
  makesOffer: [
    { '@type': 'Offer', name: 'VALU Index Assessment', url: `${SITE_URL}/valu`, description: 'Assess professional capability through Valoria Institute’s VALU Index and PRIME framework.' },
    { '@type': 'Offer', name: 'ATB Connect — Assessed Candidate Search', url: `${SITE_URL}/marketplace/talent`, description: 'Discover assessed professionals through the Valoria Marketplace.' },
    { '@type': 'Offer', name: 'ATB Spotlight — Speaker Marketplace', url: `${SITE_URL}/marketplace/speakers`, description: 'Discover assessed speakers by expertise and professional capability.' },
    { '@type': 'Offer', name: 'Valoria Develop — Facilitator Marketplace', url: `${SITE_URL}/marketplace/facilitators`, description: 'Discover facilitators aligned to PRIME-based capability development.' },
  ],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  description: DESCRIPTION,
  publisher: { '@id': `${SITE_URL}/#organization` },
  inLanguage: 'en-NG',
}

export default function RootLayout({ children }) {
  return <html lang="en">
    <head>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
    </head>
    <body>
      <SmoothScroll />
      <PremiumMotion />
      <MarketingInstrumentation />
      {GA_MEASUREMENT_ID && <>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`}</Script>
      </>}
      {META_PIXEL_ID && <>
        <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}</Script>
        <noscript><img height="1" width="1" alt="" style={{ display: 'none' }} src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} /></noscript>
      </>}
      {children}
      <ValuCompletionNudge />
    </body>
  </html>
}
