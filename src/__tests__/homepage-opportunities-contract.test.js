const fs = require('fs')
const path = require('path')

const read = file => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('Homepage and opportunity discovery contract', () => {
  test('homepage surfaces real opportunity discovery and the current registration-first VALU journey', () => {
    const home = read('src/app/page.jsx')
    const opportunityPreview = read('src/components/HomepageOpportunities.jsx')

    expect(home).toContain('HomepageOpportunities')
    expect(home).toContain('REGISTER & TAKE THE VALU TASTER')
    expect(home).toContain('Register your details')
    expect(home).toContain('the separate Full assessment')
    expect(home).not.toContain('No account needed to begin')
    expect(home).not.toContain('capability eligibility')
    expect(opportunityPreview).toContain("fetch('/api/opportunities'")
    expect(opportunityPreview).toContain('No public opportunities are listed right now')
    expect(opportunityPreview).toContain('/opportunities/submit')
  })

  test('opportunity discovery explains relevance without presenting an unexplained match score', () => {
    const opportunities = read('src/app/opportunities/page.jsx')
    const matchingRoute = read('src/app/api/opportunities/matches/route.js')
    expect(opportunities).toContain('match_reasons')
    expect(opportunities).toContain('relevance')
    expect(opportunities).not.toContain('match_score')
    expect(opportunities).toContain('No public opportunities')
    expect(opportunities).toContain('/opportunities/submit')
    expect(matchingRoute).toContain("eq('access_level', 'public')")
    expect(matchingRoute).toContain("eq('eligibility_status', 'listed')")
    expect(matchingRoute).not.toContain('match_score')
    expect(matchingRoute).not.toContain('active_tracks')
  })
})
