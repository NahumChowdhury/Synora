# START HERE — Synora Task-Only Hardened Candidate

1. Keep the pre-hardening checkpoint `b7e9fac` available.
2. Work on the `production-hardening` branch.
3. Apply this candidate/patch without overwriting `.env` or `.git`.
4. Create/configure the Google Web OAuth client for DIU login.
5. Back up PostgreSQL before running migrations.
6. Install dependencies, run `prisma validate/generate/status/deploy`, backend typecheck/build, and frontend lint/build.
7. Run the mandatory two-account/device Task privacy, authorization, messaging-safety, and admin tests in `DEPLOYMENT.md`.
8. Only after those pass, deploy frontend/backend/managed PostgreSQL and repeat the critical tests in production.

Synora now has exactly one core feature: **Task Marketplace**. Messages, Profile, Ratings, Moderation, and Admin are supporting systems.

Never upload or commit `.env` files, database passwords, JWT secrets, proxy secrets, or production credentials.
