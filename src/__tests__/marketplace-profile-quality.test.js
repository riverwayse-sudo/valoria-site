const { isPublicProfileContentReady } = require('../lib/marketplace-data')

const baseProfile = {
  full_name: 'Ada Lovelace',
  atb_id: 'ATB-123456',
  headline: 'Senior Systems Engineer',
  assessment_access: 'basic',
  valu_index: null,
  assessment_summary: null,
}

describe('public marketplace profile content gate', () => {
  test('allows a completed Basic listing without an official VALU score', () => {
    expect(isPublicProfileContentReady(baseProfile)).toBe(true)
  })

  test('allows a Full listing only with official points and a VALU report summary', () => {
    expect(isPublicProfileContentReady({
      ...baseProfile,
      assessment_access: 'full',
      valu_index: 68,
      assessment_summary: 'Demonstrates strong strategic judgement and execution capability.',
    })).toBe(true)
  })

  test('blocks a Full listing without official points or a report summary', () => {
    expect(isPublicProfileContentReady({
      ...baseProfile,
      assessment_access: 'full',
      valu_index: null,
      assessment_summary: 'A valid summary exists but there is no official score.',
    })).toBe(false)
    expect(isPublicProfileContentReady({
      ...baseProfile,
      assessment_access: 'full',
      valu_index: 68,
      assessment_summary: '',
    })).toBe(false)
  })

  test('blocks unknown assessment access states and placeholder profile copy', () => {
    expect(isPublicProfileContentReady({ ...baseProfile, assessment_access: 'unknown' })).toBe(false)
    expect(isPublicProfileContentReady({ ...baseProfile, headline: 'Growth Dev' })).toBe(false)
    expect(isPublicProfileContentReady({ ...baseProfile, headline: 'Model' })).toBe(false)
    expect(isPublicProfileContentReady({ ...baseProfile, headline: 'Help people find meaning in their life and career' })).toBe(false)
  })

  test('blocks stylised mathematical alphabet text until re-entered in plain text', () => {
    expect(isPublicProfileContentReady({ ...baseProfile, headline: '𝙎𝙚𝙣𝙞𝙤𝙧 𝙀𝙣𝙜𝙞𝙣𝙚𝙚𝙧' })).toBe(false)
  })
})
