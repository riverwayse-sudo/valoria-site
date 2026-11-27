const {
  BASE_FIELDS,
  FULL_FIELDS,
  OPTIONAL_PROJECTION_COLUMNS,
  isOptionalProjectionSchemaError,
} = require('../lib/marketplace-projection-compat.cjs')

describe('marketplace specialist projection schema compatibility', () => {
  test('full projection includes specialist fields while the compatible projection omits only optional columns', () => {
    for (const column of OPTIONAL_PROJECTION_COLUMNS) {
      expect(FULL_FIELDS.split(',')).toContain(column)
      expect(BASE_FIELDS.split(',')).not.toContain(column)
    }
    expect(BASE_FIELDS.split(',')).toContain('professional_id')
    expect(BASE_FIELDS.split(',')).toContain('assessment_access')
    expect(BASE_FIELDS.split(',')).toContain('selected_capabilities')
  })

  test('recognises only missing optional specialist projection columns', () => {
    expect(isOptionalProjectionSchemaError({
      code: '42703',
      message: 'column marketplace_public_roster.experience_years does not exist',
    })).toBe(true)

    expect(isOptionalProjectionSchemaError({
      code: 'PGRST204',
      message: "Could not find the 'facilitation_topics' column in the schema cache",
    })).toBe(true)

    expect(isOptionalProjectionSchemaError({
      code: '42703',
      message: 'column marketplace_public_roster.valu_index does not exist',
    })).toBe(false)

    expect(isOptionalProjectionSchemaError({
      code: 'PGRST116',
      message: 'The result contains 0 rows',
    })).toBe(false)

    expect(isOptionalProjectionSchemaError({
      message: 'Network request failed',
    })).toBe(false)
  })
})
