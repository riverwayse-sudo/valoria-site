const fs = require('fs')
const path = require('path')

const read = relative => fs.readFileSync(path.join(__dirname, relative), 'utf8')
const nav = read('../components/Nav.jsx')
const dashboard = read('../app/dashboard/page.jsx')
const bridge = read('../components/ValoriaAssessmentBridge.jsx')
const handoff = read('../app/api/valu-handoff/route.js')

describe('authenticated VALU assessment bridge', () => {
  test('new accounts start the opening assessment while saved accounts resume at the bridge', () => {
    expect(nav).toContain("hasSavedOpening ? '/assessment/bridge' : '/assessment/start'")
    expect(dashboard).toContain('hasSavedOpening={true}')
    expect(dashboard).toContain('hasSavedOpening={hasSavedOpening}')
  })

  test('the bridge explains the saved nine and surfaces the next Valoria conversation', () => {
    expect(bridge).toContain('PROFESSIONAL_STANDARD_SERIES')
    expect(bridge).toContain('09')
    expect(bridge).toContain('58 questions saved')
    expect(bridge).toContain('CONTINUE TO QUESTION 10')
    expect(bridge).toContain('EXPLORE VALORIA EVENTS')
    expect(bridge).toContain('DATE TO BE ANNOUNCED')
    expect(bridge).toContain('window.location.replace(destination.toString())')
  })

  test('the one-time handoff is user-initiated and protected from duplicate clicks', () => {
    expect(bridge).not.toContain('useEffect')
    expect(bridge).toContain('handoffInFlightRef.current')
  })

  test('Cloudflare preview handoff never falls through to production runtime', () => {
    expect(handoff).toContain("process.env.VALU_PREVIEW === '1' || process.env.CF_WORKERS_PREVIEW === '1'")
  })
})
