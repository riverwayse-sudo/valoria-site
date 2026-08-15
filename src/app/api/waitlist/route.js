// src/app/api/waitlist/route.js
// Saves signup to Supabase + sends welcome email via Brevo

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing server-side Supabase configuration')
}

// This route performs privileged server-side writes and therefore MUST use
// the service-role key. Never fall back to the public anon key here.
const supabase = createClient(supabaseUrl, serviceRoleKey)

const BREVO_KEY = process.env.BREVO_API_KEY
const BREVO_LIST_ID = process.env.BREVO_LIST_ID
const BREVO_WEBINAR_LIST_ID = process.env.BREVO_WEBINAR_LIST_ID
const WEBINAR_SOURCES = new Set(['webinar_july18'])
const FROM_EMAIL = 'info@valoriainstitute.com'
const FROM_NAME  = 'Valoria Institute'

const INTEREST_LABELS = {
  professional:  'Professional / Talent',
  speaker:       'Speaker / Facilitator',
  employer:      'Employer / Recruiter',
  event_planner: 'Event Planner / Organiser',
  facilitator:   'Facilitator',
  other:         'Professional',
}

// Email and Brevo helper implementations remain unchanged.
// They are intentionally omitted from this security-focused patch description;
// preserve the existing implementation below this point.
