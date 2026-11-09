# Valoria UI/UX and Engineering Quality Standard

Version: 1.0  
Status: Proposed release standard  
Applies to: Valoria Institute website, assessment experience, dashboard, marketplace, APIs and operational tooling  
Operating constraints: Existing Cloudflare infrastructure; no paid dependencies, subscriptions, credits or platform upgrades without explicit approval.

## 1. Quality objective

Valoria must be visually coherent, usable, accessible, secure, reliable and maintainable. A feature is not complete because it renders or because its pull request merges. Completion requires evidence that the relevant user journey works in the deployed environment and that adjacent journeys have not regressed.

The rendered production experience is the final authority for production acceptance. Source code and CI results are necessary evidence, but do not independently prove the user experience.

## 2. Non-negotiable product principles

- Preserve the approved Valoria identity and institutional tone.
- Use the canonical design and motion constitutions; do not introduce competing token systems.
- Keep content readable. Never hide, clip, truncate or squeeze meaningful content to preserve a visual composition.
- Design for desktop, tablet and mobile; mobile is not a reduced afterthought.
- Every screen has a clear hierarchy, purpose and primary action.
- Interaction states are explicit: loading, success, empty, error, disabled and permission-denied.
- Motion must communicate state or continuity, respect reduced-motion preferences and never block comprehension.
- Use semantic HTML, visible focus states, keyboard-operable controls and accessible names.
- Never expose privileged credentials or private participant information in client code or public routes.
- Prefer the smallest safe change. Avoid speculative rewrites, duplicate frameworks and unnecessary dependencies.

## 3. Critical user journeys

These journeys are release-critical and must be tested end-to-end when affected:

1. Public discovery: homepage, navigation, opportunities/events and calls to action.
2. Taster: the separate nine-question experience, completion and correct handoff.
3. Registration and confirmation: account creation, email confirmation and authenticated dashboard arrival.
4. Full assessment: the separate 58-question assessment, save/resume, submission and duplicate-submit protection.
5. Results: canonical VALU Index and PRIME points, correct merit designation, no percentage substitution or internal question-count disclosure.
6. Professional profile: identity, consent, capabilities and eligibility.
7. Marketplace: correct approved profiles, truthful empty states, visibility consent and all applicable capabilities.
8. Administration: authorized access, reconciliation and auditability.

Do not merge the nine-question taster into the 58-question full assessment. Do not expose internal question counts or progress labels to participants.

## 4. Severity and response

| Severity | Definition | Release rule |
|---|---|---|
| P0 — Critical | Data exposure/loss, auth bypass, corrupted scoring, production outage or unsafe public disclosure | Stop release; immediate containment |
| P1 — High | A critical journey cannot be completed, assessment cannot save/submit, incorrect results, or core marketplace/profile failure | Must be fixed and verified before release |
| P2 — Moderate | Material responsive, accessibility, navigation or interaction defect with a workaround | Fix before release where user impact is material; otherwise record an owner and due date |
| P3 — Low | Cosmetic inconsistency or low-impact refinement | Backlog; must not delay P0–P2 closure |

Every issue record must contain: unique reference, affected route/journey, severity, reproduction steps, expected and actual result, root cause, smallest safe fix, test evidence, deployment reference and closure status.

## 5. UI/UX acceptance

For every affected route, inspect representative desktop (1440px), tablet (768px) and mobile (390px) widths. Add narrower/wider viewports when the layout warrants it.

Acceptance checks:
- No unintended horizontal page overflow.
- No clipped text, hidden controls or cards with inaccessible content.
- No overlapping, distorted or squeezed content.
- Navigation, dropdowns, dialogs and forms work with pointer, touch and keyboard.
- Primary actions are identifiable and operable.
- Focus indicators and accessible names are present.
- Contrast meets WCAG 2.2 AA for applicable text and controls.
- Reduced-motion preference is respected.
- Loading, empty, success and error states are understandable.
- No broken links, dead buttons or unexplained layout shifts.

A screenshot is evidence of appearance, not proof that an interaction works. Pair visual inspection with interaction tests.

## 6. Engineering acceptance

- Locked dependency installation (npm ci) and reproducible builds.
- Unit, integration and regression tests for affected behaviour.
- Contract tests for API request/response and authorization boundaries.
- Type/lint/static checks where configured; no new ignored failures.
- Security review for authentication, authorization, RLS, input validation and data exposure.
- No secrets in source, logs, screenshots, artifacts or client bundles.
- No production database mutation as part of visual QA.
- No schema migration or production data correction without a separately reviewed plan and explicit authorization.
- Cloudflare configuration and service bindings must be preserved and validated.
- Deployment must have a clear smoke test and rollback path.

## 7. Required release evidence

A release candidate is accepted only when the applicable evidence is recorded:

1. CI checks pass on the exact commit being released.
2. Relevant unit and regression tests pass.
3. Production build and Worker validation pass.
4. Critical journey tests pass in the target environment.
5. Browser checks cover desktop and mobile; screenshots are retained for review where available.
6. API smoke checks confirm expected public and unauthorized responses.
7. No unresolved P0/P1 issue remains.
8. Deployment identity and post-deploy smoke results are recorded.
9. Any known P2/P3 exceptions have an owner and follow-up date.

A merged PR, successful build, or green deployment workflow alone is not a closure signal.

## 8. Performance and accessibility measurement

Capture a baseline before setting hard performance budgets. Track Lighthouse and field Core Web Vitals where measurement is available.

Reference Core Web Vitals good thresholds:
- LCP: 2.5 seconds or less
- INP: 200 milliseconds or less
- CLS: 0.1 or less

Targets such as Lighthouse 90+ performance and 95+ accessibility are improvement goals, not grounds for claiming compliance without an actual run. Report the tested URL, device profile, run date and result. Do not add a paid monitoring service to meet these goals.

## 9. Release workflow

Identify → Reproduce → Classify → Fix → Test → Review → Deploy → Verify → Close

- Keep one authoritative issue register; do not create duplicate tickets for the same defect.
- Batch only changes that share a root cause or can be safely verified together.
- Keep unrelated visual polish out of critical bug-fix branches.
- Use isolated staging for preview and browser review.
- Production promotion is deliberate; do not bypass required approvals or environment guards.
- If verification fails, reopen the issue and record the observed failure. Do not relabel it as complete.

## 10. Cost and scope guardrails

Use existing GitHub Actions, Playwright already installed ad hoc in CI, Lighthouse where available, Cloudflare observability and current project tooling. Do not add a paid SaaS, paid runner, new hosting platform, new database tier or dependency solely for this standard. Stop before any action that could incur a charge or consume a paid allowance.

## 11. Review cadence

- Each change: apply the release gate and capture evidence.
- Weekly: review open P0–P3 defects, recurring regressions, failed checks and production incidents.
- Monthly: review accessibility, performance baseline, dependency/security posture and accumulated technical debt.

The weekly review is an operating review, not permission to make unapproved production changes.
