const SPECIALIST_CAPABILITIES = Object.freeze(['candidate', 'speaker', 'facilitator'])

function normalizeCapability(value) {
  const normalized = String(value || '').trim().toLowerCase()
  return normalized === 'talent' ? 'candidate' : normalized
}

function approvedCapabilities(row) {
  if (!Array.isArray(row?.capabilities)) return []
  return [...new Set(row.capabilities.map(normalizeCapability).filter(value => SPECIALIST_CAPABILITIES.includes(value)))]
}

function filterRowsByApprovedCapability(rows, track = 'all') {
  if (!Array.isArray(rows)) return []
  const normalizedTrack = normalizeCapability(track)
  if (!normalizedTrack || normalizedTrack === 'all') return rows
  if (!SPECIALIST_CAPABILITIES.includes(normalizedTrack)) return []
  return rows.filter(row => approvedCapabilities(row).includes(normalizedTrack))
}

function countRowsByApprovedCapability(rows) {
  const source = Array.isArray(rows) ? rows : []
  const professionals = new Set()
  const byTrack = {
    candidate: new Set(),
    speaker: new Set(),
    facilitator: new Set(),
  }

  for (const row of source) {
    const professionalId = row?.professional_id || row?.id
    if (!professionalId) continue
    professionals.add(professionalId)
    for (const capability of approvedCapabilities(row)) byTrack[capability].add(professionalId)
  }

  return {
    all: professionals.size,
    candidate: byTrack.candidate.size,
    speaker: byTrack.speaker.size,
    facilitator: byTrack.facilitator.size,
  }
}

module.exports = {
  SPECIALIST_CAPABILITIES,
  normalizeCapability,
  approvedCapabilities,
  filterRowsByApprovedCapability,
  countRowsByApprovedCapability,
}
