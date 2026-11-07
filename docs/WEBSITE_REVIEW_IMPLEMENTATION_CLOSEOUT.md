# Valoria Website Review & Content Overhaul — Implementation Closeout

**Prepared:** 7 November 2026  
**Implementation owner:** Riverways  
**Status:** Code implementation substantially complete; release approvals and end-to-end verification remain open.

## Source documents

- `Valoria Website Content Overhaul.pdf`
- `Valoria Institute Website review.pdf`

This closeout separates implemented code from production state, unverified behaviour and decisions that require Valoria approval.

## 1. Website content overhaul

| Area | Implementation status | Notes |
|---|---|---|
| Homepage positioning | Implemented | Marketplace-first positioning; professional, employer, event-organiser and training-buyer pathways. |
| PRIME page | Implemented | Approved public 17-skill taxonomy; Enterprise theme is “How you create”; AI Fluency and Human-AI Collaboration marked Future-Ready. |
| VALU page | Implemented | Points-based explanation, five-cluster view, public skill lists, generic journey language. No question counts or validity-anchor mechanics in public copy. |
| About page | Implemented, approval pending | Africa-first positioning, Nigeria jurisdiction and 2028 continental expansion direction. Mission wording needs owner approval. |
| Valoria Develop | Implemented | Four development formats, proposed 70/20/10 learning model, programme enquiry with team/audience, PRIME cluster and timeline. Pricing and certification claims remain withheld. |
| Marketplace | Implemented | Canonical one-person/multiple-capabilities model; Basic and Full presentation; role, cluster, skill, sector and points-band filters. |
| ATB Connect | Implemented | Employer-facing capability-led discovery and tracked sourcing enquiry. |
| ATB Spotlight | Implemented | Speaker and facilitator discovery paths; event and training-buyer enquiry routes. |
| Buyer enquiries | Implemented | Guest and authenticated enquiries enter the admin Enquiry Queue. Profile-targeted enquiries are checked against consent-verified public profiles. |
| Opportunity discovery | Implemented | Homepage preview, public opportunities page, relevance signals and organisation submission-for-review path. Empty states reflect the current absence of published opportunities. |
| Footer and brand copy | Implemented | Marketplace positioning and approved “Worth, Built.” punctuation applied site-wide. |
| Terms and Privacy | Updated; legal approval pending | Disclosures updated for Basic/Full tiers, consent, analytics, hosting, video embeds, email and AI report processing. |

## 2. Website experience review

| Review area | Implementation status | Remaining verification |
|---|---|---|
| Information architecture and navigation | Implemented | Browser walkthrough on desktop and mobile. |
| Value proposition and conversion paths | Implemented | Validate buyer and professional journeys with stakeholders. |
| Assessment journey and session continuity | Code changes implemented across site/platform branches | Full staging E2E: save/resume, confirmation, dashboard handoff and completion. |
| Marketplace and profile quality | Implemented | Existing participants must complete profile/evidence requirements and choose public visibility. |
| Opportunities and matching | Implemented where supported | No live opportunity supply exists; matching relevance needs real listings to validate. |
| Application and enquiry tracking | Implemented | Exercise a real buyer submission and admin review in staging. |
| Analytics | Events implemented | Confirm GA4 receipt and event naming in the live property after release. |
| Accessibility and responsive behaviour | Contract/static checks included | Manual keyboard, screen-reader and mobile-device review remains outstanding. |
| Performance and SEO | Metadata, canonical routes and content alignment updated | Run post-deploy Lighthouse/Core Web Vitals and indexability checks. |

## 3. Marketplace tier and taster reconciliation

The current private production roster was verified read-only:

- **3 Basic** — completed taster linked to an authenticated account, with no current Full VALU assessment.
- **2 Full** — current Full VALU assessment; evidence readiness does not downgrade their tier.
- **5 registered-only** — all five remain private until their owners explicitly choose public visibility.
- **0 public-listed** — no current public-visibility acknowledgements.
- **45 completed tasters** — 5 linked, 16 corroborated contact candidates available for confirmed-email recovery, and 24 unresolved identities held for manual review.

A taster-linked participant is assigned at least the Basic tier. A current Full VALU assessment keeps the participant at Full. Tier assignment and public visibility are separate: no participant's public consent is inferred or backfilled.

The five confirmed fabricated fixture accounts were removed from the public roster and hidden from listings. Historical records were retained for audit.

## 4. Methodology discrepancies requiring approval

The approved public PRIME content defines **17 skills**. The live assessment question bank and historical reports contain **18 scored skill labels**, including “Managing Ambiguity”. The current question bank also uses a taster selection that does not match the content brief's description of the taster's skill coverage.

No assessment question wording, selection, mapping, scoring weight or historical score was changed. Temitayo must confirm whether “Managing Ambiguity” is a supplemental measure or an obsolete extra skill, and approve any future assessment-engine changes.

Public website copy deliberately avoids assessment question counts and validity-check mechanics.

## 5. Decisions required from Valoria

1. Confirm the legal entity name used in the footer, About page, Terms, Privacy and contracts.
2. Approve the adapted About mission wording.\n3. Confirm the current registered brand punctuation: the October developer brief says “Worth, Built.” per Brand Guidelines v4, while the April master brand PDF supplied in the library says “Worth. Built.” The later comma version has been applied; the referenced v4 master was not available in the library for direct verification.
4. Confirm the public name and role for the Session 03 replay speaker/host.
5. Confirm Develop pricing and any certification claims.
6. Confirm the 17-versus-18 skill interpretation and taster skill coverage.
7. Approve a public seniority taxonomy before a seniority filter is introduced.
8. Confirm initial opportunity categories, buyer launch scope, commercial model and opportunity operations.
9. Confirm evidence and review standards for speakers and facilitators.

## 6. Repositories and release references

- Website: `riverwayse-sudo/valoria-site`, branch `fix/website-content-overhaul-alignment`, PR #204.
- Assessment/platform: `riverwayse-sudo/valoria-platform`, branch `fix/separate-taster-from-full-assessment`, PR #118.
- Database consent/RLS changes are coordinated through platform PR #118; site PR #204 contains the matching server-side profile projection and consent UI.

## 7. Validation and release boundary

- Latest completed site unit tests, static checks, validation and secret scan passed.
- Latest completed platform unit tests, production build, secret scan, environment parity and Cloudflare checks passed.
- The newest site build and Cloudflare Worker checks must be green before the branch is described as fully validated.
- Both PRs remain open. No merge or production deployment is claimed.\n- A fresh Vercel preview for the latest code commit could not be created: the Vercel Hobby team's free deployment quota is exhausted for 24 hours. The newest existing READY preview is behind the latest code and should not be used for final approval. Preview deployments are also SSO-protected on the current project settings.
- Do not release until methodology/copy/legal approvals are obtained, the consent-aware RLS migration is coordinated, and the full assessment-to-dashboard-to-profile journey is tested.
