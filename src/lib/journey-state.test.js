const { deriveJourneyState } = require('./journey-state')

const completeProfile = {
  profile_complete: true,
  display_name: 'Test Professional',
  current_job_title: 'Director',
  bio: 'A professional bio.',
  industry: 'Technology',
  username: 'test-professional',
  phone: '+234000000000',
  location: 'Lagos',
  languages: ['English'],
  photo_url: '/photo.jpg',
  cv_url: '/cv.pdf',
  valu_index: 72,
}

const completedAssessment = {
  completed_at: '2026-09-29T10:00:00.000Z',
  total_score: 72,
  report_status: 'SENT',
  ai_report: { summary: 'ready' },
  report_email_sent_at: '2026-09-29T10:01:00.000Z',
}

test('new user is directed to assessment', () => {
  const state = deriveJourneyState({})
  expect(state.next).toBe('assess')
  expect(state.assessment.complete).toBe(false)
  expect(state.recoveryReason).toMatch(/No completed VALU assessment/)
})

test('completed assessment without report is recoverable at report stage', () => {
  const state = deriveJourneyState({
    assessment: { completed_at: '2026-09-29T10:00:00.000Z', total_score: 70, report_status: 'PENDING' },
  })
  expect(state.assessment.complete).toBe(true)
  expect(state.report.ready).toBe(false)
  expect(state.next).toBe('report')
})

test('completed report requires value activation before profile progression', () => {
  const state = deriveJourneyState({ assessment: completedAssessment })
  expect(state.report.ready).toBe(true)
  expect(state.next).toBe('report')
  expect(state.report.valueActivationComplete).toBe(false)
})

test('activation moves a complete professional to profile', () => {
  const state = deriveJourneyState({
    assessment: completedAssessment,
    activation: { status: 'activated' },
    profile: { ...completeProfile, profile_complete: false, bio: '' },
  })
  expect(state.next).toBe('profile')
  expect(state.profile.complete).toBe(false)
  expect(state.profile.missing).toContain('Your professional bio')
})

test('eligible capability is not enough until profile is complete', () => {
  const state = deriveJourneyState({
    assessment: completedAssessment,
    activation: { status: 'activated' },
    profile: completeProfile,
    capabilities: [{ id: 'c1', capability: 'talent', is_active: true, eligibility_status: 'eligible', eligible_for_listing: true }],
  })
  expect(state.profile.complete).toBe(true)
  expect(state.eligibility.complete).toBe(true)
  expect(state.marketplace.complete).toBe(false)
  expect(state.next).toBe('listed')
})

test('eligible or timestamped capability is not listed until authoritative listed status is set', () => {
  const state = deriveJourneyState({
    assessment: completedAssessment,
    activation: { status: 'activated' },
    profile: completeProfile,
    capabilities: [{ id: 'c1', capability: 'talent', is_active: true, eligibility_status: 'eligible', eligible_for_listing: true, listed_at: '2026-09-29T11:00:00.000Z' }],
  })
  expect(state.marketplace.complete).toBe(false)
  expect(state.next).toBe('listed')
})

test('listed capability unlocks opportunity access', () => {
  const state = deriveJourneyState({
    assessment: completedAssessment,
    activation: { status: 'activated' },
    profile: completeProfile,
    capabilities: [{ id: 'c1', capability: 'talent', is_active: true, eligibility_status: 'listed', eligible_for_listing: true, listed_at: '2026-09-29T11:00:00.000Z' }],
  })
  expect(state.marketplace.complete).toBe(true)
  expect(state.opportunity.access).toBe(true)
  expect(state.next).toBe('opportunity')
})

test('expired assessment cannot silently unlock current profile eligibility', () => {
  const state = deriveJourneyState({
    assessment: { ...completedAssessment, expires_at: '2020-01-01T00:00:00.000Z' },
    activation: { status: 'activated' },
    profile: completeProfile,
    capabilities: [{ id: 'c1', capability: 'talent', is_active: true, eligibility_status: 'eligible', eligible_for_listing: true }],
  })
  expect(state.assessment.current).toBe(false)
  expect(state.profile.complete).toBe(false)
  expect(state.next).toBe('profile')
})
