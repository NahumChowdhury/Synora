# Synora — Project Status

## Current product scope
Synora is an independent student task marketplace for the Daffodil International University community.

There is exactly **one core product feature**:

1. **Task Marketplace** — verified DIU students can post tasks, apply using task-specific anonymous identities, select a worker, coordinate through private task messaging, complete the task, and rate the other participant.

Supporting systems are authentication, messaging, profile/account details, ratings, moderation, and administration. They are not separate product pillars.

The former **Team Match / Opportunity Network** has been removed from the application UI and API surface. Legacy database objects from the older product may remain temporarily so this scope change can be deployed without a destructive database migration; they are not exposed or used by the application.

## Production hardening status
Implemented in the hardened candidate:
- Google-verified `@diu.edu.bd` identity flow.
- HttpOnly session cookie authentication and logout/expiry handling.
- Environment-based API routing instead of browser hardcoded localhost backend URLs.
- Restricted CORS/origin handling and request rate limiting.
- Task-specific anonymous participant identity.
- Task-only participant messaging.
- Message content safeguards, block/report controls, and admin report review.
- Task lifecycle: `OPEN -> ASSIGNED -> IN_PROGRESS -> COMPLETED`, with cancellation where allowed.
- Rating controls including the completion rating window.
- Task Marketplace feature toggle and admin ban/unban controls.
- Fake landing usage statistics removed.
- Task-only landing page and dashboard navigation.

## Stable checkpoint
Original Core MVP checkpoint before production hardening:

`b7e9fac — feat: complete Synora core MVP`

Production hardening should remain on the `production-hardening` branch until validation is complete.
