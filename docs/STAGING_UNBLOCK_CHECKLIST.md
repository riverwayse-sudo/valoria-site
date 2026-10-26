# Staging unblock checklist (operator)

Everything the developer needs to move from code-level confidence to live
acceptance evidence on staging. Prepared by the developer; **all of it must be
applied by an authorised operator**. Nothing in this list has been applied.

Rules this checklist follows:

* No secret value appears in this document, in code, in commits, or in logs.
  Where a secret is required, the entry names the variable and where it is set.
* Staging hostnames are never placed in a Production environment-variable scope.
* Production Deployment Protection is never disabled.
* Staging origins are **not** guessed. Every `<PLACEHOLDER>` must be replaced
  with an origin the operator approves.

Two Vercel projects are involved. Throughout, "site project" is the
`valoria-site` deployment and "platform project" is the `valoria-final`
deployment.

---

## 1. Deployment Protection bypass for automation

**Problem.** Both preview deployments currently answer `302` to
`https://vercel.com/sso-api?url=…` and then `https://vercel.com/login`.
Verified on the platform preview for
`7e4e810ab83590596a072e584557216f942c83a8`:

```
POST /api/get-assessment-data        -> 401  {"error":{"code":"401","message":"Protected deployment"}}
GET  /api/sweep-unsent-reports       -> 302  Protected by Vercel Authentication
GET  /                              -> 302
```

An unauthenticated client cannot reach a preview, so no automated or manual
staging acceptance run is possible until this is resolved.

**Action (choose one, per project).**

*Option A — Protection Bypass for Automation (preferred; keeps protection on).*

1. Vercel Dashboard → the project → **Settings → Deployment Protection**.
2. Under **Protection Bypass for Automation**, click **Generate Secret**.
3. Store the secret in the password manager / CI secret store. Do **not** paste
   it into a PR, an issue, a chat, or this repository.
4. Deliver it to the developer out-of-band.

*Option B — scope protection away from previews (broader; production stays
protected).*

Set **Vercel Authentication** to **Only Production Deployments**. This leaves
production protected while previews become reachable.

**Do not** set Vercel Authentication to **Disabled** on the production project,
and do not disable protection on the production domain.

**Verification.** With a bypass secret, this must return the application
response rather than a redirect to Vercel:

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  -H "x-vercel-protection-bypass: <SECRET>" \
  "https://<PLATFORM_PREVIEW_ORIGIN>/api/health"
```

Expect `200` (or an application error), **not** `302` to `vercel.com`.
Note: do not put the bypass secret in a URL you share; the query-parameter form
leaks through `Referer` and logs.

---

## 2. Preview-scoped environment variables

Each variable below is set on the **Preview** scope of the named project. None
of them should be given a Preview value in the Production scope.

`<STAGING_SITE_ORIGIN>` and `<STAGING_ASSESSMENT_ORIGIN>` must be supplied by the
operator. A stable branch alias is preferable to a per-commit URL, because a
per-commit preview host changes every deploy and cannot be allowlisted in
Supabase Auth. If only per-commit previews are available, note that the Supabase
Auth allowlist entry will need updating per deploy.

### 2.1 Site project (`valoria-site`)

| Variable | Scope | Preview value | Production value | Why |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Preview | `<STAGING_SITE_ORIGIN>` | `https://valoriainstitute.com` | Builds every auth redirect (`authCallbackUrl()`). Must also be in the Supabase Auth allowlist. |
| `VALU_UPSTREAM_ORIGIN` | Preview | `<STAGING_ASSESSMENT_ORIGIN>` | `https://assessment.valoriainstitute.com` | Target of the `/valu/assessment/*` rewrite and of `/api/trigger-report`. Origin only, no path. |
| `VALU_ASSESSMENT_URL` | Preview | `<STAGING_ASSESSMENT_ORIGIN>/valu/assessment/` | `https://valoriainstitute.com/valu/assessment/` | Destination returned by `/api/valu-handoff`. |
| `NEXT_PUBLIC_SUPABASE_URL` | Preview | staging Supabase project URL | production URL | Staging data must not touch production. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Preview | staging anon key | production anon key | Browser auth. |
| `SUPABASE_SERVICE_ROLE_KEY` | Preview | staging service-role key | production key | Server-only. Never `NEXT_PUBLIC_`. |
| `BREVO_API_KEY` | Preview | staging/test Brevo key | production key | Must not send real mail from staging. |
| `BREVO_FROM_EMAIL` / `BREVO_FROM_NAME` | Preview | staging sender | production sender | |
| `CRON_SECRET` | Preview | staging-only random value | production value | Guards the cron routes. |
| `SUPABASE_URL` | Preview | staging project URL | production URL | Fallback read by the reconciliation-health cron. |
| `STAGING_SUPABASE_PROJECT_REF` | Preview | the staging project ref | unset | Names the one project a preview may write to. See §2.3. |
| `PRODUCTION_SUPABASE_PROJECT_REF` | Production | the production project ref | the production project ref | Names the one project a production deployment may write to. Required by the guard. See §2.3. |

### 2.2 Platform project (`valoria-final`)

| Variable | Scope | Preview value | Production value | Why |
| --- | --- | --- | --- | --- |
| `VALORIA_SITE_URL` | Preview | `<STAGING_SITE_ORIGIN>` | `https://valoriainstitute.com` | **Currently unset on staging.** Without it, confirmation emails and reminders point at production: the account is created in the staging database and confirmed on the production site. `lib/site-url.js` logs an error naming this variable when that happens. |
| `VITE_SUPABASE_URL` | Preview | staging project URL | production URL | Client. |
| `VITE_SUPABASE_ANON_KEY` | Preview | staging anon key | production anon key | Client. |
| `SUPABASE_URL` | Preview | staging project URL | production URL | Server. Same project as `VITE_SUPABASE_URL`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Preview | staging service-role key | production key | Server-only. |
| `ANTHROPIC_API_KEY` | Preview | staging/test key | production key | Report generation. |
| `RESEND_API_KEY` | Preview | staging/test key | production key | |
| `CRON_SECRET` | Preview | staging-only random value | production value | Guards `/api/generate-and-send-report` worker path and the sweep routes. |
| `STAGING_SUPABASE_PROJECT_REF` | Preview | the staging project ref | unset | Names the one project a preview may write to. See §2.3. |
| `PRODUCTION_SUPABASE_PROJECT_REF` | Production | the production project ref | the production project ref | Names the one project a production deployment may write to. Required by the guard. See §2.3. |

### 2.3 The write guard (`STAGING_SUPABASE_PROJECT_REF`)

Both projects now refuse a privileged write unless the deployment is allowed to
make it. This is the enforcement that was missing: preview deployments were
configured with production Supabase credentials, so a preview built from any
branch could write real participant data.

The rule, in `lib/environment-guard.js` in each repository. A privileged write
requires the runtime identity **and** the target database to be positively
identified. Nothing is allowed by default.

1. `VERCEL_ENV=production` — allowed **only** when the Supabase URL in use names
   the project in `PRODUCTION_SUPABASE_PROJECT_REF`.
2. `VERCEL_ENV` set to anything else (`preview`, `development`, or a value nobody
   anticipated) — allowed **only** when the Supabase URL names the project in
   `STAGING_SUPABASE_PROJECT_REF`.
3. `VERCEL_ENV` unset or empty — refused. It is allowed only when
   `ALLOW_LOCAL_PRIVILEGED_WRITES` is exactly `true` *and* the Supabase URL names
   the declared staging project.

An earlier version of this guard allowed any write when `VERCEL_ENV` was unset,
reasoning that Vercel always sets it on a deployment. That was a hole: a
deployment whose `VERCEL_ENV` failed to propagate, or any runtime Vercel does not
manage, would have been treated as local development and allowed to write with
production credentials. There is no bare "not on Vercel, so allow" branch now.

It fails closed at every step: a missing declaration, an unreadable Supabase URL,
or a URL whose project ref does not match all refuse the write with a `503` naming
the reason. A refused write is visible; a silent write to production is not.

**What the operator must set.** On the **Preview** scope of *both* projects, set
`STAGING_SUPABASE_PROJECT_REF` to the staging project ref (the `xxxxxxxx` in
`https://xxxxxxxx.supabase.co`). On the **Production** scope of both projects, set
`PRODUCTION_SUPABASE_PROJECT_REF` to the production project ref. `ALLOW_LOCAL_`
`PRIVILEGED_WRITES` is for local development and the test runner only; Vercel
never sets it, and it must not be set on a deployed environment.

Production scope now needs `PRODUCTION_SUPABASE_PROJECT_REF` before the guard
will allow a production write. **The guard is not yet merged**, so production is
unaffected today; this is a merge precondition. It is recorded here because a
merged guard without that variable would refuse production writes.

Consequences to expect before it is set:

* A preview deployment with `STAGING_SUPABASE_PROJECT_REF` unset refuses every
  privileged write with `503`. This is the intended fail-closed behaviour, not a
  bug. Read-only pages and the assessment resume GET are unaffected.
* A production deployment with `PRODUCTION_SUPABASE_PROJECT_REF` unset refuses
  every privileged write with `503`. If the guard is ever deployed to production
  without that variable, the site becomes read-only for participants. Set it in
  the same change that merges the guard.
* Once the staging variables in §2.1/§2.2 and this ref are all in place, a preview
  is a genuine staging environment and the acceptance suite can run against it
  without touching production.

**Verification.** With the bypass from §1, a write to a preview must not be
refused once the ref is set:

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST \
  -H "x-vercel-protection-bypass: <SECRET>" \
  "https://<PLATFORM_PREVIEW_ORIGIN>/api/notifications"
```

Expect `401` (the app was reached and auth was enforced), **not** `503` with
`Write refused`. Before the ref is set, `503` with `Write refused` is correct.

**Verification (per project).** `vercel env ls` (or the dashboard) must show the
Preview row for each variable. Then, with the bypass from §1:

```bash
# Site: the env-aware origin helper must resolve to the staging origin.
curl -s -H "x-vercel-protection-bypass: <SECRET>" \
  "https://<SITE_PREVIEW_ORIGIN>/api/health"
```

`/api/health` reports the environment; confirm it does not report `production`.

---

## 3. Staging Supabase

### 3.1 Credentials

A separate staging Supabase project (or an approved staging schema) with its own
URL, anon key and service-role key. Values delivered out-of-band, set only in
the Preview scope (§2).

Do not point a staging deployment at the production Supabase project. The
participant-identity rules in the audit plan require that no genuine participant
record is read or written during acceptance testing.

### 3.2 Auth redirect allowlist

Add to **Authentication → URL Configuration → Redirect URLs**:

```
<STAGING_SITE_ORIGIN>/auth/callback
<STAGING_SITE_ORIGIN>/reset-password
```

Leave the existing production entries in place. Do not remove or replace the
production redirect URL.

### 3.3 Confirmation email template

Confirm the **Confirm signup** template redirects to
`{{ .SiteURL }}/auth/callback` (or the environment-specific callback). The
platform generates its own `redirect_to` via `VALORIA_SITE_URL`, so the template
must not hardcode the production domain.

### 3.4 Rate-limit RPC

`check_rate_limit` must exist in the staging database. The hardened
`/api/welcome-email` and `/api/trigger-report` routes call it, and the
`/api/waitlist`, `/api/enquiries` and `/api/session-registration` routes already
do. If it is absent, `/api/welcome-email` returns `503` by design (it fails
closed).

`/api/careers/applications` now calls it too. That route is a public POST that
writes up to 4 MB to storage and sends two Brevo emails, so it was the last
unmetered public form; it now applies an IP budget and a per-address budget, and
**fails closed** — a limiter outage returns `503` rather than allowing an
unmetered write. Confirm `check_rate_limit` is present before deploying, or
career applications will be refused (no data is written, so a retry after the
function is restored succeeds).

**Verification.**

```bash
# Must return a boolean, not a "function does not exist" error.
curl -s -X POST "<STAGING_SUPABASE_URL>/rest/v1/rpc/check_rate_limit" \
  -H "apikey: <STAGING_SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"p_key":"probe","p_max_count":1,"p_window_seconds":60}'
```

Then confirm the confirmation email's link host is the staging origin (inspect
the received message, do not paste the token).

### 3.5 Migrations

Confirm the staging database has the migrations the branch expects, in
particular:

* `20261016121500_fix_taster_submission_ambiguous_reference.sql` — the snapshot
  submission RPC. The handler bug that made snapshot submission fail on `main`
  (`p_cluster_scores: results.normalisedScores`, a key `computeTasterResult()`
  never returns, so `JSON.stringify` dropped it and the RPC rejected the whole
  submission with `22023`) is **already corrected on this remediation branch**:
  `submit-taster.js` now sends `results.points`, and the payload's ten keys match
  the function signature exactly. Covered by `18_submit_taster_runtime.test.js`.
  PR #60 is therefore not a prerequisite for this branch.
* `20261021145000_require_assessment_version_provenance.sql` — assessment
  version provenance.
* `20261023120000_check_rate_limit_protocol.sql` — **required, and previously
  untracked.** Five routes call `supabase.rpc('check_rate_limit', ...)`:
  `/api/waitlist`, `/api/enquiries`, `/api/session-registration`,
  `/api/welcome-email` and `/api/careers/applications`. Until this migration was
  added, no migration in either repository defined that function, so it can only
  have existed as hand-applied DDL in whichever database the routes were first
  tested against. Consequences on a database that lacks it:

  | Route | Fallback | Result without the function |
  |---|---|---|
  | `/api/waitlist` | fails open | unmetered |
  | `/api/enquiries` | fails open | unmetered |
  | `/api/session-registration` | fails open | unmetered |
  | `/api/welcome-email` | fails closed | `503` on every call |
  | `/api/careers/applications` | fails closed | `503` on every call |

  This must be applied **before** the branch is deployed to staging, or the
  careers and welcome-email endpoints will refuse all requests. Verify with:

  ```bash
  npm run verify:rate-limit-migration   # executes the SQL against a real engine
  ```

  Then confirm in staging (service-role key, never a browser key):

  ```bash
  curl -s -X POST "<STAGING_SUPABASE_URL>/rest/v1/rpc/check_rate_limit" \
    -H "apikey: <STAGING_SERVICE_ROLE_KEY>" \
    -H "Authorization: Bearer <STAGING_SERVICE_ROLE_KEY>" \
    -H "Content-Type: application/json" \
    -d '{"p_key":"probe:203.0.113.1","p_max_count":2,"p_window_seconds":60}'
  # Expect: true, then true, then false on a third call inside the window.
  ```

  Expected object: `public.check_rate_limit(p_key text, p_max_count integer,
  p_window_seconds integer) returns boolean`, `security definer`,
  `search_path` pinned, executable by `service_role` only, with
  `public.rate_limit_buckets` unreadable by `anon` and `authenticated`.

  Note this is a **new, additive** migration. It does not modify or reapply any
  existing migration, and it does not touch the pre-existing
  `consume_opportunity_submission_rate_limit` function or its table.

* `20261023130000_unique_full_assessment_per_snapshot.sql` (**platform repo**,
  `valoria-final/supabase/migrations/`) — required for the retry guarantee.

  `valu_assessments` is created by **no tracked migration in either repository**,
  so its columns and constraints exist only as hand-applied DDL. Two of the
  guarantees the platform assumes therefore rest on untracked state:

  1. **No uniqueness on `(taster_id, identity_hash)`.** `submit-assessment.js`
     guards duplicates with a read-then-write lookup, which cannot be correct
     under concurrency: two retries that both run the lookup before either
     insert both insert. The only unique indexes on the table cover
     `report_token` and `report_idempotency_key`, and submission sets neither.
     Reproduced against a real engine: the second insert is accepted and the row
     count becomes 2.
  2. **No tracked default for `report_token`.** It is `NOT NULL` with a unique
     index, but nothing tracked generates it. The handler now supplies it
     (`randomUUID()`), so this dependency is removed in code — no operator action
     is needed for it, but note that any *other* writer relying on the untracked
     default would still be exposed.

  **Apply this migration before the branch is deployed**, because the
  application fix alone does not close the race. It is additive: it creates one
  index and runs a read-only pre-check.

  **If the target already holds duplicates, the migration will refuse to run.**
  That is deliberate — it names the offending `(taster_id, identity_hash)` pair
  and instructs reconciliation rather than deleting anything. Reconcile first:
  keep the earliest `completed_at` per pair, verify `report_token` and `user_id`
  ownership, and remove only the redundant rows. Do not delete rows to make a
  migration apply without confirming which record the participant was given.

  Verify:

  ```bash
  # In valoria-platform/valoria-final
  npm run verify:assessment-dedup-migration   # executes the SQL against a real engine
  ```

  Then confirm in staging, after applying:

  ```sql
  -- Must return one row, with the partial predicate.
  select indexdef from pg_indexes
   where indexname = 'valu_assessments_taster_identity_uidx';
  ```

  Confirm there is **no** duplicate pair before applying:

  ```sql
  select taster_id, identity_hash, count(*)
    from public.valu_assessments
   where taster_id is not null and identity_hash is not null
   group by 1,2 having count(*) > 1;
  ```

* **Journey email navigation.** No migration and no configuration change: the
  fix is in `api/create-account.js`. But confirm `VALORIA_SITE_URL` is set for
  the Preview scope (§2.2), because the journey email's "Complete your profile"
  link now derives from it. Before the fix it was hardcoded to
  `https://valoriainstitute.com/profile/edit`, which sent a staging participant
  to the production profile page.

---

## 4. Designated staging test account

One account, staging-only, whose credentials are held by the developer:

* Email on a domain the operator controls (or a plus-addressed mailbox), so
  confirmation mail is inspectable without touching a real participant.
* Not present in the production database.
* Documented as the acceptance account in the test plan; the developer must not
  create, modify or delete any other account.

**Verification.** Sign in with the account on the staging site origin and
confirm the dashboard loads with no assessment history.

---

## 5. What remains blocked without this

| Item | Blocked by |
| --- | --- |
| Any live staging journey (registration → confirmation → assessment → submission → report → resume) | §1, §2, §3, §4 |
| Verifying asset MIME types and absence of 404s behind the proxy | §1, §2.1 |
| Verifying confirmation links return to the staging dashboard | §3.2, §3.3, §2.2 |
| Verifying score survives refresh and a new session | §1, §2, §4 |
| Verifying retries do not duplicate records or emails | §1, §2, §3, §4 |

Until §1 is resolved, no automated client can reach a preview, so live
acceptance cannot begin. That single item is the highest-priority operator
action.
---

## 6. Re-verification 2026-10-23 (remediation candidate)

Nothing in §1–§4 has been applied. Re-confirmed against the current heads
(`valoria-site` `72a646d`, `valoria-platform` `de0fc30`):

* **§1 still blocks.** Both preview origins answer `302` to
  `https://vercel.com/sso-api?url=…`, including the proxied assessment path
  `/valu/assessment/`. No `x-vercel-protection-bypass` secret is provisioned in
  the environment this work runs in, and none was requested or accepted in chat.
  Automated staging acceptance therefore still cannot start.
* **§2.2 `VALORIA_SITE_URL` now has a second, build-time effect.** The platform
  candidate resolves the assessment app's outbound site links at **build** time
  via Vite `define` (`vite.config.js` → `__SITE_ORIGIN__`). The variable must
  therefore be present in the **Preview build** scope, not only at runtime; a
  runtime-only value will not change the links baked into the bundle. Set it for
  the Preview environment so the staging build inlines the staging origin.
* **§3.5 gained a second required migration.**
  `20261023130000_unique_full_assessment_per_snapshot.sql` (platform repo) closes
  a duplicate-submission race that the application code cannot close alone. It is
  additive, and it refuses to run over pre-existing duplicates rather than
  deleting anything.
* **No production change was made.** Production Deployment Protection is
  untouched, no environment variable was written, and both PRs remain draft.

### 6.1 Defects fixed on this branch (code-level, offline-verified)

Each was reproduced before being fixed, and each fix is guarded by a test that
fails if the defect returns. None of these has been verified on deployed
staging; that remains blocked by §1.

| Defect | Where | Reproduced how | Guard |
| --- | --- | --- | --- |
| Duplicate assessments possible under retry | platform `api/submit-assessment.js` + DB | second insert accepted, row count 2, on a real engine | `20_assessment_dedup_contract.test.js`, `verify:assessment-dedup-migration` |
| `report_token` never supplied by the handler | platform `api/submit-assessment.js` | insert without the column raises `23502` | `09_submit_assessment_runtime.test.js`, `20_…contract.test.js` |
| Journey email CTA hardcoded to production | platform `api/create-account.js` | staging participant sent to production `/profile/edit` | `22_create_account_runtime.test.js` |
| `check_rate_limit` called but defined by no migration | site (both repos) | absent on a fresh project; two routes `503`, three unmetered | `rate-limit-contract.test.js`, `verify:rate-limit-migration` |
| First-request race in the limiter | site migration | `select … for update` locks no non-existent row; duplicate-key error | `rate-limit-contract.test.js`, `verify:rate-limit-migration` |

### 6.2 Audit of the remaining critical handlers

The request asked for the other critical handlers to be audited for runtime
failures, response-after-write bugs, auth gaps and retry hazards. Findings:

* **`scripts/find-block-scope-bugs.mjs` reports 0 findings** across `api`, `src`
  and `lib`. That is a real pass, not a vacuous one: reintroducing the original
  `const`-in-`try` shape makes the checker report it. The checker is wired into
  `npm run test:all`.
* **`api/claim-taster.js`** (snapshot linking, account-adjacent) is sound on the
  retry hazard: it links with a compare-and-swap
  (`user_id=is.null` in the `PATCH` filter) and then re-reads to confirm it won,
  so a concurrent claim cannot double-link. Ownership and identity are
  re-validated server-side.
* **`api/create-account.js`** had the journey-email defect above. Its rate
  limiting fails closed (a limiter error returns `503`, not an allow), and the
  recipient address cannot be redirected by a body-supplied address.
* **`api/submit-assessment.js`** had the two defects above. Its ownership,
  confirmation, identity-match and handoff-token checks all run server-side and
  are covered by runtime tests.
* **Untracked-schema class.** `valu_assessments` is created by no tracked
  migration in either repository. That is the root cause shared by the
  `report_token` defect and the missing dedup constraint, and it is the most
  likely source of further latent defects. Fully resolving it means capturing the
  live schema as a tracked baseline migration, which requires reading the staging
  database — blocked by §3.1. Flagged as an open dependency, not closed.

### 6.3 The preview-write defect, and why it blocked the acceptance run

The one defect that is both source-fixable and the direct reason live acceptance
could not be run: **no code in either repository checked which environment it was
running in before performing a privileged write.**

Vercel's preview environment is configured with the same Supabase URL and
service-role key as production. Every handler that holds the service-role key
wrote straight through. A preview built from any branch — including this one —
could therefore register participants, save assessment progress, submit
assessments and send mail against the **production** database. Exercising the
staging acceptance suite against such a deployment would have written real
participant data, so the suite was not run.

The fix is a fail-closed guard in both repositories (`lib/environment-guard.js`),
described in §2.3. Production and an unset `VERCEL_ENV` proceed; any other value
proceeds only when the Supabase project matches `STAGING_SUPABASE_PROJECT_REF`;
everything else refuses with a `503` naming the reason.

| Aspect | Detail |
| --- | --- |
| Platform writers guarded | 20 handlers (not 12 — a single-quoted grep missed double-quoted methods and `/auth/v1/admin` calls) |
| Site coverage | `middleware.js`, ahead of every bypass, covering all 32 routes that build their own service-role client |
| Read paths preserved | The resume GET in `assessment-progress.js` and the notifications GET stay readable; the guard sits on the write path |
| Writing-GET routes | Five `/api` routes plus `/journey/continue` write inside their GET handler and are treated as writes |
| Tests | Platform 34, site 31, both mutation-verified (removing a call or weakening a deny branch turns each red) |

This is a code-level fix. It is verified offline; its behaviour on deployed
staging is not yet confirmed, because reaching a preview is still blocked by §1.
What it changes for the acceptance run: once §1–§3 and
`STAGING_SUPABASE_PROJECT_REF` are in place, a preview is a genuine staging
environment and the suite is safe to run against it.

### 6.4 Re-verification 2026-10-24 (post-push)

Re-confirmed after pushing the guard commits:

* **Heads.** `valoria-platform` `1351733`, `valoria-site` `a5e841a`. Both PRs
  (#62, #133) remain **open and draft**; both `main` branches are unchanged
  (`7458831`, `84693ee`). Nothing was merged or promoted.
* **CI.** All checks pass on both heads. The site's `production-smoke` job is
  `skipped`, which is correct — it must not run against production.
* **§1 still blocks.** Both preview origins answer `302` to
  `https://vercel.com/sso-api?url=…`, including `/api/health` and `/`. No
  `x-vercel-protection-bypass` secret is provisioned here and none was accepted
  in chat. Automated staging acceptance still cannot start.
* **Guard is inert on production.** With `VERCEL_ENV=production` the guard
  allows, and with `VERCEL_ENV` unset (local, CI) it allows; both are covered by
  tests. The guard cannot refuse a legitimate production write.
* **Guard is not yet exercisable on staging.** A preview refuses privileged
  writes with `503` until `STAGING_SUPABASE_PROJECT_REF` is set (§2.3). That is
  the intended fail-closed behaviour, and the reason the acceptance suite can
  safely be run once the variable exists.

---

## 7. Phase 5 addendum — corrections, and the exact access required

Nothing below has been applied. This section corrects two inaccuracies in the
earlier text and narrows B1 to a precise request.

### 7.1 Correction — the platform has no `/api/health`

§1 and §2.2 verify the bypass with `GET <PLATFORM_PREVIEW_ORIGIN>/api/health`.
That route does not exist in the platform project (`valoria-final/api/` has
`system-status.js` and `reconciliation-health.js`, neither named `health`). A
404 would be ambiguous with a routing failure, so the probe was misleading.

Use the platform's status route instead. It is deliberately gated on
`CRON_SECRET`, so the expected *success* signal for reachability is `401`, not
`200` — a `401` proves the application answered:

```bash
# WITHOUT the bypass: expect 302 to https://vercel.com/sso-api?...
# WITH the bypass and no Authorization header: expect 401 (app reached, auth enforced)
curl -s -o /dev/null -w '%{http_code}\n' \
  -H "x-vercel-protection-bypass: <SECRET>" \
  "https://<PLATFORM_PREVIEW_ORIGIN>/api/system-status"

# With the bypass and the cron secret: expect 200 (healthy) or 504 (dependency down)
curl -s -H "x-vercel-protection-bypass: <SECRET>" \
  -H "Authorization: Bearer <CRON_SECRET>" \
  "https://<PLATFORM_PREVIEW_ORIGIN>/api/system-status"
```

The site probe is correct as written: `src/app/api/health/route.js` exists and
reports `environment: process.env.VERCEL_ENV`.

### 7.2 Correction — B1 is much larger than two tables

§3.5 states that `valu_assessments` is created by no tracked migration. That is
correct, but it understates the gap. Replaying the tracked sequence on a fresh
PostgreSQL server (`npm run verify:migration-reproducibility`) shows:

* the chain fails at **migration 2 of 84** (`professional_profiles` absent);
* **10 tables** are referenced but created by no migration:

  | table | migrations referencing |
  | --- | --- |
  | `professional_profiles` | 67 |
  | `valu_assessments` | 44 |
  | `taster_sessions` | 28 |
  | `valoria_journey_events` | 10 |
  | `professional_standard_event_registrations` | 4 |
  | `assessment_sessions` | 2 |
  | `opportunity_invites` | 1 |
  | `valoria_reentry_links` | 1 |
  | `rate_limits` | 1 |
  | `marketplace_profiles` | 1 |

* the `private` schema is created by exactly one migration
  (`20260827_marketplace_governance_v4.sql`), yet migrations sorting **before**
  it already reference `private.` — an ordering defect;
* `public.users` and `cron.job` are assumed to exist.

A clean environment therefore cannot be provisioned from source, and the gap is
an order of magnitude larger than the two tables previously recorded.

**One real defect was found and fixed** in this phase:
`20260827_marketplace_governance_v4.sql` declared `language plpgsql` on a
wrapper whose body is a bare `select ...`, which PostgreSQL rejects with
`syntax error at or near "select"`. The two sibling wrappers in the same file
use `language sql`. Fixed, and pinned by a test that fails if it reverts.

### 7.3 B1 — the exact access required (read-only)

To author a baseline from evidence rather than invention, one of the following:

**Option A (preferred) — a read-only role.** Create in the **staging** Supabase
project, via the SQL editor:

```sql
create role schema_auditor login password '<OPERATOR_CHOSEN_STRONG_PASSWORD>';
grant connect on database postgres to schema_auditor;
grant usage on schema public, private, auth, vault, extensions to schema_auditor;
grant select on all tables in schema public, private to schema_auditor;
grant select on all sequences in schema public, private to schema_auditor;
alter default privileges in schema public, private
  grant select on tables to schema_auditor;
-- Catalog reads need no grant. Revoke write explicitly so the role cannot write.
revoke create on schema public, private from schema_auditor;
```

Then deliver, out-of-band:

* the connection string, e.g.
  `postgresql://schema_auditor:<password>@db.<staging-ref>.supabase.co:5432/postgres`
* the staging DB host, so it can be passed as `--expect-host`.

Run:

```bash
cd valoria-platform/valoria-final
STAGING_DATABASE_URL='postgresql://schema_auditor:…@db.<staging-ref>.supabase.co:5432/postgres' \
  npm run capture:staging-schema -- --expect-host=db.<staging-ref>.supabase.co
```

The script is read-only, refuses to run without `--expect-host` matching the
connection host (so production cannot be reached by mistake), and writes only
`.schema-capture/` (git-ignored). It never prints or stores the password.

**Option B — the operator runs the capture.** The query set is in
`valoria-platform/valoria-final/docs/engineering/valu-assessments-schema-baseline.md`
§4. Paste the output back; the developer authors the baseline from it.

**Do not** apply any generated `CREATE TABLE` to staging or production without
review. The baseline is authored from the capture, then verified offline with
`npm run verify:migration-reproducibility -- --baseline=<file> --compare=.schema-capture/capture.json`,
which must take the chain from failing at migration 2 to applying all 84 with no
column-level differences.

### 7.4 B3 — the exact variable write required

| Project | Scope | Variable | Value |
| --- | --- | --- | --- |
| platform (`valoria-final`) | **Preview** | `VALORIA_SITE_URL` | `<STAGING_SITE_ORIGIN>` |

`<STAGING_SITE_ORIGIN>` must be the confirmed staging origin of the site
project, and the **same** value must be used for the site project's
`NEXT_PUBLIC_SITE_URL` (§2.1) and the Supabase Auth allowlist (§3.2). It must not
be set to the production domain.

This is a **build-time** value on the platform: `vite.config.js` inlines the
origin via `define`, so the variable must be present in the Preview **build**
scope. Setting it at runtime only will not change the links baked into the
bundle. After writing it, trigger a redeployment of the preview branch and
confirm the bundle carries the staging origin.

Do not set this variable to the production domain in any scope to make a test
pass. That is the exact defect `lib/site-url.js` exists to prevent.
