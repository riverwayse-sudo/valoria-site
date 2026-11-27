const BASE_FIELDS = [
  'professional_id',
  'full_name',
  'location',
  'languages',
  'headline',
  'current_job_title',
  'capability',
  'track',
  'capabilities',
  'selected_capabilities',
  'atb_id',
  'display_initials',
  'photo_url',
  'industry',
  'skills',
  'topics',
  'programme_types',
  'availability',
  'valu_index',
  'cluster_scores',
  'assessment_summary',
  'designation',
  'availability_status',
  'assessment_access',
].join(',')

const OPTIONAL_PROJECTION_COLUMNS = Object.freeze([
  'experience_years',
  'facilitation_topics',
  'format_capabilities',
  'audience_sizes',
  'past_events',
  'past_clients',
])

const FULL_FIELDS = `${BASE_FIELDS},${OPTIONAL_PROJECTION_COLUMNS.join(',')}`

function isOptionalProjectionSchemaError(error) {
  const code = String(error?.code || '').toUpperCase()
  if (!['42703', 'PGRST204'].includes(code)) return false

  const message = [
    error?.message,
    error?.details,
    error?.hint,
  ].filter(Boolean).join(' ').toLowerCase()

  return OPTIONAL_PROJECTION_COLUMNS.some(column => message.includes(column))
}

module.exports = {
  BASE_FIELDS,
  FULL_FIELDS,
  OPTIONAL_PROJECTION_COLUMNS,
  isOptionalProjectionSchemaError,
}
