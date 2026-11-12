# Valoria Engineering Quality Register — Site

**Audit status:** CURRENT-SITE STAGING ACCEPTANCE PASSED; production promotion and broader assurance remain in progress. Evidence updated 12 November 2026. This is not a full ASVS, WCAG or end-to-end journey certification.

| Gate | Status | Evidence / finding | Owner | Remediation |
|---|---|---|---|---|
| Architecture and maintainability | NOT VERIFIED | No complete dependency/coupling or duplication audit performed | Engineering | Map route, data and service boundaries; identify duplicate business rules |
| Static quality | NOT VERIFIED | PR #339 adds pinned ESLint no-undef checks to login, signup, professional signup, dashboard, report, profile onboarding and public-profile routes. The new lint step passed. No repository-wide lint/typecheck is claimed. | Engineering | Expand lint coverage by bounded modules; assess TypeScript migration/value without masking legacy debt |
| Data integrity | PARTIAL | Targeted production database review completed with the platform team: score integrity CHECK is active, three taster lead-capture foreign keys are validated, 18 completed assessments remain valid and no orphan references were found. This is not a complete schema/RLS/recovery audit. | Engineering | Complete broader schema, RLS, idempotency, backup and recovery audit |
| API and integrations | NOT VERIFIED | No complete API contract/failure-mode audit performed | Engineering | Inventory API contracts, authz, timeouts, retries and external dependencies |
| Business-rule correctness | PARTIAL | PR #340 derives the admin roster merit label from canonical VALU points; platform PR #210 also corrected the production public roster writer and refreshed 13 projections with 0 designation mismatches. Historical source labels remain unchanged. Platform PR #211 aligns rapid-service source with the shared contract, but production v10 remains unchanged pending external caller identification. | Product/Engineering | Complete runtime promotion for reviewed site/app code; identify any external rapid-service caller before deploying the Edge Function |
| Security | PARTIAL | Platform PR #206 security fix is live: anonymous roster RPC returns 13 eligible rows with 0 names/initials, and the private helper is denied to client roles. Site PR #358 includes consent-gated public profile output, ATB ID-only public identity and removal of internal buyer/sourcing language. PostgREST private-schema exposure and full ASVS review remain unverified. Leaked-password protection is disabled; the connected Supabase organization is Free and the control is Pro+ only. | Engineering | Complete PostgREST exposed-schema and ASVS review; revisit leaked-password protection only if plan capability changes |
| Accessibility and UX | NOT VERIFIED | Design checks exist; no WCAG 2.2 AA automated/manual audit evidence reviewed | Design/Engineering | Run axe/accessibility scan and keyboard/screen-reader review on critical routes |
| Automated regression | PARTIAL | PR #358 staging deployment passed CI, OpenNext build, route/privacy smoke checks and Playwright audit across 21 desktop/mobile page-viewport cases with zero failures. It verifies fresh-session registration, required Privacy Notice acknowledgement, optional marketing unchecked, mobile navigation and staging isolation. It does not complete the full taster → signup → email confirmation → dashboard → full assessment journey. | Engineering | Add isolated interactive end-to-end tests with synthetic accounts; do not use a real participant account or require the owner to retake an assessment |
| Release readiness | PARTIAL | PR #358 is deployed to isolated Cloudflare staging and passed all current-site acceptance checks. It remains an unmerged staging candidate; no production site or assessment Worker promotion has been performed. No Vercel operations or new dependencies. | Engineering | Complete synthetic-account end-to-end journey verification and obtain explicit production-promotion approval; verify deployed Cloudflare Worker versions |
| Observability and recovery | NOT VERIFIED | No complete logs/alerts/recovery runbook audit performed | Engineering | Define critical journey signals, alert thresholds and recovery procedures |

## Verified CI and staging evidence
- Site PR #358 commit `4acb0f062a0fbb9d30b80de60c91316dca2fb2d2`: repository checks, OpenNext production build, isolated Cloudflare staging deployment, route/privacy smoke checks and 21 desktop/mobile browser cases passed with zero failures.
- The assessment API proxy now uses the existing Cloudflare `VALU_ASSESSMENT` service binding; the nested taster-progress endpoint returns the expected unauthenticated response rather than 404.
- Production database public-roster privacy and canonical designation checks were verified separately; this PR itself does not promote site code to production.
- Standards PR #328 merged at 3ab31cf27fd7c6c14dd5918f493ce3274f6e432f.
- Dependency-audit PR #329 merged at 35f319b3fa5a32dd07c48fb25f42c027c2761fb4; npm ci, production dependency audit, tests, excellence checks and production build passed.
- Internal capability permission PR #330 merged at 162125e96265a2821eb022b1ba1e7d7f6b53992b; unit tests, quality gate, security validation, production build and Cloudflare Worker bundle validation passed.
- PR #339 head cfa99c1c4eb1d47efe85ebd949a22e6d8f2f8ec8: critical journey lint, unit tests, secret scan, environment parity, production build, site quality gates, security hardening validation and Cloudflare Worker bundle validation passed. No deployment was performed.
- PR #340 head 6a03c08ecaede8f8d84961fd1f8fe4b428b444f7: admin-roster canonical designation regression test, unit tests, excellence checks, production build, security validation and Cloudflare Worker bundle validation passed. Production smoke was skipped; no deployment was performed.
- The external Vercel status reported failure with build-rate-limit; no Vercel operation was performed.
- The staging browser audit workflow is separate and only runs when its script/workflow changes or is manually dispatched; its presence does not prove a fresh staging audit ran for PR #339.
- No full repository-wide lint/typecheck or full ASVS assessment is claimed.

## Critical journey acceptance
| Journey | Status | Evidence |
|---|---|---|
| Taster save, resume and server-confirmed completion | NOT VERIFIED | Staging audit confirms fresh-session routing and no premature progress API calls; it does not complete a taster, persist answers or resume a synthetic session |
| Registration, privacy, optional consent and dashboard handoff | PARTIAL | Fresh-session browser test confirms registration is visible, Privacy Notice acknowledgement is required, optional marketing consent is unchecked and staging makes no production API calls. Email confirmation and dashboard handoff are not yet exercised end-to-end |
| Independent full assessment, checkpoint and resume | NOT VERIFIED | No synthetic-account browser journey has completed the separate full assessment and verified checkpoint recovery |
| VALU points, PRIME dimensions and merit boundaries | PARTIAL | Canonical 90/75/55/35 boundary tests pass and public/admin roster source now derives labels from points. The active production rapid-service v10 remains unchanged pending caller identification; historical source labels are intentionally not backfilled |
| Marketplace eligibility, capability and privacy rules | PARTIAL | Production roster verification: 10 Full and 3 Basic, 0 names/initials exposed, 0 designation mismatches. Staging contract fixtures cover visibility, consent, revocation, test/unlisted and expiry boundaries. Authenticated marketplace UI acceptance remains pending |
| Lead capture, consent-preserving sync and email failure recovery | NOT VERIFIED | End-to-end integration audit pending |

Update status only with traceable evidence. Known Critical or High defects block production release.
