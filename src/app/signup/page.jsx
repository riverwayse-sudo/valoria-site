'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import AuthModal from '@/components/AuthModal'

export default function SignupPage() {
  const router = useRouter()
  const [open, setOpen] = useState(true)
  return <>
    <Nav />
    <main style={{ minHeight: '100vh', background: '#0F0F1A' }}>
      <AuthModal open={open} initialMode="signup" onClose={() => { setOpen(false); router.replace('/') }} />
    </main>
  </>
}
