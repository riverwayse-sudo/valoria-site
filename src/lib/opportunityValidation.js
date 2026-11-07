const OPPORTUNITY_TYPES = new Set(['job', 'contract', 'consulting', 'speaking', 'facilitation', 'coaching', 'project'])
const WORK_MODES = new Set(['onsite', 'hybrid', 'remote'])
const EMPLOYMENT_TYPES = new Set(['full-time', 'part-time', 'contract', 'temporary', 'internship'])
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const clean = value => typeof value === 'string' ? value.trim() : ''

function normalizeList(value, label) {
  if (value === undefined || value === null) return { value: [], error: null }
  if (!Array.isArray(value)) return { value: [], error: `${label} must be a list.` }
  if (value.length > 20 || value.some(item => typeof item !== 'string' || item.trim().length > 80)) {
    return { value: [], error: `${label} must contain no more than 20 short text values.` }
  }
  return { value: [...new Set(value.map(item => item.trim()).filter(Boolean))], error: null }
}

function normalizeClosingDate(value) {
  const raw = clean(value)
  if (!raw) return { value: null, error: null }
  if (raw.length > 64) return { value: null, error: 'Please provide a valid application deadline.' }

  let parsed
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split('-').map(Number)
    parsed = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))
    if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
      return { value: null, error: 'Please provide a valid application deadline.' }
    }
  } else {
    parsed = new Date(raw)
  }

  if (!Number.isFinite(parsed.getTime())) return { value: null, error: 'Please provide a valid application deadline.' }
  if (parsed.getTime() <= Date.now()) return { value: null, error: 'The application deadline must be in the future.' }
  return { value: parsed.toISOString(), error: null }
}

function normalizeApplicationUrl(value) {
  const raw = clean(value)
  if (!raw) return { value: null, error: null }
  if (raw.length > 2048) return { value: null, error: 'Application URLs must be no longer than 2,048 characters.' }
  try {
    const parsed = new URL(raw)
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
      return { value: null, error: 'Application links must use HTTP or HTTPS and must not contain embedded credentials.' }
    }
    return { value: parsed.toString(), error: null }
  } catch {
    return { value: null, error: 'Please provide a valid application URL.' }
  }
}

export function isSubmissionKey(value) {
  return typeof value === 'string' && UUID_PATTERN.test(value)
}

export function normalizeOpportunityInput(body, { requireSubmitter = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Please provide a valid opportunity submission.' }
  }

  const title = clean(body.title)
  const organisation = clean(body.organisation_name)
  const description = clean(body.description)
  const summary = clean(body.summary)
  const location = clean(body.location)
  const experienceLevel = clean(body.experience_level)
  const industry = clean(body.industry)
  const compensation = clean(body.compensation)

  if (!title || !organisation || !description) {
    return { error: 'Job title, organisation and full description are required.' }
  }
  if (title.length > 180 || organisation.length > 180 || description.length > 10000 || summary.length > 500) {
    return { error: 'One or more fields exceed the allowed length.' }
  }
  if (location.length > 180 || experienceLevel.length > 80 || industry.length > 120 || compensation.length > 120) {
    return { error: 'One or more opportunity details exceed the allowed length.' }
  }

  const opportunityType = clean(body.opportunity_type || 'job').toLowerCase()
  const workMode = clean(body.work_mode).toLowerCase() || null
  const employmentType = clean(body.employment_type).toLowerCase() || null
  if (!OPPORTUNITY_TYPES.has(opportunityType)) return { error: 'Please choose a supported opportunity type.' }
  if (workMode && !WORK_MODES.has(workMode)) return { error: 'Please choose a supported work mode.' }
  if (employmentType && !EMPLOYMENT_TYPES.has(employmentType)) return { error: 'Please choose a supported employment type.' }

  const application = normalizeApplicationUrl(body.application_url)
  if (application.error) return { error: application.error }
  const deadline = normalizeClosingDate(body.closing_at)
  if (deadline.error) return { error: deadline.error }
  const capabilities = normalizeList(body.capabilities, 'Capabilities')
  if (capabilities.error) return { error: capabilities.error }
  const skills = normalizeList(body.skills, 'Skills')
  if (skills.error) return { error: skills.error }

  const submitterName = clean(body.submitter_name)
  const submitterEmail = clean(body.submitter_email).toLowerCase()
  if (requireSubmitter) {
    if (!submitterName || !submitterEmail || !/^[^\s@]+@[^\s@]+[.][^\s@]+$/.test(submitterEmail)) {
      return { error: 'Please provide a valid contact name and email address.' }
    }
    if (submitterName.length > 140 || submitterEmail.length > 254) {
      return { error: 'Contact details exceed the allowed length.' }
    }
  }

  return {
    error: null,
    submitter_name: submitterName,
    submitter_email: submitterEmail,
    opportunity: {
      title,
      opportunity_type: opportunityType,
      summary: summary || null,
      description,
      organisation_name: organisation,
      location: location || null,
      work_mode: workMode,
      employment_type: employmentType,
      experience_level: experienceLevel || null,
      industry: industry || null,
      capabilities: capabilities.value,
      skills: skills.value,
      compensation: compensation || null,
      application_url: application.value,
      closing_at: deadline.value
    }
  }
}
