# Production QA Gate

This file exists as a deployment parity marker.

The production deployment must always be built from the same GitHub `main` commit that contains the journey regression tests and diagnostics. QA claims are only considered valid after the deployment commit SHA matches `main` and the deployment is READY.

## Required verification

- `npm test -- --runInBand`
- `npm run build`
- public route smoke tests
- authenticated journey diagnostics
- Vercel runtime error scan
- no silent journey-state read failures

Last updated: 2026-09-29
