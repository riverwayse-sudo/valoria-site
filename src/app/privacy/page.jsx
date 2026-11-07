import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Privacy | Valoria Institute',
  robots: { index: false, follow: true },
}

export default function PrivacyRoute() {
  redirect('/privacypolicy')
}
