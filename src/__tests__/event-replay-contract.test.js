const fs = require('fs')
const path = require('path')

const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8')

describe('November event replay contract', () => {
  test('the November 14 session is marked ended and has the approved replay', () => {
    const catalogue = read('lib/professionalStandardSeries.js')
    expect(catalogue).toContain("id: '04'")
    expect(catalogue).toContain("youtubeVideoId: 'Ae9N59SlR_8', manuallyEnded: true")
    expect(catalogue).toContain("if (session.manuallyEnded) return 'ended'")
    const manualEndCheck = catalogue.indexOf("if (session.manuallyEnded) return 'ended'")
    const previousLockCheck = catalogue.indexOf("if (previous && !previous.end && !previous.manuallyEnded)")
    const futureStartCheck = catalogue.indexOf("if (now < start) return 'registration-open'")
    expect(manualEndCheck).toBeGreaterThanOrEqual(0)
    expect(manualEndCheck).toBeLessThan(previousLockCheck)
    expect(manualEndCheck).toBeLessThan(futureStartCheck)
  })

  test('the Events page features the November 14 replay and identifies its host', () => {
    const page = read('app/events/page.jsx')
    expect(page).toContain("session.id === '04'")
    expect(page).toContain('Hosted by {webinar.host}')
    expect(page).toContain('Valoria Institute event replay')
    expect(page).toContain('https://youtu.be/')
  })

  test('the homepage selects the latest approved replay instead of the earliest', () => {
    const homepage = read('components/HomepageEvents.jsx')
    expect(homepage).toContain('[...PROFESSIONAL_STANDARD_SERIES].reverse().find')
  })
})
