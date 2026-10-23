#!/usr/bin/env node
// scripts/verify-scoring-parity.mjs
//
// Runs the SITE scoring engine and the CANONICAL platform scoring engine over
// the real 58-question bank and a set of deterministic answer/timing sets, then
// compares every returned field. This is the strongest available parity check
// for criterion 5 ("canonical 58-question scoring").
//
// It is skipped with a clear message when the platform repo is not checked out,
// so it never fails CI in a site-only environment.
//
// Usage:
//   node scripts/verify-scoring-parity.mjs [path-to-valoria-platform]
// Default path: /workspace/repos/valoria-platform

import { createRequire } from 'node:module'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const platformRoot = resolve(process.argv[2] || '/workspace/repos/valoria-platform')
const platformSrc = resolve(platformRoot, 'valoria-final/src')

const questionsPath = resolve(platformSrc, 'questions.js')
const enginePath = resolve(platformSrc, 'scoringEngine.js')

if (!existsSync(questionsPath) || !existsSync(enginePath)) {
  console.log(`SKIP: canonical platform source not found under ${platformSrc}`)
  console.log('      (pass the platform repo path as the first argument to run this check)')
  process.exit(0)
}

const { QUESTIONS } = await import(pathToFileURL(questionsPath).href)
const { computeResults: canonicalComputeResults } = await import(pathToFileURL(enginePath).href)
const siteEngine = require('../src/scoringEngine.js')

function makeAnswers(seed, questions) {
  let s = seed
  const rand = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
  const answers = {}
  questions.forEach((q, i) => {
    answers[i] = Math.min(q.options.length - 1, Math.floor(rand() * q.options.length))
  })
  return answers
}

function makeTimings(seed, questions) {
  let s = seed
  const rand = () => { s = (s * 22695477 + 1) & 0x7fffffff; return s / 0x7fffffff }
  return questions.map(() => 4000 + Math.floor(rand() * 60000))
}

const cases = []
for (const seed of [1, 7, 42, 99, 12345, 777, 2026]) {
  cases.push({ name: `seed-${seed}`, answers: makeAnswers(seed, QUESTIONS), timings: makeTimings(seed, QUESTIONS) })
}
const uniform = n => Object.fromEntries(QUESTIONS.map((q, i) => [i, Math.min(n, q.options.length - 1)]))
cases.push({ name: 'all-highest', answers: uniform(3), timings: QUESTIONS.map(() => 60000) })
cases.push({ name: 'all-lowest',  answers: uniform(0), timings: QUESTIONS.map(() => 60000) })
cases.push({ name: 'all-second',  answers: uniform(1), timings: QUESTIONS.map(() => 30000) })

let checked = 0
const mismatches = []
for (const c of cases) {
  const canonical = canonicalComputeResults(c.answers, c.timings, {}, QUESTIONS)
  const site = siteEngine.computeResults(c.answers, c.timings, {}, QUESTIONS)
  const keys = new Set([...Object.keys(canonical), ...Object.keys(site)])
  for (const key of keys) {
    checked++
    const a = JSON.stringify(canonical[key])
    const b = JSON.stringify(site[key])
    if (a !== b) mismatches.push({ case: c.name, field: key, canonical: a, site: b })
  }
}

console.log(`questions: ${QUESTIONS.length}`)
console.log(`cases: ${cases.length}  fields_checked: ${checked}`)

if (mismatches.length) {
  console.error(`\nFAIL: ${mismatches.length} field mismatch(es) between site and canonical scoring:`)
  for (const m of mismatches.slice(0, 20)) {
    console.error(`  [${m.case}] ${m.field}\n    canonical=${m.canonical}\n    site     =${m.site}`)
  }
  process.exit(1)
}

console.log('\nPASS: site scoring is field-identical to the canonical platform engine.')
