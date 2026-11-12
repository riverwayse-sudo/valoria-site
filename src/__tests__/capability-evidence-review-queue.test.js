const fs = require('fs')
const path = require('path')

describe('capability evidence review queue', () => {
  test('latest changes-requested decisions are separated from awaiting review counts', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/app/admin/capability-evidence/page.jsx'), 'utf8')
    expect(source).toContain("history[x.id]?.[0]?.decision!=='changes_requested'")
    expect(source).toContain("history[x.id]?.[0]?.decision==='changes_requested'||x.verification_status==='rejected'")
    expect(source).toContain("latestDecision==='changes_requested'?'changes requested':d.verification_status")
  })
})
