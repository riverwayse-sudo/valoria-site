# Valoria Anti-Slop Protocol

Status: Mandatory engineering and design workflow policy  
Applies to: every page, component, content block, interaction, responsive change and visual refactor.

The anti-slop protocol prevents gradual quality decay: duplicated systems, arbitrary values, symptom patches, decorative noise, weak hierarchy and layouts that only work at one viewport.

## Non-negotiable rules

1. One source of truth. Tokens, components, motion and layout primitives are canonical. Do not create a competing local system.
2. Tokens before values. Use Valoria design tokens for color, spacing, typography, radii, elevation and motion. New values require a system-level reason.
3. Layout before decoration. Fix container, grid, sizing and hierarchy before adding visual treatment.
4. Component-owned geometry. A component owns its dimensions and responsive behavior. Avoid page-level overrides that repair child geometry.
5. No CSS archaeology. Do not stack overrides on top of old overrides. Remove the obsolete rule or refactor the owning primitive.
6. Responsive by construction. Mobile, tablet and desktop are first-class states, not post-build patches.
7. Content priority is structural. The hierarchy must survive a squint test: message → context → action.
8. Cards are not the default. Use a card only when containment improves comprehension or task completion.
9. Motion is purposeful. Motion communicates state, hierarchy or continuity. It must not exist merely to make a page feel premium.
10. Accessibility is part of quality. Keyboard access, focus states, semantics, contrast, reduced motion and readable type are release criteria.
11. Real content is the test. Do not validate a composition only with short placeholder copy.
12. Rendered truth is authoritative. Code inspection is necessary, but browser rendering at target breakpoints is the final UI authority.
13. Every value is justified. A new spacing, color, breakpoint, shadow, animation or component must have a reason that survives review.
14. No bypasses. No inline styles, !important, arbitrary legacy colors, cascade hacks or temporary exceptions to pass review.

## Required workflow

Research → Constitution → Architecture → Implementation → Anti-Slop Gate → Build → Browser Verification → Production Verification

### Before implementation

- Identify the user/job the page or component must serve.
- Identify the existing primitive that should own the change.
- Reuse the canonical token/component/layout system.
- Define responsive behavior before writing desktop CSS.
- Define what is intentionally not being added.

### During implementation

- Compose existing primitives before creating a new component.
- Prefer one clean rule over several corrective rules.
- Remove obsolete CSS when ownership changes.
- Keep content hierarchy explicit.
- Keep motion and interaction tied to a user purpose.

### Before merge

Run:

npm run anti-slop

npm test -- --runInBand

npm run build

Then verify the rendered page in a real browser at mobile and desktop breakpoints.

A PR is not ready because the build passes. It is ready when the system remains coherent, responsive and intentional after rendering.

## Automated hard stops

The CI anti-slop gate blocks:

- inline React styles;
- !important;
- raw six-digit hex colors outside token/theme/design-system files;
- legacy PRIME/accent color vocabulary;
- production console.log;
- positional nth-child / nth-of-type layout patches.

These are treated as system-level smells rather than isolated formatting issues.

## Human review gate

The PR author must be able to answer yes to all of these:

- Does this use an existing primitive where one exists?
- Is the visual hierarchy obvious without decorative treatment?
- Does the layout remain intentional at mobile and desktop?
- Did I remove obsolete code instead of layering a patch?
- Is every new value part of the design system or explicitly justified?
- Is motion meaningful?
- Does the page still work with real content?
- Is the change accessible?
- Have I inspected the rendered result rather than trusting source code alone?

If any answer is no, the work is not done.

## Quality standard

The objective is not less CSS or fewer components.

The objective is less accidental complexity and more deliberate design.

When a fix appears to require a special case, stop and ask:

What system is missing or incorrectly owned?

Fix that system instead of adding another exception.
