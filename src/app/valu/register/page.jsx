import { redirect } from 'next/navigation'

// Keep old registration URLs working, but never make account creation the default
// public entry. Only preserve the explicit legacy journey for existing participants.
export default async function ValuRegisterPage({ searchParams }) {
  const params = await searchParams
  if (params?.journey === 'account-first' || params?.journey === 'valu_taster') {
    redirect('/valu/assessment/?journey=account-first')
  }
  redirect('/valu/assessment/')
}
