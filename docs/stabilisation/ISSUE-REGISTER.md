# Valoria Issue Register — Site

This register is evidence-led. An issue remains OPEN/INVESTIGATING until its root cause is demonstrated and its regression test passes.

| ID | Module | Severity | Status | Evidence / observed behaviour | Root cause | Next action |
|---|---|---:|---|---|---|---|
| INF-001 | INF / ASM | S1 | INVESTIGATING | Site PR [#161](https://github.com/riverwayse-sudo/valoria-site/pull/161) records assessment HTML 200 but nested JS/CSS and proxied assessment API routes 404. Independent live preview inspection on 2026-11-01: the site PR preview returned HTML referencing the Vite development entry `/src/main.jsx` and included Cloudflare cache headers; the directly inspected Vercel platform preview returned built HTML referencing hashed `/valu/assessment/assets/index-*.js` and CSS. The site PR preview still returned 404 for tested nested asset and `/api/taster-progress` paths. Platform `GET /api/taster-progress` returned 405, expected for this POST-only handler; POST has not yet been exercised. CI was green, but browser-level routing is not. | Partially isolated: site `main` currently rewrites `/valu/assessment/:path*` to upstream `/:path*`, stripping the Vite base prefix. PR #161 changes this to preserve `/valu/assessment/`. Remaining preview mismatch (stale/dev HTML and 404s) is UNKNOWN; likely involves upstream selection/alias, Cloudflare path handling or stale cache and needs paired deployment verification. | Keep PR #161 unmerged. Pair the exact site preview commit with the exact platform deployment, verify the configured upstream alias, then test matching HTML, hashed JS/CSS and POST APIs through both direct and proxied origins. Do not change production routing until all pass. |

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
