'use client'

import { useState } from 'react'
import EventRegistrationModal from '@/components/EventRegistrationModal'

export default function EventRegistrationTrigger({ session, className = 'event-register-button', children = 'REGISTER FOR SESSION →' }) {
  const [open, setOpen] = useState(false)
  const isPreview = process.env.NEXT_PUBLIC_VALU_PREVIEW === '1'
  if (isPreview) return <button className={className} type="button" disabled aria-disabled="true">REGISTRATION DISABLED IN PREVIEW</button>
  return <>{<button className={className} type="button" onClick={() => setOpen(true)}>{children}</button>}{open && <EventRegistrationModal session={session} onClose={() => setOpen(false)} />}</>
}
