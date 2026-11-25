import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Development Programmes — Valoria Develop',
  description: 'PRIME-aligned development for individuals and organisations. Programme scope, facilitator suitability, delivery format and any follow-up measurement are confirmed for each engagement.',
  alternates: { canonical: 'https://valoriainstitute.com/programmes' },
}

export default function FacilitatorsPage() {
  redirect('/programmes')
}
