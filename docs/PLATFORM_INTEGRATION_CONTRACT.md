# valoria-site ↔ valoria-platform integration contract

This document records the exact handoff contract between the public site
(`valoria-site`) and the assessment/application platform (`valoria-platform`,
built from `valoria-final/`). It is the reference for the staging remediation
and must be kept in sync when either side changes.

Nothing here authorises a change to shared production configuration. Any
Supabase Auth allowlist, template, database or environment-variable change
listed under "Operator actions" must be applied per environment by an operator.

---

## 1. Assessment app hosting

The full VALU assessment SPA is a separate deployment (Vite, `base:
'/valu/assessment/'`) served by `valoria-platform`. The site proxies it:

```js
// valoria-site/next.config.js
const origin = process.env.VALU_UPSTREAM_ORIGIN || 'https://assessment.valoriainstitute.com'
{ source: '/valu/assessment',          destination: `${origin}/` }
{ source: '/valu/assessment/:path*',   destination: `${origin}/:path*` }
```

`VALU_UPSTREAM_ORIGIN` is an **origin only** (no path). The platform's
`vercel.json` rewrites `/valu/assessment/assets/:path*` → `/assets/:path*` so the
hashed Vite bundle resolves behind the base path.

Public entry point is always the site-relative `/valu/assessment/`
(`BRAND.assessmentUrl`), never an absolute production host. A public page that
pins `https://valoriainstitute.com/valu/assessment/` sends staging and preview
users to production.

### Outbound links inside the assessment app

The proxy means the assessment app is reached at the site's own origin, so every
link it renders back into the site (sign in, sign up, journey continuation,
report, profile setup) must be built from the deployment's origin, not the
production literal. This was a real defect: eleven such links were hardcoded, so
after completing a snapshot the "CONFIRM EMAIL & SIGN IN" and "Continue your
journey" actions took a staging participant to production and the staging journey
could never be completed.

The app resolves its origin at **build** time. `vite.config.js` reads
`VALORIA_SITE_URL` and injects it via Vite's `define` as `__SITE_ORIGIN__`;
`src/siteOrigin.js` exposes it as `SITE_ORIGIN` and `siteUrl(path)`. Two
consequences the operator and any future change must respect:

* `VALORIA_SITE_URL` must be set for the **build** environment of the platform
  project, not only at runtime. A build without it bakes in the production
  origin.
* It must not be read through `import.meta.env`: Jest transforms this app with
  Babel, which rejects `import.meta` outright, so a helper reading it could not
  be imported by a test. `define` substitutes the token before Babel sees it.

### Middleware rule (root cause of the asset incident)

`valoria-site/src/middleware.js` must never run for `/valu/assessment*`. Its
matcher excludes `valu/assessment`, and the function body bypasses the prefix
before the Supabase auth call. Previously the hashed `.js`/`.css` bundle
requests were treated as page requests and passed through
`supabase.auth.getUser()`; any auth/network failure returned 500 for the asset
and the SPA shell rendered broken. Do not re-add a static-extension allowlist as
the only protection — bypass the whole prefix.

---

## 2. Authenticated full-assessment handoff (site → platform)

A signed-in, email-confirmed user with a completed snapshot is sent from
`/journey/continue?stage=assess` to the full assessment:

```
GET {current-origin}/valu/assessment/?full=1&taster_id=<id>&name=<n>&role=<r>&experience=<e>#handoff_token=<jwt>
```

* Query params: `full=1`, `taster_id`, `name`, `role`, `experience`
  (and `resume` when resuming an interrupted session).
* Fragment: `handoff_token` — a short-lived JWT created by
  `valoria-site/src/lib/valu-handoff-token.js`, bound to `user.id` and
  `taster.id`. It is in the fragment so it is never sent to the server or logged
  in `Referer`.
* The destination is resolved against `request.url` (`new URL(ASSESSMENT_PATH,
  request.url)`), so staging hands off to staging.

Server-to-server alternative: `GET /api/valu-handoff` (site) returns
`{ url }` after verifying the bearer token, the confirmed email and the snapshot
identity evidence. Destination comes from `VALU_ASSESSMENT_URL`
(default `https://valoriainstitute.com/valu/assessment/`).

### What the platform must do with the handoff

1. Validate `handoff_token`; refuse and show the account-required state if it is
   missing, expired or bound to a different account.
2. Require the user's email to be confirmed.
3. Never accept an anonymous `full=1` submission — the full assessment is only
   reachable through the account handoff.

### Submission endpoint contract (`valoria-platform/api/submit-assessment.js`)

* `POST` with `{ name, role, experience, answers, timings, shuffleMap,
  taster_id, handoff_token }`. The server re-scores from the canonical bank; the
  browser never supplies score-bearing options or ownership.
* `action: 'verify-handoff'` performs the same token/identity/confirmation
  checks and returns `{ ok: true, expires_at }` for the resume path.
* Success returns `{ identity_hash, report_token, results }`; a repeat for the
  same verified owner returns `alreadyCompleted: true` with the existing token.
* The token format is `base64url(payload).base64url(hmac-sha256(payload))`, HMAC
  key = `SUPABASE_SERVICE_ROLE_KEY`, `aud = 'valu-full-assessment'`, TTL 4h.
  Site creator: `valoria-site/src/lib/valu-handoff-token.js`; platform verifier:
  `valoria-platform/valoria-final/lib/valu-handoff-token.js`. Verified
  interoperable in both directions, including rejection of wrong-snapshot,
  tampered, missing and expired tokens.

**Testing requirement:** the platform's existing contract tests for this endpoint
read the file as text and assert substrings. That style cannot catch control-flow
bugs, and one shipped: a `const` declared inside a `try` and read after it threw
`ReferenceError` on every first-time submission *after* the row was written, so
participants were charged a completed assessment and shown a save failure.
`valoria-final/src/__tests__/09_submit_assessment_runtime.test.js` now executes
the real handler with only `global.fetch` stubbed. Keep runtime coverage for any
change to this endpoint; do not rely on substring assertions alone.

---

## 3. Email confirmation contract

Supabase confirmation emails must redirect to the site callback. There are two
shapes, and which one applies depends on where the participant was when the
account was created.

**Shape A — a snapshot or assessment already exists (identity evidence in hand).**
The platform builds this in `api/create-account.js` and
`api/resend-confirmation.js`:

```
{site-origin}/auth/callback?identity_hash=<fp_...>&report_token=<uuid>
```

**Shape B — the snapshot signup path, no identifier available.**

```
{site-origin}/auth/callback
```

In shape B the platform creates the account and sends the confirmation email
*before* the snapshot is submitted, so the `taster_sessions` row does not exist
when the link is generated and no identifier can travel through the redirect.
This is why the callback page cannot rely on `pending_taster_id` here, and why
the recovery is by email evidence instead: after the session is established,
`src/app/auth/callback/page.jsx` calls `/api/claim-taster` with an empty body and
the server matches the candidate by the authenticated, confirmed user's own
email. A zero-match result is non-blocking.

Do not "fix" shape B by adding an identifier to the redirect. A browser-supplied
identifier is not proof of ownership, and the snapshot row does not exist yet.

### Which parameter does what

| Parameter | Consumed by | Meaning |
| --- | --- | --- |
| `code` | callback | Supabase PKCE exchange; produces the session |
| `identity_hash` | callback → `/api/link-assessment` | name/role fingerprint of a completed full assessment |
| `pending_taster_id` | callback → `/api/link-taster` | snapshot id, only when the row already existed |
| `report_token` | **`/login`, not the callback** | proof-of-ownership token for a completed assessment |
| `taster_id` | `/journey/continue` | resume/continuation target |

`report_token` is deliberately not read by the callback page: `/login` forwards
it to the platform, which validates it. The callback reads `identity_hash` and
`pending_taster_id`, and otherwise falls through to the shape-B recovery.

* `src/lib/site-url.js` builds the site's own URLs via `authCallbackUrl()`.
  Resolution order: `NEXT_PUBLIC_SITE_URL` → browser origin → production.
* After confirmation the platform/signup flow sends the user to
  `{site-origin}/login?email_confirmed=1`. The login page shows an accessible
  "your email is verified, sign in to continue" notice for that flag.

### The platform must build the redirect from its own environment

This was a real defect and is now fixed in the platform, but the contract is
worth stating because it is easy to reintroduce. `api/create-account.js`,
`api/resend-confirmation.js`, `api/assessment-progress.js`,
`api/send-profile-reminder.js` and `api/send-email.js` previously either
hardcoded `https://valoriainstitute.com` or read a single environment variable
with a production fallback. The consequence on staging was a split-brain
registration: the account was created in the staging database, the confirmation
email pointed at production, and the participant was confirmed on one deployment
and recorded on another. Setting `VALORIA_SITE_URL` alone did not help, because
two of the modules never read it.

All five now resolve through `lib/site-url.js` — `resolveSiteUrl()` — which
honours `VALORIA_SITE_URL` → `SITE_ORIGIN` → `NEXT_PUBLIC_SITE_URL` →
production, and logs an error on a non-production deployment with none set.
`VERCEL_URL` is deliberately not used: the platform and the site are separate
Vercel projects, so it would name the platform host.

Preview deployment hosts are never a valid permanent destination. Use a stable
staging origin in the allowlist, not a per-deployment URL.

### Operator actions (Supabase Auth) — do not apply without authorisation

* Add the staging origin to the Auth **redirect URL allowlist**. Use the stable
  staging origin, not a per-deployment preview host: Supabase silently falls back
  to the project Site URL for any `redirect_to` that is not allowlisted, and the
  callback then never fires.
* Update the **Confirm signup** email template to redirect to
  `{site-origin}/auth/callback`.
* Set the site env var `NEXT_PUBLIC_SITE_URL` to the staging origin on staging.
* Set the platform env var `VALORIA_SITE_URL` to the staging origin on staging.
  This is required, not optional: without it the platform's non-production
  deployments fall back to production and log an error. Both variables name the
  *site* origin — the platform must not use its own `VERCEL_URL`.

### Staging environment variables (Vercel) — do not apply without authorisation

`.env.example` is the contract for *which* variables exist; it does not prove a
deployment has them. Confirm each of these on the staging project, with the
correct scope, before trusting a staging run:

| Variable | Scope | Why it matters |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | all | every Supabase call; a malformed value used to 500 the routes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | all | browser auth and middleware session refresh |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | privileged routes; must never be exposed as `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_SITE_URL` | all | auth redirects and handoff callbacks; must be the staging origin |
| `VALU_UPSTREAM_ORIGIN` | all | `/valu/assessment/*` rewrite target |
| `VALU_ASSESSMENT_URL` | all | handoff destination |
| `CRON_SECRET` | server only | guards the cron routes |
| `BREVO_API_KEY`, `BREVO_FROM_EMAIL`, `BREVO_LIST_ID`, `BREVO_WEBINAR_LIST_ID` | server only | transactional email and webinar list adds |
| `SUPABASE_URL` | server only | fallback for the reconciliation-health cron |

The **platform** repo needs its own site origin, or its auth redirects and
journey links fall back to production. It resolves, in order:
`VALORIA_SITE_URL` → `SITE_ORIGIN` → `NEXT_PUBLIC_SITE_URL` → production. Set
`VALORIA_SITE_URL` on the platform staging project to the staging origin so a
staging registration is confirmed back onto staging.

`VERCEL_URL` is deliberately not used: the platform and the site are separate
Vercel projects, so it would name the platform host rather than the site. A
non-production deployment with no origin configured logs an error naming
`VALORIA_SITE_URL` rather than silently mailing a production link.

`valoria-site` sends a *fixed* set of variables to the assessment host. If the
platform later needs a site origin it does not already have, it is
`VALORIA_SITE_URL`.

Do not set `VERCEL_ENV` by hand — Vercel provides it. `VALORIA_PLATFORM_ROOT`
and `VALORIA_SITE_ROOT` are test-only.

### Known blocker: preview deployments are protected

Preview deployments currently answer `302` to
`https://vercel.com/sso-api?url=…` and then `https://vercel.com/login`
(Vercel Deployment Protection), so an unauthenticated client cannot reach them.
Resolve before any automated staging run, by either:

* generating a **Protection Bypass for Automation** secret and sending it as
  `x-vercel-protection-bypass` (header or query param), or
* setting Vercel Authentication to **Only Production Deployments** or
  **Disabled** for previews.

The per-commit preview URL is available from the GitHub deployment status for a
commit (`environment_url`), not from guessing the branch alias — a branch alias
such as `<project>-git-<branch>-<team>.vercel.app` does not necessarily resolve.

---

## 4. Callback / redirect summary

| Direction | Path | Notes |
| --- | --- | --- |
| Supabase → site | `/auth/callback?code=…` | session + identity link |
| site → platform | `/valu/assessment/?full=1…#handoff_token=…` | authenticated handoff |
| site → site | `/journey/continue?stage=assess` | server-side gate + redirect |
| platform → site | `{site-origin}/login?email_confirmed=1` | post-confirmation |
| platform → site | `{site-origin}/journey/continue?stage=assess&taster_id=…` | reminders |

### Internal service calls stay on the platform's own origin

The platform's report pipeline (`generate-and-send-report.js`,
`finalize-report.js`, `sweep-unsent-reports.js`) calls its own
`/api/send-email` route. That route lives in the **platform** deployment, not on
the site: the site has no `/api/send-email` handler, and its `/valu/assessment`
rewrite points *back* at the platform.

`generate-and-send-report.js` previously built this URL from a site origin
(`SITE_ORIGIN`, defaulting to production). Delivery therefore 404'd and every
report landed in `FAILED`. It now resolves the origin from the incoming request
(`new URL(req.url).origin`), matching the other two callers, so the internal
call follows the deployment that is actually running. `SITE_ORIGIN` remains a
valid input to `lib/site-url.js` for building links the *user* follows; it must
not be used to reach the platform's own API.

Rule: a call from one platform route to another platform route resolves against
`req.url`. `lib/site-url.js` is only for destinations on the site.

Never hardcode a preview deployment host as a permanent destination. Use
`NEXT_PUBLIC_SITE_URL` (site) and `VALU_UPSTREAM_ORIGIN` / `VALU_ASSESSMENT_URL`
(assessment origin) per environment.

---

## 5. Scoring parity

The canonical VALU v4 contract lives in
`valoria-platform/valoria-final/src/valuV4Contract.js` and is mirrored in
`valoria-site/src/valuV4Contract.js`. Both `scoringEngine` implementations must
stay semantically identical:

* 5 clusters, weights 0.20 / 0.25 / 0.25 / 0.20 / 0.10, maxRaw 36/48/60/36/36.
* Round each cluster, then round the weighted index once.
* Integrity signals (consistency, speed, anchors, uniformity) are diagnostics —
  they must never silently mutate the published score.
* Marketplace eligibility is the 35-point threshold only; it is not listing
  status. Pathways are the Development Pathway bands, not the retired
  PCP/PRIME Programme/Cluster/Sprint names.

### Verification

```bash
npm run verify:scoring-parity            # uses /workspace/repos/valoria-platform
npm run verify:scoring-parity -- <path>  # explicit platform checkout
```

Runs the site engine and the canonical platform engine over the **real
58-question bank** and compares every returned field; it skips with a clear
message when the platform repo is not checked out. In-repo, the golden vectors
in `src/__tests__/scoring-parity-vectors.json` pin the same behaviour without
needing the platform repo. Last run: 10 cases / 190 fields / 0 mismatches.
