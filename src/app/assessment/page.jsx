import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Assessment | Valoria Institute',
  robots: { index: false, follow: true },
}

export default function AssessmentRoute() {
  redirect('/valu')
}
