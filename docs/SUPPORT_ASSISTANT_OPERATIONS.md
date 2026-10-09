# Valoria Support Assistant — Operations

## What it does
- Provides website guidance about VALU, PRIME, professional profiles, marketplace pathways, events, and Insights.
- Does not access private account records or assessment responses.
- Offers a visitor-submitted issue form that emails the Valoria support inbox.
- Sends an operational alert when the chatbot provider is misconfigured, returns an error, or returns no answer. Alerts intentionally omit the conversation transcript.

## Required environment variables
- `ANTHROPIC_API_KEY`: server-only key for chatbot responses.
- `ANTHROPIC_CHAT_MODEL`: optional model override; defaults to `claude-sonnet-4-6`.
- `BREVO_API_KEY`: server-only key for issue and failure notification email.
- `SUPPORT_NOTIFICATION_EMAIL`: optional support recipient; defaults to `info@valoriainstitute.com`.

Configure these in Vercel project environment settings for Preview and Production as appropriate. Never add real values to this repository or prefix secret values with `NEXT_PUBLIC_`. Verify the sending domain and sender address in Brevo before production use.

## Privacy and safe use
- Do not ask users for passwords, one-time codes, card data, or other secrets.
- The chat API sends only the last ten validated chat messages to the configured model. Do not paste private assessment or account information into chat.
- Chat provider error alerts contain the error summary, page path, and timestamp, not the conversation.
- Visitor issue reports include the summary, details, page path, optional follow-up email, and timestamp.
- Email content is escaped before rendering as HTML.
- The issue form uses a honeypot and field/request size limits.
- The in-memory request limiter is best-effort only across warm serverless instances. Apply durable edge/WAF rate limits and provider spend limits before broad promotion.

## Operational verification
1. In a Vercel Preview deployment, ask a general question and confirm a response.
2. Submit a clearly labelled test issue and verify receipt at the configured inbox.
3. Temporarily test missing/invalid provider configuration only in Preview and confirm a chatbot-failure email arrives.
4. Verify that invalid requests are rejected and that no real API keys are present in build logs or browser bundles.
5. Remove any test report from operational records if required by the support process.
