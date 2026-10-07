# Valoria Motion Constitution

## Purpose
Motion is part of Valoria's institutional identity. It must communicate hierarchy, continuity, state or feedback. It is not decoration.

## Non-negotiables
1. Motion never compensates for weak layout.
2. Every animation has a defined purpose.
3. One interaction has one dominant movement.
4. Motion preserves spatial continuity.
5. Important information remains understandable without motion.
6. Timing and easing come from the canonical motion tokens.
7. Hover motion is available only on capable pointer devices.
8. Touch interfaces do not simulate desktop hover.
9. No page-specific motion hacks.
10. No duplicate animation systems for the same component.
11. No layout-triggering animation where transform/opacity can achieve the result.
12. Reduced motion is a release requirement.
13. Native scrolling is the default; smooth-scroll libraries require an explicit product justification.
14. Real rendered behaviour is the authority.
15. If removing an animation makes the experience clearer, remove it.

## Canonical motion tokens
- Micro: 160ms
- Standard: 240ms
- Emphasis: 420ms
- Reveal: 560ms
- Section transition: 720ms
- Primary easing: cubic-bezier(.22,1,.36,1)

## Motion hierarchy
- Page/section reveal: restrained vertical + opacity reveal.
- Hero transition: slow crossfade with small spatial continuity.
- CTA: maximum 2px lift.
- Card: maximum 3px lift on capable pointers.
- Decorative atmosphere: subtle and never required for comprehension.
- Loading/state change: explicit state transition, never ornamental looping.

## Prohibited
- Bouncy/springy brand motion.
- Excessive parallax.
- Large-distance entrances.
- Repeated scale-up/scale-down effects.
- Magnetic cursor effects.
- Infinite decorative loops without semantic purpose.
- Multiple GSAP/CSS/inline implementations for the same interaction.
- Arbitrary durations and easing values.
- Motion that changes layout dimensions.
