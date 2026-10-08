# Authentication Security — Current Plan

Valoria remains on the current Supabase plan. We do **not** rely on Supabase Pro-only leaked-password protection.

## Compensating controls

- Application password policy: 12+ characters, uppercase, lowercase, number and symbol.
- Common-password denylist for the most obvious reused credentials.
- Supabase Auth remains the credential authority; Valoria never stores password hashes.
- Supabase Auth rate limits remain enabled for signup, sign-in, recovery and token endpoints.
- Password recovery uses Supabase's single-use recovery flow.
- Sensitive database operations remain protected by RLS and server-side authorization.
- Privileged Supabase credentials are never permitted in client modules by the Excellence Gate.

## Explicit limitation

Supabase's native Have I Been Pwned leaked-password protection is a Pro-plan feature. It is therefore **not enabled** on this project and must not be represented as enabled.

The application-side password policy is a compensating control, not an equivalent implementation of HIBP checking. Direct Supabase Auth requests can still bypass client-side validation, so the project retains this limitation in its security register.

## Operational controls

Before production release, verify:

1. Supabase Auth rate limits are configured appropriately.
2. Email confirmation is enabled for password accounts.
3. CAPTCHA/abuse protection is enabled if traffic or abuse risk warrants it.
4. Project owners use MFA.
5. Security Advisor has no new high/critical database findings.

## Scope rule

Do not upgrade the Supabase plan solely to close the leaked-password advisory unless project scope and budget are explicitly changed.
