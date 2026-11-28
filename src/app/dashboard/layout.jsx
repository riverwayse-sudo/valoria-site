import ValoriaJourneyCards from '@/components/ValoriaJourneyCards'

export const metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

export default function DashboardLayout({ children }) {
  return (
    <>
      <main id="main-content">{children}</main>
      <ValoriaJourneyCards />
    </>
  )
}
