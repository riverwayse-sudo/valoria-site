# Valoria Module Register — Site Repository

**Repository:** `riverwayse-sudo/valoria-site`  
**Branch:** `chore/valoria-module-stabilisation`  
**Baseline:** `main`  
**Status:** Register established; modules are **NOT AUDITED** unless an evidence-backed note below says otherwise.

This is the site-side register of a cross-repository stabilisation programme. The platform repository carries the corresponding register. Do not treat a PR being open, a test passing, or a preview being deployed as proof that a production user journey works.

## Module index

| ID | Module | Site responsibility | Platform counterpart | Initial status |
|---|---|---|---|---|
| PUB | Public website | Homepage, navigation, institutional pages, events presentation, public forms, SEO, responsive shell | — | NOT AUDITED |
| AUTH | Authentication & accounts | Signup/sign-in UI, confirmation callback, recovery UI, session-aware routing | Auth APIs, identity linking, server-side verification | NOT AUDITED |
| TAS | Taster & onboarding | Account-first entry, nine-question taster screens, onboarding/bridge UI, resume experience | Taster state, answers, save/resume, submission | NOT AUDITED |
| ASM | Full assessment | Assessment shell, route, progress and handoff UI | 58-question assessment engine, answer persistence, completion | NOT AUDITED |
| SCO | VALU Index & certification | Results presentation; points-only display | Canonical PRIME scoring, VALU Index, merit/certification rules | NOT AUDITED |
| DASH | Dashboard & journey | Dashboard, next-step selection, journey status presentation | Canonical journey state and authenticated handoff contracts | NOT AUDITED |
| PROF | Professional profiles | Profile setup/edit/display UI and capability presentation | Profile persistence, report-derived data and identity association | NOT AUDITED |
| MKT | Talent marketplace | Marketplace discovery, cards, filters, modalities and listing UI | Eligibility, roster materialisation and listing state | NOT AUDITED |
| EVT | Events & engagement | Event pages, registration UI and homepage promotion | Registration persistence/integrations where applicable | NOT AUDITED |
| COM | Communications | Email-triggering UI, confirmation/recovery/report messaging presentation | Transactional email delivery and delivery status | NOT AUDITED |
| ADM | Administration & data operations | Admin-facing site surfaces, if present | Admin APIs, reconciliation, permissions, data integrity | NOT AUDITED |
| INF | Infrastructure, APIs & security | Next.js routes, proxy/rewrite/middleware, environment guards, deployment config | API handlers, database migrations/RLS, runtime and service config | NOT AUDITED |

## Evidence-linked open work (not a complete audit)

These are visible open PRs at the time this register was created. Their descriptions are leads for review, not verified production defects or approvals to merge.

| Module | Reference | Recorded condition |
|---|---|---|
| AUTH / TAS | [PR #164](https://github.com/riverwayse-sudo/valoria-site/pull/164) | Draft account-first signup/sign-in and pathway selection; tests/build and bridge/proxy review required |
| DASH / ASM | [PR #162](https://github.com/riverwayse-sudo/valoria-site/pull/162) | Draft bridge continuity/handoff changes; preview verification required |
| INF / ASM | [PR #161](https://github.com/riverwayse-sudo/valoria-site/pull/161) | Explicitly marked preview-blocked: nested assessment assets and proxied API routes returned 404 in its recorded preview checks |
| DASH | [PR #157](https://github.com/riverwayse-sudo/valoria-site/pull/157) | Dashboard completion language change; CI and journey-integrity checks required |
| TAS / AUTH | [PR #142](https://github.com/riverwayse-sudo/valoria-site/pull/142) | Preserve taster identity through signed-out continuation and sign-in; acceptance test required |
| MKT | [PR #140](https://github.com/riverwayse-sudo/valoria-site/pull/140) | Basic listing eligibility change; review against current product rules and platform source of truth required |
| INF / ADM | [PR #138](https://github.com/riverwayse-sudo/valoria-site/pull/138) | Draft environment write-guard reconciliation; remote CI and isolation verification were not complete in its description |
| INF | [PR #139](https://github.com/riverwayse-sudo/valoria-site/pull/139) | Draft write-guard coverage for journey GET handlers; explicitly says deployed preview isolation is not proven |

## Issue register format

Create one issue record per independently diagnosable defect. Use IDs such as `AUTH-001`, `TAS-001`, `ASM-001`, `MKT-001`.

Required fields:
- **ID / module**
- **Observed behaviour** (exact route, action, expected vs actual result)
- **Environment** (local, preview, staging, production; include deployment/commit)
- **Severity** (S0 data/security; S1 critical journey blocked; S2 major function impaired; S3 cosmetic/minor)
- **Evidence** (reproduction steps, request/response, logs, test, PR/commit)
- **Root cause** (leave UNKNOWN until demonstrated)
- **Affected files/API/database objects**
- **Dependencies / contract owner**
- **Fix scope**
- **Regression test** (must fail before the fix and pass after)
- **Verification evidence**
- **Status** (NOT AUDITED, OPEN, INVESTIGATING, FIXED—UNVERIFIED, VERIFIED IN PREVIEW, RELEASED, MONITORING)

Never label an issue FIXED based only on a code change. Never label it RELEASED without deployment evidence and production smoke tests.

## Change isolation rules

1. A module owns its business rules and persistence contract. The site may present canonical state; it must not reimplement eligibility, scoring, assessment completion, or identity ownership.
2. Every cross-module dependency must name the provider, consumer, contract, and failure behaviour.
3. A fix should be narrow, reviewed against the current base branch, and accompanied by a regression test that detects the original failure.
4. Do not merge stacked or divergent PRs until their ancestry and combined diff have been reconciled.
5. Do not deploy while the relevant preview/build/acceptance gate is failing or unknown.
6. Do not run test writes against production or mutate genuine participant records for verification.
7. Keep site and platform PRs separate, but link them by the same module/issue ID when one defect crosses the boundary.

## Initial audit order

1. INF — proxy/API routing, environment isolation, security boundaries
2. AUTH — account creation, confirmation, session and recovery
3. TAS — nine-question taster, persistence, resume and handoff
4. ASM — 58-question assessment, progress and submission
5. SCO — canonical PRIME points and VALU Index
6. DASH — journey state, bridge and next-step consistency
7. PROF → MKT — profile persistence, capability and eligibility/listing
8. COM, EVT, ADM, PUB — supporting and public-facing modules

**Product invariants to preserve:** taster has 9 questions; full assessment has 58 questions; display VALU Index/PRIME scores as points, not percentages. Verify exact assessment accounting and eligibility rules against the canonical implementation before changing them.
