# Valoria Design Reference Playbook

## Governing rule

**Evolve, don't replace. Enrich, don't decorate. Clarify, don't complicate.**

Valoria's own design system is the source of truth. External references are used to improve craft, structure, interaction quality, accessibility, and implementation discipline—not to replace Valoria's identity.

## Reference stack

### 1. VibeUI — https://vibeui.online/

**Use for:** structural UI patterns and page composition.

VibeUI describes itself as a library of structural prompts for UI sections rather than a library of visual styles. Use it to help name and compare layout patterns such as pricing comparisons, feature grids, bento layouts, step-by-step journeys, profile cards, dashboards, and content sections.

**How to apply it to Valoria:**
- Choose a structure that solves a specific user problem on the page being improved.
- Adapt the pattern to Valoria's existing navy, gold, parchment/cream palette, Raleway typography, spacing tokens, and component vocabulary.
- Preserve existing content and hierarchy unless the audit proves they are confusing or redundant.
- Check the pattern at desktop, tablet, and mobile widths.
- Validate keyboard operation, focus order, accessible names, contrast, reduced-motion behaviour, and loading/empty/error states.
- Prefer a native existing component over adding a new dependency when the existing component can meet the requirement.

**Do not:** copy a template wholesale, import a new colour palette, add gratuitous animation, or reshape an established Valoria page solely because a reference looks fashionable.

### 2. TEXTURA Agency — https://textura.agency/

**Use for:** art direction, typography, composition, portfolio presentation, and considered motion.

Borrow the quality bar and design craft—not the agency's visual identity or expressive effects where they conflict with Valoria's institutional character.

### 3. GetLayer / GetLayers AI

**Use for:** AI-assisted workflow ideas and section/motion exploration only after confirming the exact reference URL and relevance to the target page. Do not assume similarly named domains are the same product.

### 4. Figma MCP

**Use for:** documenting and checking the Valoria design system, components, tokens, responsive variants, and interaction states. Treat Figma as a design-system workspace, not permission to redesign the product. Connection status must be verified before claiming it is in use.

### 5. Playwright

**Use for:** browser-level quality assurance across key routes and viewports. Test navigation, authentication journeys, keyboard interaction, clipping/overflow, console errors, network failures, and critical assessment/profile flows. Do not report a visual or journey as verified unless it was actually exercised.

## Required workflow

**Audit current state → identify the user problem → inspect relevant reference pattern → preserve Valoria design decisions → implement the smallest coherent improvement → run checks → inspect rendered preview → test responsive/accessibility behaviour → correct regressions → verify deployment.**

Every proposed change must answer:
1. What existing Valoria element is preserved?
2. What concrete user problem is being solved?
3. What measurable usability or craft improvement is expected?
4. Does it strengthen the existing Valoria identity?
5. Would a returning user still recognise the site immediately?

If the answer to question 5 is no, stop and reconsider the direction.

## Anti-slop acceptance criteria

Reject changes that rely on generic gradients, arbitrary glassmorphism, decorative animation, oversized hero sections, repeated content, inconsistent card geometry, unexplained token proliferation, fake data, unlabelled controls, or new dependencies without a clear benefit.

Accept changes when they improve hierarchy, readability, task completion, consistency, accessibility, performance, or responsive behaviour—and retain Valoria's institutional design language.

## Evidence and release discipline

- Keep reference links and the reason for using each reference in the relevant PR.
- Run the repository's design and excellence checks.
- Verify database changes separately from UI changes.
- Inspect the actual preview at desktop, tablet, and mobile sizes before merging.
- Never equate a successful build with complete end-to-end verification.
- Do not merge or claim production deployment until the relevant checks pass.
