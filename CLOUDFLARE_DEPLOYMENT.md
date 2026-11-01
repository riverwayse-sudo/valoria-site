# Cloudflare deployment (site)

This branch adds the OpenNext adapter for the existing Next.js 15 application. It keeps the current Next.js application model rather than switching to the newer vinext beta.

Required GitHub Actions secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `VALU_UPSTREAM_ORIGIN` and `CRON_SECRET`.

The deployment workflow targets workers.dev only. It does not modify DNS or attach the production custom domain. Set `VALU_UPSTREAM_ORIGIN` to the platform Worker origin after that Worker deploys. The three existing site cron routes are scheduled through GitHub Actions and require `SITE_WORKER_URL` and `CRON_SECRET`; verify their bearer-secret contract and response before enabling the schedule.

Do not add secrets to source control. Keep Vercel deployments available as rollback targets until the Cloudflare deployments and user journey are verified.
