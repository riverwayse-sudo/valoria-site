import { redirect } from 'next/navigation'

export default function WaitlistPage() {
  redirect('/valu/register/?journey=valu_taster')
}
