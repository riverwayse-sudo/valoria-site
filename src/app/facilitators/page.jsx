import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Valoria Develop',
  description: 'Explore PRIME-based development programmes from Valoria Institute.',
  alternates: { canonical: 'https://valoriainstitute.com/programmes' },
}

export default function FacilitatorsPage() {
  redirect('/programmes')
}
