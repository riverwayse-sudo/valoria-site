import { redirect } from 'next/navigation'

// Keep old confirmation/email links compatible without restoring the
// removed bridge page. All assessment entry points use the same authenticated
// continuation resolver, which obtains a fresh short-lived handoff.
export default function LegacyAssessmentBridgeRedirect() {
  redirect('/assessment/continue')
}
