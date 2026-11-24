# Valoria Platform Invariants

**Status:** Mandatory product and engineering constraints  
**Scope:** valoria-site, valoria-platform, Supabase and Cloudflare production services

These invariants protect established behavior. They are not permission to redesign, reinterpret or silently change product policy.

## 1. Change isolation

- A governance, documentation or CI-only change must not modify runtime application code, stylesheets, assets, route handlers, database migrations, Worker configuration or production data.
- A change must identify its exact target component, affected files, direct dependencies and explicit exclusions before implementation.
- If implementation requires crossing the declared boundary, stop and record a revised impact assessment before proceeding.
- No unrelated cleanup, formatting, dependency upgrade or redesign may be bundled with a defect fix.
- Existing behavior is the baseline. A change must prove the requested behavior changed and protected neighboring behavior did not.

## 2. Public website and display invariants

For any change that can affect a rendered page, route, component, style, asset, data projection or server response:

- Preserve all unrelated page layouts, section order, typography, color tokens, spacing, navigation, links, responsive behavior and interaction states.
- Preserve public route availability, canonical URLs, metadata, structured data and page loading/error behavior unless explicitly in scope.
- Preserve homepage profile rails, profile cards, marketplace cards, category listings, search/filter behavior and public profile rendering unless explicitly in scope.
- Do not change shared CSS, global tokens, root layouts, shared navigation, shared cards or common data projections to solve a local issue without mapping every consumer.
- A source-level assertion or HTTP 200 is not proof of visual or interaction parity.
- Capture or inspect a before-state baseline for affected and protected surfaces at desktop and mobile breakpoints. Compare after-state against the same viewport, data fixture and state.
- For data-backed display changes, verify both the data contract and rendered output using synthetic or otherwise authorized test data.
- Any unexplained visual regression, missing content, route failure, console error, overflow or interaction regression blocks release.

## 3. Product and data invariants

- The 9-question VALU taster and 58-question full assessment are separate journeys and records. Neither journey may be merged into, counted as part of, or silently substituted for the other.
- Persisted answers, checkpoints and completion snapshots must remain attributable to the correct assessment and identity. Save/resume must not lose or cross-contaminate answers.
- VALU Index uses authoritative PRIME points and the canonical merit mapping; never represent it as a percentage or a /100 score.
- Listing, public visibility, consent, capability eligibility, suspension and revocation are distinct concepts. Do not collapse their states or bypass authoritative server-side checks.
- Taster completion listing policy must follow the currently approved product rule and canonical lifecycle implementation; do not reintroduce an administrator approval gate or a profile-settings visibility toggle contrary to that policy.
- Never fabricate, overwrite, bulk-attest or infer participant consent, profile data, assessment answers, scores, identity links or activity.
- Never use client-editable metadata as an authorization source. RLS and server-side authorization remain authoritative.
- Email states and retries must remain idempotent and distinguish queued, attempted, accepted, delivered and failed.

## 4. Security and availability invariants

- No secret, service-role credential or privileged token may enter browser code, committed files or logs.
- Authentication, authorization, session, identity-linking and consent changes require explicit security and regression coverage.
- Database changes must be migration-backed, reviewed for locks/data loss/partial failure, and include verification plus rollback or forward-recovery.
- Destructive data operations require specific authorization; tests must not delete or mutate production participant data.
- Existing production routes and Cloudflare bindings must remain compatible unless the change explicitly targets them.
- A failed or unverified critical check is not a pass. Do not bypass checks to force deployment.

## 5. Required evidence

The change record must identify:
1. Baseline commit and component status.
2. Exact in-scope and out-of-scope behavior.
3. Files, routes, shared dependencies and data contracts affected.
4. Tests run and exact results, including failed, skipped and unverified checks.
5. Before/after visual evidence for user-visible changes, at matching desktop and mobile viewports.
6. Data, consent, security and email side effects.
7. Exact deployment version and recovery plan when a production release is authorized.

If the evidence cannot be produced, record **NOT VERIFIED** and do not claim the component is protected or the release is complete.
