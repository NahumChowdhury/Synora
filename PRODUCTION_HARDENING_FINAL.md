# Synora — Production Hardening Final Handoff

## Starting point
Stable Core MVP checkpoint: `b7e9fac`.

## Current product scope
Synora now has exactly one core product feature: **Task Marketplace**.

The former **Team Match / Opportunity Network** has been removed from the frontend, active Prisma application schema, and backend API routing. Messaging remains only as a Task Marketplace support system.

To avoid destructive database work during hardening, old Team Match tables/columns created by historical migrations may remain in an existing database temporarily. They are not modeled by the active Prisma client and are not reachable through the application API. A later cleanup migration should only be considered after a verified DB backup.

## Production hardening included

### Real DIU identity
- Student password registration/login removed from the normal user flow.
- Google-verified DIU authentication added.
- Backend verifies Google token signature/issuer/audience/expiry, verified email, and subject identity.
- Only verified `@diu.edu.bd` accounts are accepted.

### Session isolation/security
- Browser authentication uses an HttpOnly session cookie rather than shared app state/localStorage identity.
- Logout and expired-session handling included.
- Same-origin frontend API proxy available for production cookie reliability.

### Backend hardening
- Production environment validation.
- Restricted CORS/origin handling.
- Security headers and body-size limits.
- Auth/API/write/message rate limiting.
- Input validation and fail-closed feature checks.

### Task Marketplace privacy/correctness
- Task-facing API responses avoid exposing participant DIU email, profile identity, or global user ID as public aliases.
- Worker selection uses application identity rather than exposing account identity.
- Task lifecycle authorization enforced.
- `completedAt` supports accurate rating-window enforcement.
- Duplicate application/rating protections preserved.

### Task-only messaging safety
- Conversations are surfaced only when tied to a Task.
- Participant-only authorization.
- Server-side content safety checks.
- Block/unblock.
- Message reporting and admin report review.
- Task-context anonymous participant labels.

### Product/UI reality
- Fake usage statistics removed.
- Landing page is now Task Marketplace only.
- Dashboard no longer contains Team Match / Opportunity UI.
- Admin has only the Task Marketplace feature toggle.
- Login/Register terminology standardized.
- Privacy, Terms, and Community Guidelines updated for the task-only product.

## Required verification before pilot
This candidate still requires execution on the real environment:
- Google OAuth setup and real DIU-account login;
- Prisma migration execution against the real database;
- dependency vulnerability review;
- backend typecheck/build;
- frontend lint/build;
- two independent account/device session test;
- Task privacy/cross-user authorization test;
- messaging safety/admin moderation test;
- manual desktop/mobile product check.

## Launch classification
**Task-only production-hardening candidate — not yet pilot-approved until the verification gates in `DEPLOYMENT.md` pass.**
