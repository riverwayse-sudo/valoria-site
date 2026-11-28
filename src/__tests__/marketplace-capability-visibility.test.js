const {
  approvedCapabilities,
  filterRowsByApprovedCapability,
  countRowsByApprovedCapability,
} = require('../lib/marketplace-capability-visibility.cjs')

describe('approved specialist capability projection', () => {
  const profiles = [
    {
      professional_id: 'profile-declared-speaker',
      selectedCapabilities: ['speaker'],
      capabilities: [],
    },
    {
      professional_id: 'profile-approved-talent',
      selectedCapabilities: ['candidate', 'speaker', 'facilitator'],
      capabilities: ['candidate', 'candidate'],
    },
    {
      professional_id: 'profile-approved-facilitator',
      selectedCapabilities: ['facilitator'],
      capabilities: ['facilitator'],
    },
  ]

  test('declared selections never become evidence-approved capability placements', () => {
    expect(approvedCapabilities(profiles[0])).toEqual([])
    expect(filterRowsByApprovedCapability(profiles, 'speaker')).toEqual([])
    expect(filterRowsByApprovedCapability(profiles, 'facilitator').map(row => row.professional_id)).toEqual(['profile-approved-facilitator'])
  })

  test('only approved capability arrays contribute to directory counts', () => {
    expect(countRowsByApprovedCapability(profiles)).toEqual({
      all: 3,
      candidate: 1,
      speaker: 0,
      facilitator: 1,
    })
  })

  test('Talent is normalized to the canonical candidate category', () => {
    expect(filterRowsByApprovedCapability([
      { professional_id: 'talent-1', capabilities: ['talent'] },
    ], 'candidate').map(row => row.professional_id)).toEqual(['talent-1'])
    expect(countRowsByApprovedCapability([
      { professional_id: 'talent-1', capabilities: ['talent'] },
    ]).candidate).toBe(1)
  })

  test('unsupported categories fail closed', () => {
    expect(filterRowsByApprovedCapability(profiles, 'executive')).toEqual([])
  })
})
