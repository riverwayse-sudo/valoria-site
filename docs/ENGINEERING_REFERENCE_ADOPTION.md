# Valoria Engineering Reference Adoption

This document makes the selected open-source references part of Valoria's delivery process without importing competing frameworks or weakening the existing design constitution.

## Adopted workflow references

### 1. UI/UX Pro Max
Reference: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

Use its design research and UX heuristics when planning or reviewing a UI change. Valoria's approved design tokens, Raleway typography, institutional tone, spacing rules, and existing component system remain authoritative. Do not copy a palette or visual system from a generated recommendation.

### 2. Impeccable
Reference: https://github.com/pbakaus/impeccable

Use critique and polish passes to review hierarchy, contrast, spacing, density, copy quality, responsive states, and generic AI-generated patterns. A review must name concrete defects and verify the correction; "looks better" is not an acceptance criterion.

### 3. shadcn/ui
Reference: https://github.com/shadcn-ui/ui

Adopt selectively, only when an accessible primitive solves a demonstrated gap. Do not replace Valoria's design system or import a full component library by default. Before adding a component, document the use case, dependency impact, keyboard behaviour, and visual mapping to the Valoria tokens.

### 4. OWASP ASVS
Reference: https://github.com/OWASP/ASVS

Use ASVS as the security-verification baseline. The companion checklist is in `docs/OWASP_ASVS_BASELINE.md`. Security checks must include both anonymous and authenticated access, and must test ownership boundaries rather than relying on authentication alone.

### 5. Aegis
Reference: https://github.com/tomodahinata/aegis

Aegis is an evaluation candidate, not an approved production dependency. Run it in a disposable environment against a reviewed schema snapshot. Review its licence, maintenance, supported Supabase versions, scanner rules, false positives, and any write permissions before enabling it in CI. Never give a third-party scanner production service-role credentials.

### 6. Official Supabase examples
Reference: https://github.com/supabase/supabase/tree/master/examples

Use official examples to review SSR authentication, session handling, Storage, and RLS patterns. Do not copy starter schemas or policies wholesale. Every policy change needs a least-privilege rationale and a regression test.

### 7. Playwright
Reference: https://github.com/microsoft/playwright

Use browser-level tests for real user journeys. A successful build is necessary but not sufficient. Critical journeys must verify visible content, working controls, correct route transitions, and no browser console/page errors.

### 8. axe-core
Reference: https://github.com/dequelabs/axe-core

Run automated accessibility checks as part of browser tests. Automated scans cover only a subset of accessibility defects; keyboard navigation, focus order, screen-reader behaviour, and manual contrast review still require human QA.

## Release contract

Every production-facing change follows this sequence:

1. Identify the user journey and expected behaviour.
2. Review the existing design, security, and data contracts before editing.
3. Implement on a feature branch; avoid unrelated refactors.
4. Run unit/static checks and the production build.
5. Run browser-level checks and accessibility scans for the changed surface.
6. Review the PR diff for data, policy, dependency, and environment changes.
7. Verify the preview deployment in a browser.
8. Promote only after critical journeys pass; inspect runtime errors after deployment.

## Explicit non-goals

- No blanket adoption of shadcn/ui.
- No Aegis production credentials or automatic policy rewrites.
- No new paid database or workflow service by default.
- No change to VALU scoring, PRIME definitions, eligibility, or marketplace rules through a UI-library adoption.
- No claim of full security or WCAG conformance based only on automated checks.
