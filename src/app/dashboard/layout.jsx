import ValoriaJourneyCards from '@/components/ValoriaJourneyCards'

export const metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

export default function DashboardLayout({ children }) {
  return (
    <>
      {children}
      {process.env.NEXT_PUBLIC_VALU_PREVIEW !== '1' && <ValoriaJourneyCards />}
    </>
  )
}
