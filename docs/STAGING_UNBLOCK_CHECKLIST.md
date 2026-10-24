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
(`valoria-site` `a8f4500`, `valoria-platform` `9e3bcf3`):

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
* **No production change was made.** Production Deployment Protection is
  untouched, no environment variable was written, and both PRs remain draft.
