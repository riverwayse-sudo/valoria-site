const fs = require('fs')
const path = require('path')

const read = (relativePath) => fs.readFileSync(path.join(__dirname, relativePath), 'utf8')

describe('public profile and profile setup contracts', () => {
  test('public profile metadata resolves UUID and canonical ATB IDs through consent-verified lookup', () => {
    const source = read('../app/profile/[id]/layout.jsx')
    expect(source).toContain('getConsentVerifiedPublicProfile')
    expect(source).toContain("isUuid ? 'id' : 'atb_id'")
    expect(source).toContain('robots')
  })

  test('profile setup validates work history and database-confirmed completion before recording consent', () => {
    const source = read('../app/profile/setup/page.jsx')
    expect(source).toContain("if (screen?.key === 'work_history')")
    expect(source).toContain('Add at least one complete role')
    expect(source).toContain('if (!row.profile_complete)')
    expect(source).toContain('Your profile was saved, but Valoria has not confirmed it is complete')
  })
})
