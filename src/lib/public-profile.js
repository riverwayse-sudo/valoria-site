export const PUBLIC_PROFILE_SELECT = [
  'professional_id', 'full_name', 'bio', 'location', 'languages', 'headline',
  'current_job_title', 'capability', 'track', 'capabilities', 'selected_capabilities',
  'atb_id', 'display_initials', 'photo_url', 'industry', 'skills', 'topics',
  'programme_types', 'availability', 'valu_index', 'cluster_scores', 'designation',
  'fee_range', 'salary_expectation', 'availability_status', 'assessment_access',
  'assessment_summary',
].join(',')

const VALID_TRACKS = new Set(['candidate', 'speaker', 'facilitator'])

function normaliseTrack(track) {
  const value = String(track || '').trim().toLowerCase()
  const normalized = value === 'talent' ? 'candidate' : value
  return VALID_TRACKS.has(normalized) ? normalized : null
}

/**
 * Convert the public roster projection into the display shape used by the
 * profile page. Never add private contact fields or query professional_profiles
 * from an anonymous/public route.
 */
export function toPublicProfile(row) {
  if (!row) return null

  const rawCapabilities = Array.isArray(row.capabilities) && row.capabilities.length
    ? row.capabilities
    : (row.track ? [row.track] : [])
  const capabilities = [...new Set(rawCapabilities.map(normaliseTrack).filter(Boolean))]

  return {
    id: row.professional_id,
    display_name: row.full_name || 'Valoria Professional',
    display_initials: row.display_initials || '',
    headline: row.headline || '',
    current_job_title: row.current_job_title || '',
    location: row.location || '',
    industry: row.industry || '',
    experience_years: null,
    years_experience: null,
    bio: row.bio || '',
    skills: Array.isArray(row.skills) ? row.skills : [],
    topics: Array.isArray(row.topics) ? row.topics : [],
    active_tracks: capabilities,
    capabilities,
    selected_capabilities: Array.isArray(row.selected_capabilities) ? row.selected_capabilities : [],
    languages: Array.isArray(row.languages) ? row.languages : [],
    programme_types: Array.isArray(row.programme_types) ? row.programme_types : [],
    availability: Array.isArray(row.availability) ? (row.availability[0] || null) : (row.availability || null),
    availability_status: row.availability_status || null,
    valu_index: row.valu_index ?? null,
    valu_score: row.valu_index ?? null,
    cluster_scores: row.cluster_scores || null,
    designation: row.designation || null,
    assessment_access: row.assessment_access || 'basic',
    assessment_summary: row.assessment_summary || null,
    fee_range: row.fee_range || null,
    salary_expectation: row.salary_expectation || null,
    atb_id: row.atb_id ? String(row.atb_id).normalize('NFKC') : null,
    photo_url: row.photo_url || null,
    // These fields are deliberately not part of the public roster projection.
    phone: null,
    linkedin_url: null,
    website_url: null,
    youtube_links: [],
    username: null,
    cv_summary: null,
    is_dummy: false,
    _source: 'public_roster',
  }
}
