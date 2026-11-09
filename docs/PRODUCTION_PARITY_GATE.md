# Production parity gate

Production promotion must use the approved Cloudflare release path and the exact reviewed commit.

## Parity requirements

- Site and assessment Worker environments point to their intended production services and bindings.
- Staging-only banners, flags, URLs, credentials and data sources are absent from production output.
- Production uses the production assessment Worker; staging origins are not accepted by production APIs.
- Public profile visibility remains consent-gated and uses the approved server-side projection.
- Authentication, CORS, route rewriting and API forwarding are checked across the site/assessment boundary.
- No Vercel deployment route or fallback is introduced; Cloudflare remains the deployment target.
- Production secrets are configured in Cloudflare/GitHub environments, never committed or printed in build logs.
- No production data, participant records or schema is mutated by a visual audit.

## Verification

1. Confirm the commit SHA and reviewed pull request.
2. Confirm all required CI checks pass for that SHA.
3. Confirm Cloudflare deployment targets and service bindings.
4. Smoke-test public routes and expected protected API responses.
5. Exercise affected authenticated journeys using approved test accounts.
6. Inspect production desktop/mobile rendering for the changed routes.
7. Record deployment run, test evidence and any accepted limitations.

A production deployment is not considered verified solely because the Worker deployment command succeeded.
