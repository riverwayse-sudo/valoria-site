# Valoria website content reconciliation — staging

**Source documents**
- Valoria Institute Website Review (4 November 2026): governing strategy and product experience.
- Valoria Website Content Overhaul (5 November 2026): page-level copy and implementation order.

## Reconciled decisions

1. Position Valoria as a professional capability institution and capability-led talent marketplace; do not present it as LinkedIn, a speaker bureau, or a generic jobs board.
2. Lead with the professional problem and outcome. The homepage hero uses the central idea: “Capability should decide who gets seen.”
3. Africa is the first market; Nigeria is the initial operating jurisdiction. Continental expansion is a 2028 priority. Do not imply availability in markets where Valoria is not operating.
4. Keep the 9-question taster separate from the full 58-question assessment. Do not describe the taster as the first part of the full assessment, and do not expose internal onboarding mechanics or question-count progress labels in public copy.
5. VALU results are expressed in points, never percentages.
6. PRIME has five clusters and seventeen canonical skills. Use the canonical list from the current brand source of truth.
7. Do not claim independent validation, facilitator certification, 90-day remeasurement, cohort reporting, confirmed programme delivery, or unapproved prices.
8. Publish professional counts only when the entire public roster has been verified. Public profiles must be complete, quality-checked and explicitly consented.
9. Use “Valoria Marketplace”; remove “Registry” as a product name and remove “Bureau” as a product label.
10. Use only confirmed leadership identities and legal-entity details. Do not invent mission/vision language or governance credentials.

## Page-by-page implementation and acceptance

| Area | Required outcome | Current staging finding | Acceptance |
|---|---|---|---|
| Homepage | Clear global-facing proposition, Africa-first scope, taster CTA, concise problem/standard/path/proof/opportunity story | Capability-led hero and approved problem statement; Africa-first metadata; three audience routes; taster → full assessment → profile → discoverability sequence in the professional entry copy; profile module suppresses unverified counts | Desktop/mobile visual review remains; no unsupported live-count claim; CTA and homepage route checks pass |
| PRIME | Five clusters, canonical 17 skills, points language and current designations | Canonical 17 skills and five approved designation bands now appear on PRIME; site and platform scoring/report helpers use the same point boundaries | Boundary tests pass across both repositories; visual review remains |
| VALU Index | Explain value and outcome; taster is separate from full assessment | Page headline now reads “Know where you stand, in points”; taster and separate full assessment are explained in three user-facing stages; assessment Worker deployed | No internal progress labels or percentages; live participant journey still requires a real-user acceptance check |
| About | Explain why Valoria exists, institutional role and operating footprint | /about-us now uses the approved story and plainly distinguishes Valoria from recruitment agencies, training companies, speaker bureaus, certification bodies and jobs boards; Africa-first/Nigeria/2028 wording retained | Exact mission/vision/purpose wording, legal entity and named governance roles still require source-of-truth confirmation |
| Develop | Merge overlapping programmes/facilitator messaging; distinguish proposed from available | `/programmes` and `/facilitators` redirect to `/develop`; the page contains the four proposed PRIME formats and the proposed 70/20/10 learning mix; certification remains in development | No facilitator certification, 90-day remeasurement or unconfirmed prices are claimed; delivery and commercial terms remain enquiry-led |
| Marketplace | Quality-controlled real profiles and accurate access language | Public data component filters incomplete/placeholder records and hides unverified count; filters cover PRIME cluster, skill, sector, seniority and declared role; summaries remain sourced from the VALU report; staging database has no completed assessment/profile rows to publish | Verify intended real profiles, consent, quality and buyer search; top development area is not shown because no approved field exists in the public roster schema |
| ATB Connect | Buyer access and capability discovery without implying unavailable search | Enquiry-led buyer access with profile discovery where inventory exists | Search is only advertised as live when the real buyer search journey works |
| ATB Spotlight | Speaker/facilitator discovery; certification claims only after certification | Current copy correctly says facilitator certification remains in development | No certified label until certification is complete; real profile evidence only |
| Navigation/footer/legal | Correct destinations, privacy/terms, legal name and consistent naming | Route smoke test passed across the main public pages; legal copy remains subject to entity confirmation | No 404s in staging route sweep; legal entity must be confirmed before footer/legal publication |

## Confirmed five-band VALU designation standard

| Designation | Points | Marketplace implication |
|---|---:|---|
| Force to Align With | 80–100 | Eligible, subject to profile and governance checks |
| Emerging Force | 65–79 | Eligible, subject to profile and governance checks |
| Developing Professional | 50–64 | Eligible, subject to profile and governance checks |
| Building Foundations | 35–49 | Eligible, subject to profile and governance checks |
| At the Starting Point | Below 35 | Not eligible for public listing; development is the first step |

Designation is an assessment result, not a subscription tier or certification. Marketplace eligibility is separate from actual listing and public discoverability.

## Staging verification record — 10 November 2026

**Staging PRs merged into the staging branches only:**
- Website PR [#314](https://github.com/riverwayse-sudo/valoria-site/pull/314), merge commit `dbac7d7f47c0a11ccf76380740619f213eb38c29` (initial copy/assessment clarity and API safety).
- Website PR [#317](https://github.com/riverwayse-sudo/valoria-site/pull/317), merge commit `63cd43504eb5b30ac0797f9c06ec9a5d5b315069` (final content brief alignment and seniority filter).
- Assessment platform PR [#163](https://github.com/riverwayse-sudo/valoria-platform/pull/163), merge commit `e48a2defc97297614ceaed1c2cb355511c5107d9`.

**Cloudflare staging deployments:**
- Website Worker `valoria-staging-site`: version `a1a5e294-36b5-4752-87dc-ea7dcd59e230`, 100% traffic.
- Assessment Worker `valoria-staging-assessment`: version `0c491cf8-5387-482c-b6ed-245671134b65`, 100% traffic.

**Automated verification:**
- Website: 23 Jest suites passed; 315 tests passed; production dependency audit, production build, Cloudflare bundle validation and staging route/SEO smoke tests passed.
- Assessment platform: 36 Jest suites passed; 341 tests passed; Worker routing, build, Cloudflare deployment and assessment entry/CORS smoke tests passed.
- Staging API boundary: unauthenticated VALU handoff returns 401; unauthenticated taster linking returns 401; opportunity browsing returns 503. Only the three authenticated assessment-handoff endpoints are allow-listed.
- Homepage routes now present three audiences: professionals, employers, and event organisers/facilitators/training buyers. The About, PRIME and VALU page copy matches the approved brief. Legacy `/programmes` and `/facilitators` URLs redirect to the canonical `/develop` page.
- `robots.txt`, sitemap, `llms.txt`, CSS asset delivery and the required public route sweep passed.

**Staging data migration:**
- Migration `20261110074520_align_valu_five_designation_bands_20261110` was applied to the confirmed `valoria-staging` Supabase project.
- The affected assessment/profile tables contained no completed assessment/profile rows to relabel; no participant records were changed.
- The production Supabase project and production Cloudflare Workers were not changed.

**Release boundary:** this is a staging close-out, not production approval. No Vercel operations were performed.

## Known blockers — do not paper over

- Manual visual review of desktop/mobile page layouts, especially the new PRIME designation grid, three-route homepage and seniority filter, remains outstanding.
- The brief requests a top development area on each Marketplace card, but the public roster schema has no approved top-development-area field. Do not infer it from the lowest cluster score; add an approved VALU-report field before displaying it.
- The legal entity name and approved public mission/vision/purpose wording must be confirmed against the current institutional source of truth before final publication.
- The Marketplace brief requests a top development area on every card. The staging public-roster schema has no approved field for this value; do not derive it from the lowest cluster score without confirmation from the VALU report specification.
- Marketplace counts, profile consent and buyer search availability require live verification; code-level placeholders are not proof of live capability.

## Release rule

All changes remain on Cloudflare staging until manual visual review, real-user journey acceptance, profile consent/data verification, buyer-search verification and legal-entity confirmation pass. No Vercel operations and no production promotion as part of this staging pass.
