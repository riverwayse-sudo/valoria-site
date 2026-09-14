'use client'

import { useState } from 'react'
import EventRegistrationModal from '@/components/EventRegistrationModal'

export default function EventRegistrationTrigger({ session, className = 'event-register-button', children = 'REGISTER FOR SESSION →' }) {
  const [open, setOpen] = useState(false)
  return <>{<button className={className} type="button" onClick={() => setOpen(true)}>{children}</button>}{open && <EventRegistrationModal session={session} onClose={() => setOpen(false)} />}</>
}
