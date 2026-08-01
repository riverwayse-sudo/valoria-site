import { redirect } from 'next/navigation'

// See atb-connect/page.jsx — same consolidation, Speaker tab.
export default function ATBSpotlightRedirect() {
  redirect('/marketplace?track=speaker')
}
