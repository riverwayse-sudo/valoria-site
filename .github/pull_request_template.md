## Valoria quality gate

### Anti-slop review

- [ ] I reused the canonical design tokens and existing primitives.
- [ ] I did not introduce inline styles, !important, raw local colors, or legacy accent systems.
- [ ] I fixed ownership/root cause rather than layering a symptom patch.
- [ ] Responsive behavior was designed for mobile and desktop, not patched after the fact.
- [ ] The hierarchy passes the message → context → action test.
- [ ] Cards are used only where containment improves comprehension or task completion.
- [ ] Motion, if present, has a clear purpose.
- [ ] Accessibility has been considered.
- [ ] I checked the rendered UI with real content.
- [ ] I ran npm run anti-slop, tests, and the production build.

### Root cause

What system or ownership issue does this change solve?

### Browser truth

Which viewport states were checked?

### Exceptions

If an anti-slop rule appears to require an exception, explain why the underlying system cannot be corrected instead.
