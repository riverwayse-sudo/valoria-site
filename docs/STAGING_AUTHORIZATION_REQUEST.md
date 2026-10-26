# Staging access and authorization request

Prepared for the Valoria Institute owners. Every item below is a blocker on live
staging verification. Nothing in this list can be completed from the repository:
each needs a decision, a credential, or a console action that only an owner holds.

Current code state when this was written:

| Repo | Branch | Head | `main` (untouched) |
| --- | --- | --- | --- |
| valoria-platform | `remediation/staging-2026-10-23` | `3b95ffd` | `74588311` |
| valoria-site | `remediation/staging-2026-10-23` | `e87be29` | `84693eec` |

Both PRs are open and in draft: [#62](https://github.com/riverwayse-sudo/valoria-platform/pull/62),
[#133](https://github.com/riverwayse-sudo/valoria-site/pull/133). Neither will be
merged or promoted without explicit authorization.

## 1. Reach the protected preview deployments

Both previews currently answer `302` to `https://vercel.com/sso-api?url=...`:

- `https://valoria-final-git-remediati-28f871-valoria-institute-s-projects.vercel.app`
- `https://valoria-site-git-remediatio-b16efb-valoria-institute-s-projects.vercel.app`

**Decision needed:** either of the following.

- **Preferred — a Protection Bypass for Automation secret.** Vercel project
  settings → Deployment Protection → Protection Bypass for Automation → Generate
  Secret. Give the secret to the operator (do not paste it into GitHub, this file,
  or a report). It is then supplied as the `x-vercel-protection-bypass` header or
  the `?x-vercel-protection-bypass=` query parameter.
- **Alternative — set Deployment Protection to "Only Production Deployments".**
  This leaves production protected and opens previews.

**Responsible owner:** Vercel project owner for both projects.
**Evidence to close:** an unauthenticated request to either preview returns the
application (not a `302` to `vercel.com`), and a read-only page renders.

## 2. An isolated staging Supabase project

Preview deployments must write to a staging database, never to production.

**Decision needed:** approve provisioning (or naming an existing) separate Supabase
project for staging, and provide its project ref (the `xxxxxxxx` in
`https://xxxxxxxx.supabase.co`). Provide the staging `anon` and `service_role` keys
through the Vercel dashboard, not in any repository file.

**Responsible owner:** Supabase organization owner.
**Evidence to close:** the staging project exists, is empty of genuine participant
records, and its ref is known.

## 3. Configure the guard's variables

The write guard refuses a privileged write unless the runtime and the target
database are both positively identified. The following are required.

| Project | Scope | Variable | Value |
| --- | --- | --- | --- |
| both | **Preview** | `STAGING_SUPABASE_PROJECT_REF` | the staging project ref from §2 |
| both | **Preview** | `NEXT_PUBLIC_SUPABASE_URL` / `VITE_SUPABASE_URL` | the staging project URL |
| both | **Preview** | `SUPABASE_URL` | the staging project URL |
| both | **Preview** | `SUPABASE_SERVICE_ROLE_KEY` / `VITE_*` | the staging keys |
| both | **Production** | `PRODUCTION_SUPABASE_PROJECT_REF` | the production project ref |

The Production row is a **merge precondition**, not a staging one. The guard is not
merged, so production is unaffected today; merging without it would refuse every
production write and take the site read-only for participants. See
`docs/STAGING_UNBLOCK_CHECKLIST.md` §2.3.

`ALLOW_LOCAL_PRIVILEGED_WRITES` must **not** be set in any Vercel scope. It exists
only for local development and the test runner.

**Responsible owner:** Vercel project owner, with the refs from §2 and the
production ref from §4.
**Evidence to close:** the variables are present in the effective configuration for
the correct scopes. This is confirmed by behaviour, not by reading values: a preview
write succeeds against staging and a preview write aimed at production is refused
with `503`. Never paste the values into a report.

## 4. Independently verify the production project ref

`PRODUCTION_SUPABASE_PROJECT_REF` must match the project the production deployment
actually uses.

**Decision needed:** confirmation, from an authoritative source, of the production
Supabase project ref and that it matches the production `NEXT_PUBLIC_SUPABASE_URL` /
`VITE_SUPABASE_URL`. The ref can be read from the production Supabase project's
Settings → API, or from the project URL. It is not a secret, but it must be
confirmed rather than guessed: an incorrect value blocks production writes.

**Responsible owner:** Supabase organization owner, confirming against the
production Vercel configuration.
**Evidence to close:** the ref in Production scope equals the ref in the production
Supabase URL, confirmed by two independent sources.

## 5. Read-only staging database inspection

Resolving the migration provenance findings needs the applied schema and migration
history of the staging database.

**Decision needed:** an authorized operator, or a read-only credential, able to run
schema and migration-history queries against staging. This is a read: no write
access is requested, and no corrective migration will be executed without separate
review and authorization.

**Responsible owner:** Supabase organization owner, naming the operator.
**Evidence to close:** the schema of `valu_assessments` and related tables, and the
applied migration history, are captured.

## What is already done and does not need owner input

- The write guard is hardened and mutation-verified (11 platform / 12 site
  mutations, 0 survivors).
- The one unguarded service-role writer (`api/_rateLimit.js`) is guarded, and the
  completeness check now scans helpers and RPC calls.
- Both repositories are green: platform 44 suites / 644 tests, site 21 suites / 457
  tests, builds and static gates clean.

## What remains blocked until the above land

- Live staging acceptance (registration, confirmation, taster, full assessment,
  persistence, resume, scoring).
- Migration provenance and the `valu_assessments` disposition.
- Confirmation that previews target the staging project rather than production.
