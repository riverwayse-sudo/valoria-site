// src/__tests__/migration-language-contract.test.js
//
// A migration can pass every static assertion in this repository and still be
// impossible to apply. The platform repository shipped exactly that:
// `20260827_marketplace_governance_v4.sql` declared `language plpgsql` on a
// wrapper whose body is a bare `select ...`. PostgreSQL rejects it with
// `syntax error at or near "select"`. It had been applied to the live database
// by some other path, so the failure only appeared when the migration sequence
// was replayed on a clean server.
//
// This suite checks the same mechanical property here, so the class cannot
// recur silently in this repository. It cannot prove a migration executes —
// only that it is not provably invalid in this specific way.

'use strict'

const fs = require('fs')
const path = require('path')

const MIGRATIONS_DIR = path.join(__dirname, '..', '..', 'supabase', 'migrations')

function migrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) return []
  return fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort()
}

function read(file) {
  return fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
}

// Strips comments and string literals so prose and data are not read as DDL.
function clean(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--[^\n]*/g, ' ')
    .replace(/'(?:[^']|'')*'/g, "''")
}

function functionDefinitions(sql) {
  const out = []
  const re = /create\s+(?:or\s+replace\s+)?function\s+([a-z0-9_.]+)\s*\(([^)]*)\)\s*([\s\S]*?)\$\$([\s\S]*?)\$\$/gi
  for (const m of sql.matchAll(re)) {
    out.push({ name: m[1], signature: m[2], header: m[3], body: m[4] })
  }
  return out
}

describe('site migration language contract', () => {
  const files = migrationFiles()

  test('the migrations directory exists and is non-empty', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  test('no function declares plpgsql with a single-statement SQL body', () => {
    const offenders = []
    for (const file of files) {
      for (const fn of functionDefinitions(clean(read(file)))) {
        if (!/\blanguage\s+plpgsql\b/i.test(fn.header)) continue
        const body = fn.body.trim().replace(/;+\s*$/, '').trim()
        if (!body) continue
        const hasPlpgsqlStructure = /\bbegin\b/i.test(body) || /\bdeclare\b/i.test(body)
        const isBareSelect = /^\(*\s*select\b[\s\S]*\)*$/i.test(body) && !body.includes(';')
        if (!hasPlpgsqlStructure && isBareSelect) {
          offenders.push(`${file}: ${fn.name}(${fn.signature.slice(0, 60)})`)
        }
      }
    }
    expect(offenders).toEqual([])
  })
})

describe('site auth redirect contract', () => {
  const siteUrl = require('../lib/site-url.js')

  // The confirmation redirect must be built from the configured origin, never
  // from a hardcoded production domain or a raw window.location value. A
  // staging signup that mails a production callback strands the participant:
  // the account exists in one database and the link confirms against another.
  test('authCallbackUrl uses NEXT_PUBLIC_SITE_URL when set', () => {
    const previous = process.env.NEXT_PUBLIC_SITE_URL
    process.env.NEXT_PUBLIC_SITE_URL = 'https://staging.valoriainstitute.example'
    try {
      const url = siteUrl.authCallbackUrl()
      expect(url.startsWith('https://staging.valoriainstitute.example/auth/callback')).toBe(true)
    } finally {
      if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
      else process.env.NEXT_PUBLIC_SITE_URL = previous
    }
  })

  test('authCallbackUrl carries only non-empty query values', () => {
    const url = new URL(siteUrl.authCallbackUrl({ pending_taster_id: 'abc', empty: '', nil: null }))
    expect(url.searchParams.get('pending_taster_id')).toBe('abc')
    expect(url.searchParams.has('empty')).toBe(false)
    expect(url.searchParams.has('nil')).toBe(false)
  })

  test('an unset configuration falls back to the production origin, not a preview host', () => {
    const previous = process.env.NEXT_PUBLIC_SITE_URL
    delete process.env.NEXT_PUBLIC_SITE_URL
    try {
      expect(siteUrl.getSiteOrigin()).toBe(siteUrl.PRODUCTION_SITE_URL)
    } finally {
      if (previous !== undefined) process.env.NEXT_PUBLIC_SITE_URL = previous
    }
  })

  test('a malformed configuration value is ignored rather than emitted', () => {
    const previous = process.env.NEXT_PUBLIC_SITE_URL
    process.env.NEXT_PUBLIC_SITE_URL = 'not a url'
    try {
      expect(siteUrl.getSiteOrigin()).toBe(siteUrl.PRODUCTION_SITE_URL)
    } finally {
      if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
      else process.env.NEXT_PUBLIC_SITE_URL = previous
    }
  })

  // The signup path must route through the shared helper. A direct string
  // literal would reintroduce the hardcoded-domain defect.
  test('signup constructs its redirect through the shared helper', () => {
    const signup = fs.readFileSync(path.join(__dirname, '..', 'app', 'signup', 'page.jsx'), 'utf8')
    expect(signup).toMatch(/authCallbackUrl/)
    expect(signup).not.toMatch(/emailRedirectTo:\s*['"`]https?:\/\//)
  })

  test('professional signup constructs its redirect through the shared helper', () => {
    const signup = fs.readFileSync(path.join(__dirname, '..', 'app', 'professional-signup', 'page.jsx'), 'utf8')
    expect(signup).toMatch(/authCallbackUrl/)
    expect(signup).not.toMatch(/emailRedirectTo:\s*['"`]https?:\/\//)
  })
})
