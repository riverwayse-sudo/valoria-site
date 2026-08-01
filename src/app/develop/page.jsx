import { redirect } from 'next/navigation'

// See atb-connect/page.jsx — same consolidation, Facilitator tab.
export default function DevelopRedirect() {
  redirect('/marketplace?track=facilitator')
}
