# Valoria Production Release Policy

**Status:** Mandatory for production-bound changes  
**Production runtime:** Cloudflare Workers and approved Cloudflare services  
**Companion standards:** `ENGINEERING_STANDARD.md`, `docs/engineering/COMPONENT_CHANGE_CONTROL.md`, `docs/engineering/PLATFORM_INVARIANTS.md`

## 1. Release boundary

A production release is permitted only for an explicitly approved change with a known target, risk level, baseline commit, test evidence and recovery plan.

Documentation-only and governance-only changes must remain non-runtime changes. They must not modify application bundles, route behavior, styles, assets, database state, environment variables, DNS or Cloudflare Worker configuration.

## 2. Risk classification

| Level | Change class | Minimum release evidence |
|---|---|---|
| 1 — Low | Documentation, isolated copy or isolated non-shared presentation | Scope review; relevant checks; confirm no protected runtime surface changed |
| 2 — Moderate | Page/component behavior, marketplace projection, profile display, API contract | Unit and contract tests; dependent-component regression; production build; desktop/mobile browser verification; route and interaction checks |
| 3 — High | Authentication, authorization, consent, scoring, listing, database schema/RLS, shared services or identity | Level 2 evidence plus security review, migration/compatibility analysis, failure-path tests, controlled rollout, explicit rollback/forward-recovery and post-deploy verification |

Risk is determined by the highest-impact dependency, not by the number of files changed.

## 3. Mandatory pre-deploy gates

- Change scope and protected components are recorded.
- Root cause and intended outcome are clear; no unrelated work is bundled.
- All applicable unit, contract, regression, design, security, dependency and build checks pass.
- No required check is failed, skipped or cancelled. A documented exception cannot waive a security, data-integrity or critical-journey gate.
- Database migrations are reviewed for idempotency, locking, data preservation, compatibility and recovery.
- User-visible changes have matching before/after desktop and mobile verification for affected and protected surfaces.
- Critical journeys and neighboring components have regression coverage proportionate to the blast radius.
- No unresolved Critical or High defect remains.
- Exact source commit, Worker target, deployment command/workflow and recovery version are recorded.

## 4. Deployment and verification

- Production deployment uses the approved Cloudflare workflow; do not initiate Vercel deployment operations.
- Production deploys must be serialized. Do not run overlapping production releases.
- Deploy only the reviewed commit. Do not deploy an unreviewed working tree or an unverified branch.
- After deployment, verify the exact Cloudflare Worker deployment/version and production route health.
- For user-visible changes, verify rendered output and key interactions on the live site. Route HTTP success alone is insufficient.
- For stateful changes, verify the relevant synthetic journey and authoritative server state without using real participants as test subjects.
- Record all checks as PASS, FAIL, SKIPPED or NOT VERIFIED. Never convert unavailable evidence into a pass.

## 5. Rollback and recovery

Before deployment, identify:
- the last known-good Worker version or deployment;
- whether rollback is safe for the changed database/API contract;
- whether forward recovery is safer than rollback;
- any required compatibility window for old and new clients;
- the person responsible for confirming recovery.

If production health, critical journeys, data integrity, security or display parity regresses:
1. Stop further rollout and unrelated changes.
2. Preserve logs, deployment IDs and failure evidence.
3. Roll back to the known-good Worker version when compatible, or execute the documented forward-recovery plan.
4. Verify route health and the affected critical journeys.
5. Open a defect record and add a regression guard before retrying release.

A database migration is not automatically reversed with a Worker rollback. Database recovery must follow the migration-specific plan.

## 6. Completion standard

A change is complete only when its intended outcome is verified at the appropriate layer and protected behavior remains intact. A merged PR, green build, successful deployment or HTTP 200 response alone is not proof of completion.

The release record must include PR/commit, CI run, test evidence, Cloudflare deployment/version, production verification, known limitations and rollback/recovery reference.
