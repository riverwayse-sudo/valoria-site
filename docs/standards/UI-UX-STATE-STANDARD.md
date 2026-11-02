# Valoria UI/UX State Standard

This standard defines the required feedback states for interactive product surfaces. States are behavioural requirements, not separate page templates. Each component must implement the states relevant to its operation.

## The ten states

| State | Required user experience | Implementation requirement |
|---|---|---|
| Loading | The user can tell that work is happening. | Show a concise status and expose `aria-busy` where appropriate. Do not leave an unexplained blank surface. |
| Skeleton | The user sees the shape of the content being prepared. | Use layout-matched placeholders for substantial initial content loads; avoid using skeletons for tiny actions. |
| Empty / first use | The user understands that no records exist yet and how to create the first one. | Explain the value of the section and provide one relevant primary action. Distinguish first-use from an error. |
| Success | The user knows the action completed. | Confirm the result near the action, using persistent confirmation for consequential changes and brief confirmation for transient actions. |
| Error | The user understands what failed and how to recover. | Use plain language, preserve entered work, provide a safe retry or next step, and avoid exposing internal errors. |
| Saving / processing | The user knows a submitted action is underway. | Disable duplicate submission where necessary, show progress/status, and prevent accidental loss or double execution. |
| Refreshing | Existing information remains available while newer information is fetched. | Keep stale-but-valid content visible, indicate refresh activity, and replace it only after a successful response. |
| No results | The user understands that a search/filter returned no matches. | Show the active search/filter context where possible and provide a clear reset or broaden-search action. |
| Offline | The user understands connectivity is unavailable and what happens to their work. | Detect connectivity changes, distinguish unsent work from saved work, and explain when retry is possible. Never imply that unsent data was saved. |
| Permission denied | The user understands access is restricted and what legitimate next step exists. | Explain the access boundary, offer an authorised request/sign-in route where appropriate, and do not expose protected data. |

## Application to Valoria

- **Dashboard:** skeleton on initial load; first-use guidance for missing profile records; clear load error and retry; offline notice; preserve visible dashboard data during refresh; show success for profile-link copy and other completed actions.
- **VALU assessment:** explicit loading between questions; saving/processing on answer submission; saved/progress confirmation; recoverable errors that preserve answers; offline handling that clearly distinguishes locally retained answers from server-confirmed answers; permission messaging for expired or unauthorised sessions.
- **Professional profile:** skeleton for profile retrieval; first-use/setup state; field-level saving and success; recoverable validation and server errors; no false success when persistence fails.
- **Marketplace and Registry:** skeleton while results load; genuine empty state when no listings exist; no-results state for filters/search; refresh that retains current cards; clear permission messaging for restricted profiles or actions.
- **Messages and enquiries:** loading and skeleton; empty inbox/first enquiry state; sending/processing and sent confirmation; retryable send failure without duplicate messages; offline and permission states.
- **Searches and filters:** distinguish no saved searches (first-use/empty) from a query with no matches (no results); provide clear/reset actions.

## Acceptance criteria

1. Every asynchronous surface has an intentional initial loading state.
2. Every data-backed section distinguishes an empty result from a failed request.
3. Every mutation communicates processing, success, and failure.
4. Retry does not silently discard form input, assessment answers, filters, or other user work.
5. Refresh does not unnecessarily blank already-rendered data.
6. Offline messaging never claims server persistence for unconfirmed changes.
7. Permission failures do not masquerade as empty data or generic errors.
8. Status feedback is accessible through appropriate live regions and keyboard-operable controls.
9. Visual feedback follows Valoria's institutional design system and does not introduce unnecessary dashboard clutter.
10. Each flow is tested for its applicable states, including mobile layouts and interrupted network requests.

## Delivery sequence

1. Dashboard shell and primary journey.
2. Assessment question/save/submit flow.
3. Professional profile editing and capability requirements.
4. Marketplace search, filters, and Registry listing.
5. Messages, enquiries, and saved searches.

A state is complete only when the user-visible behaviour and the underlying persistence/recovery behaviour have both been verified.
