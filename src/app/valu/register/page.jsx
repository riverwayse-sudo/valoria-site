import { redirect } from 'next/navigation'

// Legacy assessment links previously opened an account-first registration form.
// Keep the URL working, but send every visitor to the canonical Taster-first entry.
export default function ValuRegisterPage() {
  redirect('/valu/assessment/')
}
