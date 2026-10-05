# Valoria Design Constitution

Version: 1.0
Status: Enforced on staging before production promotion

## 1. Purpose

Valoria's interface is an institutional product, not a collection of decorative pages. Every screen must communicate hierarchy, trust, capability and a clear next action.

The rendered browser is the final authority. Source code, design files and CSS are inputs; they are not proof that a page is acceptable.

## 2. Core principles

1. One source of truth — tokens and component contracts are authoritative.
2. Layout before decoration — solve geometry before visual polish.
3. Components own their geometry — pages compose components; they do not secretly repair them.
4. Tokens before arbitrary values — colours, spacing, type, radius and elevation use shared tokens.
5. No override archaeology — a new rule must not compensate for an unexplained older rule.
6. Responsive by construction — desktop, tablet and mobile are deliberate states of the same system.
7. Content has priority — text must remain readable and must never be squeezed to preserve a visual shape.
8. Accessibility is a release requirement — contrast, focus, semantics, keyboard use and touch targets are part of quality.
9. Real rendering is the authority — every important route is checked in a real browser at representative viewports.
10. Every exception must be explainable — intentional exceptions are documented beside the component or rule.

## 3. Valoria visual tokens

Primary:
- Deep Midnight: #1A1A2E
- Gold: #C9A84C
- Slate Indigo: #2E2E4A
- Warm Parchment: #F7F4EE
- Antique Linen: #EDE8DC
- Subtle Brass: #D4C9A8
- Ivory White: #FAFAF7

Do not introduce legacy teal, purple, coral, amber or unrelated blue/purple PRIME colour systems.

## 4. Layout quality gates

Every major section must satisfy:
- no horizontal overflow at supported widths;
- no clipped text;
- no collapsed or squeezed content blocks;
- no distorted SVG or media;
- predictable container width;
- deliberate vertical rhythm;
- readable line lengths;
- usable mobile stacking;
- primary action remains visible and identifiable;
- no layout repair through unexplained negative margins or transforms.

## 5. Component contract

A major component must define:
- purpose;
- required content;
- layout model;
- responsive behaviour;
- minimum usable dimensions;
- interaction states;
- accessibility requirements.

Page-level CSS may compose a component but must not redefine its internal geometry without a documented reason.

## 6. CSS rules

Prefer:
- tokens;
- component classes;
- explicit responsive breakpoints;
- semantic states.

Avoid:
- !important as a general layout mechanism;
- duplicate selectors across CSS files;
- arbitrary negative margins;
- transform-based alignment;
- fixed heights for content-bearing components;
- page-specific overrides that repair legacy component styles;
- hard-coded colours where a Valoria token exists.

Existing legacy CSS may remain temporarily during migration, but new work must not increase dependency on it.

## 7. Accessibility

Release gates include:
- WCAG AA contrast target for normal text;
- visible keyboard focus;
- semantic headings and landmarks;
- buttons and links with meaningful names;
- touch targets suitable for mobile use;
- reduced-motion consideration for animated interfaces;
- form labels and error states.

## 8. Browser verification

At minimum, inspect:
- desktop: 1440px;
- laptop: 1280px;
- tablet: 768px;
- mobile: 390px.

Check both geometry and hierarchy. A passing build is necessary but insufficient.

## 9. Production gate

A homepage change is production-ready only when:
1. design audit passes;
2. Next.js build passes;
3. staging deployment is READY;
4. browser verification passes;
5. no known regression remains in another breakpoint;
6. the change can be explained as a coherent design decision.

## 10. Enforcement

Use:
npm run design:check

The checker should fail on new violations that are mechanically detectable. Browser verification remains required for defects that static analysis cannot reliably detect.

## 11. Current homepage standard

The homepage should have a clear sequence:
Hero -> Start Here -> VALU conversion -> Registry proof -> Footer.

Removed sections must not return merely because legacy CSS still exists.

The VALU conversion card is a component, not a page-specific SVG experiment. Its geometry, labels, steps and CTA must remain stable across breakpoints.

## 12. Decision rule

When a design choice conflicts with a local visual preference, choose the option that improves:
1. comprehension;
2. hierarchy;
3. accessibility;
4. consistency;
5. maintainability;
6. conversion clarity.

Premium means controlled, not complicated.


## 13. Hard enforcement standard

This constitution is a **release control system**, not design guidance.

A change is rejected when it violates an enforceable rule. Developers must not bypass a failed design check to preserve a local visual result.

### Mandatory ownership

- **Layout:** component/home CSS.
- **Motion:** `src/styles/motion.css` only.
- **Tokens:** canonical variables only where a token exists.
- **Journey/business state:** canonical data/state engine, never component-local inference.
- **Responsive behaviour:** component contract + explicit breakpoint rules.
- **Validation:** automated design gate first, real-browser verification second.

### Prohibited escape routes

The following are not acceptable fixes:

- adding another stylesheet to override an existing stylesheet;
- adding inline `<style>` blocks to a component;
- adding arbitrary `!important` to win the cascade;
- moving an element with a transform to conceal a layout defect;
- adding a negative margin to repair spacing;
- adding duplicate animation/transition definitions;
- introducing a new colour system for a local section;
- hard-coding a page-level exception when the component contract is wrong;
- suppressing or weakening the design check;
- declaring a page fixed because a build succeeded.

### Release rule

**BUILD PASS ≠ DESIGN PASS.**

Production promotion requires:

`design:check → build → READY staging → browser verification → promotion`

A failed stage blocks the next stage.

### Defect rule

When a visual defect is found:

1. identify the authoritative system responsible;
2. reproduce the defect at the affected breakpoint;
3. fix the source system;
4. remove the compensating patch;
5. run the automated gate;
6. verify the rendered result at all supported breakpoints;
7. only then promote.

A symptom fix that leaves the underlying conflicting rule in place is considered a failed implementation.
