import { redirect } from 'next/navigation'

// Valoria Develop is the canonical home for PRIME-based development.
// Keep legacy URLs working while consolidating the experience.
export default function LegacyDevelopRoute() {
  redirect('/develop')
}
