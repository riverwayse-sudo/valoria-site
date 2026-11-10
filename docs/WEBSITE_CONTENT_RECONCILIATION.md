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
| Homepage | Clear global-facing proposition, Africa-first scope, taster CTA, concise problem/standard/path/proof/opportunity story | Hero updated to the capability-led proposition; profile module suppresses unverified counts | Hero and section order communicate the full proposition; no unsupported live-count claim; mobile CTA works |
| PRIME | Five clusters, canonical 17 skills, points language and current designations | Skill list is drawn from src/lib/brand.js; designation block still contains legacy labels | Validate current designation names and scoring mapping across website and platform before publishing |
| VALU Index | Explain value and outcome; taster is separate from full assessment | Public copy simplified to three user-facing stages | No internal mechanics, no “1 of 9/58”, no percentages; taster and full assessment remain distinct |
| About | Explain why Valoria exists, institutional role and operating footprint | /about-us route exists; Africa-first/Nigeria jurisdiction/2028 wording and Marketplace terminology updated | No unconfirmed leadership or legal-entity claims |
| Develop | Merge overlapping programmes/facilitator messaging; distinguish proposed from available | Page labels formats enquiry-led or in development; no prices | No certification or 90-day claims; only confirmed programmes and commercial terms |
| Marketplace | Quality-controlled real profiles and accurate access language | Public data component filters incomplete/placeholder records and hides unverified count | Verify live data, consent and profile quality before displaying any count or profile |
| ATB Connect | Buyer access and capability discovery without implying unavailable search | Enquiry-led buyer access with profile discovery where inventory exists | Search is only advertised as live when the real buyer search journey works |
| ATB Spotlight | Speaker/facilitator discovery; certification claims only after certification | Current copy correctly says facilitator certification remains in development | No certified label until certification is complete; real profile evidence only |
| Navigation/footer/legal | Correct destinations, privacy/terms, legal name and consistent naming | Needs a route-by-route link and legal-identity check | No 404s; legal entity confirmed before footer/legal publication |

## Known blockers — do not paper over

- The PRIME page currently displays legacy designation labels (Elite, Distinguished, Proficient, Standard) and says there are four. The current agreed designation set has five names. Do not publish a replacement mapping until the score thresholds and runtime designation logic are reconciled across the site and platform.
- The legal entity name and approved public mission/vision/purpose wording must be confirmed against the current institutional source of truth before final publication.
- Marketplace counts, profile consent and buyer search availability require live verification; code-level placeholders are not proof of live capability.

## Release rule

All changes remain on the Cloudflare staging environment until the page, mobile, navigation, accessibility, data-quality and journey checks pass. No Vercel operations and no production promotion as part of this staging pass.
