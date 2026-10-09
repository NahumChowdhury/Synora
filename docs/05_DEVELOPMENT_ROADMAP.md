# Development Roadmap

## Completed foundation
- Core Task Marketplace lifecycle.
- Task application and worker selection.
- Task-only messaging and ratings.
- Google-verified DIU authentication hardening.
- Session/CORS/rate-limit/environment hardening.
- Messaging safety, blocking, reporting, and admin moderation.
- Task-only UI/product scope.

## Before pilot
- Configure Google OAuth client for the real DIU domain flow.
- Apply reviewed Prisma migrations to the target database after a database backup.
- Resolve production-relevant dependency audit findings.
- Run backend typecheck and frontend production build.
- Test two independent DIU accounts in separate browser/device sessions.
- Verify Task privacy and cross-user authorization.
- Test messaging moderation and admin controls.
- Test mobile and desktop UI manually.

## Before public launch
- Deploy managed PostgreSQL, backend, and frontend.
- Configure HTTPS, production domains, CORS, secrets, logging, monitoring, and backups.
- Finalize legal/privacy/support contact details.
- Pilot with a small controlled group before wider release.
