# Valoria Engineering Quality Register — Site

**Audit status:** TARGETED SECURITY AND CI REMEDIATION VERIFIED; broader audit remains in progress. Findings below are limited to files, CI and database evidence inspected on 10 November 2026. This is not a full security, accessibility, runtime or production audit.

| Gate | Status | Evidence / finding | Owner | Remediation |
|---|---|---|---|---|
| Architecture and maintainability | NOT VERIFIED | No complete dependency/coupling or duplication audit performed | Engineering | Map route, data and service boundaries; identify duplicate business rules |
| Static quality | PASS | PR #329 replaced `npm install` with lockfile-enforced `npm ci`; site unit tests, excellence checks, targeted ESLint `no-undef`, and production build passed on the merged commit. No repository-wide lint/typecheck observed. | Engineering | Assess broader lint coverage and TypeScript migration/value; avoid blanket rules that mask legacy debt |
| Data integrity | NOT VERIFIED | No complete Supabase schema, constraints, RLS, migration or recovery audit performed | Engineering | Audit policies, constraints, migrations, idempotency and backups |
| API and integrations | NOT VERIFIED | No complete API contract/failure-mode audit performed | Engineering | Inventory API contracts, authz, timeouts, retries and external dependencies |
| Business-rule correctness | NOT VERIFIED | Existing excellence check enforces several public-profile consent/visibility invariants; complete rule parity audit not performed | Product/Engineering | Verify marketplace, eligibility, merit, consent and points rules across client/server |
| Security | FAIL | PR #329 added `npm audit --omit=dev --audit-level=high`; audit passed. Gitleaks and environment parity passed. PR #330 revoked PUBLIC/anon/authenticated EXECUTE on three internal SECURITY DEFINER helpers; migration applied and verified: anon/authenticated execute=false for all three, trigger remains attached to `public.professional_documents`. Remaining gaps: private schema USAGE remains granted to anon/authenticated. At least `public.get_marketplace_public_roster_v1` is SECURITY INVOKER and references private helpers, so revoking schema USAGE indiscriminately could break this public API. PostgREST exposed-schema configuration has not been verified; leaked-password protection remains disabled; full ASVS review is incomplete. | Engineering | Verify PostgREST exposed schemas; review and harden invoker functions that depend on private helpers before changing schema USAGE; enable leaked-password protection in Supabase Auth dashboard; complete ASVS-oriented authz/RLS/session review |
| Accessibility and UX | NOT VERIFIED | Design checks exist; no WCAG 2.2 AA automated/manual audit evidence reviewed | Design/Engineering | Run axe/accessibility scan and keyboard/screen-reader review on critical routes |
| Automated regression | FAIL | Unit/regression tests and excellence/design guards exist. No complete browser journey suite evidenced in inspected package/workflows. | Engineering | Add browser automation for registration, taster, dashboard, full assessment, resume and marketplace |
| Release readiness | PASS | PR #329 merged after `npm ci`, production dependency audit, tests, excellence checks and production build passed. PR #330 merged after tests, security validation, production build and Cloudflare Worker bundle validation passed. The database privilege migration was applied and read-only privilege/trigger verification passed. No application deployment was required for these changes. | Engineering | Continue verifying exact deployed commit/version for runtime changes |
| Observability and recovery | NOT VERIFIED | No complete logs/alerts/recovery runbook audit performed | Engineering | Define critical journey signals, alert thresholds and recovery procedures |

## Verified CI evidence
- Standards PR #328 merged at `3ab31cf27fd7c6c14dd5918f493ce3274f6e432f`.
- Dependency-audit PR #329 merged at `35f319b3fa5a32dd07c48fb25f42c027c2761fb4`; `npm ci`, `npm audit --omit=dev --audit-level=high`, tests, excellence checks and production build passed. The production-smoke job was skipped; no smoke result is claimed.
- Internal capability permission PR #330 merged at `162125e96265a2821eb022b1ba1e7d7f6b53992b`; unit tests, quality gate, security validation, production build and Cloudflare Worker bundle validation passed.
- Supabase migration `restrict_internal_capability_function_execution` applied successfully. Post-migration SQL verified anon/authenticated EXECUTE=false for the three restricted helpers and confirmed the document trigger remains attached. `private` schema USAGE remains granted to anon/authenticated. Do not revoke it indiscriminately: `public.get_marketplace_public_roster_v1` is SECURITY INVOKER and references private helpers. PostgREST exposed-schema configuration is not yet verified.
- `package.json` defines `test`, `design:check`, `excellence:check`; `prebuild` runs tests and both design/excellence checks.
- No full repository-wide lint/typecheck or full ASVS assessment is claimed.

## Critical journey acceptance
| Journey | Status | Evidence |
|---|---|---|
| Taster save, resume and server-confirmed completion | NOT VERIFIED | Static checks do not establish a real browser journey |
| Registration, privacy, optional consent and dashboard handoff | NOT VERIFIED | Static checks do not establish a real browser journey |
| Independent full assessment, checkpoint and resume | NOT VERIFIED | Static checks do not establish a real browser journey |
| VALU points, PRIME dimensions and merit boundaries | NOT VERIFIED | Full source-of-truth parity audit pending |
| Marketplace eligibility, capability and privacy rules | NOT VERIFIED | Some consent/visibility guards exist; full runtime acceptance pending |
| Lead capture, consent-preserving sync and email failure recovery | NOT VERIFIED | End-to-end integration audit pending |

Update status only with traceable evidence. Known Critical or High defects block production release.
