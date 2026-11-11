const fs = require('fs')
const path = require('path')

describe('dashboard data integrity', () => {
  test('critical Supabase reads surface query errors instead of treating failures as empty data', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/app/dashboard/page.jsx'), 'utf8')
    expect(source).toContain('if (authError) throw authError')
    expect(source).toContain('if (professionalProfileError) throw professionalProfileError')
    expect(source).toContain('if (capabilityError) throw capabilityError')
    expect(source).toContain('if (assessmentError) throw assessmentError')
    expect(source).toContain('if (profileViewsError) throw profileViewsError')
    expect(source).toContain('if (buyerProfileError) throw buyerProfileError')
    expect(source).toContain('if (enquiriesError) throw enquiriesError')
  })

  test('partial dashboard failures remain visible when a profile was already loaded', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/app/dashboard/page.jsx'), 'utf8')
    expect(source).toContain('{loadError && profile && (')
    expect(source).toContain('RETRY')
    expect(source).toContain('Your saved assessment and profile data have not been changed.')
  })
})
