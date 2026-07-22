import '../styles/globals.css'
import Script from 'next/script'

const SITE_URL = 'https://valoriainstitute.com'
const SITE_NAME = 'Valoria Institute'
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
// Defaults to the property already created in Google Analytics
// (valoriainstitute.com) — override via env var if this ever changes.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-63M4SRXQKM'
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
      url: `${SITE_URL}/atb-spotlight`,
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
      <body>
        {GA_MEASUREMENT_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        {META_PIXEL_ID && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
                n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
                document,'script','https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1" width="1" alt=""
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        )}
        {children}
      </body>
    </html>
  )
}
