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
| Global content alignment and basic keyboard access | Implemented | Global stylesheet and regression tests cover all route content, cards, forms, CTAs, desktop dropdowns, nested links and mobile navigation. Added a site-wide skip link and reduced-motion support. Visual and assistive-technology verification at target widths remains required. |
| Typography foundation | Implemented | Single canonical Raleway request, shared approved weight/line-height tokens and automated design-check enforcement. Visual verification at target widths remains required. |
| Value proposition and conversion paths | Implemented | Validate buyer and professional journeys with stakeholders. |
| Assessment journey and session continuity | Code changes implemented across site/platform branches | Taster and Full VALU now share the left-alignment contract; regression coverage verifies the Full screen wrapper, progress labels and assessment navigation. Full staging E2E remains required: save/resume, confirmation, dashboard handoff and completion. |
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
- Current read-only production check: **17 non-test profiles**, **5 test-marked profiles retained internally for audit**, **0 test profiles in the public roster**, **5 registered-only roster entries**, and **0 public-visibility acknowledgements**. No test/generated profile is currently exposed in the public roster; the five internal records were not destructively deleted as part of this website release.
- **45 completed tasters** — 5 linked, 16 corroborated contact candidates available for confirmed-email recovery, and 24 unresolved identities held for manual review.

A taster-linked participant is assigned at least the Basic tier. A current Full VALU assessment keeps the participant at Full. Tier assignment and public visibility are separate: no participant's public consent is inferred or backfilled.

The five confirmed fabricated fixture accounts were removed from the public roster and hidden from listings. Historical records were retained for audit.

## 4. Methodology discrepancies requiring approval

The approved public PRIME content defines **17 skills**. The live assessment question bank and historical reports contain **18 scored skill labels**, including “Managing Ambiguity”. The current question bank also uses a taster selection that does not match the content brief's description of the taster's skill coverage.

No assessment question wording, selection, mapping, scoring weight or historical score was changed. Temitayo must confirm whether “Managing Ambiguity” is a supplemental measure or an obsolete extra skill, and approve any future assessment-engine changes.

Public website copy deliberately avoids assessment question counts and validity-check mechanics.

## 5. Decisions required from Valoria

Brand punctuation is resolved: the user accepted the 9 October 2026 Website Content Brief wording “Worth, Built.” The homepage, About, PRIME, VALU and footer now use that punctuation consistently. The April 2026 master brand PDF contains the earlier full-stop version; the later accepted brief governs current website copy.


1. Confirm the legal entity name used in the footer, About page, Terms, Privacy and contracts.
2. Approve the adapted About mission wording.
3. Confirm the public name and role for the Session 03 replay speaker/host.
4. Confirm Develop pricing and any certification claims.
5. Confirm the 17-versus-18 skill interpretation and taster skill coverage.
6. Approve a public seniority taxonomy before a seniority filter is introduced.
7. Confirm initial opportunity categories, buyer launch scope, commercial model and opportunity operations.
8. Confirm evidence and review standards for speakers and facilitators.

## 6. Repositories and release references

- Website: `riverwayse-sudo/valoria-site`, branch `fix/website-content-overhaul-alignment`, PR #204.
- Assessment/platform: `riverwayse-sudo/valoria-platform`, branch `fix/separate-taster-from-full-assessment`, PR #118.
- Database consent/RLS changes are coordinated through platform PR #118; site PR #204 contains the matching server-side profile projection and consent UI.

## Residual Supabase Auth security warning

- The production Supabase Security Advisor reports one external-facing warning: leaked-password protection is disabled. This does **not** mean a Valoria password has been breached; it means Supabase Auth does not reject passwords already present in known breach corpora.
- Supabase documents its native Have I Been Pwned password check as available on the Pro plan and above. The no-paid-tools constraint has been preserved; no Pro upgrade or account-plan change was made.
- The seven RLS-enabled/no-policy informational findings relate to private or service-role-only identity, review, acknowledgement and taster tables. They are intentionally not directly readable by client roles; retain that boundary.
- Free-tier mitigation is available: Auth settings can enforce a longer minimum password length and require digits, lowercase, uppercase and symbols. This setting was not inspected or changed in this pass; Supabase warns that existing users whose passwords fall below a strengthened policy may receive `WeakPasswordError` at sign-in, so test the impact before enabling it.
- Treat the leaked-password warning as a known residual risk requiring explicit owner acceptance or a separately approved security/plan change. Do not describe the production Auth configuration as having zero security warnings.

## 7. Validation and release boundary

- Main-site code head `58bdc30`: **15 test suites, 273 tests passed**; design check, production excellence gate, Next.js 15.5.29 build, OpenNext bundle and Cloudflare Worker validation/dry-run all passed. The Cloudflare Workers Build preview for this head remains queued; the last successful preview is on the earlier code head `cf424b5` and does not include the latest skip-link/reduced-motion changes.
- Platform head `1ac040a`: **30 test suites, 315 tests passed**; production build, secret scan, environment parity, Cloudflare Worker validation, Cloudflare Pages preview and Worker branch preview all passed.
- Both PRs remain open. No merge or production deployment is claimed.
- The production Cloudflare deploy workflow exists, but GitHub Actions receives Cloudflare error **9106** on the production Worker deployment request. The repository secret `CLOUDFLARE_API_TOKEN` must be replaced with a valid token that has `Workers Scripts:Edit` for this Cloudflare account and the `valoria-institute-site` Worker. Do not paste the token into chat; update it directly in the repository Actions secrets.
- Cloudflare Workers Builds is the release validation path. Vercel is not the release target; its Hobby build quota is exhausted, so no Vercel preview is being used for approval.
- Both Cloudflare previews intentionally use disabled Supabase/upstream values; the site preview also lacks the preview-only `CF_WORKERS` binding. They validate static UI/build only, not database-backed registration, consent, authentication or assessment integration.
- Staging E2E remains blocked until the matching site code is deployed to the isolated staging Worker. The staging database currently has no professional-profile rows and still uses the legacy consent RPC; do not apply the consent migration until the matching site code is deployed.
- Release gates still include the full registration → taster → account confirmation → dashboard → Full assessment → VALU report journey; desktop/mobile and accessibility review; GA4 receipt; post-release performance/indexability checks; and outstanding legal, editorial, commercial and 17-vs-18 methodology approvals.
