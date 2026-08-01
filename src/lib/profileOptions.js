// Shared option lists, brand tokens, and answer-format validators used by
// both the onboarding wizard (profile/setup) and the profile edit page
// (profile/edit) — pulled out into one place on 1 Aug 2026 when the edit
// page was split out of the wizard, so the two can't drift out of sync on
// what counts as a valid industry, a valid phone number, etc.

export const GOLD  = '#C9A84C'
export const DARK  = '#0F0F1A'
export const MID   = '#1A1A2E'
export const PARCH = '#F7F4EE'
export const DIM   = 'rgba(247,244,238,.5)'
export const GLINE = 'rgba(201,168,76,.14)'

export const INDUSTRIES = ['Agriculture & Agritech','Architecture & Design','Consulting & Strategy','Education & EdTech','Energy & Sustainability','Entertainment & Media','Fashion & Beauty','Fintech & Banking','Government & Public Policy','Healthcare','Hospitality & Travel','Law','Logistics & Supply Chain','Manufacturing','Marketing & Advertising','Nonprofit & Development','Real Estate','Sports & Wellness','Technology & SaaS','Telecommunications']
export const SKILLS_POOL = ['Strategy','Leadership','Public Speaking','Negotiation','Branding','Operations','Data Analysis','Fundraising','Policy Design','Product Management','Stakeholder Management','Storytelling','Market Research','Change Management','Innovation','Project Management','Financial Modelling','People Management','Business Development','Digital Marketing']
export const TOPICS_POOL = ['Leadership & Management','Strategy & Innovation','Diversity & Inclusion','Finance & Investment','Technology & AI','Entrepreneurship','Sustainability','Future of Work','Communication','Governance','Mental Health at Work','Global Affairs','People Development','Brand & Marketing','Education Reform']
export const PROGRAMME_TYPES = ['Leadership Development','Team Effectiveness','Strategic Thinking','DEI & Belonging','Communication Skills','Sales Enablement','Executive Coaching','Change Management','Culture & Values','Finance for Non-Finance']
export const LANGUAGES = ['English','French','Swahili','Hausa','Yoruba','Igbo','Zulu','Amharic','Arabic','Portuguese','Wolof','Twi','Shona','Afrikaans','Xhosa','Somali','Oromo','Tigrinya','Kinyarwanda','Chichewa','Fulani (Fulfulde)','Lingala','Kikuyu','Ndebele','Berber (Tamazight)','Krio','Sesotho']
export const CONTRACT_PREFS = [{ value:'permanent', label:'Permanent / full-time' }, { value:'contract', label:'Contract / freelance' }, { value:'both', label:'Open to both' }]
export const FORMAT_CAPS = ['Keynote','Panel speaker','Workshop facilitator','Masterclass host','Conference MC','Fireside chat']
export const AUDIENCE_SIZES = ['Under 50','50–200','200–500','500–1,000','1,000–5,000','5,000+']
export const NOTICE_PERIODS = ['Immediately','2 weeks','1 month','2 months','3+ months']
export const WORK_DURATIONS = ['Less than 1 year','1–2 years','2–3 years','3–5 years','5–10 years','10+ years']

export const FIELD_LABELS = {
  display_name: 'your name', headline: 'your headline', bio: 'your bio',
  active_tracks: 'your path (Talent / Speaker / Facilitator)', industry: 'your industry',
  username: 'your username', phone: 'your phone number',
}

export const VALIDATORS = {
  place: (v) => {
    const t = (v || '').trim()
    if (!t) return true
    if (t.length < 2) return false
    if (/\d/.test(t)) return false
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s,.'-]+$/.test(t)) return false
    if (!/[aeiouAEIOU]/.test(t)) return false
    return true
  },
  number: (v) => {
    const t = (v || '').trim()
    if (!t) return true
    if (!/^\d{1,2}$/.test(t)) return false
    const n = Number(t)
    return n >= 0 && n <= 70
  },
  url: (v) => {
    const t = (v || '').trim()
    if (!t) return true
    try {
      const u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`)
      return !!u.hostname && u.hostname.includes('.')
    } catch { return false }
  },
  linkedin: (v) => {
    const t = (v || '').trim()
    if (!t) return true
    return VALIDATORS.url(t) && /linkedin\.com/i.test(t)
  },
  youtube: (v) => {
    const t = (v || '').trim()
    if (!t) return true
    return VALIDATORS.url(t) && /(youtube\.com|youtu\.be)/i.test(t)
  },
  username: (v) => {
    const t = (v || '').trim()
    if (!t) return true
    return /^[a-zA-Z0-9_.-]{3,30}$/.test(t)
  },
  phone: (v) => {
    const t = (v || '').trim()
    if (!t) return true
    return /^\+?[0-9\s-]{7,17}$/.test(t)
  },
}

export function validatorError(kind) {
  switch (kind) {
    case 'place':    return 'That doesn\u2019t look like a location — letters only, e.g. Lagos, Nigeria.'
    case 'number':    return 'Numbers only, please (e.g. 12).'
    case 'linkedin': return 'Enter a valid LinkedIn URL, e.g. https://linkedin.com/in/yourname'
    case 'youtube':  return 'Enter a valid YouTube URL.'
    case 'url':      return 'Enter a valid URL, e.g. https://yoursite.com'
    case 'username': return '3-30 characters — letters, numbers, dots, underscores or hyphens only, no spaces.'
    case 'phone':    return 'Enter a valid phone number, e.g. +234 801 234 5678.'
    default:         return 'That doesn\u2019t look right — please check your answer.'
  }
}

export function getInitials(name) {
  if (!name) return '?'
  const w = name.trim().split(/\s+/)
  return w.length === 1 ? w[0].slice(0,2).toUpperCase() : (w[0][0] + w[w.length-1][0]).toUpperCase()
}
