# Final QA and release gate

This gate applies to every production change to Valoria Institute. Use the UI/UX and Engineering Quality Standard (QUALITY_STANDARD.md) as the governing acceptance criteria.

## Required before release

- [ ] Change scope and affected user journeys are documented.
- [ ] P0/P1 defects are resolved; no known critical data, security or scoring issue is being waived.
- [ ] Unit, integration and regression tests pass on the release commit.
- [ ] Design and engineering checks pass.
- [ ] Production build and Cloudflare Worker validation pass.
- [ ] Affected critical journeys are exercised in the target environment.
- [ ] Desktop and mobile layouts are inspected; no clipped content or unintended overflow remains.
- [ ] Authentication, authorization, consent and data visibility are checked where affected.
- [ ] API smoke tests confirm expected success and unauthenticated/unauthorized behaviour.
- [ ] No secret, participant-private data or production credential appears in artifacts or logs.
- [ ] Deployment result, commit SHA and smoke-test evidence are recorded.

## Critical Valoria journey checks

When the change touches the relevant flow, test the complete path:
1. Homepage/discovery to taster entry.
2. Nine-question taster completion and handoff.
3. Registration, email confirmation and authenticated dashboard arrival.
4. Separate 58-question assessment save, resume and submission.
5. Canonical VALU Index / PRIME points and merit designation.
6. Profile completion, capabilities and consent.
7. Marketplace listing visibility and profile navigation.

The taster and full assessment remain separate. Do not expose internal question counts or percentage representations in participant-facing copy.

## Closure rule

A check is not complete because the code was edited, a PR merged or a build passed. Close only after the deployed behaviour has been verified for the affected journey. Record failed checks and reopen the issue rather than silently waiving them.
