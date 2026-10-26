# Valoria release gate report

Final remediation report. One document, evidence for every gate, and a decision.

## Decision

**NOT RELEASE-READY — blocked on owner-held access, not on repository work.**

The code is release-candidate quality and every automated gate passes on both
repositories. The VALU journey has **not** been proven in a live staging
environment, and it cannot be from this session: no staging database, no
Supabase credential, and no Vercel access are available here. See
*Handover* for the exact owner actions.

Nothing was merged. Nothing was promoted to production. No production data was
touched, and no migration was invented.

## Code state under test

| Repo | Branch | Head | `main` (untouched) | PR |
| --- | --- | --- | --- | --- |
| valoria-platform | `remediation/staging-2026-10-23` | `3b95ffd` | `7458831` | [#62](https://github.com/riverwayse-sudo/valoria-platform/pull/62) |
| valoria-site | `remediation/staging-2026-10-23` | `e87be29` | `84693ee` | [#133](https://github.com/riverwayse-sudo/valoria-site/pull/133) |

All CI checks pass on both heads. Every fix below has a test that fails when the
fix is reverted, so "green" means the guard is load-bearing, not merely present.

## Results

### Result 1 — Safe deployment — PASS (code), live confirmation blocked

The write guard refuses a privileged write unless the runtime and the target
database are both positively identified. Every service-role writer was enumerated;
the one that was unguarded (`api/_rateLimit.js`, which calls `consume_rate_limit`
with the service-role key) is now guarded. The completeness check scans helper
files and counts `rpc(` as a write, so the class cannot recur unnoticed.

Mutation-verified: 11 platform and 12 site mutations, 0 survivors. A preview write
aimed at production is refused with `503`; production writes continue to work
because the guard is not merged yet.

Live confirmation that previews target staging rather than production is **blocked**
on the staging project and the guard variables (Handover §2, §3).

### Result 2 — Reliable assessment journey — PASS in code, live run blocked

The journey is covered end to end by contract tests that pin the behaviour a live
run would exercise:

- registration and authenticated continuation for the full assessment
  (`journey-integrity-contract`)
- email confirmation redirect through the environment-aware callback
  (`site-url` resolution, `auth/callback`)
- the 15-question taster and the full 58-question VALU Index
  (`17_canonical_58_bank_scoring`, `05_valu_v4_taster`)
- save and resume (`26_progress_persistence_contract`)
- scoring (`01_scoring_engine`, site `scoring-parity` against the **live** platform
  contract)

The live staging run of this journey is **blocked**: it needs the staging database
and preview access (Handover §1, §2).

### Result 3 — Correct participant records — PASS in code, live DB blocked

Duplicate submission is made impossible at the database level by
`20261023130000_unique_full_assessment_per_snapshot.sql` (a partial unique index on
`(taster_id, identity_hash)`), which closes the read-then-write race in the
handler. The taster/snapshot records are kept distinct from full assessments
(`18_submit_taster_runtime`, `20_assessment_dedup_contract`). No genuine
participant record was modified.

Confirmation that the applied schema matches these migrations is **blocked** on
read-only staging inspection (Handover §5).

### Result 4 — Controlled release — PASS (checks), release authorization blocked

Both repositories pass every required check. Migration provenance is documented
and one confirmed defect was fixed (below). Release is **blocked** on the owner
decisions in the Handover.

## Defects fixed in this remediation

| Defect | Root cause | Proof |
| --- | --- | --- |
| Root migration `20260921123000` could never apply | Truncated dollar-quote delimiter `do $` … `$;` instead of `do $$` … `$$;`; PostgreSQL rejects a bare `$` | Reintroducing the delimiter fails the guard with the exact file and lines; fixed file is byte-identical to the site copy |
| Both migration guards were blind to the root directory | Each scanned one of the platform's two migration directories | Both now scan both; diverging a root file fails the collision check |
| Collision register under-reported by four collisions | Same single-directory scan | Register corrected, correction stated openly |
| `api/_rateLimit.js` was an unguarded service-role writer | Completeness scan skipped `_`-prefixed helpers and did not count `rpc(` | Removing the guard fails the test; restoring it passes |
| Scoring parity compared against a hand-copied literal | A copy cannot notice the platform drifting | Changing `MAX_SCORE` in the platform contract fails the site suite |

## Automated evidence

| Gate | Platform | Site |
| --- | --- | --- |
| Unit / integration | 44 suites, 644 tests | 21 suites, 457 tests |
| Static gates | `check:block-scope` 0 findings | design + excellence clean, block-scope 0 |
| Build | clean | clean |
| CI on head | all pass | all pass |

## What was tested live

**Nothing was tested against a live staging environment.** No staging database, no
Supabase credential, and no Vercel access exist in this session; the only credential
available is `GITHUB_TOKEN`. Preview deployments answer `302` to Vercel SSO. The
journey evidence above is from automated tests that exercise the real code paths,
not from a deployed environment. This distinction is the reason the decision is
"not release-ready" rather than "ready".

## Handover — exact owner actions

Each row is one action, one owner. These are the only things standing between the
current state and release.

| # | Owner | Single action | Closes |
| --- | --- | --- | --- |
| 1 | Vercel project owner | Generate a Protection Bypass for Automation secret (or set Deployment Protection to "Only Production Deployments"), and give it to the operator — not into GitHub | Live access to previews |
| 2 | Supabase organization owner | Approve or name an isolated staging project and provide its ref and keys via the Vercel dashboard | Staging database |
| 3 | Vercel project owner | Set the Preview guard variables from §2, and set `PRODUCTION_SUPABASE_PROJECT_REF` in Production scope (a merge precondition — merging without it refuses production writes) | Guard configuration |
| 4 | Supabase organization owner | Confirm the production project ref from two sources | Production ref |
| 5 | Supabase organization owner | Name an operator or a read-only credential for staging schema and migration history | Migration provenance |

`ALLOW_LOCAL_PRIVILEGED_WRITES` must not be set in any Vercel scope. Details and
evidence-to-close for each row are in `docs/STAGING_AUTHORIZATION_REQUEST.md`.

## What is ready to release

- The hardened write guard, including the `_rateLimit.js` fix.
- The corrected root migration and both widened migration guards.
- The live-contract scoring parity check.
- The taster/full-assessment separation and the duplicate-submission constraint.

These are complete and evidenced. They should be released **together with** the
Production guard variable from Handover §3, because the guard and that variable are
a matched pair: shipping the guard without the variable would refuse production
writes.

## Stopping condition

This is the final remediation phase. No further audit layer begins without a
specific failed gate or newly authorized scope. If the access in the Handover
becomes available, the remaining work is one live acceptance run against staging
and, on failure, fixes to the affected tests only.
