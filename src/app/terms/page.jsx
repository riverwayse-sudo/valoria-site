import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Terms | Valoria Institute',
  robots: { index: false, follow: true },
}

export default function TermsRoute() {
  redirect('/terms-of-use')
}
