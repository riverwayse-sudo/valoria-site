// Shared adapter for capability-specific profile content.
// The overall VALU Index narrative is deliberately not reused in specialist views.
export function normalizeCapabilityTrack(value) {
  const track = String(value || '').trim().toLowerCase()
  if (track === 'talent') return 'candidate'
  return track
}

function cleanText(value) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function stringValues(value) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.map(item => {
    if (typeof item === 'string') return cleanText(item)
    if (!item || typeof item !== 'object') return ''
    return cleanText(item.label || item.name || item.title || item.value || item.skill_name)
  }).filter(Boolean))]
}

function evidenceValues(value, fields) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.map(item => {
    if (typeof item === 'string') return cleanText(item)
    if (!item || typeof item !== 'object') return ''
    return fields.map(field => cleanText(item[field])).filter(Boolean).join(' · ')
  }).filter(Boolean))]
}

export function getCapabilityEvidence(profile = {}, requestedTrack) {
  const track = normalizeCapabilityTrack(requestedTrack)
  let sections = []

  if (track === 'candidate') {
    const context = [
      cleanText(profile.current_job_title),
      cleanText(profile.industry),
      profile.experience_years != null && profile.experience_years !== ''
        ? `${profile.experience_years} years' experience`
        : '',
    ].filter(Boolean)
    sections = [
      { label: 'Core skills', items: stringValues(profile.skills) },
      { label: 'Professional context', items: context },
    ]
  } else if (track === 'speaker') {
    sections = [
      { label: 'Speaking topics', items: stringValues(profile.topics) },
      { label: 'Speaking formats', items: stringValues(profile.format_capabilities) },
      { label: 'Audience experience', items: stringValues(profile.audience_sizes) },
      { label: 'Speaking engagements', items: evidenceValues(profile.past_events, ['name', 'role']) },
    ]
  } else if (track === 'facilitator') {
    sections = [
      { label: 'Facilitation topics', items: stringValues(profile.facilitation_topics) },
      { label: 'Programme types', items: stringValues(profile.programme_types) },
      { label: 'Delivery formats', items: stringValues(profile.format_capabilities) },
      { label: 'Audience experience', items: stringValues(profile.audience_sizes) },
      { label: 'Clients and programmes', items: evidenceValues(profile.past_clients, ['name', 'programme']) },
    ]
  }

  return sections.filter(section => section.items.length > 0)
}

export function getCapabilityEvidenceSummary(profile = {}, requestedTrack) {
  const track = normalizeCapabilityTrack(requestedTrack)
  const sections = getCapabilityEvidence(profile, track)
  const count = sections.reduce((total, section) => total + section.items.length, 0)
  const names = {
    candidate: 'Talent',
    speaker: 'Speaker',
    facilitator: 'Facilitator',
  }
  const label = names[track] || 'Specialist'
  if (!count) {
    return `No published ${label}-specific evidence is available yet. The overall VALU Index narrative remains separate in the general profile view.`
  }
  const evidence = sections.map(section => section.label.toLowerCase()).join(', ')
  return `This ${label} view is based on published capability evidence across ${evidence}. The overall VALU Index narrative remains separate.`
}
