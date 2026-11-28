import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { BASE_FIELDS, FULL_FIELDS, isOptionalProjectionSchemaError } from './marketplace-projection-compat.cjs'

const SOURCE = 'marketplace_public_roster'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Marketplace service credentials are unavailable.')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

const PLACEHOLDER_HEADLINES = new Set([
  'model',
  'growth dev',
  'help people find meaning in their life and career',
  'valoria professional',
])

function isQualifiedPublicProfile(row) {
  const rawHeadline = String(row?.headline || row?.current_job_title || '').trim()
  const headline = normalizePublicDisplayText(rawHeadline)
  const normalizedAtbId = String(row?.atb_id || '').normalize('NFKC').trim()
  const validAtbId = /^ATB-[A-Z0-9-]{4,40}$/i.test(normalizedAtbId)
  const validHeadline = rawHeadline.length >= 2 &&
    !PLACEHOLDER_HEADLINES.has(headline.toLowerCase()) &&
    !/[\u{1D400}-\u{1D7FF}]/u.test(rawHeadline)
  const hasIdentity = Boolean(
    row?.professional_id &&
    typeof row.full_name === 'string' && row.full_name.trim() &&
    validHeadline &&
    validAtbId
  )
  if (!hasIdentity) return false

  if (row.assessment_access === 'basic') return true
  return Boolean(
    row.assessment_access === 'full' &&
    ((Array.isArray(row.capabilities) && row.capabilities.length > 0) || (Array.isArray(row.selected_capabilities) && row.selected_capabilities.length > 0)) &&
    row.valu_index !== null && row.valu_index !== undefined && Number.isFinite(Number(row.valu_index)) && Number(row.valu_index) >= 35 &&
    typeof row.assessment_summary === 'string' && row.assessment_summary.trim().length >= 12 &&
    typeof row.designation === 'string' && row.designation.trim()
  )
}

function normalizeTrack(value) {
  const v = String(value || '').toLowerCase()
  return v === 'talent' ? 'candidate' : v
}

function normalizePublicDisplayText(value) {
  return typeof value === 'string' ? value.normalize('NFKC').replace(/\s+/g, ' ').trim() : value
}

function dedupeProfessionals(rows) {
  const map = new Map()
  for (const row of rows || []) {
    if (!row.professional_id) continue
    if (!map.has(row.professional_id)) {
      map.set(row.professional_id, {
        ...row,
        assessmentAccess: row.assessment_access,
        full_name: normalizePublicDisplayText(row.full_name),
        display_initials: normalizePublicDisplayText(row.display_initials),
        headline: normalizePublicDisplayText(row.headline),
        current_job_title: normalizePublicDisplayText(row.current_job_title),
        id: row.professional_id,
        capabilities: [],
        tracks: [],
        selectedCapabilities: [],
      })
    }
    const target = map.get(row.professional_id)
    const values = [
      ...(Array.isArray(row.capabilities) ? row.capabilities : []),
      row.capability,
      row.track,
    ].map(normalizeTrack).filter(Boolean)
    const selectedValues = (Array.isArray(row.selected_capabilities) ? row.selected_capabilities : [])
      .map(normalizeTrack).filter(Boolean)
    target.capabilities = [...new Set([...target.capabilities, ...values])]
    target.tracks = target.capabilities
    target.selectedCapabilities = [...new Set([...target.selectedCapabilities, ...selectedValues])]
  }
  return [...map.values()]
}

// The canonical marketplace roster is the database-enforced public projection.
// Re-querying profiles and assessments here duplicated (and could contradict) the
// eligibility rules, causing valid roster rows to disappear from both public surfaces.
function getApprovedPublicProfessionalIds(rows) {
  return new Set((rows || [])
    .filter(row => row?.professional_id && ['basic', 'full'].includes(row.assessment_access))
    .map(row => row.professional_id))
}

async function fetchMarketplaceProjection(admin) {
  const query = fields => admin
    .from(SOURCE)
    .select(fields)
    .in('assessment_access', ['full', 'basic'])
    .order('valu_index', { ascending: false, nullsFirst: false })
    .order('full_name', { ascending: true })

  let result = await query(FULL_FIELDS)
  if (result.error && isOptionalProjectionSchemaError(result.error)) {
    console.warn('Marketplace specialist projection columns are not available; using the compatible general-roster projection.')
    result = await query(BASE_FIELDS)
  }
  return result
}

export async function getMarketplaceRows(track = 'all') {
  const admin = getAdminClient()
  const { data, error } = await fetchMarketplaceProjection(admin)

  if (error) {
    console.error('Marketplace query failed:', error)
    throw new Error('Marketplace listings could not be loaded.')
  }

  const projected = dedupeProfessionals((data || []).filter(isQualifiedPublicProfile))
  const approvedIds = getApprovedPublicProfessionalIds(projected)
  const rows = projected
    .filter(row => approvedIds.has(row.professional_id))
    .map(row => row.assessmentAccess === 'basic'
      ? { ...row, valu_index: null, cluster_scores: null, assessment_summary: null, designation: null }
      : row)
  // Directory placement is restricted to capabilities approved for public listing.
  // selectedCapabilities are participant declarations and are displayed as declarations
  // on the general profile card; they must never be treated as verified specialist supply.
  // The canonical roster's capabilities array contains only evidence-approved placements.
  return rows.filter(row => {
    if (track === 'all') return true
    const capability = normalizeTrack(track)
    return row.capabilities.includes(capability)
  })
}

function countMarketplaceRows(rows) {
  const byTrack = { candidate: new Set(), speaker: new Set(), facilitator: new Set() }

  for (const row of rows || []) {
    // Counts represent only evidence-approved public directory placements.
    // Participant-declared selections are intentionally excluded from supply counts.
    const approvedCapabilities = row.capabilities || []
    for (const capability of new Set(approvedCapabilities)) {
      if (byTrack[capability]) byTrack[capability].add(row.professional_id)
    }
  }

  return {
    all: (rows || []).length,
    candidate: byTrack.candidate.size,
    speaker: byTrack.speaker.size,
    facilitator: byTrack.facilitator.size,
  }
}

export async function getMarketplaceCounts(existingRows) {
  const rows = Array.isArray(existingRows) ? existingRows : await getMarketplaceRows('all')
  return countMarketplaceRows(rows)
}

export async function getMarketplaceDirectoryData(track = 'all') {
  const allRows = await getMarketplaceRows('all')
  const normalizedTrack = normalizeTrack(track)
  return {
    rows: normalizedTrack === 'all' ? allRows : allRows.filter(row =>
      row.capabilities.includes(normalizedTrack)
    ),
    counts: countMarketplaceRows(allRows),
  }
}
