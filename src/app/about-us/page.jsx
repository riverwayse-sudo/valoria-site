import { redirect } from 'next/navigation'

export const metadata = {
  title: 'About Valoria Institute',
  alternates: { canonical: 'https://valoriainstitute.com/about' },
}

export default function AboutUsPage() {
  redirect('/about')
}
