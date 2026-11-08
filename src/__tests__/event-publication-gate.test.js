const fs = require('fs')
const path = require('path')
const read = file => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('public event announcement gate', () => {
  test('unapproved future calendar entries are not rendered publicly', () => {
    const page = read('src/app/events/page.jsx')
    const series = read('src/lib/professionalStandardSeries.js')
    expect(page).toContain('session.publiclyAnnounced === true')
    expect(series).toContain('publiclyAnnounced: false')
    expect(page).not.toContain("return getSessionState(session) === 'coming-soon'")
  })
})
