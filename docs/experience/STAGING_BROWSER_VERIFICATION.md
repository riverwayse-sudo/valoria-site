# Valoria staging browser verification

**Date:** 6 November 2026  
**Environment:** Cloudflare Workers staging only  
**Site:** https://staging.valoriainstitute.com  
**Assessment:** https://assessment-staging.valoriainstitute.com  
**Branch:** `experience/staging-redesign-20261106`

## Deployment evidence

| Application | Cloudflare build | Result | Source |
|---|---|---|---|
| Site | `23d65d65-2c57-4f73-aef9-1a1acea4af4c` | Success | `d3d1bde1643cb55c89adf81c736f01ecb0274f9a` |
| Assessment platform | `697452c3-506d-4024-a2aa-7b13e8439c1f` | Success | Staging branch head at build time |

The site was built with OpenNext for Cloudflare. The assessment platform build ran its Jest suite and production build. Both deployments use staging configuration, not production configuration.

## Automated checks

| Repository | Test suites | Tests | Build |
|---|---:|---:|---|
| `valoria-site` | 14 passed | 247 passed | OpenNext build completed |
| `valoria-platform` | 28 passed | 306 passed | `npm run build` completed |

The site OpenNext build emits duplicate JSX `className` property warnings on some existing pages. They are non-blocking and did not prevent the build or the verified routes from rendering. They remain cleanup work.

## Browser verification

Playwright Chromium checks were run against the live Cloudflare staging domains at desktop (1440×960) and mobile (390×844).

### Site routes

The following routes returned HTTP 200 at both viewport sizes:

- `/` — marketing homepage
- `/valu` — VALU overview
- `/valu/start` — VALU entry / conversion page
- `/prime` — PRIME framework
- `/dashboard?preview=1` — isolated dashboard preview
- `/about-us` — institutional information
- `/events` — events

No horizontal overflow or JavaScript page errors were detected on these routes. Internal Valoria links on the tested pages stay in the current tab. External YouTube links remain external.

### Assessment journey

The following journey was exercised in the browser:

1. Open the dashboard preview.
2. Activate **Start the VALU Taster**.
3. Answer through the taster.
4. Reach the account handover.
5. Open the full assessment preview.
6. Advance through all formal assessment questions.
7. Complete the local-only preview.

The taster-to-formal handover and the full assessment preview both rendered and advanced correctly. The full assessment preview reached its completion state after all answers were entered. No question-count progress labels were displayed.

### Mobile checks

At 390×844:

- Dashboard preview and its taster CTA rendered without horizontal overflow.
- The taster and account handover rendered without horizontal overflow.
- The full assessment advanced after selecting an answer.
- The tested marketing, VALU, PRIME, dashboard, about and events routes rendered without horizontal overflow.
- No JavaScript page errors were detected.

### Data isolation

The preview banner is visible and the preview uses placeholder/disabled Supabase configuration. Browser checks observed no requests to taster-progress, taster submission, formal assessment progress, or formal assessment submission APIs. The full assessment preview explicitly states that no official VALU Index was calculated, no participant record was created, and no answers were sent or saved.

No production participant data was used or changed. No production deployment or merge to `main` was performed.

## Staging links

- [Marketing site staging](https://staging.valoriainstitute.com)
- [Assessment staging](https://assessment-staging.valoriainstitute.com)
- [Site staging branch](https://github.com/riverwayse-sudo/valoria-site/tree/experience/staging-redesign-20261106)
- [Platform staging branch](https://github.com/riverwayse-sudo/valoria-platform/tree/experience/staging-redesign-20261106)

## Remaining non-blocking work

- Clean up duplicate JSX `className` properties reported by the OpenNext bundler.
- Continue the next product iteration on dashboard data-driven states, member opportunities, and end-to-end authenticated journeys. Those authenticated journeys are intentionally not simulated with production credentials in this preview.
