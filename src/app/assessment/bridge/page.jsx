import { redirect } from 'next/navigation'

// Keep old confirmation/email links compatible without restoring the
// removed bridge page. Authenticated users continue from the dashboard;
// unauthenticated users are sent through the normal dashboard login gate.
export default function LegacyAssessmentBridgeRedirect() {
  redirect('/dashboard')
}
