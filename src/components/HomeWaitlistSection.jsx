'use client'

import { useState } from 'react'
import WaitlistForm from './WaitlistForm'

export default function HomeWaitlistSection() {
  const [open, setOpen] = useState(false)

  return (
    <section className="home-waitlist" id="join" aria-labelledby="home-waitlist-title">
      <div className="home-waitlist-inner">
        <div className="home-waitlist-copy">
          <div className="home-waitlist-kicker"><span /> FOUNDING COHORT</div>
          <h2 id="home-waitlist-title">Be early to the<br /><em>professional standard.</em></h2>
          <p>Valoria is building a trusted infrastructure for developing, assessing and connecting professional capability. Join the founding cohort and be part of what comes next.</p>
          <div className="home-waitlist-points">
            <span>01 · Early access</span>
            <span>02 · Product updates</span>
            <span>03 · Founding opportunities</span>
          </div>
        </div>
        <div className="home-waitlist-form">
          <WaitlistForm compact />
        </div>
      </div>
    </section>
  )
}
