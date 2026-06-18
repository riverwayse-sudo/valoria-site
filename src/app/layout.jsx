import '../styles/globals.css'

export const metadata = {
  metadataBase: new URL('https://valoriainstitute.com'),
  title: {
    default: 'Valoria Institute — Where African Professionals Rise',
    template: '%s | Valoria Institute',
  },
  description: 'One marketplace. Three ways to engage Africa\'s best professionals. Search candidates, book speakers, commission facilitators — every profile underwritten by one assessed standard.',
  openGraph: {
    siteName: 'Valoria Institute',
    locale: 'en_NG',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
