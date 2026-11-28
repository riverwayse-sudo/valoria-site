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


## Interaction state contract

Every interactive component must define the states that apply to its role, using the shared component and accessibility conventions:

1. **Idle** — available and ready for interaction.
2. **Hover** — pointer-only feedback; never the only way to discover or operate a control.
3. **Focus** — visible keyboard focus with an equivalent action path.
4. **Active** — immediate acknowledgement of activation or selection.
5. **Loading** — pending work is explicit; duplicate submission is prevented where appropriate.
6. **Success** — completion is communicated clearly.
7. **Error** — failure is specific, perceivable and recoverable.
8. **Disabled** — unavailable controls do not retain hover or active movement.
9. **Recovery** — retry or resume preserves valid user context and saved progress.

Not every component needs every state. Each applicable state must be semantic, accessible and consistent with its function. Colour or animation alone must never be the only state signal.

Assessment-specific contracts:
- Answer options expose their selected state semantically and acknowledge activation immediately.
- Submission exposes pending state accessibly and preserves the control's position and dimensions.
- Progress reflects persisted journey state; it must not expose internal question counts.
- Resume and recovery must preserve saved progress rather than visually implying a reset.

The previously mentioned catalogue of 18 microinteraction patterns was not enumerated in the approved source material. Do not claim that all 18 are implemented until that catalogue is explicitly specified and individually verified.


## Cross-page motion enforcement

- The root layout loads the shared motion stylesheet after the other global stylesheets.
- Component styles and CSS modules may define component-specific transitions or keyframes only with the canonical `--motion-*` timing and easing tokens.
- No raw per-component timing curves or arbitrary duration values are permitted in transition or animation declarations.
- Hover and active feedback must not use scale-based enlargement; use restrained spatial translation within the stated movement limits.
- One-time entrances may use opacity and short spatial translation. Reduced-motion preferences must suppress nonessential movement.
