# Valoria Component Change-Control Protocol

**Status:** Mandatory across valoria-site and valoria-platform. This protocol is the operational companion to `ENGINEERING_STANDARD.md`.

## 1. Core rule: protect verified work

A component that has passed its documented acceptance criteria is **VERIFIED — PROTECTED**. It must not be redesigned, refactored, replaced, reformatted wholesale, or behaviorally altered as collateral work in another task.

Protection is a change-control boundary, not a claim that the component can never change. A protected component may change only when:
- the requested work explicitly requires changing it; or
- a demonstrated defect, security issue, legal requirement, or approved dependency change requires it.

The change record must identify the reason, affected behavior, evidence, and approval. A nearby task or a preference for cleanup is not sufficient justification.

## 2. Component boundaries and ownership

Treat these as separately owned logical components, even where they share a repository or deployment:

| Component | Boundary / responsibility | Protected contract |
|---|---|---|
| Public website | Public pages, institutional content, global navigation and public presentation | Public routes, navigation behavior, content approvals and responsive behavior |
| VALU Taster | Taster entry, question bank/version, answer persistence, scoring and completion | Taster answers, version semantics, resume behavior and immutable completion snapshot |
| Authentication | Signup, sign-in, password lifecycle, session and email confirmation | Auth provider contract, redirect destinations, session semantics and account identity |
| Identity handoff | Claim/link a saved taster to the authenticated identity | Exact owner checks, idempotency, immutable source taster ID and conflict handling |
| Full VALU Assessment | Independent full assessment, checkpoint, save/resume and submission | Separate assessment record, answer integrity and resume contract |
| VALU Index | Authoritative PRIME points, dimension mapping and merit designation | Single source of truth, scoring boundaries and persisted result semantics |
| Dashboard | Authenticated participant status, results and next actions | Status derivation, route access and action destinations |
| Marketplace | Public/private profile projection, capabilities, search and visibility | Consent, eligibility, identity suppression and canonical designation |
| Email and notifications | Confirmation, transactional messages, reminders and delivery tracking | Sender identity, templates, recipient selection, idempotency and delivery-state semantics |
| Administration | Internal review, reconciliation and operational controls | Role authorization, auditability and separation from public presentation |
| Shared platform services | API contracts, database schema, RLS, Cloudflare Workers, queues and shared libraries | Versioned interfaces, security boundaries, migrations and compatibility |

This is a logical map, not permission to move files or create new services. Keep existing architecture unless a separately approved architecture change is necessary.

## 3. Component status register

Every component must have one explicit status:
- **VERIFIED — PROTECTED:** acceptance criteria and evidence are recorded; changes require the procedure in §4.
- **IN PROGRESS:** implementation is actively changing and has not met all acceptance criteria.
- **AWAITING VERIFICATION:** implementation exists but required tests or runtime evidence are outstanding.
- **BLOCKED:** a dependency, access restriction or unresolved defect prevents verification.

A component is not protected merely because code exists, a PR merged, or a build passed. The register must link the exact source commit/version, test evidence, owner, known limitations and dependencies. If evidence is missing, use **AWAITING VERIFICATION** or **BLOCKED**, never infer success.

## 4. Mandatory change procedure

Before editing:
1. Name the target component and the exact behavior being changed.
2. Read its current contract, status, owner, acceptance criteria and known dependencies.
3. Inspect the current implementation and baseline tests at the target commit.
4. Identify direct callers, shared modules, database objects, API contracts, email effects and deployment bindings that could be affected.
5. State what is explicitly out of scope. Protected neighboring components are out of scope unless evidence proves otherwise.

During implementation:
1. Make the smallest change that satisfies the requested outcome.
2. Keep changes within the target component boundary. Do not bundle unrelated cleanup, redesign, renaming, dependency upgrades or formatting.
3. Preserve existing public and internal contracts unless a versioned contract change is explicitly required.
4. Add or update a regression test at the boundary where the defect occurs.
5. Do not edit historical participant records, answers, scores, identity links or consent to make tests pass.
6. Use synthetic identities and isolated test data for end-to-end verification. Never use the owner or a real participant as a test subject without explicit authorization.
7. Do not send test email to real recipients; use a controlled sink or an explicitly authorized test recipient.

Before closing:
1. Run target-component tests.
2. Run contract tests for every changed boundary and regression tests for dependent components.
3. Run the applicable repository CI, security checks and production build.
4. Run isolated staging/browser acceptance for user-visible or stateful behavior where supported.
5. Verify the exact deployed commit and runtime only when deployment is explicitly authorized.
6. Record passed, failed, skipped and unverified checks separately. A skipped test is not a pass.
7. Confirm protected neighboring components remain unchanged, or explain and justify every necessary cross-boundary change.
8. Record rollback/recovery steps and the new source commit/version.

## 5. Shared dependency and cross-component changes

A change to a shared library, schema, migration, API, authentication contract, event, email template, Worker binding or global design token can affect multiple components. It is therefore a **cross-component change**, even if only one file is edited.

For cross-component changes:
- list every affected component and the dependency path;
- document backward compatibility and rollout order;
- test each affected contract, not only the file being changed;
- use additive, reversible migrations where possible;
- preserve old and new contract compatibility during staged rollout where feasible;
- coordinate site/platform release versions and Cloudflare Worker bindings;
- define rollback or forward-recovery before deployment.

Never claim compartmentalisation eliminates shared dependencies. It makes them explicit and testable.

## 6. Prohibited actions

Unless the user explicitly authorizes the specific action, do not:
- alter, reset, delete, merge, relink or fabricate participant data;
- change assessment questions, scoring, merit boundaries, consent or eligibility rules as part of unrelated work;
- change authentication, confirmation redirects or identity ownership while working on visual presentation;
- refactor a verified journey merely to make a separate feature easier;
- replace a working component with a new implementation without parity evidence;
- deploy, promote, migrate production or change secrets/DNS as an incidental step;
- mark a component protected without acceptance evidence;
- treat a green build, merged PR or successful deployment as proof of end-to-end correctness.

## 7. Emergency exception

A Critical security, privacy, data-integrity or availability defect may require an urgent change to a protected component. The exception must still be scoped, reviewed, tested and documented. If prior approval is not practical, record the emergency rationale and notify the owner promptly. Do not use the exception for cosmetic work or routine delivery pressure.

## 8. Required change record

Every PR that changes behavior must include:
- **Target component(s):**
- **Current status and baseline commit:**
- **Requested outcome / defect:**
- **In-scope behavior:**
- **Explicitly out of scope:**
- **Affected dependencies and neighboring components:**
- **Protected components inspected:**
- **Tests run and exact results:**
- **Unverified items and blockers:**
- **Data, consent, security and email side effects:**
- **Rollback / recovery:**
- **New commit and deployment status:**

A component becomes **VERIFIED — PROTECTED** only after its owner-approved acceptance criteria are met and evidence is recorded in the repository quality register. Until then, it remains unverified.

## 9. Relationship to the quality standard

This protocol supplements, and does not weaken, `ENGINEERING_STANDARD.md`. Where requirements conflict, follow the stricter security, privacy, data-integrity and release requirement. Repository quality registers remain the source of truth for current component status and evidence.
