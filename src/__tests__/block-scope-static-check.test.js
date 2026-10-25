// src/__tests__/block-scope-static-check.test.js
//
// Guards the site against the defect class found in the platform's
// submit-assessment handler: a const/let declared inside a block (try, if, for)
// and read outside it. That is a ReferenceError at runtime, but only on the path
// that reaches it, so a green build and substring-based source assertions both
// miss it. This repository's API routes and journey code are held to the same
// check.

const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const root = process.cwd()
const script = path.join(root, 'scripts/find-block-scope-bugs.mjs')
const fixtures = path.join(root, 'test-fixtures/block-scope')

const run = (...dirs) => {
  const r = spawnSync('node', [script, ...dirs], { cwd: root, encoding: 'utf8' })
  return { status: r.status, stdout: r.stdout || '', stderr: r.stderr || '' }
}

describe('block-scope static check', () => {
  test('the check script is present and runnable', () => {
    expect(fs.existsSync(script)).toBe(true)
    const { status, stdout } = run(fixtures)
    expect(stdout).toBeDefined()
    expect(status === 0 || status === 1).toBe(true)
  })

  test('it flags a const declared in a try and used after the block', () => {
    const { status, stdout } = run(path.join(fixtures, 'buggy.js'))
    expect(status).toBe(1)
    expect(stdout).toContain('result')
  })

  test('it does not fire on safe constructs', () => {
    const { status, stdout } = run(path.join(fixtures, 'safe.js'))
    expect(status).toBe(0)
    expect(stdout).toMatch(/0 finding/)
  })

  test('the site source is clean', () => {
    const { status, stdout } = run('src')
    expect(stdout).toMatch(/0 finding/)
    expect(status).toBe(0)
  })

  test('the API routes are clean', () => {
    const { status, stdout } = run('src/app/api')
    expect(stdout).toMatch(/0 finding/)
    expect(status).toBe(0)
  })
})
