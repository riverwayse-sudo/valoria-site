import { redirect } from 'next/navigation'

// Keep one canonical assessment experience. This legacy design sandbox used
// the first nine formal questions as a taster, which is not the Valoria model.
export default function TestAssessmentPage() {
  redirect('/valu/assessment/')
}
