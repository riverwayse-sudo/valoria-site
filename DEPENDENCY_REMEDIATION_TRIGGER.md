# Production dependency remediation

This staging-only trigger runs the patched dependency lockfile workflow. Revision 2: include both staging Worker dispatches after verification.


Staging-only follow-up: keep the OpenNext Cloudflare adapter in devDependencies, regenerate the lockfile, re-audit production dependencies, and dispatch staging validation/deployment only.


Dispatch permissions and staging-only Vite preview environment have been verified; repeat the production dependency audit and staging deploy hand-off.
