const fs = require('fs')
const path = require('path')
const {
  normalizeCapabilityTrack,
  getCapabilityEvidence,
  getCapabilityEvidenceSummary,
  getCapabilityCardLabels,
} = require('../lib/profile-capability-evidence.cjs')

const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8')

describe('specialized profile content contract', () => {
  test('Talent is normalized to the candidate capability key', () => {
    expect(normalizeCapabilityTrack('talent')).toBe('candidate')
  })

  test('Talent views use skills and professional context', () => {
    const sections = getCapabilityEvidence({
      skills: ['Strategy', 'Operations'],
      current_job_title: 'Chief Operating Officer',
      industry: 'Financial Services',
      experience_years: 12,
      assessment_summary: 'General VALU narrative must not be reused here.',
    }, 'talent')
    expect(sections).toEqual([
      { label: 'Core skills', items: ['Strategy', 'Operations'] },
      { label: 'Professional context', items: ['Chief Operating Officer', 'Financial Services', "12 years' experience"] },
    ])
  })

  test('Speaker views use speaking topics, formats, audience experience and engagements', () => {
    const sections = getCapabilityEvidence({
      topics: ['Leadership', 'Culture'],
      format_capabilities: ['Keynote', 'Panel'],
      audience_sizes: ['100-250', '250-500'],
      past_events: [{ name: 'Leadership Forum', role: 'Keynote speaker' }],
      assessment_summary: 'General VALU narrative must not be reused here.',
    }, 'speaker')
    expect(sections.map(section => section.label)).toEqual([
      'Speaking topics',
      'Speaking formats',
      'Audience experience',
      'Speaking engagements',
    ])
    expect(sections[3].items).toEqual(['Leadership Forum · Keynote speaker'])
  })

  test('Facilitator views use facilitation topics, programme types, formats, audience experience and client evidence', () => {
    const sections = getCapabilityEvidence({
      facilitation_topics: ['Executive alignment'],
      programme_types: ['Leadership development'],
      format_capabilities: ['Workshop', 'Offsite'],
      audience_sizes: ['20-50'],
      past_clients: [{ name: 'Northstar Group', programme: 'Leadership academy' }],
    }, 'facilitator')
    expect(sections.map(section => section.label)).toEqual([
      'Facilitation topics',
      'Programme types',
      'Delivery formats',
      'Audience experience',
      'Clients and programmes',
    ])
    expect(sections[4].items).toEqual(['Northstar Group · Leadership academy'])
  })

  test('specialist cards use track-specific chips rather than general Talent skills', () => {
    const profile = {
      skills: ['Talent skill'],
      topics: ['Speaking topic'],
      format_capabilities: ['Keynote'],
      facilitation_topics: ['Facilitation topic'],
      programme_types: ['Leadership programme'],
    }
    expect(getCapabilityCardLabels(profile, 'candidate')).toEqual(['Talent skill'])
    expect(getCapabilityCardLabels(profile, 'speaker')).toEqual(['Speaking topic', 'Keynote'])
    expect(getCapabilityCardLabels(profile, 'facilitator')).toEqual(['Facilitation topic', 'Leadership programme', 'Keynote'])
  })

  test('missing specialist evidence uses a neutral fallback, never the general VALU summary', () => {
    const profile = { assessment_summary: 'General report narrative.' }
    expect(getCapabilityEvidence(profile, 'speaker')).toEqual([])
    expect(getCapabilityEvidenceSummary(profile, 'speaker')).toContain('No published Speaker-specific evidence')
    expect(getCapabilityEvidenceSummary(profile, 'speaker')).not.toContain('General report narrative')
  })

  test('the marketplace and profile detail views use the shared specialist adapter', () => {
    const directory = read('components/MarketplaceDirectory.jsx')
    const profile = read('app/profile/[id]/ProfileClient.jsx')
    const data = read('lib/marketplace-data.js')
    expect(directory).toContain('getCapabilityEvidence(profile, selectedTrack)')
    expect(directory).toContain('getCapabilityCardLabels(p, normalizedTrack)')
    expect(directory).toContain("const modalHeadline = selectedTrack === 'candidate'")
    expect(directory).toContain("selectedTrack === 'all' && <select")
    expect(directory).toContain('isGeneralView && strongestCluster')
    expect(directory).toContain("(selectedTrack === 'all' ? Number(scored(b))")
    expect(directory).toContain('isGeneralView ? (isFull ?')
    expect(directory).toContain('TALENT CAPABILITY')
    expect(directory).toContain('SPEAKER CAPABILITY')
    expect(directory).toContain('!isSpecializedView && isFull')
    expect(directory).toContain('activeTrack={selectedTrack}')
    expect(directory).toContain('encodeURIComponent(selectedTrack)')
    expect(profile).toContain('getCapabilityEvidence(p, displayTrack)')
    expect(profile).toContain('!isSpecializedView && p.cluster_scores')
    expect(profile).toContain('isSpecializedView ? (')
    expect(profile).toContain('VIEW GENERAL PROFILE')
    expect(profile).toContain('p.experience_years')
    expect(profile).toContain('const profileHeadline = isSpecializedView')
    expect(data).toContain('facilitation_topics,format_capabilities,audience_sizes,past_events,past_clients')
  })
})
