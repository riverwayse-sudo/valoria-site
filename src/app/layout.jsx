import '../styles/globals.css'

const SITE_URL = 'https://valoriainstitute.com'
const SITE_NAME = 'Valoria Institute'
const DESCRIPTION =
  "One marketplace. Three ways to engage Africa's best professionals. Search candidates, book speakers, commission facilitators — every profile underwritten by one independently assessed standard."

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Valoria Institute — Where African Professionals Rise',
    template: '%s | Valoria Institute',
  },
  description: DESCRIPTION,
  keywords: [
    'African talent marketplace',
    'hire African professionals',
    'African speaker bureau',
    'VALU Index assessment',
    'PRIME framework',
    'African corporate training facilitators',
    'Nigeria talent search',
    'assessed candidate hiring',
  ],
  authors: [{ name: 'Valoria Institute' }],
  applicationName: SITE_NAME,
  category: 'Business',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_NG',
    title: 'Valoria Institute — Where African Professionals Rise',
    description: DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Valoria Institute — Worth. Built.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Valoria Institute — Where African Professionals Rise',
    description: DESCRIPTION,
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

// JSON-LD Organization schema — helps both classic search engines and
// AI answer engines (AEO/GEO) correctly identify what Valoria Institute is,
// what it does, and how it's structured, independent of page copy.
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Valoria Institute',
  alternateName: 'African Talent Bureau',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: DESCRIPTION,
  slogan: 'Worth. Built.',
  areaServed: {
    '@type': 'Country',
    name: 'Nigeria',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Lagos',
    addressCountry: 'NG',
  },
  sameAs: [],
  makesOffer: [
    {
      '@type': 'Offer',
      name: 'ATB Connect — Assessed Candidate Search',
      description: 'Search pre-assessed candidates by VALU Index score, cluster strength, sector, and designation.',
      url: `${SITE_URL}/atb-connect`,
    },
    {
      '@type': 'Offer',
      name: 'ATB Spotlight — Speaker Booking',
      description: 'Discover and book speakers by expertise, tier designation, and VALU Index score.',
      url: `${SITE_URL}/spotlight`,
    },
    {
      '@type': 'Offer',
      name: 'Valoria Develop — Facilitator Commissioning',
      description: 'Commission PRIME-certified facilitators to run development programmes.',
      url: `${SITE_URL}/facilitators`,
    },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
