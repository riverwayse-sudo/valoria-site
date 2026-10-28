# AGENTS.md — valoria-site

Next.js 15 public website for Valoria Institute, plus authenticated journeys
(signup → email confirmation → assessment → dashboard).

## Commands

```bash
npm run build            # prebuild runs design:check + excellence:check first
npx jest                 # unit/contract suite (currently 13 suites / 287 tests)
npm run design:check     # static design-system gate
npm run excellence:check # static quality gate
npm run verify:scoring-parity   # cross-repo VALU scoring parity (see below)
```

Local runtime check used during remediation — start the production build and
probe routes:

```bash
npm run build && npm start
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/valu/assessment/assets/<file>.js
```

## Layout notes

- `src/middleware.js` — Supabase auth guard for `/admin` and `/profile/edit`.
  Bypass decisions live in `src/lib/middleware-routing.js` (pure, unit-tested).
- `src/lib/site-url.js` — single source of truth for the site's own origin.
  Never hardcode a host in redirects; use `siteUrl()` / `authCallbackUrl()`.
- `src/lib/supabase-url.js` — validates `NEXT_PUBLIC_SUPABASE_URL`. Supabase
  clients throw synchronously on a malformed URL; modules that build a client at
  import time must go through this helper or a config typo 500s the route.
- `src/lib/supabase-server.js` — `getPrivilegedClient()` fails closed when the
  service-role key is missing. Never fall back to the anon key for privileged
  work.
- `src/scoringEngine.js` + `src/valuV4Contract.js` — VALU v4 scoring. Must stay
  semantically identical to `valoria-platform/valoria-final/src/`.

## Scoring parity

`src/scoringEngine.js` drifted from the platform once already (it applied
undocumented consistency/gaming penalties to the published score and carried
retired pathway names). Two guards exist now:

1. `src/__tests__/scoring-parity.test.js` replays golden vectors produced by the
   canonical platform engine. Regenerate the vectors — never hand-edit them.
2. `npm run verify:scoring-parity` runs both engines over the real 58-question
   bank and compares every field.

If you change scoring, change it in the platform repo in the same PR.

## Integration contract

`docs/PLATFORM_INTEGRATION_CONTRACT.md` is the reference for the
site ↔ platform handoff (assessment proxying, email confirmation, callback and
redirect URLs, scoring parity). Keep it in sync with either side.

## Testing conventions

Tests are CommonJS (`require`), run by Jest with no config file. `src/lib`
helpers are CommonJS specifically so they are directly unit-testable. Prefer
testing real code paths over mocks; the regression suites assert against actual
source and real helper behaviour.

A substring assertion is not a behavioural test. Asserting that a file contains
`58-question`, or that it mentions a header name, passes whether or not the code
works. That style shipped real bugs on both sides of this integration: a
`ReferenceError` on every first submission, an endpoint that read
`req.headers.authorization` on a Web `Headers` object and 401'd every caller,
and a rate limit whose rejection branch could not be returned from its handler.
When a check matters, execute the code — for server routes, stub only
`global.fetch` and invoke the real handler.

Golden vectors have the same limitation as substring checks if the fixtures do
not reach the changed code. A single option's score changed from 4 to 3 passed
every scoring test, because the golden picks only ever took the first, middle
and last option of each question. The platform now also pins a SHA-256 digest
over the bank's scoring-relevant fields. If you add goldens, check they fail
when the thing they describe changes.

## Do not

- Commit to `main`, merge PRs, or promote deployments to production.
- Change shared Supabase Auth / Vercel configuration without authorisation;
  document required changes in the integration contract instead.
- Modify genuine participant records.

## Untracked database objects

A route calling `supabase.rpc('name', ...)` proves nothing about whether `name`
exists in any deployed database. `check_rate_limit` was called by five routes
and defined by no migration in either repository — it existed only as DDL
applied by hand to whichever database those routes were first tested against.
Every environment therefore depended on untracked schema, and the failure mode
was silent and non-uniform: the three fail-open routes became unmetered without
logging anything, while the two fail-closed routes returned 503 on every
request.

`src/__tests__/rate-limit-contract.test.js` now fails if any `.rpc()` call in
`src/` is not defined by a tracked migration. The exceptions are listed in that
file: `admin_set_professional_listing` and `sync_professional_listing_status`
live in the platform repository's migrations, and the two repositories share a
database. Add to that list only after confirming the function is defined in the
sibling repo's migrations.

## Proving SQL

Static assertions over a migration file cannot show that it executes, that its
privileges are right, or that its locking works. `npm run
verify:rate-limit-migration` runs the SQL against a real PostgreSQL engine
(PGlite) and checks behaviour and grants. It provisions PGlite into
`.pglite-verify/` rather than node_modules: a `--no-save` install into
node_modules is not resolvable from the process that just ran it, which is the
case the script exists to handle.

