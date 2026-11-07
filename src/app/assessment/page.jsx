import { redirect } from 'next/navigation'

// Preserve the retired assessment entry point while directing visitors to the
// canonical VALU Index explainer before they begin an assessment.
export default function LegacyAssessmentPage() {
  redirect('/valu')
}
