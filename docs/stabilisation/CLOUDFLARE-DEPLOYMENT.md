# Valoria Cloudflare deployment contract

## Production Workers

| Worker | Repository | Root | Build output |
|---|---|---|---|
| `valoria-institute-site` | `riverwayse-sudo/valoria-site` | Repository root | OpenNext `.open-next/worker.js` and `.open-next/assets` |
| `valoria-assessment` | `riverwayse-sudo/valoria-platform` | `/valoria-final` | Vite `dist/` plus `worker.js` API router |

The public website route remains attached to `valoria-institute-site`. The assessment hostname remains attached to `valoria-assessment`.

## Build-time configuration

The site build requires:
- `NEXT_PUBLIC_SUPABASE_URL`: the Supabase project root URL, never the `/rest/v1` REST endpoint.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: the public anon key.
- `VALU_UPSTREAM_ORIGIN`: `https://assessment.valoriainstitute.com`.

The assessment build requires:
- `VITE_SUPABASE_URL`: the Supabase project root URL.
- `VITE_SUPABASE_ANON_KEY`: the public anon key.
- `VITE_VALU_API_ORIGIN`: `https://assessment.valoriainstitute.com`.
- `VITE_VALU_SITE_ORIGIN`: `https://www.valoriainstitute.com`.

These are Workers Builds variables. They are distinct from runtime bindings.

## Runtime configuration and secrets

- Keep Supabase service-role keys, Resend credentials, Anthropic credentials and cron secrets in Cloudflare Worker secrets only.
- Do not commit `.env` files or service-role keys.
- Production Worker deployments must use Wrangler's `--keep-vars` option so dashboard-managed runtime variables and secrets are retained.
- The site and assessment Workers must use the Supabase project root URL. The PostgREST `/rest/v1` path must never be used as the Supabase client base URL.

## Routing contract

- `valoria-institute-site` owns the public site and the narrow assessment proxy.
- `valoria-assessment` owns the Vite assessment assets and assessment API handlers.
- The assessment Worker strips the Vite `/valu/assessment` base path only when resolving static assets.
- API requests are dispatched to the assessment handlers before static asset fallback.
- Unknown `/api/*` paths return JSON 404; they must not silently return the SPA HTML.

## Release checks

1. Run the repository tests and production build.
2. Run the Cloudflare Worker dry-run bundle check.
3. Use a non-production Worker Preview to verify the app shell, nested JS/CSS assets, and API method routing.
4. Deploy the platform assessment Worker before the site proxy changes.
5. Deploy the site Worker only after the assessment upstream checks pass.
6. Verify the live Supabase Auth request targets `/auth/v1/token`, never `/rest/v1/auth/v1/token`.

Cloudflare Workers Builds uses `wrangler preview` for non-production branches and `wrangler deploy --keep-vars` for the production branch. Preview tests must not submit real participant data or write to the production assessment database.
