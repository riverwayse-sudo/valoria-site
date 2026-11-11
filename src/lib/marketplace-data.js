import 'server-only'
import { createClient } from '@supabase/supabase-js'

const FIELDS = 'professional_id,location,languages,headline,current_job_title,capability,track,capabilities,selected_capabilities,atb_id,photo_url,industry,skills,topics,programme_types,availability,valu_index,cluster_scores,assessment_summary,designation,availability_status,assessment_access'
const SOURCE = 'marketplace_public_roster'
const PUBLIC_PROFILE_ACK_VERSION = 'public-profile-visibility-v3-2026-11-07'

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
      const { full_name: _fullName, display_initials: _displayInitials, ...publicRow } = row
      map.set(row.professional_id, {
        ...publicRow,
        assessmentAccess: row.assessment_access,
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

async function getApprovedPublicProfessionalIds(admin, rows) {
  if (!rows.length) return new Set()
  const ids = rows.map(row => row.professional_id)
  const { data: profiles, error } = await admin
    .from('professional_profiles')
    .select('id,atb_id,headline,current_job_title,profile_complete,is_test,visibility,listing_status,revoked_at,valu_index,assessment_completed_at,assessment_expires_at')
    .in('id', ids)

  if (error) {
    console.error('Public profile quality verification failed:', error)
    throw new Error('Public profile quality could not be verified.')
  }

  const basicIds = rows
    .filter(row => row.assessmentAccess === 'basic')
    .map(row => row.professional_id)
  let linkedTasterIds = new Set()
  if (basicIds.length) {
    const { data: tasters, error: tasterError } = await admin
      .from('taster_sessions')
      .select('user_id')
      .in('user_id', basicIds)
      .not('completed_at', 'is', null)

    if (tasterError) {
      console.error('Basic listing taster verification failed:', tasterError)
      throw new Error('Basic listing eligibility could not be verified.')
    }
    linkedTasterIds = new Set((tasters || []).map(row => row.user_id))
  }

  // A current full assessment may qualify for a restricted Basic directory card
  // when capability/CV evidence is still pending. No VALU score is exposed.
  let currentBasicAssessmentIds = new Set()
  if (basicIds.length) {
    const { data: basicAssessments, error: basicAssessmentError } = await admin
      .from('valu_assessments')
      .select('user_id,total_score,completed_at,expires_at')
      .in('user_id', basicIds)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
    if (basicAssessmentError) {
      console.error('Basic listing assessment verification failed:', basicAssessmentError)
      throw new Error('Basic listing assessment eligibility could not be verified.')
    }
    const latestBasicAssessmentById = new Map()
    for (const assessment of basicAssessments || []) {
      if (!latestBasicAssessmentById.has(assessment.user_id)) {
        latestBasicAssessmentById.set(assessment.user_id, assessment)
      }
    }
    const profileById = new Map((profiles || []).map(profile => [profile.id, profile]))
    currentBasicAssessmentIds = new Set(basicIds.filter(id => {
      const assessment = latestBasicAssessmentById.get(id)
      const profile = profileById.get(id)
      const assessmentExpiry = Date.parse(assessment?.expires_at || profile?.assessment_expires_at || '')
      const profileExpiry = Date.parse(profile?.assessment_expires_at || '')
      return Boolean(assessment && profile
        && Number(assessment.total_score) >= 35
        && Number(assessment.total_score) === Number(profile.valu_index)
        && Date.parse(assessment.completed_at || '') === Date.parse(profile.assessment_completed_at || '')
        && Number.isFinite(assessmentExpiry) && assessmentExpiry > Date.now()
        && Number.isFinite(profileExpiry) && profileExpiry > Date.now())
    }))
  }

  const fullIds = rows
    .filter(row => row.assessment_access === 'full')
    .map(row => row.professional_id)
  let fullReadyIds = new Set()
  if (fullIds.length) {
    const { data: fullAssessments, error: assessmentError } = await admin
      .from('valu_assessments')
      .select('user_id,total_score,completed_at,expires_at')
      .in('user_id', fullIds)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
    if (assessmentError) {
      console.error('Full assessment validity verification failed:', assessmentError)
      throw new Error('Full assessment validity could not be verified.')
    }
    const latestAssessmentById = new Map()
    for (const assessment of fullAssessments || []) {
      if (!latestAssessmentById.has(assessment.user_id)) latestAssessmentById.set(assessment.user_id, assessment)
    }
    // Full assessment access is distinct from capability-specific listing readiness.
    // A current, valid Full VALU result may appear in the general directory even when
    // profile completion or capability evidence is still pending.
    fullReadyIds = new Set(fullIds.filter(id => {
      const profile = (profiles || []).find(item => item.id === id)
      const assessment = latestAssessmentById.get(id)
      const assessmentExpiry = Date.parse(assessment?.expires_at || profile?.assessment_expires_at || '')
      const profileExpiry = Date.parse(profile?.assessment_expires_at || '')
      return Boolean(profile && assessment
        && Number(assessment.total_score) >= 35
        && Number(assessment.total_score) === Number(profile.valu_index)
        && Date.parse(assessment.completed_at || '') === Date.parse(profile.assessment_completed_at || '')
        && Number.isFinite(assessmentExpiry) && assessmentExpiry > Date.now()
        && Number.isFinite(profileExpiry) && profileExpiry > Date.now())
    }))
  }

  const { data: acknowledgements, error: acknowledgementError } = await admin
    .from('professional_profile_acknowledgements')
    .select('professional_id,acknowledgement_version')
    .eq('acknowledgement_type', 'profile_submission')
    .in('professional_id', ids)
    .order('acknowledged_at', { ascending: false })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })

  if (acknowledgementError) {
    console.error('Public profile consent verification failed:', acknowledgementError)
    throw new Error('Public profile consent could not be verified.')
  }

  const latestAcknowledgements = new Map()
  for (const acknowledgement of acknowledgements || []) {
    if (!latestAcknowledgements.has(acknowledgement.professional_id)) {
      latestAcknowledgements.set(acknowledgement.professional_id, acknowledgement.acknowledgement_version)
    }
  }
  const consentedIds = new Set([...latestAcknowledgements.entries()]
    .filter(([, version]) => version === PUBLIC_PROFILE_ACK_VERSION)
    .map(([professionalId]) => professionalId))
  const profileById = new Map((profiles || []).map(profile => [profile.id, profile]))
  return new Set(rows.filter(row => {
    const profile = profileById.get(row.professional_id)
    if (!profile || profile.is_test !== false || profile.visibility !== 'public'
      || profile.listing_status !== 'listed' || profile.revoked_at != null
      || !consentedIds.has(profile.id)) return false

    if (row.assessment_access === 'full') return Number(row.valu_index) >= 35 && Number(row.valu_index) === Number(profile.valu_index) && fullReadyIds.has(profile.id)
    return row.assessmentAccess === 'basic'
      && (linkedTasterIds.has(profile.id) || currentBasicAssessmentIds.has(profile.id))
      && /^ATB-[A-Z0-9-]{4,40}$/i.test(String(profile.atb_id || row.atb_id || '').normalize('NFKC').trim())
      && Boolean(String(profile.headline || profile.current_job_title || row.headline || row.current_job_title || '').trim().length >= 2)
  }).map(row => row.professional_id))
}

export async function getMarketplaceRows(track = 'all') {
  const admin = getAdminClient()

  const { data, error } = await admin
    .from(SOURCE)
    .select(FIELDS)
    .in('assessment_access', ['full', 'basic'])
    .order('valu_index', { ascending: false, nullsFirst: false })
    .order('atb_id', { ascending: true })

  if (error) {
    console.error('Marketplace query failed:', error)
    throw new Error('Marketplace listings could not be loaded.')
  }

  const projected = dedupeProfessionals((data || []).filter(isQualifiedPublicProfile))
  const approvedIds = await getApprovedPublicProfessionalIds(admin, projected)
  const rows = projected
    .filter(row => approvedIds.has(row.professional_id))
    .map(row => row.assessmentAccess === 'basic'
      ? { ...row, valu_index: null, cluster_scores: null, assessment_summary: null, designation: null }
      : row)
  // Category membership follows the participant's publicly declared active capability selection.
  // This is distinct from evidence-approved capability readiness: selection determines the
  // directory lane, while readiness remains separately governed in the admin workflow.
  // Public listing, consent, assessment validity and revocation checks are enforced above.
  return rows.filter(row => {
    if (track === 'all') return true
    const capability = normalizeTrack(track)
    return row.selectedCapabilities.includes(capability)
  })
}

function countMarketplaceRows(rows) {
  const byTrack = { candidate: new Set(), speaker: new Set(), facilitator: new Set() }

  for (const row of rows || []) {
    // Category counts follow publicly declared active selections for both Basic and Full profiles.
    // Evidence-approved readiness remains a separate admin eligibility state.
    const visibleCapabilities = row.selectedCapabilities || []
    for (const capability of new Set(visibleCapabilities)) {
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
      row.selectedCapabilities.includes(normalizedTrack)
    ),
    counts: countMarketplaceRows(allRows),
  }
}
