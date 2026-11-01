# Valoria Issue Register — Site

This register is evidence-led. An issue remains OPEN/INVESTIGATING until its root cause is demonstrated and its regression test passes.

| ID | Module | Severity | Status | Evidence / observed behaviour | Root cause | Next action |
|---|---|---:|---|---|---|---|
| INF-001 | INF / ASM | S1 | INVESTIGATING | Site PR [#161](https://github.com/riverwayse-sudo/valoria-site/pull/161) records assessment HTML 200 but nested JS/CSS 404 and proxied taster/assessment API routes 404 in the tested Vercel preview. The PR explicitly says the upstream worker was not serving the expected asset/API paths. CI workflows and Vercel status were green; they do not contradict the browser-level failures. | UNKNOWN — routing/path contract or upstream runtime/asset serving must be isolated. | Verify platform deployment root and direct asset/API responses, then test the exact same paths through the site preview. Do not merge PR #161 or change production routing until this passes. |

## Severity
- S0: security exposure, data loss/corruption or cross-user data access.
- S1: critical user journey blocked.
- S2: major feature impaired with a viable workaround.
- S3: cosmetic/minor issue.

## Required fields for new issues
ID, module, expected/actual behaviour, exact route/action, environment and commit, severity, reproducible evidence, root cause (UNKNOWN until proven), affected files/API/schema, dependencies, fix scope, regression test, verification evidence and status.

## Status definitions
NOT AUDITED; OPEN; INVESTIGATING; FIXED—UNVERIFIED; VERIFIED IN PREVIEW; RELEASED; MONITORING.

Do not infer root cause from symptoms. Do not mark RELEASED without production smoke evidence.
